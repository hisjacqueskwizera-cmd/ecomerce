"use client";

import { usePathname } from "next/navigation";
import { StoreFooter, StoreHeader } from "./StoreChrome";
import StoreAdBanners from "./StoreAdBanners";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StorefrontFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const showSideAds = pathname === "/";
  const config = useStorefrontConfig();
  return <>{!isAdmin && <StoreAdBanners placement="global"/>}{!isAdmin && config.chrome.showHeader && <StoreHeader/>}{isAdmin ? children : showSideAds ? <div className="storefront-page-ad-layout"><aside className="storefront-side-ad" aria-label="Left side promotions"><StoreAdBanners placement="side_left"/></aside><div className="storefront-page-content">{children}</div><aside className="storefront-side-ad" aria-label="Right side promotions"><StoreAdBanners placement="side_right"/></aside></div> : <div className="storefront-page-content">{children}</div>}{!isAdmin && config.chrome.showFooter && <StoreFooter/>}</>;
}
