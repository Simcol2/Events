import React from "react";
import { createRoot } from "react-dom/client";
import RentalBooking from "../rental-kit-booking-v5.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RentalBooking />
  </React.StrictMode>
);
