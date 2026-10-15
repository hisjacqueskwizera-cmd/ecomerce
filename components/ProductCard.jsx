"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money } from "../lib/catalog";
import { useStore } from "./StoreProvider";
import { useCatalogProducts } from "./useCatalogProducts";
import StoreAdBanners from "./StoreAdBanners";

export function ProductVisual({ product, large = false, showBadge = true }) {
  const photo = product.photos?.[0] || product.photo;
  return <div className={`product-art ${product.tone || "blue"} ${large ? "product-art-large" : ""}`}>{photo ? <img className="product-photo" src={photo} alt={product.name}/> : product.symbol ? <span className="product-symbol" aria-hidden="true">{product.symbol}</span> : <ProductIllustration type={product.art} />}<span className="visually-hidden">Image of {product.name}</span>{showBadge && product.badge && <span className="product-badge">{product.badge}</span>}</div>;
}

export function ProductIllustration({ type = "tote" }) {
  const art = {
    sneaker: <><path className="art-shadow" d="M25 136c14-8 24-22 31-44l6-20c3-10 13-13 20-7l29 25c9 7 25 10 37 13 12 4 23 14 25 26l1 12H25v-5Z"/><path className="art-body" d="M28 131c15-7 27-22 34-43l5-17c3-9 12-12 20-5l26 22c8 7 22 10 35 13 14 3 24 12 26 25l1 9H29c-8 0-9-2-1-4Z"/><path className="art-detail" d="m76 78 23 21m-17-29 24 22m-29-12 19 16m-42 26h132"/><path className="art-sole" d="M28 131c8 1 27 1 45 1h100c3 0 5 2 5 5v6H28c-6 0-8-4 0-12Z"/></>,
    backpack: <><path className="art-shadow" d="M48 60V48c0-30 67-30 67 0v12l20 18v82H30V78l18-18Z"/><path className="art-body" d="M49 62V48c0-26 65-26 65 0v14l18 17v76H31V79l18-17Z"/><path className="art-detail" d="M57 62h50M43 102h78v45H43zM56 104v18h52v-18m-47-70-10 14m52-14 10 14"/><path className="art-sole" d="M31 146h101v10H31z"/></>,
    hoodie: <><path className="art-shadow" d="m62 49 23-18 25 18 24 8 23 33-21 13-12-16v70H43V87l-12 16-21-13 23-33 29-8Z" transform="translate(15 3)"/><path className="art-body" d="m62 49 23-18 25 18 24 8 23 33-21 13-12-16v70H43V87l-12 16-21-13 23-33 29-8Z"/><path className="art-detail" d="M62 49c4 24 44 24 48 0M68 57v20m37-20v20m-20 28v25m-14-11h28"/></>,
    vase: <><path className="art-shadow" d="M72 34h35l-3 26c0 11 7 22 17 37 9 13 13 32 9 52-2 12-14 18-39 18s-37-6-39-18c-4-20 0-39 9-52 10-15 17-26 17-37l-6-26Z"/><path className="art-body" d="M72 31h35l-3 29c0 10 7 22 17 37 9 13 13 32 9 52-2 12-14 18-39 18s-37-6-39-18c-4-20 0-39 9-52 10-15 17-27 17-37l-6-29Z"/><path className="art-sole" d="M70 31h39v9H70z"/><path className="art-detail" d="M62 111c16 8 40 8 56 0"/></>,
    tote: <><path className="art-shadow" d="M47 74V58c0-37 74-37 74 0v16l19 11 10 78H26l8-78 13-11Z"/><path className="art-body" d="M46 72V57c0-34 75-34 75 0v15l17 12 10 76H26l8-76 12-12Z"/><path className="art-detail" d="M55 69V58c0-23 57-23 57 0v11m-70 20-7 61h102l-8-61M73 104h21v29H73z"/></>,
    earbuds: <><path className="art-shadow" d="M41 105c0-24 19-42 43-42s43 18 43 42v39c0 14-12 25-27 25H68c-15 0-27-11-27-25v-39Z"/><path className="art-body" d="M42 102c0-23 19-40 42-40s42 17 42 40v38c0 14-11 25-25 25H67c-14 0-25-11-25-25v-38Z"/><path className="art-sole" d="M57 117c0-11 9-20 20-20s20 9 20 20v18c0 7-6 13-13 13H70c-7 0-13-6-13-13v-18Zm50 0c0-11 9-20 20-20s20 9 20 20v18c0 7-6 13-13 13h-14c-7 0-13-6-13-13v-18Z"/><path className="art-detail" d="M73 109v17m48-17v17"/></>,
    shirt: <><path className="art-shadow" d="m66 38 20 14 21-14 28 12 25 33-21 14-15-17v78H32V80L18 97 2 83l25-33 39-12Z" transform="translate(16 8)"/><path className="art-body" d="m66 38 20 14 21-14 28 12 25 33-21 14-15-17v78H32V80L18 97 2 83l25-33 39-12Z"/><path className="art-detail" d="M66 38c0 24 42 24 42 0m-22 16v91m0-66 4 3m-4 18 4 3m-4 18 4 3"/></>,
    cushion: <><path className="art-shadow" d="M43 36h75c15 0 27 12 27 27v72c0 15-12 27-27 27H43c-15 0-27-12-27-27V63c0-15 12-27 27-27Z"/><path className="art-body" d="M43 32h75c15 0 27 12 27 27v72c0 15-12 27-27 27H43c-15 0-27-12-27-27V59c0-15 12-27 27-27Z"/><path className="art-detail" d="M41 52h78v86H41zM51 51v88m58-88v88m-68-60h98"/></>,
    sunglasses: <><path className="art-body" d="m20 69 11 63c2 14 14 24 29 24h8c17 0 29-14 29-30V97h12v29c0 16 12 30 29 30h8c15 0 27-10 29-24l11-63-14-5-19 13H53L34 64l-14 5Z"/><path className="art-detail" d="M84 98h26M23 70l-9-11m187 11 9-11"/><path className="art-lens" d="M38 83h48v38c0 13-10 23-23 23h-4c-12 0-20-8-22-20l-6-41Zm78 0h48l-6 41c-2 12-10 20-22 20h-4c-13 0-23-10-23-23V83Z"/></>,
    speaker: <><path className="art-shadow" d="M57 24h57c15 0 27 12 27 27v100c0 15-12 27-27 27H57c-15 0-27-12-27-27V51c0-15 12-27 27-27Z"/><path className="art-body" d="M57 20h57c15 0 27 12 27 27v100c0 15-12 27-27 27H57c-15 0-27-12-27-27V47c0-15 12-27 27-27Z"/><circle className="art-lens" cx="85" cy="75" r="19"/><circle className="art-lens" cx="85" cy="125" r="26"/><circle className="art-detail" cx="85" cy="34" r="3"/></>,
    wallet: <><path className="art-shadow" d="M30 50h112c14 0 25 11 25 25v69c0 9-7 16-16 16H33c-9 0-16-7-16-16V68c0-10 7-18 13-18Z"/><path className="art-body" d="M31 46h110c14 0 25 11 25 25v69c0 9-7 16-16 16H32c-9 0-16-7-16-16V64c0-10 7-18 15-18Z"/><path className="art-detail" d="M30 47v36h115V70m-61-7h42M48 107h44m-44 17h64"/></>,
    boot: <><path className="art-shadow" d="m72 27 39 7 3 67 20 20 34 14v21H35l-8-14 23-14 17-13 2-50 3-38Z"/><path className="art-body" d="m70 22 39 7 3 67 20 20 34 14v21H35l-8-14 23-14 17-13 2-50 1-38Z"/><path className="art-detail" d="m70 40 33 6M71 53l31 6m-31 7 31 6m-32 7 32 6m-72 34 54 8m-60 13h141"/><path className="art-sole" d="M33 146h133v8H35c-7 0-9-3-2-8Z"/></>
  };
  return <svg className="art-illustration" viewBox="0 0 220 200" role="img" aria-hidden="true" fill="none">{art[type] || art.tote}</svg>;
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.id);
  const priceUnit = product.priceUnit === "month" ? " / month" : product.priceUnit === "service" ? " / service" : "";
  return <article className="product-card"><Link href={`/product/${product.slug}`} className="product-picture-link" aria-label={`View ${product.name}`}><ProductVisual product={product}/></Link><button className={`quick-heart ${saved ? "is-saved" : ""}`} onClick={() => toggleWishlist(product)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>{saved ? "♥" : "♡"}</button><div className="product-details"><Link className="product-vendor" href={`/stores/${product.seller.toLowerCase().replaceAll(" & ", "-and-").replaceAll(" ", "-")}`}>{product.seller}</Link><Link className="product-name" href={`/product/${product.slug}`}>{product.name}</Link><div className="product-rating"><span>★★★★★</span><small>({product.reviews})</small></div><div className="price-line"><b>{money(product.price)}{priceUnit}</b>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div>{product.listingType ? <Link className="add-button add-link" href={`/product/${product.slug}`}>View listing</Link> : product.sizes?.length ? <Link className="add-button add-link" href={`/product/${product.slug}`}>Choose options</Link> : <button className="add-button" onClick={() => addToCart(product)}>Add to cart</button>}</div></article>;
}

export function ProductGrid({ items, emptyMessage = "No products found.", adPlacement = "" }) {
  const stored = useCatalogProducts();
  const gridRef = useRef(null);
  const [columns, setColumns] = useState(4);
  const visible = items.map(item => stored.find(product => product.id === item.id)).filter(Boolean);
  useEffect(() => {
    if (!adPlacement || !gridRef.current) return;
    const grid = gridRef.current;
    const updateColumns = () => setColumns(getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1);
    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [adPlacement]);
  if (!visible.length) return <div className="empty-state"><span>⌕</span><h2>Nothing here yet</h2><p>{emptyMessage}</p><Link className="button-primary" href="/shop">Browse all products</Link></div>;
  const productCards = visible.map(product => <ProductCard key={product.id} product={product}/>);
  if (!adPlacement) return <div className="product-grid">{productCards}</div>;
  const productsPerAd = columns * 2;
  const gridItems = [];
  let adIndex = 0;
  productCards.forEach((card, index) => {
    gridItems.push(card);
    if ((index + 1) % productsPerAd === 0 && index < productCards.length - 1) {
      gridItems.push(<StoreAdBanners key={`ad-${index}`} placement={adPlacement} variant="card" adIndex={adIndex++}/>);
    }
  });
  return <div className="product-grid" ref={gridRef}>{gridItems}</div>;
}
