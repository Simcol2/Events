import React, { useMemo, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../CartContext";
import { GROWN_FOLKS_LOOT_BAGS } from "../cateringContent";

// Display-only price/name resolution, mirroring api/create-checkout-session.js's
// server-side lookup (the actual charge is always computed there, from the
// same Supabase data, never from this client-side copy).
function resolveLine(line, { catalog, gifts }) {
  if (line.kind === "catalog") {
    const item = catalog.find((i) => i.id === line.id);
    if (!item) return null;
    return { name: item.name, unitPrice: item.purchase_price, description: null };
  }
  if (line.kind === "dessert") {
    const dessert = GROWN_FOLKS_LOOT_BAGS.find((d) => d.id === line.id);
    if (!dessert) return null;
    return { name: dessert.name, unitPrice: dessert.price, description: null };
  }
  if (line.kind === "gift") {
    const gift = gifts.find((g) => g.id === line.id);
    if (!gift) return null;
    const isCustom = Boolean(line.meta?.custom);
    const description = line.meta?.selection
      ? `Design: ${line.meta.selection}`
      : line.meta?.custom
        ? `Custom request: ${line.meta.custom}`
        : null;
    return { name: gift.name, unitPrice: isCustom ? gift.custom_price ?? gift.price : gift.price, description };
  }
  return null;
}

export default function CartModal({ catalog, gifts, onClose }) {
  const { items, removeFromCart, setQuantity } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const lines = useMemo(
    () =>
      items
        .map((line) => {
          const resolved = resolveLine(line, { catalog, gifts });
          return resolved ? { ...line, ...resolved } : null;
        })
        .filter(Boolean),
    [items, catalog, gifts]
  );

  const total = lines.reduce((sum, l) => sum + (l.unitPrice || 0) * l.quantity, 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ id, kind, meta, quantity }) => ({ id, kind, meta, quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed to start.");
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message || "Checkout failed to start. Please try again.");
      setCheckingOut(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#FAF6ED] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#A69C7E]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Your Cart</h2>

        {lines.length === 0 ? (
          <p className="mt-4 font-[Jost] text-sm text-[#8C846F]">Your cart is empty.</p>
        ) : (
          <>
            <div className="mt-5 space-y-4">
              {lines.map((line) => (
                <div key={`${line.id}-${line.kind}-${JSON.stringify(line.meta)}`} className="flex items-start justify-between gap-3 border-b border-[#E4DCC8] pb-4">
                  <div>
                    <p className="font-[Jost] text-sm font-semibold text-[#4E5A44]">{line.name}</p>
                    {line.description && (
                      <p className="mt-0.5 font-[Jost] text-xs text-[#8C846F]">{line.description}</p>
                    )}
                    <p className="mt-1 font-[Jost] text-xs text-[#B8935A]">${line.unitPrice} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(line.id, line.kind, line.quantity - 1, line.meta)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D8D0BC] text-[#4E5A44]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-[Jost] text-xs text-[#3A342A]">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.id, line.kind, line.quantity + 1, line.meta)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D8D0BC] text-[#4E5A44]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-[Jost] text-sm font-semibold text-[#4E5A44]">
                      ${(line.unitPrice * line.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(line.id, line.kind, line.meta)}
                      className="text-[#A69C7E]"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-[Jost] text-sm font-semibold text-[#4E5A44]">Total</span>
              <span className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#4E5A44]">${total.toFixed(2)}</span>
            </div>

            {checkoutError && <p className="mt-3 font-[Jost] text-xs text-red-700">{checkoutError}</p>}

            <button
              disabled={checkingOut}
              onClick={handleCheckout}
              className="mt-5 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-[11px] font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkingOut ? "REDIRECTING TO CHECKOUT..." : "CHECKOUT WITH STRIPE"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
