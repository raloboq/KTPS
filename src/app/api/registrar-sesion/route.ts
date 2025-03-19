/*
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { roomId, roomName, userName } = await request.json();
    
    const { rows } = await sql`
      INSERT INTO session_info (room_id, room_name, user_name)
      VALUES (${roomId}, ${roomName}, ${userName})
      RETURNING id
    `;

    if (rows.length === 0) {
      throw new Error('No se pudo registrar la sesión');
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    console.error('Error al registrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al registrar la sesión' },
      { status: 500 }
    );
  }
}*/

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configurar el pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // O puedes usar configuración individual:
  // user: process.env.POSTGRES_USER,
  // host: process.env.POSTGRES_HOST,
  // database: process.env.POSTGRES_DATABASE,
  // password: process.env.POSTGRES_PASSWORD,
  // port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export async function POST(request: Request) {
  try {
    const { roomId, roomName, userName } = await request.json();
    
    const result = await pool.query(
      'INSERT INTO session_info (room_id, room_name, user_name) VALUES ($1, $2, $3) RETURNING id',
      [roomId, roomName, userName]
    );

    if (result.rows.length === 0) {
      throw new Error('No se pudo registrar la sesión');
    }

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error al registrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al registrar la sesión' },
      { status: 500 }
    );
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';