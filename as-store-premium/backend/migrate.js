import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10_000,
  query_timeout: 30_000,
});

try {
  const files = (await readdir(new URL('./migrations/', import.meta.url)))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await readFile(new URL(`./migrations/${file}`, import.meta.url), 'utf8');
    await pool.query(sql);
    console.log(`[Migration] Applied ${file}`);
  }
} finally {
  await pool.end();
}
