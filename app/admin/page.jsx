import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabase/server";

const ranges = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["month", "This month"],
  ["custom", "Custom range"],
];

function dayStart(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function isoDay(value) {
  return value.toISOString().slice(0, 10);
}

function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = dayStart(value);
  return Number.isFinite(parsed.valueOf()) && isoDay(parsed) === value;
}

function getPeriod(params) {
  const today = new Date();
  const todayKey = isoDay(today);
  const selected = ranges.some(([key]) => key === params.range) ? params.range : "30d";
  let from;
  let to = todayKey;

  if (selected === "custom" && validDay(params.from) && validDay(params.to) && params.from <= params.to) {
    from = params.from;
    to = params.to;
  } else if (selected === "today") {
    from = todayKey;
  } else if (selected === "7d") {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6);
    from = isoDay(start);
  } else if (selected === "month") {
    from = isoDay(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  } else {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 29);
    from = isoDay(start);
  }

  return { selected, from, to, nextDay: isoDay(new Date(dayStart(to).valueOf() + 86400000)) };
}

async function exactCount(supabase, table, filters = []) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [method, column, value] of filters) query = query[method](column, value);
  return query;
}

function CountCard({ title, count, detail, href, error }) {
  return <article className="admin-card admin-kpi">
    <div className="admin-kpi-top"><span>{title}</span><span className="admin-kpi-icon">{error ? "!" : "#"}</span></div>
    <strong>{error ? "Unavailable" : Number(count || 0).toLocaleString("en-RW")}</strong>
    <small>{error ? "Could not read this table" : detail}</small>
    {href && <Link className="admin-kpi-link" href={href}>Manage</Link>}
  </article>;
}

export default async function AdminDashboard({ searchParams }) {
  const params = await searchParams;
  const period = getPeriod(params || {});
  const supabase = await createSupabaseServerClient();

  const [products, activeProducts, lowStock, outOfStock, stores, activeStores, pendingStores, newProducts, newStores, recentProducts, recentStores] = await Promise.all([
    exactCount(supabase, "catalog_products"),
    exactCount(supabase, "catalog_products", [["eq", "active", true]]),
    exactCount(supabase, "catalog_products", [["gt", "stock", 0], ["lte", "stock", 5]]),
    exactCount(supabase, "catalog_products", [["eq", "stock", 0]]),
    exactCount(supabase, "seller_stores"),
    exactCount(supabase, "seller_stores", [["eq", "status", "active"]]),
    exactCount(supabase, "seller_stores", [["eq", "status", "pending"]]),
    exactCount(supabase, "catalog_products", [["gte", "created_at", `${period.from}T00:00:00.000Z`], ["lt", "created_at", `${period.nextDay}T00:00:00.000Z`]]),
    exactCount(supabase, "seller_stores", [["gte", "created_at", `${period.from}T00:00:00.000Z`], ["lt", "created_at", `${period.nextDay}T00:00:00.000Z`]]),
    supabase.from("catalog_products").select("id,name,slug,seller,category,stock,active,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("seller_stores").select("id,name,slug,status,location,created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const results = [products, activeProducts, lowStock, outOfStock, stores, activeStores, pendingStores, newProducts, newStores, recentProducts, recentStores];
  const errors = results.filter(result => result.error).map(result => result.error);
  const rangeLabel = ranges.find(([key]) => key === period.selected)?.[1] || "Last 30 days";

  return <>
    <div className="admin-page-heading">
      <div><h1>Marketplace overview</h1><p>Live inventory and vendor status from the marketplace database.</p></div>
      <Link className="admin-primary" href="/">View storefront</Link>
    </div>

    <form className="admin-toolbar admin-period-toolbar" action="/admin">
      <label htmlFor="admin-period">New records</label>
      <select id="admin-period" name="range" defaultValue={period.selected}>
        {ranges.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <label htmlFor="admin-from">From</label>
      <input id="admin-from" name="from" type="date" defaultValue={period.from} />
      <label htmlFor="admin-to">To</label>
      <input id="admin-to" name="to" type="date" defaultValue={period.to} />
      <button className="admin-secondary" type="submit">Apply</button>
      <span className="admin-count">{period.from} to {period.to}</span>
    </form>

    {errors.length > 0 && <div className="admin-data-error" role="alert">
      <strong>Some marketplace data could not be loaded.</strong>
      <span>Check that the Supabase marketplace setup has been applied and that its admin policies are active.</span>
    </div>}

    <section className="admin-kpis" aria-label="Marketplace inventory">
      <CountCard title="Products" count={products.count} detail="All catalog listings" href="/admin/products" error={products.error} />
      <CountCard title="Published products" count={activeProducts.count} detail="Visible in the storefront" href="/admin/products" error={activeProducts.error} />
      <CountCard title="Low stock" count={lowStock.count} detail="Between 1 and 5 units" href="/admin/products" error={lowStock.error} />
      <CountCard title="Out of stock" count={outOfStock.count} detail="Listings with zero units" href="/admin/products" error={outOfStock.error} />
    </section>

    <section className="admin-kpis admin-vendor-kpis" aria-label="Vendor stores">
      <CountCard title="Vendor stores" count={stores.count} detail="All registered storefronts" href="/admin/sellers" error={stores.error} />
      <CountCard title="Active stores" count={activeStores.count} detail="Currently active" href="/admin/sellers" error={activeStores.error} />
      <CountCard title="Applications to review" count={pendingStores.count} detail="Stores with pending status" href="/admin/sellers" error={pendingStores.error} />
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>New in {rangeLabel.toLowerCase()}</span><span className="admin-kpi-icon">+</span></div><strong>{newProducts.error || newStores.error ? "Unavailable" : `${Number(newProducts.count || 0)} / ${Number(newStores.count || 0)}`}</strong><small>Products / stores created in this period</small></article>
    </section>

    <section className="admin-dashboard-grid">
      <article className="admin-card">
        <div className="admin-card-title"><div><h2>Recent products</h2><p>Latest records in the shared catalog</p></div><Link href="/admin/products">Manage products</Link></div>
        {recentProducts.error ? <div className="admin-empty">Product records are unavailable. Check the Supabase table and access policies.</div> : recentProducts.data?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>STORE</th><th>CATEGORY</th><th>STOCK</th><th>STATUS</th></tr></thead><tbody>{recentProducts.data.map(product => <tr key={product.id}><td><strong>{product.name}</strong><small className="admin-order-items">{product.slug}</small></td><td>{product.seller}</td><td>{product.category}</td><td>{product.stock}</td><td><span className={`admin-status ${product.active ? "shipped" : "cancelled"}`}>{product.active ? "Published" : "Hidden"}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty">No product records are in the shared catalog yet.</div>}
      </article>
      <article className="admin-card">
        <div className="admin-card-title"><div><h2>Recent vendor stores</h2><p>Latest store registrations and their review status</p></div><Link href="/admin/sellers">Manage sellers</Link></div>
        {recentStores.error ? <div className="admin-empty">Vendor records are unavailable. Check the Supabase table and access policies.</div> : recentStores.data?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>STORE</th><th>LOCATION</th><th>STATUS</th><th>CREATED</th></tr></thead><tbody>{recentStores.data.map(store => <tr key={store.id}><td><strong>{store.name}</strong><small className="admin-order-items">/{store.slug}</small></td><td>{store.location || "—"}</td><td><span className={`admin-status ${(store.status || "pending").toLowerCase()}`}>{store.status}</span></td><td><time dateTime={store.created_at}>{String(store.created_at || "").slice(0, 10) || "—"}</time></td></tr>)}</tbody></table></div> : <div className="admin-empty">No vendor stores are in the shared database yet.</div>}
      </article>
    </section>

    <section className="admin-card admin-unsupported-metrics">
      <div className="admin-card-title"><div><h2>Orders and financial reporting</h2><p>These figures are intentionally omitted until they come from persisted marketplace transactions.</p></div></div>
      <p>The connected Supabase marketplace schema currently has no shared orders, payment, refund, commission, payout, or audit tables. The old browser-local demo orders are not used for these production metrics.</p>
    </section>
  </>;
}
