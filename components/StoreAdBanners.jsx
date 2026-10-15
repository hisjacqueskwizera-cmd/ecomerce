"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { seedBanners } from "../lib/catalog";
import { ADMIN_BANNERS_KEY, readStored, saveStored } from "../lib/admin-data";

const SIDE_BANNERS_MIGRATION_KEY = "openshop-side-banners-migrated-v1";
const PRODUCT_ADS_MIGRATION_KEY = "openshop-product-ad-cards-migrated-v1";

export default function StoreAdBanners({ placement = "global", variant = "banner", adIndex = 0 }) {
  const [banners, setBanners] = useState(seedBanners);

  useEffect(() => {
    const refresh = () => {
      const saved = readStored(ADMIN_BANNERS_KEY, seedBanners);
      let current = Array.isArray(saved) ? saved : seedBanners;
      if (!localStorage.getItem(SIDE_BANNERS_MIGRATION_KEY)) {
        const sideDefaults = seedBanners.filter(banner => banner.placement === "side_left" || banner.placement === "side_right");
        const missingDefaults = sideDefaults.filter(seed => !current.some(banner => banner.id === seed.id));
        if (missingDefaults.length) {
          current = [...current, ...missingDefaults];
          saveStored(ADMIN_BANNERS_KEY, current);
        }
        localStorage.setItem(SIDE_BANNERS_MIGRATION_KEY, "done");
      }
      if (!localStorage.getItem(PRODUCT_ADS_MIGRATION_KEY)) {
        const productDefaults = seedBanners.filter(banner => banner.placement === "product_grid" || banner.placement === "product_detail");
        const missingDefaults = productDefaults.filter(seed => !current.some(banner => banner.id === seed.id));
        if (missingDefaults.length) {
          current = [...current, ...missingDefaults];
          saveStored(ADMIN_BANNERS_KEY, current);
        }
        localStorage.setItem(PRODUCT_ADS_MIGRATION_KEY, "done");
      }
      setBanners(current);
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
  if (variant === "video") {
    const videos = visible.filter(banner => banner.videoUrl);
    return <section className={`store-sponsored-videos video-placement-${placement}`} aria-label="Sponsored videos">
      <div className="store-sponsored-videos-heading"><span>SPONSORED VIDEO</span><small>Featured stories from our advertising partners</small></div>
      {videos.length ? <div className="store-sponsored-videos-grid">{videos.map(banner => <article className="store-sponsored-video" key={banner.id}>
        <video controls playsInline preload="metadata" poster={banner.image || undefined} aria-label={`Sponsored video: ${banner.headline}`}><source src={banner.videoUrl}/></video>
        <div className="store-sponsored-video-copy"><small>SPONSORED</small><b>{banner.headline}</b>{banner.message && <p>{banner.message}</p>}{/^https?:\/\//i.test(banner.href || "") ? <a href={banner.href}>{banner.cta || "Learn more"} <span>→</span></a> : <Link href={banner.href || "/shop"}>{banner.cta || "Learn more"} <span>→</span></Link>}</div>
      </article>)}</div> : <div className="store-video-empty"><span aria-hidden="true">▶</span><small>VIDEO AD SPACE</small><b>Showcase your products to local shoppers</b><Link href="/contact">Advertise with Open Shop →</Link></div>}
    </section>;
  }
  if (!visible.length) return null;

  if (variant === "card") {
    const banner = visible[adIndex % visible.length];
    const content = <>{banner.image && <img src={banner.image} alt="" className="store-ad-card-photo"/>}<span className="store-ad-card-copy"><small>SPONSORED</small><b>{banner.headline}</b>{banner.message && <em>{banner.message}</em>}<strong>{banner.cta || "Shop now"} <span>→</span></strong></span></>;
    const className = `store-ad-card ad-card-placement-${placement} ${banner.image ? "has-image" : ""}`;
    return /^https?:\/\//i.test(banner.href || "")
      ? <a className={className} href={banner.href} key={banner.id}>{content}</a>
      : <Link className={className} href={banner.href || "/shop"} key={banner.id}>{content}</Link>;
  }

  return <div className={`store-ad-banners ad-placement-${placement}`} aria-label="Sponsored promotions">{visible.map(banner => {
    const content = <><span className="ad-banner-copy"><small>SPONSORED</small><b>{banner.headline}</b>{banner.message && <em>{banner.message}</em>}<strong>{banner.cta || "Shop now"} <span>→</span></strong></span>{banner.image && <img src={banner.image} alt="" className="ad-banner-photo"/>}</>;
    const className = `store-ad-banner ${banner.image ? "has-image" : ""}`;
    return /^https?:\/\//i.test(banner.href || "")
      ? <a className={className} href={banner.href} key={banner.id}>{content}</a>
      : <Link className={className} href={banner.href || "/shop"} key={banner.id}>{content}</Link>;
  })}</div>;
}
