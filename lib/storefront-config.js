export const STOREFRONT_CONFIG_KEY = "openshop-storefront-content-v1";

export const defaultStorefrontConfig = {
  chrome: {
    tagline: "Rwanda's local marketplace",
    footerDescription: "Rwanda’s marketplace for products and independent retailers.",
    newsletterTitle: "Get product updates in your inbox",
    newsletterText: "Store stories, new arrivals, and current promotions.",
    showHeader: true,
    showNavigation: true,
    showFooter: true,
    nav: [
      { label: "Today's deals", href: "/shop?sort=popular", active: true },
      { label: "Shop all", href: "/shop", active: true },
      { label: "Stores", href: "/stores", active: true },
      { label: "Sell on JashaMart", href: "/sell", active: true },
      { label: "Delivery & returns", href: "/shipping", active: true },
      { label: "Customer service", href: "/contact", active: true },
      { label: "Stories", href: "/journal", active: true },
    ],
  },
  home: {
    heroTitle: "Find your kind of good.\nShop local, everywhere.",
    heroText: "Discover useful things and thoughtful finds from independent stores across Rwanda.",
    sections: {
      departments: { active: true, eyebrow: "SHOP YOUR WAY", title: "Explore departments" },
      popular: { active: true, eyebrow: "GREAT PRODUCTS, GREAT PRICES", title: "Popular on JashaMart" },
      promotions: { active: true, eyebrow: "OFFERS & COUPONS", title: "Save on your next order", text: "Find current discounts from shops across Rwanda." },
      newArrivals: { active: true, eyebrow: "FRESH FROM OUR STORES", title: "New arrivals" },
      stores: { active: true, eyebrow: "MEET THE PEOPLE BEHIND THE PRODUCTS", title: "Shop independent stores" },
      bestSellers: { active: true, eyebrow: "CUSTOMER BEST SELLERS", title: "Best sellers" },
      benefits: { active: true },
      newsletter: { active: true },
    },
  },
  contact: {
    eyebrow: "WE'RE HERE TO HELP", title: "Contact JashaMart", description: "Questions about an order, a store, or anything else? Send us a note.",
    heading: "A real person, ready to help.", email: "hello@openshop.example", phone: "+250 788 000 000",
  },
  faq: {
    eyebrow: "HELP CENTER", title: "Frequently asked questions", description: "A few quick answers about shopping on JashaMart.",
    questions: [
      ["How do I place an order?", "Add products to your cart, review your order, and continue to checkout. This storefront demonstrates the flow locally; it does not collect payment or send orders to sellers."],
      ["Can I buy from different stores in one order?", "Yes. The marketplace cart can include products from multiple independent stores. In a live marketplace, each seller would handle dispatch for their own items."],
      ["How much is delivery?", "Delivery is estimated at checkout. This demo uses a sample RWF 12,000 delivery charge for orders under RWF 150,000 and free delivery above that amount."],
      ["What is the returns policy?", "Unused items can be returned within 30 days in this demo storefront. A live marketplace would show the specific return terms for each seller."],
      ["How do I save products for later?", "Select the heart on any product to save it to your wishlist. Saved items stay in this browser."],
      ["How can my business sell on JashaMart?", "Visit the Sell on JashaMart page and send a seller interest form. The current demo does not transmit submissions."],
      ["Where can I find my order?", "After placing a demo order, your order reference and items are available on the account page in the same browser."],
      ["What payment methods are available?", "The checkout page shows sample payment methods to demonstrate the layout. No payment is processed."],
    ],
  },
  shipping: {
    eyebrow: "DELIVERY & RETURNS", title: "Shipping and returns", description: "Clear expectations from checkout to delivery.",
    deliveryTitle: "Delivery in Rwanda", deliveryText: "JashaMart serves all 30 districts across Rwanda. Choose your district at the top of the page or enter it during checkout. Products are offered by independent sellers; in a live marketplace, each seller prepares and ships their own products. The estimated delivery window and final delivery charge would be shown before you place an order.",
    estimateTitle: "Demo shipping estimate", estimateText: "For this storefront demonstration, orders under RWF 150,000 show a sample RWF 12,000 delivery charge. Orders of RWF 150,000 or more show free delivery. No parcels are dispatched by this demo website.",
    returnsTitle: "Returns", returnsText: "Our sample policy allows unused products to be returned within 30 days of delivery. Keep the original packaging and contact customer support with your order reference to begin a return.",
  },
  shop: { eyebrow: "THE JASHAMART MARKETPLACE", description: "Browse products from independent stores, all in one place." },
  stores: { eyebrow: "MEET OUR RETAILERS", title: "Shop local stores", description: "Shop small businesses and makers, each with their own point of view." },
  sell: { eyebrow: "SELL ON JASHAMART", title: "Bring your shop to the marketplace", description: "Tell us a little about your business and the products you make or sell.", heading: "Good shops deserve to be discovered.", text: "JashaMart brings independent sellers and customers together in one easy-to-browse marketplace." },
  journal: { eyebrow: "STORIES, IDEAS & STORE SPOTLIGHTS", title: "The JashaMart journal", description: "Notes from our community of independent sellers and customers." },
};

export function mergeStorefrontConfig(value) {
  const saved = value && typeof value === "object" ? value : {};
  return {
    ...defaultStorefrontConfig,
    ...saved,
    chrome: { ...defaultStorefrontConfig.chrome, ...saved.chrome, nav: Array.isArray(saved.chrome?.nav) ? saved.chrome.nav : defaultStorefrontConfig.chrome.nav },
    home: { ...defaultStorefrontConfig.home, ...saved.home, sections: Object.fromEntries(Object.entries(defaultStorefrontConfig.home.sections).map(([key, defaults]) => [key, { ...defaults, ...saved.home?.sections?.[key] }])) },
    contact: { ...defaultStorefrontConfig.contact, ...saved.contact },
    faq: { ...defaultStorefrontConfig.faq, ...saved.faq, questions: Array.isArray(saved.faq?.questions) ? saved.faq.questions : defaultStorefrontConfig.faq.questions },
    shipping: { ...defaultStorefrontConfig.shipping, ...saved.shipping },
    shop: { ...defaultStorefrontConfig.shop, ...saved.shop },
    stores: { ...defaultStorefrontConfig.stores, ...saved.stores },
    sell: { ...defaultStorefrontConfig.sell, ...saved.sell },
    journal: { ...defaultStorefrontConfig.journal, ...saved.journal },
  };
}
