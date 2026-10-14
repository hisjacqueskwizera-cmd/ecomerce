import Link from "next/link";
import { notFound } from "next/navigation";
import { sellers } from "../../../lib/catalog";
import { StoreLayout } from "../../../components/StoreChrome";
import SellerProductCollection from "../../../components/SellerProductCollection";

export function generateStaticParams() { return sellers.map(seller => ({ slug: seller.slug })); }

export default async function SellerStorePage({ params }) {
  const { slug } = await params;
  const seller = sellers.find(item => item.slug === slug);
  if (!seller) notFound();
  return <main><StoreLayout><Link className="breadcrumbs" href="/stores">← All stores</Link><div className={`seller-hero ${seller.tone}`}><span className="seller-mark">{seller.mark}</span><span className="eyebrow">INDEPENDENT STORE · {seller.location.toUpperCase()}</span><h1>{seller.name}</h1><p>{seller.description}</p><span className="seller-hero-category">{seller.category}</span></div><SellerProductCollection seller={seller}/><div className="seller-trust-row"><span>✓ Carefully selected products</span><span>✓ 30-day returns</span><span>✓ Secure checkout</span></div></StoreLayout></main>;
}
