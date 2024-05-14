import pool from './db.server';

export async function getRoom() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT room_id FROM rooms LIMIT 1');
    client.release();
    if (result.rows.length > 0) {
      return result.rows[0].room_id;
    } else {
      console.error('No room found in the database');
      return null;
    }
  } catch (err) {
    console.error('Error fetching room ID from database:', err);
    return null;
  }
}