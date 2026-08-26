"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { SAGE, SAGE_DEEP, GOLD, CREAM, INK, LINE, MUTED, displayFont, scriptFont, bodyFont, ensureFonts } from "../lib/theme";

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="h-px w-10" style={{ background: GOLD }} />
      <Leaf size={14} color={GOLD} />
      <span className="h-px w-10" style={{ background: GOLD }} />
    </div>
  );
}

function firstPhoto(photos) {
  // `photos` is jsonb. Handles it whether it comes back as an array of URL
  // strings, an array of {url} objects, or is empty/null.
  if (!photos) return null;
  if (Array.isArray(photos) && photos.length > 0) {
    const first = photos[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  return null;
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
