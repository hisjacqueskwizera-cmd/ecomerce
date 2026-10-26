"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { money, products as sampleProducts } from "../lib/catalog";
import { ProductVisual } from "../components/ProductCard";
import NewsletterSignup from "../components/NewsletterSignup";
import { useCatalogProducts } from "../components/useCatalogProducts";
import { useStore } from "../components/StoreProvider";

const featuredCategories = [
  { title: "Coke & Milk", symbol: "🥛🥤", href: "/shop?category=Food%20%26%20Groceries" },
  { title: "Organic Kiwi", symbol: "🥝", href: "/shop?category=Food%20%26%20Groceries" },
  { title: "Vegetables", symbol: "🥬", href: "/shop?category=Food%20%26%20Groceries" },
];

const groceryProductLabels = {
  "fresh-avocado-basket": "Fresh Avocados",
  "arabica-coffee-beans-500g": "Rwanda Arabica",
  "honey-raw-500g": "Raw Forest Honey",
  "maize-seed-5kg": "Maize Seed",
};

function GroceryProductCard({ product, deal = false, timer = [] }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.id);
  const title = groceryProductLabels[product.slug] || product.name;
  const priceUnit = product.priceUnit === "month" ? " / month" : product.priceUnit === "service" ? " / service" : "";
  return <article className={`grocery-product-card ${deal ? "is-deal" : ""}`}>
    <button className={`grocery-heart ${saved ? "is-saved" : ""}`} onClick={() => toggleWishlist(product)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>{saved ? "♥" : "♡"}</button>
    <Link href={`/product/${product.slug}`} className="grocery-product-art" aria-label={`View ${product.name}`}><ProductVisual product={product} showBadge={false}/></Link>
    {deal && <div className="grocery-deal-timer" aria-label="Daily offer countdown">{timer.map((part, index) => <span key={`${part}-${index}`}>{part}</span>).flatMap((part, index, parts) => index < parts.length - 1 ? [part, <i key={`separator-${index}`}>:</i>] : [part])}</div>}
    <div className="grocery-product-details">
      <Link href={`/product/${product.slug}`} className="grocery-product-name" title={product.name}>{title}</Link>
      <div className="grocery-price"><b>{money(product.price)}{priceUnit}</b>{product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}</div>
      <button className="grocery-add-button" onClick={() => addToCart(product)}>Add to cart</button>
    </div>
  </article>;
}

function SectionHeading({ title, onPrevious, onNext }) {
  return <div className="grocery-section-heading"><h2>{title}</h2><div className="grocery-section-arrows"><button onClick={onPrevious} aria-label={`Previous ${title}`}>‹</button><button onClick={onNext} aria-label={`Next ${title}`}>›</button></div></div>;
}

function rotate(items, offset, count) {
  if (!items.length) return [];
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(offset + index) % items.length]);
}

export default function Home() {
  const liveProducts = useCatalogProducts();
  const [popularOffset, setPopularOffset] = useState(0);
  const [dealOffset, setDealOffset] = useState(0);
  const [seconds, setSeconds] = useState(8 * 3600 + 16 * 60 + 42);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(value => value > 0 ? value - 1 : 8 * 3600 + 16 * 60 + 42), 1000);
    return () => clearInterval(timer);
  }, []);
  const groceryProducts = useMemo(() => {
    const live = liveProducts.filter(product => product.category === "Food & Groceries");
    if (live.length) return live;
    const fallback = sampleProducts.filter(product => product.category === "Food & Groceries");
    const farmStaple = sampleProducts.find(product => product.slug === "maize-seed-5kg");
    return farmStaple ? [...fallback, farmStaple] : fallback;
  }, [liveProducts]);
  const activeGroceryDeals = groceryProducts.filter(product => product.oldPrice && product.oldPrice > product.price);
  const dealProducts = activeGroceryDeals.length ? activeGroceryDeals : groceryProducts;
  const popularItems = rotate(groceryProducts, popularOffset, 4);
  const bestSellerItems = [groceryProducts.find(product => /salad|greens|vegetable/i.test(product.name)) || groceryProducts[0], groceryProducts.find(product => /honey/i.test(product.name)) || groceryProducts[1]].filter(Boolean);
  const dealItems = rotate(dealProducts, dealOffset, 5);
  const time = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, "0"));

  return <main className="grocery-home">
    <section className="grocery-hero" aria-label="Fresh vegetable offer">
      <div className="grocery-hero-image"><img src="/images/grocery-hero.webp" alt="A local grower holding a basket of fresh vegetables"/></div>
      <div className="grocery-hero-copy">
        <h1>Fresh Vegetables<br/>Big discount</h1>
        <p>Up to 50% off on all organic items this week!</p>
        <NewsletterSignup/>
      </div>
    </section>

    <div className="grocery-home-content">
      <section className="grocery-categories-section">
        <h2>Featured Categories</h2>
        <div className="grocery-category-grid">{featuredCategories.map(category => <Link className="grocery-category-card" href={category.href} key={category.title}><span aria-hidden="true">{category.symbol}</span><b>{category.title}</b></Link>)}</div>
      </section>

      <section className="grocery-products-section">
        <SectionHeading title="Popular Products" onPrevious={() => setPopularOffset(value => (value + groceryProducts.length - 1) % groceryProducts.length)} onNext={() => setPopularOffset(value => (value + 1) % groceryProducts.length)}/>
        <div className="grocery-popular-grid">{popularItems.map(product => <GroceryProductCard key={product.id} product={product}/>)}</div>
      </section>

      <section className="grocery-products-section grocery-best-sellers-section">
        <SectionHeading title="Daily Best Sells" onPrevious={() => setPopularOffset(value => (value + groceryProducts.length - 1) % groceryProducts.length)} onNext={() => setPopularOffset(value => (value + 1) % groceryProducts.length)}/>
        <div className="grocery-best-sellers-grid">
          <Link className="grocery-best-sellers-promo" href="/shop?category=Food%20%26%20Groceries"><span>Bring nature<br/>into your home</span><b>Shop now <i>→</i></b></Link>
          {bestSellerItems.map(product => <GroceryProductCard key={`best-${product.id}`} product={product}/>)}
        </div>
      </section>

      <section className="grocery-products-section grocery-deals-section">
        <SectionHeading title="Deals Of the Day" onPrevious={() => setDealOffset(value => (value + dealProducts.length - 1) % dealProducts.length)} onNext={() => setDealOffset(value => (value + 1) % dealProducts.length)}/>
        <div className="grocery-deal-grid">{dealItems.map(product => <GroceryProductCard key={`deal-${product.id}`} product={product} deal timer={["00", ...time]}/>)}</div>
      </section>
    </div>
  </main>;
}
