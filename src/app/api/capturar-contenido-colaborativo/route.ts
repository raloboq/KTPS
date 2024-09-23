import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa, contenido } = await request.json();
    await sql`
      INSERT INTO capturas_contenido_colaborativo (id_sesion_colaborativa, contenido)
      VALUES (${id_sesion_colaborativa}, ${contenido})
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al capturar contenido colaborativo' }, { status: 500 });
  }
}