import Link from "next/link";
import { notFound } from "next/navigation";
import { sellers } from "../../../lib/catalog";
import { StoreLayout } from "../../../components/StoreChrome";
import SellerProductCollection from "../../../components/SellerProductCollection";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SellerStorePage({ params }) {
  const { slug } = await params;
  let seller;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seller_stores")
      .select("slug, name, category, location, description, tone")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (!error) seller = data ? { ...data, mark: data.name.slice(0, 1).toUpperCase() } : null;
    else seller = sellers.find(item => item.slug === slug);
  } catch {
    seller = sellers.find(item => item.slug === slug);
  }
  if (!seller) notFound();
  return <main><StoreLayout><Link className="breadcrumbs" href="/stores">← All stores</Link><div className={`seller-hero ${seller.tone}`}><span className="seller-mark">{seller.mark}</span><span className="eyebrow">INDEPENDENT STORE · {seller.location.toUpperCase()}</span><h1>{seller.name}</h1><p>{seller.description}</p><span className="seller-hero-category">{seller.category}</span></div><SellerProductCollection seller={seller}/><div className="seller-trust-row"><span>✓ Carefully selected products</span><span>✓ 30-day returns</span><span>✓ Secure checkout</span></div></StoreLayout></main>;
}
