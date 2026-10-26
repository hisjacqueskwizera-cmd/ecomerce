"use client";

import { useEffect, useState } from "react";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import DistrictOptions from "../../components/DistrictOptions";
import { useStorefrontConfig } from "../../components/useStorefrontConfig";

export default function ContactPage() {
  const config = useStorefrontConfig();
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const property = new URLSearchParams(window.location.search).get("property");
    if (property) setMessage(`Hello, I would like to enquire about ${property}. Please share the next steps for arranging a viewing.`);
  }, []);
  return <main><StoreLayout><PageTitle eyebrow={config.contact.eyebrow} title={config.contact.title} description={config.contact.description}/><div className="contact-layout"><form className="contact-form" onSubmit={event => { event.preventDefault(); setSent(true); }}><label>Your name<input required placeholder="Full name"/></label><label>Email address<input required type="email" placeholder="you@example.com"/></label><label>Your district (optional)<select defaultValue=""><option value="">Choose a district</option><DistrictOptions/></select></label><label>What can we help with?<select defaultValue="Order question"><option>Order question</option><option>Product question</option><option>Returns and refunds</option><option>Selling on JashaMart</option><option>Something else</option></select></label><label>Your message<textarea rows="5" required value={message} onChange={event => setMessage(event.target.value)} placeholder="Tell us how we can help..."/></label><button className="button-primary">Send message â†’</button>{sent && <p>Thanks for getting in touch. This demo form does not send messages.</p>}</form><aside className="contact-details"><span className="eyebrow">CUSTOMER CARE</span><h2>{config.contact.heading}</h2><p>We're available Monday to Friday, 9amâ€“5pm EAT. For an order update, include your order reference in your message.</p><b>Email</b><p>{config.contact.email}</p><b>Phone</b><p>{config.contact.phone}</p><b>Seller support</b><p>Have a shop on JashaMart? Use the seller interest form and weâ€™ll point you in the right direction.</p></aside></div></StoreLayout></main>;
}
