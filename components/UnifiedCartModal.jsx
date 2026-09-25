import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Info, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../CartContext";
import { supabase } from "../supabaseClient";
import { API_BASE, withBasePath } from "../apiBase";
import RentalDateFields, { rentalDatesValid } from "./RentalDateFields";
import { estimateBookingDepositCents, estimateSecurityDepositCents } from "../depositTiers";
import HowRentalWorks from "./HowRentalWorks";
import SquareCardPayment from "./SquareCardPayment";
import { bulkPoolCounter, rentalUnitPrice } from "../api/_pricing.js";

const MIN_RENTAL_CENTS = 5000;

function money(cents) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format((Number(cents) || 0) / 100);
}

// The physical pieces a rental line holds, as [itemId, quantity] pairs:
// the item itself, or for a Table Box package the pieces recorded on the
// cart line when it was added. Display only - checkout re-derives package
// contents from the database.
function physicalDemand(line) {
  const boxes = Number(line.quantity || 1);
  if (Array.isArray(line.meta?.components)) {
    return line.meta.components.map(([id, perBox]) => [Number(id), Number(perBox) * boxes]);
  }
  return [[Number(line.id), boxes]];
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
  const [availability, setAvailability] = useState(() => new Map());
  const [checking, setChecking] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [futurePaymentMethod, setFuturePaymentMethod] = useState("card_on_file");
  const [manualPaymentAcknowledged, setManualPaymentAcknowledged] = useState(false);
  const tokenizeCardRef = useRef(null);
  const [squareReady, setSquareReady] = useState(false);

  const saveCardOnFile = futurePaymentMethod === "card_on_file";

  const handleSquareReady = useCallback((tokenize) => {
    tokenizeCardRef.current = tokenize;
    setSquareReady(Boolean(tokenize));
  }, []);

  const catalogMap = useMemo(() => new Map(catalog.map((item) => [String(item.id), item])), [catalog]);
  const giftMap = useMemo(() => new Map(gifts.map((item) => [String(item.id), item])), [gifts]);

  const resolved = useMemo(() => {
    const poolQuantity = bulkPoolCounter(
      items
        .filter((line) => line.kind === "rental")
        .map((line) => ({ item: catalogMap.get(String(line.id)), quantity: line.quantity }))
    );
    return items.map((line) => {
      if (line.kind === "rental") {
        const item = catalogMap.get(String(line.id));
        return item
          ? {
              ...line,
              name: item.name,
              unitCents: Math.round(rentalUnitPrice(item, line.quantity, poolQuantity(item, line.quantity)) * 100),
              mode: "rental",
              choiceNames: Array.isArray(line.meta?.choiceIds)
                ? line.meta.choiceIds.map((id) => catalogMap.get(String(id))?.name).filter(Boolean)
                : [],
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

  const rentalItemsSubtotalCents = resolved
    .filter((line) => line.mode === "rental")
    .reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

  const rentalWindowFeeCents =
    rentalItems.length > 0 ? Math.max(0, Number(rentalDates.extraDayFeeCents || 0)) : 0;

  const rentalSubtotalCents = rentalItemsSubtotalCents + rentalWindowFeeCents;

  const purchaseSubtotalCents = resolved
    .filter((line) => line.mode === "purchase")
    .reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

  const bookingDepositEstimateCents = rentalItems.length > 0 ? estimateBookingDepositCents(rentalSubtotalCents) : 0;
  const securityDepositEstimateCents = rentalItems.length > 0 ? estimateSecurityDepositCents(rentalSubtotalCents) : 0;
  // The refundable security deposit is no longer part of what's due at
  // checkout for rentals (see startCheckout below) - Square collects it
  // separately, closer to pickup, once the customer has a card on file.
  const dueTodayCents = purchaseSubtotalCents + bookingDepositEstimateCents;
  const remainingBalanceCents = Math.max(0, rentalSubtotalCents - bookingDepositEstimateCents);

  // Exact due dates for the summary below, computed from the pickup date
  // (and time, once chosen) the customer already set above - mirrors the
  // same 7-day/48-hour schedule the timing job (api/square.js resource=timing)
  // actually charges on, so this is never just a vague relative label.
  const pickupAtDate = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rentalDates.pickup || "")) return null;
    const time = /^\d{2}:\d{2}$/.test(rentalDates.pickupTime || "") ? rentalDates.pickupTime : "17:00";
    const parsed = new Date(`${rentalDates.pickup}T${time}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [rentalDates.pickup, rentalDates.pickupTime]);

  const formatDueDate = (millisBeforePickup, { includeTime } = {}) => {
    if (!pickupAtDate) return null;
    const due = new Date(pickupAtDate.getTime() - millisBeforePickup);
    const datePart = due.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    if (!includeTime || !rentalDates.pickupTime) return datePart;
    const timePart = due.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
    return `${datePart} at ${timePart}`;
  };

  const balanceDueLabel = formatDueDate(7 * 24 * 60 * 60 * 1000);
  const securityDepositDueLabel = formatDueDate(48 * 60 * 60 * 1000, { includeTime: true });

  const rentalMinimumMet = rentalItems.length === 0 || rentalSubtotalCents >= MIN_RENTAL_CENTS;
  const rentalDatesReady = rentalItems.length === 0 || rentalDatesValid(rentalDates);

  // Total pieces the cart needs of each physical item, across every rental
  // line - so a Table Box package plus loose plates can't each look fine
  // on their own while together needing more plates than exist.
  const demandByItem = useMemo(() => {
    const totals = new Map();
    for (const line of rentalItems) {
      for (const [id, qty] of physicalDemand(line)) totals.set(id, (totals.get(id) || 0) + qty);
    }
    return totals;
  }, [rentalItems]);

  useEffect(() => {
    let cancelled = false;

    async function checkAll() {
      if (!rentalItems.length || !rentalDatesReady || !supabase) {
        setAvailability(new Map());
        return;
      }

      setChecking(true);
      const available = new Map();

      for (const id of demandByItem.keys()) {
        const { data, error } = await supabase.rpc("get_reservation_item_availability", {
          p_item_id: id,
          p_pickup: rentalDates.pickup,
          p_dropoff: rentalDates.dropoff,
        });

        if (cancelled) return;
        available.set(id, error ? null : Number(data || 0));
      }

      if (!cancelled) {
        setAvailability(available);
        setChecking(false);
      }
    }

    checkAll();
    return () => {
      cancelled = true;
    };
  }, [rentalItems, demandByItem, rentalDates.pickup, rentalDates.dropoff, rentalDatesReady]);

  // null while unknown; otherwise whether every piece this line holds is
  // available, plus the first piece that falls short.
  const lineAvailability = (line) => {
    let shortfall = null;
    for (const [id] of physicalDemand(line)) {
      const available = availability.get(id);
      if (available == null) return null;
      const needed = demandByItem.get(id) || 0;
      if (available < needed && !shortfall) shortfall = { id, available, needed };
    }
    return { ok: !shortfall, shortfall };
  };

  const allAvailable =
    rentalItems.length === 0 ||
    (!checking && rentalItems.every((line) => lineAvailability(line)?.ok === true));

  // The card form only needs to be ready (and, for manual payment, the
  // deadline acknowledgment checked) when there are rentals to pay a
  // deposit on - a purchase-only cart never touches Square at all.
  const rentalPaymentReady =
    rentalItems.length === 0 ||
    (squareReady && (futurePaymentMethod === "card_on_file" || manualPaymentAcknowledged));

  const canCheckout =
    items.length > 0 &&
    rentalMinimumMet &&
    rentalDatesReady &&
    allAvailable &&
    rentalPaymentReady &&
    name.trim() &&
    email.trim() &&
    !checking &&
    !checkingOut;

  async function startCheckout() {
    setCheckoutError("");
    setCheckingOut(true);

    try {
      const hasRentals = rentalItems.length > 0;
      const hasPurchases = purchaseItems.length > 0;

      // Square's 50% booking deposit applies to the whole rental order, so a
      // rental + purchase cart charged together would charge the wrong
      // amount. Rental bookings and purchases check out separately during
      // this migration.
      if (hasRentals && hasPurchases) {
        throw new Error("Please check out your rental booking separately from purchase items.");
      }

      let paymentToken = null;

      if (hasRentals) {
        if (!tokenizeCardRef.current) {
          throw new Error("Secure card entry is not ready yet.");
        }

        paymentToken = await tokenizeCardRef.current();
      }

      const endpoint = hasRentals
        ? `${API_BASE}/square?resource=production-booking`
        : `${API_BASE}/create-unified-checkout-session`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
          },
          // The server recomputes the pickup date/time and any early-pickup
          // or extended-return fee itself from rentalDates (see
          // calculateRentalWindow in api/square.js) rather than trusting a
          // client-supplied pickupAt.
          rentalDates,
          items: items.map(({ id, kind, meta, quantity }) => ({ id, kind, meta, quantity })),
          paymentToken,
          saveCardOnFile,
          manualPaymentAcknowledged,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not start checkout.");
      }

      if (data.bookingNumber) {
        window.sessionStorage.setItem("asliceofg-pending-booking-number", data.bookingNumber);
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.redirectUrl) {
        window.location.href = withBasePath(data.redirectUrl);
        return;
      }

      throw new Error("Checkout did not return a destination.");
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
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#FFFFFF] p-5 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B]"
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
            {rentalItems.length > 0 && <HowRentalWorks />}

            {rentalItems.length > 0 && (
              <section className="mt-7 rounded-xl border border-[#E6DDC7] bg-white p-5">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#8A6A1E]" />
                  <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Rental dates</h3>
                </div>
                <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#6B6B6B]">
                  These dates apply to every rental item in this order. Availability is checked for the whole cart.
                </p>
                <div className="mt-4">
                  <RentalDateFields dates={rentalDates} onChange={setRentalDates} />
                </div>
              </section>
            )}

            <div className="mt-6 space-y-3">
              {resolved.map((line) => {
                const av = line.kind === "rental" ? lineAvailability(line) : null;
                const isPackage = Array.isArray(line.meta?.components);
                const shortName = av?.shortfall
                  ? catalogMap.get(String(av.shortfall.id))?.name || "one of the pieces"
                  : "";
                return (
                  <div
                    key={`${line.kind}-${line.id}-${JSON.stringify(line.meta || {})}`}
                    className="flex gap-4 rounded-xl border border-[#E6E6E6] bg-white p-4"
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
                        <h4 className="truncate font-[Space_Grotesk] text-sm font-semibold text-[#292929]">
                          {line.name}
                        </h4>
                      </div>
                      {line.choiceNames?.length > 0 && (
                        <p className="mt-1 font-[Space_Grotesk] text-xs text-[#6B6B6B]">
                          {line.choiceNames.join(" · ")}
                        </p>
                      )}
                      <p className="mt-2 font-[Space_Grotesk] text-sm text-[#8A6A1E]">
                        {money(line.unitCents)} each
                      </p>
                      {line.mode === "rental" && rentalDatesReady && (
                        <p className="mt-1 font-[Space_Grotesk] text-xs text-[#6B6B6B]">
                          {checking
                            ? "Checking availability..."
                            : av == null
                              ? "Availability could not be checked."
                              : isPackage
                                ? av.ok
                                  ? "Every piece is available for your dates"
                                  : `Not enough ${shortName} for your dates (${av.shortfall.available} available)`
                                : av.ok
                                  ? `${availability.get(Number(line.id))} available for your dates`
                                  : `Only ${av.shortfall.available} available for your dates`}
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
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D9D9D9]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-6 text-center font-[Space_Grotesk] text-sm">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.id, line.kind, line.quantity + 1, line.meta)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D9D9D9]"
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
              <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Order summary</h3>
              <div className="mt-4 space-y-2">
                {resolved.map((line) => (
                  <div
                    key={`summary-${line.kind}-${line.id}-${JSON.stringify(line.meta || {})}`}
                    className="flex items-center justify-between gap-3 font-[Space_Grotesk] text-sm text-[#3E3A31]"
                  >
                    <span>
                      {line.name} <span className="text-[#9A9A9A]">x{line.quantity}</span>
                      {line.mode === "rental" && <span className="text-[#9A9A9A]"> (rental)</span>}
                    </span>
                    <span className="font-semibold">{money(line.unitCents * line.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#EEE7D8] pt-4 font-[Space_Grotesk] text-sm">
                {purchaseSubtotalCents > 0 && (
                  <div className="flex items-center justify-between text-[#3E3A31]">
                    <span>Purchases</span>
                    <span>{money(purchaseSubtotalCents)}</span>
                  </div>
                )}
                {rentalWindowFeeCents > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[#3E3A31]">
                    <span>
                      Extended rental window
                      <span className="ml-2 text-xs text-[#8C846F]">
                        {Number(rentalDates.earlyPickupDays || 0)} early pickup day(s),{" "}
                        {Number(rentalDates.extendedReturnDays || 0)} extended return day(s)
                      </span>
                    </span>
                    <strong>{money(rentalWindowFeeCents)}</strong>
                  </div>
                )}
                {rentalItems.length > 0 && (
                  <div className="flex items-center justify-between text-[#3E3A31]">
                    <span>Booking deposit (50% of rentals)</span>
                    <span>{money(bookingDepositEstimateCents)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#EEE7D8] pt-2 font-semibold text-[#0B4933]">
                  <span>Due today</span>
                  <span>{money(dueTodayCents)}</span>
                </div>
                {rentalItems.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-[#6B6B6B]">
                      <span>
                        Remaining rental balance
                        {balanceDueLabel ? ` (due ${balanceDueLabel})` : " (due 7 days before pickup)"}
                      </span>
                      <span>{money(remainingBalanceCents)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6B6B6B]">
                      <span>
                        Refundable security deposit
                        {securityDepositDueLabel ? ` (due ${securityDepositDueLabel})` : " (due 48 hours before pickup)"}
                      </span>
                      <span>{money(securityDepositEstimateCents)}</span>
                    </div>
                  </>
                )}
              </div>

              {rentalItems.length > 0 && (
                <p className="mt-3 font-[Space_Grotesk] text-xs leading-5 text-[#9A9A9A]">
                  {pickupAtDate
                    ? "Deposit amounts shown are an estimate. The exact amount is confirmed on the secure checkout page."
                    : "Choose your pickup date above to see exact due dates. Deposit amounts shown are an estimate."}
                </p>
              )}
            </section>

            {rentalItems.length > 0 && (
              <section className="mt-6 rounded-xl bg-[#F4EFE3] p-5">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-[#8A6A1E]" />
                  <h3 className="font-[Space_Grotesk] text-sm font-bold tracking-[0.1em] text-[#8A6A1E]">
                    HOW RENTAL PAYMENTS WORK
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 font-[Space_Grotesk] text-sm leading-6 text-[#5C5645]">
                  <li>
                    <strong className="text-[#292929]">Booking deposit</strong> - 50% of the rental total, charged
                    now to reserve your items.
                  </li>
                  <li>
                    <strong className="text-[#292929]">Remaining balance</strong> - the other 50%, due 7 days
                    before pickup.
                  </li>
                  <li>
                    <strong className="text-[#292929]">Refundable security deposit</strong> - due 48 hours before
                    pickup and released after return inspection, subject to the rental agreement.
                  </li>
                </ul>
              </section>
            )}

            <section className="mt-6 rounded-xl border border-[#E6DDC7] bg-white p-5">
              <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Your details</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-sm border border-[#D9D9D9] px-3 py-2.5 font-[Space_Grotesk] text-sm"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="rounded-sm border border-[#D9D9D9] px-3 py-2.5 font-[Space_Grotesk] text-sm"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="rounded-sm border border-[#D9D9D9] px-3 py-2.5 font-[Space_Grotesk] text-sm sm:col-span-2"
                />
              </div>
            </section>

            {rentalItems.length > 0 && (
              <section className="mt-6 rounded-xl border border-[#E6DDC7] bg-white p-5">
                <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Pay your deposit</h3>
                <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#6B6B6B]">
                  Enter your card to pay the {money(bookingDepositEstimateCents)} booking deposit now and reserve
                  your dates.
                </p>
                <div className="mt-4">
                  <SquareCardPayment
                    amountCents={bookingDepositEstimateCents}
                    name={name}
                    email={email}
                    phone={phone}
                    saveCard={saveCardOnFile}
                    onReady={handleSquareReady}
                  />
                </div>

                <div className="mt-6 rounded-xl bg-[#F8F3E8] p-4">
                  <p className="font-[Space_Grotesk] text-sm font-bold text-[#0B4933]">
                    After your deposit, how should future charges be handled?
                  </p>

                  <label className="mt-4 flex cursor-pointer gap-3">
                    <input
                      type="radio"
                      name="future-payment"
                      checked={futurePaymentMethod === "card_on_file"}
                      onChange={() => setFuturePaymentMethod("card_on_file")}
                    />

                    <span>
                      <span className="block font-[Space_Grotesk] text-sm font-semibold text-[#292929]">
                        Keep this card securely on file
                      </span>

                      <span className="mt-1 block font-[Space_Grotesk] text-xs leading-5 text-[#6F6859]">
                        Your remaining rental balance will be charged automatically 7 days before pickup. Your
                        refundable security deposit will be charged automatically 48 hours before pickup.
                      </span>
                    </span>
                  </label>

                  <label className="mt-4 flex cursor-pointer gap-3">
                    <input
                      type="radio"
                      name="future-payment"
                      checked={futurePaymentMethod === "manual"}
                      onChange={() => setFuturePaymentMethod("manual")}
                    />

                    <span>
                      <span className="block font-[Space_Grotesk] text-sm font-semibold text-[#292929]">
                        I will pay future charges manually
                      </span>

                      <span className="mt-1 block font-[Space_Grotesk] text-xs leading-5 text-[#6F6859]">
                        Your card will be used only for today's booking deposit and will not be kept on file.
                      </span>
                    </span>
                  </label>

                  {futurePaymentMethod === "manual" && (
                    <label className="mt-4 flex gap-3 rounded-lg border border-[#E7D7AD] bg-[#FFFDF6] p-3">
                      <input
                        type="checkbox"
                        checked={manualPaymentAcknowledged}
                        onChange={(e) => setManualPaymentAcknowledged(e.target.checked)}
                        className="mt-0.5"
                      />

                      <span className="font-[Space_Grotesk] text-xs leading-5 text-[#5C5645]">
                        I understand that because I am not leaving a card on file, I am responsible for paying the
                        remaining rental balance at least 7 days before pickup and the refundable security deposit
                        at least 48 hours before pickup. If required payments are not received by their deadlines,
                        my reservation may be cancelled and the items released.
                      </span>
                    </label>
                  )}
                </div>
              </section>
            )}

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
              {checkingOut
                ? "PROCESSING..."
                : rentalItems.length > 0
                  ? `PAY ${money(bookingDepositEstimateCents)} DEPOSIT`
                  : "CONTINUE TO SECURE CHECKOUT"}
            </button>

            {rentalItems.length > 0 && (
              <p className="mt-3 text-center font-[Space_Grotesk] text-xs leading-5 text-[#8C846F]">
                Your rental reservation number and booking deposit charge happen together when you submit. Your
                remaining balance and security deposit are collected according to the schedule above.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
