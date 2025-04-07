// src/app/api/tps-config/[id]/toggle-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
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
    const data = await request.json();
    
    if (data.is_active === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Estado de activación no proporcionado' 
      }, { status: 400 });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfigResult: QueryResult = await client.query(
      `SELECT 
        id, 
        moodle_course_id, 
        moodle_assignment_id
      FROM 
        tps_configurations 
      WHERE 
        id = $1 
        AND moodle_user_id = $2`,
      [id, userId]
    );

    if (!existingConfigResult.rowCount || existingConfigResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    const config = existingConfigResult.rows[0];

    // Si se va a activar la configuración, desactivar primero cualquier otra configuración activa
    // para la misma combinación de curso y asignación
    if (data.is_active) {
      await client.query(
        `UPDATE tps_configurations
         SET 
           is_active = FALSE,
           updated_at = CURRENT_TIMESTAMP
         WHERE 
           moodle_user_id = $1
           AND moodle_course_id = $2
           AND moodle_assignment_id = $3
           AND id != $4
           AND is_active = TRUE`,
        [userId, config.moodle_course_id, config.moodle_assignment_id, id]
      );
      
      // Al activar, actualizar o crear la actividad asociada
      const courseId = config.moodle_course_id;
      const assignmentId = config.moodle_assignment_id;

      // Obtener información del curso y asignación para nombres descriptivos
      let courseName = data.course_name || 'Curso';
      let assignmentName = data.assignment_name || 'Actividad';
      
      try {
        const courseInfo = await client.query(
          'SELECT name FROM moodle_courses WHERE moodle_course_id = $1',
          [courseId]
        );
        
        if (courseInfo && courseInfo.rowCount && courseInfo.rowCount > 0 ) {
          courseName = courseInfo.rows[0].name;
        } else {
          // Insertar curso si no existe
          await client.query(
            'INSERT INTO moodle_courses (moodle_course_id, name, shortname) VALUES ($1, $2, $3)',
            [courseId, courseName, `C-${courseId}`]
          );
        }
        
        const assignmentInfo = await client.query(
          'SELECT name FROM moodle_assignments WHERE moodle_assignment_id = $1 AND moodle_course_id = $2',
          [assignmentId, courseId]
        );
        
        if (assignmentInfo && assignmentInfo.rowCount && assignmentInfo.rowCount > 0) {
          assignmentName = assignmentInfo.rows[0].name;
        } else {
          // Insertar asignación si no existe
          await client.query(
            'INSERT INTO moodle_assignments (moodle_assignment_id, moodle_course_id, name) VALUES ($1, $2, $3)',
            [assignmentId, courseId, assignmentName]
          );
        }
      } catch (error) {
        console.error('Error al consultar o insertar curso/asignación:', error);
        // Continuamos con la activación aunque haya error aquí
      }
      
      // Crear o actualizar actividad
      const activityName = `TPS: ${assignmentName}`;
      const activityDescription = `Actividad TPS para ${courseName}: ${assignmentName}`;
      
      // Fechas por defecto (desde ahora hasta 30 días)
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      // Verificar si ya existe actividad
      const existingActivity = await client.query(
        'SELECT id FROM available_activities WHERE tps_configuration_id = $1',
        [id]
      );
      
      if (existingActivity && existingActivity.rowCount && existingActivity.rowCount > 0) {
        await client.query(
          `UPDATE available_activities
           SET name = $1, description = $2, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
           WHERE tps_configuration_id = $3`,
          [activityName, activityDescription, id]
        );
      } else {
        await client.query(
          `INSERT INTO available_activities
           (tps_configuration_id, name, description, is_active, start_date, end_date)
           VALUES ($1, $2, $3, TRUE, $4, $5)`,
          [id, activityName, activityDescription, now.toISOString(), endDate.toISOString()]
        );
      }
    } else {
      // Si estamos desactivando, también desactivar la actividad
      await client.query(
        `UPDATE available_activities
         SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE tps_configuration_id = $1`,
        [id]
      );
    }

    // Actualizar el estado de la configuración
    const updateResult = await client.query(
      `UPDATE tps_configurations
       SET 
         is_active = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE 
         id = $2
       RETURNING *`,
      [data.is_active, id]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: updateResult.rows[0],
      message: `Configuración ${data.is_active ? 'activada' : 'desactivada'} exitosamente`
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al cambiar estado de configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cambiar estado de configuración TPS' 
    }, { status: 500 });
  } finally {
    // Liberar cliente
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';