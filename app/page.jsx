"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, money, sellers } from "../lib/catalog";
import { ProductGrid, ProductVisual } from "../components/ProductCard";
import NewsletterSignup from "../components/NewsletterSignup";
import { useCatalogProducts } from "../components/useCatalogProducts";
import { useStorefrontConfig } from "../components/useStorefrontConfig";

const categoryVisuals = {
  "Real Estate": { label: "Homes & plots", symbol: "⌂", image: "/images/catalog/kicukiro-two-bedroom-apartment.jpg" },
  "Quincaillerie & Construction": { label: "Building & tools", symbol: "⚒", image: "" },
  Accessories: { label: "Accessories", symbol: "✦", image: "/images/catalog/canvas-market-tote.jpg" },
  Agriculture: { label: "Agriculture", symbol: "❋", image: "" },
  Automotive: { label: "Automotive", symbol: "◉", image: "" },
  "Baby & Kids": { label: "Baby & kids", symbol: "♡", image: "" },
  "Books & Office": { label: "Books & office", symbol: "▤", image: "" },
  Clothing: { label: "Clothing", symbol: "✳", image: "/images/catalog/linen-summer-shirt.jpg" },
  Fashion: { label: "Fashion", symbol: "✳", image: "/images/catalog/everyday-sneaker.jpg" },
  "Food & Groceries": { label: "Food & groceries", symbol: "✦", image: "" },
  Furniture: { label: "Furniture", symbol: "▤", image: "/images/catalog/wooden-dining-table.jpg" },
  "Health & Beauty": { label: "Health & beauty", symbol: "✿", image: "" },
  "Home & Decor": { label: "Home & decor", symbol: "✺", image: "/images/catalog/ceramic-table-vase.jpg" },
  "Home Appliances": { label: "Home appliances", symbol: "▯", image: "" },
  Music: { label: "Music", symbol: "♫", image: "" },
  "Phones & Electronics": { label: "Phones & tech", symbol: "◈", image: "/images/catalog/wireless-earbuds.jpg" },
  Services: { label: "Services", symbol: "✦", image: "" },
  Shoes: { label: "Shoes", symbol: "◒", image: "/images/catalog/trail-running-shoes.jpg" },
  "Sports & Outdoors": { label: "Sports & outdoors", symbol: "⌁", image: "" },
};

const promoCards = [
  { category: "Home & Decor", eyebrow: "MAKE IT YOURS", title: "Thoughtful details for your space", image: "/images/catalog/ceramic-table-vase.jpg" },
  { category: "Phones & Electronics", eyebrow: "EVERYDAY TECH", title: "Useful finds, ready for every day", image: "/images/catalog/wireless-earbuds.jpg" },
  { category: "Real Estate", eyebrow: "ROOM TO GROW", title: "Find a place to call your own", image: "/images/catalog/kicukiro-two-bedroom-apartment.jpg" },
];

const journalCards = [
  { slug: "getting-to-know-the-makers", eyebrow: "THE JASHAMART EDIT", title: "Getting to know the makers behind your finds", text: "The best part of a marketplace is often the person and story behind a product.", image: "/images/catalog/rubavu-shop-space.jpg" },
  { slug: "small-things-for-slow-mornings", eyebrow: "LITTLE MOMENTS", title: "Small things for slower mornings", text: "A few well-made everyday pieces can make the day feel more considered.", image: "/images/catalog/ceramic-table-vase.jpg" },
  { slug: "choosing-a-gift-with-a-story", eyebrow: "GIFT NOTES", title: "Choosing a gift with a story", text: "Find something useful, personal, and made with care at an independent shop.", image: "/images/catalog/canvas-market-tote.jpg" },
];

export default function Home() {
  const config = useStorefrontConfig();
  const sections = config.home.sections;
  const products = useCatalogProducts();
  const [activeTab, setActiveTab] = useState("featured");
  const [activeSlide, setActiveSlide] = useState(0);
  const categoryCounts = categories.map(name => ({ name, count: products.filter(product => product.category === name).length, ...(categoryVisuals[name] || { label: name, symbol: "✦", image: "" }) })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);
  const departments = categoryCounts.slice(0, 6);
  const featuredProducts = [...products].sort((a, b) => b.reviews - a.reviews || b.rating - a.rating).slice(0, 10);
  const latestProducts = [...products].slice(-10).reverse();
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 10);
  const discountedProducts = products.filter(product => product.oldPrice && product.oldPrice > product.price).sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price));
  const dealProduct = discountedProducts[0] || featuredProducts[0];
  const specialProducts = discountedProducts.length ? discountedProducts.slice(0, 5) : featuredProducts.slice(5, 10);
  const productTabs = [
    { key: "featured", label: "Featured", title: sections.popular.title, active: sections.popular.active, items: featuredProducts },
    { key: "latest", label: "Latest", title: sections.newArrivals.title, active: sections.newArrivals.active, items: latestProducts },
    { key: "bestsellers", label: "Bestsellers", title: sections.bestSellers.title, active: sections.bestSellers.active, items: bestSellers },
  ].filter(tab => tab.active);
  const selectedTab = productTabs.find(tab => tab.key === activeTab) || productTabs[0];
  const heroSlides = [
    { eyebrow: "RWANDA'S LOCAL MARKETPLACE", title: config.home.heroTitle.split("\n"), text: config.home.heroText, image: "/images/catalog/rubavu-shop-space.jpg", href: "/shop", cta: "Shop now" },
    { eyebrow: "HOME & FURNITURE", title: ["Make room for", "something good."], text: "Discover furniture, decor, and thoughtful finds from independent local stores.", image: "/images/catalog/wooden-dining-table.jpg", href: "/shop?category=Furniture", cta: "Explore home" },
    { eyebrow: "HOMES & LOCAL SPACES", title: ["Find a space", "that feels right."], text: "Browse homes, rentals, and commercial spaces listed by local sellers.", image: "/images/catalog/kicukiro-two-bedroom-apartment.jpg", href: "/shop?category=Real%20Estate", cta: "Explore properties" },
  ];
  const currentHero = heroSlides[activeSlide];
  const spotlightSeller = sellers[0];
  const discountPercent = dealProduct?.oldPrice ? Math.round((dealProduct.oldPrice - dealProduct.price) / dealProduct.oldPrice * 100) : 0;
  const sellerNames = sellers.slice(0, 8);

  return <main className="market-home-shell">
    <div className="site-container store-home-layout">
      <aside className="store-home-sidebar" aria-label="Marketplace shortcuts">
        {sections.departments.active && <section className="home-widget home-categories-widget"><h2 className="home-widget-title">Categories</h2><nav aria-label="Shop categories" className="home-category-list">{categoryCounts.slice(0, 10).map(item => <Link href={`/shop?category=${encodeURIComponent(item.name)}`} key={item.name}><span>{item.label}</span><small>{item.count}</small><b aria-hidden="true">›</b></Link>)}</nav><Link className="home-widget-more" href="/shop">+ More categories</Link></section>}

        {dealProduct && <section className="home-widget home-deal-widget"><h2 className="home-widget-title">{discountPercent ? "Deal of the day" : "Today's pick"}</h2><Link href={`/product/${dealProduct.slug}`} className="home-deal-product"><span className="home-deal-photo"><ProductVisual product={dealProduct}/>{discountPercent > 0 && <small className="home-deal-discount">-{discountPercent}%</small>}</span><span className="home-deal-name">{dealProduct.name}</span><span className="home-deal-rating"><b>★★★★★</b> <small>({dealProduct.reviews})</small></span><span className="home-deal-price">{money(dealProduct.price)} {dealProduct.oldPrice && <del>{money(dealProduct.oldPrice)}</del>}</span></Link><Link className="home-widget-cta" href={`/product/${dealProduct.slug}`}>View this item <span aria-hidden="true">→</span></Link></section>}

        <section className="home-widget home-service-widget"><h2 className="home-widget-title">Shopping with JashaMart</h2><Link href="/shipping"><i>↗</i><span><b>Delivery information</b><small>Districts, estimates and returns</small></span></Link><Link href="/stores"><i>⌂</i><span><b>Independent stores</b><small>Discover local sellers</small></span></Link><Link href="/faq"><i>?</i><span><b>Help &amp; FAQs</b><small>Answers before you shop</small></span></Link></section>

        {spotlightSeller && <section className="home-widget home-spotlight-widget"><h2 className="home-widget-title">Store spotlight</h2><Link href={`/stores/${spotlightSeller.slug}`} className="home-spotlight-card"><span className={`home-spotlight-mark ${spotlightSeller.tone}`}>{spotlightSeller.mark}</span><b>{spotlightSeller.name}</b><small>{spotlightSeller.category} · {spotlightSeller.location.split(",")[0]}</small><span className="home-spotlight-link">Visit this store →</span></Link></section>}

        {sections.promotions.active && <section className="home-widget home-side-promo"><img src="/images/catalog/two-seat-sofa.jpg" alt="A locally listed living-room sofa"/><div><span>{sections.promotions.eyebrow}</span><h2>{sections.promotions.title}</h2><p>{sections.promotions.text}</p><Link href="/shop?sort=popular">Explore offers →</Link></div></section>}

        {sections.newsletter.active && <section className="home-widget home-sidebar-newsletter"><h2 className="home-widget-title">Newsletter</h2><p>{config.chrome.newsletterText}</p><NewsletterSignup/></section>}
      </aside>

      <div className="store-home-main">
        <section className="store-hero-carousel" aria-label="Marketplace highlights">
          <img className="store-hero-image" src={currentHero.image} alt=""/>
          <div className="store-hero-overlay"/>
          <div className="store-hero-content" aria-live="polite"><span>{currentHero.eyebrow}</span><h1>{currentHero.title.map((line, index) => <span key={`${activeSlide}-${index}`}>{index > 0 && <br/>}{line}</span>)}</h1><p>{currentHero.text}</p><Link className="store-hero-cta" href={currentHero.href}>{currentHero.cta} <span aria-hidden="true">→</span></Link></div>
          <div className="store-hero-controls"><button onClick={() => setActiveSlide(value => (value + heroSlides.length - 1) % heroSlides.length)} aria-label="Previous highlight">‹</button><div>{heroSlides.map((slide, index) => <button key={slide.eyebrow} className={activeSlide === index ? "active" : ""} onClick={() => setActiveSlide(index)} aria-label={`Show highlight ${index + 1}`}/>)}</div><button onClick={() => setActiveSlide(value => (value + 1) % heroSlides.length)} aria-label="Next highlight">›</button></div>
        </section>

        {sections.departments.active && <section className="store-home-departments"><div className="home-section-head"><div><span>FIND YOUR NEXT FAVORITE</span><h2>Shop by category</h2></div><Link href="/shop">All departments →</Link></div><div className="home-category-circles">{departments.map(item => <Link href={`/shop?category=${encodeURIComponent(item.name)}`} className="home-category-circle" key={item.name}><span className="home-category-circle-art">{item.image ? <img src={item.image} alt=""/> : <b>{item.symbol}</b>}</span><span>{item.label}</span></Link>)}</div></section>}

        {productTabs.length > 0 && <section className="store-home-products"><div className="home-section-head home-products-head"><div><span>GOOD FINDS FROM LOCAL STORES</span><h2>{selectedTab?.title || "Products for you"}</h2></div><Link href="/shop">Shop all products →</Link></div><div className="home-product-tabs" role="tablist" aria-label="Product collections">{productTabs.map(tab => <button key={tab.key} role="tab" aria-selected={(selectedTab?.key || "") === tab.key} className={(selectedTab?.key || "") === tab.key ? "active" : ""} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>)}</div><ProductGrid items={selectedTab?.items || []}/></section>}

        {sections.promotions.active && <section className="home-promo-grid" aria-label="Explore more from JashaMart">{promoCards.map(card => <Link href={`/shop?category=${encodeURIComponent(card.category)}`} className="home-promo-card" key={card.category}><img src={card.image} alt=""/><span className="home-promo-shade"/><span className="home-promo-copy"><small>{card.eyebrow}</small><b>{card.title}</b><i>Shop now →</i></span></Link>)}</section>}

        {sections.newArrivals.active && <section className="store-home-special-products"><div className="home-section-head"><div><span>{discountedProducts.length ? "CURRENT OFFERS" : "JUST ADDED TO THE MARKETPLACE"}</span><h2>{discountedProducts.length ? "Special products" : sections.newArrivals.title}</h2></div><Link href={discountedProducts.length ? "/shop?sort=popular" : "/shop?sort=newest"}>{discountedProducts.length ? "See all offers →" : "View new arrivals →"}</Link></div><ProductGrid items={specialProducts}/></section>}

        <section className="store-home-journal"><div className="home-section-head"><div><span>STORIES, IDEAS &amp; STORE SPOTLIGHTS</span><h2>From the JashaMart journal</h2></div><Link href="/journal">Read all stories →</Link></div><div className="home-journal-grid">{journalCards.map(article => <article className="home-journal-card" key={article.slug}><Link className="home-journal-image" href={`/journal/${article.slug}`}><img src={article.image} alt=""/></Link><div><small>{article.eyebrow}</small><h3><Link href={`/journal/${article.slug}`}>{article.title}</Link></h3><p>{article.text}</p><Link className="home-journal-more" href={`/journal/${article.slug}`}>Read story →</Link></div></article>)}</div></section>

        {sections.stores.active && <section className="store-home-stores"><div className="home-section-head"><div><span>INDEPENDENT BUSINESSES</span><h2>Stores to discover</h2></div><Link href="/stores">Browse all stores →</Link></div><div className="home-store-strip">{sellerNames.map(seller => <Link href={`/stores/${seller.slug}`} className="home-store-logo" key={seller.slug}><span>{seller.mark}</span><b>{seller.name}</b></Link>)}</div></section>}
      </div>
    </div>
  </main>;
}
