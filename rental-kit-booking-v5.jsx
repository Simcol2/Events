import React, { useState, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, X, Leaf, Plus, Sparkles } from "lucide-react";

// ---- MOCK DATA — replace with real inventory + DB-backed availability later ----
const KITS = [
  {
    id: "full-experience",
    name: "The Full Baby Shower Experience",
    tagline: "Beautifully curated. Stress free. Unforgettable.",
    pricePerDay: 350,
  },
  {
    id: "engagement-elegance",
    name: "The Engagement Elegance",
    tagline: "Refined decor for the toast heard round the room.",
    pricePerDay: 310,
  },
  {
    id: "sprinkle-starter",
    name: "The Sprinkle Starter",
    tagline: "A smaller gathering, still fully curated.",
    pricePerDay: 195,
  },
];

const GIFTS = [
  { id: "plush-bear", label: "Plush Keepsake Bear" },
  { id: "candle-set", label: "Scented Candle Set" },
  { id: "planted-gift", label: '"Something Is Growing" Mini Plant' },
  { id: "spa-card", label: "Spa Gift Card" },
];

const TABLECLOTHS = [
  { id: "sage", label: "Sage Green", swatch: "#6B7A5E" },
  { id: "ivory", label: "Ivory", swatch: "#F3EEDD" },
  { id: "champagne", label: "Champagne Gold", swatch: "#C9A96A" },
  { id: "blush", label: "Blush", swatch: "#E3C4B8" },
  { id: "sage-check", label: "Sage Gingham", swatch: "#8B9A7A" },
  { id: "terracotta", label: "Terracotta", swatch: "#B5654A" },
];

// ---- Shower activities — real copy. Short fields power the package builder;
// long fields power the standalone Shower Activities page. ----
const ACTIVITIES = [
  {
    id: "price-is-right",
    label: "The Price Is Right",
    tagline: "Think you know what babies cost?",
    subtitle: "How Well Do You Know Baby?",
    description:
      "Think you know what babies cost? Think again. From diapers and detergent to strollers and all the things Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points. Play individually or team up with friends. The person with the best shopping instincts wins. Come prepared to bid.",
  },
  {
    id: "photo-challenge",
    label: "The Photo Challenge",
    tagline: "Capture the moments Mom will want to remember.",
    subtitle: "Capture Mom's Big Day",
    description:
      "Your mission has been assigned. Each guest receives a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Once you've got the shot, scan the QR code and add it to the shared album. By the end of the shower, Mom has something better than a handful of posed pictures. She has a whole album of memories from the people who celebrated with her.",
  },
  {
    id: "maternity-shot-challenge",
    label: "The Maternity Shot Challenge",
    tagline: "Can you fake the bump?",
    subtitle: "Can You Fake the Bump?",
    description:
      "Grab a pillow. Strike a pose. Convince us you're expecting. Guests compete to create the most convincing, ridiculous, glamorous, or downright questionable maternity photo. Scan. Upload. Display. The photos appear on the big screen for everyone to see. Because apparently, looking pregnant is harder than it looks.",
  },
  {
    id: "baby-trivia",
    label: "Baby Trivia",
    tagline: "How well do you really know Mom and Dad?",
    subtitle: "How Well Do You Really Know Mom and Dad?",
    description:
      "You know them. You love them. But do you know them as parents? Put your knowledge to the test with a custom round of baby trivia filled with questions about Mom, Dad, their relationship, their baby, and the little details only their closest friends and family should know. Some questions will be easy. Some will absolutely expose you. May the person who actually pays attention win.",
  },
  {
    id: "naptime-relay",
    label: "Baby Naptime Relay",
    tagline: "Three stations. One sleepy baby.",
    subtitle: "Can You Get Baby to Sleep?",
    description:
      "You've got one baby. Three challenges. One mission: get that baby to sleep. Race through three stations: bottle chug, diaper change, and sing the lullaby. But there's a catch. Your lullaby is assigned to you. Sing it correctly to earn your points, finish the course as fast as possible, and prove that you have what it takes to survive bedtime. Fastest caregiver wins.",
    stations: ["Bottle Chug", "Diaper Change", "Sing the Lullaby"],
  },
];

// Guess the Arrival is a standalone tracker/website feature, not a same-day
// game, so it lives outside the ACTIVITIES toggle list and is included
// automatically rather than competing for a pick.
const GUESS_THE_ARRIVAL = {
  id: "guess-the-arrival",
  label: "Guess the Arrival",
  tagline: "Everyone has a prediction. Only one can be right.",
  subtitle: "When Will Baby Make Their Grand Entrance?",
  description:
    "The countdown is officially on. Enter your prediction for Baby's arrival date and time, then take your guess one step further. Who will Mom be with? Where will she be? What will she be doing when those first contractions hit? You can even leave a private message for Mom to read while she's waiting for Baby to arrive. And the best part: the guessing doesn't end at the shower. You'll receive updates when someone else's prediction comes true, and Mom can even send out false alarm and labour updates as the big day approaches. You can also guess Baby's name. May the best guesser win.",
};

const ADDONS = [
  { id: "extra-balloons", label: "Extra Balloon Garland", price: 25 },
  { id: "welcome-sign", label: "Custom Welcome Sign", price: 40 },
  { id: "extra-favors", label: "10 Extra Guest Favors", price: 30 },
  { id: "photo-backdrop", label: "Photo Backdrop Panel", price: 55 },
];

const HOW_IT_WORKS = [
  {
    title: "Pricing",
    body: "Every price you see is for the full event, not per day. There's no per-day math to do here, it's one price, one celebration.",
  },
  {
    title: "Pickup and Drop-off",
    body: "Pickup happens 24 hours before your event, and drop-off happens 24 hours after, both are already included in your price. Need it earlier, or want to hold onto it a little longer? That's available for an added fee, still being finalized.",
  },
  {
    title: "Customization",
    body: "Customization isn't just welcome here, it's encouraged. If there's a detail that means something to you, no matter how small it looks to anyone else, reach out. If it's within my capacity to build or source it, I'll do it.",
  },
  {
    title: "Damage Deposit",
    body: "Your damage deposit is only ever kept if something is actually damaged. General wear and tear is expected, just take photos and let me know if anything happens. Many of my pieces are handmade, so small variations between items are normal, not a defect.",
  },
];

// Mock booked-out dates per kit (YYYY-MM-DD). Swap for real availability query later.
const BOOKED = {
  "full-experience": ["2026-09-05", "2026-09-06", "2026-09-19"],
  "engagement-elegance": ["2026-09-12", "2026-09-13"],
  "sprinkle-starter": ["2026-09-05"],
};

// ---- Brand tokens, pulled from the reference flyer ----
const SAGE = "#6B7A5E";
const SAGE_DEEP = "#4E5A44";
const GOLD = "#B8935A";
const CREAM = "#FAF6ED";
const INK = "#3A342A";
const LINE = "#E4DCC8";
const MUTED = "#A69C7E";

const FONT_IMPORT_ID = "aslice-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Parisienne&family=Jost:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

const displayFont = { fontFamily: "'Cormorant Garamond', serif" };
const scriptFont = { fontFamily: "'Parisienne', cursive" };
const bodyFont = { fontFamily: "'Jost', sans-serif" };

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="h-px w-10" style={{ background: GOLD }} />
      <Leaf size={14} color={GOLD} />
      <span className="h-px w-10" style={{ background: GOLD }} />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs tracking-[0.25em] font-medium text-center mb-4" style={{ ...bodyFont, color: GOLD }}>
      {children}
    </p>
  );
}

function toISODate(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function Calendar({ kitId, selectedDate, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const booked = BOOKED[kitId] || [];

  const { weeks, monthLabel } = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { weeks, monthLabel };
  }, [viewYear, viewMonth]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const isPast = (d) => {
    const cellDate = new Date(viewYear, viewMonth, d);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < t;
  };

  return (
    <div className="rounded-sm border p-5" style={{ borderColor: LINE, background: "#FFFFFF" }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-[#F3EEE0]" aria-label="Previous month">
          <ChevronLeft size={18} color={SAGE_DEEP} />
        </button>
        <span className="font-semibold text-lg tracking-wide" style={{ ...displayFont, color: SAGE_DEEP }}>
          {monthLabel}
        </span>
        <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-[#F3EEE0]" aria-label="Next month">
          <ChevronRight size={18} color={SAGE_DEEP} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-medium tracking-widest text-[#B0A98C] py-1" style={bodyFont}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = toISODate(viewYear, viewMonth, d);
          const isBooked = booked.includes(iso);
          const disabled = isBooked || isPast(d);
          const isSelected = selectedDate === iso;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className="aspect-square rounded-full text-sm flex items-center justify-center transition-all disabled:cursor-not-allowed"
              style={{
                ...bodyFont,
                background: isSelected ? SAGE : "transparent",
                color: isSelected ? "#FFFFFF" : disabled ? "#D8D2BE" : INK,
                textDecoration: isBooked ? "line-through" : "none",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-[11px] font-medium" style={{ ...bodyFont, color: MUTED }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ border: "1px solid #D8D2BE" }} /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: SAGE }} /> Selected
        </span>
      </div>
    </div>
  );
}

function ChoiceCard({ selected, onClick, subtitle, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-sm px-4 py-3 transition-all flex items-center justify-between"
      style={{
        background: selected ? "#F1F4EC" : "#FFFFFF",
        border: selected ? `1.5px solid ${SAGE}` : `1px solid ${LINE}`,
      }}
    >
      <span>
        <span className="text-sm font-medium block" style={{ ...bodyFont, color: selected ? SAGE_DEEP : INK }}>
          {children}
        </span>
        {subtitle && (
          <span className="text-xs block mt-0.5" style={{ ...bodyFont, color: MUTED }}>
            {subtitle}
          </span>
        )}
      </span>
      {selected && <Check size={15} color={SAGE} />}
    </button>
  );
}

function ActivityDetailCard({ activity }) {
  return (
    <div className="rounded-sm p-6 mb-4" style={{ background: "#FFFFFF", border: `1px solid ${LINE}` }}>
      <p className="text-xs tracking-[0.2em] font-medium mb-1" style={{ ...bodyFont, color: GOLD }}>
        {activity.tagline}
      </p>
      <h3 className="text-2xl font-semibold mb-1" style={{ ...displayFont, color: SAGE_DEEP }}>
        {activity.label}
      </h3>
      <p className="text-sm italic mb-3" style={{ ...bodyFont, color: "#8A8268" }}>
        {activity.subtitle}
      </p>
      <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: "#5C5645" }}>
        {activity.description}
      </p>
      {activity.stations && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activity.stations.map((s) => (
            <span
              key={s}
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ ...bodyFont, background: "#F1F4EC", color: SAGE_DEEP }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RentalBooking() {
  ensureFonts();
  const [selectedKitId, setSelectedKitId] = useState(null);
  const [babyName, setBabyName] = useState("");
  const [giftId, setGiftId] = useState(null);
  const [tableclothId, setTableclothId] = useState(null);
  const [activityIds, setActivityIds] = useState([]);
  const [addonIds, setAddonIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stage, setStage] = useState("package"); // package -> design -> date
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [view, setView] = useState("booking"); // booking -> activities-page

  const selectedKit = KITS.find((k) => k.id === selectedKitId) || null;

  const toggleActivity = (id) =>
    setActivityIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const toggleAddon = (id) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const addonTotal = addonIds.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price || 0), 0);
  const total = (selectedKit?.pricePerDay || 0) + addonTotal;
  const designComplete = giftId && tableclothId && activityIds.length > 0;

  const chooseKit = (kit) => {
    // Returning to the SAME package (e.g. via "Change package" then picking it
    // again) preserves everything already designed. Only switching to a
    // DIFFERENT package clears the box, since those choices don't carry over.
    if (kit.id === selectedKitId) {
      setStage("design");
      return;
    }
    setSelectedKitId(kit.id);
    setBabyName("");
    setGiftId(null);
    setTableclothId(null);
    setActivityIds([]);
    setAddonIds([]);
    setSelectedDate(null);
    setStage("design");
  };

  const resetAll = () => {
    setSelectedKitId(null);
    setStage("package");
    setSelectedDate(null);
  };

  const stepNumber = stage === "package" ? 1 : stage === "design" ? 2 : 3;

  // ---- Standalone Shower Activities page ----
  if (view === "activities-page") {
    return (
      <div className="min-h-screen" style={{ background: CREAM, color: INK }}>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button
            onClick={() => setView("booking")}
            className="flex items-center gap-1 text-xs font-medium mb-8"
            style={{ ...bodyFont, color: MUTED }}
          >
            <ChevronLeft size={14} /> Back to reservations
          </button>

          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.35em] font-medium" style={{ ...bodyFont, color: GOLD }}>THE</p>
            <h1 className="text-5xl font-semibold tracking-tight -mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
              Shower Activities
            </h1>
            <Divider />
            <p className="italic text-2xl" style={scriptFont}>Choose your fun.</p>
          </div>

          {ACTIVITIES.map((a) => (
            <ActivityDetailCard key={a.id} activity={a} />
          ))}

          <div
            className="rounded-sm p-6 mb-4"
            style={{ background: "#F1F4EC", border: `1.5px solid ${SAGE}` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} color={SAGE} />
              <span className="text-[11px] tracking-[0.2em] font-medium" style={{ ...bodyFont, color: SAGE }}>
                INCLUDED WITH EVERY PACKAGE
              </span>
            </div>
            <ActivityDetailCard activity={GUESS_THE_ARRIVAL} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-2xl mx-auto px-6 py-12 pb-40">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs tracking-[0.35em] font-medium" style={{ ...bodyFont, color: GOLD }}>THE</p>
          <h1 className="text-5xl font-semibold tracking-tight -mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
            Reservations
          </h1>
          <p className="text-sm tracking-[0.2em] font-medium mt-1" style={{ ...bodyFont, color: SAGE }}>
            A SLICE OF G EVENTS
          </p>
          <Divider />
          <p className="italic text-2xl" style={scriptFont}>
            Curated showers, unforgettable memories.
          </p>
          <div className="flex items-center justify-center gap-5 mt-5">
            <button
              onClick={() => setHowItWorksOpen((v) => !v)}
              className="text-xs tracking-[0.2em] font-medium underline underline-offset-4"
              style={{ ...bodyFont, color: SAGE }}
            >
              {howItWorksOpen ? "HIDE HOW IT WORKS" : "HOW IT WORKS"}
            </button>
            <button
              onClick={() => setView("activities-page")}
              className="text-xs tracking-[0.2em] font-medium underline underline-offset-4"
              style={{ ...bodyFont, color: SAGE }}
            >
              SHOWER ACTIVITIES
            </button>
          </div>
        </div>

        {howItWorksOpen && (
          <div className="mt-6 rounded-sm p-6" style={{ background: "#FFFFFF", border: `1px solid ${LINE}` }}>
            {HOW_IT_WORKS.map((section, i) => (
              <div key={section.title} className={i > 0 ? "mt-5 pt-5" : ""} style={i > 0 ? { borderTop: `1px solid ${LINE}` } : {}}>
                <h4 className="text-lg font-semibold mb-1.5" style={{ ...displayFont, color: SAGE_DEEP }}>
                  {section.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: "#5C5645" }}>
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 my-10">
          {["Choose a package", "Design your box", "Choose your date"].map((label, i) => {
            const n = i + 1;
            const active = stepNumber === n;
            const done = stepNumber > n;
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                  style={{
                    ...bodyFont,
                    background: done || active ? SAGE : "transparent",
                    border: done || active ? "none" : "1px solid #D8D2BE",
                    color: done || active ? "#FFFFFF" : "#B0A98C",
                    fontWeight: 600,
                  }}
                >
                  {done ? <Check size={12} /> : n}
                </div>
                <span
                  className="text-[10px] sm:text-xs tracking-widest hidden sm:inline font-medium"
                  style={{ ...bodyFont, color: active ? SAGE_DEEP : "#B0A98C" }}
                >
                  {label.toUpperCase()}
                </span>
                {n < 3 && <span className="w-4 sm:w-6 h-px" style={{ background: "#D8D2BE" }} />}
              </div>
            );
          })}
        </div>

        {/* Stage: choose package */}
        {stage === "package" && (
          <div className="space-y-4">
            {KITS.map((kit) => (
              <button
                key={kit.id}
                onClick={() => chooseKit(kit)}
                className="w-full text-left rounded-sm p-6 transition-all"
                style={{ background: "#FFFFFF", border: `1px solid ${LINE}` }}
              >
                <h3 className="text-2xl font-semibold" style={{ ...displayFont, color: SAGE_DEEP }}>
                  {kit.name}
                </h3>
                <p className="text-sm italic mt-1" style={{ ...bodyFont, color: "#8A8268" }}>
                  {kit.tagline}
                </p>
                <p className="text-sm font-medium mt-3 tracking-wide" style={{ ...bodyFont, color: GOLD }}>
                  ${kit.pricePerDay} CAD per event
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Stage: design your box */}
        {stage === "design" && selectedKit && (
          <div>
            <button
              onClick={() => setStage("package")}
              className="flex items-center gap-1 text-xs font-medium mb-6"
              style={{ ...bodyFont, color: MUTED }}
            >
              <ChevronLeft size={14} /> Change package
            </button>

            <h2 className="text-3xl font-semibold text-center mb-1" style={{ ...displayFont, color: SAGE_DEEP }}>
              {selectedKit.name}
            </h2>
            <p className="text-center text-xs tracking-widest mb-8" style={{ ...bodyFont, color: MUTED }}>
              DESIGN YOUR BOX, EVERYTHING BELOW IS INCLUDED
            </p>

            {/* Personalization */}
            <SectionLabel>Personalize It</SectionLabel>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Baby name or name to feature on signage"
              className="w-full rounded-sm px-4 py-3 text-sm mb-10 outline-none"
              style={{ ...bodyFont, border: `1px solid ${LINE}`, background: "#FFFFFF", color: INK }}
            />

            {/* Gift */}
            <SectionLabel>Choose Your Gift</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {GIFTS.map((g) => (
                <ChoiceCard key={g.id} selected={giftId === g.id} onClick={() => setGiftId(g.id)}>
                  {g.label}
                </ChoiceCard>
              ))}
            </div>

            {/* Tablecloth */}
            <SectionLabel>Tablecloth Color</SectionLabel>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {TABLECLOTHS.map((t) => {
                const isActive = tableclothId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTableclothId(t.id)}
                    className="flex flex-col items-center gap-2 rounded-sm p-3 transition-all"
                    style={{ background: isActive ? "#F1F4EC" : "#FFFFFF", border: isActive ? `1.5px solid ${SAGE}` : `1px solid ${LINE}` }}
                  >
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: t.swatch, border: "2px solid white", boxShadow: "0 0 0 1px " + LINE }}
                    >
                      {isActive && <Check size={14} color="#FFFFFF" />}
                    </span>
                    <span className="text-[11px] text-center font-medium" style={{ ...bodyFont, color: isActive ? SAGE_DEEP : "#8A8268" }}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-center mb-10" style={{ ...bodyFont, color: MUTED }}>
              Swatches shown are placeholders — real linen photos load here once uploaded.
            </p>

            {/* Activities */}
            <SectionLabel>Choose Your Activities</SectionLabel>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {ACTIVITIES.map((a) => (
                <ChoiceCard key={a.id} selected={activityIds.includes(a.id)} onClick={() => toggleActivity(a.id)} subtitle={a.tagline}>
                  {a.label}
                </ChoiceCard>
              ))}
            </div>
            <button
              onClick={() => setView("activities-page")}
              className="text-xs underline underline-offset-4 font-medium mb-10 block"
              style={{ ...bodyFont, color: SAGE }}
            >
              See full activity descriptions
            </button>

            {/* Guess the Arrival — included, not a toggle */}
            <div className="rounded-sm p-4 mb-10 flex items-start gap-3" style={{ background: "#F1F4EC", border: `1px solid ${SAGE}` }}>
              <Sparkles size={16} color={SAGE} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs tracking-[0.15em] font-medium mb-1" style={{ ...bodyFont, color: SAGE }}>
                  INCLUDED WITH THIS PACKAGE
                </p>
                <p className="text-sm font-semibold" style={{ ...bodyFont, color: SAGE_DEEP }}>
                  {GUESS_THE_ARRIVAL.label}
                </p>
                <p className="text-xs mt-0.5" style={{ ...bodyFont, color: "#5C5645" }}>
                  {GUESS_THE_ARRIVAL.tagline}
                </p>
              </div>
            </div>

            {/* Add-ons */}
            <SectionLabel>Add-On Customizations</SectionLabel>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {ADDONS.map((a) => {
                const isActive = addonIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className="w-full text-left rounded-sm px-4 py-3 transition-all flex items-center justify-between"
                    style={{ background: isActive ? "#F1F4EC" : "#FFFFFF", border: isActive ? `1.5px solid ${GOLD}` : `1px solid ${LINE}` }}
                  >
                    <span className="text-sm font-medium flex items-center gap-2" style={{ ...bodyFont, color: isActive ? SAGE_DEEP : INK }}>
                      {isActive ? <Check size={15} color={GOLD} /> : <Plus size={15} color={MUTED} />}
                      {a.label}
                    </span>
                    <span className="text-xs font-medium" style={{ ...bodyFont, color: GOLD }}>+${a.price}</span>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!designComplete}
              onClick={() => setStage("date")}
              className="w-full mt-6 py-3 rounded-full text-xs tracking-widest font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...bodyFont, background: SAGE }}
            >
              {designComplete ? "CONTINUE TO DATE" : "CHOOSE A GIFT, COLOR & AT LEAST ONE ACTIVITY"}
            </button>
          </div>
        )}

        {/* Stage: date */}
        {stage === "date" && selectedKit && (
          <div>
            <button
              onClick={() => setStage("design")}
              className="flex items-center gap-1 text-xs font-medium mb-6"
              style={{ ...bodyFont, color: MUTED }}
            >
              <ChevronLeft size={14} /> Back to design
            </button>
            <SectionLabel>Choose Your Date</SectionLabel>
            <Calendar kitId={selectedKit.id} selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
        )}
      </div>

      {/* Sticky summary bar */}
      {selectedKit && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: "#FFFFFF", borderTop: `1px solid ${LINE}` }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ ...displayFont, color: SAGE_DEEP }}>
                {selectedKit.name}
              </div>
              <div className="text-xs tracking-wide truncate" style={{ ...bodyFont, color: MUTED }}>
                {stage === "date"
                  ? (selectedDate
                      ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                      : "No date selected yet")
                  : `${activityIds.length} activities · ${addonIds.length} add-ons`}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-right">
                <span className="block text-lg font-medium" style={{ ...displayFont, color: GOLD }}>
                  ${total}
                </span>
                <span className="block text-[9px] tracking-widest -mt-1" style={{ ...bodyFont, color: MUTED }}>
                  PER EVENT
                </span>
              </span>
              {stage === "date" && (
                <button
                  disabled={!selectedDate}
                  className="px-6 py-2.5 rounded-full text-xs tracking-widest font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ ...bodyFont, background: SAGE }}
                >
                  CONTINUE
                </button>
              )}
              <button onClick={resetAll} className="p-2 rounded-full hover:bg-[#F3EEE0]" aria-label="Clear selection">
                <X size={16} color="#B0A98C" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
