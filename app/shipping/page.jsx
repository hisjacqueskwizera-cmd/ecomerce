"use client";

import Link from "next/link";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import { useStorefrontConfig } from "../../components/useStorefrontConfig";

export default function ShippingPage() {
  const { shipping } = useStorefrontConfig();
  return <main><StoreLayout><PageTitle eyebrow={shipping.eyebrow} title={shipping.title} description={shipping.description}/><div className="content-narrow"><h2>{shipping.deliveryTitle}</h2><p>{shipping.deliveryText}</p><h2>{shipping.estimateTitle}</h2><p>{shipping.estimateText}</p><h2>{shipping.returnsTitle}</h2><p>{shipping.returnsText}</p><h2>Need a hand?</h2><p>For help with an order or return, <Link href="/contact">contact our team</Link>. The current site is a front-end demo and does not send support requests.</p></div></StoreLayout></main>;
}
