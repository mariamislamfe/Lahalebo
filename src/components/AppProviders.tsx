"use client";

import type { ReactNode } from "react";
import type { Menu } from "@/types/menu";
import type { Branch } from "@/types/branch";
import { CartProvider } from "@/store/cart-context";
import { MenuProvider } from "@/store/menu-context";
import { ProductSheetProvider } from "@/store/product-sheet-context";
import { ToastProvider } from "@/store/toast-context";
import { CartBar } from "@/components/cart/CartBar";
import { CartSheet } from "@/components/cart/CartSheet";
import { SmoothScroll } from "@/components/SmoothScroll";

export function AppProviders({ menu, branches, children }: { menu: Menu; branches: Branch[]; children: ReactNode }) {
  return (
    <MenuProvider menu={menu} branches={branches}>
      <ToastProvider>
        <CartProvider>
          <ProductSheetProvider>
            <SmoothScroll />
            {children}
            <CartBar />
            <CartSheet />
          </ProductSheetProvider>
        </CartProvider>
      </ToastProvider>
    </MenuProvider>
  );
}
