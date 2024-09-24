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
"use server"
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
}
