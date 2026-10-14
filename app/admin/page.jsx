"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { money, products as seedProducts, categories } from "../../lib/catalog";
import { ADMIN_ORDERS_KEY, ADMIN_PRODUCTS_KEY, readStored } from "../../lib/admin-data";

function SalesChart({ orders }) {
  const points = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const total = orders.filter(order => { const placed = new Date(order.placedAt); return placed.getFullYear() === date.getFullYear() && placed.getMonth() === date.getMonth() && order.status !== "Cancelled"; }).reduce((sum, order) => sum + Number(order.total || 0), 0);
      return { label: date.toLocaleDateString("en", { month: "short" }), total };
    });
  }, [orders]);
  if (!orders.length) return <div className="admin-chart-empty"><div><b>No order activity yet</b>New orders from this browser will appear here.</div></div>;
  const max = Math.max(...points.map(point => point.total), 1);
  const coords = points.map((point, index) => `${26 + index * 67},${156 - (point.total / max) * 122}`).join(" ");
  const area = `M ${coords.split(" ").join(" L ")} L 361,164 L 26,164 Z`;
  return <div className="admin-sales-chart"><svg viewBox="0 0 390 180" preserveAspectRatio="none" aria-label="Revenue over the last six months"><defs><linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5d87ff" stopOpacity=".2"/><stop offset="1" stopColor="#5d87ff" stopOpacity="0"/></linearGradient></defs>{[34,75,116,157].map(y => <line key={y} className="admin-chart-grid" x1="20" y1={y} x2="370" y2={y}/>)}<path className="admin-chart-area" d={area}/><polyline className="admin-chart-line" points={coords}/>{points.map((point, index) => <g key={point.label}><circle className="admin-chart-dot" cx={26 + index * 67} cy={156 - (point.total / max) * 122} r="4"/><text className="admin-chart-label" x={26 + index * 67} y="177" textAnchor="middle">{point.label}</text></g>)}</svg></div>;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState(seedProducts);
  useEffect(() => { setOrders(readStored(ADMIN_ORDERS_KEY, [])); setAdminProducts(readStored(ADMIN_PRODUCTS_KEY, seedProducts)); }, []);
  const revenue = orders.filter(order => order.status !== "Cancelled").reduce((sum, order) => sum + Number(order.total || 0), 0);
  const customers = new Set(orders.map(order => order.email).filter(Boolean)).size;
  const stock = adminProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const latest = [...orders].sort((a,b) => new Date(b.placedAt) - new Date(a.placedAt)).slice(0, 5);
  const categoryCounts = categories.map(category => ({ category, count: adminProducts.filter(product => product.category === category).length })).filter(item => item.count).sort((a,b) => b.count-a.count).slice(0, 4);

  return <>
    <div className="admin-page-heading"><div><h1>Marketplace overview</h1><p>Monitor Open Shop sales, products, sellers, and customers.</p></div><Link className="admin-primary" href="/">↗ <span>View storefront</span></Link></div>
    <section className="admin-kpis">
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Total revenue</span><span className="admin-kpi-icon">R</span></div><strong>{money(revenue)}</strong><small>{orders.length ? `${orders.length} orders in this browser` : "Revenue from placed orders"}</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Total orders</span><span className="admin-kpi-icon">▤</span></div><strong>{orders.length.toLocaleString("en-RW")}</strong><small>{orders.filter(order => order.status === "Pending").length} need attention</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Products listed</span><span className="admin-kpi-icon">◇</span></div><strong>{adminProducts.length}</strong><small>{stock} units in sample inventory</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Customers</span><span className="admin-kpi-icon">♧</span></div><strong>{customers}</strong><small>Unique customer emails</small></article>
    </section>

    <section className="admin-dashboard-grid">
      <article className="admin-card admin-sales-card"><div className="admin-card-title"><div><h2>Sales overview</h2><p>Order revenue over the last six months</p></div><span className="admin-status shipped">RWF</span></div><div className="admin-sales-stats"><span>Revenue<b>{money(revenue)}</b></span><span>Orders<b>{orders.length}</b></span><span>Average order<b>{money(orders.length ? revenue / orders.length : 0)}</b></span></div><SalesChart orders={orders}/><div className="admin-chart-legend"><span><i/> Order revenue · RWF</span></div></article>
      <article className="admin-card"><div className="admin-card-title"><div><h2>Catalog snapshot</h2><p>Products by category</p></div><Link href="/admin/products">Manage</Link></div><div className="admin-breakdown">{categoryCounts.length ? categoryCounts.map((item, index) => <div className="admin-breakdown-row" key={item.category}><span className="admin-breakdown-icon">{["◇","◈","▱","◉"][index]}</span><span className="admin-breakdown-info"><b>{item.category}</b><small>{item.count} active products</small></span><strong>{Math.round(item.count / adminProducts.length * 100)}%</strong></div>) : <div className="admin-empty">No products in this category.</div>}<Link className="admin-breakdown-link" href="/admin/products">View all products →</Link></div></article>
    </section>

    <section className="admin-card"><div className="admin-card-title"><div><h2>Recent orders</h2><p>Latest orders placed from this browser</p></div><Link href="/admin/orders">View all orders →</Link></div>{latest.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DELIVERY DISTRICT</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{latest.map(order => <tr key={order.reference}><td><strong>{order.reference}</strong></td><td>{order.name}</td><td>{order.district || "—"}</td><td>{new Date(order.placedAt).toLocaleDateString()}</td><td><strong>{money(order.total)}</strong></td><td><span className={`admin-status ${(order.status || "Pending").toLowerCase()}`}>{order.status || "Pending"}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty">No orders yet. Place a demo order in the storefront to see it here.</div>}</section>
  </>;
}
