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
    console.error('Error al registrar datos del chat:', error);
    return NextResponse.json({ error: 'Error al registrar datos del chat' }, { status: 500 });
  }
}*/
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const { id_sesion_chat, mensajes, interacciones } = await request.json();

    // Iniciar transacción para asegurar la consistencia de datos
    await client.query('BEGIN');

    // Registrar mensajes
    if (mensajes && mensajes.length > 0) {
      for (const mensaje of mensajes) {
        await client.query(
          `INSERT INTO mensajes_chat (id_sesion_chat, tipo_mensaje, contenido, nombre_usuario)
           VALUES ($1, $2, $3, $4)`,
          [id_sesion_chat, mensaje.tipo_mensaje, mensaje.contenido, mensaje.nombre_usuario]
        );
      }
    }

    // Registrar interacciones
    if (interacciones && interacciones.length > 0) {
      for (const interaccion of interacciones) {
        const detallesJSON = JSON.stringify(interaccion.detalles);
        await client.query(
          `INSERT INTO interacciones_chat (id_sesion_chat, tipo_interaccion, detalles, nombre_usuario)
           VALUES ($1, $2, $3, $4)`,
          [id_sesion_chat, interaccion.tipo_interaccion, detallesJSON, interaccion.nombre_usuario]
        );
      }
    }

    // Confirmar transacción
    await client.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('Error al registrar datos del chat:', error);
    return NextResponse.json({ 
      error: 'Error al registrar datos del chat',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    // Liberar el cliente de vuelta al pool
    client.release();
  }
}

// Marcar la ruta como dinámica para evitar errores de pre-renderizado
export const dynamic = 'force-dynamic';