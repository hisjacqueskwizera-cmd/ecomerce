"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StoreFooter, StoreHeader, WhatsAppContact } from "./StoreChrome";
import StoreAdBanners from "./StoreAdBanners";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StorefrontFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const config = useStorefrontConfig();
  return <>{!isAdmin && <StoreAdBanners placement="global"/>}{!isAdmin && config.chrome.showHeader && <StoreHeader/>}{isAdmin ? children : <div className="storefront-page-content">{children}</div>}{!isAdmin && config.chrome.showFooter && <StoreFooter/>}{!isAdmin && <WhatsAppContact/>}{!isAdmin && <nav className="mobile-bottom-nav" aria-label="Mobile shopping navigation"><Link href="/" className="mobile-bottom-nav-item is-active"><span aria-hidden="true">⌂</span><small>Home</small></Link><Link href="/shop" className="mobile-bottom-nav-item"><span aria-hidden="true">▦</span><small>Shop</small></Link><Link href="/wishlist" className="mobile-bottom-nav-item"><span aria-hidden="true">♡</span><small>Saved</small></Link><Link href="/cart" className="mobile-bottom-nav-item"><span aria-hidden="true">□</span><small>Cart</small></Link><Link href="/account" className="mobile-bottom-nav-item"><span aria-hidden="true">○</span><small>Account</small></Link></nav>}</>;
}
