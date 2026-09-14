import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  image?: string | null;
  price: number;
  qty: number;
};

type State = {
  items: CartItem[];
  open: boolean;
};

const STORAGE_KEY = "nexio_cart_v1";
const isBrowser = typeof window !== "undefined";

function load(): CartItem[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

let state: State = { items: load(), open: false };
const listeners = new Set<() => void>();

function emit() {
  if (isBrowser) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch { /* ignore */ }
  }
  listeners.forEach((l) => l());
}

function set(updater: (prev: State) => State) {
  state = updater(state);
  emit();
}

export const cart = {
  getState: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  add: (item: Omit<CartItem, "qty">, qty = 1) => {
    set((s) => {
      const existing = s.items.find((i) => i.id === item.id);
      const items = existing
        ? s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i))
        : [...s.items, { ...item, qty }];
      return { ...s, items, open: true };
    });
  },
  remove: (id: string) => set((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })),
  setQty: (id: string, qty: number) =>
    set((s) => ({
      ...s,
      items: s.items
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    })),
  clear: () => set((s) => ({ ...s, items: [] })),
  openDrawer: () => set((s) => ({ ...s, open: true })),
  closeDrawer: () => set((s) => ({ ...s, open: false })),
};

const emptySnap: State = { items: [], open: false };

export function useCart() {
  return useSyncExternalStore(cart.subscribe, () => state, () => emptySnap);
}

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.qty, 0);

export const formatBDT = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");
