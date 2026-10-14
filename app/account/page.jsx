"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import { money } from "../../lib/catalog";

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setProfile(JSON.parse(localStorage.getItem("openshop-demo-profile") || "null"));
      setOrders(JSON.parse(localStorage.getItem("openshop-demo-orders-rwf-v2") || "[]"));
    } catch { setProfile(null); setOrders([]); }
  }, []);
  function saveProfile(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const updated = { name: data.get("name"), email: data.get("email") };
    localStorage.setItem("openshop-demo-profile", JSON.stringify(updated));
    setProfile(updated); setSaved(true);
  }
  return <main><StoreLayout><PageTitle eyebrow="YOUR OPEN SHOP" title={profile ? `Hello, ${profile.name.split(" ")[0]}` : "Your account"} description="Manage your details and keep track of your recent orders."/><div className="account-layout"><section className="account-panel"><h2>Profile details</h2><form className="account-form" onSubmit={saveProfile}><label>Full name<input name="name" required defaultValue={profile?.name || ""} placeholder="Your name"/></label><label>Email address<input name="email" required type="email" defaultValue={profile?.email || ""} placeholder="you@example.com"/></label><button className="button-primary">{saved ? "Details saved ✓" : "Save details"}</button></form><div className="account-links"><Link href="/wishlist">♡ Saved items</Link><Link href="/cart">♧ Your cart</Link><Link href="/shop">Browse the marketplace →</Link></div></section><section className="account-panel"><h2>Order history</h2>{orders.length ? <div className="order-history">{orders.map(order => <article className="account-order" key={order.reference}><div className="order-reference"><span><small>ORDER</small><b>{order.reference}</b></span><span><small>STATUS</small><b className="order-status">{order.status || "Demo order"}</b></span></div><small>Placed {new Date(order.placedAt).toLocaleDateString()}{order.district ? ` · ${order.district}, Rwanda` : ""}</small>{order.items?.map(item => <div className="account-order-item" key={item.key}><span>{item.quantity} × {item.name}</span><b>{money(item.price * item.quantity)}</b></div>)}<div className="summary-total"><span>Total</span><b>{money(order.total)}</b></div></article>)}</div> : <div className="account-empty"><p>Your orders will appear here after checkout.</p><Link href="/shop">Start shopping →</Link></div>}</section></div><p className="account-demo-note">This demo account and its orders are stored only in this browser. They are not connected to a customer database.</p></StoreLayout></main>;
}
