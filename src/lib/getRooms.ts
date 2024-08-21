/*"use server"
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
}*/
"use server"
import { sql } from '@vercel/postgres';

interface Room {
  id: string;
  name: string;
}

export async function getRooms(): Promise<Room[]> {
    console.log("getRooms");
    try {
        const { rows } = await sql<Room>`
            SELECT id, name
            FROM rooms
        `;

        if (rows.length === 0) {
            throw new Error(`No rooms found`);
        }

        return rows;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw new Error('Failed to fetch rooms');
    }
}