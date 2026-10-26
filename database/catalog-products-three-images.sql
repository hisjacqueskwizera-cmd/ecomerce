-- Apply after database/catalog-product-image-paths.sql has synchronized all rows.
BEGIN;
ALTER TABLE public.catalog_products ALTER COLUMN photos DROP DEFAULT;
ALTER TABLE public.catalog_products DROP CONSTRAINT IF EXISTS catalog_products_exactly_three_images;
ALTER TABLE public.catalog_products
  ADD CONSTRAINT catalog_products_exactly_three_images
  CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) = 3)
  NOT VALID;
ALTER TABLE public.catalog_products VALIDATE CONSTRAINT catalog_products_exactly_three_images;
COMMIT;
