"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { lineKey, priceLine, sumLines, type LineInput, type PricedLine } from "@/lib/pricing";
import { useMenu } from "./menu-context";

/**
 * Cart holds only ids + quantities. Prices are always derived from the
 * current menu, so a stale localStorage cart can never show a stale price.
 */

export interface CartLine extends LineInput {
  key: string;
}

export type CartView = "cart" | "checkout" | "done";

interface State {
  lines: CartLine[];
  open: boolean;
  view: CartView;
  hydrated: boolean;
  added: { tick: number; name: string | null; productId: string | null };
}

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: LineInput; name: string | null }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "removeProducts"; productIds: string[] }
  | { type: "clear" }
  | { type: "open"; view?: CartView }
  | { type: "close" }
  | { type: "view"; view: CartView };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, lines: action.lines, hydrated: true };
    case "add": {
      const key = lineKey(action.line);
      const existing = state.lines.find((l) => l.key === key);
      const lines = existing
        ? state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(50, l.qty + action.line.qty) } : l))
        : [...state.lines, { ...action.line, key }];
      return { ...state, lines, added: { tick: state.added.tick + 1, name: action.name, productId: action.line.productId } };
    }
    case "setQty":
      return {
        ...state,
        lines:
          action.qty <= 0
            ? state.lines.filter((l) => l.key !== action.key)
            : state.lines.map((l) => (l.key === action.key ? { ...l, qty: Math.min(50, action.qty) } : l)),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case "removeProducts":
      return { ...state, lines: state.lines.filter((l) => !action.productIds.includes(l.productId)) };
    case "clear":
      return { ...state, lines: [] };
    case "open":
      return { ...state, open: true, view: action.view ?? (state.view === "done" ? "cart" : state.view) };
    case "close":
      return { ...state, open: false, view: state.view === "done" ? "cart" : state.view };
    case "view":
      return { ...state, view: action.view };
  }
}

const STORAGE_KEY = "lahalebo.cart.v2";

interface CartContextValue {
  lines: (PricedLine & { key: string })[];
  /** Lines whose product/option no longer exists or is unavailable. */
  invalidLines: CartLine[];
  count: number;
  /** Sum of priced lines; `complete` is false while some prices are unknown. */
  subtotal: { total: number; complete: boolean };
  open: boolean;
  view: CartView;
  hydrated: boolean;
  /** Increments on every add — drives feedback animations. */
  addTick: number;
  lastAdded: string | null;
  /** Product id of the last add — drives the cart peek. */
  lastAddedId: string | null;
  add: (line: LineInput) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  removeProducts: (productIds: string[]) => void;
  clear: () => void;
  openCart: (view?: CartView) => void;
  closeCart: () => void;
  setView: (view: CartView) => void;
  /** Total quantity of a product across all its configurations. */
  qtyOf: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { index } = useMenu();
  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    open: false,
    view: "cart",
    hydrated: false,
    added: { tick: 0, name: null, productId: null },
  });

  useEffect(() => {
    let lines: CartLine[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LineInput[];
        if (Array.isArray(parsed)) {
          lines = parsed
            .filter((l) => typeof l?.productId === "string" && Number.isInteger(l.qty) && l.qty > 0)
            .map((l) => {
              const clean = {
                ...l,
                extraIds: Array.isArray(l.extraIds) ? l.extraIds : [],
                choiceIds: Array.isArray(l.choiceIds) ? l.choiceIds : [],
              };
              return { ...clean, key: lineKey(clean) };
            });
        }
      }
    } catch {
      /* storage unavailable or corrupt — start empty */
    }
    dispatch({ type: "hydrate", lines });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const plain: LineInput[] = state.lines.map(({ productId, optionId, extraIds, choiceIds, qty }) => ({
        productId,
        optionId,
        extraIds,
        choiceIds,
        qty,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
    } catch {
      /* private mode — cart still works in memory */
    }
  }, [state.lines, state.hydrated]);

  const priced = useMemo(() => {
    const valid: (PricedLine & { key: string })[] = [];
    const invalid: CartLine[] = [];
    for (const l of state.lines) {
      const r = priceLine(index, l);
      if (r.ok) valid.push({ ...r.line, key: l.key });
      else invalid.push(l);
    }
    return { valid, invalid };
  }, [state.lines, index]);

  const add = useCallback(
    (line: LineInput) => dispatch({ type: "add", line, name: index.get(line.productId)?.name ?? null }),
    [index],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: priced.valid,
      invalidLines: priced.invalid,
      count: priced.valid.reduce((n, l) => n + l.qty, 0),
      subtotal: sumLines(priced.valid),
      open: state.open,
      view: state.view,
      hydrated: state.hydrated,
      addTick: state.added.tick,
      lastAdded: state.added.name,
      lastAddedId: state.added.productId,
      add,
      setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
      remove: (key) => dispatch({ type: "remove", key }),
      removeProducts: (productIds) => dispatch({ type: "removeProducts", productIds }),
      clear: () => dispatch({ type: "clear" }),
      openCart: (view) => dispatch({ type: "open", view }),
      closeCart: () => dispatch({ type: "close" }),
      setView: (view) => dispatch({ type: "view", view }),
      qtyOf: (productId) => state.lines.reduce((n, l) => (l.productId === productId ? n + l.qty : n), 0),
    }),
    [priced, state.open, state.view, state.hydrated, state.lines, state.added, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
