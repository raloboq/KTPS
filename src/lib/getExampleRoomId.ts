//import { db } from './database';
import { sql } from '@vercel/postgres';

export async function getExampleRoomId() {
  const { rows } = await sql`
    SELECT name
    FROM ooms
  `;

  if (rows.length === 0) {
    throw new Error(`No example room found for room ID `);
  }

  return rows[0].name;
}