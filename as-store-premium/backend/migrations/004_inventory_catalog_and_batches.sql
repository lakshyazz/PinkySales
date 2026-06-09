-- Additive catalog reference data, visibility settings, and price-batch inventory.
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colours (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_batches (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12, 2),
  wholesale_price NUMERIC(12, 2),
  official_price NUMERIC(12, 2),
  retail_price NUMERIC(12, 2),
  colour TEXT,
  quantity_received INTEGER NOT NULL CHECK (quantity_received >= 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  source_key TEXT UNIQUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_batch_allocations (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  batch_id INTEGER NOT NULL REFERENCES inventory_batches(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchase_price NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES
  ('Display'),
  ('OCA GLASS & TOUCH'),
  ('TOOLS'),
  ('BATTERY'),
  ('MIDDLE FRAME'),
  ('BACK GLASS')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name)
SELECT DISTINCT category FROM products
WHERE NULLIF(TRIM(category), '') IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO colours (name) VALUES
  ('Black'), ('White'), ('Blue'), ('Red'), ('Green'), ('Purple'), ('Gold'),
  ('Silver'), ('Grey'), ('Yellow'), ('Orange'), ('Pink'), ('Brown'),
  ('Navy Blue'), ('Sky Blue'), ('Rose Gold'), ('Midnight Black'),
  ('Transparent'), ('Multi Colour')
ON CONFLICT (name) DO NOTHING;

INSERT INTO colours (name)
SELECT DISTINCT colour
FROM products, UNNEST(colours) AS colour
WHERE NULLIF(TRIM(colour), '') IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO brands (name)
SELECT DISTINCT brand FROM products
WHERE NULLIF(TRIM(brand), '') IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('show_official_price_shopkeeper', 'true'),
  ('show_wholesale_price_shopkeeper', 'false'),
  ('show_purchase_price_shopkeeper', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO inventory_batches (
  shop_id, product_id, purchase_price, wholesale_price, official_price, retail_price,
  quantity_received, quantity_remaining, received_date, notes, source_key
)
SELECT
  st.shop_id, st.product_id, p.purchase_price, p.wholesale_price, p.official_price, p.retail_price,
  st.quantity, st.quantity, CURRENT_DATE, 'Legacy stock balance', 'legacy-stock-' || st.id
FROM stock st
JOIN products p ON p.id = st.product_id
WHERE st.quantity > 0
ON CONFLICT (source_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS inventory_batches_shop_product_idx
  ON inventory_batches (shop_id, product_id, received_date, id);
CREATE INDEX IF NOT EXISTS inventory_batches_assigned_user_idx
  ON inventory_batches (assigned_user_id) WHERE assigned_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS inventory_batches_remaining_idx
  ON inventory_batches (shop_id, product_id, quantity_remaining) WHERE quantity_remaining > 0;
CREATE INDEX IF NOT EXISTS sale_batch_allocations_sale_idx ON sale_batch_allocations (sale_id);
CREATE INDEX IF NOT EXISTS sale_batch_allocations_batch_idx ON sale_batch_allocations (batch_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colours ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_batch_allocations ENABLE ROW LEVEL SECURITY;
