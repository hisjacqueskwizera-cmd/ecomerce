"use client";

import Link from "next/link";
import { useStore } from "../../components/StoreProvider";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import { ProductGrid } from "../../components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  return <main><StoreLayout><PageTitle eyebrow="SAVED FOR LATER" title="Your wishlist" description="Products you have saved for a future order."/>{wishlist.length ? <ProductGrid items={wishlist}/> : <div className="empty-state"><span>♡</span><h2>Your wishlist is waiting</h2><p>Select the heart on a product to save it here.</p><Link className="button-primary" href="/shop">Browse products</Link></div>}</StoreLayout></main>;
}
