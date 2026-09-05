import React, { useEffect, useState } from "react";
import { ShoppingBag, Check, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { getItemFlags } from "../components/DecorCard";
import CustomizableGiftModal from "../components/CustomizableGiftModal";
import { GROWN_FOLKS_LOOT_BAGS } from "../cateringContent";
import { KEEPSAKES, resolveKeepsakeName } from "../packageContent";
import { useEventType } from "../EventTypeContext";

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

// `onCustomize`, when passed, replaces the ADD TO CART / IN CART toggle
// with a single CUSTOMIZE button - a customizable gift isn't a boolean
// on/off pick, each customization is its own cart line (see
// CustomizableGiftModal), so there's no single "in cart" state to show.
function GiftTile({ name, tagline, description, photo, price, priceLabel, inCart, onToggle, onCustomize }) {
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
          <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">
            {priceLabel || `$${price}`}
          </span>
          {onCustomize ? (
            <button
              onClick={onCustomize}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 font-[Jost] text-[9px] font-semibold tracking-[0.14em]"
              style={{ background: "transparent", color: "#4E5A44", border: "1px solid #4E5A44" }}
            >
              CUSTOMIZE
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function Gifts({ navigate }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gifts, setGifts] = useState([]);
  const [giftsError, setGiftsError] = useState("");
  const [customizing, setCustomizing] = useState(null); // gift row | null
  const { addToCart, removeFromCart, isInCart, cartCount } = useCart();
  const { eventTypeId } = useEventType();

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

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("gifts")
      .select("*")
      .eq("active", true)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setGiftsError(error.message);
        else setGifts(data || []);
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

  const handleAddCustomGift = (meta) => {
    if (!customizing) return;
    addToCart(customizing.id, "gift", meta);
    setCustomizing(null);
  };

  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em] text-[#B8935A]">GIFTS</p>
              <h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-[1.05] text-[#4E5A44] sm:text-[42px]">
                Keepsakes and gifts worth taking home.
              </h1>
              <p className="mt-3 max-w-xl font-[Jost] text-sm leading-6 text-[#8C846F]">
                Guest gifts, favors, and one-off keepsakes ready to add to your event or send someone special.
              </p>
            </div>
            <div className="hidden items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44] sm:flex">
              <ShoppingBag size={16} />
              CART ({cartCount})
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="mb-6 flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44]">
            <ShoppingBag size={16} />
            CART ({cartCount})
          </div>
        </div>

        <h2 className="mb-2 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Guest Gifts</h2>
        <p className="mb-6 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
          Send your guests home with a little something to remember the day by. Every experience includes a guest
          gift, choose which one when you build your experience.
        </p>
        <div className="mb-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {KEEPSAKES.map((k) => {
            const name = resolveKeepsakeName(k, eventTypeId);
            return (
              <div key={k.id} className="overflow-hidden bg-white">
                <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
                  {k.photoUrl ? (
                    <img src={k.photoUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-[Jost] text-[10px] tracking-[0.2em] text-[#A69C7E]">PHOTO COMING SOON</span>
                    </div>
                  )}
                </div>
                <div className="px-1 pb-3 pt-4">
                  <h3 className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-[1] text-[#4E5A44]">{name}</h3>
                  <p className="mt-1 font-[Jost] text-[11px] italic text-[#B8935A]">{k.tagline}</p>
                  <p className="mt-2 font-[Jost] text-xs leading-5 text-[#5C5645]">{k.description}</p>
                  <p className="mt-2 font-[Jost] text-[10px] leading-4 text-[#A69C7E]">
                    Included for your first {k.includedGuestCount} guests, then ${k.overagePricePerGuest}/guest after that.
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E4DCC8] pt-3">
                    <span className="font-[Jost] text-[11px] font-medium tracking-[0.08em] text-[#B8935A]">
                      {k.upgradePrice > 0 ? `+$${k.upgradePrice} upgrade` : "Included"}
                    </span>
                    <button
                      onClick={() => navigate("/package-builder")}
                      className="flex items-center gap-1.5 rounded-full border border-[#4E5A44] px-4 py-2 font-[Jost] text-[9px] font-semibold tracking-[0.14em] text-[#4E5A44]"
                    >
                      BUILD MY EXPERIENCE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {gifts.length > 0 && (
          <>
            <h2 className="mb-6 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Just for You</h2>
            <p className="mb-6 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
              One-off keepsakes and gifts, ready to buy on their own, whether or not you're building an experience.
            </p>
            <div className="mb-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {gifts.map((g) => (
                <GiftTile
                  key={g.id}
                  name={g.name}
                  tagline={g.tagline}
                  description={g.description}
                  photo={firstPhoto(g.photos)}
                  priceLabel={g.customizable ? `FROM $${g.price}` : `$${g.price}`}
                  onCustomize={g.customizable ? () => setCustomizing(g) : undefined}
                  inCart={!g.customizable && isInCart(g.id, "gift")}
                  onToggle={
                    g.customizable
                      ? undefined
                      : () => (isInCart(g.id, "gift") ? removeFromCart(g.id, "gift") : addToCart(g.id, "gift"))
                  }
                />
              ))}
            </div>
          </>
        )}
        {giftsError && <p className="mb-14 font-[Jost] text-sm text-red-700">Couldn't load gifts: {giftsError}</p>}

        <h2 className="mb-6 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Grown Folks Loot Bags</h2>
        <p className="mb-6 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
          Individually wrapped desserts, gift ready straight out of the box. Buying one for someone special? These
          are it. Want them for every guest at your event instead, that's the Grown Folks Loot Bags guest gift above.
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

      {customizing && (
        <CustomizableGiftModal
          gift={customizing}
          onClose={() => setCustomizing(null)}
          onAdd={handleAddCustomGift}
        />
      )}
    </div>
  );
}
