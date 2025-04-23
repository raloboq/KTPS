import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    
    if (!activityId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de actividad no proporcionado' 
      }, { status: 400 });
    }
    
    // Consulta para obtener el tps_configuration_id de la actividad
    const result = await pool.query(
      `SELECT tps_configuration_id 
       FROM available_activities 
       WHERE id = $1`,
      [activityId]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Actividad no encontrada' 
      }, { status: 404 });
    }
    
    const tpsConfigId = result.rows[0].tps_configuration_id;
    
    // También obtener detalles del room si tenemos un roomId
    const roomId = searchParams.get('roomId');
    let roomInfo = null;
    
    if (roomId) {
      const roomResult = await pool.query(
        `SELECT pr.id, pr.room_name, pr.activity_id
         FROM pairing_rooms pr
         WHERE pr.id = $1`,
        [roomId]
      );
      
      if (roomResult?.rowCount && roomResult.rowCount > 0) {
        roomInfo = roomResult.rows[0];
      }
    }
    
    return NextResponse.json({
      success: true,
      config_id: tpsConfigId,
      room: roomInfo
    });
  } catch (error) {
    console.error('Error al obtener tps_configuration_id:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener configuración' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';