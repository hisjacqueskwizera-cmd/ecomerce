"use client";

import { useEffect, useState } from "react";
import { seedBanners } from "../../../lib/catalog";
import { ADMIN_BANNERS_KEY, readStored, saveStored } from "../../../lib/admin-data";
import SearchableSelect from "../../../components/SearchableSelect";
import { getYouTubeVideoId } from "../../../lib/youtube";

const emptyBanner = { name: "", headline: "", message: "", cta: "Shop now", href: "/shop", image: "", placement: "global", active: true };
const placements = [
  { label: "Top banner — all pages (1440 × 180 px)", value: "global" },
  { label: "Left side rail — storefront (160 × 600 px)", value: "side_left" },
  { label: "Right side rail — storefront (160 × 600 px)", value: "side_right" },
  { label: "Homepage, after departments (1200 × 300 px)", value: "after_departments" },
  { label: "Homepage, after popular products (1200 × 300 px)", value: "after_popular" },
  { label: "Shop product grid card (600 × 750 px)", value: "product_grid" },
  { label: "Product detail page card (1200 × 400 px)", value: "product_detail" },
  { label: "Homepage sponsored video (1280 × 720 px)", value: "video_home" },
  { label: "Product detail sponsored video (1280 × 720 px)", value: "video_product" },
];

export default function AdminBannersPage() {
  const [items, setItems] = useState(seedBanners);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => setItems(readStored(ADMIN_BANNERS_KEY, seedBanners)), []);
  function commit(next) { saveStored(ADMIN_BANNERS_KEY, next); setItems(next); }
  function edit(item = null) { setError(""); setModal(item ? { ...item } : { ...emptyBanner, id: `banner-${Date.now()}` }); }
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const image = data.get("image");
    const href = String(data.get("href") || "").trim();
    const videoUrl = String(data.get("videoUrl") || "").trim();
    const placement = String(data.get("placement") || "global");
    if (!(href.startsWith("/") || /^https?:\/\//i.test(href))) { setError("Use a storefront path or a full http(s) address."); return; }
    const isVideoPlacement = placement === "video_home" || placement === "video_product";
    if (isVideoPlacement && !getYouTubeVideoId(videoUrl)) { setError("Add a valid YouTube link for a video placement."); return; }
    if (videoUrl && !getYouTubeVideoId(videoUrl)) { setError("Use a valid YouTube video link."); return; }
    if (image instanceof File && image.size && (!image.type.startsWith("image/") || image.size > 5 * 1024 * 1024)) { setError("Choose an image file smaller than 5 MB."); return; }
    let photo = modal.image || "";
    if (image instanceof File && image.size) {
      try { photo = await optimizeBannerImage(image); } catch { setError("This image could not be processed. Choose another."); return; }
      if (photo.length > 650_000) { setError("The compressed image is too large. Choose a smaller image."); return; }
    }
    const banner = { id: modal.id, name: String(data.get("name") || "").trim(), headline: String(data.get("headline") || "").trim(), message: String(data.get("message") || "").trim(), cta: String(data.get("cta") || "Shop now").trim(), href, image: photo, videoUrl, placement, active: data.get("active") === "on" };
    const next = items.some(item => item.id === banner.id) ? items.map(item => item.id === banner.id ? banner : item) : [banner, ...items];
    try { commit(next); setModal(null); } catch { setError("This banner could not be saved in this browser. Try a smaller image."); }
  }
  function toggle(item) { commit(items.map(banner => banner.id === item.id ? { ...banner, active: banner.active === false } : banner)); }
  function remove(item) { if (window.confirm(`Delete banner “${item.name}”?`)) commit(items.filter(banner => banner.id !== item.id)); }
  const activeCount = items.filter(item => item.active !== false).length;
  return <>
    <div className="admin-page-heading"><div><h1>Storefront banners</h1><p>Manage sponsored promotions shown across the storefront.</p></div><button className="admin-primary" onClick={() => edit()}>＋ Add banner</button></div>
    <section className="admin-kpis"><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>All banners</span><span className="admin-kpi-icon">▱</span></div><strong>{items.length}</strong><small>Stored in this browser</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Active banners</span><span className="admin-kpi-icon">✓</span></div><strong>{activeCount}</strong><small>Visible in storefront slots</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Display positions</span><span className="admin-kpi-icon">⌖</span></div><strong>{new Set(items.filter(item => item.active !== false).map(item => item.placement)).size}</strong><small>Slots across storefront and product pages</small></article></section>
    <section className="admin-card"><div className="admin-card-title"><div><h2>Advertising banners and videos</h2><p>Manage sponsored placements, YouTube links, destinations, and campaign status.</p></div><span className="admin-status shipped">Storefront ads</span></div><div className="admin-banner-size-guide"><b>Recommended creative sizes</b><span>Top banner: 1440 × 180 px</span><span>Side banners: 160 × 600 px each</span><span>Homepage in-feed: 1200 × 300 px</span><span>Product grid card: 600 × 750 px</span><span>Product detail card: 1200 × 400 px</span><span>Sponsored video: 1280 × 720 px (16:9)</span><small>YouTube watch, short, or live links are used for video placements. Pause or activate campaigns here.</small></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PREVIEW</th><th>CAMPAIGN</th><th>POSITION</th><th>DESTINATION</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><div className="admin-banner-preview">{item.videoUrl ? <span>VIDEO</span> : item.image ? <img src={item.image} alt=""/> : <span>{item.headline}</span>}</div></td><td><strong>{item.headline}</strong><small className="admin-order-items">{item.name}</small></td><td>{placements.find(placement => placement.value === item.placement)?.label || item.placement}</td><td>{item.href}</td><td><span className={`admin-status ${item.active === false ? "cancelled" : ""}`}>{item.active === false ? "Paused" : "Active"}</span></td><td><div className="admin-table-actions"><button className="admin-icon-button" title="Edit banner" onClick={() => edit(item)}>✎</button><button className="admin-icon-button" title={item.active === false ? "Activate banner" : "Pause banner"} onClick={() => toggle(item)}>{item.active === false ? "▶" : "Ⅱ"}</button><button className="admin-icon-button" title="Delete banner" onClick={() => remove(item)}>⌫</button></div></td></tr>)}</tbody></table>{!items.length && <div className="admin-empty">No advertising banners yet.</div>}</div></section>
    {modal && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="banner-form-title"><div className="admin-modal-head"><div><h2 id="banner-form-title">{items.some(item => item.id === modal.id) ? "Edit campaign" : "Add campaign"}</h2><p>Set sponsored content, destination, and storefront placement.</p></div><button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div><form onSubmit={submit}><div className="admin-form-grid"><label className="admin-field">Internal name<input name="name" required defaultValue={modal.name} placeholder="Seasonal campaign"/></label><label className="admin-field">Placement<SearchableSelect name="placement" defaultValue={modal.placement} options={placements} ariaLabel="Campaign placement"/></label><label className="admin-field wide">Headline<input name="headline" maxLength={90} required defaultValue={modal.headline} placeholder="Shop local stores across Rwanda"/></label><label className="admin-field wide">Supporting message<textarea name="message" maxLength={180} defaultValue={modal.message} placeholder="Short description for the promotion"/></label><label className="admin-field">Button text<input name="cta" maxLength={30} defaultValue={modal.cta} placeholder="Shop now"/></label><label className="admin-field">Destination URL<input name="href" required defaultValue={modal.href} placeholder="/shop or https://example.com"/></label><label className="admin-field wide">YouTube video link<input type="url" name="videoUrl" defaultValue={modal.videoUrl || ""} placeholder="https://youtu.be/VIDEO_ID"/><small>Required for video placements. Paste a YouTube watch, short, or live URL.</small></label><label className="admin-field wide">Optional campaign image{modal.image && <img className="admin-banner-form-image" src={modal.image} alt="Current poster"/>}<input name="image" type="file" accept="image/*"/><small>YouTube supplies the video thumbnail. Campaign image uploads are limited to 5 MB.</small></label><label className="admin-field banner-active-field"><span><input name="active" type="checkbox" defaultChecked={modal.active !== false}/> Show this campaign in the storefront</span></label></div>{error && <p className="coupon-error">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setModal(null)}>Cancel</button><button className="admin-primary">Save campaign</button></div></form></section></div>}
  </>;
}

async function optimizeBannerImage(file) {
  const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = new Image();
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = source; });
  const scale = Math.min(1, 1500 / image.width);
  const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d"); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.74);
}
