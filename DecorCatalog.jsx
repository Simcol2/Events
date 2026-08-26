"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "../supabaseClient";
import {
  SAGE,
  SAGE_DEEP,
  GOLD,
  CREAM,
  INK,
  LINE,
  MUTED,
  displayFont,
  scriptFont,
  bodyFont,
  ensureFonts,
} from "../theme";

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span
        className="h-px w-10"
        style={{ background: GOLD }}
      />

      <Leaf size={14} color={GOLD} />

      <span
        className="h-px w-10"
        style={{ background: GOLD }}
      />
    </div>
  );
}

export default function DecorCatalog() {
  ensureFonts();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("items")
        .select(
          "id, name, category, description, quantity_owned, rental_price, inventory_type, active"
        )
        .eq("active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Supabase items error:", error);
        setError(error.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(
      items
        .map((item) => item.category)
        .filter(Boolean)
    );

    return ["all", ...Array.from(set)];
  }, [items]);

  const visibleItems =
    activeCategory === "all"
      ? items
      : items.filter(
          (item) => item.category === activeCategory
        );

  return (
    <div
      className="min-h-screen"
      style={{
        background: CREAM,
        color: INK,
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">

        {/* HEADER */}
        <header className="text-center mb-10 sm:mb-14">

          <p
            className="text-xs tracking-[0.35em] font-medium"
            style={{
              ...bodyFont,
              color: GOLD,
            }}
          >
            THE
          </p>

          <h1
            className="text-5xl sm:text-6xl font-semibold tracking-tight -mt-1"
            style={{
              ...displayFont,
              color: SAGE_DEEP,
            }}
          >
            Decor Shop
          </h1>

          <p
            className="text-sm tracking-[0.2em] font-medium mt-2"
            style={{
              ...bodyFont,
              color: SAGE,
            }}
          >
            A SLICE OF G EVENTS
          </p>

          <Divider />

          <p
            className="italic text-2xl"
            style={scriptFont}
          >
            Browse every piece, one item at a time.
          </p>

          <p
            className="max-w-xl mx-auto mt-5 text-sm leading-7"
            style={{
              ...bodyFont,
              color: MUTED,
            }}
          >
            Every piece is thoughtfully selected to bring
            personality, polish and a little something special
            to your celebration.
          </p>
        </header>

        {/* CATEGORY FILTER */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const isActive =
                activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(cat)
                  }
                  className="rounded-full px-5 py-2 text-xs font-medium tracking-wide capitalize transition-all"
                  style={{
                    ...bodyFont,
                    border: isActive
                      ? `1.5px solid ${SAGE}`
                      : `1px solid ${LINE}`,
                    background: isActive
                      ? "#F1F4EC"
                      : "#FFFFFF",
                    color: isActive
                      ? SAGE_DEEP
                      : "#8A8268",
                  }}
                >
                  {cat === "all"
                    ? "All Items"
                    : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-center py-16">
            <Leaf
              size={24}
              color={GOLD}
              className="mx-auto mb-4"
            />

            <p
              className="text-sm"
              style={{
                ...bodyFont,
                color: MUTED,
              }}
            >
              Loading the collection…
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="max-w-xl mx-auto text-center py-10 px-6 rounded-sm"
            style={{
              background: "#FFF8F5",
              border: "1px solid #E8D4CC",
            }}
          >
            <p
              className="text-sm font-medium"
              style={{
                ...bodyFont,
                color: "#B85C5C",
              }}
            >
              Couldn't load the collection.
            </p>

            <p
              className="text-xs mt-2 break-words"
              style={{
                ...bodyFont,
                color: MUTED,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          visibleItems.length === 0 && (
            <div className="text-center py-16">
              <Leaf
                size={28}
                color={GOLD}
                className="mx-auto mb-4"
              />

              <p
                className="text-sm"
                style={{
                  ...bodyFont,
                  color: MUTED,
                }}
              >
                No items in this category yet.
              </p>
            </div>
          )}

        {/* ITEMS */}
        {!loading && !error && visibleItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item) => {
              const outOfStock =
                (item.quantity_owned ?? 0) <= 0;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-sm transition-transform duration-200 hover:-translate-y-1"
                  style={{
                    background: "#FFFFFF",
                    border: `1px solid ${LINE}`,
                    opacity: outOfStock ? 0.55 : 1,
                  }}
                >

                  {/* PHOTO PLACEHOLDER */}
                  <div
                    className="aspect-square flex items-center justify-center"
                    style={{
                      background: "#F1EEE2",
                    }}
                  >
                    <div className="text-center px-6">

                      <Leaf
                        size={32}
                        color={GOLD}
                        className="mx-auto mb-3"
                      />

                      <p
                        className="text-xs tracking-[0.15em] uppercase"
                        style={{
                          ...bodyFont,
                          color: MUTED,
                        }}
                      >
                        Photo coming soon
                      </p>

                    </div>
                  </div>

                  {/* ITEM INFORMATION */}
                  <div className="p-5">

                    <p
                      className="text-[10px] uppercase tracking-[0.2em] mb-2"
                      style={{
                        ...bodyFont,
                        color: GOLD,
                      }}
                    >
                      {item.category || "Decor"}
                    </p>

                    <h3
                      className="text-xl font-semibold leading-tight"
                      style={{
                        ...displayFont,
                        color: SAGE_DEEP,
                      }}
                    >
                      {item.name}
                    </h3>

                    {item.description && (
                      <p
                        className="text-sm leading-6 mt-3"
                        style={{
                          ...bodyFont,
                          color: MUTED,
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    {/* PRICE / AVAILABILITY */}
                    <div
                      className="flex items-end justify-between gap-3 mt-5 pt-4"
                      style={{
                        borderTop: `1px solid ${LINE}`,
                      }}
                    >
                      <div>
                        <p
                          className="text-xs"
                          style={{
                            ...bodyFont,
                            color: MUTED,
                          }}
                        >
                          Rental
                        </p>

                        <p
                          className="text-lg font-medium"
                          style={{
                            ...bodyFont,
                            color: GOLD,
                          }}
                        >
                          $
                          {Number(
                            item.rental_price || 0
                          ).toFixed(2)}
                          <span className="text-xs ml-1">
                            / event
                          </span>
                        </p>
                      </div>

                      <span
                        className="text-[11px] text-right"
                        style={{
                          ...bodyFont,
                          color: MUTED,
                        }}
                      >
                        {outOfStock
                          ? "Currently unavailable"
                          : `${item.quantity_owned} available`}
                      </span>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA */}
        {!loading && !error && visibleItems.length > 0 && (
          <section
            className="mt-16 sm:mt-20 text-center py-12 px-6"
            style={{
              borderTop: `1px solid ${LINE}`,
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase"
              style={{
                ...bodyFont,
                color: GOLD,
              }}
            >
              BUILD YOUR EVENT
            </p>

            <h2
              className="text-3xl sm:text-4xl font-semibold mt-2"
              style={{
                ...displayFont,
                color: SAGE_DEEP,
              }}
            >
              Want to build a package
              <br className="hidden sm:block" />
              around these pieces?
            </h2>

            <p
              className="max-w-lg mx-auto mt-4 text-sm leading-7"
              style={{
                ...bodyFont,
                color: MUTED,
              }}
            >
              Choose your favourites and we'll
              help you put together an event that
              feels completely yours.
            </p>

            <button
              className="mt-7 px-7 py-3 text-xs tracking-[0.18em] uppercase transition-all"
              style={{
                ...bodyFont,
                background: SAGE_DEEP,
                color: "#FFFFFF",
              }}
            >
              Plan My Event
            </button>
          </section>
        )}

      </div>
    </div>
  );
}    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("id, name, category, description, photos, quantity_owned, rental_price, inventory_type, active")
        .eq("active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [items]);

  const visibleItems = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-10">
          <p className="text-xs tracking-[0.35em] font-medium" style={{ ...bodyFont, color: GOLD }}>THE</p>
          <h1 className="text-5xl font-semibold tracking-tight -mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
            Decor Shop
          </h1>
          <p className="text-sm tracking-[0.2em] font-medium mt-1" style={{ ...bodyFont, color: SAGE }}>
            A SLICE OF G EVENTS
          </p>
          <Divider />
          <p className="italic text-2xl" style={scriptFont}>
            Browse every piece, one item at a time.
          </p>
        </header>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full px-4 py-1.5 text-xs font-medium tracking-wide capitalize transition-all"
                  style={{
                    ...bodyFont,
                    border: isActive ? `1.5px solid ${SAGE}` : `1px solid ${LINE}`,
                    background: isActive ? "#F1F4EC" : "#FFFFFF",
                    color: isActive ? SAGE_DEEP : "#8A8268",
                  }}
                >
                  {cat === "all" ? "All Items" : cat}
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <p className="text-center text-sm" style={{ ...bodyFont, color: MUTED }}>
            Loading the shop…
          </p>
        )}

        {error && (
          <p className="text-center text-sm" style={{ ...bodyFont, color: "#B85C5C" }}>
            Couldn't load items: {error}
          </p>
        )}

        {!loading && !error && visibleItems.length === 0 && (
          <p className="text-center text-sm" style={{ ...bodyFont, color: MUTED }}>
            No items in this category yet.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visibleItems.map((item) => {
            const photo = firstPhoto(item.photos);
            const outOfStock = (item.quantity_owned ?? 0) <= 0;
            return (
              <div
                key={item.id}
                className="rounded-sm overflow-hidden"
                style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, opacity: outOfStock ? 0.5 : 1 }}
              >
                <div className="aspect-square flex items-center justify-center" style={{ background: "#F1EEE2" }}>
                  {photo ? (
                    <img src={photo} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs" style={{ ...bodyFont, color: MUTED }}>No photo yet</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-base font-semibold leading-tight" style={{ ...displayFont, color: SAGE_DEEP }}>
                    {item.name}
                  </h3>
                  <p className="text-xs mt-0.5 capitalize" style={{ ...bodyFont, color: MUTED }}>
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium" style={{ ...bodyFont, color: GOLD }}>
                      ${item.rental_price} / event
                    </span>
                    <span className="text-[11px]" style={{ ...bodyFont, color: MUTED }}>
                      {outOfStock ? "Out of stock" : `${item.quantity_owned} available`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
