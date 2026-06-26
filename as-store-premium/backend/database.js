import pg from 'pg';
import bcrypt from 'bcryptjs';
import { readdir, readFile } from 'node:fs/promises';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 5),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  query_timeout: 20_000,
  keepAlive: true,
});

// Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2, ...)
// and append "RETURNING id" for INSERT queries if not already present
function convertSql(sql) {
  let index = 1;
  let converted = sql.replace(/\?/g, () => `$${index++}`);
  
  // Append RETURNING id to INSERT statements to fetch new row IDs
  if (converted.trim().toUpperCase().startsWith('INSERT') && !converted.toUpperCase().includes('RETURNING')) {
    converted += ' RETURNING id';
  }
  return converted;
}

export const runQuery = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  const id = res.rows && res.rows[0] ? res.rows[0].id : null;
  return { id, changes: res.rowCount };
};

export const getRecord = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  return res.rows[0] || null;
};

export const allRecords = async (sql, params = []) => {
  const pgSql = convertSql(sql);
  const res = await pool.query(pgSql, params);
  return res.rows;
};

export const runTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tx = {
      runQuery: async (sql, params = []) => {
        const pgSql = convertSql(sql);
        const res = await client.query(pgSql, params);
        const id = res.rows && res.rows[0] ? res.rows[0].id : null;
        return { id, changes: res.rowCount };
      },
      getRecord: async (sql, params = []) => {
        const pgSql = convertSql(sql);
        const res = await client.query(pgSql, params);
        return res.rows[0] || null;
      },
      allRecords: async (sql, params = []) => {
        const pgSql = convertSql(sql);
        const res = await client.query(pgSql, params);
        return res.rows;
      }
    };
    const result = await callback(tx);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const seedUser = async ({ username, password, role, name, contact = '', shopId = null, permissions = '{}' }) => {
  const existing = await getRecord('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) return existing.id;
  const hash = await bcrypt.hash(password, 10);
  const result = await runQuery(
    'INSERT INTO users (username, password, role, name, contact, shop_id, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, hash, role, name, contact, shopId, permissions]
  );
  return result.id;
};

export const initDatabase = async () => {
  console.log('[Database] Connecting to PostgreSQL database on Supabase...');
  await pool.query('SELECT 1');

  // Run migrations dynamically on startup
  try {
    const migrationsDir = new URL('./migrations/', import.meta.url);
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const migrationTableExists = await pool.query("SELECT to_regclass('public.schema_migrations') AS table_name");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (!migrationTableExists.rows[0]?.table_name) {
      const baseline = files.filter((file) => /^00[1-6]_/.test(file));
      for (const file of baseline) {
        await pool.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
        console.log(`[Migration] Baselined ${file}`);
      }
    }

    for (const file of files) {
      const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (applied.rowCount) continue;
      const sql = await readFile(new URL(`./migrations/${file}`, import.meta.url), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[Migration] Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[Migration] Failed to apply ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
  } catch (migError) {
    console.error('[Database] Dynamic migrations check failed:', migError);
  }

  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS short_name TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS full_model_list TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12, 2);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price NUMERIC(12, 2);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(12, 2);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(12, 2);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS colours TEXT[] NOT NULL DEFAULT '{}';
    UPDATE products
    SET
      full_model_list = COALESCE(NULLIF(full_model_list, ''), name),
      short_name = COALESCE(NULLIF(short_name, ''), CASE WHEN LENGTH(name) > 60 THEN TRIM(SPLIT_PART(name, '/', 1)) ELSE name END),
      sale_price = COALESCE(sale_price, official_price),
      retail_price = COALESCE(retail_price, official_price)
    WHERE full_model_list IS NULL OR short_name IS NULL OR sale_price IS NULL OR retail_price IS NULL;
    UPDATE products SET short_name = LEFT(short_name, 57) || '...' WHERE LENGTH(short_name) > 60;
    CREATE INDEX IF NOT EXISTS products_short_name_idx ON products (short_name);
  `);

  if (process.env.SEED_DEFAULT_ADMIN === 'true') {
    await seedUser({ username: 'superadmin', password: 'superadmin123', role: 'superadmin', name: 'Super Admin', contact: '9999999999' });
    await runQuery("UPDATE users SET name = 'Super Admin' WHERE username = 'superadmin' AND name = 'Father - Super Admin';");
  }
  
  console.log('[Database] PostgreSQL database connection ready.');
};
