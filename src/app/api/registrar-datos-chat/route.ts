/*import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_sesion_chat, mensajes, interacciones } = await request.json();
    
    // Registrar mensajes
    for (const mensaje of mensajes) {
      await sql`
        INSERT INTO mensajes_chat (id_sesion_chat, tipo_mensaje, contenido, nombre_usuario)
        VALUES (${id_sesion_chat}, ${mensaje.tipo_mensaje}, ${mensaje.contenido}, ${mensaje.nombre_usuario})
      `;
    }
    
    // Registrar interacciones
    for (const interaccion of interacciones) {
      await sql`
        INSERT INTO interacciones_chat (id_sesion_chat, tipo_interaccion, detalles, nombre_usuario)
        VALUES (${id_sesion_chat}, ${interaccion.tipo_interaccion}, ${JSON.stringify(interaccion.detalles)}, ${interaccion.nombre_usuario})
      `;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar datos del chat' }, { status: 500 });
  }
}
*/

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id_sesion_chat, mensajes, interacciones } = await request.json();

    // Registrar mensajes
    for (const mensaje of mensajes) {
      await sql`
        INSERT INTO mensajes_chat (id_sesion_chat, tipo_mensaje, contenido, nombre_usuario)
        VALUES (${id_sesion_chat}, ${mensaje.tipo_mensaje}, ${mensaje.contenido}, ${mensaje.nombre_usuario})
      `;
    }

    // Registrar interacciones
    for (const interaccion of interacciones) {
      await sql`
        INSERT INTO interacciones_chat (id_sesion_chat, tipo_interaccion, detalles, nombre_usuario)
        VALUES (${id_sesion_chat}, ${interaccion.tipo_interaccion}, ${JSON.stringify(interaccion.detalles)}, ${interaccion.nombre_usuario})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al registrar datos del chat:', error);
    return NextResponse.json({ error: 'Error al registrar datos del chat' }, { status: 500 });
  }
}