import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { supabase } from "../supabaseClient";
import DecorCard, { groupByVariant, parseItemTags } from "../components/DecorCard";
import RentalDatesModal from "../components/RentalDatesModal";
import { useRentalFlow, formatRentalDate } from "../useRentalFlow";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { TAGS as CATALOG_TAGS } from "../decorTags";
import { itemUrlPath } from "../seo";
import { ElevatedCard, PageHero, SectionIntro, paperTexture, rgba } from "../components/EditorialKit";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

const DECOR_CATEGORY_IDS = [
  "table",
  "wall/floor",
  "signage",
  "equipment",
  "marquee letters & numbers",
  "keepsakes & gifts",
  "disposables",
  "dessert items",
];

// "View All" first, then every real category, matching the Gifts page's
// own category-pill pattern (one persistent filtered grid, not a
// pick-a-category-first gate).
const CATEGORIES = [
  { id: "all", label: "View All" },
  ...CATALOG_TAGS.filter((t) => DECOR_CATEGORY_IDS.includes(t.id)),
];

const AVAILABILITY = [
  { id: "all", label: "All" },
  { id: "rent", label: "Rent" },
  { id: "purchase", label: "Purchase" },
];

function itemTags(item) {
  const sheetTags = parseItemTags(item).map(normalize);
  const derived = [];
  if (item.rental_price != null) derived.push("rent");
  if (item.purchase_price != null) derived.push("purchase");
  return [...sheetTags, ...derived];
}

export default function Decor({ navigate }) {
  const { palette, fonts } = usePalette();
  const { addToCart } = useCart();
  const rental = useRentalFlow();

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError("The decor catalog isn't connected yet. Check back soon.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (cancelled) return;
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = normalize(query);

    return items.filter((item) => {
      const tags = itemTags(item);
      if (selectedCategory !== "all" && !tags.includes(selectedCategory)) return false;
      if (selectedCategory === "all" && !tags.some((t) => DECOR_CATEGORY_IDS.includes(t))) return false;
      if (availability !== "all" && !tags.includes(availability)) return false;

      return (
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q)
      );
    });
  }, [items, selectedCategory, availability, query]);

  const cardUnits = useMemo(() => {
    const seen = new Set();
    const result = [];

    for (const item of items) {
      const key = item.variant_group?.trim();
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      result.push(item);
    }

    return result;
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    for (const unit of cardUnits) {
      const tags = itemTags(unit);
      for (const cat of CATEGORIES) {
        if (tags.includes(cat.id)) counts[cat.id] = (counts[cat.id] || 0) + 1;
      }
    }

    return counts;
  }, [cardUnits]);

  const groupedVisible = useMemo(() => groupByVariant(visible), [visible]);

  const selectCategory = (id) => {
    setSelectedCategory(id);
    setAvailability("all");
    setQuery("");
  };

  const handleBuy = (item) => addToCart(item.id, "catalog");

  return (
    <main style={{ ...paperTexture(palette), color: palette.ink }}>
      <PageHero
        eyebrow="THE RENTAL COLLECTION"
        title="The pieces that make the room feel intentional."
        script="Pretty, useful and very much invited."
        palette={palette}
        fonts={fonts}
        align="center"
      />

      <section style={{ ...paperTexture(palette), padding: "72px 24px 100px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="START HERE"
            title="What are you looking for?"
            palette={palette}
            fonts={fonts}
            align="left"
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className="rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em]"
                style={{
                  ...fonts.bodyFont,
                  background: selectedCategory === cat.id ? palette.primaryDeep : palette.surface,
                  color: selectedCategory === cat.id ? "#FFFFFF" : palette.primaryDeep,
                  border: `1px solid ${selectedCategory === cat.id ? palette.primaryDeep : palette.line}`,
                  textTransform: "uppercase",
                }}
              >
                {cat.label}
                {cat.id !== "all" ? ` (${categoryCounts[cat.id] || 0})` : ""}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvailability(a.id)}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em]"
                  style={{
                    ...fonts.bodyFont,
                    background: availability === a.id ? palette.primaryDeep : palette.surface,
                    color: availability === a.id ? "#FFFFFF" : palette.primaryDeep,
                    border: `1px solid ${availability === a.id ? palette.primaryDeep : palette.line}`,
                    textTransform: "uppercase",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => rental.setShowDatesModal(true)}
              className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
              style={{
                ...fonts.bodyFont,
                background: palette.surface,
                border: `1px solid ${rental.datesReady ? palette.primaryDeep : palette.line}`,
                color: palette.primaryDeep,
              }}
            >
              <CalendarDays size={15} color={palette.goldDeep} />
              {rental.datesReady
                ? `Renting ${formatRentalDate(rental.rentalDates.pickup)} – ${formatRentalDate(rental.rentalDates.dropoff)} · Change`
                : "Set your rental dates"}
            </button>
          </div>

          <div className="mt-6 sm:max-w-md">
            <ElevatedCard palette={palette} className="px-5">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                  color={palette.muted}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search this category"
                  className="w-full bg-transparent py-4 pl-7 pr-3 text-base outline-none"
                  style={{ ...fonts.bodyFont, color: palette.ink }}
                />
              </div>
            </ElevatedCard>
          </div>

          {rental.checkingAvailability && (
            <p className="mt-4 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Checking availability for your dates...
            </p>
          )}

          {rental.rentalNotice && (
            <p
              className="mt-4 rounded-sm px-4 py-3 text-sm"
              style={{ ...fonts.bodyFont, background: rgba("#B8305F", 0.08), color: "#8A3142" }}
            >
              {rental.rentalNotice}
            </p>
          )}

          <div className="mt-12">
            {loading && (
              <p className="py-20 text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Curating the collection...
              </p>
            )}

            {error && (
              <p className="py-20 text-center text-base text-red-700" style={fonts.bodyFont}>
                Couldn't load the collection: {error}
              </p>
            )}

            {!loading && !error && visible.length === 0 && (
              <p className="py-20 text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Nothing matches yet.
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-7 sm:gap-y-14 lg:grid-cols-3">
              {groupedVisible.map((entry) => (
                <DecorCard
                  key={entry.key}
                  item={entry.item}
                  variants={entry.variants}
                  groupName={entry.groupName}
                  onRent={rental.handleRent}
                  onBuy={handleBuy}
                  onOpenDetail={(active, variants, groupName) => navigate(itemUrlPath("decor", active, groupName))}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {rental.showDatesModal && (
        <RentalDatesModal
          onClose={() => {
            rental.setShowDatesModal(false);
            rental.setPendingRentItem(null);
          }}
          onSaved={rental.handleDatesSaved}
        />
      )}
    </main>
  );
}
