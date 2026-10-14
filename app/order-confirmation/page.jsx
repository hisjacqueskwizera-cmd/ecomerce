"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StoreLayout } from "../../components/StoreChrome";
import { money } from "../../lib/catalog";

function Confirmation() {
  const params = useSearchParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { try { setOrder(JSON.parse(localStorage.getItem("openshop-last-order-rwf-v2") || "null")); } catch { setOrder(null); } }, []);
  return <div className="confirmation-card"><div className="confirmation-check">✓</div><span className="eyebrow">ORDER RECEIVED</span><h1>Thanks{order?.name ? `, ${order.name.split(" ")[0]}` : ""}!</h1><p>Your demo order has been created. This confirmation is saved in this browser.</p><div className="confirmation-reference"><span>Order reference</span><b>{params.get("reference") || order?.reference || "Open Shop"}</b></div>{order?.district && <div className="confirmation-total"><span>Delivery district</span><b>{order.district}, Rwanda</b></div>}{order?.couponCode && <div className="confirmation-total"><span>Coupon · {order.couponCode}</span><b>− {money(order.discount + order.shippingDiscount)}</b></div>}{order && <div className="confirmation-total"><span>Order total</span><b>{money(order.total)}</b></div>}<div className="demo-notice">This is a sample storefront. No payment was taken and the order has not been sent to a seller.</div><div className="confirmation-actions"><Link href="/account">View your account</Link><Link className="button-primary" href="/shop">Continue shopping</Link></div></div>;
}

export default function OrderConfirmationPage() {
  return <main><StoreLayout><Suspense fallback={<div className="loading-state">Loading order…</div>}><Confirmation/></Suspense></StoreLayout></main>;
}
