"use client";

import Link from "next/link";
import { categories, sellers, money } from "../lib/catalog";
import { ProductGrid } from "../components/ProductCard";
import NewsletterSignup from "../components/NewsletterSignup";
import { useCatalogProducts } from "../components/useCatalogProducts";
import { useStorefrontConfig } from "../components/useStorefrontConfig";

const categoryFeatures = [
  { name: "Home & Decor", label: "Home & living", note: "Warm up your space" },
  { name: "Food & Groceries", label: "Food & pantry", note: "Good things, grown here" },
  { name: "Clothing", label: "Clothing", note: "Everyday pieces" },
  { name: "Phones & Electronics", label: "Electronics", note: "Useful by design" },
  { name: "Shoes", label: "Shoes", note: "Find your next pair" },
  { name: "Furniture", label: "Furniture", note: "Made for living" },
];

export default function Home() {
  const config = useStorefrontConfig();
  const content = config.home;
  const sections = content.sections;
  const products = useCatalogProducts();
  const availableCategories = categoryFeatures.filter(item => categories.includes(item.name) && products.some(product => product.category === item.name));
  const popularProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
  const popularIds = new Set(popularProducts.map(product => product.id));
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).filter(product => !popularIds.has(product.id)).slice(0, 4);
  const newArrivals = [...products].slice(-4).reverse();
  const featuredProduct = products.find(product => product.slug === "woven-cushion-cover") || products.find(product => product.slug === "ceramic-table-vase") || products[0];
  const headlineLines = content.heroTitle.split("\n");

  return <main className="home-main">
    <div className="site-container">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker"><i/> OPEN SHOP · RWANDA</span>
          <h1>{headlineLines.map((line, index) => <span key={index}>{index > 0 && <br/>}{line}</span>)}</h1>
          <p>{content.heroText}</p>
          <div className="home-hero-actions"><Link className="button-primary" href="/shop">Explore the marketplace <span aria-hidden="true">↗</span></Link><Link className="hero-text-link" href="/stores">Meet the stores <span aria-hidden="true">→</span></Link></div>
          <div className="hero-note"><span className="hero-note-mark">✳</span><span>From Kigali to every district<small>Independent stores. One easy place to shop.</small></span></div>
        </div>
        <div className="home-hero-visual">
          <img className="hero-shop-photo" src="/images/catalog/rubavu-shop-space.jpg" alt="A welcoming independent home and lifestyle shop in Rwanda"/>
          <div className="hero-image-caption"><span>LOCAL STORES, GOOD FINDS</span><b>Worth finding.</b></div>
          {featuredProduct && <Link href={`/product/${featuredProduct.slug}`} className="hero-feature-card"><img src={featuredProduct.photo || "/images/catalog/woven-cushion-cover.jpg"} alt=""/><span><small>AN OPEN SHOP PICK</small><b>{featuredProduct.name}</b><em>{money(featuredProduct.price)}</em></span><span className="hero-feature-arrow" aria-hidden="true">↗</span></Link>}
          <span className="hero-side-note">LOCAL FINDS · 01</span>
        </div>
      </section>

      {sections.benefits.active && <section className="home-trust-row" aria-label="Shopping benefits"><span><i/> Clear prices in RWF</span><span><i/> Delivery across Rwanda</span><span><i/> Independent local sellers</span><Link href="/shipping">How delivery works <b aria-hidden="true">↗</b></Link></section>}

      {sections.departments.active && <section className="home-section category-section">
        <div className="home-section-heading"><div><span className="section-eyebrow">{sections.departments.eyebrow}</span><h2>{sections.departments.title}</h2></div><Link className="section-link" href="/shop">All departments <span aria-hidden="true">↗</span></Link></div>
        <div className="category-feature-grid">{availableCategories.map((category, index) => <Link className="category-feature" href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}><span className="category-feature-index">0{index + 1}</span><span className="category-feature-copy"><b>{category.label}</b><small>{category.note}</small></span><span className="category-feature-arrow" aria-hidden="true">↗</span></Link>)}</div>
      </section>}

      {sections.popular.active && <section className="home-section product-section">
        <div className="home-section-heading"><div><span className="section-eyebrow">{sections.popular.eyebrow}</span><h2>{sections.popular.title}</h2></div><Link className="section-link" href="/shop?sort=popular">See all products <span aria-hidden="true">↗</span></Link></div>
        <ProductGrid items={popularProducts}/>
      </section>}

      {sections.promotions.active && <section className="home-story-band"><div className="story-band-image"><img src="/images/catalog/woven-cushion-cover.jpg" alt="A textured home accent from an independent local seller"/></div><div className="story-band-copy"><span className="section-eyebrow">{sections.promotions.eyebrow}</span><h2>{sections.promotions.title}</h2><p>{sections.promotions.text}</p><Link href="/shop?sort=popular" className="button-light">Explore current offers <span aria-hidden="true">↗</span></Link></div><span className="story-band-number">02 / 03</span></section>}

      {sections.newArrivals.active && <section className="home-section product-section">
        <div className="home-section-heading"><div><span className="section-eyebrow">{sections.newArrivals.eyebrow}</span><h2>{sections.newArrivals.title}</h2></div><Link className="section-link" href="/shop?sort=newest">Shop new arrivals <span aria-hidden="true">↗</span></Link></div>
        <ProductGrid items={newArrivals}/>
      </section>}

      {sections.stores.active && <section className="home-section stores-section">
        <div className="home-section-heading"><div><span className="section-eyebrow">{sections.stores.eyebrow}</span><h2>{sections.stores.title}</h2></div><Link className="section-link" href="/stores">Browse all stores <span aria-hidden="true">↗</span></Link></div>
        <div className="home-stores-grid">{sellers.slice(0, 3).map((seller, index) => <Link className="home-store-card" href={`/stores/${seller.slug}`} key={seller.slug}><span className={`home-store-mark ${seller.tone}`}>{seller.mark}</span><span className="home-store-info"><small>0{index + 1} · {seller.location.split(",")[0]}</small><b>{seller.name}</b><em>{seller.category}</em></span><span className="home-store-arrow" aria-hidden="true">↗</span></Link>)}</div>
      </section>}

      {sections.bestSellers.active && <section className="home-section product-section">
        <div className="home-section-heading"><div><span className="section-eyebrow">{sections.bestSellers.eyebrow}</span><h2>{sections.bestSellers.title}</h2></div><Link className="section-link" href="/shop?sort=popular">See all best sellers <span aria-hidden="true">↗</span></Link></div>
        <ProductGrid items={bestSellers}/>
      </section>}

      {sections.newsletter.active && <section className="home-newsletter"><div><span className="section-eyebrow">THE OPEN SHOP EDIT</span><h2>{config.chrome.newsletterTitle}</h2><p>{config.chrome.newsletterText}</p></div><NewsletterSignup/></section>}
    </div>
  </main>;
}
