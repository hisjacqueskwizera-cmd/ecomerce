"use client";

import { useEffect, useState } from "react";
import { coupons as seedCoupons, calculateCoupon, getCoupons } from "../lib/coupons";
import { money } from "../lib/catalog";
import { useStore } from "./StoreProvider";

export default function CouponBox({ items, shipping }) {
  const { appliedCouponCode, applyCoupon, clearCoupon } = useStore();
  const [code, setCode] = useState(appliedCouponCode);
  const [feedback, setFeedback] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState(seedCoupons);
  const applied = appliedCouponCode ? calculateCoupon(appliedCouponCode, items, shipping) : null;
  useEffect(() => { setCode(appliedCouponCode); setAvailableCoupons(getCoupons()); }, [appliedCouponCode]);
  function submitCoupon(value = code) {
    const result = calculateCoupon(value, items, shipping);
    setFeedback(result.message);
    if (result.valid) applyCoupon(value);
  }
  return <section className="coupon-box" aria-label="Apply coupon">
    <b>Have a coupon?</b><p>Enter a code or choose one of the available offers.</p>
    <div className="coupon-entry"><input aria-label="Coupon code" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="Enter coupon code"/><button type="button" onClick={() => submitCoupon()}>Apply</button></div>
    {appliedCouponCode && applied?.valid && <div className="coupon-applied"><span><b>{appliedCouponCode}</b> · {applied.message}</span><button type="button" onClick={() => { clearCoupon(); setFeedback(""); }}>Remove</button></div>}
    {appliedCouponCode && !applied?.valid && <small className="coupon-error" aria-live="polite">{applied?.message}</small>}
    {feedback && <small className={feedback.includes("applied") ? "coupon-success" : "coupon-error"} aria-live="polite">{feedback}</small>}
    <details className="coupon-offers"><summary>Available offers</summary><div>{availableCoupons.filter(coupon => coupon.active !== false).map(coupon => <button key={coupon.code} type="button" title={coupon.description} onClick={() => { setCode(coupon.code); submitCoupon(coupon.code); }}><b>{coupon.code}</b><span>{coupon.type === "percent" ? `${coupon.value}% off` : coupon.type === "fixed" ? money(coupon.value) + " off" : "Free shipping"}</span></button>)}</div></details>
  </section>;
}
