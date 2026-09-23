import React, { useEffect, useRef, useState } from "react";

const SCRIPT_ID = "square-web-payments-sdk";
const SQUARE_SCRIPT = "https://web.squarecdn.com/v1/square.js";

function loadSquare() {
  if (window.Square) return Promise.resolve(window.Square);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      existing.addEventListener("load", () => resolve(window.Square), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Could not load Square.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SQUARE_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.Square);
    script.onerror = () => reject(new Error("Could not load Square."));
    document.head.appendChild(script);
  });
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

  return {
    givenName: parts[0] || "",
    familyName: parts.slice(1).join(" "),
  };
}

export default function SquareCardPayment({
  amountCents,
  name,
  email,
  phone,
  saveCard,
  onReady,
}) {
  const cardRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let card;

    async function setup() {
      try {
        setError("");

        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          throw new Error("Square checkout is not configured.");
        }

        const Square = await loadSquare();
        if (cancelled) return;

        const payments = Square.payments(appId, locationId);
        card = await payments.card();
        await card.attach("#square-card-container");

        cardRef.current = card;

        onReady?.(async () => {
          const { givenName, familyName } = splitName(name);

          const verificationDetails = {
            amount: (Number(amountCents || 0) / 100).toFixed(2),
            currencyCode: "CAD",
            intent: saveCard ? "CHARGE_AND_STORE" : "CHARGE",
            customerInitiated: true,
            sellerKeyedIn: false,
            billingContact: {
              givenName,
              familyName,
              email: email || undefined,
              phone: phone || undefined,
              countryCode: "CA",
            },
          };

          const result = await cardRef.current.tokenize(verificationDetails);

          if (result.status !== "OK" || !result.token) {
            const message =
              result.errors?.map((item) => item.message).filter(Boolean).join(" ") ||
              "Card details could not be verified.";

            throw new Error(message);
          }

          return result.token;
        });
      } catch (err) {
        setError(err.message || "Could not load secure card entry.");
      }
    }

    setup();

    return () => {
      cancelled = true;

      try {
        card?.destroy?.();
      } catch {}

      cardRef.current = null;
    };
  }, [amountCents, name, email, phone, saveCard, onReady]);

  return (
    <div>
      <div id="square-card-container" className="min-h-[90px]" />

      {error ? (
        <p className="mt-2 font-[Space_Grotesk] text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <p className="mt-2 font-[Space_Grotesk] text-xs leading-5 text-[#7E7767]">
        Card details are entered securely through Square and are never stored on A Slice of G servers.
      </p>
    </div>
  );
}
