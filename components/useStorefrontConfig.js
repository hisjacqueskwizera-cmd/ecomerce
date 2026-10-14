"use client";

import { useEffect, useState } from "react";
import { readStored, saveStored } from "../lib/admin-data";
import { defaultStorefrontConfig, mergeStorefrontConfig, STOREFRONT_CONFIG_KEY } from "../lib/storefront-config";

export function useStorefrontConfig() {
  const [config, setConfig] = useState(defaultStorefrontConfig);
  useEffect(() => {
    const refresh = () => setConfig(mergeStorefrontConfig(readStored(STOREFRONT_CONFIG_KEY, defaultStorefrontConfig)));
    const onStorage = event => { if (event.key === STOREFRONT_CONFIG_KEY || event.key === null) refresh(); };
    const onUpdate = event => { if (event.detail === STOREFRONT_CONFIG_KEY) refresh(); };
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("openshop:storage-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("openshop:storage-updated", onUpdate);
    };
  }, []);
  return config;
}

export function updateStorefrontConfig(config) {
  const merged = mergeStorefrontConfig(config);
  saveStored(STOREFRONT_CONFIG_KEY, merged);
  return merged;
}
