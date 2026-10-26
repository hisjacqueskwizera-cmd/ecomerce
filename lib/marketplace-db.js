"use client";

import { createSupabaseBrowserClient } from "./supabase/client";

export const MEDIA_BUCKET = "marketplace-media";

export function productFromRow(row) {
  return { ...row.product_data, id: row.id, slug: row.slug, name: row.name, category: row.category, seller: row.seller, price: Number(row.price), oldPrice: row.old_price == null ? undefined : Number(row.old_price), stock: row.stock, rating: Number(row.rating), reviews: row.reviews, description: row.description, photos: row.photos || [], photo: row.photos?.[0] || "", attributes: row.attributes || {} };
}

export function productToRow(product) {
  const { id, slug, name, category, seller, price, oldPrice, stock, rating, reviews, description, photos, attributes, ...productData } = product;
  return { id: String(id), slug, name, category, seller, price, old_price: oldPrice ?? null, stock: Number(stock || 0), rating: Number(rating || 0), reviews: Number(reviews || 0), description: description || "", photos: photos || (product.photo ? [product.photo] : []), attributes: attributes || {}, product_data: productData, active: product.active !== false };
}

export function campaignFromRow(row) {
  return { id: row.id, sourceKey: row.source_key || "", name: row.name, headline: row.headline, message: row.message, cta: row.cta_text || row.cta || "Shop now", href: row.destination_url || row.href || "/shop", image: row.image_url || "", videoUrl: row.youtube_url || row.video_url || "", placement: row.placement, active: row.active, displayOrder: row.display_order };
}

export function campaignToRow(item, displayOrder = 0) {
  const numericId = Number(item.id);
  return { ...(Number.isSafeInteger(numericId) && numericId > 0 ? { id: numericId } : {}), source_key: item.sourceKey || (item.id ? String(item.id) : null), name: item.name, headline: item.headline, message: item.message || "", cta_text: item.cta || "Shop now", destination_url: item.href || "/shop", image_url: item.image || null, youtube_url: item.videoUrl || null, placement: item.placement, active: item.active !== false, display_order: Number(item.displayOrder ?? displayOrder) };
}

export async function uploadMarketplaceImage(file, folder = "campaigns") {
  if (!file?.type?.startsWith("image/") || file.size > 8 * 1024 * 1024) throw new Error("Choose an image up to 8 MB.");
  const supabase = createSupabaseBrowserClient();
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

function marketplaceObjectPath(url) {
  try {
    const pathname = new URL(url).pathname;
    const prefix = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    return pathname.startsWith(prefix) ? decodeURIComponent(pathname.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

export async function deleteMarketplaceImages(urls) {
  const paths = [...new Set((urls || []).map(marketplaceObjectPath).filter(Boolean))];
  if (!paths.length) return;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) throw error;
}

export async function copyLocalImageToStorage(src, folder = "seed") {
  if (!src || /^https?:\/\//i.test(src) && !src.includes(window.location.host)) return src;
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Could not load sample image ${src}`);
  const blob = await response.blob();
  const pathPart = src.replace(/^https?:\/\/[^/]+/, "").split("?")[0].replace(/^\//, "").replace(/[^a-zA-Z0-9/_.-]/g, "-");
  const path = `${folder}/${pathPart}`;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: blob.type || "image/jpeg", cacheControl: "31536000", upsert: true });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
