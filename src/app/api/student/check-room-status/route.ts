// src/app/api/student/check-room-status/route.ts
/*import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { IS_DEMO_MODE, getRoomStatusDemo } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener información de la sala y actividad de las cookies
    const cookieStore = cookies();
    const roomIdStr = cookieStore.get('roomId')?.value;
    
    if (!roomIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró información de la sala'
      }, { status: 400 });
    }
    
    const roomId = parseInt(roomIdStr);
    
    // Si estamos en modo demo, obtener estado de la sala desde la memoria
    if (IS_DEMO_MODE) {
      const result = getRoomStatusDemo(roomId);
      return NextResponse.json(result);
    }
    
    // Si no estamos en modo demo, consultar la base de datos real
    const result = await pool.query(`
      SELECT
        pr.id as room_id,
        pr.room_name,
        pr.current_students,
        pr.is_full,
        aa.id as activity_id,
        aa.name as activity_name,
        tc.think_phase_duration,
        tc.think_phase_instructions,
        tc.pair_phase_duration,
        tc.pair_phase_instructions,
        tc.share_phase_duration,
        tc.share_phase_instructions,
        tc.system_prompt
      FROM
        pairing_rooms pr
      JOIN
        available_activities aa ON pr.activity_id = aa.id
      JOIN
        tps_configurations tc ON aa.tps_configuration_id = tc.id
      WHERE
        pr.id = $1
    `, [roomId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sala no encontrada'
      }, { status: 404 });
    }
    
    // Obtener compañeros de sala
    const roommates = await pool.query(`
      SELECT
        su.id,
        su.fullname,
        su.username,
        sra.join_time
      FROM
        student_room_assignments sra
      JOIN
        student_users su ON sra.student_id = su.id
      WHERE
        sra.room_id = $1
        AND sra.status = 'active'
    `, [roomId]);
    
    // Devolver información de la sala y configuración
    return NextResponse.json({
      success: true,
      room: result.rows[0],
      students: roommates.rows,
      canStartPair: result.rows[0].is_full,
      readyForShare: false // Esto se actualizaría basado en la lógica de la aplicación
    });
  } catch (error) {
    console.error('Error al verificar estado de la sala:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar estado de la sala'
    }, { status: 500 });
  }
}*/
// src/app/api/student/check-room-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import { IS_DEMO_MODE, getRoomStatusDemo } from '@/utils/demoMode';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get room information from cookies
    const cookieStore = cookies();
    const roomIdStr = cookieStore.get('roomId')?.value;
    
    if (!roomIdStr) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontró información de la sala'
      }, { status: 400 });
    }
    
    const roomId = parseInt(roomIdStr);
    
    // If in demo mode, get room status from memory
    if (IS_DEMO_MODE) {
      const result = getRoomStatusDemo(roomId);
      return NextResponse.json(result);
    }
    
    // If not in demo mode, query the real database
    const result = await pool.query(`
      SELECT
        pr.id as room_id,
        pr.room_name,
        pr.current_students,
        pr.is_full,
        aa.id as activity_id,
        aa.name as activity_name,
        tc.id as tps_configuration_id,
        tc.think_phase_duration,
        tc.think_phase_instructions,
        tc.pair_phase_duration,
        tc.pair_phase_instructions,
        tc.share_phase_duration,
        tc.share_phase_instructions,
        tc.system_prompt,
        mc.name as course_name
      FROM
        pairing_rooms pr
      JOIN
        available_activities aa ON pr.activity_id = aa.id
      JOIN
        tps_configurations tc ON aa.tps_configuration_id = tc.id
      LEFT JOIN
        moodle_courses mc ON tc.moodle_course_id = mc.moodle_course_id
      WHERE
        pr.id = $1
    `, [roomId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sala no encontrada'
      }, { status: 404 });
    }
    
    // Get roommates
    const roommates = await pool.query(`
      SELECT
        su.id,
        su.fullname,
        su.username,
        sra.join_time
      FROM
        student_room_assignments sra
      JOIN
        student_users su ON sra.student_id = su.id
      WHERE
        sra.room_id = $1
        AND sra.status = 'active'
    `, [roomId]);
    
    // Return room information and configuration
    return NextResponse.json({
      success: true,
      room: result.rows[0],
      students: roommates.rows,
      canStartPair: result.rows[0].is_full,
      readyForShare: false // This would be updated based on application logic
    });
  } catch (error) {
    console.error('Error checking room status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar estado de la sala'
    }, { status: 500 });
  }
}