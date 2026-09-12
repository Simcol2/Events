import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "asliceofg-cart-items-v2";
const DATES_KEY = "asliceofg-rental-dates-v1";

const CartContext = createContext(null);

function stableMetaKey(meta) {
  if (!meta) return "";
  return JSON.stringify(meta, Object.keys(meta).sort());
}

function lineKey(line) {
  return `${line.kind}:${line.id}:${stableMetaKey(line.meta)}`;
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

  const [rentalDates, setRentalDatesState] = useState(() => {
    if (typeof window === "undefined") return { pickup: "", event: "", dropoff: "" };
    try {
      const raw = window.localStorage.getItem(DATES_KEY);
      return raw ? JSON.parse(raw) : { pickup: "", event: "", dropoff: "" };
    } catch {
      return { pickup: "", event: "", dropoff: "" };
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DATES_KEY, JSON.stringify(rentalDates));
  }, [rentalDates]);

  const addToCart = (id, kind, meta = null, quantity = 1) => {
    const incoming = { id, kind, meta, quantity: Math.max(1, Number(quantity) || 1) };
    const key = lineKey(incoming);
    setItems((prev) => {
      const existing = prev.find((item) => lineKey(item) === key);
      if (!existing) return [...prev, incoming];
      return prev.map((item) =>
        lineKey(item) === key ? { ...item, quantity: item.quantity + incoming.quantity } : item
      );
    });
  };

  const addRental = (id, meta = null, quantity = 1) => addToCart(id, "rental", meta, quantity);

  const removeFromCart = (id, kind, meta = null) => {
    const key = lineKey({ id, kind, meta });
    setItems((prev) => prev.filter((item) => lineKey(item) !== key));
  };

  const setQuantity = (id, kind, quantity, meta = null) => {
    const nextQuantity = Math.floor(Number(quantity) || 0);
    if (nextQuantity <= 0) {
      removeFromCart(id, kind, meta);
      return;
    }
    const key = lineKey({ id, kind, meta });
    setItems((prev) =>
      prev.map((item) => (lineKey(item) === key ? { ...item, quantity: nextQuantity } : item))
    );
  };

  const isInCart = (id, kind, meta = null) => {
    const key = lineKey({ id, kind, meta });
    return items.some((item) => lineKey(item) === key);
  };

  const setRentalDates = (dates) => {
    setRentalDatesState({
      pickup: dates?.pickup || "",
      event: dates?.event || "",
      dropoff: dates?.dropoff || "",
    });
  };

  const purchaseItems = useMemo(() => items.filter((item) => item.kind !== "rental"), [items]);
  const rentalItems = useMemo(() => items.filter((item) => item.kind === "rental"), [items]);
  const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const clearCart = () => {
    setItems([]);
    setRentalDatesState({ pickup: "", event: "", dropoff: "" });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        purchaseItems,
        rentalItems,
        rentalDates,
        setRentalDates,
        addToCart,
        addRental,
        removeFromCart,
        setQuantity,
        isInCart,
        cartCount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() must be called inside a <CartProvider>");
  return ctx;
}
