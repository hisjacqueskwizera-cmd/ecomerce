import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  let safeNext = "/account";
  if (next) {
    try {
      const target = new URL(next, origin);
      if (target.origin === origin) safeNext = `${target.pathname}${target.search}${target.hash}`;
    } catch { /* Keep the account page as the safe default. */ }
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, origin));
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", origin));
}
