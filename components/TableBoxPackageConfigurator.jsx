import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { estimateBookingDepositCents, estimateSecurityDepositCents } from "../depositTiers";
import { rgba } from "./EditorialKit";
import { DELIVERY_SETUP_ITEM_ID, cents, money, splitComponents } from "./tableBoxPackageData";

function PriceBreakdown({ packagePrice, selectedAddons, deliveryPrice, fonts, palette }) {
  const addOnTotal = selectedAddons.reduce((sum, row) => sum + Number(row.rental_price || 0), 0);
  const rentalTotal = Number(packagePrice || 0) + addOnTotal + Number(deliveryPrice || 0);
  const totalCents = cents(rentalTotal);
  const depositCents = estimateBookingDepositCents(totalCents);
  const balanceCents = Math.max(0, totalCents - depositCents);
  const securityCents = estimateSecurityDepositCents(totalCents);

  const row = (label, value, key) => (
    <div key={key} className="mt-2 flex items-center justify-between gap-4 first:mt-0">
      <span style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px" }}>{label}</span>
      <strong style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "14px" }}>{value}</strong>
    </div>
  );

  const tile = (kicker, amount, note) => (
    <div className="rounded-lg border p-3" style={{ borderColor: palette.line, background: palette.surface }}>
      <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: "0.08em" }}>{kicker}</p>
      <strong className="mt-1 block" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "20px" }}>
        {money(amount / 100)}
      </strong>
      <p className="mt-1" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", lineHeight: 1.4 }}>{note}</p>
    </div>
  );

  return (
    <div className="mt-6 rounded-xl border p-4" style={{ borderColor: palette.line, background: rgba(palette.primary, 0.035) }}>
      {row("Package rental", money(packagePrice), "package")}
      {selectedAddons.map((addon) => row(addon.add_on_label || addon.name, `+${money(addon.rental_price)}`, addon.id))}
      {deliveryPrice > 0 && row("Delivery + basic setup + pickup", `+${money(deliveryPrice)}`, "delivery")}

      <div className="mt-4 flex items-end justify-between gap-4 border-t pt-4" style={{ borderColor: palette.line }}>
        <div>
          <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: "0.1em" }}>RENTAL TOTAL</p>
          <p className="mt-1" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "28px", fontWeight: 650 }}>
            {money(rentalTotal)}
          </p>
        </div>
        <p className="text-right" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "12px", lineHeight: 1.5 }}>
          No hidden package fees.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {tile("DUE TODAY", depositCents, "50% booking deposit")}
        {tile("7 DAYS BEFORE", balanceCents, "Remaining rental balance")}
        {tile("48 HOURS BEFORE", securityCents, "Refundable security deposit")}
      </div>

      <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", lineHeight: 1.5 }}>
        The refundable security deposit is separate from the rental total and is released after your items are
        returned and checked. Earlier pickup or extended return days, if selected at checkout, are $5 per
        additional day and will be shown before payment.
      </p>
    </div>
  );
}

// The choices, add-ons, delivery option, price breakdown and Add to Cart
// button for one Table Box package. Used inside the pop-up on the Table Box
// page and on each package's own page, so the two can never drift apart.
// `onAdded` runs once the package (and any add-ons) are in the cart.
export default function TableBoxPackageConfigurator({ pkg, addons, deliveryItem, onAdded }) {
  const { palette, fonts } = usePalette();
  const { addRental, rentalItems } = useCart();
  const { fixed, groups } = useMemo(() => splitComponents(pkg.components), [pkg]);
  const [choices, setChoices] = useState(() =>
    Object.fromEntries(groups.map((group) => [group.key, group.options[0].item_id]))
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [deliverySelected, setDeliverySelected] = useState(false);

  // Delivery is a flat charge per order. If it's already in the cart from
  // another box, adding it again would bill it twice.
  const deliveryInCart = rentalItems.some((line) => Number(line.id) === DELIVERY_SETUP_ITEM_ID);

  const selectedAddons = addons.filter((row) => selectedAddonIds.includes(row.id));
  const chosenComponents = groups.map((group) => group.options.find((o) => o.item_id === choices[group.key]));
  const included = [...fixed, ...chosenComponents].sort((a, b) => a.display_order - b.display_order);

  const toggleAddon = (id) =>
    setSelectedAddonIds((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));

  const addPackage = () => {
    // The package is a real items row priced at the package rate. The
    // choices travel with it (flat arrays: CartContext's line key drops
    // nested objects) and the server re-derives the pieces from them.
    addRental(pkg.package_item_id, {
      package: pkg.slug,
      choiceIds: chosenComponents.map((c) => c.item_id).sort((a, b) => a - b),
      components: included.map((c) => [c.item_id, c.quantity]),
    }, 1);
    selectedAddons.forEach((addon) => addRental(addon.id, null, 1));
    if (deliverySelected && deliveryItem && !deliveryInCart) addRental(deliveryItem.id, null, 1);
    onAdded?.(pkg);
  };

  const sectionLabel = (text) => (
    <p style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em" }}>
      {text}
    </p>
  );

  const optionButton = (selected, onClick, children, key) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left"
      style={{ borderColor: selected ? palette.accent : palette.line, background: selected ? rgba(palette.accent, 0.07) : palette.surface }}
    >
      {children}
    </button>
  );

  return (
    <>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>Package rental</span>
              <strong style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "30px" }}>{money(pkg.rental_price)}</strong>
            </div>

            <div className="mt-5 border-t pt-5" style={{ borderColor: palette.line }}>
              {sectionLabel("EVERYTHING INCLUDED")}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {included.map((component) => (
                  <div key={component.item_id} className="flex gap-2">
                    <Check size={15} style={{ color: palette.accent, marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "13px", lineHeight: 1.45 }}>
                      {component.quantity} × {component.label || component.item_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.key} className="mt-5 border-t pt-5" style={{ borderColor: palette.line }}>
                {sectionLabel(group.label.toUpperCase())}
                {group.options.length === 1 ? (
                  <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                    This box comes with {group.options[0].label}.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.options.map((option) =>
                      optionButton(
                        choices[group.key] === option.item_id,
                        () => setChoices((current) => ({ ...current, [group.key]: option.item_id })),
                        <span style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px", fontWeight: 600 }}>
                          {option.label}
                        </span>,
                        option.item_id
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {addons.length > 0 && (
              <div className="mt-6 border-t pt-5" style={{ borderColor: palette.line }}>
                <p style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "20px", fontWeight: 650 }}>Hosting for a holiday?</p>
                <p className="mt-1" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                  Add the festive pieces without buying a thing.
                </p>
                <div className="mt-3 grid gap-2">
                  {addons.map((addon) =>
                    optionButton(
                      selectedAddonIds.includes(addon.id),
                      () => toggleAddon(addon.id),
                      <>
                        <span>
                          <span className="block" style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px", fontWeight: 650 }}>
                            {addon.add_on_label || addon.name}
                          </span>
                          {addon.add_on_label && (
                            <span className="mt-0.5 block" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px" }}>
                              {addon.name}
                            </span>
                          )}
                        </span>
                        <strong style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "14px", flexShrink: 0 }}>
                          +{money(addon.rental_price)}
                        </strong>
                      </>,
                      addon.id
                    )
                  )}
                </div>
              </div>
            )}

            {deliveryItem && (
              <div className="mt-5 border-t pt-5" style={{ borderColor: palette.line }}>
                {deliveryInCart ? (
                  <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                    Delivery + basic setup is already in your cart. It covers this box too.
                  </p>
                ) : (
                  <div className="grid">
                    {optionButton(
                      deliverySelected,
                      () => setDeliverySelected((value) => !value),
                      <>
                        <span>
                          <span className="block" style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px", fontWeight: 650 }}>
                            Delivery + basic setup + pickup
                          </span>
                          <span className="mt-0.5 block" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px" }}>
                            We bring the pieces, get the basics in place and collect them afterward.
                          </span>
                        </span>
                        <strong style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "14px", flexShrink: 0 }}>
                          +{money(deliveryItem.rental_price)}
                        </strong>
                      </>,
                      "delivery"
                    )}
                  </div>
                )}
              </div>
            )}

            <PriceBreakdown
              packagePrice={pkg.rental_price}
              selectedAddons={selectedAddons}
              deliveryPrice={deliverySelected && deliveryItem && !deliveryInCart ? Number(deliveryItem.rental_price) : 0}
              fonts={fonts}
              palette={palette}
            />

            <button
              type="button"
              onClick={addPackage}
              className="mt-5 w-full rounded-full py-4 text-xs font-bold tracking-[0.14em]"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep, color: "#fff" }}
            >
              ADD THIS PACKAGE TO CART
            </button>
    </>
  );
}
