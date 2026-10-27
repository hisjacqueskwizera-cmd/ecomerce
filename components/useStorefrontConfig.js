"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, uniqueRealtimeTopic } from "../lib/supabase/client";
import { defaultStorefrontConfig, mergeStorefrontConfig } from "../lib/storefront-config";

export function useStorefrontConfig() {
  const [config, setConfig] = useState(defaultStorefrontConfig);
  useEffect(() => {
    let alive = true;
    let supabase;
    let channel;

    const refresh = async () => {
      try {
        supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from("storefront_settings").select("setting_value").eq("setting_key", "main").maybeSingle();
        if (alive && !error && data?.setting_value) setConfig(mergeStorefrontConfig(data.setting_value));
        return supabase;
      } catch {
        return null;
      }
    };

    refresh().then(client => {
      if (!client || !alive) return;
      channel = client.channel(uniqueRealtimeTopic("storefront-settings-live")).on("postgres_changes", { event: "*", schema: "public", table: "storefront_settings", filter: "setting_key=eq.main" }, refresh).subscribe();
    });

    return () => {
      alive = false;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);
  return config;
}

export async function updateStorefrontConfig(config) {
  const merged = mergeStorefrontConfig(config);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("storefront_settings").upsert({ setting_key: "main", setting_value: merged, updated_at: new Date().toISOString() });
  if (error) throw error;
  return merged;
}
