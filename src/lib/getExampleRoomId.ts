//import { db } from './database';

"use server"
import { sql } from '@vercel/postgres';

export async function getExampleRoomId() {
    console.log("pruebaaaaa");
    console.log(process.env.POSTGRES_URL)
    console.log(process.env)
  const { rows } = await sql`
    SELECT name
    FROM rooms
  `;

  if (rows.length === 0) {
    throw new Error(`No example room found for room ID `);
  }

  return rows[0].name;
}

/*
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})
*/