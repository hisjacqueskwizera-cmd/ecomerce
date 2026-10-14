import { Suspense } from "react";
import { StoreLayout } from "../../components/StoreChrome";
import ProductListing from "../../components/ProductListing";

export const metadata = { title: "Shop all products" };

export default function ShopPage() {
  return <main><StoreLayout><Suspense fallback={<div className="loading-state">Loading products…</div>}><ProductListing/></Suspense></StoreLayout></main>;
}
