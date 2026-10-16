"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, uniqueRealtimeTopic } from "../lib/supabase/client";
import { productFromRow } from "../lib/marketplace-db";

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState([]);
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.from("catalog_products").select("*").eq("active", true).order("created_at");
      if (alive && !error) setCatalogProducts((data || []).map(productFromRow));
    };
    load();
    const channel = supabase.channel(uniqueRealtimeTopic("catalog-products-live")).on("postgres_changes", { event: "*", schema: "public", table: "catalog_products" }, load).subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, []);
  return catalogProducts;
}
