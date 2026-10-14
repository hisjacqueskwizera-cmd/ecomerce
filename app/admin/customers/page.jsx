"use client";

import { useEffect, useMemo, useState } from "react";
import { money } from "../../../lib/catalog";
import { ADMIN_ORDERS_KEY, readStored } from "../../../lib/admin-data";

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  useEffect(() => setOrders(readStored(ADMIN_ORDERS_KEY, [])), []);
  const customers = useMemo(() => {
    const grouped = new Map();
    for (const order of orders) {
      const key = (order.email || order.name || order.reference).toLowerCase();
      const customer = grouped.get(key) || { name: order.name, email: order.email, phone: order.phone, district: order.district, orders: 0, spent: 0, lastOrder: order.placedAt };
      customer.orders += 1; customer.spent += Number(order.total || 0);
      if (new Date(order.placedAt) > new Date(customer.lastOrder)) { customer.lastOrder = order.placedAt; customer.district = order.district; }
      grouped.set(key, customer);
    }
    return [...grouped.values()].filter(customer => `${customer.name} ${customer.email} ${customer.district}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => b.spent-a.spent);
  }, [orders, query]);
  return <>
    <div className="admin-page-heading"><div><h1>Customers</h1><p>Customer details are collected from demo orders saved in this browser.</p></div></div>
    <section className="admin-kpis"><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Customers</span><span className="admin-kpi-icon">♧</span></div><strong>{new Set(orders.map(order => order.email).filter(Boolean)).size}</strong><small>Unique email addresses</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Returning customers</span><span className="admin-kpi-icon">↻</span></div><strong>{customers.filter(customer => customer.orders > 1).length}</strong><small>More than one order</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Average orders</span><span className="admin-kpi-icon">▤</span></div><strong>{customers.length ? (orders.length / customers.length).toFixed(1) : "0.0"}</strong><small>Per customer</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Total spent</span><span className="admin-kpi-icon">R</span></div><strong>{money(orders.reduce((sum,order) => sum + Number(order.total || 0),0))}</strong><small>Across demo orders</small></article></section>
    <div className="admin-toolbar"><input className="admin-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer or district..."/><span className="admin-count">{customers.length} customers</span></div>
    <section className="admin-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CUSTOMER</th><th>PHONE</th><th>DISTRICT</th><th>ORDERS</th><th>TOTAL SPENT</th><th>LAST ORDER</th></tr></thead><tbody>{customers.map((customer,index) => <tr key={customer.email || customer.name}><td><div className="admin-customer"><img src={`/admin-assets/profile/user-${index % 5 + 1}.jpg`} alt=""/><span><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td><td>{customer.phone || "—"}</td><td>{customer.district || "—"}, Rwanda</td><td>{customer.orders}</td><td><strong>{money(customer.spent)}</strong></td><td>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "—"}</td></tr>)}</tbody></table>{!customers.length && <div className="admin-empty">{orders.length ? "No customers match your search." : "No customers yet. A customer is added after placing a storefront order."}</div>}</div></section>
    <p className="demo-notice" style={{marginTop:14}}>This admin demo reads customer and order data from this browser only. It is not a shared database.</p>
  </>;
}
