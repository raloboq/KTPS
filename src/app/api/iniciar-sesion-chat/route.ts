/*
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { room_id, nombre_usuario } = await request.json();
    
    // Insertamos o actualizamos la sesión de chat
    const result = await sql`
      INSERT INTO sesiones_chat (room_id, participantes)
      VALUES (${room_id}, ${JSON.stringify([nombre_usuario])})
      ON CONFLICT (room_id) 
      DO UPDATE SET 
        participantes = sesiones_chat.participantes || ${JSON.stringify([nombre_usuario])}
      RETURNING id_sesion_chat
    `;
    
    const id_sesion_chat = result.rows[0].id_sesion_chat;

    console.log(`Sesión de chat iniciada/actualizada: ${id_sesion_chat} para room_id: ${room_id}`);
    
    return NextResponse.json({ id_sesion_chat });
  } catch (error) {
    console.error('Error al iniciar sesión de chat:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión de chat' }, { status: 500 });
  }
}*/
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { room_id, nombre_usuario } = await request.json();
    
    // Insertamos o actualizamos la sesión de chat
    const result = await pool.query(
      `INSERT INTO sesiones_chat (room_id, participantes)
       VALUES ($1, $2)
       ON CONFLICT (room_id) 
       DO UPDATE SET 
         participantes = sesiones_chat.participantes || $2
       RETURNING id_sesion_chat`,
      [room_id, JSON.stringify([nombre_usuario])]
    );
    
    const id_sesion_chat = result.rows[0].id_sesion_chat;

    console.log(`Sesión de chat iniciada/actualizada: ${id_sesion_chat} para room_id: ${room_id}`);
    
    return NextResponse.json({ id_sesion_chat });
  } catch (error) {
    console.error('Error al iniciar sesión de chat:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión de chat' }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';