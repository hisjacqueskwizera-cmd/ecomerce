"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let browserClient;
let realtimeChannelSequence = 0;

export function uniqueRealtimeTopic(prefix) {
  realtimeChannelSequence += 1;
  const instanceId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${realtimeChannelSequence}`;
  return `${prefix}:${instanceId}`;
}

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, key } = getSupabaseConfig();
  browserClient = createBrowserClient(url, key);
  return browserClient;
}
