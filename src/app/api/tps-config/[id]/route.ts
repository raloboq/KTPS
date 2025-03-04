// src/app/api/tps-config/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

// GET: Obtener una configuración específica por ID
export async function GET(
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

    // Obtener la configuración junto con datos del curso y la asignación
    const { rows } = await sql`
      SELECT 
        tc.*, 
        mc.name as course_name, 
        ma.name as assignment_name
      FROM 
        tps_configurations tc
      JOIN 
        moodle_courses mc ON tc.moodle_course_id = mc.moodle_course_id
      JOIN 
        moodle_assignments ma ON tc.moodle_assignment_id = ma.moodle_assignment_id
      WHERE 
        tc.id = ${id}
        AND tc.moodle_user_id = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: rows[0] 
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

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfig = await sql`
      SELECT id FROM tps_configurations 
      WHERE id = ${id} AND moodle_user_id = ${userId}
    `;

    if (existingConfig.rowCount === 0) {
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
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    // Actualizar la configuración
    const result = await sql`
      UPDATE tps_configurations
      SET 
        think_phase_duration = ${data.think_phase_duration},
        think_phase_instructions = ${data.think_phase_instructions},
        pair_phase_duration = ${data.pair_phase_duration},
        pair_phase_instructions = ${data.pair_phase_instructions},
        share_phase_duration = ${data.share_phase_duration},
        share_phase_instructions = ${data.share_phase_instructions},
        system_prompt = ${data.system_prompt},
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar configuración TPS' 
    }, { status: 500 });
  }
}

// DELETE: Eliminar una configuración
export async function DELETE(
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

    // Verificar que la configuración exista y pertenezca al usuario
    const existingConfig = await sql`
      SELECT id FROM tps_configurations 
      WHERE id = ${id} AND moodle_user_id = ${userId}
    `;

    if (existingConfig.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // En lugar de eliminar, desactivamos la configuración
    const result = await sql`
      UPDATE tps_configurations
      SET 
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al desactivar configuración TPS' 
    }, { status: 500 });
  }
}