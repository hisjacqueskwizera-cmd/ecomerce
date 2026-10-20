"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const menu = [
  { title: "Agreements", href: "/admin/agreements", icon: "OS" },
  { title: "Overview", href: "/admin", icon: "▦" },
  { title: "Products", href: "/admin/products", icon: "◇" },
  { title: "Advertising", href: "/admin/banners", icon: "▱" },
  { title: "Storefront", href: "/admin/storefront", icon: "▤" },
  { title: "Coupons", href: "/admin/coupons", icon: "%" },
  { title: "Orders", href: "/admin/orders", icon: "▤" },
  { title: "Sellers", href: "/admin/sellers", icon: "♙" },
  { title: "Customers", href: "/admin/customers", icon: "♧" },
  { title: "User roles", href: "/admin/users", icon: "♙" }
];

export default function AdminShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const title = menu.find(item => item.href === path)?.title || "Overview";
  return <div className="admin-app">
    {open && <button className="admin-scrim" aria-label="Close navigation" onClick={() => setOpen(false)}/>}
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <Link href="/admin" className="admin-brand"><span className="admin-brand-mark">O</span><span>Open Shop<small>ADMIN CONSOLE</small></span></Link>
      <span className="admin-nav-label">WORKSPACE</span>
      <nav className="admin-nav">{menu.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={path === item.href ? "active" : ""}><span>{item.icon}</span>{item.title}{item.href === "/admin/orders" && <i>Live</i>}</Link>)}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-support-art"><img src="/admin-assets/dashboard/customer-support-img.png" alt=""/></div><b>Need a hand?</b><p>Keep your Open Shop marketplace running smoothly.</p><a href="mailto:hello@openshop.example">Contact support</a></div>
      <div className="admin-sidebar-foot"><span className="admin-avatar">OS</span><span><b>Super admin</b><small>Rwanda · RWF</small></span><button className="admin-more" title="Sign out" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); router.replace("/login"); router.refresh(); }}>↪</button></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-button" onClick={() => setOpen(true)} aria-label="Open navigation">☰</button><div className="admin-crumb"><span>Open Shop</span><b>/</b><strong>{title}</strong></div><div className="admin-top-actions"><span className="admin-country">🇷🇼 <b>Rwanda</b></span><span className="admin-divider"/><Link href="/" className="admin-store-link">↗ <span>View storefront</span></Link><span className="admin-avatar">OS</span></div></header>
      <main className="admin-content">{children}</main>
      <footer className="admin-footer"><span>Open Shop Admin</span><span>Marketplace overview · All amounts in RWF</span></footer>
    </div>
  </div>;
}
