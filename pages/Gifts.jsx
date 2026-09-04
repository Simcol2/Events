import React, { useEffect, useState } from "react";
import { ShoppingBag, Check, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { getItemFlags } from "../components/DecorCard";
import { GROWN_FOLKS_LOOT_BAGS } from "../cateringContent";

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

function GiftTile({ name, tagline, description, photo, price, inCart, onToggle }) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-[Jost] text-[10px] tracking-[0.2em] text-[#A69C7E]">PHOTO COMING SOON</span>
          </div>
        )}
      </div>
      <div className="px-1 pb-3 pt-4">
        <h3 className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-[1] text-[#4E5A44]">{name}</h3>
        {tagline && <p className="mt-1 font-[Jost] text-[11px] italic text-[#B8935A]">{tagline}</p>}
        {description && <p className="mt-2 font-[Jost] text-xs leading-5 text-[#5C5645]">{description}</p>}
        <div className="mt-3 flex items-center justify-between border-t border-[#E4DCC8] pt-3">
          <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">${price}</span>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 font-[Jost] text-[9px] font-semibold tracking-[0.14em]"
            style={{
              background: inCart ? "#4E5A44" : "transparent",
              color: inCart ? "#FFFFFF" : "#4E5A44",
              border: "1px solid #4E5A44",
            }}
          >
            {inCart ? <Check size={12} /> : <Plus size={12} />}
            {inCart ? "IN CART" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gifts() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, removeFromCart, isInCart, cartCount } = useCart();

  useEffect(() => {
    if (!supabase) {
      setError("The gift catalog isn't connected yet. Check back soon.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("items")
      .select("*")
      .eq("active", true)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setCatalog(data || []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const giftItems = catalog.filter((item) => {
    const { isPurchasable } = getItemFlags(item);
    if (!isPurchasable) return false;
    const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase().trim()) : [];
    return tags.includes("keepsakes & gifts");
  });

  const toggleCatalogGift = (item) => {
    if (isInCart(item.id, "catalog")) removeFromCart(item.id, "catalog");
    else addToCart(item.id, "catalog");
  };

  const toggleLootBag = (item) => {
    if (isInCart(item.id, "dessert")) removeFromCart(item.id, "dessert");
    else addToCart(item.id, "dessert");
  };

  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto flex max-w-7xl items-end justify-between px-5 pb-14 pt-20 sm:px-8">
          <div>
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em] text-[#B8935A]">GIFTS</p>
            <h1 className="mt-2 font-['Cormorant_Garamond'] text-5xl font-semibold text-[#4E5A44] sm:text-6xl">
              Something to give.
            </h1>
            <p className="mt-3 max-w-xl font-[Jost] text-sm leading-6 text-[#8C846F]">
              Purchase only, ready to hand someone and make their day. Everything here ships as-is, no rentals.
            </p>
          </div>
          <div className="hidden items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44] sm:flex">
            <ShoppingBag size={16} />
            CART ({cartCount})
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-3 flex items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44] sm:hidden">
          <ShoppingBag size={16} />
          CART ({cartCount})
        </div>

        <h2 className="mb-6 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Grown Folks Loot Bags</h2>
        <p className="mb-6 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
          Individually wrapped desserts, gift ready straight out of the box.
        </p>
        <div className="mb-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {GROWN_FOLKS_LOOT_BAGS.map((g) => (
            <GiftTile
              key={g.id}
              name={g.name}
              tagline={g.tagline}
              description={g.description}
              price={g.price}
              inCart={isInCart(g.id, "dessert")}
              onToggle={() => toggleLootBag(g)}
            />
          ))}
        </div>

        <h2 className="mb-6 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Keepsakes & Gifts</h2>
        {loading && <p className="py-10 text-center font-[Jost] text-sm text-[#A69C7E]">Curating the collection...</p>}
        {error && <p className="py-10 text-center font-[Jost] text-sm text-red-700">Couldn't load the collection: {error}</p>}
        {!loading && !error && giftItems.length === 0 && (
          <p className="py-10 text-center font-[Jost] text-sm text-[#A69C7E]">Nothing tagged yet, check back soon.</p>
        )}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {giftItems.map((item) => (
            <GiftTile
              key={item.id}
              name={item.name}
              description={item.description}
              photo={firstPhoto(item.photos)}
              price={item.purchase_price}
              inCart={isInCart(item.id, "catalog")}
              onToggle={() => toggleCatalogGift(item)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
