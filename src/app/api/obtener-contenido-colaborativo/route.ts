// src/app/api/obtener-contenido-colaborativo/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ message: 'ID de sala no proporcionado' }, { status: 400 });
  }

  try {
    // Primero obtenemos el id_sesion_colaborativa correspondiente al roomId
    const sesionResult = await pool.query(
      `SELECT id_sesion_colaborativa 
       FROM sesiones_colaborativas 
       WHERE id_room = $1 
       ORDER BY fecha_inicio DESC 
       LIMIT 1`,
      [roomId]
    );

    if (sesionResult.rows.length === 0) {
      return NextResponse.json({ message: 'Sesión colaborativa no encontrada' }, { status: 404 });
    }

    const id_sesion_colaborativa = sesionResult.rows[0].id_sesion_colaborativa;

    // Luego obtenemos la última captura de contenido para esa sesión
    const capturaResult = await pool.query(
      `SELECT contenido, timestamp
       FROM capturas_contenido_colaborativo
       WHERE id_sesion_colaborativa = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [id_sesion_colaborativa]
    );

    if (capturaResult.rows.length === 0) {
      return NextResponse.json({ message: 'No se encontró contenido colaborativo' }, { status: 404 });
    }

    return NextResponse.json({ 
      contenido: capturaResult.rows[0].contenido,
      timestamp: capturaResult.rows[0].timestamp
    });
  } catch (error) {
    console.error('Error al obtener el contenido colaborativo:', error);
    return NextResponse.json({ message: 'Error al obtener el contenido colaborativo' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';