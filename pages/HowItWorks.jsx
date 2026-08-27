import React from "react";
import { Calendar, Palette, PackageCheck, ShieldCheck, Mail, PackageOpen, Gift, Undo2, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";

const STEPS = [
  { icon: Calendar, title: "Choose Your Date", body: "Pick the date of your shower and let's get the planning party started!" },
  { icon: Palette, title: "Choose Your Palette or Theme", body: "Tell us your vibe and we'll help bring it to life — modern, playful, elegant, or bold." },
  { icon: PackageCheck, title: "Choose Your Package & Add-Ons", body: "Build your perfect experience and add any extras that make it even more special." },
  { icon: ShieldCheck, title: "Pay Deposit & Security Deposit", body: "Lock in your date with a deposit. The security deposit holds your goodies safe and sound." },
  { icon: Mail, title: "Submit Info & Photos", body: "Send over the details and photos we need to customize everything just for you." },
  { icon: PackageOpen, title: "Pick Up Your Rental Box", body: "Swing by and pick up everything 24 hours before your event. Easy and convenient!" },
  { icon: Gift, title: "Enjoy Your Event!", body: "Have the best time making memories. We've taken care of all the details." },
  { icon: Undo2, title: "Drop Off 24 Hours After", body: "Return everything within 24 hours after your event and we'll release your damage deposit." },
];

export default function HowItWorks() {
  const { palette, fonts } = usePalette();
  // Alternate two accent treatments across cards, matching the flyer's alternating badge colors.
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
        <h1 className="mt-3 text-6xl sm:text-7xl font-bold" style={{ ...fonts.displayFont, color: palette.gold }}>
          How It Works
        </h1>
        <p className="mt-4 text-2xl sm:text-3xl" style={{ ...fonts.scriptFont, color: "#FFFFFF" }}>
          Simple, stress free, and so much fun!
        </p>
      </div>

      {/* Steps grid */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const badge = badgeColors[i % 2];
            return (
              <div
                key={step.title}
                className="rounded-2xl p-6 shadow-sm flex flex-col"
                style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: palette.primaryDeep }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${badge}22` }}
                  >
                    <Icon size={26} color={badge} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-tight" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed flex-1" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
