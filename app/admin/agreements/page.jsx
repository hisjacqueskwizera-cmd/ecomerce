"use client";

import { useMemo, useState } from "react";

const sellerDefaults = {
  openLegalName: "", openRegistration: "", openContact: "", sellerLegalName: "", sellerRegistration: "",
  sellerRepresentative: "", sellerContact: "", agreementDates: "", agreementTerm: "",
  plan: "commission", subscriptionTerm: "monthly", subscriptionDetails: "", payoutDetails: "",
  liveSelling: "", shopMaterials: "", coupons: "", advertising: "", sellerSigner: "", openSigner: "", specialConditions: "",
};
const adDefaults = {
  openLegalName: "", openRegistration: "", openContact: "", advertiserName: "", advertiserRegistration: "",
  advertiserRepresentative: "", advertiserContact: "", campaignObjective: "", campaignDates: "",
  paymentDetails: "", paymentMode: "monthly", creativeDetails: "", placements: [], bundle: false,
  term: "monthly", termMonths: 3, founding: false, foundingApproved: false, videoCount: 0, liveCount: 0,
  advertiserSigner: "", openSigner: "", specialConditions: "",
};
const placementRates = [
  ["Homepage top banner", 150000], ["Homepage left-side banner", 90000], ["Homepage right-side banner", 90000],
  ["Product-grid advertising card", 60000], ["Product-detail advertising card", 50000],
];
const money = value => `RWF ${Number(value || 0).toLocaleString("en-RW")}`;

function Field({ label, name, data, setData, required = false, type = "text", wide = false, placeholder = "" }) {
  return <label className={`admin-field ${wide ? "wide" : ""}`}>{label}<input name={name} type={type} required={required} value={data[name] ?? ""} placeholder={placeholder} onChange={event => setData(current => ({ ...current, [name]: event.target.value }))}/></label>;
}

function CheckChoice({ label, name, data, setData }) {
  return <fieldset className="agreement-choice"><legend>{label}</legend><label><input type="radio" name={name} value="accepted" checked={data[name] === "accepted"} onChange={() => setData(current => ({ ...current, [name]: "accepted" }))}/> Accepted</label><label><input type="radio" name={name} value="declined" checked={data[name] === "declined"} onChange={() => setData(current => ({ ...current, [name]: "declined" }))}/> Declined</label></fieldset>;
}

function useGenerator(type) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function generate(data, filename) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/agreements/${type}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Generation failed (${response.status}).`);
      }
      const blob = await response.blob();
      if (blob.type !== "application/pdf") throw new Error("The server did not return a PDF.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
      URL.revokeObjectURL(url);
      setNotice("PDF generated and downloaded. Review all placeholders and terms before sending for signature.");
    } catch (cause) { setError(cause.message || "Could not generate the agreement."); }
    finally { setBusy(false); }
  }
  return { busy, error, notice, generate };
}

function SellerForm() {
  const [data, setData] = useState(sellerDefaults);
  const generator = useGenerator("seller");
  return <section className="admin-card agreement-card">
    <div className="admin-card-title"><div><h2>Seller partnership and product listing</h2><p>Select one commercial plan and record each optional permission separately.</p></div><span className="admin-status">Seller agreement</span></div>
    <div className="admin-form-grid">
      <h3 className="agreement-subhead">JashaMart contracting entity</h3>
      <Field label="Registered legal name" name="openLegalName" data={data} setData={setData} required/><Field label="Registration number and TIN" name="openRegistration" data={data} setData={setData} placeholder="Enter verified details or state pending verification"/>
      <Field label="Registered address, email and telephone" name="openContact" data={data} setData={setData} required wide/>
      <h3 className="agreement-subhead">Seller</h3>
      <Field label="Legal or registered business name" name="sellerLegalName" data={data} setData={setData} required/><Field label="Registration number and TIN, if applicable" name="sellerRegistration" data={data} setData={setData}/>
      <Field label="Authorized representative and authority" name="sellerRepresentative" data={data} setData={setData} required/><Field label="Shop address, telephone and email" name="sellerContact" data={data} setData={setData} required/>
      <Field label="Agreement date and effective date" name="agreementDates" data={data} setData={setData} required placeholder="e.g. 20 Oct 2026 / 1 Nov 2026"/><Field label="Duration, renewal and termination date" name="agreementTerm" data={data} setData={setData} required placeholder="e.g. 12 months; renewal by written agreement"/>
      <h3 className="agreement-subhead">Commercial plan - choose one</h3>
      <div className="agreement-plan wide"><label><input type="radio" name="seller-plan" checked={data.plan === "commission"} onChange={() => setData(current => ({ ...current, plan: "commission" }))}/> 5% commission on eligible completed sales</label><p>On discounted product/service subtotal; delivery and taxes excluded. Cancelled and fully refunded sales carry no commission.</p><label><input type="radio" name="seller-plan" checked={data.plan === "subscription"} onChange={() => setData(current => ({ ...current, plan: "subscription" }))}/> Fixed listing subscription</label><p>RWF 50,000 monthly, or RWF 500,000 for twelve months prepaid (RWF 100,000 below twelve monthly payments).</p></div>
      {data.plan === "commission" ? <Field label="Payout schedule and channel (agree before live paid orders)" name="payoutDetails" data={data} setData={setData} wide placeholder="State agreed schedule; no payout is currently processed by this app"/> : <><label className="admin-field">Subscription billing term<select value={data.subscriptionTerm} onChange={event => setData(current => ({ ...current, subscriptionTerm: event.target.value }))}><option value="monthly">Monthly - RWF 50,000</option><option value="annual">Twelve months prepaid - RWF 500,000</option></select></label><Field label="Payment due date / first subscription period" name="subscriptionDetails" data={data} setData={setData} placeholder="Invoice date and coverage"/></>}
      <h3 className="agreement-subhead">Optional seller collaboration permissions</h3>
      <CheckChoice label="In-store live selling / filming" name="liveSelling" data={data} setData={setData}/><CheckChoice label="JashaMart promotional materials in shop" name="shopMaterials" data={data} setData={setData}/><CheckChoice label="Seller-created coupon codes" name="coupons" data={data} setData={setData}/><CheckChoice label="Seller advertising with JashaMart" name="advertising" data={data} setData={setData}/>
      <Field label="Seller signatory name and title" name="sellerSigner" data={data} setData={setData}/><Field label="JashaMart signatory name and title" name="openSigner" data={data} setData={setData}/>
      <Field label="Amendments or special conditions" name="specialConditions" data={data} setData={setData} wide placeholder="Enter NONE or specific signed conditions"/>
    </div>
    <p className="agreement-review-note">Required party details must be supplied. Missing registration details may be marked pending verification, but resolve them before execution.</p>
    {generator.error && <p className="coupon-error" role="alert">{generator.error}</p>}{generator.notice && <p className="coupon-success" role="status">{generator.notice}</p>}
    <button className="admin-primary" disabled={generator.busy} onClick={() => generator.generate(data, "Seller Partnership and Product Listing Agreement.pdf")}>{generator.busy ? "Generating PDF…" : "Generate seller agreement PDF"}</button>
  </section>;
}

function AdvertisingForm() {
  const [data, setData] = useState(adDefaults);
  const generator = useGenerator("advertising");
  const pricing = useMemo(() => {
    const names = data.bundle ? [] : data.placements;
    const monthly = data.bundle ? 350000 : placementRates.filter(([name]) => names.includes(name)).reduce((sum, [, rate]) => sum + rate, 0);
    const months = data.term === "annual" ? 10 : Number(data.termMonths);
    const discount = data.founding && data.foundingApproved && data.bundle && data.term === "monthly" ? 0.25 : 0;
    const base = monthly * (months - (discount ? 3 * discount : 0));
    const social = Number(data.videoCount) * 75000 + Number(data.liveCount) * 120000;
    return { monthly, base, social, total: base + social };
  }, [data]);
  function togglePlacement(name) { setData(current => ({ ...current, bundle: false, founding: false, foundingApproved: false, placements: current.placements.includes(name) ? current.placements.filter(item => item !== name) : [...current.placements, name] })); }
  return <section className="admin-card agreement-card">
    <div className="admin-card-title"><div><h2>Advertising and marketing services</h2><p>Separate from the seller agreement. Every campaign has at least a three-month commitment.</p></div><span className="admin-status">Advertising agreement</span></div>
    <div className="admin-form-grid">
      <h3 className="agreement-subhead">Parties and campaign</h3>
      <Field label="JashaMart registered legal name" name="openLegalName" data={data} setData={setData} required/><Field label="JashaMart registration / TIN" name="openRegistration" data={data} setData={setData}/>
      <Field label="JashaMart address, email and telephone" name="openContact" data={data} setData={setData} required wide/>
      <Field label="Advertiser legal or business name" name="advertiserName" data={data} setData={setData} required/><Field label="Advertiser registration number and TIN, if applicable" name="advertiserRegistration" data={data} setData={setData}/>
      <Field label="Authorized representative and title" name="advertiserRepresentative" data={data} setData={setData} required/><Field label="Contact details and billing address" name="advertiserContact" data={data} setData={setData} required/>
      <Field label="Campaign name and objectives" name="campaignObjective" data={data} setData={setData} required/><Field label="Campaign start and end dates" name="campaignDates" data={data} setData={setData} required placeholder="e.g. 1 Nov 2026 to 31 Jan 2027"/>
      <Field label="Payment deadline / billing schedule" name="paymentDetails" data={data} setData={setData} required placeholder="e.g. monthly in advance, due on the 1st"/><Field label="Approved creative and deliverables" name="creativeDetails" data={data} setData={setData} required placeholder="Describe and identify approved creative"/>
      <h3 className="agreement-subhead">Choose paid placements</h3>
      <div className="agreement-rates wide"><label className="agreement-rate"><input type="checkbox" checked={data.bundle} onChange={event => setData(current => ({ ...current, bundle: event.target.checked, placements: event.target.checked ? [] : current.placements, founding: event.target.checked ? current.founding : false, foundingApproved: event.target.checked ? current.foundingApproved : false }))}/><span>Full placement bundle - all five positions</span><b>RWF 350,000 / month</b></label>{placementRates.map(([name, rate]) => <label className="agreement-rate" key={name}><input type="checkbox" checked={data.placements.includes(name)} disabled={data.bundle} onChange={() => togglePlacement(name)}/><span>{name}</span><b>{money(rate)} / month</b></label>)}<small>Individual placements total RWF 440,000 monthly. All prices are proposed and require confirmation before execution.</small></div>
      <h3 className="agreement-subhead">Term, discounts and social services</h3>
      <label className="admin-field">Commitment<select value={data.term} onChange={event => setData(current => ({ ...current, term: event.target.value, founding: event.target.value === "annual" ? false : current.founding, foundingApproved: event.target.value === "annual" ? false : current.foundingApproved }))}><option value="monthly">Minimum 3 months</option><option value="annual">12 months, pay for 10 upfront</option></select></label>
      {data.term === "monthly" ? <><label className="admin-field">Committed duration<select value={data.termMonths} onChange={event => setData(current => ({ ...current, termMonths: Number(event.target.value) }))}>{[3, 4, 5, 6, 9, 12].map(month => <option key={month} value={month}>{month} consecutive months</option>)}</select></label><label className="admin-field">Billing schedule<select value={data.paymentMode} onChange={event => setData(current => ({ ...current, paymentMode: event.target.value }))}><option value="monthly">Monthly in advance</option><option value="prepaid">Prepaid for full term</option></select></label></> : <div className="agreement-callout"><b>Annual upfront price</b><span>10 × applicable monthly placement rate; twelve months of service. Do not combine with other discounts.</span></div>}
      <label className="agreement-choice agreement-check"><input type="checkbox" disabled={!data.bundle || data.term === "annual"} checked={data.founding} onChange={event => setData(current => ({ ...current, founding: event.target.checked, foundingApproved: event.target.checked ? current.foundingApproved : false }))}/><span>Request proposed founding advertiser offer (25% off full-placement bundle for first 3 months)</span></label>
      {data.founding && <label className="agreement-choice agreement-check"><input type="checkbox" checked={data.foundingApproved} onChange={event => setData(current => ({ ...current, foundingApproved: event.target.checked }))}/><span>Business approval has been documented for this advertiser and this offer.</span></label>}
      <label className="admin-field">Short sponsored videos (RWF 75,000 each)<input type="number" min="0" max="10" value={data.videoCount} onChange={event => setData(current => ({ ...current, videoCount: Number(event.target.value) }))}/></label>
      <label className="admin-field">Hosted 30-minute live features (RWF 120,000 each)<input type="number" min="0" max="10" value={data.liveCount} onChange={event => setData(current => ({ ...current, liveCount: Number(event.target.value) }))}/></label>
      <div className="agreement-pricing wide"><div><span>Monthly placement rate</span><strong>{money(pricing.monthly)}</strong></div><div><span>Placement commitment</span><strong>{money(pricing.base)}</strong></div><div><span>Social services</span><strong>{money(pricing.social)}</strong></div><div className="agreement-total"><span>Total campaign price</span><strong>{money(pricing.total)}</strong></div></div>
      <Field label="Advertiser signatory name and title" name="advertiserSigner" data={data} setData={setData}/><Field label="JashaMart signatory name and title" name="openSigner" data={data} setData={setData}/>
      <Field label="Additional campaign-specific conditions" name="specialConditions" data={data} setData={setData} wide placeholder="Enter NONE or signed campaign conditions"/>
    </div>
    <p className="agreement-review-note">Campaign start requires payment and creative approval. No performance or sales volume is guaranteed. Rate card, founding offer and legal terms require business, legal and accounting review.</p>
    {generator.error && <p className="coupon-error" role="alert">{generator.error}</p>}{generator.notice && <p className="coupon-success" role="status">{generator.notice}</p>}
    <button className="admin-primary" disabled={generator.busy} onClick={() => generator.generate(data, "Advertising and Marketing Services Agreement.pdf")}>{generator.busy ? "Generating PDF…" : "Generate advertising agreement PDF"}</button>
  </section>;
}

export default function AdminAgreementsPage() {
  return <>
    <div className="admin-page-heading"><div><h1>Agreements</h1><p>Generate completed seller and advertiser agreements for review and signature.</p></div></div>
    <div className="agreement-intro"><strong>Draft documents only</strong><span>Generated PDFs are downloaded to your device and are not stored in the application. Do not use unsigned draft terms as proof of an executed agreement. Confirm all legal entity details and proposed prices before signature.</span></div>
    <SellerForm/><AdvertisingForm/>
  </>;
}
