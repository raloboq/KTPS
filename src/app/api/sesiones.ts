/*"use server"
import { sql } from '@vercel/postgres';

export async function iniciarSesion(alias: string, tema: string) {
  console.log("iniciarSesion");
  const { rows } = await sql`
    INSERT INTO sesiones (alias, tema)
    VALUES (${alias}, ${tema})
    RETURNING id_sesion
  `;
  
  if (rows.length === 0) {
    throw new Error('No se pudo iniciar la sesión');
  }
  
  return rows[0].id_sesion;
}*/
"use server"
import { pool } from '@/lib/db';

export async function iniciarSesion(alias: string, tema: string) {
  console.log("iniciarSesion");
  
  try {
    const result = await pool.query(
      `INSERT INTO sesiones (alias, tema)
       VALUES ($1, $2)
       RETURNING id_sesion`,
      [alias, tema]
    );
    
    if (result.rows.length === 0) {
      throw new Error('No se pudo iniciar la sesión');
    }
    
    return result.rows[0].id_sesion;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw new Error('No se pudo iniciar la sesión');
  }
}