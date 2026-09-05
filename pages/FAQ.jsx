import React, { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { usePalette } from "../PaletteContext";

// Section 35: every FAQ answer given here verbatim from the Master Plan.
const FAQS = [
  {
    q: "Do the experiences change based on my event?",
    a: "Yes. Choose your event first and we'll show you the experiences designed for that celebration.",
  },
  {
    q: "Is this a rental package?",
    a: "You're building an interactive experience. The pieces are designed to be used during your celebration and, where applicable, become keepsakes afterward.",
  },
  {
    q: "What does Self Setup mean?",
    a: "Your experience is prepared and ready for you to place and arrange. Self Setup is intended for Toronto pickup or Toronto drop-off. Contact us if you need delivery.",
  },
  {
    q: "What does the Event Stylist do?",
    a: "You don't lift a finger. We bring everything, set it up, style it, make sure every detail is ready, and take it all back when the celebration is over.",
  },
  {
    q: "Can I have the Event Stylist and a professionally styled Memory Display?",
    a: "Yes. They are separate choices, so you can select the service level you want for each.",
  },
  {
    q: "Does Picture This include audio?",
    a: "No. Picture This includes photos and handwritten notes. Audio or voice messages are a separate upgrade.",
  },
  {
    q: "Are games included?",
    a: "Baby Shower builds include Play & Connect experiences. For Engagement, Birthday, Holiday, and Special Moment builds, games are optional add-ons.",
  },
  {
    q: "Can I add another keepsake experience?",
    a: "Yes. Add an Additional Keepsake Experience for +$125.",
  },
  {
    q: "What is the difference between an Additional Keepsake Experience and a Playful Add-On?",
    a: "An Additional Keepsake Experience adds another memory-making experience. A Playful Add-On adds a game designed to get guests talking, laughing, and competing.",
  },
  {
    q: "Is Kindness Station available for engagement and other events?",
    a: "Yes. Kindness Station is available across event types and is framed around the people being celebrated.",
  },
];

function FAQItem({ item, palette, fonts }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: palette.line }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold sm:text-lg" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          color={palette.muted}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms ease", flexShrink: 0 }}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const { palette, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          FREQUENTLY ASKED QUESTIONS
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          You bring the people. We create the experience.
        </h1>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        {FAQS.map((item) => (
          <FAQItem key={item.q} item={item} palette={palette} fonts={fonts} />
        ))}
      </div>
    </div>
  );
}
