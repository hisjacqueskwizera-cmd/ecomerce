"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { money } from "../../../lib/catalog";
import { ADMIN_ORDERS_KEY, readStored, saveStored } from "../../../lib/admin-data";
import SearchableSelect from "../../../components/SearchableSelect";

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [expanded, setExpanded] = useState("");
  useEffect(() => setOrders(readStored(ADMIN_ORDERS_KEY, [])), []);
  function changeStatus(reference, status) {
    const next = orders.map(order => order.reference === reference ? { ...order, status } : order);
    setOrders(next); saveStored(ADMIN_ORDERS_KEY, next);
  }
  const visible = useMemo(() => [...orders].filter(order => (filter === "All statuses" || (order.status || "Pending") === filter) && `${order.reference} ${order.name} ${order.email} ${order.district}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a,b) => new Date(b.placedAt)-new Date(a.placedAt)), [orders, filter, query]);
  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return <>
    <div className="admin-page-heading"><div><h1>Orders</h1><p>Review customer purchases and update fulfillment status.</p></div></div>
    <section className="admin-kpis"><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>All orders</span><span className="admin-kpi-icon">▤</span></div><strong>{orders.length}</strong><small>Saved in this browser</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Pending</span><span className="admin-kpi-icon">◷</span></div><strong>{orders.filter(order => ["Pending", undefined].includes(order.status)).length}</strong><small>Awaiting processing</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Order value</span><span className="admin-kpi-icon">R</span></div><strong>{money(total)}</strong><small>Combined demo order total</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Delivered</span><span className="admin-kpi-icon">✓</span></div><strong>{orders.filter(order => order.status === "Delivered").length}</strong><small>Marked delivered</small></article></section>
    <div className="admin-toolbar"><input className="admin-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order, customer, or district..."/><SearchableSelect className="admin-filter" value={filter} onChange={event => setFilter(event.target.value)} options={["All statuses", ...statuses]} ariaLabel="Filter orders by status"/><span className="admin-count">{visible.length} orders</span></div>
    <section className="admin-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DELIVERY</th><th>ITEMS</th><th>DATE</th><th>TOTAL</th><th>STATUS</th><th>DETAILS</th></tr></thead><tbody>{visible.map(order => { const status = order.status || "Pending"; return <Fragment key={order.reference}><tr><td><strong>{order.reference}</strong></td><td><div className="admin-customer"><span className="admin-avatar">{(order.name || "O").split(" ").map(word => word[0]).join("").slice(0,2)}</span><span><strong>{order.name}</strong><small>{order.email}</small></span></div></td><td>{order.district ? <><strong>{order.district}</strong><small className="admin-order-items">{order.sector || ""}, Rwanda</small></> : "Rwanda"}</td><td>{order.items?.reduce((sum,item) => sum + Number(item.quantity || 0),0) || 0}</td><td>{order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "—"}</td><td><strong>{money(order.total)}</strong></td><td><SearchableSelect className="admin-filter" ariaLabel={`Status for ${order.reference}`} value={status} options={statuses} onChange={event => changeStatus(order.reference,event.target.value)}/></td><td><button className="admin-icon-button" aria-label="Toggle order details" onClick={() => setExpanded(expanded === order.reference ? "" : order.reference)}>{expanded === order.reference ? "⌃" : "⌄"}</button></td></tr>{expanded === order.reference && <tr><td colSpan="8"><div className="admin-order-items"><strong>Items ordered</strong>{order.items?.map(item => <small key={item.key || item.id}>{item.quantity} × {item.name} · {money(item.price * item.quantity)}</small>)}<small>Address: {order.address || "—"}, {order.sector || ""}, {order.district || "Rwanda"}</small><small>Phone: {order.phone || "—"} · Delivery: {money(order.shipping)}</small></div></td></tr>}</Fragment>; })}</tbody></table>{!visible.length && <div className="admin-empty">{orders.length ? "No orders match your search." : "No demo orders yet. Place an order on the storefront and it will appear here."}</div>}</div></section>
  </>;
}
