"use client";

import { useState } from "react";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import DistrictOptions from "../../components/DistrictOptions";
import { SELLER_APPLICATIONS_KEY, readStored, saveStored } from "../../lib/admin-data";
import { useStorefrontConfig } from "../../components/useStorefrontConfig";

export default function SellPage() {
  const config = useStorefrontConfig();
  const [sent, setSent] = useState(false);
  if (sent) return <main><StoreLayout><div className="confirmation-card"><div className="confirmation-check">✓</div><span className="eyebrow">THANK YOU</span><h1>We have your details.</h1><p>Your seller interest has been saved for this demo. In a live marketplace, the team would follow up with next steps.</p></div></StoreLayout></main>;
  function submitApplication(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const applications = readStored(SELLER_APPLICATIONS_KEY, []);
    applications.unshift({ id: `seller-${Date.now()}`, name: data.get("name"), store: data.get("store"), email: data.get("email"), district: data.get("district"), category: data.get("category"), about: data.get("about"), submittedAt: new Date().toISOString(), status: "New" });
    saveStored(SELLER_APPLICATIONS_KEY, applications);
    setSent(true);
  }
  return <main><StoreLayout><PageTitle eyebrow={config.sell.eyebrow} title={config.sell.title} description={config.sell.description}/><div className="seller-application"><div className="application-copy"><h2>{config.sell.heading}</h2><p>{config.sell.text}</p><ul><li>Give your products a place to shine</li><li>Reach people looking for something different</li><li>Build a store profile around your story</li></ul><p className="demo-notice">This is a front-end demo. Submissions are not sent to a marketplace operator.</p></div><form className="checkout-panel" onSubmit={submitApplication}><h2>Seller interest form</h2><label>Your name<input name="name" required placeholder="Full name"/></label><label>Business or store name<input name="store" required placeholder="Store name"/></label><label>Contact email<input name="email" required type="email" placeholder="you@yourstore.com"/></label><label>Store district in Rwanda<select name="district" required defaultValue=""><option value="" disabled>Choose a district</option><DistrictOptions/></select></label><label>What do you sell?<select name="category" required defaultValue=""><option value="" disabled>Choose a category</option><option>Clothing and accessories</option><option>Home and decor</option><option>Food and drink</option><option>Art and handmade goods</option><option>Other</option></select></label><label>Tell us about your store<textarea name="about" rows="4" placeholder="What makes your shop special?"/></label><button className="button-primary">Send seller interest</button></form></div></StoreLayout></main>;
}
