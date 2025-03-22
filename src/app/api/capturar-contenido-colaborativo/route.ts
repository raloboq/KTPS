/*import { NextResponse } from 'next/server';
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
  */
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa, contenido } = await request.json();
    
    await pool.query(
      'INSERT INTO capturas_contenido_colaborativo (id_sesion_colaborativa, contenido) VALUES ($1, $2)',
      [id_sesion_colaborativa, contenido]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al capturar contenido colaborativo:', error);
    return NextResponse.json({ error: 'Error al capturar contenido colaborativo' }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';