export const ADMIN_PRODUCTS_KEY = "openshop-admin-products-rwf-v1";
export const ADMIN_ORDERS_KEY = "openshop-demo-orders-rwf-v2";
export const ADMIN_BANNERS_KEY = "openshop-storefront-banners-v1";
export const SELLER_APPLICATIONS_KEY = "openshop-seller-applications-v1";

export function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (value === null) return fallback;
    if (key === ADMIN_PRODUCTS_KEY && Array.isArray(value) && Array.isArray(fallback)) {
      const seeds = new Map(fallback.map(product => [product.id, product]));
      return value.map(product => {
        const seed = seeds.get(product.id);
        if (!seed?.photo || product.photo?.startsWith("data:image/")) return product;
        return { ...seed, ...product, photo: seed.photo };
      });
    }
    return value;
  } catch { return fallback; }
}

export function saveStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("openshop:storage-updated", { detail: key }));
}
