import pool from '../../../lib/db.server';

export async function GET(request) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT room_id FROM rooms LIMIT 1');
    client.release();
    if (result.rows.length > 0) {
      return new Response(JSON.stringify({ roomId: result.rows[0].room_id }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'No room found in the database' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (err) {
    console.error('Error fetching room ID from database:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const GET = GET;