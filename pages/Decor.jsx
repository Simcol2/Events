import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { supabase } from "../supabaseClient";
import DecorCard, { DECOR_CATEGORY_TAGS, groupByVariant, parseItemTags } from "../components/DecorCard";
import RentalDatesModal from "../components/RentalDatesModal";
import { useRentalFlow, formatRentalDate } from "../useRentalFlow";
import { useEventType } from "../EventTypeContext";
import { usePalette } from "../PaletteContext";
import { TAGS as CATALOG_TAGS } from "../decorTags";
import { FEATURED_DECOR } from "../featuredProducts";
import { CUSTOM_SERVING_DISH, DISPLAYS } from "../packageContent";
import { itemUrlPath } from "../seo";
import { ElevatedCard, SectionIntro, paperTexture, rgba } from "../components/EditorialKit";

// A pinned featured entry that isn't a real Supabase catalog row - a
// Display Wall design or the Custom Serving Dish, both sold through their
// own pages rather than this one. Renders with the same card language as
// DecorCard so the pinned six read as one consistent row, but its "one
// primary action" goes straight to wherever that product is actually
// bought, since there's no /decor/<slug> page for it to view details on.
function FeaturedSpecialCard({ tile, palette, fonts }) {
  return (
    <article
      onClick={tile.onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-[#E6E6E6] bg-white transition-shadow hover:shadow-md"
      style={{ boxShadow: "0 1px 2px rgba(41,41,41,0.04), 0 10px 22px rgba(41,41,41,0.06)" }}
    >
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
        {tile.photo ? (
          <img
            src={tile.photo}
            alt={tile.name}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-[#6B6B6B]">PHOTO COMING SOON</span>
          </div>
        )}
      </div>
      <div className="flex min-h-[130px] flex-1 flex-col gap-1 px-4 pb-4 pt-4 sm:min-h-[150px]">
        <div className="font-[Space_Grotesk] text-[10px] font-medium uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-xs sm:tracking-[0.16em]">
          {tile.categoryLabel}
        </div>
        <h3
          className="font-['Fraunces'] text-lg font-semibold leading-[1.1] text-[#0B4933] sm:text-[22px] sm:leading-[1.05]"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {tile.name}
        </h3>
        {tile.diagnostic && (
          <div
            className="font-[Space_Grotesk] text-xs text-[#8C846F]"
            style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {tile.diagnostic}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E6E6E6] pt-3">
          <span className="font-[Space_Grotesk] text-xs font-medium tracking-[0.06em] text-[#8A6A1E] sm:text-sm sm:tracking-[0.08em]">
            {tile.priceLabel}
          </span>
          <span className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] sm:text-sm sm:tracking-[0.14em]">
            VIEW DETAILS
          </span>
        </div>
      </div>
    </article>
  );
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

// "View All" first, then every real category, matching the Gifts page's
// own category-pill pattern (one persistent filtered grid, not a
// pick-a-category-first gate). DECOR_CATEGORY_TAGS (imported above) is
// the one shared list of which tags belong here at all.
const CATEGORIES = [
  { id: "all", label: "View All" },
  ...CATALOG_TAGS.filter((t) => DECOR_CATEGORY_TAGS.includes(t.id)),
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
  const { openPickerForBuilder } = useEventType();
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
      if (selectedCategory === "all" && !tags.some((t) => DECOR_CATEGORY_TAGS.includes(t))) return false;
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

  // The pinned six (see featuredProducts.js) only lead the unfiltered View
  // All state - a specific category or an active search shows its own
  // real matches instead, since most of the six aren't tagged into every
  // category, and a couple aren't Supabase catalog rows at all.
  const featuredEntries = useMemo(() => {
    if (selectedCategory !== "all" || availability !== "all" || query) return [];

    return FEATURED_DECOR.map((entry) => {
      if (entry.kind === "special") {
        if (entry.key === CUSTOM_SERVING_DISH.id) {
          const d = CUSTOM_SERVING_DISH;
          return {
            special: true,
            renderKey: entry.key,
            tile: {
              name: d.name,
              diagnostic: d.tagline,
              photo: d.photos?.default?.[0],
              categoryLabel: entry.categoryLabel,
              priceLabel: entry.priceLabel,
              onClick: () => openPickerForBuilder(),
            },
          };
        }
        const d = DISPLAYS.find((x) => x.id === entry.key);
        if (!d) return null;
        return {
          special: true,
          renderKey: entry.key,
          tile: {
            name: d.name,
            diagnostic: d.tagline,
            photo: d.photoUrl || d.photoUrls?.[0],
            categoryLabel: entry.categoryLabel,
            priceLabel: entry.priceLabel,
            onClick: () => navigate("/display-options"),
          },
        };
      }

      const match = groupedVisible.find((g) => normalize(g.groupName || g.item.name) === normalize(entry.name));
      if (!match) return null;
      return { special: false, renderKey: match.key, entry: match };
    }).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, availability, query, groupedVisible]);

  const featuredKeys = useMemo(
    () => new Set(featuredEntries.filter((f) => !f.special).map((f) => f.renderKey)),
    [featuredEntries]
  );

  const restVisible = useMemo(
    () => groupedVisible.filter((g) => !featuredKeys.has(g.key)),
    [groupedVisible, featuredKeys]
  );

  const selectCategory = (id) => {
    setSelectedCategory(id);
    setAvailability("all");
    setQuery("");
  };

  return (
    <main style={{ ...paperTexture(palette), color: palette.ink }}>
      <section className="mx-auto max-w-7xl px-5 pt-14 text-center sm:px-8">
        <SectionIntro
          eyebrow="THE RENTAL COLLECTION"
          title="The pieces that make the room feel intentional."
          body="Decor, display walls and tabletop pieces to rent or buy for your celebration."
          palette={palette}
          fonts={fonts}
        />
        <p
          className="mt-4 font-[Space_Grotesk] text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: palette.muted }}
        >
          Toronto pickup · Delivery by request · Event Stylist setup available
        </p>
      </section>

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
              {featuredEntries.map((f) =>
                f.special ? (
                  <FeaturedSpecialCard key={`special-${f.renderKey}`} tile={f.tile} palette={palette} fonts={fonts} />
                ) : (
                  <DecorCard
                    key={f.entry.key}
                    item={f.entry.item}
                    variants={f.entry.variants}
                    groupName={f.entry.groupName}
                    onOpenDetail={(active, variants, groupName) => navigate(itemUrlPath("decor", active, groupName))}
                  />
                )
              )}
              {restVisible.map((entry) => (
                <DecorCard
                  key={entry.key}
                  item={entry.item}
                  variants={entry.variants}
                  groupName={entry.groupName}
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
