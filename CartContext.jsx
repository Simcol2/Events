import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "asliceofg-cart-items";

const CartContext = createContext(null);

// Standalone purchase cart for the Gifts page - separate from
// PackageContext on purpose, since gifts are bought outright and aren't
// part of an event package. `kind` distinguishes a real catalog item
// (Supabase items, priced by purchase_price) from a static dessert gift
// (Grown Folks Loot Bags, priced in cateringContent.js) from a customizable
// gift (public.gifts, priced by price/custom_price), since each comes from
// a different data source.
//
// `meta`, when passed, carries a customization (e.g. a Pop Up Nostalgia
// Cards design choice or custom request) - two lines with the same id/kind
// but different meta are genuinely different picks and stay separate cart
// lines rather than merging quantity, matched by a stable JSON key so key
// order in the meta object never causes a false mismatch.
function metaKey(meta) {
  if (!meta) return "";
  return JSON.stringify(meta, Object.keys(meta).sort());
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (id, kind, meta = null) => {
    const key = metaKey(meta);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id && i.kind === kind && metaKey(i.meta) === key);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id, kind, meta, quantity: 1 }];
    });
  };

  const removeFromCart = (id, kind, meta = null) => {
    const key = metaKey(meta);
    setItems((prev) => prev.filter((i) => !(i.id === id && i.kind === kind && metaKey(i.meta) === key)));
  };

  const setQuantity = (id, kind, quantity, meta = null) => {
    if (quantity <= 0) {
      removeFromCart(id, kind, meta);
      return;
    }
    const key = metaKey(meta);
    setItems((prev) => prev.map((i) => (i.id === id && i.kind === kind && metaKey(i.meta) === key ? { ...i, quantity } : i)));
  };

  const isInCart = (id, kind, meta = null) => {
    const key = metaKey(meta);
    return items.some((i) => i.id === id && i.kind === kind && metaKey(i.meta) === key);
  };
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, setQuantity, isInCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart() must be called inside a <CartProvider>");
  }
  return ctx;
}
