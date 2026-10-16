"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function AuthForm({ mode, next = "/account", initialMessage = "" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);
  const signingUp = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    try {
      const supabase = createSupabaseBrowserClient();
      if (signingUp) {
        const fullName = String(form.get("full_name") || "").trim();
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", "/account");
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: callbackUrl.toString(),
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.replace("/account");
          router.refresh();
        } else {
          setMessage("Check your email for a confirmation link. Your account role is assigned when registration is created.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (!data.session) throw new Error("Sign in did not create a session. Please try again.");
        let safeNext = "/account";
        if (typeof next === "string") {
          try {
            const target = new URL(next, window.location.origin);
            if (target.origin === window.location.origin) safeNext = `${target.pathname}${target.search}${target.hash}`;
          } catch { /* Keep the account page as the safe default. */ }
        }
        router.replace(safeNext);
        router.refresh();
      }
    } catch (authError) {
      setError(authError.message || "We could not complete sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="auth-form" onSubmit={submit}>
    {signingUp && <label>Full name<input name="full_name" autoComplete="name" required maxLength={120}/></label>}
    <label>Email address<input name="email" type="email" autoComplete="email" required/></label>
    <label>Password<input name="password" type="password" autoComplete={signingUp ? "new-password" : "current-password"} minLength={8} required/></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {message && <p className="auth-message" role="status">{message}</p>}
    <button className="button-primary" disabled={busy}>{busy ? "Please wait…" : signingUp ? "Create account" : "Sign in"}</button>
  </form>;
}
