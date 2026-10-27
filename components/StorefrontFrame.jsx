"use client";

import { usePathname } from "next/navigation";
import { StoreFooter, StoreHeader, WhatsAppContact } from "./StoreChrome";
import StoreAdBanners from "./StoreAdBanners";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StorefrontFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const config = useStorefrontConfig();
  return <>{!isAdmin && <StoreAdBanners placement="global"/>}{!isAdmin && config.chrome.showHeader && <StoreHeader/>}{isAdmin ? children : <div className="storefront-page-content">{children}</div>}{!isAdmin && config.chrome.showFooter && <StoreFooter/>}{!isAdmin && <WhatsAppContact/>}</>;
}
