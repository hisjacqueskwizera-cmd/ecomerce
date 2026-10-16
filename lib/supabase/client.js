"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let browserClient;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, key } = getSupabaseConfig();
  browserClient = createBrowserClient(url, key);
  return browserClient;
}
