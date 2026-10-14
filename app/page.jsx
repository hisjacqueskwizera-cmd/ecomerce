"use client";

import Link from "next/link";
import { categories, sellers, money } from "../lib/catalog";
import { ProductGrid, ProductVisual } from "../components/ProductCard";
import NewsletterSignup from "../components/NewsletterSignup";
import StoreAdBanners from "../components/StoreAdBanners";
import { useCatalogProducts } from "../components/useCatalogProducts";
import { useStorefrontConfig } from "../components/useStorefrontConfig";

function BuyerBenefits() {
  return <section className="buyer-benefits"><div><span>✓</span><b>Rwanda-wide delivery</b><small>Choose from all 30 districts</small></div><div><span>✓</span><b>Independent local stores</b><small>Discover sellers across Rwanda</small></div><div><span>✓</span><b>Secure checkout</b><small>Clear RWF pricing at every step</small></div></section>;
}

export default function Home() {
  const config = useStorefrontConfig();
  const content = config.home;
  const sections = content.sections;
  const products = useCatalogProducts();
  const popularCategories = categories.filter(category => products.some(product => product.category === category)).slice(0, 8);
  const bestSellers = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
  const featuredProduct = products[0];

  return <main className="market-home"><div className="shell amazon-home-shell">
    <section className="amazon-hero">
      <div className="amazon-hero-copy"><span className="market-kicker">OPEN SHOP · RWANDA</span><h1>{content.heroTitle.split("\n").map((line, index) => <span key={index}>{index > 0 && <br/>}{line}</span>)}</h1><p>{content.heroText}</p><div className="amazon-hero-actions"><Link className="button-primary" href="/shop">Shop all products</Link><Link className="hero-secondary-link" href="/stores">Discover local stores</Link></div><div className="hero-location-note">Delivery to all 30 districts · Prices in RWF</div></div>
      {featuredProduct && <Link href={`/product/${featuredProduct.slug}`} className="amazon-hero-product"><ProductVisual product={featuredProduct} large/><span>Featured product <b>{featuredProduct.name}</b><strong>{money(featuredProduct.price)}</strong></span></Link>}
      <div className="hero-promotion-tag">LOCAL PRODUCTS <b>ALL IN ONE PLACE</b></div>
    </section>

    {sections.departments.active && <section className="market-panel category-panel"><div className="market-panel-heading"><div><span className="market-kicker">{sections.departments.eyebrow}</span><h2>{sections.departments.title}</h2></div><Link href="/shop">Browse all departments <span>→</span></Link></div><div className="amazon-department-grid">{popularCategories.map((category, index) => <Link href={`/shop?category=${encodeURIComponent(category)}`} className={`amazon-department department-${index + 1}`} key={category}><span>{category.slice(0, 1)}</span><b>{category}</b><small>Shop now →</small></Link>)}</div></section>}

    <StoreAdBanners placement="after_departments"/>

    {sections.popular.active && <section className="market-panel deals-panel"><div className="market-panel-heading"><div><span className="market-kicker">{sections.popular.eyebrow}</span><h2>{sections.popular.title}</h2></div><Link href="/shop?sort=popular">See all products <span>→</span></Link></div><ProductGrid items={bestSellers}/></section>}

    <StoreAdBanners placement="after_popular"/>

    {sections.promotions.active && <section className="home-promo-grid"><article className="home-promo-card promo-yellow"><span className="market-kicker">{sections.promotions.eyebrow}</span><h2>{sections.promotions.title}</h2><p>{sections.promotions.text}</p><Link href="/shop?sort=popular">Explore offers <span>→</span></Link></article><article className="home-promo-card promo-blue"><span className="market-kicker">SELL ON OPEN SHOP</span><h2>Bring your store online</h2><p>Reach customers from Kigali to every district.</p><Link href="/sell">Start selling <span>→</span></Link></article><article className="home-promo-card promo-green"><span className="market-kicker">PROPERTY MARKETPLACE</span><h2>Homes, land, and spaces</h2><p>Browse real estate listings from local providers.</p><Link href="/shop?category=Real%20Estate">View properties <span>→</span></Link></article></section>}

    {sections.newArrivals.active && <section className="market-panel"><div className="market-panel-heading"><div><span className="market-kicker">{sections.newArrivals.eyebrow}</span><h2>{sections.newArrivals.title}</h2></div><Link href="/shop?sort=newest">Shop new arrivals <span>→</span></Link></div><ProductGrid items={products.slice(4, 9)}/></section>}

    {sections.stores.active && <section className="market-panel seller-panel"><div className="market-panel-heading"><div><span className="market-kicker">{sections.stores.eyebrow}</span><h2>{sections.stores.title}</h2></div><Link href="/stores">All stores <span>→</span></Link></div><div className="amazon-seller-grid">{sellers.slice(0, 6).map(seller => <Link className="amazon-seller-card" href={`/stores/${seller.slug}`} key={seller.slug}><span className={`seller-mark ${seller.tone}`}>{seller.mark}</span><span><b>{seller.name}</b><small>{seller.category}</small><em>{seller.location}</em></span><strong>Visit store →</strong></Link>)}</div></section>}

    {sections.bestSellers.active && <section className="market-panel"><div className="market-panel-heading"><div><span className="market-kicker">{sections.bestSellers.eyebrow}</span><h2>{sections.bestSellers.title}</h2></div><Link href="/shop?sort=popular">See all best sellers <span>→</span></Link></div><ProductGrid items={bestSellers}/></section>}

    {sections.benefits.active && <BuyerBenefits/>}
    {sections.newsletter.active && <section className="amazon-newsletter"><div><span className="market-kicker">THE OPEN SHOP EDIT</span><h2>{config.chrome.newsletterTitle}</h2><p>{config.chrome.newsletterText}</p></div><NewsletterSignup/></section>}
  </div></main>;
}
