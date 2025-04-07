// src/app/api/tps-config/[id]/toggle-status/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfig = await sql`
      SELECT 
        id, 
        moodle_course_id, 
        moodle_assignment_id 
      FROM 
        tps_configurations 
      WHERE 
        id = ${id} 
        AND moodle_user_id = ${userId}
    `;

    if (existingConfig.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    const config = existingConfig.rows[0];

    // Si se va a activar la configuración, desactivar primero cualquier otra configuración activa
    // para la misma combinación de curso y asignación
    if (data.is_active) {
      await sql`
        UPDATE tps_configurations
        SET 
          is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE 
          moodle_user_id = ${userId}
          AND moodle_course_id = ${config.moodle_course_id}
          AND moodle_assignment_id = ${config.moodle_assignment_id}
          AND id != ${id}
          AND is_active = TRUE
      `;
    }

    // Actualizar el estado de activación de la configuración
    const result = await sql`
      UPDATE tps_configurations
      SET 
        is_active = ${data.is_active},
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: `Configuración ${data.is_active ? 'activada' : 'desactivada'} exitosamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado de configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cambiar estado de configuración TPS' 
    }, { status: 500 });
  }
}*/
// src/app/api/tps-config/[id]/toggle-status/route.ts
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

    // ⭐ NUEVO: Verificar si el curso ya existe, si no, insertarlo
    /*const existingCourse = await client.query(
      `SELECT moodle_course_id FROM moodle_courses 
       WHERE moodle_course_id = $1`,
      [data.moodle_course_id]
    );
    
    if (existingCourse.rowCount === 0) {
      // Obtener información del curso desde Moodle o desde la solicitud
      // Para simplificar, usaremos un nombre genérico si no se proporciona
      const courseName = data.course_name || `Curso ID: ${data.moodle_course_id}`;
      const courseShortname = data.course_shortname || `CID-${data.moodle_course_id}`;
      
      await client.query(
        `INSERT INTO moodle_courses (moodle_course_id, name, shortname) 
         VALUES ($1, $2, $3)`,
        [data.moodle_course_id, courseName, courseShortname]
      );
    }
    
    // ⭐ NUEVO: Verificar si la asignación ya existe, si no, insertarla
    const existingAssignment = await client.query(
      `SELECT moodle_assignment_id FROM moodle_assignments 
       WHERE moodle_assignment_id = $1 AND moodle_course_id = $2`,
      [data.moodle_assignment_id, data.moodle_course_id]
    );
    
    if (existingAssignment.rowCount === 0) {
      // Obtener información de la asignación desde Moodle o desde la solicitud
      // Para simplificar, usaremos un nombre genérico si no se proporciona
      const assignmentName = data.assignment_name || `Actividad ID: ${data.moodle_assignment_id}`;
      
      await client.query(
        `INSERT INTO moodle_assignments (moodle_assignment_id, moodle_course_id, name) 
         VALUES ($1, $2, $3)`,
        [data.moodle_assignment_id, data.moodle_course_id, assignmentName]
      );
    }*/

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfigResult: QueryResult = await client.query(
      `SELECT 
        id, 
        moodle_course_id, 
        moodle_assignment_id,
        think_phase_instructions,
        think_phase_duration,
        pair_phase_duration,
        pair_phase_instructions,
        share_phase_duration,
        share_phase_instructions,
        system_prompt
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
      
      // Cuando activamos una configuración, crear o actualizar entrada en available_activities
      
      // Primero, obtener información sobre el curso y la asignación para crear un nombre adecuado
      const courseAssignmentInfo = await client.query(
        `SELECT 
           c.name as course_name, 
           a.name as assignment_name 
         FROM 
           moodle_courses c 
         JOIN 
           moodle_assignments a ON c.moodle_course_id = a.moodle_course_id 
         WHERE 
           c.moodle_course_id = $1 
           AND a.moodle_assignment_id = $2`,
        [config.moodle_course_id, config.moodle_assignment_id]
      );
      
      // Crear un nombre descriptivo para la actividad
      let activityName = "Actividad TPS";
      let activityDescription = "Actividad colaborativa Think-Pair-Share";
      
      if (courseAssignmentInfo && courseAssignmentInfo.rowCount && courseAssignmentInfo.rowCount > 0) {
        const { course_name, assignment_name } = courseAssignmentInfo.rows[0];
        activityName = `TPS: ${assignment_name}`;
        activityDescription = `Actividad colaborativa Think-Pair-Share para ${course_name}: ${assignment_name}`;
      }
      
      // Generar fechas por defecto (desde ahora hasta 30 días en el futuro)
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      // Verificar si ya existe una entrada para esta configuración en available_activities
      const existingActivity = await client.query(
        `SELECT id FROM available_activities WHERE tps_configuration_id = $1`,
        [id]
      );
      
      if (existingActivity && existingActivity.rowCount && existingActivity.rowCount > 0) {
        // Actualizar la actividad existente
        await client.query(
          `UPDATE available_activities 
           SET 
             name = $1,
             description = $2,
             is_active = TRUE,
             updated_at = CURRENT_TIMESTAMP
           WHERE tps_configuration_id = $3`,
          [activityName, activityDescription, id]
        );
      } else {
        // Crear una nueva actividad
        await client.query(
          `INSERT INTO available_activities
             (tps_configuration_id, name, description, is_active, start_date, end_date)
           VALUES
             ($1, $2, $3, TRUE, $4, $5)`,
          [id, activityName, activityDescription, now.toISOString(), endDate.toISOString()]
        );
      }
    } else {
      // Si estamos desactivando la configuración, también desactivar la actividad asociada
      await client.query(
        `UPDATE available_activities
         SET 
           is_active = FALSE,
           updated_at = CURRENT_TIMESTAMP
         WHERE tps_configuration_id = $1`,
        [id]
      );
    }

    // Actualizar el estado de activación de la configuración
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

    // Confirmar la transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: updateResult.rows[0],
      message: `Configuración ${data.is_active ? 'activada' : 'desactivada'} exitosamente`
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al cambiar estado de configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cambiar estado de configuración TPS' 
    }, { status: 500 });
  } finally {
    // Liberar el cliente al finalizar
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';