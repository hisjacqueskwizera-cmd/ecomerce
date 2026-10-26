"use client";

import Link from "next/link";
import { categories, sellers } from "../lib/catalog";
import { ProductGrid } from "../components/ProductCard";
import NewsletterSignup from "../components/NewsletterSignup";
import { useCatalogProducts } from "../components/useCatalogProducts";
import { useStorefrontConfig } from "../components/useStorefrontConfig";

const categoryTiles = [
  { name: "Real Estate", label: "Homes & plots", symbol: "⌂", image: "/images/catalog/kicukiro-two-bedroom-apartment.jpg" },
  { name: "Furniture", label: "Furniture", symbol: "▤", image: "/images/catalog/wooden-dining-table.jpg" },
  { name: "Phones & Electronics", label: "Electronics", symbol: "◈", image: "/images/catalog/wireless-earbuds.jpg" },
  { name: "Quincaillerie & Construction", label: "Building & tools", symbol: "⚒", image: "" },
  { name: "Home & Decor", label: "Home & decor", symbol: "✳", image: "/images/catalog/woven-cushion-cover.jpg" },
  { name: "Food & Groceries", label: "Food & pantry", symbol: "✦", image: "" },
];

const heroTiles = [
  { name: "Furniture", label: "Furniture & home", image: "/images/catalog/wooden-dining-table.jpg" },
  { name: "Phones & Electronics", label: "Phones & tech", image: "/images/catalog/wireless-earbuds.jpg" },
  { name: "Home & Decor", label: "Home & decor", image: "/images/catalog/ceramic-table-vase.jpg" },
  { name: "Real Estate", label: "Homes & plots", image: "/images/catalog/kicukiro-two-bedroom-apartment.jpg" },
];

export default function Home() {
  const config = useStorefrontConfig();
  const sections = config.home.sections;
  const headlineLines = config.home.heroTitle.split("\n");
  const products = useCatalogProducts();
  const visibleCategories = categoryTiles.filter(item => categories.includes(item.name) && products.some(product => product.category === item.name));
  const featuredProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  const featuredIds = new Set(featuredProducts.map(product => product.id));
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).filter(product => !featuredIds.has(product.id)).slice(0, 6);
  const newArrivals = [...products].slice(-6).reverse();

  return <main className="market-home-blue">
    <div className="site-container">
      <section className="marketplace-welcome">
        <div className="marketplace-welcome-copy">
          <span className="blue-eyebrow">JASHAMART · RWANDA</span>
          <h1>{headlineLines.map((line, index) => <span key={index}>{index > 0 && <br/>}{index > 0 ? <em>{line}</em> : line}</span>)}</h1>
          <p>{config.home.heroText}</p>
          <div className="welcome-actions"><Link className="blue-button" href="/shop">Shop the marketplace <span aria-hidden="true">→</span></Link><Link className="welcome-secondary" href="/sell">Start selling</Link></div>
          <div className="marketplace-hero-note"><span>✓</span> Shop trusted stores across Rwanda</div>
        </div>
        <div className="marketplace-hero-collage" aria-label="Explore local marketplace categories">
          <Link className="hero-collage-card hero-collage-featured" href="/stores" aria-label="Browse local stores">
            <img src="/images/catalog/rubavu-shop-space.jpg" alt=""/>
            <span className="hero-collage-caption"><small>SHOP LOCAL</small><b>Find your next favorite</b></span>
          </Link>
          {heroTiles.map(item => <Link className="hero-collage-card hero-collage-tile" href={`/shop?category=${encodeURIComponent(item.name)}`} key={item.name} aria-label={`Shop ${item.label}`}>
            <img src={item.image} alt=""/>
            <span className="hero-collage-label">{item.label}</span>
          </Link>)}
        </div>
      </section>

      {sections.departments.active && <section className="blue-section category-blue-section"><div className="blue-section-heading"><div><span className="blue-eyebrow">{sections.departments.eyebrow}</span><h2>{sections.departments.title}</h2></div><Link href="/shop" className="blue-section-link">See all departments <span aria-hidden="true">→</span></Link></div><div className="blue-category-grid">{visibleCategories.map(item => { const count = products.filter(product => product.category === item.name).length; return <Link className="blue-category-card" href={`/shop?category=${encodeURIComponent(item.name)}`} key={item.name}><div className="blue-category-art">{item.image ? <img src={item.image} alt=""/> : <span>{item.symbol}</span>}</div><div className="blue-category-copy"><b>{item.label}</b><small>{count} listings</small></div><span className="blue-category-arrow" aria-hidden="true">›</span></Link>; })}</div></section>}

      {sections.benefits.active && <section className="market-benefits-section"><div className="market-benefits-heading"><div><span className="blue-eyebrow">A BETTER WAY TO SHOP</span><h2>Shopping made easy</h2></div><Link href="/shipping" className="blue-section-link">How it works <span aria-hidden="true">→</span></Link></div><div className="blue-benefits"><div><b>Shop with confidence</b><span>Clear prices and straightforward product details.</span></div><div><b>Find local sellers</b><span>Discover independent stores and makers.</span></div><div><b>Delivery across Rwanda</b><span>Choose a district at the top of the page.</span></div><div><b>Easy to get started</b><span>Browse, save favorites, or add to your cart.</span></div></div></section>}

      {sections.promotions.active && <section className="market-story-band"><div className="market-story-copy"><span className="blue-eyebrow">{sections.promotions.eyebrow}</span><h2>{sections.promotions.title}</h2><p>{sections.promotions.text}</p><Link className="market-story-link" href="/shop?sort=popular">Explore the marketplace <span aria-hidden="true">→</span></Link></div><div className="market-story-image"><img src="/images/catalog/rubavu-shop-space.jpg" alt="A welcoming independent home and decor shop"/></div></section>}

      {sections.popular.active && <section className="blue-section listings-section"><div className="blue-section-heading"><div><span className="blue-eyebrow">POPULAR RIGHT NOW</span><h2>{sections.popular.title}</h2></div><Link href="/shop?sort=popular" className="blue-section-link">See all products <span aria-hidden="true">→</span></Link></div><div className="listing-status-row"><span><i className="status-blue"/> Local sellers</span><span><i/> Clear prices in RWF</span><span><i/> Delivery across Rwanda</span><b>{products.length} products</b></div><ProductGrid items={featuredProducts}/></section>}

      {sections.bestSellers.active && <section className="blue-section listings-section"><div className="blue-section-heading"><div><span className="blue-eyebrow">CUSTOMER FAVORITES</span><h2>{sections.bestSellers.title}</h2></div><Link href="/shop?sort=popular" className="blue-section-link">View best sellers <span aria-hidden="true">→</span></Link></div><ProductGrid items={bestSellers}/></section>}

      {sections.newArrivals.active && <section className="blue-section listings-section"><div className="blue-section-heading"><div><span className="blue-eyebrow">{sections.newArrivals.eyebrow}</span><h2>{sections.newArrivals.title}</h2></div><Link href="/shop?sort=newest" className="blue-section-link">Browse arrivals <span aria-hidden="true">→</span></Link></div><ProductGrid items={newArrivals}/></section>}

      {sections.stores.active && <section className="blue-section sellers-blue-section"><div className="blue-section-heading"><div><span className="blue-eyebrow">PEOPLE BEHIND THE PRODUCTS</span><h2>{sections.stores.title}</h2></div><Link href="/stores" className="blue-section-link">All stores <span aria-hidden="true">→</span></Link></div><div className="blue-seller-grid">{sellers.slice(0, 6).map((seller, index) => <Link className="blue-seller-card" href={`/stores/${seller.slug}`} key={seller.slug}><span className="blue-seller-number">0{index + 1}</span><span className={`blue-seller-mark ${seller.tone}`}>{seller.mark}</span><span className="blue-seller-info"><b>{seller.name}</b><small>{seller.category}</small><em>{seller.location.split(",")[0]}</em></span><span className="blue-seller-arrow" aria-hidden="true">↗</span></Link>)}</div></section>}

      {sections.newsletter.active && <section className="home-newsletter blue-newsletter"><div><span className="blue-eyebrow">THE JASHAMART EDIT</span><h2>{config.chrome.newsletterTitle}</h2><p>{config.chrome.newsletterText}</p></div><NewsletterSignup/></section>}
    </div>
  </main>;
}
