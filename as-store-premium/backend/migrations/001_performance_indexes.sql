-- Non-destructive indexes for the authenticated dashboard and shop-scoped routes.
CREATE INDEX IF NOT EXISTS customers_shop_id_idx ON customers (shop_id);
CREATE INDEX IF NOT EXISTS payments_sale_id_idx ON payments (sale_id);
CREATE INDEX IF NOT EXISTS products_active_brand_name_idx ON products (is_active, brand, name);
CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON sales (customer_id);
CREATE INDEX IF NOT EXISTS sales_product_id_idx ON sales (product_id);
CREATE INDEX IF NOT EXISTS sales_shop_id_sale_date_idx ON sales (shop_id, sale_date);
CREATE INDEX IF NOT EXISTS sales_shop_id_due_date_pending_idx ON sales (shop_id, due_date) WHERE pending_amount > 0;
CREATE INDEX IF NOT EXISTS shops_status_idx ON shops (status);
CREATE INDEX IF NOT EXISTS stock_product_id_idx ON stock (product_id);
CREATE INDEX IF NOT EXISTS stock_requests_shop_id_status_idx ON stock_requests (shop_id, status);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_id_idx ON audit_logs (actor_id, id DESC);
