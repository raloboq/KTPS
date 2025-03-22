/*"use server"
import { sql } from '@vercel/postgres';

export async function getExampleRoomId() {
    console.log("getExampleRoomId");
  const { rows } = await sql`
    SELECT name
    FROM rooms
  `;

  if (rows.length === 0) {
    throw new Error(`No example room found for room ID `);
  }

  return rows[0].name;
}
*/
/*"use server"
import { sql } from '@vercel/postgres';

export async function getExampleRoomId(userName: string | number | undefined) {
  console.log("getExampleRoomId for user:", userName);
  const { rows } = await sql`
    SELECT room_id, room_name
    FROM session_info
    WHERE user_name = ${userName}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(`No session found for user ${userName}`);
  }

  return { id: rows[0].room_id, name: rows[0].room_name };
}*/
"use server"
import { pool } from '@/lib/db';

export async function getExampleRoomId(userName: string | number | undefined) {
  console.log("getExampleRoomId for user:", userName);
  
  try {
    // No podemos realizar la consulta si el userName es indefinido
    if (!userName) {
      throw new Error("Nombre de usuario no proporcionado");
    }
    
    const result = await pool.query(
      `SELECT room_id, room_name
       FROM session_info
       WHERE user_name = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userName]
    );

    if (result.rows.length === 0) {
      throw new Error(`No session found for user ${userName}`);
    }

    return { id: result.rows[0].room_id, name: result.rows[0].room_name };
  } catch (error) {
    console.error("Error en getExampleRoomId:", error);
    throw error; // Re-lanzar el error para que sea manejado por el llamador
  }
}
