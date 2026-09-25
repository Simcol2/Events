import React, { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import { estimateBookingDepositCents, estimateSecurityDepositCents } from "../depositTiers";
import { ElevatedCard, Kicker, editorialShadow, rgba } from "./EditorialKit";

const DELIVERY_SETUP_ITEM_ID = 572;
const FALLBACK_PHOTO = "/photos/table-box-after.jpg";

function money(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(value || 0));
}

function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

function photoUrl(path) {
  return withBasePath(path || FALLBACK_PHOTO);
}

// How many of an item are physically on hand, ignoring dates. An option a
// package needs more of than that (e.g. 20 goblets when only 8 are owned)
// is hidden rather than offered and then refused at checkout.
function onHand(item) {
  return Number(item?.quantity_owned || 0) - Number(item?.quantity_out_of_service || 0);
}

// Splits a package's component rows into always-included pieces and the
// choice groups the customer picks one option from.
function splitComponents(components) {
  const fixed = [];
  const groups = [];
  for (const component of components) {
    if (!component.choice_group) {
      fixed.push(component);
      continue;
    }
    let group = groups.find((g) => g.key === component.choice_group);
    if (!group) {
      group = { key: component.choice_group, label: component.choice_label || "Choose one", options: [] };
      groups.push(group);
    }
    group.options.push(component);
  }
  return { fixed, groups: groups.filter((g) => g.options.length > 0) };
}

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

function PackageModal({ pkg, addons, deliveryItem, onClose, onAdded }) {
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

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    onClose();
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
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(12,20,16,.76)", backdropFilter: "blur(7px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={pkg.name}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
        style={{ background: palette.surface, boxShadow: "0 28px 100px rgba(0,0,0,.35)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close package"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,.92)", color: palette.primaryDeep }}
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-[260px] bg-cover bg-center md:min-h-full" style={{ backgroundImage: `url(${photoUrl(pkg.image_url)})` }} />

          <div className="p-6 sm:p-8">
            <Kicker palette={palette} fonts={fonts}>PRE-BUILT TABLE BOX · {pkg.guest_count} GUESTS</Kicker>
            <h2 className="mt-3" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 650 }}>
              {pkg.name}
            </h2>
            <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.65 }}>{pkg.blurb}</p>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TableBoxPackages() {
  const { palette, fonts } = usePalette();
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [deliveryItem, setDeliveryItem] = useState(null);
  const [activePackage, setActivePackage] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!supabase) return;

      const [packageResult, componentResult, addonResult, deliveryResult] = await Promise.all([
        supabase.from("table_box_packages").select("*").eq("active", true).order("display_order", { ascending: true }),
        supabase.from("table_box_package_items").select("*").order("display_order", { ascending: true }),
        supabase.from("table_box_package_addons").select("*").eq("active", true).order("display_order", { ascending: true }),
        supabase.from("items").select("*").eq("id", DELIVERY_SETUP_ITEM_ID).maybeSingle(),
      ]);
      if (ignore) return;

      if (packageResult.error || componentResult.error || addonResult.error) {
        setError("Package options are unavailable right now.");
        return;
      }

      const packageRows = packageResult.data || [];
      const componentRows = componentResult.data || [];
      const addonRows = addonResult.data || [];

      const allItemIds = Array.from(
        new Set(
          [
            ...packageRows.map((row) => row.package_item_id),
            ...componentRows.map((row) => row.item_id),
            ...addonRows.map((row) => row.item_id),
          ].filter(Boolean)
        )
      );

      const { data: itemRows, error: itemsError } = allItemIds.length
        ? await supabase.from("items").select("*").in("id", allItemIds)
        : { data: [], error: null };
      if (ignore) return;
      if (itemsError) {
        setError("Package pricing is unavailable right now.");
        return;
      }

      const byId = Object.fromEntries((itemRows || []).map((item) => [item.id, item]));

      const hydratedPackages = packageRows
        .map((row) => {
          const packageItem = byId[row.package_item_id];
          if (!packageItem?.active || !packageItem?.rental_price) return null;

          const components = [];
          for (const component of componentRows.filter((c) => c.package_id === row.id)) {
            const item = byId[component.item_id];
            const stocked = item?.active && onHand(item) >= Number(component.quantity);
            // A fixed piece that can't be supplied makes the whole box
            // unavailable; an unstocked alternative just isn't offered.
            if (!stocked && !component.choice_group) return null;
            if (stocked) components.push({ ...component, item_name: item.name });
          }
          const { groups } = splitComponents(components);
          const everyGroupHasOption = new Set(componentRows.filter((c) => c.package_id === row.id && c.choice_group).map((c) => c.choice_group)).size === groups.length;
          if (!components.length || !everyGroupHasOption) return null;

          return { ...row, rental_price: Number(packageItem.rental_price), components };
        })
        .filter(Boolean);

      const hydratedAddons = addonRows
        .map((row) => {
          const item = byId[row.item_id];
          if (!item?.active || !item?.rental_price) return null;
          return { ...item, package_addon_id: row.id, add_on_label: row.label };
        })
        .filter(Boolean);

      setPackages(hydratedPackages);
      setAddons(hydratedAddons);
      setDeliveryItem(deliveryResult.data || null);
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Kicker palette={palette} fonts={fonts}>START WITH A PACKAGE</Kicker>
              <h1
                className="mt-4"
                style={{
                  ...fonts.displayFont,
                  color: palette.primaryDeep,
                  fontSize: "clamp(3rem, 7vw, 6.4rem)",
                  fontWeight: 640,
                  lineHeight: 0.95,
                  letterSpacing: "-0.045em",
                }}
              >
                Start with a <span style={{ color: palette.accent }}>Table Box.</span>
              </h1>
              <p className="mt-6" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(1.35rem, 2.4vw, 2rem)", lineHeight: 1.25 }}>
                Use what you own.
                <br />
                Rent what makes it better.
              </p>
              <p className="mt-5 max-w-lg" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.7 }}>
                Want the easy version? Start with a ready-made box, add anything seasonal you want, and see every
                dollar before it goes into your cart.
              </p>
              <div
                className="mt-5 flex max-w-lg flex-wrap items-center gap-x-4 gap-y-1"
                style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}
              >
                <span>$50 minimum rental</span>
                <span aria-hidden="true">&middot;</span>
                <span>Toronto pickup &amp; return</span>
                <span aria-hidden="true">&middot;</span>
                <span>Delivery + basic setup available</span>
              </div>
              <a
                href="#build-your-own-table-box"
                className="mt-7 inline-flex rounded-full border px-6 py-3 text-xs font-bold tracking-[0.12em]"
                style={{ ...fonts.bodyFont, borderColor: palette.primaryDeep, color: palette.primaryDeep }}
              >
                OR BUILD YOUR OWN
              </a>
            </div>

            <div
              className="overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/3", boxShadow: editorialShadow, border: `1px solid ${rgba(palette.gold, 0.3)}` }}
            >
              <img src={photoUrl(FALLBACK_PHOTO)} alt="A styled Table Box dinner table" className="h-full w-full object-cover" />
            </div>
          </div>

          {error ? (
            <p className="mt-8" style={{ ...fonts.bodyFont, color: palette.muted }}>{error}</p>
          ) : (
            packages.length > 0 && (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {packages.map((pkg) => (
                  <ElevatedCard key={pkg.id} palette={palette} className="overflow-hidden p-0">
                    <button type="button" onClick={() => setActivePackage(pkg)} className="block h-full w-full text-left">
                      <div className="grid h-full sm:grid-cols-[1fr_155px]">
                        <div className="p-6 sm:p-7">
                          <Kicker palette={palette} fonts={fonts}>{pkg.guest_count} GUESTS</Kicker>
                          <h2 className="mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "32px", fontWeight: 650 }}>
                            {pkg.name}
                          </h2>
                          <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "14px", lineHeight: 1.55 }}>
                            {pkg.blurb}
                          </p>
                          <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                              <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: "0.08em" }}>PACKAGE RENTAL</p>
                              <strong className="mt-1 block" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "34px" }}>
                                {money(pkg.rental_price)}
                              </strong>
                            </div>
                            <span style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "12px", fontWeight: 700 }}>
                              VIEW + ADD OPTIONS →
                            </span>
                          </div>
                        </div>
                        <div className="min-h-[180px] bg-cover bg-center" style={{ backgroundImage: `url(${photoUrl(pkg.image_url)})` }} />
                      </div>
                    </button>
                  </ElevatedCard>
                ))}
              </div>
            )
          )}

          <div className="mt-8 text-center">
            <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px", lineHeight: 1.6 }}>
              Package prices are the actual rental prices. Holiday add-ons and delivery are optional and priced
              separately before you add anything to your cart.
            </p>
            {status && (
              <p className="mt-2 font-semibold" role="status" style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "13px" }}>
                {status}
              </p>
            )}
          </div>
        </div>
      </section>

      {activePackage && (
        <PackageModal
          pkg={activePackage}
          addons={addons}
          deliveryItem={deliveryItem}
          onClose={() => setActivePackage(null)}
          onAdded={(pkg) => setStatus(`${pkg.name} added to your cart.`)}
        />
      )}
    </>
  );
}
