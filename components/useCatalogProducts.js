"use client";

import { useEffect, useState } from "react";
import { products as seedProducts } from "../lib/catalog";
import { ADMIN_PRODUCTS_KEY, readStored } from "../lib/admin-data";

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState(seedProducts);

  useEffect(() => {
    function refresh() {
      const saved = readStored(ADMIN_PRODUCTS_KEY, seedProducts);
      setCatalogProducts(Array.isArray(saved) ? saved : seedProducts);
    }
    function onStorage(event) {
      if (event.key === ADMIN_PRODUCTS_KEY || event.key === null) refresh();
    }
    function onLocalUpdate(event) {
      if (event.detail === ADMIN_PRODUCTS_KEY) refresh();
    }

    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("openshop:storage-updated", onLocalUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("openshop:storage-updated", onLocalUpdate);
    };
  }, []);

  return catalogProducts;
}
