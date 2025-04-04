/*
// src/app/api/tps-config/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

// GET: Obtener una configuración específica por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('GET /api/tps-config/[id] - Iniciando solicitud');
  console.log('Parámetros recibidos:', params);
  try {
    const id = parseInt(params.id);
    console.log('ID convertido a número:', id);
    if (isNaN(id)) {
      console.log('Error: ID no es un número válido');
      return NextResponse.json({ 
        success: false, 
        error: 'ID inválido' 
      }, { status: 400 });
    }

    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log('Todas las cookies disponibles:', allCookies.map(c => c.name));
    
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    console.log('Cookie moodleUserId:', userIdStr);
    
    if (!userIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);

    const result: QueryResult = await pool.query(
      `SELECT 
         tc.*, 
         mc.name as course_name, 
         ma.name as assignment_name 
       FROM 
         tps_configurations tc 
       LEFT JOIN 
         moodle_courses mc ON tc.moodle_course_id = mc.moodle_course_id 
       LEFT JOIN 
         moodle_assignments ma ON tc.moodle_assignment_id = ma.moodle_assignment_id 
       WHERE 
         tc.id = $1 
         AND tc.moodle_user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      console.log('Error: No se encontraron datos con la consulta JOIN completa');
      
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontradaaaaaaa '+id+'   '+userId
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al obtener configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener configuración TPS' 
    }, { status: 500 });
  }
}

// PUT: Actualizar una configuración existente
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

    // Iniciar transacción
    await client.query('BEGIN');

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfig: QueryResult = await client.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [id, userId]
    );

    if (!existingConfig.rowCount || existingConfig.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // Validar los datos requeridos
    if (!data.think_phase_duration || !data.think_phase_instructions ||
        !data.pair_phase_duration || !data.pair_phase_instructions ||
        !data.share_phase_duration || !data.share_phase_instructions ||
        !data.system_prompt) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    // Actualizar la configuración
    const result = await client.query(
      `UPDATE tps_configurations
       SET 
         think_phase_duration = $1,
         think_phase_instructions = $2,
         pair_phase_duration = $3,
         pair_phase_instructions = $4,
         share_phase_duration = $5,
         share_phase_instructions = $6,
         system_prompt = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE 
         id = $8
       RETURNING *`,
      [
        data.think_phase_duration,
        data.think_phase_instructions,
        data.pair_phase_duration,
        data.pair_phase_instructions,
        data.share_phase_duration,
        data.share_phase_instructions,
        data.system_prompt,
        id
      ]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al actualizar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar configuración TPS' 
    }, { status: 500 });
  } finally {
    // Liberar cliente
    client.release();
  }
}

// DELETE: Eliminar una configuración
export async function DELETE(
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

    // Iniciar transacción
    await client.query('BEGIN');

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfig: QueryResult = await client.query(
      `SELECT id FROM tps_configurations 
       WHERE id = $1 AND moodle_user_id = $2`,
      [id, userId]
    );

    if (!existingConfig.rowCount || existingConfig.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // En lugar de eliminar, desactivamos la configuración
    const result = await client.query(
      `UPDATE tps_configurations
       SET 
         is_active = FALSE,
         updated_at = CURRENT_TIMESTAMP
       WHERE 
         id = $1
       RETURNING *`,
      [id]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración desactivada exitosamente'
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al desactivar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al desactivar configuración TPS' 
    }, { status: 500 });
  } finally {
    // Liberar cliente
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';
*/
// src/app/api/tps-activity/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

// GET: Obtener los datos de una actividad específica por ID de configuración
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

    // Verificar que la configuración pertenezca al usuario
    const configCheck = await pool.query(
      `SELECT id FROM tps_configurations WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (configCheck.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // Obtener la actividad asociada a esta configuración
    const result = await pool.query(
      `SELECT * FROM available_activities WHERE tps_configuration_id = $1`,
      [configId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró actividad para esta configuración' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener actividad' 
    }, { status: 500 });
  }
}

// PUT: Actualizar los datos de una actividad específica
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
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
    const data = await request.json();

    // Iniciar transacción
    await client.query('BEGIN');

    // Verificar que la configuración pertenezca al usuario
    const configCheck = await client.query(
      `SELECT id, is_active FROM tps_configurations WHERE id = $1 AND moodle_user_id = $2`,
      [configId, userId]
    );

    if (configCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    const config = configCheck.rows[0];

    // Verificar si ya existe una actividad para esta configuración
    const existingActivity = await client.query(
      `SELECT id FROM available_activities WHERE tps_configuration_id = $1`,
      [configId]
    );

    let result: QueryResult;

    if (existingActivity.rowCount > 0) {
      // Actualizar la actividad existente
      result = await client.query(
        `UPDATE available_activities 
         SET 
           name = $1,
           description = $2,
           start_date = $3,
           end_date = $4,
           is_active = $5,
           updated_at = CURRENT_TIMESTAMP
         WHERE tps_configuration_id = $6
         RETURNING *`,
        [
          data.name, 
          data.description, 
          data.start_date, 
          data.end_date, 
          data.is_active && config.is_active, // Solo puede estar activa si la config también lo está
          configId
        ]
      );
    } else {
      // Crear una nueva actividad
      result = await client.query(
        `INSERT INTO available_activities
           (tps_configuration_id, name, description, is_active, start_date, end_date)
         VALUES
           ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          configId, 
          data.name, 
          data.description, 
          data.is_active && config.is_active, // Solo puede estar activa si la config también lo está
          data.start_date, 
          data.end_date
        ]
      );
    }

    // Confirmar la transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Actividad actualizada exitosamente'
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al actualizar actividad:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar actividad' 
    }, { status: 500 });
  } finally {
    // Liberar el cliente al finalizar
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';