import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App.jsx";
import { PaletteProvider } from "../PaletteContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PaletteProvider>
      <App />
    </PaletteProvider>
  </React.StrictMode>
);
