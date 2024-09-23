"use server"
import { sql } from '@vercel/postgres';

export async function registrarInteraccion(id_sesion: number, tipo_interaccion: string, detalles: any, origen: string) {
  console.log("registrarInteraccion");
  const { rows } = await sql`
    INSERT INTO interacciones (id_sesion, tipo_interaccion, detalles, origen)
    VALUES (${id_sesion}, ${tipo_interaccion}, ${JSON.stringify(detalles)}, ${origen})
    RETURNING id_interaccion
  `;
  
  if (rows.length === 0) {
    throw new Error('No se pudo registrar la interacción');
  }
  
  return rows[0].id_interaccion;
}