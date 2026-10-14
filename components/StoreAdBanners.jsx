"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { seedBanners } from "../lib/catalog";
import { ADMIN_BANNERS_KEY, readStored } from "../lib/admin-data";

export default function StoreAdBanners({ placement = "global" }) {
  const [banners, setBanners] = useState(seedBanners);

  useEffect(() => {
    const refresh = () => {
      const saved = readStored(ADMIN_BANNERS_KEY, seedBanners);
      setBanners(Array.isArray(saved) ? saved : seedBanners);
    };
    const onStorage = event => { if (event.key === ADMIN_BANNERS_KEY || event.key === null) refresh(); };
    const onUpdate = event => { if (event.detail === ADMIN_BANNERS_KEY) refresh(); };
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("openshop:storage-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("openshop:storage-updated", onUpdate);
    };
  }, []);

  const visible = banners.filter(banner => banner.active !== false && banner.placement === placement);
  if (!visible.length) return null;

  return <div className={`store-ad-banners ad-placement-${placement}`} aria-label="Sponsored promotions">{visible.map(banner => {
    const content = <><span className="ad-banner-copy"><small>SPONSORED</small><b>{banner.headline}</b>{banner.message && <em>{banner.message}</em>}<strong>{banner.cta || "Shop now"} <span>→</span></strong></span>{banner.image && <img src={banner.image} alt="" className="ad-banner-photo"/>}</>;
    const className = `store-ad-banner ${banner.image ? "has-image" : ""}`;
    return /^https?:\/\//i.test(banner.href || "")
      ? <a className={className} href={banner.href} key={banner.id}>{content}</a>
      : <Link className={className} href={banner.href || "/shop"} key={banner.id}>{content}</Link>;
  })}</div>;
}
