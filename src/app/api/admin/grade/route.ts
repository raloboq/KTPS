// src/app/api/admin/grade/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

// Asegúrate de que estas funciones estén exportadas correctamente
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    const moodleToken = cookieStore.get('moodleToken')?.value;
    
    if (!userIdStr || !moodleToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);
    const { 
      configId, 
      sessionId, 
      reflexionId, 
      studentId, 
      grade, 
      comment,
      moodleAssignmentId,
      isCollaborative 
    } = await request.json();

    // Validar datos
    if (!configId || (!sessionId && !reflexionId) || !grade) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan datos requeridos' 
      }, { status: 400 });
    }

    // Verificar que la configuración pertenezca al usuario
    const configCheck = await client.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no autorizada' 
      }, { status: 403 });
    }

    await client.query('BEGIN');

    // Guardar la calificación en la tabla gradebook
    if (isCollaborative) {
      // Calificación para trabajo colaborativo
      const existingGrade = await client.query(
        `SELECT id FROM gradebook
         WHERE id_sesion_colaborativa = $1`,
        [sessionId]
      );
      
      if ((existingGrade.rowCount ?? 0) > 0) {
        await client.query(
          `UPDATE gradebook
           SET nota = $1, comentario = $2, fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_sesion_colaborativa = $3`,
          [grade, comment || '', sessionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook 
             (id_sesion_colaborativa, nota, comentario, calificado_por)
           VALUES ($1, $2, $3, $4)`,
          [sessionId, grade, comment || '', userId]
        );
      }
    } else {
      // Calificación para reflexión individual
      const existingGrade = await client.query(
        `SELECT id FROM gradebook
         WHERE id_reflexion = $1`,
        [reflexionId]
      );
      
      if ((existingGrade.rowCount ?? 0) > 0) {
        await client.query(
          `UPDATE gradebook
           SET nota = $1, comentario = $2, fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_reflexion = $3`,
          [grade, comment || '', reflexionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook 
             (id_reflexion, nota, comentario, calificado_por)
           VALUES ($1, $2, $3, $4)`,
          [reflexionId, grade, comment || '', userId]
        );
      }
    }

    // Si se proporcionó studentId y moodleAssignmentId, enviar la calificación a Moodle
    let moodleResponse = null;
    
    if (studentId && moodleAssignmentId) {
      // Enviar calificación a Moodle
      const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
      const apiUrl = `${moodleUrl}/webservice/rest/server.php`;
      
      const params = new URLSearchParams({
        wstoken: moodleToken,
        wsfunction: 'mod_assign_save_grade',
        moodlewsrestformat: 'json',
        assignmentid: moodleAssignmentId.toString(),
        userid: studentId.toString(),
        grade: grade.toString(),
        attemptnumber: '-1',
        addattempt: '1',
        workflowstate: 'graded',
        applytoall: '0'
      });
      
      // Para fines de demostración, registramos pero no enviamos realmente la calificación a Moodle
      // En producción, habría que usar fetch para enviar a Moodle
      console.log('Enviando calificación a Moodle:', params.toString());
      
      // Registrar el intento de envío
      await client.query(
        `INSERT INTO moodle_grade_sync
           (student_id, assignment_id, grade, sync_status, sync_message)
         VALUES ($1, $2, $3, $4, $5)`,
        [studentId, moodleAssignmentId, grade, 'success', 'Simulación: Calificación enviada a Moodle']
      );
      
      moodleResponse = { success: true, message: 'Calificación enviada a Moodle (simulación)' };
    }

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Calificación guardada exitosamente',
      moodleSync: moodleResponse
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error al guardar calificación:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al guardar calificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    client.release();
  }
}

// Asegúrate de exportar esta constante también
export const dynamic = 'force-dynamic';
*/

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  let transactionStarted = false;
  
  try {
    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    const moodleToken = cookieStore.get('moodleToken')?.value;
    
    if (!userIdStr || !moodleToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);
    
    // Verificar que el body sea válido
    let requestData;
    try {
      requestData = await request.json();
    } catch (jsonError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Body JSON inválido' 
      }, { status: 400 });
    }
    
    const { 
      configId, 
      sessionId, 
      reflexionId, 
      studentId, 
      grade, 
      comment,
      moodleAssignmentId,
      isCollaborative 
    } = requestData;

    // Validar datos
    if (!configId || (!sessionId && !reflexionId) || grade === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan datos requeridos',
        debug: { configId, sessionId, reflexionId, grade, isCollaborative }
      }, { status: 400 });
    }

    // Verificar que la configuración pertenezca al usuario
    const configCheck = await client.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no autorizada' 
      }, { status: 403 });
    }

    // Iniciar transacción
    await client.query('BEGIN');
    transactionStarted = true;

    // Guardar la calificación en la tabla gradebook
    if (isCollaborative) {
      console.log('Guardando calificación colaborativa:', { sessionId, grade, comment });
      
      // Verificar que la sesión colaborativa exista
      const sessionCheck = await client.query(
        `SELECT id_sesion_colaborativa FROM sesiones_colaborativas
         WHERE id_sesion_colaborativa = $1`,
        [sessionId]
      );
      
      if (sessionCheck.rowCount === 0) {
        throw new Error(`Sesión colaborativa con ID ${sessionId} no encontrada`);
      }
      
      // Buscar si ya existe una calificación
      const existingGrade = await client.query(
        `SELECT id FROM gradebook
         WHERE id_sesion_colaborativa = $1`,
        [sessionId]
      );
      
      if ((existingGrade.rowCount ?? 0) > 0) {
        // Actualizar calificación existente
        await client.query(
          `UPDATE gradebook
           SET nota = $1, comentario = $2, fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_sesion_colaborativa = $3`,
          [grade, comment || '', sessionId]
        );
      } else {
        // Crear nueva calificación
        await client.query(
          `INSERT INTO gradebook 
             (id_sesion_colaborativa, nota, comentario, calificado_por)
           VALUES ($1, $2, $3, $4)`,
          [sessionId, grade, comment || '', userId]
        );
      }
    } else {
      console.log('Guardando calificación individual:', { reflexionId, grade, comment });
      
      // Verificar que la reflexión exista
      const reflexionCheck = await client.query(
        `SELECT id_reflexion FROM reflexiones
         WHERE id_reflexion = $1`,
        [reflexionId]
      );
      
      if (reflexionCheck.rowCount === 0) {
        throw new Error(`Reflexión con ID ${reflexionId} no encontrada`);
      }
      
      // Buscar si ya existe una calificación
      const existingGrade = await client.query(
        `SELECT id FROM gradebook
         WHERE id_reflexion = $1`,
        [reflexionId]
      );
      
      if ((existingGrade.rowCount ?? 0) > 0) {
        // Actualizar calificación existente
        await client.query(
          `UPDATE gradebook
           SET nota = $1, comentario = $2, fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_reflexion = $3`,
          [grade, comment || '', reflexionId]
        );
      } else {
        // Crear nueva calificación
        await client.query(
          `INSERT INTO gradebook 
             (id_reflexion, nota, comentario, calificado_por)
           VALUES ($1, $2, $3, $4)`,
          [reflexionId, grade, comment || '', userId]
        );
      }
    }

    // Si se proporcionó studentId y moodleAssignmentId, enviar la calificación a Moodle
    let moodleResponse = null;
    
    if (studentId && moodleAssignmentId) {
      console.log('Enviando calificación a Moodle:', { studentId, moodleAssignmentId, grade });
      
      // Simulación: solo registrar en la base de datos
      await client.query(
        `INSERT INTO moodle_grade_sync
           (student_id, assignment_id, grade, sync_status, sync_message, feedback)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [studentId, moodleAssignmentId, grade, 'simulation', 'Simulación: Calificación enviada a Moodle', comment || '']
      );
      
      moodleResponse = { success: true, message: 'Calificación enviada a Moodle (simulación)' };
    }

    // Confirmar la transacción
    await client.query('COMMIT');
    transactionStarted = false;

    return NextResponse.json({ 
      success: true, 
      message: 'Calificación guardada exitosamente',
      moodleSync: moodleResponse
    });
  } catch (error) {
    console.error('Error detallado al guardar calificación:', error);
    
    // Rollback solo si la transacción se inició
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error adicional durante rollback:', rollbackError);
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error al guardar calificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    // Asegurarse de liberar el cliente
    try {
      client.release();
    } catch (releaseError) {
      console.error('Error al liberar el cliente de base de datos:', releaseError);
    }
  }
}

export const dynamic = 'force-dynamic';