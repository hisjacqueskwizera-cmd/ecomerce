"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, uniqueRealtimeTopic } from "../lib/supabase/client";
import { couponFromRow } from "../lib/coupons";

export function useCoupons() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const client = createSupabaseBrowserClient();
    let alive = true;
    const load = async () => {
      const { data, error } = await client.from("store_coupons").select("*").eq("active", true);
      if (alive && !error) setItems((data || []).map(couponFromRow));
    };
    load();
    const channel = client.channel(uniqueRealtimeTopic("coupon-list-live")).on("postgres_changes", { event: "*", schema: "public", table: "store_coupons" }, load).subscribe();
    return () => { alive = false; client.removeChannel(channel); };
  }, []);
  return items;
}
