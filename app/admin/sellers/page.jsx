"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { products } from "../../../lib/catalog";
import { SELLER_APPLICATIONS_KEY, readStored, saveStored } from "../../../lib/admin-data";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import SearchableSelect from "../../../components/SearchableSelect";

const statusOptions = ["pending", "active", "suspended", "closed"];
const toneOptions = ["seller-blue", "seller-sand", "seller-coral", "seller-lilac", "seller-mint"];
const emptyStore = { name: "", slug: "", category: "", location: "", description: "", tone: "seller-blue", status: "pending", owner_id: "" };
const roleSetupMessage = "Apply database/supabase-auth.sql in your Supabase SQL Editor to enable seller management.";

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function displayStatus(status) {
  return status ? status[0].toUpperCase() + status.slice(1) : "Pending";
}

export default function AdminSellersPage() {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const [storeResult, userResult] = await Promise.all([
        supabase.from("seller_stores").select("*").order("name"),
        supabase.rpc("admin_list_users"),
      ]);
      if (storeResult.error) {
        const missingTable = storeResult.error.code === "PGRST205" || storeResult.error.code === "42P01";
        throw new Error(missingTable ? roleSetupMessage : storeResult.error.message);
      }
      setStores(storeResult.data || []);
      if (userResult.error) {
        setUsers([]);
        setError(`Stores loaded, but seller accounts could not be loaded: ${userResult.error.message}`);
      } else setUsers(userResult.data || []);
    } catch (loadError) {
      setError(loadError.message || roleSetupMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setApplications(readStored(SELLER_APPLICATIONS_KEY, []));
  }, [load]);

  const activeStores = useMemo(() => stores.filter(store => store.status === "active"), [stores]);
  const districtCount = useMemo(() => new Set(stores.map(store => store.location.split(",")[0].trim()).filter(Boolean)).size, [stores]);
  const sellerAccounts = useMemo(() => users.filter(user => user.role === "seller"), [users]);

  function updateApplication(id, status) {
    const next = applications.map(item => item.id === id ? { ...item, status } : item);
    setApplications(next);
    saveStored(SELLER_APPLICATIONS_KEY, next);
  }

  function openEditor(store = null) {
    setFormError("");
    setSuccess("");
    setModal(store ? { ...store, owner_id: store.owner_id || "" } : { ...emptyStore });
  }

  async function saveStore(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const slug = slugify(String(form.get("slug") || ""));
    if (!name || !slug) {
      setFormError("Enter a store name and a URL-safe store slug.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug,
      category: String(form.get("category") || "").trim(),
      location: String(form.get("location") || "").trim(),
      description: String(form.get("description") || "").trim(),
      tone: String(form.get("tone") || "seller-blue"),
      status: String(form.get("status") || "pending"),
      owner_id: String(form.get("owner_id") || "") || null,
    };

    try {
      const supabase = createSupabaseBrowserClient();
      const query = modal.id
        ? supabase.from("seller_stores").update(payload).eq("id", modal.id)
        : supabase.from("seller_stores").insert(payload);
      const { data, error: saveError } = await query.select().single();
      if (saveError) throw saveError;
      setStores(current => {
        const next = modal.id ? current.map(store => store.id === modal.id ? data : store) : [...current, data];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setModal(null);
      setSuccess(modal.id ? "Store updated." : "Store created.");
    } catch (saveError) {
      setFormError(saveError.code === "23505" ? "That store slug is already in use." : saveError.message || "The store could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStore(store) {
    if (!window.confirm(`Delete ${store.name}? This removes the store listing.`)) return;
    setError("");
    setSuccess("");
    const { error: deleteError } = await createSupabaseBrowserClient().from("seller_stores").delete().eq("id", store.id);
    if (deleteError) setError(deleteError.message);
    else {
      setStores(current => current.filter(item => item.id !== store.id));
      setSuccess(`${store.name} deleted.`);
    }
  }

  function ownerLabel(user) {
    return user.full_name ? `${user.full_name} · ${user.email}` : user.email;
  }

  return <>
    <div className="admin-page-heading"><div><h1>Sellers</h1><p>Create and manage store listings, assign seller accounts, and review seller enquiries.</p></div><button className="admin-primary" onClick={() => openEditor()}>＋ Add seller</button></div>
    {error && <p className="coupon-error" role="alert">{error}</p>}
    {success && <p className="coupon-success" role="status">{success}</p>}
    <section className="admin-kpis">
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Active stores</span><span className="admin-kpi-icon">♙</span></div><strong>{activeStores.length}</strong><small>Visible in the store directory</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>Listed products</span><span className="admin-kpi-icon">◇</span></div><strong>{products.length}</strong><small>Across the current catalog</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>New enquiries</span><span className="admin-kpi-icon">✉</span></div><strong>{applications.filter(item => (item.status || "New") === "New").length}</strong><small>From the seller interest form</small></article>
      <article className="admin-card admin-kpi"><div className="admin-kpi-top"><span>District reach</span><span className="admin-kpi-icon">⌖</span></div><strong>{districtCount}</strong><small>Districts with store listings</small></article>
    </section>

    <section className="admin-card"><div className="admin-card-title"><div><h2>Store listings</h2><p>Active stores are visible in the public directory. Assign an account with the Seller role.</p></div><button className="admin-secondary" onClick={load} disabled={loading}>Refresh list</button></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>STORE</th><th>LOCATION</th><th>SELLER ACCOUNT</th><th>CATEGORY</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
        {stores.map(store => {
          const owner = users.find(user => user.user_id === store.owner_id);
          return <tr key={store.id}>
            <td><div className="admin-customer"><span className={`seller-mark ${store.tone}`}>{store.name.slice(0, 1).toUpperCase()}</span><span><strong>{store.name}</strong><small>/{store.slug}</small></span></div></td>
            <td>{store.location || "—"}</td><td>{owner ? ownerLabel(owner) : "Unassigned"}</td><td>{store.category || "—"}</td>
            <td><span className={`admin-status ${store.status === "active" ? "shipped" : store.status === "suspended" || store.status === "closed" ? "cancelled" : ""}`}>{displayStatus(store.status)}</span></td>
            <td><div className="admin-table-actions"><button className="admin-icon-button" title={`Edit ${store.name}`} onClick={() => openEditor(store)}>✎</button><button className="admin-icon-button" title={`Delete ${store.name}`} onClick={() => deleteStore(store)}>⌫</button></div></td>
          </tr>;
        })}
      </tbody></table>{loading ? <div className="admin-empty">Loading stores…</div> : !stores.length && !error ? <div className="admin-empty">No store records yet. Add a seller to create the first store listing.</div> : null}</div>
    </section>

    <section className="admin-card" style={{ marginTop: 16 }}><div className="admin-card-title"><div><h2>Seller enquiries</h2><p>Applications sent from the storefront seller form.</p></div></div>{applications.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CONTACT</th><th>STORE</th><th>DISTRICT</th><th>PRODUCT TYPE</th><th>STATUS</th></tr></thead><tbody>{applications.map(item => <tr key={item.id}><td><strong>{item.name}</strong><small className="admin-order-items">{item.email}</small></td><td>{item.store}</td><td>{item.district}</td><td>{item.category}</td><td><SearchableSelect className="admin-filter" value={item.status || "New"} options={["New", "Contacted", "Approved"]} ariaLabel={`Seller enquiry status for ${item.store}`} onChange={event => updateApplication(item.id, event.target.value)}/></td></tr>)}</tbody></table></div> : <div className="admin-empty">No seller enquiries yet. New submissions will appear here.</div>}</section>

    {modal && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setModal(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="seller-form-title"><div className="admin-modal-head"><div><h2 id="seller-form-title">{modal.id ? "Edit seller store" : "Add seller store"}</h2><p>Manage its public listing and linked Seller account.</p></div><button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Close" disabled={saving}>×</button></div>
      <form onSubmit={saveStore}><div className="admin-form-grid">
        <label className="admin-field">Store name<input name="name" required maxLength={120} defaultValue={modal.name} placeholder="Example Store"/></label>
        <label className="admin-field">Store slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={modal.slug || slugify(modal.name)} placeholder="example-store"/><small>Used in the store URL.</small></label>
        <label className="admin-field">Category<input name="category" maxLength={120} defaultValue={modal.category} placeholder="What the store sells"/></label>
        <label className="admin-field">Location<input name="location" maxLength={160} defaultValue={modal.location} placeholder="District, Province"/></label>
        <label className="admin-field">Seller account<select name="owner_id" defaultValue={modal.owner_id || ""}><option value="">No account linked</option>{sellerAccounts.map(user => <option key={user.user_id} value={user.user_id}>{ownerLabel(user)}</option>)}{modal.owner_id && !sellerAccounts.some(user => user.user_id === modal.owner_id) && users.find(user => user.user_id === modal.owner_id) && <option value={modal.owner_id}>{ownerLabel(users.find(user => user.user_id === modal.owner_id))} · change role</option>}</select><small>Manage account roles on the User roles page.</small></label>
        <label className="admin-field">Listing status<select name="status" defaultValue={modal.status}>{statusOptions.map(status => <option key={status} value={status}>{displayStatus(status)}</option>)}</select></label>
        <label className="admin-field">Card color<select name="tone" defaultValue={modal.tone}>{toneOptions.map(tone => <option key={tone} value={tone}>{tone.replace("seller-", "")}</option>)}</select></label>
        <label className="admin-field wide">Description<textarea name="description" maxLength={600} defaultValue={modal.description} placeholder="Describe the store and its products."/></label>
      </div>{formError && <p className="coupon-error" role="alert">{formError}</p>}<div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button><button className="admin-primary" disabled={saving}>{saving ? "Saving…" : "Save store"}</button></div></form>
    </section></div>}
  </>;
}
