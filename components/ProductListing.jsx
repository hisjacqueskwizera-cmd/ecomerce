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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    if (sort === "newest") result = [...result].reverse();
    return result;
  }, [catalogProducts, category, query, maxPrice, salesOnly, sort]);

  function clearFilters() {
    setCategory("");
    setMaxPrice(500000000);
    setSalesOnly(false);
    setQuery("");
    setSort("featured");
  }

  return <div className="market-listing-page">
    <PageTitle eyebrow={storefrontConfig.shop.eyebrow} title={query ? `Search results for “${query}”` : category || "Shop all products"} description={storefrontConfig.shop.description}/>
    <nav className="listing-department-strip" aria-label="Shop departments">
      <button className={!category ? "selected" : ""} onClick={() => setCategory("")}>All departments</button>
      {categories.map(item => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(category === item ? "" : item)}>{item}</button>)}
    </nav>
    <div className="listing-layout">
      <aside className="filter-panel">
        <div className="filter-title"><button onClick={clearFilters}>Clear all</button><button className="mobile-filter-toggle" onClick={() => setFiltersOpen(open => !open)} aria-expanded={filtersOpen}>{filtersOpen ? "Hide filters −" : "More filters +"}</button></div>
        <label className="filter-label">Search<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Product, store, department"/></label>
        <div className={`filter-facets ${filtersOpen ? "is-open" : ""}`}>
          <div className="filter-group"><b>Department</b><button className={!category ? "filter-option selected" : "filter-option"} onClick={() => setCategory("")}>All products <span>{catalogProducts.length}</span></button>{categories.map(item => <button key={item} className={category === item ? "filter-option selected" : "filter-option"} onClick={() => setCategory(category === item ? "" : item)}>{item}<span>{catalogProducts.filter(product => product.category === item).length}</span></button>)}</div>
          <div className="filter-group"><b>Price range</b><input className="price-range" type="range" min="10000" max="500000000" step="1000000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))}/><span className="range-caption">Up to RWF {maxPrice.toLocaleString("en-RW")}</span></div>
          <div className="filter-group filter-sale-group"><b>Special offers</b><label className="check-option"><input type="checkbox" checked={salesOnly} onChange={event => setSalesOnly(event.target.checked)}/> On sale</label></div>
        </div>
        <div className="filter-help">Browse independent Rwanda-based sellers. Prices are shown in RWF.</div>
      </aside>
      <section className="listing-results">
        <div className="listing-results-heading"><div><span className="listing-kicker">JASHAMART MARKETPLACE</span><b>{results.length} results</b><small>{category || "Products from independent stores"}{query ? ` matching “${query}”` : ""}</small></div><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newly listed</option><option value="popular">Most popular</option><option value="price-low">Price: lowest first</option><option value="price-high">Price: highest first</option></select></label></div>
        <div className="listing-results-note"><span>Local sellers · Clear RWF pricing</span><span>{results.length ? `Showing ${results.length} items` : "No matching items"}</span></div>
        <ProductGrid items={results} emptyMessage="Try another search, price range, or department." adPlacement="product_grid"/>
        <div className="listing-tail"><span>Showing {results.length} of {results.length} products</span><Link href="/stores">Browse the stores behind these products →</Link></div>
      </section>
    </div>
  </div>;
}
