import React, { createContext, useContext, useState } from "react";
import { buildPalette, DEFAULT_COLOR_KEY } from "./pageColors";
import { bodyFont, displayFont, scriptFont, ensureFonts } from "./theme";

const PaletteContext = createContext(null);

export function PaletteProvider({ children }) {
  ensureFonts();
  // Colors are driven by the current page/route (see pageColors.js and
  // App.jsx's route-to-color sync), not stored as a user preference - so
  // there's nothing to persist across visits, only to recompute on
  // navigation.
  const [colorKey, setColorKey] = useState(DEFAULT_COLOR_KEY);
  const palette = buildPalette(colorKey);

  return (
    <PaletteContext.Provider value={{ palette, colorKey, setColorKey }}>
      {children}
    </PaletteContext.Provider>
  );
}

// Use this in every page/component instead of importing static colors from
// theme.js - this is what makes the page-driven color system actually work.
export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("usePalette() must be called inside a <PaletteProvider>");
  }
  return { ...ctx, fonts: { bodyFont, displayFont, scriptFont } };
}
