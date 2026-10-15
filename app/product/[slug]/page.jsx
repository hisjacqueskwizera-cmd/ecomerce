"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { money, sellerSlug } from "../../../lib/catalog";
import { Breadcrumbs, StoreLayout } from "../../../components/StoreChrome";
import { ProductGrid, ProductVisual } from "../../../components/ProductCard";
import { useStore } from "../../../components/StoreProvider";
import { useCatalogProducts } from "../../../components/useCatalogProducts";
import StoreAdBanners from "../../../components/StoreAdBanners";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const catalogProducts = useCatalogProducts();
  const product = catalogProducts.find(item => item.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setColor(product?.colors?.[0] || "");
    setSize("");
  }, [slug, product?.id]);

  if (!product) return <main><StoreLayout><div className="empty-state"><h1>Product not found</h1><Link className="button-primary" href="/shop">Browse products</Link></div></StoreLayout></main>;

  const photos = product.photos?.length ? product.photos : product.photo ? [product.photo] : [];
  const productFacts = Object.entries(product.attributes || {}).filter(([, value]) => value);
  const related = catalogProducts.filter(item => item.id !== product.id && (item.category === product.category || item.seller === product.seller)).slice(0, 4);
  const priceUnit = product.priceUnit === "month" ? " / month" : product.priceUnit === "service" ? " / service" : "";
  const activeProduct = { ...product, photo: photos[activeImage] || product.photo, photos: [] };
  const productAdIndex = [...slug].reduce((total, character) => total + character.charCodeAt(0), 0);

  return <main><StoreLayout>
    <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` }, { label: product.name }]}/>
    <section className="product-detail">
      <div className="detail-gallery">
        <ProductVisual product={activeProduct} large/>
        {photos.length > 1 && <div className="thumbnail-strip">{photos.map((photo, index) => <button key={`${photo.slice(0, 40)}-${index}`} className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`}><ProductVisual product={{ ...product, photo, photos: [] }} showBadge={false}/></button>)}</div>}
      </div>
      <div className="detail-copy">
        <Link className="product-vendor" href={`/stores/${sellerSlug(product.seller)}`}>Sold by {product.seller} &rarr;</Link>
        <h1>{product.name}</h1>
        <div className="detail-rating"><span>★★★★★</span> {product.rating} <a href="#reviews">({product.reviews} reviews)</a></div>
        <div className="detail-price">{money(product.price)}{priceUnit} {product.oldPrice && <del>{money(product.oldPrice)}</del>}</div>
        <div className="stock-status"><span/>{product.listingType === "property" ? `${product.propertyType || "Property"} listing · ${product.district}, Rwanda` : `In stock · ships in 1–2 business days`}</div>
        <p className="detail-description">{product.description}</p>
        {product.listingType === "property" && <div className="property-facts"><span><small>PROPERTY TYPE</small><b>{product.propertyType}</b></span>{product.bedrooms && <span><small>BEDROOMS</small><b>{product.bedrooms}</b></span>}{product.bathrooms && <span><small>BATHROOMS</small><b>{product.bathrooms}</b></span>}{product.areaSqm && <span><small>AREA</small><b>{product.areaSqm} m²</b></span>}<span><small>LOCATION</small><b>{product.district}, Rwanda</b></span></div>}
        {productFacts.length > 0 && <div className="product-facts">{productFacts.map(([key, value]) => <span key={key}><small>{key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ").toUpperCase()}</small><b>{value}</b></span>)}</div>}
        {product.colors?.length > 0 && <fieldset className="choice-group"><legend>Color: <b>{color}</b></legend><div className="choice-buttons">{product.colors.map(item => <button key={item} className={color === item ? "selected" : ""} onClick={() => setColor(item)}>{item}</button>)}</div></fieldset>}
        {product.sizes?.length > 0 && <fieldset className="choice-group"><legend>Size {size && <b>· {size}</b>}</legend><div className="choice-buttons">{product.sizes.map(item => <button key={item} className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</button>)}</div></fieldset>}
        <div className="detail-buy-row">{product.listingType === "property" ? <Link className="button-primary detail-add" href={`/contact?property=${encodeURIComponent(product.name)}`}>Enquire about this listing</Link> : <><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(value => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}>+</button></div><button className="button-primary detail-add" disabled={Boolean(product.sizes?.length && !size)} onClick={() => addToCart(product, quantity, { color, size })}>{product.sizes?.length && !size ? "Choose a size" : `Add to cart · ${money(product.price * quantity)}`}</button></>}<button className={`detail-wish ${isWishlisted(product.id) ? "is-saved" : ""}`} onClick={() => toggleWishlist(product)} aria-label="Toggle wishlist">{isWishlisted(product.id) ? "♥" : "♡"}</button></div>
        <div className="detail-assurance"><span>✓ Secure checkout</span><span>✓ Easy 30-day returns</span><span>✓ Ships from {product.seller}</span></div>
        <Link className="store-link-panel" href={`/stores/${sellerSlug(product.seller)}`}><span className="seller-mark seller-blue">{product.seller[0]}</span><span><small>DISCOVER THE SELLER</small><b>{product.seller}</b><small>View this store's profile and all its products →</small></span></Link>
      </div>
    </section>
    <section className="detail-info" id="reviews"><div className="detail-tabs"><button className={activeTab === "description" ? "selected" : ""} onClick={() => setActiveTab("description")}>Description</button><button className={activeTab === "shipping" ? "selected" : ""} onClick={() => setActiveTab("shipping")}>Shipping & returns</button><button className={activeTab === "reviews" ? "selected" : ""} onClick={() => setActiveTab("reviews")}>Reviews ({product.reviews})</button></div>{activeTab === "description" && <p>{product.description} Designed to be useful, well made, and easy to enjoy every day.</p>}{activeTab === "shipping" && <p>This store dispatches within 1–2 business days. Delivery estimates are shown at checkout. Unused items can be returned within 30 days of delivery.</p>}{activeTab === "reviews" && <div className="review-sample"><b>★★★★★ &nbsp; A lovely find</b><p>"Just as described and arrived carefully packed. Would shop this seller again."</p><small>Verified Open Shop customer</small></div>}</section>
    <div className="product-detail-ad-slot"><StoreAdBanners placement="product_detail" variant="card" adIndex={productAdIndex}/></div>
    <div className="product-detail-video-slot"><StoreAdBanners placement="video_product" variant="video"/></div>
    <section className="products-section related-products"><div className="section-heading"><div><span className="eyebrow">MORE TO DISCOVER</span><h2>You may also like</h2></div><Link className="text-link" href="/shop">Shop all &rarr;</Link></div><ProductGrid items={related}/></section>
  </StoreLayout></main>;
}
