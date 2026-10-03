"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Category, Menu, Product } from "@/types/menu";
import type { Branch } from "@/types/branch";
import { indexMenu, type MenuIndex } from "@/lib/pricing";

interface MenuContextValue {
  menu: Menu;
  index: MenuIndex;
  categoryById: Map<string, Category>;
  productsByCategory: Map<string, Product[]>;
  branches: Branch[];
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ menu, branches, children }: { menu: Menu; branches: Branch[]; children: ReactNode }) {
  const value = useMemo<MenuContextValue>(() => {
    const productsByCategory = new Map<string, Product[]>();
    for (const p of menu.products) {
      const list = productsByCategory.get(p.categoryId) ?? [];
      list.push(p);
      productsByCategory.set(p.categoryId, list);
    }
    return {
      menu,
      index: indexMenu(menu),
      categoryById: new Map(menu.categories.map((c) => [c.id, c])),
      productsByCategory,
      branches,
    };
  }, [menu, branches]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}
