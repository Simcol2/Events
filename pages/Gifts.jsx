import React, { useEffect, useMemo, useState } from "react";
import { Check, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { getItemFlags, groupByVariant, parseItemTags, plainDescription } from "../components/DecorCard";
import DecorDetailModal from "../components/DecorDetailModal";
import CustomizableGiftModal from "../components/CustomizableGiftModal";
import CartModal from "../components/CartModal";
import PhotoCarousel, { normalizePhotos } from "../components/PhotoCarousel";
import { KEEPSAKES, resolveKeepsakeName } from "../packageContent";
import { useEventType } from "../EventTypeContext";
import { usePalette } from "../PaletteContext";
import { giftAltText } from "../seo";
import {
  ElevatedCard,
  JewelBand,
  PageHero,
  PrimaryButton,
  Reveal,
  SectionIntro,
  editorialShadow,
  paperTexture,
  rgba,
} from "../components/EditorialKit";

// The wrap/stationery and keepsakes/gifts catalog rows share one filtered
// grid below, matching the category-picker pattern already used on the
// Decor page. "gift wrap" and "keepsakes & gifts" are the sheet's own
// broad tags (relied on elsewhere - the Decor page's category tiles, the
// purchase-only rule); "gifts" is a second tag added specifically for this
// menu so items can carry both without disturbing what already reads
// those broader tags.
const GIFT_CATEGORIES = [
  { id: "all", label: "View All" },
  { id: "gifts", label: "Gifts" },
  { id: "holiday cards", label: "Holiday Cards" },
  { id: "nostalgia cards", label: "Nostalgia Cards" },
  { id: "birthday cards", label: "Birthday Cards" },
  { id: "card packs", label: "Card Packs" },
  { id: "gift tags", label: "Gift Tags" },
  { id: "gift wrap", label: "Gift Wrap" },
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function GiftTile({
  name,
  tagline,
  description,
  photos,
  price,
  priceLabel,
  inCart,
  onToggle,
  onCustomize,
  onView,
  showViewOptions,
  palette,
  fonts,
}) {
  return (
    <ElevatedCard
      palette={palette}
      className={`group h-full overflow-hidden ${onView ? "cursor-pointer" : ""}`}
      onClick={onView}
    >
      <div className="relative aspect-[4/4.6] overflow-hidden" style={{ background: rgba(palette.primary, 0.06) }}>
        {normalizePhotos(photos).length ? (
          <PhotoCarousel
            photos={photos}
            alt={giftAltText(name)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
                fontSize: "12px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Photo coming soon
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-[235px] flex-col p-6">
        <h3
          style={{
            ...fonts.displayFont,
            color: palette.primaryDeep,
            fontSize: "1.65rem",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {name}
        </h3>

        {tagline && (
          <p className="mt-2 text-sm italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            {tagline}
          </p>
        )}

        {description && (
          <p
            className="mt-3 text-sm leading-6"
            style={{
              ...fonts.bodyFont,
              color: palette.muted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {plainDescription(description)}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 border-t pt-5" style={{ borderColor: palette.line }}>
          <span
            style={{
              ...fonts.bodyFont,
              color: palette.goldDeep,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {priceLabel || (price != null ? `$${price}` : "Contact for pricing")}
          </span>

          {showViewOptions ? (
            <span
              className="text-xs font-semibold tracking-[0.1em]"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, textTransform: "uppercase" }}
            >
              View options
            </span>
          ) : price == null && !priceLabel && !onCustomize ? null : onCustomize ? (
            <button
              onClick={onCustomize}
              className="rounded-full px-4 py-2 text-xs font-semibold tracking-[0.1em]"
              style={{
                ...fonts.bodyFont,
                color: palette.primaryDeep,
                border: `1px solid ${palette.primaryDeep}`,
                textTransform: "uppercase",
              }}
            >
              Select card
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.1em]"
              style={{
                ...fonts.bodyFont,
                background: inCart ? palette.primaryDeep : "transparent",
                color: inCart ? "#FFFFFF" : palette.primaryDeep,
                border: `1px solid ${palette.primaryDeep}`,
                textTransform: "uppercase",
              }}
            >
              {inCart ? <Check size={12} /> : <Plus size={12} />}
              {inCart ? "In cart" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </ElevatedCard>
  );
}

export default function Gifts() {
  const { palette, fonts } = usePalette();
  const { eventTypeId, openPickerForBuilder } = useEventType();
  const { addToCart, removeFromCart, isInCart, cartCount, clearCart } = useCart();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gifts, setGifts] = useState([]);
  const [giftsError, setGiftsError] = useState("");
  const [customizing, setCustomizing] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [selectedGiftCategory, setSelectedGiftCategory] = useState("all");

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status !== "success" && status !== "cancelled") return;
    setCheckoutStatus(status);
    if (status === "success") clearCart();
    window.history.replaceState({}, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Some standalone gifts read as a natural pair with a specific keepsake
  // or catalog section rather than their own generic grid, so they're
  // pulled out of `gifts` and rendered inside those sections instead.
  const gRingGift = gifts.find((g) => g.name === "G Ring Gift");
  const popUpCards = gifts.find((g) => g.name === "Pop Up Nostalgia Cards");
  const otherGifts = gifts.filter((g) => g.id !== gRingGift?.id && g.id !== popUpCards?.id);

  const giftTileProps = (g) => ({
    name: g.name,
    tagline: g.tagline,
    description: g.description,
    photos: g.photos,
    priceLabel: g.customizable ? `From $${g.price}` : `$${g.price}`,
    onCustomize: g.customizable ? () => setCustomizing(g) : undefined,
    inCart: !g.customizable && isInCart(g.id, "gift"),
    onToggle: g.customizable
      ? undefined
      : () => (isInCart(g.id, "gift") ? removeFromCart(g.id, "gift") : addToCart(g.id, "gift")),
  });

  const giftItems = catalog.filter((item) => {
    const { isPurchasable } = getItemFlags(item);
    if (!isPurchasable) return false;

    const tags = parseItemTags(item).map((t) => t.toLowerCase().trim());
    return tags.includes("keepsakes & gifts");
  });

  const wrapAndStationeryItems = catalog.filter((item) => {
    const tags = parseItemTags(item).map((t) => t.toLowerCase().trim());
    return tags.includes("gift wrap") || tags.includes("stationery");
  });

  // Gift wrap and Keepsakes & Gifts share one filtered grid, browsed by
  // the category menu below rather than as two separate hardcoded
  // sections. An item can only ever come from one of the two arrays
  // above (their sheet tags don't overlap today), so a plain concat
  // never double-lists anything.
  const wrapAndGiftItems = [...wrapAndStationeryItems, ...giftItems];

  const giftCategoryCounts = useMemo(() => {
    const counts = {};
    const units = groupByVariant(wrapAndGiftItems);
    for (const unit of units) {
      const tags = parseItemTags(unit.item).map(normalize);
      for (const cat of GIFT_CATEGORIES) {
        if (cat.id === "all" || tags.includes(cat.id)) counts[cat.id] = (counts[cat.id] || 0) + 1;
      }
    }
    // Pop Up Nostalgia Cards lives in the separate `gifts` table, not the
    // catalog `items` grouped above, so it's counted in by hand.
    if (popUpCards) {
      counts.all = (counts.all || 0) + 1;
      counts["nostalgia cards"] = (counts["nostalgia cards"] || 0) + 1;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, popUpCards]);

  const filteredWrapAndGiftItems = useMemo(() => {
    if (selectedGiftCategory === "all") return wrapAndGiftItems;
    return wrapAndGiftItems.filter((item) => parseItemTags(item).map(normalize).includes(selectedGiftCategory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, selectedGiftCategory]);

  // Pack sizes, color choices and size/treat options share a variant_group,
  // so they collapse into one card showing the lowest price. Picking the
  // option happens in the detail view, same as the decor catalogue.
  const giftGroups = groupByVariant(filteredWrapAndGiftItems);

  // Every catalog tile opens the detail view on click, grouped or not,
  // so the two catalogue pages behave identically.
  const catalogTileProps = (entry) =>
    entry.variants
      ? {
          name: entry.groupName,
          description: entry.item.description,
          photos: entry.item.photos,
          priceLabel: `From $${Math.min(...entry.variants.map((v) => Number(v.purchase_price)))}`,
          showViewOptions: true,
          onView: () => setDetailItem(entry),
        }
      : {
          name: entry.item.name,
          description: entry.item.description,
          photos: entry.item.photos,
          price: entry.item.purchase_price,
          inCart: isInCart(entry.item.id, "catalog"),
          onToggle: () => toggleCatalogGift(entry.item),
          onView: () => setDetailItem(entry),
        };

  const toggleCatalogGift = (item) => {
    if (isInCart(item.id, "catalog")) removeFromCart(item.id, "catalog");
    else addToCart(item.id, "catalog");
  };

  const handleAddCustomGift = (meta) => {
    if (!customizing) return;
    addToCart(customizing.id, "gift", meta);
    setCustomizing(null);
  };

  return (
    <main style={{ ...paperTexture(palette), color: palette.ink }}>
      <PageHero
        eyebrow="GIFTS & KEEPSAKES"
        title="The games are played. The memories are made."
        script="Take a lil something for the road."
        body="Guest gifts, favours, stationery and one-off keepsakes that can be added to an experience or purchased on their own."
        palette={palette}
        fonts={fonts}
        align="center"
      >
        <button
          onClick={() => setShowCart(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold tracking-[0.1em]"
          style={{
            ...fonts.bodyFont,
            background: palette.primaryDeep,
            color: "#FFFFFF",
            textTransform: "uppercase",
          }}
        >
          <ShoppingBag size={15} />
          Cart ({cartCount})
        </button>
      </PageHero>

      {checkoutStatus && (
        <section className="mx-auto max-w-7xl px-5 pt-7 sm:px-8">
          <ElevatedCard palette={palette} className="px-5 py-4">
            <p style={{ ...fonts.bodyFont, color: checkoutStatus === "success" ? palette.primaryDeep : palette.muted }}>
              {checkoutStatus === "success"
                ? "Thank you, your payment went through. We'll follow up by email with the details."
                : "Checkout was cancelled, your cart is still here whenever you're ready."}
            </p>
          </ElevatedCard>
        </section>
      )}

      <section style={{ ...paperTexture(palette), padding: "88px 24px 100px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="GUEST GIFTS"
            title="A small thing can still feel thoughtful."
            body="Buy these individually, whether or not you are building a full event experience. Every experience package also includes a guest gift choice."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-3">
            {KEEPSAKES.map((k, i) => {
              const name = resolveKeepsakeName(k, eventTypeId);
              const photos = k.photoUrls || (k.photoUrl ? [k.photoUrl] : []);
              const inCart = isInCart(k.id, "keepsake");

              return (
                <Reveal key={k.id} delay={i * 55}>
                  <GiftTile
                    name={name}
                    tagline={k.tagline}
                    description={k.description}
                    photos={photos}
                    priceLabel={`$${k.standalonePrice} each`}
                    inCart={inCart}
                    onToggle={() =>
                      inCart
                        ? removeFromCart(k.id, "keepsake")
                        : addToCart(k.id, "keepsake")
                    }
                    palette={palette}
                    fonts={fonts}
                  />
                </Reveal>
              );
            })}
            {gRingGift && (
              <Reveal delay={KEEPSAKES.length * 55}>
                <GiftTile {...giftTileProps(gRingGift)} palette={palette} fonts={fonts} />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {otherGifts.length > 0 && (
        <JewelBand palette={palette} glass style={{ padding: "94px 24px" }}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="JUST FOR YOU"
              title="Gifts that do not need an occasion to earn their keep."
              body="One-off keepsakes and customizable gifts ready to buy on their own."
              palette={palette}
              fonts={fonts}
              light
            />

            <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-3">
              {otherGifts.map((g, i) => (
                <Reveal key={g.id} delay={i * 55}>
                  <GiftTile {...giftTileProps(g)} palette={palette} fonts={fonts} />
                </Reveal>
              ))}
            </div>
          </div>
        </JewelBand>
      )}

      <section style={{ ...paperTexture(palette), padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="GIFTS & GIFT WRAP"
            title="Everything to wrap it, write it and gift it."
            body="Cards, gift wrap, stationery and keepsakes, filtered by what you're actually shopping for."
            palette={palette}
            fonts={fonts}
            align="left"
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {GIFT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedGiftCategory(cat.id)}
                className="rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em]"
                style={{
                  ...fonts.bodyFont,
                  background: selectedGiftCategory === cat.id ? palette.primaryDeep : palette.surface,
                  color: selectedGiftCategory === cat.id ? "#FFFFFF" : palette.primaryDeep,
                  border: `1px solid ${selectedGiftCategory === cat.id ? palette.primaryDeep : palette.line}`,
                  textTransform: "uppercase",
                }}
              >
                {cat.label}
                {cat.id !== "all" ? ` (${giftCategoryCounts[cat.id] || 0})` : ""}
              </button>
            ))}
          </div>

          <div className="mt-12">
            {loading && (
              <p className="py-12 text-center" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Curating the collection...
              </p>
            )}

            {error && (
              <p className="py-12 text-center text-red-700" style={fonts.bodyFont}>
                Couldn't load the collection: {error}
              </p>
            )}

            {!loading &&
              !error &&
              giftGroups.length === 0 &&
              !(popUpCards && (selectedGiftCategory === "all" || selectedGiftCategory === "nostalgia cards")) && (
                <p className="py-12 text-center" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  Nothing in this category yet, check back soon.
                </p>
              )}

            <div className="grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-3">
              {giftGroups.map((entry) => (
                <GiftTile key={entry.key} {...catalogTileProps(entry)} palette={palette} fonts={fonts} />
              ))}
              {popUpCards && (selectedGiftCategory === "all" || selectedGiftCategory === "nostalgia cards") && (
                <GiftTile {...giftTileProps(popUpCards)} palette={palette} fonts={fonts} />
              )}
            </div>
          </div>

          <div className="mt-20 text-center">
            <Sparkles className="mx-auto" size={18} color={palette.goldDeep} />
            <h2
              className="mx-auto mt-4 max-w-3xl"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.5rem, 4.6vw, 4rem)",
                lineHeight: 1,
                fontWeight: 630,
              }}
            >
              Want the gift to be part of the whole experience?
            </h2>
            <div className="mt-7">
              <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
                Build my experience
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {giftsError && (
        <div className="mx-auto max-w-7xl px-5 pb-12 text-red-700" style={fonts.bodyFont}>
          Couldn't load gifts: {giftsError}
        </div>
      )}

      {customizing && (
        <CustomizableGiftModal
          gift={customizing}
          onClose={() => setCustomizing(null)}
          onAdd={handleAddCustomGift}
        />
      )}

      {detailItem && (
        <DecorDetailModal
          item={detailItem.item}
          variants={detailItem.variants}
          groupName={detailItem.groupName}
          onClose={() => setDetailItem(null)}
          onBuy={(picked) => {
            addToCart(picked.id, "catalog");
            setDetailItem(null);
          }}
        />
      )}

      {showCart && (
        <CartModal
          catalog={catalog}
          gifts={gifts}
          onClose={() => setShowCart(false)}
        />
      )}
    </main>
  );
}
