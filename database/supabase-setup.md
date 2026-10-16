# Supabase setup

The app reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.local`. Those names are already configured in this workspace. Keep publishable keys in the browser; never put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable.

## Initialize auth and roles

1. In the Supabase Dashboard, open **SQL Editor** for this project.
2. Run [`supabase-auth.sql`](./supabase-auth.sql).
3. In **Authentication → URL Configuration**, allow the local callback `http://localhost:3000/auth/callback` and the matching callback URL for the deployed site.
4. Before making `/signup` public, create the intended first account. The first account is assigned **Super admin**, the second **Seller**, and later accounts **Client**. Pending email-confirmation accounts count as signups.
5. Sign in as the first account and open `/admin/users` to change registered users' roles. The database prevents removing the last Super admin.

The first two account roles are assigned atomically in the database. Because the first public signup receives full control, keep registration private until the intended Super admin account has been created. The database role is not taken from editable user metadata, and the app blocks `/admin` for other roles.

## Current integration boundary

This setup connects Supabase Auth and the protected profile/role records. Catalog, orders, coupons, advertising content, seller enquiries, and storefront settings still use the existing demo data/local browser storage and need their own application data migration before they are shared between browsers.
