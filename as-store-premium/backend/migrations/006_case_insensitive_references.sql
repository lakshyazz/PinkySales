-- Collapse reference names that differ only by casing or surrounding whitespace.
WITH canonical AS (
  SELECT LOWER(TRIM(name)) AS key, MIN(id) AS keep_id
  FROM brands
  GROUP BY LOWER(TRIM(name))
)
UPDATE products p
SET brand = b.name
FROM canonical c
JOIN brands b ON b.id = c.keep_id
WHERE LOWER(TRIM(p.brand)) = c.key;

WITH canonical AS (
  SELECT LOWER(TRIM(name)) AS key, MIN(id) AS keep_id
  FROM categories
  GROUP BY LOWER(TRIM(name))
)
UPDATE products p
SET category = c2.name
FROM canonical c
JOIN categories c2 ON c2.id = c.keep_id
WHERE LOWER(TRIM(p.category)) = c.key;

WITH canonical AS (
  SELECT LOWER(TRIM(name)) AS key, MIN(id) AS keep_id
  FROM colours
  GROUP BY LOWER(TRIM(name))
)
UPDATE inventory_batches ib
SET colour = c2.name
FROM canonical c
JOIN colours c2 ON c2.id = c.keep_id
WHERE LOWER(TRIM(ib.colour)) = c.key;

DELETE FROM brands b
USING brands keep
WHERE LOWER(TRIM(b.name)) = LOWER(TRIM(keep.name))
  AND b.id > keep.id;

DELETE FROM categories c
USING categories keep
WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(keep.name))
  AND c.id > keep.id;

DELETE FROM colours c
USING colours keep
WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(keep.name))
  AND c.id > keep.id;

CREATE UNIQUE INDEX IF NOT EXISTS brands_name_case_insensitive_uidx
  ON brands (LOWER(TRIM(name)));
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_case_insensitive_uidx
  ON categories (LOWER(TRIM(name)));
CREATE UNIQUE INDEX IF NOT EXISTS colours_name_case_insensitive_uidx
  ON colours (LOWER(TRIM(name)));
