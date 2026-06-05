import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'as_store.db');
const db = new sqlite3.Database(dbPath);

export const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

export const getRecord = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
});

export const allRecords = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

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

const insertIfMissing = async (table, whereColumn, whereValue, sql, params) => {
  const existing = await getRecord(`SELECT id FROM ${table} WHERE ${whereColumn} = ?`, [whereValue]);
  if (!existing) await runQuery(sql, params);
};

export const initDatabase = async () => {
  console.log(`[Database] Initializing SQLite database at: ${dbPath}`);
  await runQuery('PRAGMA foreign_keys = ON;');

  await runQuery(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      low_stock_threshold INTEGER DEFAULT 3,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT,
      shop_id INTEGER,
      permissions TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE SET NULL
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      official_price REAL NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(shop_id, product_id),
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      customer_id INTEGER,
      quantity INTEGER DEFAULT 1,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      pending_amount REAL NOT NULL,
      due_date TEXT,
      sale_date TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      notes TEXT,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_shop_id INTEGER NOT NULL,
      to_shop_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      transfer_date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY(from_shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY(to_shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS stock_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      product_id INTEGER,
      model_name TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      message TEXT,
      status TEXT DEFAULT 'open',
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER,
      actor_name TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const column of [
    ['users', 'shop_id', 'INTEGER'],
    ['users', 'permissions', "TEXT DEFAULT '{}'"],
    ['products', 'name', 'TEXT'],
    ['products', 'brand', 'TEXT'],
    ['products', 'category', 'TEXT'],
    ['products', 'official_price', 'REAL DEFAULT 0'],
    ['products', 'description', 'TEXT'],
    ['products', 'is_active', 'INTEGER DEFAULT 1'],
    ['products', 'updated_at', 'TEXT'],
  ]) {
    try {
      await runQuery(`ALTER TABLE ${column[0]} ADD COLUMN ${column[1]} ${column[2]};`);
    } catch {
      // Existing databases already have this column.
    }
  }

  await seedUser({ username: 'superadmin', password: 'superadmin123', role: 'superadmin', name: 'Super Admin', contact: '9999999999' });
  await runQuery("UPDATE users SET name = 'Super Admin' WHERE username = 'superadmin' AND name = 'Father - Super Admin';");

  console.log('[Database] Multi-shop database ready.');
};
