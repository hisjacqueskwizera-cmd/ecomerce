import { Suspense } from "react";
import { StoreLayout } from "../../components/StoreChrome";
import ProductListing from "../../components/ProductListing";

export const metadata = { title: "Search the marketplace" };

export default function SearchPage() {
  return <main><StoreLayout><Suspense fallback={<div className="loading-state">Searching the marketplace…</div>}><ProductListing/></Suspense></StoreLayout></main>;
}
