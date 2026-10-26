-- Run only after public/Products/<slug>/{01,02,03}.png exists in the deployed app.
-- This changes only the 20 current seed rows read by the Open Shop storefront.
-- Each array intentionally points to three copies of the same user-supplied image.
WITH current_seed_products AS (
  SELECT id, slug
  FROM public.catalog_products
  WHERE id IN (
    'seed-extra-001', 'seed-extra-002', 'seed-extra-003', 'seed-extra-004', 'seed-extra-005',
    'seed-extra-006', 'seed-extra-007', 'seed-extra-008', 'seed-extra-009', 'seed-extra-010',
    'seed-extra-011', 'seed-extra-012', 'seed-extra-013', 'seed-extra-014', 'seed-extra-015',
    'seed-extra-016', 'seed-extra-017', 'seed-extra-018', 'seed-extra-019', 'seed-extra-020'
  )
  ORDER BY id
  LIMIT 20
)
UPDATE public.catalog_products AS product
SET photos = jsonb_build_array(
  '/Products/' || current_seed_products.slug || '/01.png',
  '/Products/' || current_seed_products.slug || '/02.png',
  '/Products/' || current_seed_products.slug || '/03.png'
)
FROM current_seed_products
WHERE product.id = current_seed_products.id;
