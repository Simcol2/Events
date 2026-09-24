import React, { useEffect, useId, useRef, useState } from "react";

const SCRIPT_ID = "square-web-payments-sdk";
const SQUARE_SCRIPT = "https://web.squarecdn.com/v1/square.js";

function loadSquare() {
  if (window.Square) return Promise.resolve(window.Square);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Square), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load secure card entry.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SQUARE_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.Square);
    script.onerror = () => reject(new Error("Could not load secure card entry."));
    document.head.appendChild(script);
  });
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return { givenName: parts[0] || "", familyName: parts.slice(1).join(" ") };
}

// Mounts the Square card field once and reads the latest amount/contact
// details from refs at tokenize time, so typing a name or email elsewhere in
// the form never tears down and remounts the card iframe.
export default function SquareCardPayment({
  amountCents, name, email, phone, saveCard, onReady,
}) {
  // The portal can render two of these at once (balance + security deposit),
  // so each needs its own container id. useId's colons are not valid in a
  // CSS selector, which is what Square's attach() takes.
  const containerId = `square-card-${useId().replace(/:/g, "")}`;
  const cardRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const latestRef = useRef({ amountCents, name, email, phone, saveCard });
  const [error, setError] = useState("");

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => {
    latestRef.current = { amountCents, name, email, phone, saveCard };
  }, [amountCents, name, email, phone, saveCard]);

  useEffect(() => {
    let cancelled = false;
    let card;

    async function setup() {
      try {
        setError("");
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
        if (!appId || !locationId) throw new Error("Secure checkout is not configured yet. Please contact us.");

        const Square = await loadSquare();
        if (cancelled) return;

        const payments = Square.payments(appId, locationId);
        card = await payments.card();
        await card.attach(`#${containerId}`);

        if (cancelled) {
          try { card.destroy(); } catch {}
          return;
        }

        cardRef.current = card;
        onReadyRef.current?.(async () => {
          const current = latestRef.current;
          const { givenName, familyName } = splitName(current.name);

          const result = await cardRef.current.tokenize({
            amount: (Number(current.amountCents || 0) / 100).toFixed(2),
            currencyCode: "CAD",
            intent: current.saveCard ? "CHARGE_AND_STORE" : "CHARGE",
            customerInitiated: true,
            sellerKeyedIn: false,
            billingContact: {
              givenName,
              familyName,
              email: current.email || undefined,
              phone: current.phone || undefined,
              countryCode: "CA",
            },
          });

          if (result.status !== "OK" || !result.token) {
            throw new Error(
              result.errors?.map((e) => e.message).filter(Boolean).join(" ") ||
              "Card details could not be verified."
            );
          }
          return result.token;
        });
      } catch (err) {
        setError(err.message || "Could not load secure card entry.");
        onReadyRef.current?.(null);
      }
    }

    setup();
    return () => {
      cancelled = true;
      onReadyRef.current?.(null);
      try { card?.destroy?.(); } catch {}
      cardRef.current = null;
    };
  }, [containerId]);

  return (
    <div>
      <div id={containerId} className="min-h-[90px]" />
      {error && <p className="mt-2 font-[Space_Grotesk] text-xs text-red-700">{error}</p>}
      <p className="mt-2 font-[Space_Grotesk] text-xs leading-5 text-[#7E7767]">
        Card details are entered securely and are never stored on A Slice of G servers.
      </p>
    </div>
  );
}
