/*"use server"
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
}*/
"use server"
import { pool } from '@/lib/db';

export async function registrarInteraccion(id_sesion: number, tipo_interaccion: string, detalles: any, origen: string) {
  console.log("registrarInteraccion");
  
  try {
    // Convertir el objeto detalles a formato JSON para almacenamiento
    const detallesJSON = JSON.stringify(detalles);
    
    const result = await pool.query(
      `INSERT INTO interacciones (id_sesion, tipo_interaccion, detalles, origen)
       VALUES ($1, $2, $3, $4)
       RETURNING id_interaccion`,
      [id_sesion, tipo_interaccion, detallesJSON, origen]
    );
    
    if (result.rows.length === 0) {
      throw new Error('No se pudo registrar la interacción');
    }
    
    return result.rows[0].id_interaccion;
  } catch (error) {
    console.error('Error al registrar interacción:', error);
    throw new Error('No se pudo registrar la interacción');
  }
}