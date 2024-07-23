"use server"
import { sql } from '@vercel/postgres';

export async function getRooms() {
    console.log("getRooms");
    const { rows } = await sql`
        SELECT id, name
        FROM rooms
    `;

    if (rows.length === 0) {
        throw new Error(`No rooms found`);
    }

    return rows;
}