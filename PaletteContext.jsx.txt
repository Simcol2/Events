import React, { createContext, useContext, useState, useEffect } from "react";
import { PALETTES, DEFAULT_PALETTE_ID } from "./palettes";
import { bodyFont, displayFont, scriptFont, ensureFonts } from "./theme";

const STORAGE_KEY = "asliceofg-palette-id";

const PaletteContext = createContext(null);

export function PaletteProvider({ children }) {
  ensureFonts();
  const [paletteId, setPaletteId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PALETTE_ID;
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_PALETTE_ID;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, paletteId);
    }
  }, [paletteId]);

  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[0];

  return (
    <PaletteContext.Provider value={{ palette, paletteId, setPaletteId, palettes: PALETTES }}>
      {children}
    </PaletteContext.Provider>
  );
}

// Use this in every page/component instead of importing static colors from
// theme.js — this is what makes the toggle actually repaint the whole site.
export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("usePalette() must be called inside a <PaletteProvider>");
  }
  return { ...ctx, fonts: { bodyFont, displayFont, scriptFont } };
}
