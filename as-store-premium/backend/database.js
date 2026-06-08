import pg from 'pg';
import bcrypt from 'bcryptjs';

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

  if (process.env.SEED_DEFAULT_ADMIN === 'true') {
    await seedUser({ username: 'superadmin', password: 'superadmin123', role: 'superadmin', name: 'Super Admin', contact: '9999999999' });
    await runQuery("UPDATE users SET name = 'Super Admin' WHERE username = 'superadmin' AND name = 'Father - Super Admin';");
  }
  
  console.log('[Database] PostgreSQL database connection ready.');
};
