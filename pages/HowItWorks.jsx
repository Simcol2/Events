import React from "react";
import {
  CalendarHeart,
  Frame,
  Gift,
  PackageCheck,
  PartyPopper,
  Send,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import {
  ElevatedCard,
  JewelBand,
  PageHero,
  PrimaryButton,
  Reveal,
  SectionIntro,
  paperTexture,
} from "../components/EditorialKit";

const STEPS = [
  {
    icon: CalendarHeart,
    title: "Choose your celebration",
    body: "Tell us what you are planning so the experiences, pricing and guest gift options shown actually fit the event.",
  },
  {
    icon: PackageCheck,
    title: "Build your experience",
    body: "Choose the activities, keepsakes, display options and upgrades that feel right for your people.",
  },
  {
    icon: Users,
    title: "Guests take part",
    body: "They play, write, photograph, build, laugh and contribute throughout the celebration.",
  },
  {
    icon: Gift,
    title: "You keep the memories",
    body: "The finished keepsakes, photos, messages and stories live on after the room is packed away.",
  },
];

// Section 34: answers the required questions quickly, built around the
// core message "You bring the people. We create the experience."
const QUESTIONS = [
  {
    icon: Sparkles,
    q: "What is an A Slice of G experience?",
    a: "Interactive event experiences that become keepsakes. Guests participate, contribute and create something meaningful during the celebration, and you get to keep what they made.",
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
  const { openPickerForBuilder } = useEventType();

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="HOW IT WORKS"
        title="You bring the people. We create the experience."
        script="It is easier than picking a theme."
        body="Start with the celebration, choose the moments you want guests to take part in, decide how much help you want with setup, then let the whole thing become one cohesive experience."
        palette={palette}
        fonts={fonts}
        align="center"
      >
        <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
          Start building
        </PrimaryButton>
      </PageHero>

      <section style={{ ...paperTexture(palette), padding: "92px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="THE SHORT VERSION"
            title="Four steps. No event-planning scavenger hunt."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.title} delay={i * 75}>
                  <ElevatedCard palette={palette} className="h-full p-7">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{
                          background: i === 1 ? palette.gold : palette.primaryDeep,
                          color: i === 1 ? palette.primaryDeep : "#FFFFFF",
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-xl font-semibold" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {step.body}
                    </p>
                  </ElevatedCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="GOOD TO KNOW"
            title="The questions that actually matter before you book."
            body="The practical stuff should be clear before money changes hands. Revolutionary concept, apparently."
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {QUESTIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.q} delay={i * 55}>
                  <ElevatedCard palette={palette} className="h-full p-7">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{
                        background: i % 2 ? palette.gold : palette.accent,
                        color: i % 2 ? palette.primaryDeep : "#FFFFFF",
                      }}
                    >
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                      {item.q}
                    </h3>
                    <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {item.a}
                    </p>
                  </ElevatedCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </JewelBand>

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-4xl text-center">
          <Sparkles className="mx-auto" size={20} color={palette.goldDeep} />
          <h2
            className="mt-5"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
              lineHeight: 1,
              fontWeight: 630,
            }}
          >
            Pick the experience. Pick the help level. Keep the memories.
          </h2>
          <div className="mt-8">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
              Build my experience
            </PrimaryButton>
          </div>
        </div>
      </section>
    </main>
  );
}
