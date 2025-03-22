/*'use server'
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
}*/
'use server'
import { pool } from '@/lib/db';

export async function guardarReflexion(id_sesion: number, contenido: string, usuario: string) {
  console.log("guardarReflexion");
  
  try {
    const result = await pool.query(
      `INSERT INTO reflexiones (id_sesion, contenido, usuario)
       VALUES ($1, $2, $3)
       RETURNING id_reflexion`,
      [id_sesion, contenido, usuario]
    );
    
    if (result.rows.length === 0) {
      throw new Error('No se pudo guardar la reflexión');
    }
    
    return result.rows[0].id_reflexion;
  } catch (error) {
    console.error('Error al guardar la reflexión:', error);
    throw new Error('No se pudo guardar la reflexión');
  }
}