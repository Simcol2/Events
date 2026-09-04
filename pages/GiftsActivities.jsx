import React, { useEffect, useState } from "react";
import { ShoppingBag, Check, Plus, ArrowUpRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { getItemFlags } from "../components/DecorCard";
import { GROWN_FOLKS_LOOT_BAGS } from "../cateringContent";
import { KEEPSAKES } from "../packageContent";
import pictureThisPhoto from "../media/picturethis.png";
import lilRootsPhoto from "../media/lilroots.png";

// Crossfades between a shot of the Picture This activity and the Lil Roots
// guest gift, since this page covers both halves of the business. Each
// photo gets its own focal point since the Lil Roots jar's label sits low
// in the frame and gets lost under a plain center crop.
const HERO_PHOTOS = [
  { src: pictureThisPhoto, alt: "Picture This guest activity", focus: "center" },
  { src: lilRootsPhoto, alt: "Lil Roots guest gift", focus: "center 78%" },
];

const ACTIVITIES = [
  {
    label: "The Price Is Right",
    tagline: "Think you know what babies cost?",
    subtitle: "How Well Do You Know Baby?",
    description: "From diapers and detergent to strollers and all the things Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points. Play individually or team up with friends.",
  },
  {
    label: "The Photo Challenge",
    tagline: "Capture the moments Mom will want to remember.",
    subtitle: "Capture Mom's Big Day",
    description: "Each guest receives a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the shower, Mom has a whole album of memories from the people who celebrated with her.",
  },
  {
    label: "The Maternity Shot Challenge",
    tagline: "Can you fake the bump?",
    subtitle: "Can You Fake the Bump?",
    description: "Grab a pillow. Strike a pose. Convince us you're expecting. Guests compete to create the most convincing, ridiculous, glamorous or downright questionable maternity photo. Scan. Upload. Display. The photos appear on the big screen for everyone to see.",
  },
  {
    label: "Baby Trivia",
    tagline: "How well do you really know Mom and Dad?",
    subtitle: "How Well Do You Really Know Mom and Dad?",
    description: "A custom round of baby trivia filled with questions about Mom, Dad, their relationship, their baby and the little details only their closest friends and family should know. Some questions will be easy. Some will absolutely expose you.",
  },
  {
    label: "Baby Naptime Relay",
    tagline: "Three stations. One sleepy baby.",
    subtitle: "Can You Get Baby to Sleep?",
    description: "Race through three stations: bottle chug, diaper change and sing the lullaby. Your lullaby is assigned to you. Sing it correctly to earn your points, finish the course as fast as possible, and prove that you have what it takes to survive bedtime. Fastest caregiver wins.",
    stations: ["Bottle Chug", "Diaper Change", "Sing the Lullaby"],
  },
  {
    label: "Guess the Arrival",
    tagline: "Everyone has a prediction. Only one can be right.",
    subtitle: "When Will Baby Make Their Grand Entrance?",
    description: "Guests enter their prediction for Baby's arrival date and time, guess Baby's name and leave a special private message for Mom. The experience continues after the shower with prediction updates, labour notifications and false alarms as the big day approaches.",
  },
];

function ActivityRow({ activity, number, featured = false }) {
  return (
    <article className={`group relative border-t border-[#DCD2BC] py-8 ${featured ? "bg-[#F0F3EA] px-6 sm:px-8" : ""}`}>
      <div className="grid gap-5 md:grid-cols-[70px_1fr_auto] md:items-start md:gap-8">
        <div className="font-[Cormorant_Garamond] text-4xl font-medium text-[#B8935A]">
          {String(number).padStart(2, "0")}
        </div>
        <div>
          <div className="font-[Jost] text-[9px] font-semibold tracking-[0.22em] text-[#B8935A]">
            {activity.tagline}
          </div>
          <h3 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-none text-[#4E5A44]">
            {activity.label}
          </h3>
          <div className="mt-2 font-['Cormorant_Garamond'] text-xl italic text-[#817A68]">
            {activity.subtitle}
          </div>
          <p className="mt-4 max-w-2xl font-[Jost] text-sm leading-7 text-[#5C5645]">
            {activity.description}
          </p>
          {activity.stations && (
            <div className="mt-5 flex flex-wrap gap-2">
              {activity.stations.map((station) => (
                <span key={station} className="border border-[#CFC7B1] px-3 py-1.5 font-[Jost] text-[9px] tracking-[0.12em] text-[#68775F]">
                  {station.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArrowUpRight size={18} strokeWidth={1.2} className="text-[#B8935A] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </article>
  );
}

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

export default function GiftsActivities({ navigate }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, removeFromCart, isInCart, cartCount } = useCart();

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_PHOTOS.length);
    }, 4500);
    return () => clearInterval(id);
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
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[520px] sm:w-2/3">
            {HERO_PHOTOS.map((photo, i) => (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === heroIndex ? 1 : 0, objectPosition: photo.focus }}
              />
            ))}
          </div>
          <div className="flex w-full flex-col justify-center px-5 py-10 sm:w-1/3 sm:px-8">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em] text-[#B8935A]">GIFTS & ACTIVITIES</p>
            <h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-[1.05] text-[#4E5A44] sm:text-[42px]">
              Games they'll play. Gifts they'll keep.
            </h1>
            <p className="mt-3 font-[Jost] text-sm leading-6 text-[#8C846F]">
              Interactive activities that get every guest laughing and talking, plus keepsakes and gifts worth taking home. Everything on this page is ready to add to your event, right below.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">SHOWER ACTIVITIES</div>
          <div className="font-[Jost] text-[10px] tracking-[0.12em] text-[#A69C7E]">CUSTOMIZABLE FOR YOUR EVENT</div>
        </div>

        <div>
          {ACTIVITIES.map((activity, index) => (
            <ActivityRow
              key={activity.label}
              activity={activity}
              number={index + 1}
              featured={index === ACTIVITIES.length - 1}
            />
          ))}
        </div>

        <div className="mt-10 bg-[#4E5A44] px-7 py-10 text-center sm:px-12">
          <div className="font-[Parisienne] text-4xl text-[#D4BC91]">make it yours</div>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold text-[#FAF6ED]">Build your celebration.</h2>
          <p className="mx-auto mt-3 max-w-lg font-[Jost] text-sm leading-7 text-[#DAD7C9]">
            Choose the activities that fit your crowd and let the rest of the package do the work.
          </p>
          <button onClick={() => navigate("/package-builder")} className="mt-6 border border-[#D4BC91] px-6 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white">
            VIEW PACKAGES
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-[#E4DCC8] px-5 py-14 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">GIFTS</div>
          <div className="flex items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44]">
            <ShoppingBag size={16} />
            CART ({cartCount})
          </div>
        </div>

        <h2 className="mb-2 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Guest Gifts</h2>
        <p className="mb-6 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
          Every package includes a guest gift. Each option has its own included guest count, choose which one when you build your package.
        </p>
        <div className="mb-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {KEEPSAKES.map((k) => (
            <div key={k.id} className="overflow-hidden bg-white">
              <div className="relative aspect-[4/4.6] overflow-hidden bg-[#EEE9DC]">
                {k.photoUrl ? (
                  <img src={k.photoUrl} alt={k.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-[Jost] text-[10px] tracking-[0.2em] text-[#A69C7E]">PHOTO COMING SOON</span>
                  </div>
                )}
              </div>
              <div className="px-1 pb-3 pt-4">
                <h3 className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-[1] text-[#4E5A44]">{k.name}</h3>
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
          ))}
        </div>

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
    </div>
  );
}
