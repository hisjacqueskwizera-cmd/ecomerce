export const coupons = [
  { code: "KARIBU10", type: "percent", value: 10, minimum: 50000, maximum: 30000, description: "10% off your order over RWF 50,000" },
  { code: "OPEN5000", type: "fixed", value: 5000, minimum: 30000, description: "RWF 5,000 off orders over RWF 30,000" },
  { code: "FREESHIP", type: "free-shipping", value: 0, minimum: 50000, description: "Free standard delivery over RWF 50,000" },
  { code: "QUINCA10", type: "percent", value: 10, minimum: 100000, maximum: 25000, categories: ["Quincaillerie & Construction"], description: "10% off quincaillerie orders over RWF 100,000" },
  { code: "ISOKO5", type: "percent", value: 5, minimum: 15000, maximum: 5000, categories: ["Food & Groceries"], description: "5% off groceries over RWF 15,000" },
  { code: "HOME15", type: "percent", value: 15, minimum: 100000, maximum: 25000, categories: ["Furniture", "Home Appliances", "Home & Decor", "Home", "Decor"], description: "15% off home goods over RWF 100,000" }
];

export function couponFromRow(row) { return { code: row.code, type: row.discount_type, value: Number(row.discount_value), minimum: Number(row.minimum || 0), maximum: row.maximum == null ? undefined : Number(row.maximum), description: row.description, categories: row.categories || [], expiresAt: row.expires_at || "", active: row.active }; }

export function calculateCoupon(code, items = [], shipping = 0, availableCoupons = []) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { valid: false, discount: 0, shippingDiscount: 0, message: "Enter a coupon code to apply a discount." };
  const coupon = availableCoupons.find(item => item.code === normalized);
  if (!coupon) return { valid: false, discount: 0, shippingDiscount: 0, message: "That coupon code is not recognized." };
  if (coupon.active === false) return { valid: false, discount: 0, shippingDiscount: 0, coupon, message: "This coupon is no longer active." };
  if (coupon.expiresAt && new Date(coupon.expiresAt).setHours(23,59,59,999) < Date.now()) return { valid: false, discount: 0, shippingDiscount: 0, coupon, message: "This coupon has expired." };
  const eligible = coupon.categories?.length ? items.filter(item => coupon.categories.includes(item.category)) : items;
  const eligibleSubtotal = eligible.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  if (coupon.categories?.length && !eligible.length) return { valid: false, discount: 0, shippingDiscount: 0, coupon, message: `Add an eligible ${coupon.categories.join(" or ")} item to use this code.` };
  if (eligibleSubtotal < coupon.minimum) return { valid: false, discount: 0, shippingDiscount: 0, coupon, message: `This code needs at least RWF ${coupon.minimum.toLocaleString("en-RW")} in eligible items.` };
  const discount = coupon.type === "percent"
    ? Math.min(Math.round(eligibleSubtotal * coupon.value / 100), coupon.maximum || eligibleSubtotal)
    : coupon.type === "fixed" ? Math.min(coupon.value, eligibleSubtotal) : 0;
  const shippingDiscount = coupon.type === "free-shipping" ? Number(shipping || 0) : 0;
  if (coupon.type === "free-shipping" && shippingDiscount === 0) return { valid: false, discount: 0, shippingDiscount: 0, coupon, message: "Delivery is already free for this order." };
  return { valid: true, coupon, eligibleSubtotal, discount, shippingDiscount, message: coupon.type === "free-shipping" ? "Free delivery applied." : `Coupon applied · RWF ${discount.toLocaleString("en-RW")} off.` };
}

