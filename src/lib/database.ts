//'use server';
import { sql } from '@vercel/postgres';

export const db = sql({
    url:process.env.POSTGRES_URL,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
});
