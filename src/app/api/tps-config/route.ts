
// src/app/api/tps-config/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

// src/app/api/tps-config/route.ts
// Parte actualizada para usar la cookie moodleUserId correctamente

// GET: Obtener todas las configuraciones del usuario actual
export async function GET(request: Request) {
    try {
      // Obtener el ID del usuario de Moodle desde las cookies
      const cookieStore = cookies();
      const userIdStr = cookieStore.get('moodleUserId')?.value;
      
      if (!userIdStr) {
        console.error('Cookie moodleUserId no encontrada');
        
        // Verificar qué cookies existen (para depuración)
        const allCookies = cookieStore.getAll();
        console.log('Cookies disponibles:', allCookies.map(c => c.name));
        
        return NextResponse.json({ 
          success: false, 
          error: 'Usuario no autenticado',
          debug: { cookiesAvailable: allCookies.map(c => c.name) } 
        }, { status: 401 });
      }
      
      const userId = parseInt(userIdStr);
  
      // Obtener todas las configuraciones creadas por este usuario
      const { rows } = await sql`
        SELECT 
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
          tc.moodle_user_id = ${userId}
        ORDER BY 
          tc.created_at DESC
      `;
  
      return NextResponse.json({ 
        success: true, 
        data: rows 
      });
    } catch (error) {
      console.error('Error al obtener configuraciones TPS:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al obtener configuraciones TPS' 
      }, { status: 500 });
    }
  }
  
  // POST: Sección actualizada para usar la cookie moodleUserId correctamente
  export async function POST(request: Request) {
    try {
      const cookieStore = cookies();
      const userIdStr = cookieStore.get('moodleUserId')?.value;
      
      if (!userIdStr) {
        console.error('Cookie moodleUserId no encontrada');
        return NextResponse.json({ 
          success: false, 
          error: 'Usuario no autenticado' 
        }, { status: 401 });
      }
      
      const userId = parseInt(userIdStr);
      const data = await request.json();
  
      // Validar los datos requeridos
      if (!data.moodle_course_id || !data.moodle_assignment_id || 
          !data.think_phase_duration || !data.think_phase_instructions ||
          !data.pair_phase_duration || !data.pair_phase_instructions ||
          !data.share_phase_duration || !data.share_phase_instructions ||
          !data.system_prompt) {
        return NextResponse.json({ 
          success: false, 
          error: 'Faltan campos requeridos' 
        }, { status: 400 });
      }
  
      // Verificar si ya existe una configuración activa para este curso y asignación
      const existingConfig = await sql`
        SELECT id FROM tps_configurations 
        WHERE moodle_user_id = ${userId}
          AND moodle_course_id = ${data.moodle_course_id}
          AND moodle_assignment_id = ${data.moodle_assignment_id}
          AND is_active = TRUE
      `;
  
      if (existingConfig && existingConfig.rowCount && existingConfig.rowCount > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ya existe una configuración activa para este curso y actividad' 
        }, { status: 409 });
      }
  
      // Insertar la nueva configuración
      const result = await sql`
        INSERT INTO tps_configurations (
          moodle_user_id, 
          moodle_course_id, 
          moodle_assignment_id,
          think_phase_duration, 
          think_phase_instructions,
          pair_phase_duration, 
          pair_phase_instructions,
          share_phase_duration, 
          share_phase_instructions,
          system_prompt
        ) VALUES (
          ${userId},
          ${data.moodle_course_id},
          ${data.moodle_assignment_id},
          ${data.think_phase_duration},
          ${data.think_phase_instructions},
          ${data.pair_phase_duration},
          ${data.pair_phase_instructions},
          ${data.share_phase_duration},
          ${data.share_phase_instructions},
          ${data.system_prompt}
        )
        RETURNING *
      `;
  
      return NextResponse.json({ 
        success: true, 
        data: result.rows[0],
        message: 'Configuración creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear configuración TPS:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al crear configuración TPS' 
      }, { status: 500 });
    }
  }*/
    import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

// GET: Obtener todas las configuraciones del usuario actual
export async function GET(request: Request) {
  try {
    // Obtener el ID del usuario de Moodle desde las cookies
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      console.error('Cookie moodleUserId no encontrada');
      
      // Verificar qué cookies existen (para depuración)
      const allCookies = cookieStore.getAll();
      console.log('Cookies disponibles:', allCookies.map(c => c.name));
      
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado',
        debug: { cookiesAvailable: allCookies.map(c => c.name) } 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);

    // Obtener todas las configuraciones creadas por este usuario
    const result = await pool.query(
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
        tc.moodle_user_id = $1
      ORDER BY 
        tc.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error al obtener configuraciones TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener configuraciones TPS' 
    }, { status: 500 });
  }
}

// POST: Crear una nueva configuración
export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const cookieStore = cookies();
    const userIdStr = cookieStore.get('moodleUserId')?.value;
    
    if (!userIdStr) {
      console.error('Cookie moodleUserId no encontrada');
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const userId = parseInt(userIdStr);
    const data = await request.json();

    // Validar los datos requeridos
    if (!data.moodle_course_id || !data.moodle_assignment_id || 
        !data.think_phase_duration || !data.think_phase_instructions ||
        !data.pair_phase_duration || !data.pair_phase_instructions ||
        !data.share_phase_duration || !data.share_phase_instructions ||
        !data.system_prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    // Comenzar transacción
    await client.query('BEGIN');

    // Verificar si ya existe una configuración activa para este curso y asignación
    const existingConfigResult: QueryResult = await client.query(
      `SELECT id FROM tps_configurations 
       WHERE moodle_user_id = $1
         AND moodle_course_id = $2
         AND moodle_assignment_id = $3
         AND is_active = TRUE`,
      [userId, data.moodle_course_id, data.moodle_assignment_id]
    );

    // Usar una verificación segura para rowCount
    if (existingConfigResult && existingConfigResult.rowCount && existingConfigResult.rowCount > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ 
        success: false, 
        error: 'Ya existe una configuración activa para este curso y actividad' 
      }, { status: 409 });
    }

    // Insertar la nueva configuración
    const insertResult = await client.query(
      `INSERT INTO tps_configurations (
        moodle_user_id, 
        moodle_course_id, 
        moodle_assignment_id,
        think_phase_duration, 
        think_phase_instructions,
        pair_phase_duration, 
        pair_phase_instructions,
        share_phase_duration, 
        share_phase_instructions,
        system_prompt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,
        data.moodle_course_id,
        data.moodle_assignment_id,
        data.think_phase_duration,
        data.think_phase_instructions,
        data.pair_phase_duration,
        data.pair_phase_instructions,
        data.share_phase_duration,
        data.share_phase_instructions,
        data.system_prompt
      ]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: insertResult.rows[0],
      message: 'Configuración creada exitosamente'
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error al crear configuración TPS:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error al crear configuración TPS' 
    }, { status: 500 });
  } finally {
    // Liberar el cliente de vuelta al pool
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';