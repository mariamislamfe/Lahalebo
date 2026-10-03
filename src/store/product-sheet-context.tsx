"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ProductSheet } from "@/components/menu/ProductSheet";
import { useMenu } from "./menu-context";

/** One product sheet for the whole page, opened by id from anywhere. */
const ProductSheetContext = createContext<(productId: string) => void>(() => {});

export function ProductSheetProvider({ children }: { children: ReactNode }) {
  const { index } = useMenu();
  const [productId, setProductId] = useState<string | null>(null);
  const openProduct = useCallback((id: string) => setProductId(id), []);
  const close = useCallback(() => setProductId(null), []);
  const product = useMemo(() => (productId ? index.get(productId) ?? null : null), [productId, index]);

  return (
    <ProductSheetContext.Provider value={openProduct}>
      {children}
      <ProductSheet product={product} onClose={close} />
    </ProductSheetContext.Provider>
  );
}

export function useOpenProduct() {
  return useContext(ProductSheetContext);
}
