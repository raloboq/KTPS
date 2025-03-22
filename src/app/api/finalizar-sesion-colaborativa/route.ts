/*import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa } = await request.json();
    await sql`
      UPDATE sesiones_colaborativas
      SET fecha_fin = CURRENT_TIMESTAMP
      WHERE id_sesion_colaborativa = ${id_sesion_colaborativa}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al finalizar sesión colaborativa' }, { status: 500 });
  }
}*/
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa } = await request.json();
    
    await pool.query(
      'UPDATE sesiones_colaborativas SET fecha_fin = CURRENT_TIMESTAMP WHERE id_sesion_colaborativa = $1',
      [id_sesion_colaborativa]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al finalizar sesión colaborativa:', error);
    return NextResponse.json({ error: 'Error al finalizar sesión colaborativa' }, { status: 500 });
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';