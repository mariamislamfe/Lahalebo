import "server-only";
import { menuData } from "@/data/menu";
import { branches } from "@/data/branches";
import type { Menu } from "@/types/menu";
import type { Branch } from "@/types/branch";

/**
 * Data access layer. UI never imports from /data directly.
 * To connect a backend, replace these bodies with API/Prisma calls —
 * the return types are the contract.
 */

export async function getMenu(): Promise<Menu> {
  // e.g. return fetch(`${process.env.API_URL}/menu`, { next: { revalidate: 60 } }).then(r => r.json())
  const categories = menuData.categories
    .filter((c) => c.available)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const visible = new Set(categories.map((c) => c.id));
  const products = menuData.products.filter((p) => visible.has(p.categoryId));
  return { categories, products };
}

export async function getBranches(): Promise<Branch[]> {
  return branches;
}
