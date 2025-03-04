// src/app/api/tps-config/[id]/toggle-status/route.ts
import { NextResponse } from 'next/server';
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
}