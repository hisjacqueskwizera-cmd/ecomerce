"use client";

import { useEffect, useState } from "react";
import { seedBanners, products as seedProducts } from "../../../lib/catalog";
import { coupons as seedCoupons } from "../../../lib/coupons";
import { defaultStorefrontConfig } from "../../../lib/storefront-config";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import { campaignFromRow, campaignToRow, copyLocalImageToStorage, productToRow, uploadMarketplaceImage } from "../../../lib/marketplace-db";
import SearchableSelect from "../../../components/SearchableSelect";
import { getYouTubeVideoId } from "../../../lib/youtube";

const blank = { id: "", name: "", headline: "", message: "", cta: "Shop now", href: "/shop", image: "", videoUrl: "", placement: "global", active: true };
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
  const supabase = createSupabaseBrowserClient();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function refresh() {
    const { data, error: queryError } = await supabase.from("ad_campaigns").select("*").order("display_order");
    if (queryError) { setError(`${queryError.message} Run database/supabase-marketplace.sql first.`); return; }
    setItems((data || []).map(campaignFromRow)); setError("");
  }
  useEffect(() => { refresh(); }, []);

  async function importSeedData() {
    setBusy(true); setError(""); setNotice("");
    try {
      const imageCopies = new Map();
      const copyImage = (src, folder) => {
        if (!src) return Promise.resolve("");
        const key = `${folder}:${src}`;
        if (!imageCopies.has(key)) imageCopies.set(key, copyLocalImageToStorage(src, folder));
        return imageCopies.get(key);
      };
      const [products, campaigns] = await Promise.all([
        Promise.all(seedProducts.map(async product => {
          const sourcePhotos = product.photos?.length ? product.photos : product.photo ? [product.photo] : [];
          const photos = await Promise.all(sourcePhotos.map(src => copyImage(src, "products")));
          return productToRow({ ...product, photos, photo: photos[0] || "" });
        })),
        Promise.all(seedBanners.map(async (banner, index) => {
          const image = banner.image ? await copyImage(banner.image, "campaigns") : "";
          return campaignToRow({ ...banner, image }, index);
        })),
      ]);
      const couponRows = seedCoupons.map(coupon => ({ code: coupon.code, discount_type: coupon.type, discount_value: coupon.value, minimum: coupon.minimum || 0, maximum: coupon.maximum || null, description: coupon.description || "", categories: coupon.categories || [], expires_at: coupon.expiresAt || null, active: coupon.active !== false }));
      for (const [table, rows, onConflict] of [["catalog_products", products, "id"], ["ad_campaigns", campaigns, "source_key"], ["store_coupons", couponRows, "code"]]) {
        const { error: upsertError } = await supabase.from(table).upsert(rows, { onConflict, ignoreDuplicates: true });
        if (upsertError) throw upsertError;
      }
      const { error: settingsError } = await supabase.from("storefront_settings").upsert({ setting_key: "main", setting_value: defaultStorefrontConfig }, { ignoreDuplicates: true });
      if (settingsError) throw settingsError;
      setNotice("Sample products, campaigns, coupon codes, storefront settings, and their images are now stored in Supabase.");
      await refresh();
    } catch (importError) { setError(`Seed import stopped: ${importError.message}`); }
    finally { setBusy(false); }
  }

  function edit(item = null) { setError(""); setModal(item ? { ...item } : { ...blank, id: crypto.randomUUID() }); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const href = String(data.get("href") || "").trim();
    const videoUrl = String(data.get("videoUrl") || "").trim();
    const placement = String(data.get("placement") || "global");
    const imageFile = data.get("image");
    if (!(href.startsWith("/") || /^https?:\/\//i.test(href))) { setBusy(false); setError("Use a storefront path or a full http(s) address."); return; }
    if ((placement.startsWith("video_") && !getYouTubeVideoId(videoUrl)) || (videoUrl && !getYouTubeVideoId(videoUrl))) { setBusy(false); setError("Add a valid YouTube video link."); return; }
    try {
      const image = imageFile instanceof File && imageFile.size ? await uploadMarketplaceImage(imageFile) : await copyLocalImageToStorage(modal.image, "campaigns");
      const campaign = { id: modal.id, name: String(data.get("name") || "").trim(), headline: String(data.get("headline") || "").trim(), message: String(data.get("message") || "").trim(), cta: String(data.get("cta") || "Shop now").trim(), href, image, videoUrl, placement, active: data.get("active") === "on" };
      const row = campaignToRow(campaign, items.length);
      const updates = { ...row };
      delete updates.id;
      const existing = items.find(item => String(item.id) === String(campaign.id));
      const saveResult = existing
        ? await supabase.from("ad_campaigns").update(updates).eq("id", existing.id)
        : await supabase.from("ad_campaigns").insert(row);
      const saveError = saveResult.error;
      if (saveError) throw saveError;
      setModal(null); await refresh();
    } catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  async function toggle(item) {
    const { error: saveError } = await supabase.from("ad_campaigns").update({ active: item.active === false, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (saveError) setError(saveError.message); else refresh();
  }
  async function remove(item) {
    if (!window.confirm(`Delete campaign “${item.name}”?`)) return;
    const { error: deleteError } = await supabase.from("ad_campaigns").delete().eq("id", item.id);
    if (deleteError) setError(deleteError.message); else refresh();
  }
  return <>
    <div className="admin-page-heading"><div><h1>Campaigns</h1><p>Campaign metadata is shared in Supabase; campaign images are stored in Supabase Storage.</p></div><div className="admin-heading-actions"><button className="admin-secondary" disabled={busy} onClick={importSeedData}>{busy ? "Importing…" : "Import demo data to Supabase"}</button><button className="admin-primary" onClick={() => edit()}>＋ Add campaign</button></div></div>
    {notice && <p className="storefront-save-note">{notice}</p>}{error && <p className="coupon-error">{error}</p>}
    <section className="admin-kpis"><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>All campaigns</span></div><strong>{items.length}</strong><small>Shared database records</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Active campaigns</span></div><strong>{items.filter(item => item.active !== false).length}</strong><small>Visible in storefront positions</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Display positions</span></div><strong>{new Set(items.filter(item => item.active !== false).map(item => item.placement)).size}</strong><small>Across storefront pages</small></article></section>
    <section className="admin-card"><div className="admin-card-title"><div><h2>Campaigns and sponsored videos</h2><p>Manage placements, YouTube links, destinations, and campaign status.</p></div><span className="admin-status shipped">Supabase</span></div><div className="admin-banner-size-guide"><b>Recommended creative sizes</b><span>Top: 1440 × 180 px · Side rails: 160 × 600 px</span><span>Homepage: 1200 × 300 px · Product grid: 600 × 750 px</span><span>Product detail: 1200 × 400 px · Video: 1280 × 720 px (16:9)</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PREVIEW</th><th>CAMPAIGN</th><th>POSITION</th><th>DESTINATION</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><div className="admin-banner-preview">{item.videoUrl ? <span>VIDEO</span> : item.image ? <img src={item.image} alt=""/> : <span>{item.headline}</span>}</div></td><td><strong>{item.headline}</strong><small className="admin-order-items">{item.name}</small></td><td>{placements.find(p => p.value === item.placement)?.label || item.placement}</td><td>{item.href}</td><td><span className={`admin-status ${item.active === false ? "cancelled" : ""}`}>{item.active === false ? "Paused" : "Active"}</span></td><td><div className="admin-table-actions"><button className="admin-icon-button" onClick={() => edit(item)} aria-label="Edit campaign">✎</button><button className="admin-icon-button" onClick={() => toggle(item)} aria-label="Toggle campaign">{item.active === false ? "▶" : "Ⅱ"}</button><button className="admin-icon-button" onClick={() => remove(item)} aria-label="Delete campaign">⌫</button></div></td></tr>)}</tbody></table>{!items.length && <div className="admin-empty">No campaigns in Supabase. Import demo data or add a campaign.</div>}</div></section>
    {modal && <div className="admin-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-title"><div className="admin-modal-head"><div><h2 id="campaign-title">{items.some(item => item.id === modal.id) ? "Edit campaign" : "Add campaign"}</h2><p>Campaign text and image file will be saved to Supabase.</p></div><button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div><form onSubmit={submit}><div className="admin-form-grid"><label className="admin-field">Internal name<input name="name" required defaultValue={modal.name}/></label><label className="admin-field">Placement<SearchableSelect name="placement" defaultValue={modal.placement} options={placements} ariaLabel="Campaign placement"/></label><label className="admin-field wide">Headline<input name="headline" maxLength={90} required defaultValue={modal.headline}/></label><label className="admin-field wide">Supporting message<textarea name="message" maxLength={180} defaultValue={modal.message}/></label><label className="admin-field">Button text<input name="cta" maxLength={30} defaultValue={modal.cta}/></label><label className="admin-field">Destination<input name="href" required defaultValue={modal.href}/></label><label className="admin-field wide">YouTube video link<input type="url" name="videoUrl" defaultValue={modal.videoUrl || ""} placeholder="https://youtu.be/VIDEO_ID"/></label><label className="admin-field wide">Campaign image{modal.image && <img className="admin-banner-form-image" src={modal.image} alt="Current campaign"/>}<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"/><small>Image files up to 8 MB are uploaded to the marketplace-media bucket.</small></label><label className="admin-field banner-active-field"><span><input name="active" type="checkbox" defaultChecked={modal.active !== false}/> Show this campaign</span></label></div>{error && <p className="coupon-error">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setModal(null)}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? "Saving…" : "Save campaign"}</button></div></form></section></div>}
  </>;
}
