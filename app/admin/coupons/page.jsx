"use client";

import { useEffect, useState } from "react";
import { categories, money } from "../../../lib/catalog";
import { couponFromRow } from "../../../lib/coupons";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import SearchableSelect from "../../../components/SearchableSelect";

const blank = { code: "", type: "percent", value: "10", minimum: "0", maximum: "", description: "", active: true, categories: [] };

export default function AdminCouponsPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formError, setFormError] = useState("");
  const supabase = createSupabaseBrowserClient();
  async function refresh() {
    const { data, error } = await supabase.from("store_coupons").select("*").order("code");
    if (error) setFormError(`${error.message}. Run database/supabase-marketplace.sql first.`);
    else setItems((data || []).map(couponFromRow));
  }
  useEffect(() => { refresh(); }, []);
  function edit(item) { setModal(item ? { ...item } : { ...blank }); setSelectedCategories(item?.categories || []); setFormError(""); }
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const coupon = { ...modal, code: String(data.get("code") ?? modal.code).trim().toUpperCase().replace(/\s+/g, ""), type: data.get("type"), value: Number(data.get("value") || 0), minimum: Number(data.get("minimum") || 0), maximum: Number(data.get("maximum") || 0) || undefined, expiresAt: data.get("expiresAt") || "", description: data.get("description"), categories: selectedCategories.length ? selectedCategories : undefined, active: modal.active !== false };
    if (items.some(item => item.code === coupon.code && item.code !== modal.code)) { setFormError("That coupon code already exists. Choose a different code."); return; }
    const { error } = await supabase.from("store_coupons").upsert({ code: coupon.code, discount_type: coupon.type, discount_value: coupon.value, minimum: coupon.minimum, maximum: coupon.maximum || null, description: coupon.description, categories: coupon.categories || [], expires_at: coupon.expiresAt || null, active: coupon.active !== false });
    if (error) { setFormError(error.message); return; }
    setModal(null); refresh();
  }
  async function toggle(item) { const { error } = await supabase.from("store_coupons").update({ active: item.active === false }).eq("code", item.code); if (error) setFormError(error.message); else refresh(); }
  async function remove(item) { if (window.confirm(`Delete coupon ${item.code}?`)) { const { error } = await supabase.from("store_coupons").delete().eq("code", item.code); if (error) setFormError(error.message); else refresh(); } }
  const activeCount = items.filter(item => item.active !== false).length;
  return <>
    <div className="admin-page-heading"><div><h1>Coupons</h1><p>Create percentage, fixed amount, and free shipping offers for the storefront.</p></div><button className="admin-primary" onClick={() => edit(null)}>＋ Create coupon</button></div>
    <section className="admin-kpis"><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>All coupon codes</span><span className="admin-kpi-icon">%</span></div><strong>{items.length}</strong><small>Available in this browser</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Active codes</span><span className="admin-kpi-icon">✓</span></div><strong>{activeCount}</strong><small>Can be applied at checkout</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Discount types</span><span className="admin-kpi-icon">◇</span></div><strong>{new Set(items.map(item => item.type)).size}</strong><small>Percent, fixed, free delivery</small></article><article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Targeted offers</span><span className="admin-kpi-icon">⌖</span></div><strong>{items.filter(item => item.categories?.length).length}</strong><small>Limited to selected categories</small></article></section>
    <section className="admin-card"><div className="admin-card-title"><div><h2>Coupon codes</h2><p>Customers can apply active codes from the cart or checkout.</p></div><span className="admin-status shipped">Store offers</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CODE</th><th>OFFER</th><th>MINIMUM SPEND</th><th>ELIGIBLE CATEGORIES</th><th>EXPIRY</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.map(item => <tr key={item.code}><td><strong>{item.code}</strong><small className="admin-order-items">{item.description}</small></td><td>{item.type === "percent" ? `${item.value}% off${item.maximum ? ` · max ${money(item.maximum)}` : ""}` : item.type === "fixed" ? `${money(item.value)} off` : "Free shipping"}</td><td>{money(item.minimum || 0)}</td><td>{item.categories?.join(", ") || "All products"}</td><td>{item.expiresAt || "No expiry"}</td><td><span className={`admin-status ${item.active === false ? "cancelled" : ""}`}>{item.active === false ? "Inactive" : "Active"}</span></td><td><div className="admin-table-actions"><button className="admin-icon-button" title="Edit coupon" onClick={() => edit(item)}>✎</button><button className="admin-icon-button" title={item.active === false ? "Activate coupon" : "Deactivate coupon"} onClick={() => toggle(item)}>{item.active === false ? "▶" : "Ⅱ"}</button><button className="admin-icon-button" title="Delete coupon" onClick={() => remove(item)}>⌫</button></div></td></tr>)}</tbody></table></div></section>
    {modal && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="coupon-form-title"><div className="admin-modal-head"><div><h2 id="coupon-form-title">{items.some(item => item.code === modal.code) ? "Edit coupon" : "Create coupon"}</h2><p>Set the offer terms and optional product categories.</p></div><button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button></div><form onSubmit={submit}><div className="admin-form-grid"><label className="admin-field">Coupon code<input name="code" required defaultValue={modal.code} placeholder="SAVE10" disabled={items.some(item => item.code === modal.code)}/></label><label className="admin-field">Discount type<SearchableSelect name="type" defaultValue={modal.type} options={[{ label: "Percentage off", value: "percent" }, { label: "Fixed amount off", value: "fixed" }, { label: "Free shipping", value: "free-shipping" }]} ariaLabel="Discount type"/></label><label className="admin-field">Discount value<input name="value" type="number" min="0" required defaultValue={modal.value}/></label><label className="admin-field">Minimum spend (RWF)<input name="minimum" type="number" min="0" defaultValue={modal.minimum}/></label><label className="admin-field">Maximum discount (RWF)<input name="maximum" type="number" min="0" defaultValue={modal.maximum || ""} placeholder="No cap"/></label><label className="admin-field">Expiry date<input name="expiresAt" type="date" defaultValue={modal.expiresAt || ""}/></label><label className="admin-field wide">Offer description<input name="description" required defaultValue={modal.description || ""} placeholder="Explain this offer"/></label></div>{formError && <p className="coupon-error">{formError}</p>}<div className="coupon-category-choices"><b>Categories · leave all unchecked for every product</b><div>{categories.map(category => <label key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={event => setSelectedCategories(current => event.target.checked ? [...current, category] : current.filter(item => item !== category))}/>{category}</label>)}</div></div><div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setModal(null)}>Cancel</button><button className="admin-primary">Save coupon</button></div></form></section></div>}
  </>;
}
