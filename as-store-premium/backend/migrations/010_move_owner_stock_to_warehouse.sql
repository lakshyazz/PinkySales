-- Move only unassigned owner inventory into the central Warehouse.
-- Shopkeeper-assigned batches remain in their branches.
DO $$
DECLARE
  warehouse_id INTEGER;
BEGIN
  SELECT id INTO warehouse_id FROM shops WHERE location_type = 'warehouse' ORDER BY id LIMIT 1;

  IF warehouse_id IS NOT NULL THEN
    UPDATE inventory_batches
    SET shop_id = warehouse_id
    WHERE assigned_user_id IS NULL
      AND shop_id <> warehouse_id;

    UPDATE stock st
    SET quantity = COALESCE((
      SELECT SUM(ib.quantity_remaining)
      FROM inventory_batches ib
      WHERE ib.shop_id = st.shop_id AND ib.product_id = st.product_id
    ), 0),
    updated_at = CURRENT_TIMESTAMP;
  END IF;
END $$;
