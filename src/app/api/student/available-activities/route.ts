// src/app/api/student/available-activities/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { IS_DEMO_MODE, demoActivities } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener el token y ID del estudiante de las cookies
    const cookieStore = cookies();
    const studentIdStr = cookieStore.get('studentId')?.value;
    const token = cookieStore.get('studentMoodleToken')?.value;
    
    // Verificar autenticación
    if (!token || !studentIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const studentId = parseInt(studentIdStr);
    
    // Si estamos en modo demo, devolver datos de demostración
    if (IS_DEMO_MODE) {
      // En modo demo, devolvemos las actividades disponibles predefinidas
      return NextResponse.json({
        success: true,
        activities: demoActivities
      });
    }
    
    // Si no estamos en modo demo, consultar la base de datos real
    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.name,
        aa.description,
        aa.start_date,
        aa.end_date,
        c.name as course_name,
        ma.name as assignment_name,
        tc.id as configuration_id
      FROM 
        available_activities aa
      JOIN 
        tps_configurations tc ON aa.tps_configuration_id = tc.id
      JOIN 
        moodle_courses c ON tc.moodle_course_id = c.moodle_course_id
      JOIN 
        moodle_assignments ma ON tc.moodle_assignment_id = ma.moodle_assignment_id
      WHERE 
        aa.is_active = TRUE
        AND CURRENT_TIMESTAMP BETWEEN aa.start_date AND aa.end_date
        -- Podríamos añadir restricciones adicionales aquí, como verificar
        -- matrícula del estudiante en el curso, etc.
      ORDER BY 
        aa.end_date ASC
    `);
    
    return NextResponse.json({
      success: true,
      activities: result.rows
    });
  } catch (error) {
    console.error('Error al obtener actividades disponibles:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener actividades disponibles' 
    }, { status: 500 });
  }
}



