/*"use server"
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
}*/
"use server"
import { Pool } from 'pg';

interface Room {
  id: string;
  name: string;
}

// Crear un pool de conexiones a la base de datos
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // O usa configuración individual:
  // user: process.env.POSTGRES_USER,
  // host: process.env.POSTGRES_HOST,
  // database: process.env.POSTGRES_DATABASE,
  // password: process.env.POSTGRES_PASSWORD,
  // port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export async function getRooms(): Promise<Room[]> {
    console.log("getRooms");
    try {
        const result = await pool.query('SELECT id, name FROM rooms');
        
        console.log(`Encontradas ${result.rows.length} salas`);
        
        if (result.rows.length === 0) {
            console.log("No se encontraron salas");
            return []; // Devolver array vacío en lugar de lanzar error
        }

        return result.rows;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        // Lanzar un error genérico o devolver un array vacío
        return [];
    }
}