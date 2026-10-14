"use client";

import { sellerSlug } from "../lib/catalog";
import { PageTitle } from "./StoreChrome";
import { ProductGrid } from "./ProductCard";
import { useCatalogProducts } from "./useCatalogProducts";

export default function SellerProductCollection({ seller }) {
  const items = useCatalogProducts().filter(product => sellerSlug(product.seller) === seller.slug);
  return <>
    <PageTitle title={`Products from ${seller.name}`} description={`${items.length} products from this Open Shop seller.`}/>
    <ProductGrid items={items}/>
  </>;
}
