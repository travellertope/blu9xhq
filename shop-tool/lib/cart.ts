"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartItem } from "@/types";

/**
 * Client-side cart, scoped per shop slug (so browsing two different
 * BluuShop storefronts in one browser never mixes carts) and persisted in
 * localStorage. No server-side cart/session — nothing here needs a
 * shopper to be signed in.
 */

const CART_EVENT = "bluushop:cart-updated";

function cartKey(shopSlug: string): string {
  return `bluushop_cart_${shopSlug}`;
}

function itemKey(item: Pick<CartItem, "product_id" | "variant">): string {
  return `${item.product_id}::${JSON.stringify(item.variant ?? {})}`;
}

export function getCart(shopSlug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(cartKey(shopSlug));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(shopSlug: string, items: CartItem[]): void {
  window.localStorage.setItem(cartKey(shopSlug), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { shopSlug } }));
}

export function addToCart(shopSlug: string, item: CartItem): CartItem[] {
  const cart = getCart(shopSlug);
  const key = itemKey(item);
  const existingIndex = cart.findIndex((i) => itemKey(i) === key);

  const next =
    existingIndex >= 0
      ? cart.map((i, idx) => (idx === existingIndex ? { ...i, qty: i.qty + item.qty } : i))
      : [...cart, item];

  saveCart(shopSlug, next);
  return next;
}

export function updateCartQty(
  shopSlug: string,
  item: Pick<CartItem, "product_id" | "variant">,
  qty: number
): CartItem[] {
  const key = itemKey(item);
  const cart = getCart(shopSlug);
  const next =
    qty <= 0
      ? cart.filter((i) => itemKey(i) !== key)
      : cart.map((i) => (itemKey(i) === key ? { ...i, qty } : i));

  saveCart(shopSlug, next);
  return next;
}

export function clearCart(shopSlug: string): void {
  saveCart(shopSlug, []);
}

/** React hook — re-renders when this shop's cart changes, including from other components in the same tab. */
export function useCart(shopSlug: string) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const refresh = useCallback(() => {
    setCart(getCart(shopSlug));
  }, [shopSlug]);

  useEffect(() => {
    refresh();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ shopSlug: string }>).detail;
      if (!detail || detail.shopSlug === shopSlug) refresh();
    };
    window.addEventListener(CART_EVENT, handler);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_EVENT, handler);
      window.removeEventListener("storage", refresh);
    };
  }, [shopSlug, refresh]);

  return {
    cart,
    add: (item: CartItem) => setCart(addToCart(shopSlug, item)),
    updateQty: (item: Pick<CartItem, "product_id" | "variant">, qty: number) =>
      setCart(updateCartQty(shopSlug, item, qty)),
    clear: () => {
      clearCart(shopSlug);
      setCart([]);
    },
  };
}
