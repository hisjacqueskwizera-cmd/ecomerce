import { redirect } from "next/navigation";
import AdminShell from "../../components/AdminShell";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function AdminLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) redirect("/login?next=/admin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle();

  if (error || profile?.role !== "super_admin") redirect("/account?access=denied");
  return <AdminShell>{children}</AdminShell>;
}
