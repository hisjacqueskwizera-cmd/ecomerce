import Link from "next/link";
import { sellers } from "../../lib/catalog";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import { useStorefrontConfig } from "../../components/useStorefrontConfig";

export const metadata = { title: "Independent stores" };

export default function StoresPage() {
  const config = useStorefrontConfig();
  return <main><StoreLayout><PageTitle eyebrow={config.stores.eyebrow} title={config.stores.title} description={config.stores.description}/><div className="store-directory">{sellers.map(seller => <article className="store-directory-card" key={seller.slug}><Link href={`/stores/${seller.slug}`} className={`store-cover ${seller.tone}`}><span className="seller-mark">{seller.mark}</span><span className="store-cover-label">INDEPENDENT STORE</span></Link><div className="store-card-info"><span className="eyebrow">{seller.location}</span><h2>{seller.name}</h2><b>{seller.category}</b><p>{seller.description}</p><Link className="text-link" href={`/stores/${seller.slug}`}>Visit store →</Link></div></article>)}</div><section className="seller-signup-callout"><div><span className="eyebrow">HAVE A STORE OF YOUR OWN?</span><h2>Bring your shop to Open Shop.</h2><p>Tell us about your business and we’ll be in touch.</p></div><Link className="button-primary" href="/sell">Become a seller →</Link></section></StoreLayout></main>;
}
