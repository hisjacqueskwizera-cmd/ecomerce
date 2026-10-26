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

function ratio(value, total) {
  const base = Number(total || 0);
  return base > 0 ? Math.max(0, Math.min(100, Math.round((Number(value || 0) / base) * 100))) : 0;
}

function CountCard({ title, count, detail, href, error, icon }) {
  return <article className="admin-card admin-kpi">
    <div className="admin-kpi-top"><span>{title}</span><span className="admin-kpi-icon">{error ? "!" : icon}</span></div>
    <strong>{error ? "Unavailable" : Number(count || 0).toLocaleString("en-RW")}</strong>
    <small>{error ? "Could not read this table" : detail}</small>
    {href && <Link className="admin-kpi-link" href={href}>Manage</Link>}
  </article>;
}

function RecordMark({ children, className = "" }) {
  return <span className={`admin-dashboard-record-mark ${className}`}>{children}</span>;
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
    supabase.from("catalog_products").select("id,name,slug,seller,category,stock,active,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("seller_stores").select("id,name,slug,status,location,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const results = [products, activeProducts, lowStock, outOfStock, stores, activeStores, pendingStores, newProducts, newStores, recentProducts, recentStores];
  const errors = results.filter(result => result.error).map(result => result.error);
  const rangeLabel = ranges.find(([key]) => key === period.selected)?.[1] || "Last 30 days";
  const totalProducts = Number(products.count || 0);
  const stockRows = [
    { label: "Healthy stock", count: Math.max(totalProducts - Number(lowStock.count || 0) - Number(outOfStock.count || 0), 0), tone: "healthy", available: !products.error && !lowStock.error && !outOfStock.error },
    { label: "Low stock", count: Number(lowStock.count || 0), tone: "warning", available: !products.error && !lowStock.error },
    { label: "Out of stock", count: Number(outOfStock.count || 0), tone: "empty", available: !products.error && !outOfStock.error },
  ];

  return <>
    {errors.length > 0 && <div className="admin-data-error" role="alert">
      <strong>Some marketplace data could not be loaded.</strong>
      <span>Check that the Supabase marketplace setup has been applied and that its admin policies are active.</span>
    </div>}

    <section className="admin-kpis admin-dashboard-kpis" aria-label="Marketplace snapshot">
      <CountCard title="Products" count={products.count} detail="All catalog listings" href="/admin/products" error={products.error} icon="▤" />
      <CountCard title="Published listings" count={activeProducts.count} detail="Visible in the storefront" href="/admin/products" error={activeProducts.error} icon="✓" />
      <CountCard title="Low stock" count={lowStock.count} detail="Between 1 and 5 units" href="/admin/products" error={lowStock.error} icon="!" />
      <CountCard title="Seller stores" count={stores.count} detail="Registered storefronts" href="/admin/sellers" error={stores.error} icon="⌂" />
      <CountCard title="Needs review" count={pendingStores.count} detail="Pending seller applications" href="/admin/sellers" error={pendingStores.error} icon="◷" />
    </section>

    <form className="admin-toolbar admin-period-toolbar admin-dashboard-period-toolbar" action="/admin">
      <label htmlFor="admin-period">Activity period</label>
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

    <section className="admin-dashboard-reference-grid" aria-label="Marketplace activity">
      <article className="admin-card admin-dashboard-panel admin-inventory-panel">
        <div className="admin-card-title"><div><h2>Inventory health</h2><p>Stock levels across catalog listings</p></div><Link href="/admin/products">Manage</Link></div>
        <div className="admin-dashboard-panel-content">
          <div className="admin-inventory-highlight"><strong>{outOfStock.error ? "—" : Number(outOfStock.count || 0).toLocaleString("en-RW")}</strong><span>out of stock</span></div>
          <div className="admin-stock-list">{stockRows.map(row => <div className="admin-stock-row" key={row.label}>
            <div className="admin-stock-row-label"><span>{row.label}</span><b>{row.available ? row.count.toLocaleString("en-RW") : "—"}</b></div>
            <div className="admin-stock-track"><i className={row.tone} style={{ width: `${row.available ? ratio(row.count, totalProducts) : 0}%` }}/></div>
          </div>)}</div>
          <div className="admin-dashboard-panel-foot"><span>{activeStores.error ? "—" : Number(activeStores.count || 0).toLocaleString("en-RW")}</span> active stores in the marketplace</div>
        </div>
      </article>

      <article className="admin-card admin-dashboard-panel">
        <div className="admin-card-title"><div><h2>Latest products</h2><p>Recently added to the catalog</p></div><Link href="/admin/products">All products</Link></div>
        {recentProducts.error ? <div className="admin-empty">Product records are unavailable. Check the Supabase table and access policies.</div> : recentProducts.data?.length ? <div className="admin-dashboard-record-list">{recentProducts.data.map(product => <div className="admin-dashboard-record-row" key={product.id}>
          <RecordMark>{product.name?.trim()?.[0]?.toUpperCase() || "P"}</RecordMark>
          <span className="admin-dashboard-record-copy"><b>{product.name}</b><small>{product.seller} · {product.category}</small></span>
          <span className={`admin-status ${product.active ? "shipped" : "cancelled"}`}>{product.active ? "Live" : "Hidden"}</span>
        </div>)}</div> : <div className="admin-empty">No product records are in the shared catalog yet.</div>}
      </article>

      <article className="admin-card admin-dashboard-panel">
        <div className="admin-card-title"><div><h2>Seller activity</h2><p>Store onboarding and recent registrations</p></div><Link href="/admin/sellers">Manage sellers</Link></div>
        <div className="admin-seller-summary"><div><strong>{activeStores.error ? "—" : Number(activeStores.count || 0).toLocaleString("en-RW")}</strong><span>Active</span></div><div><strong>{pendingStores.error ? "—" : Number(pendingStores.count || 0).toLocaleString("en-RW")}</strong><span>Needs review</span></div></div>
        {recentStores.error ? <div className="admin-empty">Seller records are unavailable. Check the Supabase table and access policies.</div> : recentStores.data?.length ? <div className="admin-dashboard-record-list admin-dashboard-store-list">{recentStores.data.map(store => {
          const status = String(store.status || "pending").toLowerCase();
          const label = status.charAt(0).toUpperCase() + status.slice(1);
          return <div className="admin-dashboard-record-row" key={store.id}>
            <RecordMark className="store">{store.name?.trim()?.[0]?.toUpperCase() || "S"}</RecordMark>
            <span className="admin-dashboard-record-copy"><b>{store.name}</b><small>{store.location || "Location not listed"}</small></span>
            <span className={`admin-status ${status === "pending" ? "pending" : status === "rejected" ? "cancelled" : ""}`}>{label}</span>
          </div>;
        })}</div> : <div className="admin-empty">No seller stores are in the shared database yet.</div>}
        <div className="admin-dashboard-panel-foot">{newProducts.error || newStores.error ? "New records unavailable" : `${Number(newProducts.count || 0)} new products · ${Number(newStores.count || 0)} new stores`} · {rangeLabel.toLowerCase()}</div>
      </article>
    </section>

    <aside className="admin-reporting-note"><strong>Sales reporting</strong><span>Order and payment reports will appear when shared marketplace transaction records are connected.</span></aside>
  </>;
}
