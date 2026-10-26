"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, money, rwandaDistricts } from "../../../lib/catalog";
import SearchableSelect from "../../../components/SearchableSelect";
import { ProductVisual } from "../../../components/ProductCard";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import { deleteMarketplaceImages, productFromRow, productToRow, uploadMarketplaceImage } from "../../../lib/marketplace-db";

const blank = { category: categories[2] };
const artChoices = ["tote", "sneaker", "vase", "backpack", "hoodie", "earbuds", "shirt", "cushion"];
const categoryFields = {
  "Quincaillerie & Construction": [{ key: "brand", label: "Brand" }, { key: "material", label: "Material" }, { key: "unit", label: "Sold as", options: ["Piece", "Pair", "Box", "Bag", "Meter", "Set"] }],
  Accessories: [{ key: "material", label: "Material" }, { key: "color", label: "Color" }],
  Agriculture: [{ key: "crop", label: "Crop or use" }, { key: "weight", label: "Pack size" }, { key: "season", label: "Planting season" }],
  Automotive: [{ key: "brand", label: "Brand" }, { key: "vehicleFit", label: "Vehicle compatibility" }, { key: "partNumber", label: "Part number" }],
  "Baby & Kids": [{ key: "ageRange", label: "Age range" }, { key: "material", label: "Material" }],
  "Books & Office": [{ key: "author", label: "Author or brand" }, { key: "format", label: "Format" }],
  Clothing: [{ key: "material", label: "Material" }, { key: "sizesText", label: "Available sizes (comma separated)" }, { key: "color", label: "Color" }],
  Fashion: [{ key: "material", label: "Material" }, { key: "sizesText", label: "Available sizes (comma separated)" }, { key: "color", label: "Color" }],
  "Food & Groceries": [{ key: "weight", label: "Net weight or volume" }, { key: "origin", label: "Origin" }, { key: "shelfLife", label: "Best before / shelf life" }],
  Furniture: [{ key: "material", label: "Material" }, { key: "dimensions", label: "Dimensions" }],
  "Health & Beauty": [{ key: "volume", label: "Net volume or weight" }, { key: "ingredients", label: "Key ingredients" }],
  "Home & Decor": [{ key: "material", label: "Material" }, { key: "dimensions", label: "Dimensions" }],
  "Home Appliances": [{ key: "brand", label: "Brand" }, { key: "warranty", label: "Warranty" }, { key: "power", label: "Power / capacity" }],
  Music: [{ key: "brand", label: "Brand" }, { key: "instrumentType", label: "Instrument or equipment type" }],
  "Phones & Electronics": [{ key: "brand", label: "Brand" }, { key: "warranty", label: "Warranty" }, { key: "connectivity", label: "Connectivity" }],
  Services: [{ key: "serviceDuration", label: "Service duration" }, { key: "serviceArea", label: "District served", districts: true }],
  Shoes: [{ key: "sizesText", label: "Available sizes (comma separated)" }, { key: "material", label: "Material" }, { key: "color", label: "Color" }],
  "Sports & Outdoors": [{ key: "brand", label: "Brand" }, { key: "size", label: "Size" }, { key: "material", label: "Material" }],
};

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All categories");
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [retainedPhotos, setRetainedPhotos] = useState([]);
  const imagePreviews = useMemo(() => selectedImages.map(file => URL.createObjectURL(file)), [selectedImages]);

  const supabase = createSupabaseBrowserClient();
  async function refresh() {
    const [{ data, error }, { data: storeData }] = await Promise.all([supabase.from("catalog_products").select("*").order("created_at"), supabase.from("seller_stores").select("name").eq("status", "active").order("name")]);
    if (!error) setItems((data || []).map(productFromRow));
    setSellers(storeData || []);
    if (error) setFormError(`${error.message}. Run database/supabase-marketplace.sql first.`);
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => () => imagePreviews.forEach(URL.revokeObjectURL), [imagePreviews]);
  async function commit(product, removing = false) {
    const previousPhotos = items.find(item => item.id === product.id)?.photos || [];
    const result = removing ? await supabase.from("catalog_products").delete().eq("id", product.id) : await supabase.from("catalog_products").upsert(productToRow(product));
    if (result.error) throw result.error;
    const nextPhotos = removing ? [] : product.photos || [];
    const obsoletePhotos = previousPhotos.filter(photo => !nextPhotos.includes(photo));
    if (obsoletePhotos.length) {
      const { data: otherProducts, error: lookupError } = await supabase.from("catalog_products").select("photos").neq("id", product.id);
      if (!lookupError) {
        const stillReferenced = new Set((otherProducts || []).flatMap(item => item.photos || []));
        const unreferenced = obsoletePhotos.filter(photo => !stillReferenced.has(photo));
        try { await deleteMarketplaceImages(unreferenced); } catch (error) { console.warn("Could not clean up replaced product images", error); }
      }
    }
    await refresh();
  }
  const visible = useMemo(() => items.filter(item => (filter === "All categories" || item.category === filter) && `${item.name} ${item.seller} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())), [items, filter, query]);

  async function submitProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = String(data.get("category") || "");
    const sellerName = String(data.get("seller") || "");
    const photoFiles = selectedImages.filter(file => file instanceof File && file.size);
    if (!sellers.some(seller => seller.name === sellerName)) { setFormError("Choose a store from the seller list."); return; }
    if (retainedPhotos.length + photoFiles.length !== 3) { setFormError("Each product must have exactly 3 images."); return; }
    if (photoFiles.some(file => file.size > 8 * 1024 * 1024)) { setFormError("Each image must be smaller than 8 MB."); return; }
    if (photoFiles.some(file => !file.type.startsWith("image/"))) { setFormError("Choose image files only."); return; }

    setFormError("");
    let photos;
    try { photos = await Promise.all(retainedPhotos.map(async (photo, index) => {
      const projectAsset = photo.startsWith("/images/") || photo.startsWith("/Products/") || photo.startsWith("/products_images/");
      const renamedProduct = Boolean(modal?.product && modal.product.slug !== productSlug);
      if (!projectAsset && !renamedProduct) return photo;
      const response = await fetch(photo);
      if (!response.ok) throw new Error(`Could not load ${photo}`);
      const blob = await response.blob();
      return uploadMarketplaceImage(new File([blob], photo.split("/").pop() || `image-${index + 1}.jpg`, { type: blob.type || "image/jpeg" }), `Products/${productSlug}`);
    })); }
    catch (error) { setFormError(error.message); return; }
    if (photoFiles.length) {
      try { photos = [...photos, ...await Promise.all(photoFiles.map(file => uploadMarketplaceImage(file, `Products/${productSlug}`)))]; }
      catch (error) { setFormError(error.message); return; }
    }
    const product = {
      ...(modal?.product || {}), id: modal?.product?.id || `admin-${Date.now()}`, slug: productSlug, name, category, seller: sellerName, photos, photo: photos[0] || "",
      price: Number(data.get("price")), stock: category === "Real Estate" ? 1 : Number(data.get("stock")),
      description: data.get("description") || "A thoughtful find from an independent Rwanda based store.",
      rating: modal?.product?.rating || 0, reviews: modal?.product?.reviews || 0,
      art: modal?.product?.art || artChoices[items.length % artChoices.length], tone: modal?.product?.tone || "blue",
      listingType: category === "Real Estate" ? "property" : undefined,
      propertyType: data.get("propertyType") || undefined, district: data.get("district") || undefined,
      bedrooms: Number(data.get("bedrooms") || 0) || undefined, bathrooms: Number(data.get("bathrooms") || 0) || undefined,
      areaSqm: Number(data.get("areaSqm") || 0) || undefined, priceUnit: data.get("priceUnit") || undefined,
      attributes: Object.fromEntries((categoryFields[category] || []).map(field => [field.key, String(data.get(field.key) || "").trim()]).filter(([, value]) => value)),
    };
    try { await commit(product); }
    catch (error) { setFormError(error.message); return; }
    setModal(null); setSelectedImages([]); setRetainedPhotos([]);
  }

  async function remove(product) {
    if (window.confirm(`Remove ${product.name} from the admin catalog?`)) {
      try { await commit(product, true); } catch (error) { setFormError(error.message); }
    }
  }
  function openProduct(product = null) {
    setFormError(""); setSelectedImages([]);
    setRetainedPhotos(product?.photos?.length ? product.photos : product?.photo ? [product.photo] : []);
    setModal({ product, category: product?.category || blank.category });
  }
  const totalStock = items.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const districtOptions = Object.entries(rwandaDistricts).flatMap(([province, districts]) => districts.map(district => ({ label: district, value: district, group: province })));

  return <>
    <div className="admin-page-heading"><div><h1>Products</h1><p>Manage the JashaMart catalog and sample inventory across Rwanda.</p></div><button className="admin-primary" onClick={() => openProduct()}>+ Add product</button></div>
    <div className="admin-toolbar"><input className="admin-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products or stores..."/><SearchableSelect className="admin-filter" value={filter} onChange={event => setFilter(event.target.value)} options={["All categories", ...categories]} ariaLabel="Filter products by category"/><span className="admin-count">{items.length} products Â· {totalStock} units</span></div>
    <section className="admin-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>STORE</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{visible.map(product => <tr key={product.id}><td><div className="admin-product-cell"><div className="admin-product-thumb"><ProductVisual product={product} showBadge={false}/></div><span><strong>{product.name}</strong><small>{product.slug}</small></span></div></td><td>{product.category}</td><td>{product.seller}</td><td><strong>{money(product.price)}</strong></td><td className={product.stock < 10 ? "admin-low-stock" : ""}>{product.stock} units</td><td><span className={`admin-status ${product.stock < 1 ? "cancelled" : product.stock < 10 ? "pending" : ""}`}>{product.stock < 1 ? "Out of stock" : product.stock < 10 ? "Low stock" : "Active"}</span></td><td><div className="admin-table-actions"><button className="admin-icon-button" title="Edit product" onClick={() => openProduct(product)}>âœŽ</button><button className="admin-icon-button" title="Remove product" onClick={() => remove(product)}>âŒ«</button></div></td></tr>)}</tbody></table>{!visible.length && <div className="admin-empty">No products match your search.</div>}</div></section>
    {modal && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><div className="admin-modal-head"><div><h2 id="product-form-title">{modal.product ? "Edit product" : "Add product"}</h2><p>Update marketplace details, image, and inventory.</p></div><button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div>
      <form onSubmit={submitProduct}><div className="admin-form-grid">
        <label className="admin-field wide">Product name<input name="name" required defaultValue={modal.product?.name || ""} placeholder="e.g. Handwoven Basket"/></label>
        <label className="admin-field">Category<SearchableSelect name="category" value={modal.category} onChange={event => setModal(current => ({ ...current, category: event.target.value }))} options={categories} ariaLabel="Product category"/></label>
        <label className="admin-field">Store / seller<SearchableSelect name="seller" defaultValue={modal.product?.seller || ""} options={sellers.map(seller => seller.name)} placeholder="Choose a store" ariaLabel="Store or seller" required/></label>
        <label className="admin-field">Price (RWF)<input name="price" type="number" min="0" required defaultValue={modal.product?.price ?? ""}/></label>
        <label className="admin-field">{modal.category === "Real Estate" ? "Listings available" : "Units in stock"}<input name="stock" type="number" min="0" required defaultValue={modal.category === "Real Estate" ? 1 : modal.product?.stock ?? ""} disabled={modal.category === "Real Estate"}/></label>
        {modal.category === "Real Estate" && <>
          <label className="admin-field">Listing type<SearchableSelect name="propertyType" defaultValue={modal.product?.propertyType || "Apartment"} options={["Apartment", "Detached house", "Residential land", "Commercial rental", "Commercial property"]} ariaLabel="Property listing type"/></label>
          <label className="admin-field">Price type<SearchableSelect name="priceUnit" defaultValue={modal.product?.priceUnit || "sale"} options={[{ label: "Sale price", value: "sale" }, { label: "Monthly rent", value: "month" }]} ariaLabel="Property price type"/></label>
          <label className="admin-field">District<SearchableSelect name="district" defaultValue={modal.product?.district || "Gasabo"} options={districtOptions} ariaLabel="District"/></label>
          <label className="admin-field">Bedrooms<input name="bedrooms" type="number" min="0" defaultValue={modal.product?.bedrooms || ""}/></label>
          <label className="admin-field">Bathrooms<input name="bathrooms" type="number" min="0" defaultValue={modal.product?.bathrooms || ""}/></label>
          <label className="admin-field">Area (m²)<input name="areaSqm" type="number" min="0" defaultValue={modal.product?.areaSqm || ""}/></label>
        </>}
        {(categoryFields[modal.category] || []).map(field => <label className="admin-field" key={`${modal.category}-${field.key}`}>{field.label}{field.districts ? <SearchableSelect name={field.key} defaultValue={modal.product?.attributes?.[field.key] || "Gasabo"} options={districtOptions} ariaLabel={field.label}/> : field.options ? <SearchableSelect name={field.key} defaultValue={modal.product?.attributes?.[field.key] || ""} options={field.options} placeholder={`Choose ${field.label.toLowerCase()}`} ariaLabel={field.label}/> : <input name={field.key} defaultValue={modal.product?.attributes?.[field.key] || modal.product?.[field.key] || ""} placeholder={field.label}/>}</label>)}
        <div className="admin-field wide"><span>Product images · 3 required</span><div className="admin-upload-gallery">{retainedPhotos.map((photo, index) => <div className="admin-upload-item" key={`${photo.slice(0, 36)}-${index}`}><img className="admin-upload-preview" src={photo} alt={`Product image ${index + 1}`}/><button type="button" onClick={() => setRetainedPhotos(current => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remove image ${index + 1}`}>×</button></div>)}{imagePreviews.map((preview, index) => <div className="admin-upload-item" key={preview}><img className="admin-upload-preview" src={preview} alt={`New product image ${index + 1}`}/><button type="button" onClick={() => setSelectedImages(current => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove new image ${index + 1}`}>×</button></div>)}</div><label className="admin-upload-control"><span>+ Add images</span><input name="photos" type="file" accept="image/*" multiple onChange={event => { const chosen = Array.from(event.target.files || []); setSelectedImages(current => [...current, ...chosen].slice(0, Math.max(0, 3 - retainedPhotos.length))); event.target.value = ""; setFormError(""); }}/></label><small>Upload exactly 3 images (up to 8 MB each). Images are stored in Supabase under Products/{modal.product?.slug || "product-name"}; the first is used in listings.</small></div>
        <label className="admin-field wide">Description<textarea name="description" defaultValue={modal.product?.description || ""} placeholder="Describe this product"/></label>
      </div>{formError && <p className="coupon-error">{formError}</p>}<div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setModal(null)}>Cancel</button><button className="admin-primary">{modal.product ? "Save changes" : "Add to catalog"}</button></div></form>
    </section></div>}
  </>;
}

async function optimizeImage(file) {
  const image = new Image();
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = source; });
  const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}
