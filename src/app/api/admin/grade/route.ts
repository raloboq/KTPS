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

/*
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
*/
/*  app/api/grade/route.ts
    Guarda una calificación (individual o colaborativa) en la tabla `gradebook`
    y, si se proporcionan datos, la sincroniza con Moodle mediante
    `mod_assign_save_grades`.  Cumple con la restricción CHECK de la tabla
    (exactamente uno de los dos IDs debe ser NULL).
*/
// src/app/api/admin/grade/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';   // Next 13+: siempre SSR

type MoodleSyncResult = { success: boolean; message: string } | null;

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
   
    const cookieStore   = cookies();
    const moodleToken   = cookieStore.get('moodleToken')?.value;
    const moodleUserId  = Number(cookieStore.get('moodleUserId')?.value);

    if (!moodleToken || Number.isNaN(moodleUserId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

   
    const {
      configId,
      sessionId,            // id_sesion_colaborativa
      reflexionId,          // id_reflexion
      studentId,
      moodleAssignmentId,
      grade,
      comment,
      isCollaborative
    } = await request.json();

    
    if (!configId || grade == null) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos (configId o grade)' },
        { status: 400 }
      );
    }

    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade)) {
      return NextResponse.json(
        { success: false, error: '"grade" debe ser numérico' },
        { status: 400 }
      );
    }

    
    if (isCollaborative) {
      if (!sessionId || reflexionId) {
        return NextResponse.json(
          { success: false,
            error: 'Calificación colaborativa: "sessionId" obligatorio y "reflexionId" debe ser nulo' },
          { status: 400 }
        );
      }
    } else {
      if (!reflexionId || sessionId) {
        return NextResponse.json(
          { success: false,
            error: 'Calificación individual: "reflexionId" obligatorio y "sessionId" debe ser nulo' },
          { status: 400 }
        );
      }
    }

    
    const { rowCount: cfgOK } = await client.query(
      `SELECT 1 FROM tps_configurations
        WHERE id = $1 AND moodle_user_id = $2`,
      [configId, moodleUserId]
    );

    if (!cfgOK) {
      return NextResponse.json(
        { success: false, error: 'Configuración no autorizada' },
        { status: 403 }
      );
    }

    
    await client.query('BEGIN');

    if (isCollaborative) {
      // ─── sesión colaborativa ───
      const { rowCount } = await client.query(
        `SELECT 1 FROM gradebook WHERE id_sesion_colaborativa = $1`,
        [sessionId]
      );

      if (rowCount) {
        await client.query(
          `UPDATE gradebook
             SET nota = $1,
                 comentario = $2,
                 fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_sesion_colaborativa = $3`,
          [numericGrade, comment ?? '', sessionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook
             (id_sesion_colaborativa, id_reflexion, nota, comentario, calificado_por)
           VALUES ($1, NULL, $2, $3, $4)`,
          [sessionId, numericGrade, comment ?? '', moodleUserId]
        );
      }
    } else {
      // ─── reflexión individual ───
      const { rowCount } = await client.query(
        `SELECT 1 FROM gradebook WHERE id_reflexion = $1`,
        [reflexionId]
      );

      if (rowCount) {
        await client.query(
          `UPDATE gradebook
             SET nota = $1,
                 comentario = $2,
                 fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_reflexion = $3`,
          [numericGrade, comment ?? '', reflexionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook
             (id_reflexion, id_sesion_colaborativa, nota, comentario, calificado_por)
           VALUES ($1, NULL, $2, $3, $4)`,
          [reflexionId, numericGrade, comment ?? '', moodleUserId]
        );
      }
    }

    await client.query('COMMIT');          // la nota está segura

    
    let moodleSync: MoodleSyncResult = null;

    if (studentId && moodleAssignmentId) {
      const moodleUrl =
        process.env.NEXT_PUBLIC_MOODLE_URL ?? 'http://localhost:8888/moodle401';
      const apiUrl = `${moodleUrl}/webservice/rest/server.php`;

      
      const params = new URLSearchParams({
        wstoken: moodleToken,
        wsfunction: 'mod_assign_save_grades',
        moodlewsrestformat: 'json',
        assignmentid: String(moodleAssignmentId),
        'grades[0][userid]':  String(studentId),
        'grades[0][grade]':   String(numericGrade),
        'grades[0][attemptnumber]': '-1',
        'grades[0][addattempt]':    '1',
        'grades[0][workflowstate]': 'graded',
        applytoall: '0'
      });

      if (comment) {
        const html = `<p>${comment.replace(/\n/g, '<br/>')}</p>`;
        params.append(
          'grades[0][plugindata][assignfeedbackcomments_editor][text]', html
        );
        params.append(
          'grades[0][plugindata][assignfeedbackcomments_editor][format]', '1'
        ); // HTML
      }

      try {
        
        const res  = await fetch(`${apiUrl}?${params.toString()}`, { method: 'GET' });
        const body = await res.text();

        if (!res.ok || body.includes('exception')) {
          await client.query(
            `INSERT INTO moodle_grade_sync
               (student_id, assignment_id, grade, sync_status, sync_message, feedback)
             VALUES ($1,$2,$3,'error',$4,$5)`,
            [studentId, moodleAssignmentId, numericGrade, body.slice(0,255), comment ?? '']
          );
          moodleSync = { success: false, message: 'Error al enviar calificación a Moodle' };
        } else {
          await client.query(
            `INSERT INTO moodle_grade_sync
               (student_id, assignment_id, grade, sync_status, sync_message, feedback, moodle_response)
             VALUES ($1,$2,$3,'success','Enviado',$4,$5)`,
            [studentId, moodleAssignmentId, numericGrade, comment ?? '', body]
          );
          moodleSync = { success: true, message: 'Calificación enviada a Moodle' };
        }
      } catch (err: unknown) {
        await client.query(
          `INSERT INTO moodle_grade_sync
             (student_id, assignment_id, grade, sync_status, sync_message, feedback)
           VALUES ($1,$2,$3,'network_error',$4,$5)`,
          [studentId, moodleAssignmentId, numericGrade, String(err).slice(0,255), comment ?? '']
        );
        moodleSync = { success: false, message: 'No se pudo conectar a Moodle' };
      }
    }

    
    return NextResponse.json({
      success: true,
      message: 'Calificación guardada exitosamente',
      moodleSync
    });

  } catch (err: unknown) {
    await client.query('ROLLBACK').catch(() => {});  // por si BEGIN nunca se ejecutó
    console.error('Error al guardar calificación:', err);

    return NextResponse.json(
      {
        success: false,
        error: 'Error al guardar calificación',
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}*/
// src/app/api/admin/grade/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';   // Next 13+: siempre SSR

type MoodleSyncResult = { success: boolean; message: string; details?: string } | null;

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    /* ─────────────────────────── 1. Identidad del profesor ────────────────────────── */
    const cookieStore   = cookies();
    const moodleToken   = cookieStore.get('moodleToken')?.value;
    const moodleUserId  = Number(cookieStore.get('moodleUserId')?.value);

    if (!moodleToken || Number.isNaN(moodleUserId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    /* ─────────────────────────── 2. Datos del cuerpo ──────────────────────────────── */
    const {
      configId,
      sessionId,            // id_sesion_colaborativa
      reflexionId,          // id_reflexion
      studentId,
      moodleAssignmentId,
      grade,
      comment,
      isCollaborative
    } = await request.json();

    /* 2.1 Validación general */
    if (!configId || grade == null) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos (configId o grade)' },
        { status: 400 }
      );
    }

    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade)) {
      return NextResponse.json(
        { success: false, error: '"grade" debe ser numérico' },
        { status: 400 }
      );
    }

    /* 2.2 Validación específica para cumplir la CHECK constraint */
    if (isCollaborative) {
      if (!sessionId || reflexionId) {
        return NextResponse.json(
          { success: false,
            error: 'Calificación colaborativa: "sessionId" obligatorio y "reflexionId" debe ser nulo' },
          { status: 400 }
        );
      }
    } else {
      if (!reflexionId || sessionId) {
        return NextResponse.json(
          { success: false,
            error: 'Calificación individual: "reflexionId" obligatorio y "sessionId" debe ser nulo' },
          { status: 400 }
        );
      }
    }

    /* ───────────────── 3. Verificar que la configuración pertenece al usuario ─────── */
    const { rowCount: cfgOK } = await client.query(
      `SELECT 1 FROM tps_configurations
        WHERE id = $1 AND moodle_user_id = $2`,
      [configId, moodleUserId]
    );

    if (!cfgOK) {
      return NextResponse.json(
        { success: false, error: 'Configuración no autorizada' },
        { status: 403 }
      );
    }

    /* ───────────────── 4. Transacción para registrar la nota local ────────────────── */
    await client.query('BEGIN');

    if (isCollaborative) {
      // ─── sesión colaborativa ───
      const { rowCount } = await client.query(
        `SELECT 1 FROM gradebook WHERE id_sesion_colaborativa = $1`,
        [sessionId]
      );

      if (rowCount) {
        await client.query(
          `UPDATE gradebook
             SET nota = $1,
                 comentario = $2,
                 fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_sesion_colaborativa = $3`,
          [numericGrade, comment ?? '', sessionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook
             (id_sesion_colaborativa, id_reflexion, nota, comentario, calificado_por)
           VALUES ($1, NULL, $2, $3, $4)`,
          [sessionId, numericGrade, comment ?? '', moodleUserId]
        );
      }
    } else {
      // ─── reflexión individual ───
      const { rowCount } = await client.query(
        `SELECT 1 FROM gradebook WHERE id_reflexion = $1`,
        [reflexionId]
      );

      if (rowCount) {
        await client.query(
          `UPDATE gradebook
             SET nota = $1,
                 comentario = $2,
                 fecha_calificacion = CURRENT_TIMESTAMP
           WHERE id_reflexion = $3`,
          [numericGrade, comment ?? '', reflexionId]
        );
      } else {
        await client.query(
          `INSERT INTO gradebook
             (id_reflexion, id_sesion_colaborativa, nota, comentario, calificado_por)
           VALUES ($1, NULL, $2, $3, $4)`,
          [reflexionId, numericGrade, comment ?? '', moodleUserId]
        );
      }
    }

    await client.query('COMMIT');          // la nota está segura

    /* ───────────────── 5. Sincronizar con Moodle (fuera de la transacción) ─────────── */
    let moodleSync: MoodleSyncResult = null;

    if (studentId && moodleAssignmentId) {
      const moodleUrl =
        process.env.NEXT_PUBLIC_MOODLE_URL ?? 'https://virtual.konradlorenz.edu.co';
      const apiUrl = `${moodleUrl}/webservice/rest/server.php`;

      // Crear FormData para enviar
      const formData = new URLSearchParams();
      formData.append('wstoken', moodleToken);
      formData.append('wsfunction', 'mod_assign_save_grades');
      formData.append('moodlewsrestformat', 'json');
      formData.append('assignmentid', String(moodleAssignmentId));
      formData.append('grades[0][userid]', String(studentId));
      formData.append('grades[0][grade]', String(numericGrade));
      formData.append('grades[0][attemptnumber]', '-1');
      formData.append('grades[0][addattempt]', '1');
      formData.append('grades[0][workflowstate]', 'graded');
      formData.append('applytoall', '0');

      // Añadir comentario si existe
      if (comment) {
        const htmlComment = `<div>${comment.replace(/\n/g, '<br/>')}</div>`;
        formData.append('grades[0][plugindata][assignfeedbackcomments_editor][text]', htmlComment);
        formData.append('grades[0][plugindata][assignfeedbackcomments_editor][format]', '1');
      }

      try {
        console.log('Enviando calificación a Moodle:', apiUrl);
        console.log('Parámetros:', Object.fromEntries(formData));

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });
        
        const responseText = await res.text();
        console.log('Respuesta de Moodle:', responseText);
        
        // Respuesta vacía o null significa éxito
        if (!responseText || responseText === 'null') {
          await client.query(
            `INSERT INTO moodle_grade_sync
               (student_id, assignment_id, grade, sync_status, sync_message, feedback)
             VALUES ($1,$2,$3,'success','Calificación enviada a Moodle exitosamente',$4)`,
            [studentId, moodleAssignmentId, numericGrade, comment ?? '']
          );
          
          moodleSync = { success: true, message: 'Calificación enviada a Moodle correctamente' };
        } else {
          // Intentar parsear la respuesta
          let errorMsg = responseText;
          try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.message || errorData.error || responseText;
          } catch (e) {
            // Si no es JSON, usar el texto tal cual
          }
          
          console.error('Error en respuesta de Moodle:', errorMsg);
          
          await client.query(
            `INSERT INTO moodle_grade_sync
               (student_id, assignment_id, grade, sync_status, sync_message, feedback)
             VALUES ($1,$2,$3,'error',$4,$5)`,
            [studentId, moodleAssignmentId, numericGrade, errorMsg.slice(0,255), comment ?? '']
          );
          
          moodleSync = { 
            success: false, 
            message: 'Error al enviar calificación a Moodle', 
            details: errorMsg
          };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Error al comunicarse con Moodle:', errorMsg);
        
        await client.query(
          `INSERT INTO moodle_grade_sync
             (student_id, assignment_id, grade, sync_status, sync_message, feedback)
           VALUES ($1,$2,$3,'network_error',$4,$5)`,
          [studentId, moodleAssignmentId, numericGrade, errorMsg.slice(0,255), comment ?? '']
        );
        
        moodleSync = { 
          success: false, 
          message: 'No se pudo conectar a Moodle', 
          details: errorMsg
        };
      }
    }

    /* ────────────────────────── 6. Respuesta final ────────────────────────────────── */
    return NextResponse.json({
      success: true,
      message: 'Calificación guardada exitosamente',
      moodleSync
    });

  } catch (err: unknown) {
    await client.query('ROLLBACK').catch(() => {});  // por si BEGIN nunca se ejecutó
    console.error('Error al guardar calificación:', err);

    return NextResponse.json(
      {
        success: false,
        error: 'Error al guardar calificación',
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}