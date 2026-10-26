"use client";

import { usePathname } from "next/navigation";
import { StoreFooter, StoreHeader } from "./StoreChrome";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StorefrontFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const config = useStorefrontConfig();
  if (isAdmin) return children;
  return <div className="grocery-storefront-frame">
    {config.chrome.showHeader && <StoreHeader/>}
    <div className="storefront-page-content">{children}</div>
    {config.chrome.showFooter && <StoreFooter/>}
  </div>;
}
