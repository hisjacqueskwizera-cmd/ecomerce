"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, money } from "../lib/catalog";
import { useStore } from "./StoreProvider";
import DistrictOptions from "./DistrictOptions";
import { useStorefrontConfig } from "./useStorefrontConfig";

export function StoreHeader() {
  const { cartCount, subtotal, wishlist } = useStore();
  const config = useStorefrontConfig();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const router = useRouter();

  useEffect(() => setDistrict(localStorage.getItem("openshop-delivery-district") || ""), []);
  function selectDistrict(event) {
    const selected = event.target.value;
    setDistrict(selected);
    if (selected) localStorage.setItem("openshop-delivery-district", selected);
    else localStorage.removeItem("openshop-delivery-district");
  }
  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    router.push(`/search${params.size ? `?${params.toString()}` : ""}`);
    setMenuOpen(false);
  }

  return <header id="top" className="store-header amazon-header">
    <div className="amazon-mainbar"><div className="shell amazon-header-inner">
      <Link className="amazon-wordmark" href="/" aria-label="Open Shop home"><span className="amazon-logo-mark">O</span><span>Open Shop<small>{config.chrome.tagline}</small></span></Link>
      <label className="amazon-location"><span className="location-pin" aria-hidden="true">⌖</span><span><small>Deliver to</small><b>{district || "Rwanda"}</b></span><select value={district} onChange={selectDistrict} aria-label="Select delivery district"><option value="">All Rwanda</option><DistrictOptions/></select></label>
      <form className="amazon-search" onSubmit={search}><select aria-label="Search category" value={category} onChange={event => setCategory(event.target.value)}><option value="">All departments</option>{categories.map(item => <option key={item}>{item}</option>)}</select><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, stores and categories" aria-label="Search products"/><button aria-label="Search">Search</button></form>
      <Link className="amazon-account" href="/account"><small>Hello, sign in</small><b>Account &amp; Lists</b></Link>
      <Link className="amazon-orders" href="/account"><small>Returns</small><b>&amp; Orders</b></Link>
      <Link className="amazon-saved" href="/wishlist"><span aria-hidden="true">♡</span><b>Saved</b><i>{wishlist.length}</i></Link>
      <Link className="amazon-cart" href="/cart" aria-label={`Cart, ${cartCount} items`}><span className="cart-icon" aria-hidden="true">Cart<i>{cartCount}</i></span><b>Cart</b><small>{money(subtotal)}</small></Link>
    </div></div>
    {config.chrome.showNavigation && <nav className="amazon-nav"><div className="shell amazon-nav-inner">
      <div className="amazon-all-wrap"><button className="amazon-all" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)}><span aria-hidden="true">☰</span> All</button>{categoriesOpen && <div className="amazon-category-menu"><b>Shop by department</b>{categories.map(item => <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} onClick={() => setCategoriesOpen(false)}>{item}<span>›</span></Link>)}<Link className="all-departments" href="/shop" onClick={() => setCategoriesOpen(false)}>Browse all products</Link></div>}</div>
      <button className="amazon-mobile-toggle" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen}>Menu</button>
      <div className={`amazon-nav-links ${menuOpen ? "nav-open" : ""}`}>{config.chrome.nav.filter(item => item.active && item.label && item.href).map((item, index) => <Link key={`${item.href}-${index}`} href={item.href}>{item.label}</Link>)}</div>
      <span className="amazon-nav-note">Local stores. Rwanda-wide delivery.</span>
    </div></nav>}
  </header>;
}

export function StoreFooter() {
  const config = useStorefrontConfig();
  return <footer id="footer"><a className="footer-back-to-top" href="#top">Back to top</a><div className="shell footer-grid"><div><Link className="wordmark" href="/">Open Shop</Link><p>{config.chrome.footerDescription}</p></div><div><b>Customer service</b><Link href="/contact">Contact us</Link><Link href="/shipping">Shipping &amp; returns</Link><Link href="/faq">Help &amp; FAQs</Link></div><div><b>Discover</b><Link href="/shop">Shop all products</Link><Link href="/stores">Our stores</Link><Link href="/journal">Stories &amp; updates</Link><Link href="/admin">Admin console</Link></div><div><b>Stay in the know</b><p>{config.chrome.newsletterText}</p><Newsletter/></div></div><div className="copyright">Copyright &copy; Open Shop. All Rights Reserved.</div></footer>;
}

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  return <form className="newsletter" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}><input type="email" required placeholder="Your email address" aria-label="Your email address"/><button>{subscribed ? "✓" : "→"}</button></form>;
}

export function PageTitle({ eyebrow, title, description, children }) {
  return <div className="page-title">{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}{children}</div>;
}

export function Breadcrumbs({ items = [] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link>{items.map((item, index) => <span key={`${item.label}-${index}`}> / {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>;
}

export function StoreLayout({ children, sidebar = false }) {
  return <div className="page-surface"><div className={`shell store-page ${sidebar ? "with-sidebar" : ""}`}>{children}</div></div>;
}
