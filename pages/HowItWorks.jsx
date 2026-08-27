import React from "react";
import { Calendar, Palette, PackageCheck, ShieldCheck, Mail, PackageOpen, Gift, Undo2 } from "lucide-react";
import { usePalette } from "../PaletteContext";

const STEPS = [
  {
    icon: Calendar,
    title: "Choose Your Date",
    body: "Pick the date of your shower and let's get the planning party started!",
  },
  {
    icon: Palette,
    title: "Choose Your Color Palette or Theme",
    body: "Tell us your vibe and we'll help bring it to life. Modern, playful, elegant, or bold — whatever feels like you.",
  },
  {
    icon: PackageCheck,
    title: "Choose Your Package and Any Add-Ons",
    body: "Build your perfect experience and add any extras that make it even more special.",
  },
  {
    icon: ShieldCheck,
    title: "Pay Deposit and Security Deposit",
    body: "Lock in your date with a deposit. The security deposit holds your goodies safe and sound.",
  },
  {
    icon: Mail,
    title: "Submit Information and Photos for Customization",
    body: "Send over the details and photos we need to customize everything just for you.",
  },
  {
    icon: PackageOpen,
    title: "Pick Up Your Rental Box",
    body: "Swing by and pick up everything 24 hours before your event day. Easy and convenient!",
  },
  {
    icon: Gift,
    title: "Enjoy Your Event!",
    body: "Have the best time making memories. We've taken care of all the details.",
  },
  {
    icon: Undo2,
    title: "Drop Off 24 Hours After",
    body: "Return everything within 24 hours after your event and we'll release your damage deposit.",
  },
];

export default function HowItWorks() {
  const { palette, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div
        className="px-6 py-16 text-center"
        style={{ background: palette.primaryDeep }}
      >
        <h1 className="text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: palette.gold }}>
          How It Works
        </h1>
        <p className="mt-3 text-xl italic" style={{ ...fonts.scriptFont, color: "#FFFFFF" }}>
          Simple, stress free, and so much fun!
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="flex gap-5 py-6"
              style={i > 0 ? { borderTop: `1px solid ${palette.line}` } : {}}
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{ background: palette.primaryDeep, color: "#FFFFFF" }}
                >
                  {i + 1}
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${palette.accent}1A` }}
              >
                <Icon size={24} color={palette.accent} />
              </div>
              <div>
                <h3 className="text-xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  {step.title}
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  {step.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
