"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, money } from "../lib/catalog";
import { useStore } from "./StoreProvider";
import DistrictOptions from "./DistrictOptions";
import { useStorefrontConfig } from "./useStorefrontConfig";

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.1-5.3 7-5.3s6.2 1.8 7 5.3"/></>,
    heart: <path d="M20.2 8.7c0 4.4-8.2 10-8.2 10s-8.2-5.6-8.2-10a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8Z"/>,
    bag: <><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

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

  return <header id="top" className="site-header marketplace-header">
    <div className="site-topline"><div className="site-container site-topline-inner">
      <div className="market-top-welcome"><span>Welcome to JashaMart</span><Link href="/login">Sign in</Link><span>or</span><Link href="/signup">register</Link></div>
      <div className="market-top-links"><Link href="/shop?sort=popular">Today's deals</Link><Link href="/contact">Help &amp; contact</Link><Link href="/sell">Sell on JashaMart</Link><label className="delivery-control"><span className="delivery-copy"><small>Deliver to</small><b>{district || "Rwanda"}</b></span><select value={district} onChange={selectDistrict} aria-label="Select delivery district"><option value="">All Rwanda</option><DistrictOptions/></select></label></div>
    </div></div>
    <div className="site-header-main"><div className="site-container site-header-inner">
      <Link className="brand-lockup" href="/" aria-label="JashaMart home"><img className="brand-logo" src="/images/jashamart-logo.png" alt="JashaMart"/></Link>
      <form className="store-search" onSubmit={search} role="search">
        <select aria-label="Search category" value={category} onChange={event => setCategory(event.target.value)}><option value="">All departments</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for anything" aria-label="Search products"/>
        <button aria-label="Search"><Icon name="search"/><span>Search</span></button>
      </form>
      <Link className="advanced-search" href="/search">Advanced</Link>
      <div className="header-actions">
        <Link className="header-action" href="/account" aria-label="Your account"><Icon name="user"/><span>Account</span></Link>
        <Link className="header-action" href="/wishlist" aria-label={`Saved items, ${wishlist.length}`}><Icon name="heart"/><span>Saved</span>{wishlist.length > 0 && <i>{wishlist.length}</i>}</Link>
        <Link className="header-cart" href="/cart" aria-label={`Cart, ${cartCount} items`}><span className="cart-icon-wrap"><Icon name="bag"/>{cartCount > 0 && <i>{cartCount}</i>}</span><span><b>Cart</b><small>{money(subtotal)}</small></span></Link>
        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? "×" : "☰"}</button>
      </div>
    </div></div>
    {config.chrome.showNavigation && <nav className={`site-nav ${menuOpen ? "is-open" : ""}`}><div className="site-container site-nav-inner">
      <div className="category-menu-wrap"><button className="category-menu-trigger" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)}><span>Shop by category</span><b aria-hidden="true">⌄</b></button>{categoriesOpen && <div className="category-menu"><strong>Shop by department</strong>{categories.map(item => <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} onClick={() => setCategoriesOpen(false)}>{item}<span>→</span></Link>)}<Link className="category-menu-all" href="/shop" onClick={() => setCategoriesOpen(false)}>View all products</Link></div>}</div>
      <div className="site-nav-links">{config.chrome.nav.filter(item => item.active && item.label && item.href).map((item, index) => <Link key={`${item.href}-${index}`} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}</div>
      <span className="nav-note">Shop local · Rwanda-wide</span>
    </div></nav>}
  </header>;
}

export function StoreFooter() {
  const config = useStorefrontConfig();
  return <footer className="site-footer" id="footer"><div className="site-container footer-main">
    <div className="footer-brand"><Link className="brand-lockup footer-brand-lockup" href="/" aria-label="JashaMart home"><img className="brand-logo" src="/images/jashamart-logo.png" alt=""/></Link><p>{config.chrome.footerDescription}</p></div>
    <div className="footer-column"><b>Buy</b><Link href="/shop">Shop all products</Link><Link href="/wishlist">Saved products</Link><Link href="/cart">Your cart</Link><Link href="/stores">Browse stores</Link></div>
    <div className="footer-column"><b>Sell &amp; learn</b><Link href="/sell">Sell on JashaMart</Link><Link href="/journal">Stories &amp; updates</Link><Link href="/shipping">Delivery &amp; returns</Link><Link href="/faq">Help &amp; FAQs</Link></div>
    <div className="footer-newsletter"><b>{config.chrome.newsletterTitle}</b><p>{config.chrome.newsletterText}</p><Newsletter/></div>
  </div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} JashaMart Rwanda</span><span>Made for the way we shop here.</span><a href="#top">Back to top ↑</a></div></footer>;
}

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  return <form className="newsletter" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}><input type="email" required placeholder="Your email address" aria-label="Your email address"/><button aria-label="Subscribe">{subscribed ? "✓" : "→"}</button></form>;
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
