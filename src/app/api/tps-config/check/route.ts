// src/app/api/tps-config/check/route.ts
// Actualizado para usar el valor correcto de la cookie

/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';
export const dynamic = 'force-dynamic';
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
    console.log('moodleUserId encontrado en cookies:', userId);

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const courseIdStr = searchParams.get('courseId');
    const assignmentIdStr = searchParams.get('assignmentId');

    if (!courseIdStr || !assignmentIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Se requieren los IDs de curso y actividad' 
      }, { status: 400 });
    }

    const courseId = parseInt(courseIdStr);
    const assignmentId = parseInt(assignmentIdStr);

    if (isNaN(courseId) || isNaN(assignmentId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'IDs de curso o actividad inválidos' 
      }, { status: 400 });
    }

    // Buscar configuración activa para el curso y actividad especificados
    const result = await sql`
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
        AND tc.moodle_course_id = ${courseId}
        AND tc.moodle_assignment_id = ${assignmentId}
        AND tc.is_active = TRUE
    `;

    // Verificar que la consulta se haya ejecutado correctamente
    if (!result || !result.rows) {
      console.error('Error en la consulta SQL');
      return NextResponse.json({ 
        success: false, 
        error: 'Error en la consulta a la base de datos' 
      }, { status: 500 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: 'No existe configuración activa para este curso y actividad'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al verificar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar configuración TPS' 
    }, { status: 500 });
  }
}*/
// src/app/api/tps-config/check/route.ts
// src/app/api/tps-config/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { QueryResult } from 'pg';

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

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const courseIdStr = searchParams.get('courseId');
    const assignmentIdStr = searchParams.get('assignmentId');

    if (!courseIdStr || !assignmentIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Se requieren los IDs de curso y actividad' 
      }, { status: 400 });
    }

    const courseId = parseInt(courseIdStr);
    const assignmentId = parseInt(assignmentIdStr);

    if (isNaN(courseId) || isNaN(assignmentId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'IDs de curso o actividad inválidos' 
      }, { status: 400 });
    }

    // Buscar configuración activa para el curso y actividad especificados
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
        tc.moodle_user_id = $1
        AND tc.moodle_course_id = $2
        AND tc.moodle_assignment_id = $3
        AND tc.is_active = TRUE`,
      [userId, courseId, assignmentId]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: 'No existe configuración activa para este curso y actividad'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al verificar configuración TPS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar configuración TPS' 
    }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';