"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, uniqueRealtimeTopic } from "../lib/supabase/client";
import { campaignFromRow } from "../lib/marketplace-db";
import { getYouTubeEmbedUrl } from "../lib/youtube";

export default function StoreAdBanners({ placement = "global", variant = "banner", adIndex = 0 }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let alive = true;
    let supabase;
    let channel;

    const refresh = async () => {
      try {
        supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from("ad_campaigns").select("*").eq("active", true).eq("placement", placement).order("display_order");
        if (alive && !error) setBanners((data || []).map(campaignFromRow));
        return supabase;
      } catch {
        return null;
      }
    };

    refresh().then(client => {
      if (!client || !alive) return;
      channel = client.channel(uniqueRealtimeTopic(`campaigns-${placement}`)).on("postgres_changes", { event: "*", schema: "public", table: "ad_campaigns", filter: `placement=eq.${placement}` }, refresh).subscribe();
    });

    return () => {
      alive = false;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [placement]);

  const visible = banners.filter(banner => banner.active !== false && banner.placement === placement);
  if (variant === "video") {
    const videos = visible.filter(banner => getYouTubeEmbedUrl(banner.videoUrl));
    if (!videos.length) return null;
    return <section className={`store-sponsored-videos video-placement-${placement}`} aria-label="Sponsored videos">
      <div className="store-sponsored-videos-heading"><span>SPONSORED VIDEO</span><small>Featured stories from our advertising partners</small></div>
      <div className="store-sponsored-videos-grid">{videos.map(banner => <article className="store-sponsored-video" key={banner.id}>
        <iframe src={getYouTubeEmbedUrl(banner.videoUrl)} title={`Sponsored video: ${banner.headline}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
        <div className="store-sponsored-video-copy"><small>SPONSORED</small><b>{banner.headline}</b>{banner.message && <p>{banner.message}</p>}{/^https?:\/\//i.test(banner.href || "") ? <a href={banner.href}>{banner.cta || "Learn more"} <span>→</span></a> : <Link href={banner.href || "/shop"}>{banner.cta || "Learn more"} <span>→</span></Link>}</div>
      </article>)}</div>
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
