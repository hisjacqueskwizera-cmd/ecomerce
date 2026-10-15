"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { categories } from "../lib/catalog";
import { PageTitle } from "./StoreChrome";
import { ProductGrid } from "./ProductCard";
import { useCatalogProducts } from "./useCatalogProducts";
import { useStorefrontConfig } from "./useStorefrontConfig";

export default function ProductListing({ initialQuery = "", fixedCategory = "" }) {
  const params = useSearchParams();
  const queryParam = params.get("q") || initialQuery;
  const categoryParam = fixedCategory || params.get("category") || "";
  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [maxPrice, setMaxPrice] = useState(500000000);
  const [salesOnly, setSalesOnly] = useState(false);
  const catalogProducts = useCatalogProducts();
  const storefrontConfig = useStorefrontConfig();

  useEffect(() => {
    setQuery(queryParam);
    setCategory(categoryParam);
    setSort(params.get("sort") || "featured");
  }, [queryParam, categoryParam, params]);

  const results = useMemo(() => {
    let result = catalogProducts.filter(product => (!category || product.category.toLowerCase() === category.toLowerCase()) && `${product.name} ${product.category} ${product.seller}`.toLowerCase().includes(query.trim().toLowerCase()) && product.price <= maxPrice && (!salesOnly || product.oldPrice));
    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "popular") result = [...result].sort((a, b) => b.reviews - a.reviews);
    return result;
  }, [catalogProducts, category, query, maxPrice, salesOnly, sort]);

  return <>
    <PageTitle eyebrow={storefrontConfig.shop.eyebrow} title={query ? `Search results for “${query}”` : category || "Shop all products"} description={storefrontConfig.shop.description}/>
    <div className="listing-layout"><aside className="filter-panel"><div className="filter-title"><h3>Filter products</h3><button onClick={() => { setCategory(""); setMaxPrice(500000000); setSalesOnly(false); setQuery(""); }}>Clear all</button></div><label className="filter-label">Search<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, store, category"/></label><div className="filter-group"><b>Categories</b><button className={!category ? "filter-option selected" : "filter-option"} onClick={() => setCategory("")}>All products <span>{catalogProducts.length}</span></button>{categories.map(item => <button key={item} className={category === item ? "filter-option selected" : "filter-option"} onClick={() => setCategory(category === item ? "" : item)}>{item}<span>{catalogProducts.filter(p => p.category === item).length}</span></button>)}</div><div className="filter-group"><b>Maximum price</b><input className="price-range" type="range" min="10000" max="500000000" step="1000000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))}/><span className="range-caption">Up to RWF {maxPrice.toLocaleString("en-RW")}</span></div><label className="check-option"><input type="checkbox" checked={salesOnly} onChange={event => setSalesOnly(event.target.checked)}/> On sale</label><div className="filter-help">Every order supports an independent shop.</div></aside>
      <section className="listing-results"><div className="listing-toolbar"><span><b>{results.length}</b> products</span><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newest arrivals</option><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><ProductGrid items={results} emptyMessage="Try another search, price range, or category." adPlacement="product_grid"/><div className="listing-tail"><span>Showing {results.length} of {results.length} products</span><Link href="/stores">Browse the stores behind these products →</Link></div></section></div>
  </>;
}
