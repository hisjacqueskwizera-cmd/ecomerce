"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, uniqueRealtimeTopic } from "../lib/supabase/client";
import { productFromRow } from "../lib/marketplace-db";
import { products as starterProducts } from "../lib/catalog";

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState([]);
  useEffect(() => {
    let alive = true;
    let channel;
    let supabaseClient;

    const load = async () => {
      try {
        supabaseClient = createSupabaseBrowserClient();
        const { data, error } = await supabaseClient.from("catalog_products").select("*").eq("active", true).order("created_at");
        if (alive && !error && data?.length) setCatalogProducts(data.map(productFromRow));
        if (alive && (error || !data?.length)) setCatalogProducts(starterProducts);
        return supabaseClient;
      } catch {
        if (alive) setCatalogProducts(starterProducts);
        return null;
      }
    };

    load().then(supabase => {
      if (!supabase || !alive) return;
      channel = supabase.channel(uniqueRealtimeTopic("catalog-products-live")).on("postgres_changes", { event: "*", schema: "public", table: "catalog_products" }, load).subscribe();
    });

    return () => {
      alive = false;
      if (channel && supabaseClient) supabaseClient.removeChannel(channel);
    };
  }, []);
  return catalogProducts;
}
