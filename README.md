# Open Shop

A responsive Next.js marketplace storefront inspired by the OpenShop WordPress theme in `open-shop.1.7.5.zip`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `npm run build` creates the production build and `npm start` serves it.

## Deploy to Cloudflare Workers

This project uses the OpenNext Cloudflare adapter. The Wrangler build hook runs the OpenNext build automatically before deployment, so both `npx wrangler deploy` and `npm run deploy` work. For a local Workers preview, run `npm run preview`.

The current released adapter does not yet inline Next.js 16.4's `preview-props.json` manifest. The postinstall script applies the upstream one-line manifest-glob fix so dynamic routes work on Workers. Remove that workaround after a released adapter version includes the fix.

## Storefront features

- Marketplace home page with category navigation, featured finds, new arrivals, best sellers, and independent seller spotlights.
- Product catalog with text search, category, seller, sale, broad RWF price range, and sort filters, including real estate and quincaillerie/building materials.
- 46 seed listings across 19 marketplace categories, including property sales and rentals, construction supplies, food, furniture, appliances, electronics, auto, agriculture, office, family, health, and sports products.
- Product detail pages with seller profiles, product options, property facts and viewing enquiries, related finds, and reviews.
- Browser-persisted cart and wishlist, quantity controls, RWF coupon discounts, shipping estimates, checkout, order confirmation, and local order history.
- Seller directory and storefront pages, seller interest form, account profile, contact form, help pages, and journal.
- Responsive layouts for desktop and mobile.
- Open Shop admin console at `/admin`, with catalog editing, local demo order status management, seller enquiries, customer summaries, and RWF analytics styled from the TailwindAdmin template.
- Coupon management at `/admin/coupons`, with percentage, fixed amount, and free delivery offers, minimum spend, maximum discount, expiry, category targeting, and activation controls. Seed codes include `KARIBU10`, `OPEN5000`, `FREESHIP`, `QUINCA10`, `ISOKO5`, and `HOME15`.

## Supabase accounts and remaining demo data

Email/password signup and login use Supabase Auth. Profiles and role assignments are protected by database policies, and `/admin` is restricted to Super admins. The first signup is Super admin, the second is Seller, and later signups are Clients. Run the SQL and URL callback setup in [database/supabase-setup.md](database/supabase-setup.md) before enabling signup on a live site.

All displayed prices use Rwandan francs (RWF). Catalog and seller seed data live in `lib/catalog.js`. Cart, wishlist, orders, product edits, coupons, banners, storefront settings, and seller enquiries still use browser `localStorage`. Checkout is a demo: it does not collect payment, create database orders, or notify sellers. The remaining marketplace data and workflows need migration to Supabase before they are shared between browsers or used for real sales.

The theme archive includes a screenshot with the shoe banner but no separate product photo library. The banner and sneaker listing reuse crops from that theme screenshot; other marketplace items use local SVG illustrations or category symbols.
