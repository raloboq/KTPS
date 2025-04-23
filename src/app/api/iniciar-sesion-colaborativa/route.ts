/*
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id_room, tema } = await request.json();
    
    const result = await pool.query(
      'INSERT INTO sesiones_colaborativas (id_room, tema) VALUES ($1, $2) RETURNING id_sesion_colaborativa',
      [id_room, tema]
    );
    
    return NextResponse.json({ id_sesion_colaborativa: result.rows[0].id_sesion_colaborativa });
  } catch (error) {
    console.error('Error al iniciar sesión colaborativa:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión colaborativa' }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';
*/
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id_room, tema, activityId } = await request.json();
    
    let tps_configuration_id = null;
    
    // Si se proporciona el activityId, buscar el tps_configuration_id correspondiente
    if (activityId) {
      const configResult = await pool.query(
        'SELECT tps_configuration_id FROM available_activities WHERE id = $1',
        [activityId]
      );
      
      if (configResult.rows.length > 0) {
        tps_configuration_id = configResult.rows[0].tps_configuration_id;
      }
    }
    
    // Insertar la sesión colaborativa incluyendo el tps_configuration_id
    const result = await pool.query(
      'INSERT INTO sesiones_colaborativas (id_room, tema, tps_configuration_id) VALUES ($1, $2, $3) RETURNING id_sesion_colaborativa',
      [id_room, tema, tps_configuration_id]
    );
    
    return NextResponse.json({ 
      id_sesion_colaborativa: result.rows[0].id_sesion_colaborativa,
      tps_configuration_id: tps_configuration_id
    });
  } catch (error) {
    console.error('Error al iniciar sesión colaborativa:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión colaborativa' }, { status: 500 });
  }
}