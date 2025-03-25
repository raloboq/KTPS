// src/app/api/student/available-activities/route.ts
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
    
    // Logs para depuración
    console.log('Obtener actividades disponibles:');
    console.log('- Modo demo:', IS_DEMO_MODE);
    console.log('- studentId cookie:', studentIdStr);
    console.log('- token cookie:', token ? 'Presente' : 'Ausente');
    
    // En modo demo, siempre permitir acceso incluso sin token
    if (IS_DEMO_MODE) {
      console.log('Devolviendo actividades en modo demo');
      return NextResponse.json({
        success: true,
        activities: demoActivities
      });
    }
    
    // En modo no-demo, verificar autenticación
    if (!token || !studentIdStr) {
      console.log('Usuario no autenticado - faltan cookies necesarias');
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 });
    }
    
    const studentId = parseInt(studentIdStr);
    
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