"use client";

import { usePathname } from "next/navigation";
import { StoreFooter, StoreHeader } from "./StoreChrome";
import StoreAdBanners from "./StoreAdBanners";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StorefrontFrame({ children }) {
  const isAdmin = usePathname().startsWith("/admin");
  const config = useStorefrontConfig();
  return <>{!isAdmin && <>{config.chrome.showHeader && <StoreHeader/>}<StoreAdBanners placement="global"/></>}{children}{!isAdmin && config.chrome.showFooter && <StoreFooter/>}</>;
}
