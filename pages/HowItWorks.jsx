import React from "react";
import {
  CalendarHeart,
  PackageCheck,
  Users,
  Gift,
  Sparkles,
  Truck,
  Frame,
  PartyPopper,
  Send,
} from "lucide-react";
import { usePalette } from "../PaletteContext";

// Section 34: answers the required questions quickly, built around the
// core message "You bring the people. We create the experience."
const QUESTIONS = [
  {
    icon: Sparkles,
    q: "What is an A Slice of G experience?",
    a: "Interactive event experiences that become keepsakes. Guests participate, contribute, and create something meaningful during the celebration, and you get to keep what they made.",
  },
  {
    icon: CalendarHeart,
    q: "How does the experience change by event type?",
    a: "Choose your event first, Baby Shower, Engagement Party, Birthday, Holiday, or Special Moment, and the experiences, pricing, and guest gift you see are designed specifically for it.",
  },
  {
    icon: PackageCheck,
    q: "What happens at the event?",
    a: "Your selected experiences arrive prepared and ready. Throughout the celebration, guests play, write, photograph, and create using them.",
  },
  {
    icon: Users,
    q: "What do guests actually do?",
    a: "Depending on the experiences you choose, they play games, write notes, take photos, assemble puzzles, and leave messages and predictions behind.",
  },
  {
    icon: Gift,
    q: "What do I get to keep?",
    a: "The keepsakes your guests create together: photos and notes, a finished storybook, assembled artwork, a filled time capsule, and more.",
  },
  {
    icon: Truck,
    q: "How do I receive everything?",
    a: "Self Setup is for Toronto pickup or Toronto drop-off. Need delivery? Please contact us.",
  },
  {
    icon: PackageCheck,
    q: "What does Self Setup mean?",
    a: "Everything arrives prepared and ready for you to place and arrange yourself.",
  },
  {
    icon: Sparkles,
    q: "What does an Event Stylist do?",
    a: "You don't lift a finger. We bring everything, set it up, style it, make sure every detail is ready, and take it all back when the celebration is over.",
  },
  {
    icon: Frame,
    q: "Can I add a Memory Display?",
    a: "Yes. The Memory Display is independent from your service choice, self-styled or professionally styled, giving your keepsakes and experiences a beautiful focal point.",
  },
  {
    icon: PartyPopper,
    q: "Can I add games?",
    a: "Baby Shower builds already include Play & Connect games. Every other event type can add optional playful games in the builder for +$125 each.",
  },
  {
    icon: Send,
    q: "What happens after I submit the builder?",
    a: "We review your experience request and follow up to confirm availability, event details, and payment.",
  },
];

export default function HowItWorks() {
  const { palette, fonts } = usePalette();
  const badgeColors = [palette.accent, palette.primary];

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      {/* Banner */}
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <Sparkles className="absolute bottom-8 left-10 opacity-40" size={16} color={palette.gold} />
        <p className="text-xs font-semibold tracking-[0.35em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A SLICE OF G EVENTS
        </p>
        <h1 className="mt-3 text-5xl sm:text-6xl font-bold" style={{ ...fonts.displayFont, color: palette.gold }}>
          How It Works
        </h1>
        <p className="mt-4 text-2xl sm:text-3xl" style={{ ...fonts.scriptFont, color: "#FFFFFF" }}>
          You bring the people. We create the experience.
        </p>
      </div>

      {/* Questions grid */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTIONS.map((item, i) => {
            const Icon = item.icon;
            const badge = badgeColors[i % 2];
            return (
              <div
                key={item.q}
                className="rounded-2xl p-6 shadow-sm flex flex-col"
                style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                  style={{ background: `${badge}22` }}
                >
                  <Icon size={22} color={badge} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-bold leading-tight" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed flex-1" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
