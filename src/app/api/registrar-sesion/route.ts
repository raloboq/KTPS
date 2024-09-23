'use server'

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
}