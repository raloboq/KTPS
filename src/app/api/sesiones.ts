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

export async function iniciarSesion(alias: string, tema: string, tps_configuration_id?: number) {
  console.log("iniciarSesion", { alias, tema, tps_configuration_id }); // Log para depuración
  
  try {
    // Query modificada para incluir tps_configuration_id
    const result = await pool.query(
      `INSERT INTO sesiones (alias, tema, tps_configuration_id)
       VALUES ($1, $2, $3)
       RETURNING id_sesion`,
      [alias, tema, tps_configuration_id || null]
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

export async function finalizarSesion(id_sesion: number) {
  console.log("finalizarSesion");
  
  try {
    // Actualiza fecha_fin y calcula duracion_segundos
    const result = await pool.query(
      `UPDATE sesiones
       SET fecha_fin = CURRENT_TIMESTAMP,
           duracion_segundos = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fecha_inicio))::integer
       WHERE id_sesion = $1
       RETURNING id_sesion, duracion_segundos`,
      [id_sesion]
    );
    
    if (result.rows.length === 0) {
      throw new Error('No se pudo finalizar la sesión');
    }
    
    return {
      id_sesion: result.rows[0].id_sesion,
      duracion_segundos: result.rows[0].duracion_segundos
    };
  } catch (error) {
    console.error('Error al finalizar sesión:', error);
    throw new Error('No se pudo finalizar la sesión');
  }
}