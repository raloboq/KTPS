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

    if (existingActivity && existingActivity.rowCount && existingActivity.rowCount > 0) {
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
            data.is_active && config.is_active,
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