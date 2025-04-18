/*import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alias = searchParams.get('alias');

  if (!alias) {
    return NextResponse.json({ message: 'Alias no proporcionado' }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      SELECT r.contenido
      FROM reflexiones r
      JOIN sesiones s ON r.id_sesion = s.id_sesion
      WHERE s.alias = ${alias}
      ORDER BY r.fecha_creacion DESC
      LIMIT 1
    `;

    if (rows.length > 0) {
      return NextResponse.json({ reflexion: rows[0].contenido });
    } else {
      return NextResponse.json({ message: 'Reflexión no encontrada' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error al obtener la reflexión:', error);
    return NextResponse.json({ message: 'Error al obtener la reflexión' }, { status: 500 });
  }
}*/
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alias = searchParams.get('alias');

  if (!alias) {
    return NextResponse.json({ message: 'Alias no proporcionado' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT r.contenido
       FROM reflexiones r
       JOIN sesiones s ON r.id_sesion = s.id_sesion
       WHERE s.alias = $1
       ORDER BY r.fecha_creacion DESC
       LIMIT 1`,
      [alias]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ reflexion: result.rows[0].contenido });
    } else {
      return NextResponse.json({ message: 'Reflexión no encontrada' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error al obtener la reflexión:', error);
    return NextResponse.json({ message: 'Error al obtener la reflexión' }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';