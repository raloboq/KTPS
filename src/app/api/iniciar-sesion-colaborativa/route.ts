/*
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
}*/
// Modificación para src/app/api/iniciar-sesion-colaborativa/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const { id_room, tema, activityId } = await request.json();
    
    await client.query('BEGIN');
    
    let tps_configuration_id = null;
    
    // Si se proporciona el activityId, buscar el tps_configuration_id correspondiente
    if (activityId) {
      const configResult = await client.query(
        'SELECT tps_configuration_id FROM available_activities WHERE id = $1',
        [activityId]
      );
      
      if (configResult.rows.length > 0) {
        tps_configuration_id = configResult.rows[0].tps_configuration_id;
      }
    }
    
    // Primero verificar si ya existe una sesión para este id_room
    const existingSessionResult = await client.query(
      'SELECT id_sesion_colaborativa FROM sesiones_colaborativas WHERE id_room = $1 AND fecha_fin IS NULL',
      [id_room]
    );
    
    let id_sesion_colaborativa;
    
    if (existingSessionResult.rows.length > 0) {
      // Si ya existe una sesión, usamos esa
      id_sesion_colaborativa = existingSessionResult.rows[0].id_sesion_colaborativa;
      console.log(`Uniendo a sesión colaborativa existente: ${id_sesion_colaborativa}`);
    } else {
      // Si no existe, creamos una nueva
      const newSessionResult = await client.query(
        'INSERT INTO sesiones_colaborativas (id_room, tema, tps_configuration_id) VALUES ($1, $2, $3) RETURNING id_sesion_colaborativa',
        [id_room, tema, tps_configuration_id]
      );
      
      id_sesion_colaborativa = newSessionResult.rows[0].id_sesion_colaborativa;
      console.log(`Creada nueva sesión colaborativa: ${id_sesion_colaborativa}`);
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({ 
      id_sesion_colaborativa: id_sesion_colaborativa,
      tps_configuration_id: tps_configuration_id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al iniciar sesión colaborativa:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión colaborativa' }, { status: 500 });
  } finally {
    client.release();
  }
}

export const dynamic = 'force-dynamic';