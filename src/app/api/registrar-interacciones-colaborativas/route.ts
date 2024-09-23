import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_sesion_colaborativa, interacciones } = await request.json();
    for (const interaccion of interacciones) {
      // Si la interacción es de tipo 'usuario_unido' o 'usuario_salido', 
      // registramos también en la tabla participantes_colaborativos
      if (interaccion.tipo === 'usuario_unido') {
        await sql`
          INSERT INTO participantes_colaborativos (id_sesion_colaborativa, nombre_usuario)
          VALUES (${id_sesion_colaborativa}, ${interaccion.detalles.nombre_usuario})
        `;
      } else if (interaccion.tipo === 'usuario_salido') {
        await sql`
          UPDATE participantes_colaborativos
          SET fecha_salida = CURRENT_TIMESTAMP
          WHERE id_sesion_colaborativa = ${id_sesion_colaborativa}
            AND nombre_usuario = ${interaccion.detalles.nombre_usuario}
            AND fecha_salida IS NULL
        `;
      }

      // Registramos la interacción
      await sql`
        INSERT INTO interacciones_colaborativas (id_sesion_colaborativa, tipo_interaccion, detalles)
        VALUES (${id_sesion_colaborativa}, ${interaccion.tipo}, ${JSON.stringify(interaccion.detalles)})
      `;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar interacciones colaborativas' }, { status: 500 });
  }
}