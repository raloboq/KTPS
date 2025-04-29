// src/app/api/admin/reflections/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const configId = parseInt(params.id);
    if (isNaN(configId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID inválido' 
      }, { status: 400 });
    }

    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);

    // Verificar que la configuración exista y pertenezca al usuario
    const configCheck = await pool.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (!configCheck.rowCount || configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // 1. Obtener sesiones colaborativas asociadas con esta configuración
    const sessionesResult = await pool.query(
      `SELECT id_sesion_colaborativa, id_room, tema, fecha_inicio, fecha_fin
       FROM sesiones_colaborativas
       WHERE tps_configuration_id = $1
       ORDER BY fecha_inicio DESC`,
      [configId]
    );
    
    // 2. Para cada sesión colaborativa, obtener los participantes
    const sesiones = [];
    for (const sesion of sessionesResult.rows) {
      // Obtener participantes
      const participantesResult = await pool.query(
        `SELECT pc.id_participante, pc.nombre_usuario, pc.fecha_union, pc.fecha_salida
         FROM participantes_colaborativos pc
         WHERE pc.id_sesion_colaborativa = $1`,
        [sesion.id_sesion_colaborativa]
      );
      
      // Obtener la última captura de contenido
      const capturaResult = await pool.query(
        `SELECT id_captura, contenido, timestamp
         FROM capturas_contenido_colaborativo
         WHERE id_sesion_colaborativa = $1
         ORDER BY timestamp DESC
         LIMIT 1`,
        [sesion.id_sesion_colaborativa]
      );
      
      // Obtener reflexiones individuales de los participantes
      const participantes = [];
      
      for (const participante of participantesResult.rows) {
        // Buscar la reflexión del participante
        const reflexionResult = await pool.query(
          `SELECT r.id_reflexion, r.contenido, r.fecha_creacion, s.id_sesion, 
                  g.nota as calificacion, g.comentario
           FROM reflexiones r
           JOIN sesiones s ON r.id_sesion = s.id_sesion
           LEFT JOIN gradebook g ON r.id_reflexion = g.id_reflexion
           WHERE r.usuario = $1 AND s.tps_configuration_id = $2
           ORDER BY r.fecha_creacion DESC
           LIMIT 1`,
          [participante.nombre_usuario, configId]
        );
        
        // Buscar el ID de Moodle del estudiante
        const moodleUserResult = await pool.query(
          `SELECT moodle_user_id 
           FROM student_users 
           WHERE username = $1 OR email = $1 OR fullname = $1
           LIMIT 1`,
          [participante.nombre_usuario]
        );
        
        // Manejar de forma segura el rowCount que podría ser null
        const moodleUserId = moodleUserResult && 
                             moodleUserResult.rowCount && 
                             moodleUserResult.rowCount > 0 ? 
                               moodleUserResult.rows[0].moodle_user_id : null;
        
        const reflexion = reflexionResult && 
                         reflexionResult.rowCount && 
                         reflexionResult.rowCount > 0 ? {
          id: reflexionResult.rows[0].id_reflexion,
          content: reflexionResult.rows[0].contenido,
          createdAt: reflexionResult.rows[0].fecha_creacion,
          sessionId: reflexionResult.rows[0].id_sesion,
          calificacion: reflexionResult.rows[0].calificacion,
          comentario: reflexionResult.rows[0].comentario
        } : null;
        
        participantes.push({
          id: participante.id_participante,
          userName: participante.nombre_usuario,
          joinedAt: participante.fecha_union,
          leftAt: participante.fecha_salida,
          moodleUserId: moodleUserId,  // Agregar el ID de Moodle aquí
          reflexion
        });
      }
      
      // Verificar si existe una calificación para la colaboración
      const gradingResult = await pool.query(
        `SELECT nota, comentario
         FROM gradebook
         WHERE id_sesion_colaborativa = $1`,
        [sesion.id_sesion_colaborativa]
      );
      
      const calificacion = gradingResult && 
                           gradingResult.rowCount && 
                           gradingResult.rowCount > 0 ? {
        nota: gradingResult.rows[0].nota,
        comentario: gradingResult.rows[0].comentario
      } : null;
      
      // Intentar obtener al menos un ID de Moodle válido entre los participantes para la calificación colaborativa
      const moodleUserIds = participantes
        .filter(p => p.moodleUserId)
        .map(p => p.moodleUserId);
      
      const primaryMoodleUserId = moodleUserIds.length > 0 ? moodleUserIds[0] : null;
      
      sesiones.push({
        id: sesion.id_sesion_colaborativa,
        roomId: sesion.id_room,
        tema: sesion.tema,
        startedAt: sesion.fecha_inicio,
        endedAt: sesion.fecha_fin,
        participants: participantes,
        primaryMoodleUserId: primaryMoodleUserId,  // Agregar el ID principal para calificación colaborativa
        collaboration: capturaResult && 
                      capturaResult.rowCount && 
                      capturaResult.rowCount > 0 ? {
          id: capturaResult.rows[0].id_captura,
          content: capturaResult.rows[0].contenido,
          timestamp: capturaResult.rows[0].timestamp
        } : null,
        calificacion
      });
    }
    
    // Obtener metadata de la actividad
    const activityResult = await pool.query(
      `SELECT 
         aa.id as activity_id,
         aa.name as activity_name,
         aa.description as activity_description,
         c.name as course_name,
         c.shortname as course_shortname,
         a.name as assignment_name,
         a.moodle_assignment_id
       FROM 
         tps_configurations tc
       JOIN
         available_activities aa ON tc.id = aa.tps_configuration_id
       JOIN
         moodle_courses c ON tc.moodle_course_id = c.moodle_course_id
       JOIN
         moodle_assignments a ON tc.moodle_assignment_id = a.moodle_assignment_id
       WHERE 
         tc.id = $1`,
      [configId]
    );
    
    const activityInfo = activityResult && 
                        activityResult.rowCount && 
                        activityResult.rowCount > 0 ? 
                          activityResult.rows[0] : null;
    
    return NextResponse.json({ 
      success: true, 
      data: {
        activity: activityInfo,
        sessions: sesiones
      }
    });
  } catch (error) {
    console.error('Error al obtener reflexiones y colaboraciones:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener reflexiones y colaboraciones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';