import { NextResponse } from 'next/server';
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
}