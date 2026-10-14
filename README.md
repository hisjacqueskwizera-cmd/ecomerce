# Open Shop

A responsive Next.js marketplace storefront inspired by the OpenShop WordPress theme in `open-shop.1.7.5.zip`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `npm run build` creates the production build and `npm start` serves it.

## Deploy to Cloudflare Workers

This project uses the OpenNext Cloudflare adapter. In the Cloudflare Workers build settings, set the deploy command to `npm run deploy`. The adapter builds the Next.js app and deploys the generated Worker. For a local Workers preview, run `npm run preview`.

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

## Demo data and production services

All displayed prices use Rwandan francs (RWF). Catalog and seller seed data live in `lib/catalog.js`. Cart, wishlist, account details, orders, product edits, and seller enquiries use browser `localStorage` so the storefront and admin flow can be explored without a server account. Admin changes and analytics are local to the current browser. Checkout is a demo: it does not collect payment, create server-side orders, or notify sellers. A live store still needs a database, authentication, inventory and order APIs, transactional email, and a payment provider before accepting real orders.

The theme archive includes a screenshot with the shoe banner but no separate product photo library. The banner and sneaker listing reuse crops from that theme screenshot; other marketplace items use local SVG illustrations or category symbols.
