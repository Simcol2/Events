import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "asliceofg-cart-items";

const CartContext = createContext(null);

// Standalone purchase cart for the Gifts page - separate from
// PackageContext on purpose, since gifts are bought outright and aren't
// part of an event package. `kind` distinguishes a real catalog item
// (Supabase items, priced by purchase_price) from a static dessert gift
// (Grown Folks Loot Bags, priced in cateringContent.js), since the two
// come from different data sources.
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

  const addToCart = (id, kind) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id && i.kind === kind);
      if (existing) {
        return prev.map((i) => (i.id === id && i.kind === kind ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id, kind, quantity: 1 }];
    });
  };

  const removeFromCart = (id, kind) => setItems((prev) => prev.filter((i) => !(i.id === id && i.kind === kind)));

  const setQuantity = (id, kind, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, kind);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id && i.kind === kind ? { ...i, quantity } : i)));
  };

  const isInCart = (id, kind) => items.some((i) => i.id === id && i.kind === kind);
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
