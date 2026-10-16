# Supabase setup

The app reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.local`. Those names are already configured in this workspace. Keep publishable keys in the browser; never put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable.

## Initialize auth and roles

1. In the Supabase Dashboard, open **SQL Editor** for this project.
2. Run or re-run [`supabase-auth.sql`](./supabase-auth.sql). It is safe to re-run and adds missing auth and seller-store objects without replacing existing store edits.
3. In **Authentication → URL Configuration**, allow the local callback `http://localhost:3000/auth/callback` and the matching callback URL for the deployed site.
4. Before making `/signup` public, create the intended first account. The first account is assigned **Super admin**, the second **Seller**, and later accounts **Client**. Pending email-confirmation accounts count as signups.
5. Sign in as the first account and open `/admin/users` to change registered users' roles. The database prevents removing the last Super admin.

The same SQL file creates `public.seller_stores`, imports 20 sample store listings once, and grants public read access only to active store cards. Only super admins can create, edit, suspend, close, or delete store listings. They can link a listing to an account after assigning that account the **Seller** role on `/admin/users`. The table uses explicit Data API grants and RLS policies.

## Shared marketplace data and campaign media

1. Run [`supabase-marketplace.sql`](./supabase-marketplace.sql) after `supabase-auth.sql`. It creates the shared product catalog, campaign records, storefront settings and coupons, plus the public `marketplace-media` Storage bucket. It also adds the missing campaign columns when `ad_campaigns` was created earlier from `database/schema.sql`, and uses that schema's integer campaign IDs and `cta_text`/`destination_url`/`youtube_url` fields. It seeds 20 products, 20 campaigns, 20 coupons, and the storefront settings document. The auth migration seeds 20 seller storefronts. Only a signed-in super admin can change those records or upload/delete media; public visitors can read active listings and campaigns.
2. Sign in as the super admin and open **Admin → Campaigns**. Choose **Import demo data to Supabase** once to copy the existing sample products, campaigns, coupons and storefront settings into the database. The importer also transfers product and campaign image files from the deployed site's `/public/images` paths into the Storage bucket and saves their Storage URLs in the records. It is safe to retry: existing sample rows are left as-is, including later admin edits.
3. New campaign and product images are uploaded to Storage by the admin forms. Public campaign display and product browsing read active rows from Supabase, not browser storage.

After the import, verify the persisted records in SQL Editor:

```sql
SELECT
  (SELECT count(*) FROM public.catalog_products) AS products,
  (SELECT count(*) FROM public.ad_campaigns) AS campaigns,
  (SELECT count(*) FROM public.store_coupons) AS coupons,
  (SELECT count(*) FROM public.seller_stores) AS seller_stores,
  (SELECT count(*) FROM public.storefront_settings WHERE setting_key = 'main') AS storefront_settings,
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'marketplace-media') AS stored_images;
```

The Storage bucket holds the image bytes; Postgres holds campaign/product metadata and the Storage URLs. Supabase Storage uses object storage for file content and its database schema for object metadata. [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) · [Storage architecture](https://supabase.com/docs/guides/storage/architecture)

The first two account roles are assigned atomically in the database. Because the first public signup receives full control, keep registration private until the intended Super admin account has been created. The database role is not taken from editable user metadata, and the app blocks `/admin` for other roles.

## Remaining browser-only state

Cart contents, wishlist selections, delivery district preference and the current demo checkout/order-history flow still use browser storage. They are user/session state rather than shared seed catalog content and are not moved by this marketplace seed import.
