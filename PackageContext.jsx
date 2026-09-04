import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "asliceofg-package-items";

const PackageContext = createContext(null);

// Decor items a visitor has added to their in-progress package, carried
// from the Decor page into the Package Builder. Each entry remembers
// whether it was added to rent or to buy, since the price differs and an
// item can support both.
export function PackageProvider({ children }) {
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

  const addToPackage = (itemId, requestType) => {
    setItems((prev) => {
      const withoutExisting = prev.filter((i) => i.itemId !== itemId);
      return [...withoutExisting, { itemId, requestType }];
    });
  };

  const removeFromPackage = (itemId) => setItems((prev) => prev.filter((i) => i.itemId !== itemId));

  const isInPackage = (itemId) => items.some((i) => i.itemId === itemId);

  return (
    <PackageContext.Provider value={{ items, addToPackage, removeFromPackage, isInPackage }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const ctx = useContext(PackageContext);
  if (!ctx) {
    throw new Error("usePackage() must be called inside a <PackageProvider>");
  }
  return ctx;
}
