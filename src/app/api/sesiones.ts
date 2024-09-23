"use server"
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
}