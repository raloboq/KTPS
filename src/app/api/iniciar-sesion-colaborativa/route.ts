/*import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_room, tema } = await request.json();
    const result = await sql`
      INSERT INTO sesiones_colaborativas (id_room, tema)
      VALUES (${id_room}, ${tema})
      RETURNING id_sesion_colaborativa
    `;
    return NextResponse.json({ id_sesion_colaborativa: result.rows[0].id_sesion_colaborativa });
  } catch (error) {
    return NextResponse.json({ error: 'Error al iniciar sesión colaborativa' }, { status: 500 });
  }
}*/
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