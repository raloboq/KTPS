'use server'
import { sql } from '@vercel/postgres';

export async function guardarReflexion(id_sesion: number, contenido: string, usuario: string) {
  console.log("guardarReflexion");
  const { rows } = await sql`
    INSERT INTO reflexiones (id_sesion, contenido, usuario)
    VALUES (${id_sesion}, ${contenido}, ${usuario})
    RETURNING id_reflexion
  `;
  
  if (rows.length === 0) {
    throw new Error('No se pudo guardar la reflexión');
  }
  
  return rows[0].id_reflexion;
}