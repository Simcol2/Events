import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../CartContext";
import { supabase } from "../supabaseClient";

const MIN_RENTAL_CENTS = 5000;

function money(cents) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format((Number(cents) || 0) / 100);
}

function dateOkay(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

export default function UnifiedCartModal({ catalog = [], gifts = [], onClose }) {
  const {
    items,
    purchaseItems,
    rentalItems,
    rentalDates,
    setRentalDates,
    removeFromCart,
    setQuantity,
  } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState([]);
  const [checking, setChecking] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const catalogMap = useMemo(() => new Map(catalog.map((item) => [String(item.id), item])), [catalog]);
  const giftMap = useMemo(() => new Map(gifts.map((item) => [String(item.id), item])), [gifts]);

  const resolved = useMemo(() => {
    return items.map((line) => {
      if (line.kind === "rental") {
        const item = catalogMap.get(String(line.id));
        return item
          ? {
              ...line,
              name: item.name,
              unitCents: Math.round(Number(item.rental_price || 0) * 100),
              mode: "rental",
            }
          : null;
      }

      if (line.kind === "catalog") {
        const item = catalogMap.get(String(line.id));
        return item
          ? {
              ...line,
              name: item.name,
              unitCents: Math.round(Number(item.purchase_price || 0) * 100),
              mode: "purchase",
            }
          : null;
      }

      if (line.kind === "gift") {
        const item = giftMap.get(String(line.id));
        const custom = Boolean(line.meta?.custom);
        const price = custom ? item?.custom_price ?? item?.price : item?.price;
        return item
          ? {
              ...line,
              name: item.name,
              unitCents: Math.round(Number(price || 0) * 100),
              mode: "purchase",
            }
          : null;
      }

      return {
        ...line,
        name: line.meta?.name || "Purchase item",
        unitCents: Math.round(Number(line.meta?.unitPrice || 0) * 100),
        mode: "purchase",
      };
    }).filter(Boolean);
  }, [items, catalogMap, giftMap]);

  const rentalSubtotalCents = resolved
    .filter((line) => line.mode === "rental")
    .reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

  const purchaseSubtotalCents = resolved
    .filter((line) => line.mode === "purchase")
    .reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

  const rentalMinimumMet = rentalItems.length === 0 || rentalSubtotalCents >= MIN_RENTAL_CENTS;
  const rentalDatesReady =
    rentalItems.length === 0 ||
    (dateOkay(rentalDates.pickup) &&
      dateOkay(rentalDates.dropoff) &&
      rentalDates.dropoff >= rentalDates.pickup);

  useEffect(() => {
    let cancelled = false;

    async function checkAll() {
      if (!rentalItems.length || !rentalDatesReady || !supabase) {
        setAvailability([]);
        return;
      }

      setChecking(true);
      const rows = [];

      for (const line of rentalItems) {
        const { data, error } = await supabase.rpc("get_reservation_item_availability", {
          p_item_id: Number(line.id),
          p_pickup: rentalDates.pickup,
          p_dropoff: rentalDates.dropoff,
        });

        if (cancelled) return;

        rows.push({
          id: line.id,
          requested: Number(line.quantity || 1),
          available: error ? null : Number(data || 0),
          error: error?.message || "",
        });
      }

      if (!cancelled) {
        setAvailability(rows);
        setChecking(false);
      }
    }

    checkAll();
    return () => {
      cancelled = true;
    };
  }, [rentalItems, rentalDates.pickup, rentalDates.dropoff, rentalDatesReady]);

  const availabilityById = new Map(availability.map((row) => [String(row.id), row]));
  const allAvailable =
    rentalItems.length === 0 ||
    (availability.length === rentalItems.length &&
      availability.every((row) => row.available != null && row.available >= row.requested));

  const canCheckout =
    items.length > 0 &&
    rentalMinimumMet &&
    rentalDatesReady &&
    allAvailable &&
    name.trim() &&
    email.trim() &&
    !checking &&
    !checkingOut;

  async function startCheckout() {
    setCheckoutError("");
    setCheckingOut(true);
    try {
      const res = await fetch("/api/create-unified-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
          },
          rentalDates,
          items: items.map(({ id, kind, meta, quantity }) => ({ id, kind, meta, quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }

      if (data.bookingNumber) {
        window.sessionStorage.setItem("asliceofg-pending-booking-number", data.bookingNumber);
      }
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message || "Could not start checkout.");
      setCheckingOut(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-8"
      style={{ background: "rgba(20,18,12,.76)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Your order"
    >
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#FCFBF7] p-5 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#5A5F54]"
          aria-label="Close cart"
        >
          <X size={19} />
        </button>

        <div className="pr-12">
          <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-[#8A6A1E]">YOUR ORDER</p>
          <h2 className="mt-1 font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">
            Purchases and rentals, together.
          </h2>
        </div>

        {!items.length ? (
          <div className="py-16 text-center">
            <ShoppingBag className="mx-auto text-[#8C846F]" size={26} />
            <p className="mt-3 font-[Space_Grotesk] text-base text-[#8C846F]">Your cart is empty.</p>
          </div>
        ) : (
          <>
            {rentalItems.length > 0 && (
              <section className="mt-7 rounded-xl border border-[#E6DDC7] bg-white p-5">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#8A6A1E]" />
                  <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Rental dates</h3>
                </div>
                <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#7B7464]">
                  These dates apply to every rental item in this order. Availability is checked for the whole cart.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
                    PICKUP
                    <input
                      type="date"
                      value={rentalDates.pickup}
                      onChange={(e) => setRentalDates({ ...rentalDates, pickup: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
                    />
                  </label>
                  <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
                    EVENT
                    <input
                      type="date"
                      value={rentalDates.event}
                      onChange={(e) => setRentalDates({ ...rentalDates, event: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
                    />
                  </label>
                  <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
                    RETURN
                    <input
                      type="date"
                      value={rentalDates.dropoff}
                      onChange={(e) => setRentalDates({ ...rentalDates, dropoff: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
                    />
                  </label>
                </div>
              </section>
            )}

            <div className="mt-6 space-y-3">
              {resolved.map((line) => {
                const av = line.kind === "rental" ? availabilityById.get(String(line.id)) : null;
                return (
                  <div
                    key={`${line.kind}-${line.id}-${JSON.stringify(line.meta || {})}`}
                    className="flex gap-4 rounded-xl border border-[#EAE3D3] bg-white p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 font-[Space_Grotesk] text-[10px] font-bold tracking-[0.12em] ${
                            line.mode === "rental"
                              ? "bg-[#E8F1EC] text-[#0B4933]"
                              : "bg-[#F6EBD0] text-[#7A5914]"
                          }`}
                        >
                          {line.mode === "rental" ? "RENTAL" : "PURCHASE"}
                        </span>
                        <h4 className="truncate font-[Space_Grotesk] text-sm font-semibold text-[#12201A]">
                          {line.name}
                        </h4>
                      </div>
                      <p className="mt-2 font-[Space_Grotesk] text-sm text-[#8A6A1E]">
                        {money(line.unitCents)} each
                      </p>
                      {line.mode === "rental" && rentalDatesReady && (
                        <p className="mt-1 font-[Space_Grotesk] text-xs text-[#7B7464]">
                          {checking
                            ? "Checking availability..."
                            : av?.available == null
                              ? "Availability could not be checked."
                              : av.available >= line.quantity
                                ? `${av.available} available for your dates`
                                : `Only ${av.available} available for your dates`}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-3">
                      <button
                        onClick={() => removeFromCart(line.id, line.kind, line.meta)}
                        className="text-[#8C846F]"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(line.id, line.kind, line.quantity - 1, line.meta)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D8D0BC]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-6 text-center font-[Space_Grotesk] text-sm">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.id, line.kind, line.quantity + 1, line.meta)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D8D0BC]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <strong className="font-[Space_Grotesk] text-sm text-[#0B4933]">
                        {money(line.unitCents * line.quantity)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F4EFE3] p-5">
                <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.14em] text-[#8A6A1E]">
                  PURCHASES
                </p>
                <p className="mt-2 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                  {money(purchaseSubtotalCents)}
                </p>
              </div>
              <div className="rounded-xl bg-[#EAF2ED] p-5">
                <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.14em] text-[#0B4933]">
                  RENTALS
                </p>
                <p className="mt-2 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                  {money(rentalSubtotalCents)}
                </p>
                {rentalItems.length > 0 && (
                  <p className={`mt-1 font-[Space_Grotesk] text-xs ${rentalMinimumMet ? "text-[#47705D]" : "text-red-700"}`}>
                    {rentalMinimumMet
                      ? "$50 rental minimum reached."
                      : `${money(MIN_RENTAL_CENTS - rentalSubtotalCents)} more in rentals needed to checkout.`}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-[#E6DDC7] bg-white p-5">
              <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Your details</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Space_Grotesk] text-sm"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Space_Grotesk] text-sm"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Space_Grotesk] text-sm sm:col-span-2"
                />
              </div>
            </section>

            {!rentalDatesReady && rentalItems.length > 0 && (
              <p className="mt-4 font-[Space_Grotesk] text-sm text-red-700">
                Choose a valid pickup and return date before checkout.
              </p>
            )}
            {!allAvailable && rentalItems.length > 0 && !checking && (
              <p className="mt-4 font-[Space_Grotesk] text-sm text-red-700">
                One or more rental quantities are not available for these dates.
              </p>
            )}
            {checkoutError && <p className="mt-4 font-[Space_Grotesk] text-sm text-red-700">{checkoutError}</p>}

            <button
              disabled={!canCheckout}
              onClick={startCheckout}
              className="mt-5 w-full rounded-full bg-[#0B4933] py-3.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              {checkingOut ? "STARTING CHECKOUT..." : "CONTINUE TO SECURE CHECKOUT"}
            </button>

            {rentalItems.length > 0 && (
              <p className="mt-3 text-center font-[Space_Grotesk] text-xs leading-5 text-[#8C846F]">
                Your rental reservation number is created when checkout starts. Rental booking and security deposits are collected according to the reservation amounts configured by the server.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
