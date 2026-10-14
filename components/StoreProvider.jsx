"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);
const STORAGE_KEY = "openshop-demo-store-v2-rwf";

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setCart(Array.isArray(saved.cart) ? saved.cart : []);
      setWishlist(Array.isArray(saved.wishlist) ? saved.wishlist : []);
      setAppliedCouponCode(typeof saved.appliedCouponCode === "string" ? saved.appliedCouponCode : "");
    } catch { /* Start with an empty demo store if saved browser data is invalid. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist, appliedCouponCode }));
  }, [cart, wishlist, appliedCouponCode, ready]);

  const value = useMemo(() => ({
    cart, wishlist, appliedCouponCode,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    addToCart(product, quantity = 1, options = {}) {
      setCart(current => {
        const key = `${product.id}:${options.color || ""}:${options.size || ""}`;
        const found = current.find(line => line.key === key);
        return found
          ? current.map(line => line.key === key ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock) } : line)
          : [...current, { key, id: product.id, slug: product.slug, name: product.name, category: product.category, price: product.price, tone: product.tone, art: product.art, photo: product.photo, symbol: product.symbol, quantity: Math.min(quantity, product.stock), stock: product.stock, color: options.color || "", size: options.size || "", seller: product.seller }];
      });
    },
    setQuantity(key, quantity) { setCart(current => current.map(line => line.key === key ? { ...line, quantity: Math.max(1, Math.min(Number(quantity) || 1, line.stock)) } : line)); },
    removeFromCart(key) { setCart(current => current.filter(line => line.key !== key)); },
    clearCart() { setCart([]); setAppliedCouponCode(""); },
    applyCoupon(code) { setAppliedCouponCode(String(code || "").trim().toUpperCase()); },
    clearCoupon() { setAppliedCouponCode(""); },
    toggleWishlist(product) { setWishlist(current => current.some(item => item.id === product.id) ? current.filter(item => item.id !== product.id) : [...current, { id: product.id, slug: product.slug, name: product.name, category: product.category, price: product.price, oldPrice: product.oldPrice, priceUnit: product.priceUnit, listingType: product.listingType, symbol: product.symbol, tone: product.tone, art: product.art, photo: product.photo, seller: product.seller, stock: product.stock || 1, rating: product.rating || 0, reviews: product.reviews || 0, badge: product.badge }]); },
    isWishlisted(id) { return wishlist.some(item => item.id === id); }
  }), [cart, wishlist, appliedCouponCode, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
