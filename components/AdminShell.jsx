"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const menu = [
  { title: "Overview", href: "/admin", icon: "overview" },
  { title: "Products", href: "/admin/products", icon: "products" },
  { title: "Orders", href: "/admin/orders", icon: "orders" },
  { title: "Sellers", href: "/admin/sellers", icon: "sellers" },
  { title: "Customers", href: "/admin/customers", icon: "customers" },
  { title: "Agreements", href: "/admin/agreements", icon: "agreements" },
  { title: "Advertising", href: "/admin/banners", icon: "advertising" },
  { title: "Storefront", href: "/admin/storefront", icon: "storefront" },
  { title: "Coupons", href: "/admin/coupons", icon: "coupons" },
  { title: "User roles", href: "/admin/users", icon: "roles" },
  { title: "Vendors", href: "/admin/vendors", icon: "vendors" },
];

function Icon({ name, size = 16 }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    products: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3.5 7.5 8.5 5 8.5-5M12 22V12.5"/></>,
    orders: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    sellers: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.8 2.8-5.7 6.5-5.7s5.9 1.9 6.5 5.7M16 5.2a3.5 3.5 0 0 1 0 6.6M17 14.6c2.7.5 4.2 2.3 4.5 5.4"/></>,
    customers: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.1-5.3 7-5.3s6.2 1.8 7 5.3"/></>,
    agreements: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    advertising: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></>,
    storefront: <><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></>,
    coupons: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
    roles: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    vendors: <><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M7 17 17 7M8 7h9v9"/></>,
    signout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="m15 16 4-4-4-4M19 12H9"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AdminShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const currentPage = menu.find(item => item.href === path);
  const title = currentPage?.title || "Overview";
  const isOverview = path === "/admin";

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <div className="admin-app admin-workspace">
    <header className="admin-dashboard-header">
      <div className="admin-dashboard-nav">
        <Link href="/admin" className="admin-brand" aria-label="JashaMart admin dashboard">
          <span className="admin-brand-logo"><img src="/images/jashamart-logo.png" alt="JashaMart"/></span>
          <span className="admin-brand-caption">ADMIN CONSOLE</span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {menu.map(item => <Link key={item.href} href={item.href} title={item.title} aria-current={path === item.href ? "page" : undefined} className={path === item.href ? "active" : ""}>
            <Icon name={item.icon}/><span>{item.title}</span>
          </Link>)}
        </nav>
        <div className="admin-top-actions">
          <button className="admin-profile" onClick={signOut} title="Sign out" aria-label="Sign out of the admin console">
            <span className="admin-avatar">JM</span><span><b>Super admin</b><small>Sign out</small></span><Icon name="signout" size={15}/>
          </button>
        </div>
      </div>
      <div className="admin-dashboard-welcome">
        <div>
          <span>JASHAMART COMMAND CENTER</span>
          <h1>{isOverview ? "Good day, Super admin" : title}</h1>
          <p>{isOverview ? "Here is a clear view of your marketplace today." : `Manage your marketplace ${title.toLowerCase()} in one place.`}</p>
        </div>
        <div className="admin-header-controls">
          <span className="admin-date-pill"><Icon name="pin" size={15}/> Rwanda · RWF</span>
          <Link href="/" className="admin-store-link">View storefront <Icon name="arrow" size={15}/></Link>
        </div>
      </div>
    </header>
    <main className="admin-main"><div className="admin-content">{children}</div></main>
    <footer className="admin-footer"><span>JashaMart Admin</span><span>Marketplace overview · All amounts in RWF</span><a href="mailto:hello@openshop.example">Contact support</a></footer>
  </div>;
}
