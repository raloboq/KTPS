/*'use server'

import { sql } from '@vercel/postgres';

export async function registrarSesion(roomId: string, roomName: string, userName: string) {
  console.log("registrarSesion");
  const { rows } = await sql`
    INSERT INTO session_info (room_id, room_name, user_name)
    VALUES (${roomId}, ${roomName}, ${userName})
    RETURNING id
  `;
  
  if (rows.length === 0) {
    throw new Error('No se pudo registrar la sesión');
  }
  
  return rows[0].id;
}*/
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
}