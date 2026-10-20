# Open Shop Rwanda - agreements audit and implementation note

## Scope and files reviewed

The audit covered the business plan (all seven pages), `README.md`, `package.json`, `app/admin/layout.jsx`, `app/admin/page.jsx`, `app/admin/sellers/page.jsx`, `app/admin/banners/page.jsx`, `app/admin/coupons/page.jsx`, `app/sell/page.jsx`, `app/admin/vendors/page.jsx`, `components/AdminShell.jsx`, relevant Supabase client/server helpers and the marketplace, auth, and legacy schema/setup files under `database/`. The review also checked the existing seller, product, campaign, coupon, and authentication routes/components and project file inventory.

## Findings

- The app is a Next.js 16 / React 19 JavaScript marketplace deployed through OpenNext for Cloudflare. Dependencies include Supabase SSR and JS clients. No PDF/document library, document template, agreement route, or persistent contract archive existed.
- Public seller onboarding is an interest form. The admin Sellers screen can maintain shared `seller_stores` records and review browser-local enquiries. It does not collect contractual registration, TIN, payout, signature, or consent records.
- Shared Supabase tables cover profiles/roles, seller stores, catalog products, coupons, storefront settings, and campaign display metadata. Campaign management and storefront banners are not ad booking, billing, contract, attribution, or reporting workflows.
- The admin layout checks the authenticated Supabase profile role and only renders for `super_admin`. Existing Supabase RLS/policies protect shared marketplace data. Browser-local seller enquiries, demo orders, and several storefront workflows are not shared production records.
- README and the business plan both state checkout is a prototype: no production payment, shared order ledger, payout/reconciliation, refund workflow, or campaign attribution is implemented. A fixed seller payout cadence cannot truthfully be promised from the current system.
- Existing Open Shop branding is text-based in the admin console; no approved logo asset suitable for legal documents was present. The PDFs use a restrained text header and the existing blue palette.
- There is no `test`, lint, or type-check script in `package.json`; the project is JavaScript rather than TypeScript. The production build is the available automated project check.

## Business-plan comparison

The plan dated 15 October 2026 describes free first-year onboarding and a 10% completed-sale commission. Updated instructions replace that seller commercial model with either 5% commission or the fixed RWF 50,000 monthly / RWF 500,000 annual-upfront subscription. The agreements use only the updated terms. The business plan's proposed monthly display rates are retained: RWF 150,000 top banner; RWF 90,000 for each side banner; RWF 60,000 product-grid card; RWF 50,000 product-detail card; and RWF 350,000 full bundle versus RWF 440,000 individual placements. It also proposes RWF 75,000 sponsored videos, RWF 120,000 hosted live features, and a 25% founding offer on the full bundle. Advertising prices and the founding offer remain explicitly subject to business confirmation.

## Implementation

- Added an admin-only agreement screen at `/admin/agreements` with independent seller and advertiser forms.
- Added an authenticated API route that repeats the super-admin role check before generating documents, validates required fields and commercial selections, and returns a private, non-cacheable PDF response.
- Added a dependency-free PDF writer with page breaks, numbered sections, tables, versioned page footers, a text brand header, and printable signatures. User data stays in the current request and is not stored.
- Generated separate blank-template PDFs in the project root. The application generator produces completed static PDFs for download; it does not claim electronic signatures or retain signed records.
- Added advertising calculations: monthly term is at least three months; annual service costs ten monthly rates for twelve months; annual and founding discounts cannot stack; the founding offer needs documented business approval and discounts the first three months only; social add-ons are priced separately. Seller plans are mutually exclusive, and collaboration permissions each require accepted or declined.

## Security and operational limits

Contract PDFs and party details may contain personal or business-sensitive data. Generation therefore requires a super-admin session, response caching is disabled, and no contract is written to public storage or a database. The system has no secure contract archive, signing workflow, document access log, payment ledger, or retention policy. Store signed agreements through a separately approved, access-controlled document process before using this feature as a records system. The UI does not prefill profile or seller data from Supabase, avoiding accidental disclosure and unreliable matches.

## Review items before execution

Open Shop's registered contracting entity, registration number, TIN, address, signatory authority, payout cadence, permitted processor deductions, exact subscription invoice/renewal practice, tax treatment, and campaign rate card require business verification. The legal drafts flag review of consumer rights, returns, product liability, data protection, marketing/image permissions, termination/refunds, dispute resolution, applicable law, and the three-month advertiser commitment by a qualified Rwandan lawyer and accountant. Counsel should check the current consumer-protection legislation, including the [MINICOM-published Official Gazette dated 4 March 2026](https://www.minicom.gov.rw/fileadmin/user_upload/Minicom/Publications/Laws/Consumer_Protection/OG_n___Special_of_04.03.2026__Ihiganwa_mu_bucuruzi_no_kurengera_umuguzi.pdf). Registration and legal fields remain placeholders until verified. The app cannot operationally reconcile commissions or campaign results today.

## Verification status

- Generated the seller template PDF (4 pages) and advertising template PDF (3 pages). Programmatic checks confirmed readable embedded text, non-empty pages, placeholders, selected-plan labels, key clauses, page numbering, and signature content. The PDFs use ASCII-safe text, wrapped text lines, A4 page geometry, and keep signature blocks together.
- Pricing checks passed for the RWF 440,000 individual-placement sum, RWF 1,050,000 three-month bundle, RWF 3,500,000 annual bundle, and RWF 787,500 approved three-month founding bundle. Document-content checks passed for the RWF 500,000 annual seller subscription and RWF 600,000 monthly equivalent.
- `node --check` passed for the PDF generator and API route; `git diff --check` passed. No `test`, lint, or type-check script exists in the project.
- `npm run build` could not run because `node_modules/.bin/next` and the installed `node_modules/next` package are absent. An offline `npm ci` could not resolve uncached packages, and a normal `npm ci` did not complete in the network-restricted environment. The application build and JSX bundling therefore remain unverified here.
- PDF page streams and their layout bounds were inspected structurally. Headless Chrome produced a blank image for the built-in PDF viewer, and no working local PDF rasterizer was available, so pixel-level rendering inspection could not be completed.
