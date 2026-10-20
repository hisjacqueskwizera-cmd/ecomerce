const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 48;
const RIGHT = PAGE_W - 48;
const BOTTOM = 58;
const INK = "0.10 0.20 0.29";
const MUTED = "0.34 0.40 0.46";
const BLUE = "0.08 0.48 0.78";
const LINE = "0.82 0.87 0.90";

function clean(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E]/g, "?");
}

function esc(value) {
  return clean(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text, maxChars = 92) {
  const words = clean(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (line) lines.push(line);
      line = "";
      for (let i = 0; i < word.length; i += maxChars) lines.push(word.slice(i, i + maxChars));
      continue;
    }
    if (line && `${line} ${word}`.length > maxChars) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function money(amount) {
  return `RWF ${Math.round(Number(amount || 0)).toLocaleString("en-US")}`;
}

class Writer {
  constructor(title) { this.title = title; this.pages = []; this.newPage(); }
  newPage() { this.page = { ops: [], y: 785 }; this.pages.push(this.page); }
  ensure(height) { if (this.page.y - height < BOTTOM) this.newPage(); }
  text(text, { size = 9, color = INK, bold = false, indent = 0, line = size * 1.42 } = {}) {
    const lines = wrap(text, Math.floor((RIGHT - LEFT - indent) / (size * (bold ? 0.54 : 0.50))));
    this.ensure(lines.length * line + 2);
    for (const content of lines) {
      this.page.ops.push(`${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${LEFT + indent} ${this.page.y.toFixed(2)} Tm (${esc(content)}) Tj ET`);
      this.page.y -= line;
    }
    this.page.y -= 4;
  }
  header(title, subtitle) {
    this.page.ops.push(`${BLUE} rg 0 ${PAGE_H - 11} ${PAGE_W} 11 re f`);
    this.page.ops.push(`${BLUE} rg BT /F2 8 Tf 1 0 0 1 ${LEFT} 804 Tm (OPEN SHOP  /  RWANDA MARKETPLACE) Tj ET`);
    this.page.ops.push(`${INK} rg BT /F2 17 Tf 1 0 0 1 ${LEFT} 766 Tm (${esc(title)}) Tj ET`);
    let y = 743;
    for (const line of wrap(subtitle, 105)) {
      this.page.ops.push(`${MUTED} rg BT /F1 9 Tf 1 0 0 1 ${LEFT} ${y} Tm (${esc(line)}) Tj ET`); y -= 13;
    }
    this.page.ops.push(`${LINE} RG 0.8 w ${LEFT} ${y - 4} m ${RIGHT} ${y - 4} l S`);
    this.page.y = y - 25;
  }
  heading(text) {
    this.ensure(58);
    this.page.y -= 5;
    this.page.ops.push(`${INK} rg BT /F2 12 Tf 1 0 0 1 ${LEFT} ${this.page.y} Tm (${esc(text)}) Tj ET`);
    this.page.y -= 17;
    this.page.ops.push(`${BLUE} RG 1.3 w ${LEFT} ${this.page.y + 8} m ${LEFT + 40} ${this.page.y + 8} l S`);
  }
  table(rows, widths = [300, 190], keepTogether = false) {
    const x = LEFT, total = RIGHT - LEFT;
    if (keepTogether) {
      const needed = rows.reduce((sum, row) => {
        const leftLines = wrap(row[0], Math.floor(widths[0] / 4.3)).length;
        const rightLines = wrap(row[1], Math.floor(widths[1] / 4.3)).length;
        return sum + Math.max(23, Math.max(leftLines, rightLines, 1) * 11 + 10);
      }, 0) + 8;
      this.ensure(needed);
    }
    rows.forEach((row, idx) => {
      const leftLines = wrap(row[0], Math.floor(widths[0] / 4.3));
      const rightLines = wrap(row[1], Math.floor(widths[1] / 4.3));
      const lines = Math.max(leftLines.length, rightLines.length, 1);
      const height = Math.max(23, lines * 11 + 10);
      this.ensure(height + 1);
      const y0 = this.page.y - height;
      this.page.ops.push(`${idx % 2 ? "1 1 1" : "0.96 0.98 0.99"} rg ${x} ${y0} ${total} ${height} re f`);
      this.page.ops.push(`${LINE} RG 0.35 w ${x} ${y0} m ${RIGHT} ${y0} l S`);
      leftLines.forEach((line, i) => this.page.ops.push(`${INK} rg BT /F2 8.5 Tf 1 0 0 1 ${x + 7} ${this.page.y - 15 - i * 11} Tm (${esc(line)}) Tj ET`));
      rightLines.forEach((line, i) => this.page.ops.push(`${INK} rg BT /F1 8.5 Tf 1 0 0 1 ${x + widths[0] + 5} ${this.page.y - 15 - i * 11} Tm (${esc(line)}) Tj ET`));
      this.page.y = y0 - 1;
    });
    this.page.y -= 7;
  }
  footer() {
    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i];
      p.ops.push(`${LINE} RG 0.5 w ${LEFT} 42 m ${RIGHT} 42 l S`);
      p.ops.push(`${MUTED} rg BT /F1 7 Tf 1 0 0 1 ${LEFT} 28 Tm (${esc(this.title)}  |  Version 1.0  |  For legal review) Tj ET`);
      p.ops.push(`${BLUE} rg BT /F2 8 Tf 1 0 0 1 ${RIGHT - 22} 27 Tm (${String(i + 1).padStart(2, "0")}) Tj ET`);
    }
  }
  build() {
    this.footer();
    const objects = [];
    const add = (value) => { objects.push(value); return objects.length; };
    const catalog = add("");
    const pagesObj = add("");
    const font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const kids = [];
    for (const p of this.pages) {
      const stream = p.ops.join("\n");
      const contentId = add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
      const pageId = add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentId} 0 R >>`);
      kids.push(`${pageId} 0 R`);
    }
    objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
    objects[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${kids.length} >>`;
    let out = "%PDF-1.4\n%OpenShop\n";
    const offsets = [0];
    objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(out, "latin1")); out += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
    const xref = Buffer.byteLength(out, "latin1");
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) out += `${String(offset).padStart(10, "0")} 00000 n \n`;
    out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return Buffer.from(out, "latin1");
  }
}

function detailsRows(data, fields) {
  return fields.map(([label, key]) => [label, data[key] || "[TO BE COMPLETED]"]);
}

export function createSellerAgreement(data) {
  const doc = new Writer("Seller Partnership and Product Listing Agreement");
  doc.header("SELLER PARTNERSHIP AND PRODUCT LISTING AGREEMENT", "Open Shop Rwanda | Draft for completion and review by qualified Rwandan legal and accounting advisers before signature.");
  doc.text("This agreement records the terms on which the Open Shop contracting entity identified below (Open Shop) provides marketplace listing and related services to the seller identified below (Seller). Complete every marked field, select exactly one commercial plan, and have both parties sign the completed version.", { size: 9.5 });
  doc.heading("1. Parties and agreement details");
  doc.table(detailsRows(data, [["Open Shop registered legal name", "openLegalName"], ["Registration no. / TIN", "openRegistration"], ["Address / email / telephone", "openContact"], ["Seller legal or registered business name", "sellerLegalName"], ["Registration no. / TIN", "sellerRegistration"], ["Authorized representative and authority", "sellerRepresentative"], ["Shop address / telephone / email", "sellerContact"], ["Agreement date / effective date", "agreementDates"], ["Term / renewal / termination date", "agreementTerm"]]));
  doc.heading("2. Marketplace relationship and selected commercial plan");
  doc.text("Open Shop operates a marketplace that helps customers discover approved listings and contact or place trackable orders with independent sellers. Unless a separate written agreement says otherwise, Open Shop is not the seller of the goods or services, does not take ownership of stock, and does not fulfill orders. Seller remains responsible for the products or services, customer obligations, lawful sale, fulfillment and agreed delivery arrangements.");
  doc.text(`SELECTED PLAN: ${data.plan === "subscription" ? "FIXED LISTING SUBSCRIPTION" : "5% COMMISSION PLAN"}`, { bold: true });
  doc.table([["5% commission plan", data.plan === "commission" ? "SELECTED" : "NOT SELECTED"], ["Fixed listing subscription", data.plan === "subscription" ? "SELECTED" : "NOT SELECTED"], ["Commission pricing", "5% of eligible completed-sale subtotal after discounts; delivery and taxes excluded."], ["Subscription pricing", "RWF 50,000 monthly; RWF 600,000 across 12 monthly payments; RWF 500,000 for 12 months prepaid (RWF 100,000 saving)."]]);
  if (data.plan === "subscription") {
    doc.text("Fixed listing subscription: RWF 50,000 per month, or RWF 500,000 for twelve months paid in advance. Twelve monthly payments total RWF 600,000; the upfront annual price saves RWF 100,000. The Seller selects one billing term in the completed form. Subscription fees are payable by the date stated on the invoice, in advance for each selected period. Renewal requires written confirmation; no automatic renewal applies unless expressly agreed. Cancellation stops future renewal. Fees for a started period are non-refundable except where required by law or agreed in writing.");
    doc.table([["Selected subscription term", data.subscriptionTerm === "annual" ? "12 months prepaid - RWF 500,000" : "Monthly - RWF 50,000 per month"], ["Payment deadline / first period", data.subscriptionDetails || "[TO BE COMPLETED]"]]);
  } else {
    doc.text("Commission: 5% of eligible completed-sale product or service subtotal after discounts, excluding delivery charges and taxes. No commission is due on cancelled orders or fully refunded transactions. For a partial refund, commission is recalculated on the retained eligible subtotal and any excess commission is credited or deducted from the next reconciliation. For a chargeback or disputed transaction, the amount is held from settlement where practicable while reviewed; commission follows the final retained amount. No unapproved payment-processing deduction or fee may be charged. Any permitted, itemized processor deduction must be disclosed in writing before the transaction.");
    doc.text("Open Shop will keep transaction records available to the extent supported by its systems and provide a reconciliation showing order references, item subtotal, discounts, refunds, commission and net amount due. The parties will agree the payout schedule in writing before live paid orders; until then no payout timetable or processing deduction is represented as operational. Seller must promptly raise reconciliation errors. The current application does not process live payments or seller payouts.");
    doc.table([["Commission rate", "5%"], ["Payout schedule and channel", data.payoutDetails || "[TO BE AGREED IN WRITING BEFORE LIVE SALES]"]]);
  }
  doc.text("Only the selected plan applies. The plans cannot be combined unless a later signed addendum expressly says so. Taxes, invoicing, withholding and payment reporting must follow applicable law and be confirmed by the parties' accountant.");
  doc.heading("3. Listings, orders and seller service standards");
  ["Seller authorizes Open Shop to display products or services that Open Shop has approved, together with accurate descriptions, prices, product variations, availability, warranty information, delivery terms and images supplied or approved by Seller.", "Seller warrants that it owns or is authorized to sell each listed item, that items are genuine and accurately described, and that all products, services, claims, permits and sales comply with applicable laws and Open Shop's published restrictions. Seller is responsible for product safety, quality, labeling, warranty and advertising claims.", "Seller will keep prices and inventory current, promptly flag unavailable items, and respond to an order request within one business day. Seller is responsible for appropriate packaging, fulfillment, dispatch, customer service, and the delivery arrangements agreed for each order.", "Seller will promptly tell the customer and Open Shop if an item cannot be supplied. Seller handles cancellations, returns, refunds, warranties, complaints and remedies for its products in accordance with applicable consumer law and the written policy shown to the customer. The parties will cooperate on a complaint without limiting a customer's statutory rights.", "Open Shop may reject, correct, suspend or remove a listing, or suspend access, where information is inaccurate or an item appears unlawful, counterfeit, unsafe, prohibited, or likely to harm customers or the platform. Open Shop will give notice and a reasonable explanation where practicable; urgent safety or legal concerns may require immediate action."] .forEach((t, i) => doc.text(`${i + 1}. ${t}`, { indent: 10 }));
  doc.heading("4. Photography, content and intellectual property");
  doc.text("Photography is available only to sellers selected for and agreeing to participate in the photography program, subject to mutual agreement, scheduling and capacity. Any photography, editing, travel or production fee must be agreed in writing before work starts. Seller will make agreed products available at the agreed time and place. The parties will record handover, condition and return of valuable items and agree responsibility for loss or damage before custody changes.");
  doc.text("Seller retains ownership of its marks and submitted materials and confirms it has the rights and permissions needed to provide them. Seller grants Open Shop a non-exclusive, royalty-free permission during the listing and reasonable wind-down period to host, reproduce, resize and display approved product images, videos, descriptions and marks solely to list, promote and market Seller's products on Open Shop's website and authorized marketing channels. Seller may withdraw future use on reasonable written notice, subject to removal from materials already printed or distributed and lawful archival records.");
  doc.text("Use of Seller's premises, broader brand endorsements, or identifiable staff, customers or other individuals requires prior appropriate permission. Seller must provide clear, original images meeting Open Shop's listing standards when photography is not provided. Each party retains its pre-existing intellectual property.");
  doc.heading("5. Optional seller collaboration permissions");
  doc.text("Each permission is separate. Mark one choice on every line; no choice is implied from signing. Any specific session, placement, cost or campaign still requires written confirmation.");
  doc.table([["In-store live selling / filming", data.liveSelling || "NOT SELECTED"], ["Promotional materials in Seller's shop", data.shopMaterials || "NOT SELECTED"], ["Seller-created coupon codes", data.coupons || "NOT SELECTED"], ["Seller advertising with Open Shop", data.advertising || "NOT SELECTED"]]);
  doc.text("Live selling: any session requires agreed date, access, featured products, filming boundaries, staff consent, cancellation rules and approved production costs. Shop materials: parties will agree placement, duration, installation, maintenance, removal and costs. Coupon codes: each approved code must record its validity, eligible products, limits, stacking rules and funder. Seller-funded discounts reduce the eligible subtotal before commission; Open Shop-funded discounts are funded by Open Shop and are not deducted from Seller's proceeds. Advertising is optional and creates no purchase obligation under this agreement; paid advertising is governed only by a separate signed Advertising and Marketing Services Agreement.");
  doc.heading("6. Customer information and confidentiality");
  doc.text("Each party will use customer or business contact information only to perform this agreement, fulfill an order, provide requested service, meet legal obligations or another lawful purpose disclosed to the individual. Seller must protect information, limit access to people who need it, use reasonable security, avoid unrelated marketing without a lawful basis, and promptly notify Open Shop of a suspected disclosure or misuse. Each party will comply with applicable data protection and privacy obligations. Confidential non-public business information may be used only for this relationship and must be protected with reasonable care.");
  doc.heading("7. Term, suspension, termination and disputes");
  doc.text("This agreement starts on the effective date and continues for the term stated in the party details. Either party may terminate on [NOTICE PERIOD] written days' notice. A party may suspend affected activity or terminate for material breach not remedied within [CURE PERIOD] days after written notice, or immediately where required for safety, fraud or law. Termination does not waive accrued payment, reconciliation, customer remedy, confidentiality, data protection or intellectual-property obligations. Open Shop will remove listings within a reasonable operational period, subject to outstanding orders and legal records.");
  doc.text("The parties will first refer a dispute to designated representatives for good-faith discussion. If unresolved within [DISCUSSION PERIOD] days, either party may pursue remedies available under the applicable law. Governing law and any court or alternative dispute forum must be confirmed by a qualified Rwandan lawyer before signature. Nothing in this agreement limits mandatory consumer rights.");
  doc.heading("8. General terms and signatures");
  doc.text("Changes must be in writing and signed by both parties. If any term is invalid, the remaining terms continue to the extent permitted by law. This document and any signed schedules are the complete agreement on seller listing services. It does not create a partnership, employment, agency, or authority for either party to bind the other. The parties confirm they had the opportunity to obtain independent legal and tax advice.");
  doc.table([["Agreed amendments or special conditions", data.specialConditions || "[WRITE 'NONE' OR COMPLETE]"], ["Seller printed name / title", data.sellerSigner || "[TO BE COMPLETED]"], ["Seller signature / date / stamp", "_______________________________________________"], ["Open Shop printed name / title", data.openSigner || "[TO BE COMPLETED]"], ["Open Shop signature / date / stamp", "_______________________________________________"]], [300, 190], true);
  doc.heading("Review note - not a certification");
  doc.text("Draft for review by a qualified Rwandan lawyer and accountant before execution. Confirm the contracting entity and its registration details; commission and payout mechanics; subscriptions and refunds; tax and invoicing; consumer returns, warranties and product liability; privacy and marketing permissions; image rights; termination, disputes and governing law. This document is not represented as lawyer-approved or guaranteed enforceable.", { size: 8.5 });
  return doc.build();
}

const placements = [
  ["Homepage top banner", 150000], ["Homepage left-side banner", 90000],
  ["Homepage right-side banner", 90000], ["Product-grid advertising card", 60000],
  ["Product-detail advertising card", 50000],
];

export function adPricing(data) {
  const selected = data.bundle ? [{ name: "Full placement bundle", price: 350000 }] : placements.filter(([name]) => data.placements?.includes(name)).map(([name, price]) => ({ name, price }));
  const monthly = selected.reduce((sum, item) => sum + item.price, 0);
  const months = data.term === "annual" ? 12 : Math.max(3, Number(data.termMonths || 3));
  const founding = data.founding === true ? 0.25 : 0;
  const payableMonths = data.term === "annual" ? 10 : months;
  const discountedMonths = data.term === "annual" ? 0 : Math.min(3, payableMonths);
  const subscription = data.term === "annual"
    ? monthly * payableMonths
    : monthly * (payableMonths - discountedMonths * founding);
  const discountedMonthly = monthly * (1 - founding);
  const social = (Number(data.videoCount || 0) * 75000) + (Number(data.liveCount || 0) * 120000);
  return { selected, monthly, months, founding, discountedMonthly, payableMonths, subscription, social, total: subscription + social };
}

export function createAdvertisingAgreement(data) {
  const pricing = adPricing(data);
  const doc = new Writer("Advertising and Marketing Services Agreement");
  doc.header("ADVERTISING AND MARKETING SERVICES AGREEMENT", "Independent agreement for Open Shop paid advertising | Proposed rate card for business confirmation and legal review.");
  doc.text("This agreement is between the Open Shop contracting entity identified below (Open Shop) and the advertiser identified below (Advertiser). It is independent of any seller partnership agreement. A seller who does not purchase advertising owes no fees under this agreement. Complete and approve the campaign schedule before signing.", { size: 9.5 });
  doc.heading("1. Advertiser and campaign");
  doc.table(detailsRows(data, [["Open Shop legal name / registration / TIN", "openLegalName"], ["Open Shop address / email / telephone", "openContact"], ["Advertiser legal or business name", "advertiserName"], ["Registration no. / TIN", "advertiserRegistration"], ["Authorized representative / title", "advertiserRepresentative"], ["Contact details / billing address", "advertiserContact"], ["Campaign name and objectives", "campaignObjective"], ["Service period", "campaignDates"], ["Payment plan / payment deadline", "paymentDetails"], ["Approved creative / deliverables", "creativeDetails"]]));
  doc.heading("2. Selected advertising services and proposed rates");
  doc.text("The rate card below is based on planning estimates in the Open Shop business plan and must be confirmed in the signed campaign schedule before execution. All amounts are Rwandan francs. Placements will be labeled as sponsored.");
  doc.table([...pricing.selected.map(item => [item.name, `${money(item.price)} / month`]), ["Selected monthly placement subtotal", `${money(pricing.monthly)} / month`], ...(pricing.founding ? [["Founding advertiser offer", "25% off full bundle for first 3 months - subject to approval"], ["Three-month founding placement price", money(pricing.monthly * 3 * 0.75)]] : []), [data.term === "annual" ? "Annual fee (10 months paid; 12 months service)" : `${pricing.months}-month placement commitment`, money(pricing.subscription)], ["Sponsored short videos", `${Number(data.videoCount || 0)} x RWF 75,000 = ${money(Number(data.videoCount || 0) * 75000)}`], ["Hosted 30-minute live features", `${Number(data.liveCount || 0)} x RWF 120,000 = ${money(Number(data.liveCount || 0) * 120000)}`], ["TOTAL AGREED CAMPAIGN PRICE", money(pricing.total)]]);
  doc.text("Proposed monthly placements: Homepage top banner RWF 150,000; homepage left-side banner RWF 90,000; homepage right-side banner RWF 90,000; product-grid card RWF 60,000; product-detail card RWF 50,000. Full-placement bundle (all five positions) RWF 350,000 per month. Individual placement prices total RWF 440,000 per month. Proposed social services: short sponsored video RWF 75,000 each; hosted 30-minute live feature RWF 120,000 each. Travel, media spend, external creators, production expenses and other costs are excluded unless included in a signed quotation.");
  doc.heading("3. Commitment, billing, start and renewal");
  if (data.term === "annual") doc.text(`Advertiser selects a twelve-month service commitment with full payment in advance. The upfront price is ten times the applicable approved monthly placement rate (${money(pricing.discountedMonthly)} x 10 = ${money(pricing.subscription)}), and service runs for twelve months from the agreed start date. The two free months are not cash refundable. The annual discount cannot be combined with the founding offer or another discount unless expressly approved in a separate signed writing.`);
  else doc.text(`Advertiser commits to at least three consecutive months of the selected service. The standard placement value is ${money(pricing.monthly)} per month x ${pricing.months} months = ${money(pricing.monthly * pricing.months)}${pricing.founding ? `; after the approved 25% discount on the first three months, placement fees are ${money(pricing.subscription)}` : `, payable as ${money(pricing.subscription)}`}. Add approved per-item social services and written extra costs. Invoices are payable ${data.paymentMode === "prepaid" ? "in advance for the full committed term" : "monthly in advance"} by the deadline in the campaign schedule. A longer term must be stated in writing.`);
  doc.text("Campaign delivery starts only after the required payment is received and Open Shop approves the creative. Renewal requires written agreement and confirmation of then-current rates; no automatic renewal applies unless expressly agreed. Early termination does not by itself remove payment obligations for the committed term. The parties must have a Rwandan lawyer review enforceability, exceptions and remedies before signature.");
  doc.heading("4. Creative, delivery and reporting");
  ["Advertiser will provide accurate claims and creative that it owns or is authorized to use, including required consents for marks, music, images and identifiable people. Advertiser is responsible for substantiating claims and securing any required permits.", "Open Shop will deliver the selected placement and approved creative during the campaign dates, subject to technical availability, platform policies and applicable law. Every paid placement will be clearly identified as sponsored. Placement is not endorsement, certification, product-quality verification, or a guarantee of impressions, views, clicks, inquiries, conversions or sales.", "Open Shop will provide a campaign summary of dates and available metrics such as views, clicks, attributed inquiries and orders where measurable. Measurement methods and attribution depend on available systems; the current application does not store order attribution or payment records.", "Advertiser must not submit illegal, misleading, unsafe, counterfeit, infringing or otherwise prohibited advertising. Open Shop may reject, pause or remove non-compliant creative or campaigns, and will explain the issue where practicable. Advertiser will cooperate on corrections. Any revisions, creative deadlines, campaign changes, category exclusivity or additional deliverables must be stated in the schedule.", "Category exclusivity is not included unless separately agreed in writing. Open Shop does not warrant continuous, uninterrupted placement; for a material technical interruption within Open Shop's control, the parties will agree a reasonable make-good extension or prorated credit for undelivered service days, where practicable."] .forEach((t, i) => doc.text(`${i + 1}. ${t}`, { indent: 10 }));
  doc.heading("5. Cancellation, suspension, refunds and costs");
  doc.text("Either party may request a campaign change or cancellation in writing. Any unused prepaid days will be rescheduled or credited by written agreement if Open Shop cannot deliver them, except where the interruption results from Advertiser's non-compliant materials, failure to provide creative, or breach. For advertiser cancellation, prepaid fees for the committed period are not automatically refundable, subject to mandatory law and any written exception. Open Shop may suspend delivery for overdue payment, unlawful content or a material breach and will notify Advertiser where practicable. The parties should confirm refund treatment, taxes and termination remedies with legal and accounting advisers before signing.");
  doc.heading("6. Data, rights and confidentiality");
  doc.text("Each party retains its pre-existing intellectual property. Advertiser grants Open Shop a limited, non-exclusive permission to use approved creative and marks to deliver and report this campaign during the term and for a reasonable recordkeeping period. Open Shop may not use Advertiser's mark in unrelated endorsements or case studies without separate consent. Each party will protect confidential campaign information and handle personal data only for campaign delivery, reporting, legal compliance or another disclosed lawful purpose, with reasonable safeguards.");
  doc.heading("7. Disputes, general terms and signatures");
  doc.text("The parties will first refer a dispute to designated representatives for good-faith discussion. Any governing law, venue or alternative dispute process must be confirmed by a qualified Rwandan lawyer. Changes must be written and signed by both parties. This agreement governs only the selected advertising services and does not amend a seller listing agreement unless a signed addendum expressly says so.");
  doc.table([["Additional campaign-specific conditions", data.specialConditions || "[WRITE 'NONE' OR COMPLETE]"], ["Advertiser printed name / title", data.advertiserSigner || "[TO BE COMPLETED]"], ["Advertiser signature / date", "_______________________________________________"], ["Open Shop printed name / title", data.openSigner || "[TO BE COMPLETED]"], ["Open Shop signature / date", "_______________________________________________"]], [300, 190], true);
  doc.heading("Review note - not a certification");
  doc.text("Draft for review by a qualified Rwandan lawyer and accountant. Confirm the contracting entity, registration and tax details; proposed rate card; invoicing and taxes; minimum term and early termination; refunds and make-good rules; campaign and data reporting; creative rights and privacy; dispute resolution and governing law. Founding advertiser pricing is subject to business approval. This document is not represented as lawyer-approved or guaranteed enforceable.", { size: 8.5 });
  return doc.build();
}

export function sellerAgreementSample() { return createSellerAgreement({ plan: "commission", liveSelling: "[ACCEPTED / DECLINED]", shopMaterials: "[ACCEPTED / DECLINED]", coupons: "[ACCEPTED / DECLINED]", advertising: "[ACCEPTED / DECLINED]" }); }
export function advertisingAgreementSample() { return createAdvertisingAgreement({ bundle: true, term: "monthly", termMonths: 3, paymentMode: "monthly", videoCount: 0, liveCount: 0 }); }
