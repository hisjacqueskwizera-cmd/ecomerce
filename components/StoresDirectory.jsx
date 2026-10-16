"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sellers as sampleSellers } from "../lib/catalog";
import { createSupabaseBrowserClient } from "../lib/supabase/client";
import { PageTitle } from "./StoreChrome";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function StoresDirectory() {
  const config = useStorefrontConfig();
  const [sellers, setSellers] = useState(sampleSellers);

  useEffect(() => {
    let current = true;
    async function loadStores() {
      try {
        const { data, error } = await createSupabaseBrowserClient()
          .from("seller_stores")
          .select("slug, name, category, location, description, tone, status")
          .eq("status", "active")
          .order("name");
        if (error) return;
        if (current) setSellers((data || []).map(store => ({ ...store, mark: store.name.slice(0, 1).toUpperCase() })));
      } catch { /* Keep the sample directory visible until Supabase is configured. */ }
    }
    loadStores();
    return () => { current = false; };
  }, []);

  return <>
    <PageTitle eyebrow={config.stores.eyebrow} title={config.stores.title} description={config.stores.description} />
    <div className="store-directory">
      {sellers.map(seller => <article className="store-directory-card" key={seller.slug}>
        <Link href={`/stores/${seller.slug}`} className={`store-cover ${seller.tone}`}>
          <span className="seller-mark">{seller.mark}</span>
          <span className="store-cover-label">INDEPENDENT STORE</span>
        </Link>
        <div className="store-card-info">
          <span className="eyebrow">{seller.location}</span>
          <h2>{seller.name}</h2>
          <b>{seller.category}</b>
          <p>{seller.description}</p>
          <Link className="text-link" href={`/stores/${seller.slug}`}>Visit store →</Link>
        </div>
      </article>)}
    </div>
    {!sellers.length && <div className="empty-state"><h2>No active stores yet</h2><p>Check back soon to discover independent stores.</p></div>}
    <section className="seller-signup-callout">
      <div>
        <span className="eyebrow">HAVE A STORE OF YOUR OWN?</span>
        <h2>Bring your shop to Open Shop.</h2>
        <p>Tell us about your business and we’ll be in touch.</p>
      </div>
      <Link className="button-primary" href="/sell">Become a seller →</Link>
    </section>
  </>;
}
