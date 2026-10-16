"use client";

import Link from "next/link";
import { useStore } from "../../components/StoreProvider";
import { Breadcrumbs, StoreLayout, PageTitle } from "../../components/StoreChrome";
import { ProductVisual } from "../../components/ProductCard";
import CouponBox from "../../components/CouponBox";
import { calculateCoupon } from "../../lib/coupons";
import { useCoupons } from "../../components/useCoupons";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, money } from "../../lib/catalog";

export default function CartPage() {
  const { cart, subtotal, setQuantity, removeFromCart, appliedCouponCode } = useStore();
  const coupons = useCoupons();
  const shippableItems = cart.some(item => item.category !== "Services");
  const shipping = !shippableItems || subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const coupon = calculateCoupon(appliedCouponCode, cart, shipping, coupons);
  const discount = coupon.valid ? coupon.discount : 0;
  const shippingDiscount = coupon.valid ? coupon.shippingDiscount : 0;
  const total = subtotal - discount + shipping - shippingDiscount;
  return <main><StoreLayout><Breadcrumbs items={[{ label: "Your cart" }]}/><PageTitle eyebrow="YOUR SHOPPING CART" title="Shopping cart" description="Review your items before checkout."/>
    {cart.length ? <div className="cart-layout"><section className="cart-lines"><div className="cart-table-head"><span>Product</span><span>Price</span><span>Quantity</span><span>Total</span><span/></div>{cart.map(item => <article className="cart-line" key={item.key}><Link href={`/product/${item.slug}`} className="cart-product"><ProductVisual product={item}/><span><b>{item.name}</b><small>Sold by {item.seller}</small>{item.color && <small>Color: {item.color}</small>}{item.size && <small>Size: {item.size}</small>}</span></Link><span className="cart-line-price">{money(item.price)}</span><div className="quantity-control"><button onClick={() => item.quantity > 1 ? setQuantity(item.key, item.quantity - 1) : removeFromCart(item.key)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity">+</button></div><b className="cart-line-total">{money(item.price * item.quantity)}</b><button className="remove-line" aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.key)}>×</button></article>)}<Link className="continue-link" href="/shop">← Continue shopping</Link></section>
    <aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(subtotal)}</b></div><CouponBox items={cart} shipping={shipping}/>{coupon.valid && coupon.discount > 0 && <div className="discount-line"><span>Coupon · {appliedCouponCode}</span><b>− {money(discount)}</b></div>}<div><span>Shipping</span><b>{shippingDiscount ? "Free · coupon" : shipping === 0 ? "Free" : money(shipping)}</b></div>{subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && !shippingDiscount && <p className="shipping-hint">Add {money(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.</p>}{shippingDiscount > 0 && <div className="discount-line"><span>Shipping discount</span><b>− {money(shippingDiscount)}</b></div>}<div className="summary-total"><span>Total</span><b>{money(total)}</b></div><Link className="button-primary checkout-link" href="/checkout">Continue to checkout →</Link><small>Taxes and final shipping details are confirmed at checkout.</small><div className="secure-note">✓ Secure checkout &nbsp; · &nbsp; Easy returns</div></aside></div> : <div className="empty-state cart-empty"><span>♧</span><h2>Your cart is taking a little break</h2><p>Browse the marketplace and add something you love.</p><Link className="button-primary" href="/shop">Explore the marketplace</Link></div>}
  </StoreLayout></main>;
}
