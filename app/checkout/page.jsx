"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../components/StoreProvider";
import { Breadcrumbs, PageTitle, StoreLayout } from "../../components/StoreChrome";
import { ProductIllustration } from "../../components/ProductCard";
import DistrictOptions from "../../components/DistrictOptions";
import CouponBox from "../../components/CouponBox";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, money } from "../../lib/catalog";
import { calculateCoupon } from "../../lib/coupons";
import { useCoupons } from "../../components/useCoupons";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, appliedCouponCode, clearCoupon } = useStore();
  const coupons = useCoupons();
  const router = useRouter();
  const [district, setDistrict] = useState("");
  const shippableItems = cart.some(item => item.category !== "Services");
  const shipping = !shippableItems || subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const coupon = calculateCoupon(appliedCouponCode, cart, shipping, coupons);
  const discount = coupon.valid ? coupon.discount : 0;
  const shippingDiscount = coupon.valid ? coupon.shippingDiscount : 0;
  const total = subtotal - discount + shipping - shippingDiscount;

  useEffect(() => setDistrict(localStorage.getItem("openshop-delivery-district") || ""), []);

  function updateDistrict(event) {
    const selected = event.target.value;
    setDistrict(selected);
    if (selected) localStorage.setItem("openshop-delivery-district", selected);
    else localStorage.removeItem("openshop-delivery-district");
  }

  function placeOrder(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const order = {
      reference: `OS-${Date.now().toString().slice(-7)}`,
      name: data.get("name"), email: data.get("email"), phone: data.get("phone"),
      address: data.get("address"), sector: data.get("sector"), district: data.get("district"), country: "Rwanda",
      items: cart, subtotal, shipping, couponCode: coupon.valid ? appliedCouponCode : "", discount, shippingDiscount,
      total, placedAt: new Date().toISOString(), status: "Pending"
    };
    localStorage.setItem("openshop-last-order-rwf-v2", JSON.stringify(order));
    const previousOrders = JSON.parse(localStorage.getItem("openshop-demo-orders-rwf-v2") || "[]");
    localStorage.setItem("openshop-demo-orders-rwf-v2", JSON.stringify([order, ...previousOrders]));
    localStorage.setItem("openshop-demo-profile", JSON.stringify({ name: order.name, email: order.email }));
    clearCart();
    clearCoupon();
    router.push(`/order-confirmation?reference=${order.reference}`);
  }

  if (!cart.length) return <main><StoreLayout><Breadcrumbs items={[{ label: "Checkout", href: "/checkout" }]}/><PageTitle title="Your cart is empty" description="Add products to your cart before checkout."/><Link className="button-primary" href="/shop">Browse the marketplace</Link></StoreLayout></main>;

  return <main><StoreLayout>
    <Breadcrumbs items={[{ label: "Your cart", href: "/cart" }, { label: "Checkout" }]}/>
    <PageTitle eyebrow="ALMOST YOURS" title="Checkout" description="Enter your Rwanda delivery details to place your demo order."/>
    <form className="checkout-layout" onSubmit={placeOrder}>
      <div className="checkout-fields">
        <section className="checkout-panel"><h2>Contact information</h2><div className="form-grid">
          <label className="span-two">Email address<input name="email" type="email" placeholder="you@example.com" required/></label>
          <label className="span-two">Full name<input name="name" autoComplete="name" placeholder="Your full name" required/></label>
          <label>Rwanda phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+250 788 000 000" required/></label>
        </div></section>
        <section className="checkout-panel"><h2>Delivery address in Rwanda</h2><div className="form-grid">
          <label className="span-two">Street address or landmark<input name="address" autoComplete="street-address" placeholder="Street, village or nearby landmark" required/></label>
          <label>District<select name="district" value={district} onChange={updateDistrict} required><option value="">Choose your district</option><DistrictOptions/></select></label>
          <label>Sector / cell<input name="sector" placeholder="Your sector or cell" required/></label>
          <label>Country<input name="country" value="Rwanda" readOnly/></label>
          <label>Delivery notes <small>optional</small><input name="notes" placeholder="Anything your courier should know?"/></label>
        </div></section>
        <section className="checkout-panel"><h2>Payment method</h2>
          <label className="payment-choice"><input type="radio" name="payment" defaultChecked/><span><b>Pay on delivery</b><small>Payment options are simulated for this demo storefront.</small></span></label>
          <label className="payment-choice"><input type="radio" name="payment"/><span><b>Mobile money</b><small>Payment options are simulated for this demo storefront.</small></span></label>
          <p className="demo-notice">This is a storefront demo. Submitting creates a local sample order; no payment is collected and no order is sent to a seller.</p>
        </section>
      </div>
      <aside className="order-summary checkout-summary"><h2>Your order</h2>
        {cart.map(item => <div className="checkout-item" key={item.key}><span className={`checkout-thumb ${item.tone}`}>{item.symbol ? <b className="product-symbol">{item.symbol}</b> : <ProductIllustration type={item.art}/>}<i>{item.quantity}</i></span><span><b>{item.name}</b><small>{item.color} {item.size && `· ${item.size}`}</small></span><b>{money(item.price * item.quantity)}</b></div>)}
        <div><span>Subtotal</span><b>{money(subtotal)}</b></div><CouponBox items={cart} shipping={shipping}/>{coupon.valid && coupon.discount > 0 && <div className="discount-line"><span>Coupon · {appliedCouponCode}</span><b>− {money(discount)}</b></div>}<div><span>Shipping</span><b>{shippingDiscount ? "Free · coupon" : shipping === 0 ? "Free" : money(shipping)}</b></div>{shippingDiscount > 0 && <div className="discount-line"><span>Shipping discount</span><b>− {money(shippingDiscount)}</b></div>}
        <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
        <button className="button-primary checkout-link" type="submit">Place demo order · {money(total)}</button>
        <small>Delivery is available across Rwanda. By placing your order, you agree to the demo store's terms.</small>
      </aside>
    </form>
  </StoreLayout></main>;
}
