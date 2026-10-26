"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, money } from "../lib/catalog";
import { useStore } from "./StoreProvider";
import { useStorefrontConfig } from "./useStorefrontConfig";

function Icon({ name }) {
  const paths = {
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.1-5.3 7-5.3s6.2 1.8 7 5.3"/></>,
    heart: <path d="M20.2 8.7c0 4.4-8.2 10-8.2 10s-8.2-5.6-8.2-10a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8Z"/>,
    bag: <><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function StoreHeader() {
  const { cartCount, subtotal, wishlist } = useStore();
  const config = useStorefrontConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return <header id="top" className="site-header grocery-header">
    <div className="grocery-ribbon"><span>Online Grocery Store Homepage design</span></div>
    <div className="grocery-nav-wrap">
      <Link className="grocery-brand" href="/" aria-label="JashaMart home"><span className="grocery-tomato" aria-hidden="true">🍅</span><span>JashaMart</span></Link>
      {config.chrome.showNavigation && <div className="grocery-category-wrap">
        <button className="grocery-category-button" onClick={() => setCategoriesOpen(open => !open)} aria-expanded={categoriesOpen}><span aria-hidden="true">☷</span> Categories</button>
        {categoriesOpen && <div className="grocery-category-menu"><strong>Shop by category</strong>{categories.map(item => <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} onClick={() => setCategoriesOpen(false)}>{item}</Link>)}</div>}
      </div>}
      {config.chrome.showNavigation && <nav className={`grocery-nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
        <Link href="/shop?sort=popular" onClick={() => setMenuOpen(false)}>Deals</Link>
        <Link href="/shop?sort=newest" onClick={() => setMenuOpen(false)}>New Arrivals</Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
      </nav>}
      <div className="grocery-header-actions">
        <Link href="/account" aria-label="Account"><Icon name="user"/></Link>
        <Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><Icon name="heart"/>{wishlist.length > 0 && <i>{wishlist.length}</i>}</Link>
        <Link href="/cart" className="grocery-cart-action" aria-label={`Cart, ${cartCount} items`}><Icon name="bag"/>{cartCount > 0 && <i>{cartCount}</i>}<small>{cartCount > 0 ? money(subtotal) : ""}</small></Link>
        <button className="grocery-mobile-toggle" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? "×" : "☰"}</button>
      </div>
    </div>
  </header>;
}

export function StoreFooter() {
  const config = useStorefrontConfig();
  return <footer className="site-footer grocery-footer" id="footer">
    <div className="grocery-footer-grid">
      <div className="grocery-footer-brand"><Link className="grocery-brand footer-brand-lockup" href="/" aria-label="JashaMart home"><span className="grocery-tomato" aria-hidden="true">🍅</span><span>JashaMart</span></Link><p>{config.chrome.footerDescription}</p><small>Rwanda · Local stores, fresh finds</small></div>
      <div className="grocery-footer-column"><b>Quick Links</b><Link href="/contact">Customer Service</Link><Link href="/account">My Account</Link><Link href="/shop">Resources</Link><Link href="/shipping">Delivery &amp; returns</Link></div>
      <div className="grocery-footer-column"><b>Contact Us</b><Link href="/about">About</Link><Link href="/contact">Contact Us</Link><Link href="/faq">Help &amp; FAQs</Link><Link href="/shipping">Privacy &amp; policies</Link></div>
      <div className="grocery-footer-column grocery-social-payment"><b>Follow Us</b><div className="grocery-social-icons" aria-label="Social channels"><span>f</span><span>♥</span><span>◎</span><span>▶</span></div><b>Payment method</b><div className="grocery-payment-icons"><span>MoMo</span><span>VISA</span><span>MC</span></div></div>
    </div>
    <div className="grocery-copyright">© {new Date().getFullYear()} JashaMart. All rights reserved.</div>
  </footer>;
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
