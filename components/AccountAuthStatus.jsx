"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function AccountAuthStatus() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let current = true;
    async function loadAccount() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!current || !user) return;
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (current) setAccount({ email: user.email, role: profile?.role || "" });
      } catch { /* Sign-in remains optional for the local storefront demo. */ }
    }
    loadAccount();
    return () => { current = false; };
  }, []);

  if (!account) return <p className="account-auth-note"><Link href="/login">Sign in</Link> or <Link href="/signup">create an account</Link> to register with JashaMart.</p>;

  return <p className="account-auth-note">Signed in as <b>{account.email}</b>{account.role && <> · Role: <b>{account.role.replaceAll("_", " ")}</b></>} <button type="button" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); setAccount(null); }}>Sign out</button></p>;
}
