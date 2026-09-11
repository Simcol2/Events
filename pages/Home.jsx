import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Truck, Users, Gift, CalendarHeart } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { hexToRgba, paperTexture } from "../theme";

import heroFullBleed from "../media/timecapsul.png";
import essentialsImage from "../media/hero.png";
import wallPuzzleEngagementPhoto from "../media/file_00000000a204822f9ab953201c8b7043.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import nurseryRhymePhoto from "../media/poem.png";

const TUTU_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";
const TUTU_STARTING_PRICE = 495;

const elevatedShadow =
  "0 2px 4px rgba(18,32,26,0.05), 0 18px 42px rgba(18,32,26,0.10), 0 32px 70px rgba(18,32,26,0.06)";

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(26px)",
        transition: `opacity 760ms ease ${delay}ms, transform 760ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Blob({ style, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", pointerEvents: "none", ...style }}
    />
  );
}

function Hero({ fonts, palette, navigate }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        ...paperTexture(palette),
        padding: "58px 24px 72px",
        borderBottom: `1px solid ${hexToRgba(palette.gold, 0.35)}`,
      }}
    >
      <Blob
        style={{
          width: "min(36vw, 420px)",
          height: "min(36vw, 420px)",
          right: "-10%",
          top: "-18%",
          borderRadius: "50%",
          background: hexToRgba(palette.accent, 0.085),
        }}
      />
      <Blob
        style={{
          width: "min(17vw, 170px)",
          height: "min(17vw, 170px)",
          left: "-4%",
          bottom: "-4%",
          borderRadius: "38% 62% 53% 47% / 48% 39% 61% 52%",
          background: palette.accent,
          opacity: 0.88,
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-xl">
          <span
            className="inline-block"
            style={{
              ...fonts.displayFont,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(28px, 4.4vw, 40px)",
              color: palette.accent,
              transform: "rotate(-3deg)",
              marginBottom: "18px",
            }}
          >
            psst... Toronto & the GTA
          </span>

          <h1
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(2.75rem, 5.8vw, 5.4rem)",
              fontWeight: 620,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              margin: 0,
            }}
          >
            We create celebrations people don't just attend.
          </h1>

          <p
            style={{
              ...fonts.scriptFont,
              color: palette.accent,
              fontSize: "clamp(2rem, 5vw, 4.4rem)",
              lineHeight: 1,
              margin: "14px 0 26px",
              transform: "rotate(-2deg)",
              transformOrigin: "left center",
            }}
          >
            They experience.
          </p>

          <p
            style={{
              ...fonts.bodyFont,
              maxWidth: "560px",
              color: palette.ink,
              fontSize: "17px",
              lineHeight: 1.72,
              margin: "0 0 22px",
            }}
          >
            Interactive experiences, keepsakes, décor and rentals for baby showers,
            birthdays and milestone celebrations across Toronto and the GTA.
          </p>

          <p
            style={{
              ...fonts.bodyFont,
              color: palette.goldDeep,
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              margin: "0 0 30px",
            }}
          >
            Tutu Twirls & Tea starting at ${TUTU_STARTING_PRICE}
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => navigate("/experiences")}
              className="inline-flex items-center gap-3 rounded-full transition-transform hover:-translate-y-0.5"
              style={{
                ...fonts.bodyFont,
                background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDeep} 100%)`,
                color: "#FFFFFF",
                padding: "16px 28px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: `0 14px 30px ${hexToRgba(palette.primaryDeep, 0.24)}`,
                border: `1px solid ${palette.gold}`,
              }}
            >
              Explore experiences
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/how-it-works")}
              style={{
                ...fonts.bodyFont,
                color: palette.primaryDeep,
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderBottom: `2px solid ${palette.gold}`,
                paddingBottom: "3px",
              }}
            >
              How it works
            </button>
          </div>
        </div>

        <div className="relative mx-auto h-[390px] w-full max-w-[450px] sm:h-[480px] lg:h-[560px]">
          <Blob
            style={{
              width: "64%",
              height: "68%",
              right: "-4%",
              top: "-5%",
              background: `linear-gradient(150deg, ${palette.primary} 0%, ${palette.primaryDeep} 100%)`,
              border: `3px solid ${palette.gold}`,
              borderRadius: "46% 46% 8% 8%",
              boxShadow: `0 26px 64px ${hexToRgba(palette.primaryDeep, 0.22)}`,
            }}
          />
          <Blob
            style={{
              width: "36%",
              height: "31%",
              left: "-6%",
              bottom: "5%",
              background: palette.accent,
              borderRadius: "45% 55% 50% 50% / 58% 46% 54% 42%",
              opacity: 0.92,
            }}
          />

          {[
            {
              src: essentialsImage,
              alt: "Baby shower experience by A Slice of G Events",
              style: { width: "58%", top: "0", left: "4%", transform: "rotate(-4deg)", zIndex: 2 },
            },
            {
              src: wallPuzzleEngagementPhoto,
              alt: "Guest-built keepsake at a celebration",
              style: { width: "52%", top: "34%", right: "-1%", transform: "rotate(4.5deg)", zIndex: 3 },
            },
            {
              src: TUTU_IMAGE,
              alt: "Tutu Twirls pop-up dress-up experience",
              style: { width: "45%", bottom: "0", left: "1%", transform: "rotate(2deg)", zIndex: 4 },
            },
          ].map((photo) => (
            <div
              key={photo.alt}
              className="absolute overflow-hidden bg-white"
              style={{
                aspectRatio: "4 / 4.7",
                padding: "10px 10px 34px",
                borderRadius: "2px",
                boxShadow: elevatedShadow,
                ...photo.style,
              }}
            >
              <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
            </div>
          ))}

          <div
            className="absolute right-[5%] top-[6%] z-20 flex h-28 w-28 items-center justify-center rounded-full p-5 text-center sm:h-32 sm:w-32"
            style={{
              ...fonts.bodyFont,
              background: `radial-gradient(circle at 34% 28%, #F5D982 0%, ${palette.gold} 72%, #B98724 100%)`,
              color: palette.primaryDeep,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              lineHeight: 1.35,
              textTransform: "uppercase",
              boxShadow: "0 16px 34px rgba(18,32,26,0.18)",
              border: "1px solid rgba(255,255,255,0.55)",
            }}
          >
            Events that bring people together
          </div>
        </div>
      </div>
    </section>
  );
}

const CELEBRATION_CARDS = [
  {
    title: "Baby Showers",
    image: essentialsImage,
    action: "babyShower",
  },
  {
    title: "Tutu Twirls & Tea",
    image: TUTU_IMAGE,
    action: "tutu",
  },
  {
    title: "Milestone Celebrations",
    image: heroFullBleed,
    action: "custom",
  },
  {
    title: "Custom Moments",
    image: wallPuzzleEngagementPhoto,
    action: "custom",
  },
];

const FEATURED = [
  {
    title: "Picture This",
    image: babyTriviaPhoto,
    body: "Guests capture a photo and leave a message or memory for the future.",
    action: "babyShower",
  },
  {
    title: "Hello World Kindness Station",
    image: nurseryRhymePhoto,
    body: "Guests share advice, hopes and kind words while passing a little kindness forward.",
    action: "babyShower",
  },
  {
    title: "Tutu Twirls & Tea",
    image: TUTU_IMAGE,
    body: "A dress-up experience filled with sparkle, play and confidence.",
    action: "tutu",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: CalendarHeart,
    title: "Choose your experience",
    body: "Pick from our signature experiences or build something custom.",
  },
  {
    icon: Truck,
    title: "We prepare everything",
    body: "Your activities, keepsakes and details are prepared for self setup or full-service styling.",
  },
  {
    icon: Users,
    title: "Your guests take part",
    body: "They play, connect, create and contribute to the moment.",
  },
  {
    icon: Gift,
    title: "You keep the memories",
    body: "The photos, messages, keepsakes and stories live on after the event.",
  },
];

export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder, chooseEventType } = useEventType();

  const handleAction = (action) => {
    if (action === "tutu") {
      navigate("/birthdays/tutu-twirls-tea");
      return;
    }
    if (action === "babyShower") {
      chooseEventType("babyShower");
      navigate("/milestone-events/baby-shower");
      return;
    }
    openPickerForBuilder();
  };

  return (
    <div className="overflow-hidden" style={{ background: palette.bg, color: palette.ink }}>
      <Hero fonts={fonts} palette={palette} navigate={navigate} />

      {/* Celebration selector */}
      <section style={{ ...paperTexture(palette), padding: "32px 24px 64px" }}>
        <div className="mx-auto max-w-7xl">
          <p
            className="mb-6 text-center"
            style={{
              ...fonts.bodyFont,
              color: palette.primaryDeep,
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            What are you celebrating?
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CELEBRATION_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 70}>
                <button
                  onClick={() => handleAction(card.action)}
                  className="group block w-full text-left"
                >
                  <div
                    className="overflow-hidden rounded-[4px]"
                    style={{
                      aspectRatio: "16 / 10",
                      boxShadow: elevatedShadow,
                      border: `1px solid ${hexToRgba(palette.gold, 0.35)}`,
                    }}
                  >
                    <img
                      src={card.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span
                      style={{
                        ...fonts.bodyFont,
                        color: palette.primaryDeep,
                        fontSize: "13px",
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {card.title}
                    </span>
                    <ArrowRight size={15} color={palette.primaryDeep} />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured experiences */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${palette.primaryDeep} 0%, #063725 100%)`,
          padding: "88px 24px 96px",
        }}
      >
        <Blob
          style={{
            width: "520px",
            height: "520px",
            right: "-240px",
            top: "-220px",
            borderRadius: "50%",
            background: hexToRgba(palette.gold, 0.1),
          }}
        />
        <Blob
          style={{
            width: "300px",
            height: "300px",
            left: "-130px",
            bottom: "-160px",
            borderRadius: "50%",
            background: hexToRgba(palette.accent, 0.16),
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p
                style={{
                  ...fonts.bodyFont,
                  color: palette.gold,
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.17em",
                  textTransform: "uppercase",
                }}
              >
                Featured experiences
              </p>
              <h2
                className="mt-4"
                style={{
                  ...fonts.displayFont,
                  color: palette.surface,
                  fontSize: "clamp(2.7rem, 5vw, 4.8rem)",
                  lineHeight: 1.02,
                  fontWeight: 600,
                }}
              >
                More than décor.
                <br />
                More than a rental.
              </h2>
              <p
                className="mt-6 max-w-xl"
                style={{
                  ...fonts.bodyFont,
                  color: "rgba(255,253,248,0.82)",
                  fontSize: "17px",
                  lineHeight: 1.75,
                }}
              >
                We create experiences that invite people in. A place to leave a message.
                A moment to try something new. A reason to laugh together. A keepsake
                that tells the story later.
              </p>

              <button
                onClick={() => navigate("/experiences")}
                className="mt-8 inline-flex items-center gap-3 rounded-full"
                style={{
                  ...fonts.bodyFont,
                  background: palette.gold,
                  color: palette.primaryDeep,
                  padding: "14px 24px",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 12px 26px rgba(0,0,0,0.16)",
                }}
              >
                Explore all experiences
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FEATURED.map((card, i) => (
                <Reveal key={card.title} delay={i * 90}>
                  <button
                    onClick={() => handleAction(card.action)}
                    className="group flex h-full w-full flex-col overflow-hidden text-left"
                    style={{
                      background: palette.surface,
                      borderRadius: "5px",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
                      border: `1px solid ${hexToRgba(palette.gold, 0.28)}`,
                    }}
                  >
                    <div className="overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                      <img
                        src={card.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3
                        style={{
                          ...fonts.displayFont,
                          color: palette.primaryDeep,
                          fontSize: "1.45rem",
                          fontWeight: 700,
                          lineHeight: 1.1,
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className="mt-3"
                        style={{
                          ...fonts.bodyFont,
                          color: palette.muted,
                          fontSize: "14px",
                          lineHeight: 1.65,
                        }}
                      >
                        {card.body}
                      </p>
                      <span
                        className="mt-6 inline-flex items-center gap-2"
                        style={{
                          ...fonts.bodyFont,
                          color: palette.primaryDeep,
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.09em",
                          textTransform: "uppercase",
                        }}
                      >
                        Learn more <ArrowRight size={13} />
                      </span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-bleed brand statement */}
      <section
        className="relative min-h-[430px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5,33,23,0.88) 0%, rgba(5,33,23,0.60) 52%, rgba(5,33,23,0.26) 100%), url(${heroFullBleed})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10">
          <Reveal className="max-w-2xl">
            <h2
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2.5rem, 5.2vw, 4.9rem)",
                lineHeight: 1.02,
                fontWeight: 600,
                textShadow: "0 4px 24px rgba(0,0,0,0.18)",
              }}
            >
              Celebrations are better when people are part of them.
            </h2>
            <p
              className="mt-6 max-w-xl"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.88)",
                fontSize: "17px",
                lineHeight: 1.7,
              }}
            >
              We design interactive experiences that turn guests from people watching
              into people participating.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Why A Slice of G */}
      <section style={{ ...paperTexture(palette), padding: "84px 24px" }}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-4" size={22} strokeWidth={1.2} style={{ color: palette.goldDeep }} />
          <h2
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)",
              fontWeight: 650,
            }}
          >
            Why people choose A Slice of G
          </h2>
          <span
            className="mt-2 inline-block"
            style={{ ...fonts.scriptFont, fontSize: "16px", color: palette.accent, transform: "rotate(-2deg)" }}
          >
            (besides the fact that we're just really fun)
          </span>

          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            Because celebrations do not have to look the same.
          </p>
          <p className="mt-3 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            We love the unexpected details.
          </p>
          <p className="mt-1 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            The moments that make people smile.
          </p>
          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            The ideas that make guests say, "Wait, this is so cool."
          </p>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            From playful dress-up experiences to meaningful keepsakes,
            everything we create is designed to help people connect.
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section style={{ ...paperTexture(palette), padding: "84px 24px 100px" }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                fontWeight: 650,
              }}
            >
              How it works
            </h2>
            <p
              className="mt-2"
              style={{
                ...fonts.scriptFont,
                color: palette.accent,
                fontSize: "clamp(1.25rem, 2.6vw, 2rem)",
                transform: "rotate(-1deg)",
              }}
            >
              (it's easier than picking a theme)
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 80}>
                  <div
                    className="h-full p-7"
                    style={{
                      background: palette.surface,
                      borderRadius: "5px",
                      border: `1px solid ${hexToRgba(palette.gold, 0.32)}`,
                      boxShadow: elevatedShadow,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full"
                        style={{
                          background: i === 1 ? palette.gold : palette.primaryDeep,
                          color: i === 1 ? palette.primaryDeep : "#FFFFFF",
                          boxShadow: "0 8px 20px rgba(18,32,26,0.10)",
                        }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <span
                        style={{
                          ...fonts.displayFont,
                          color: palette.gold,
                          fontSize: "1.45rem",
                          fontWeight: 700,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      className="mt-6"
                      style={{
                        ...fonts.displayFont,
                        color: palette.primaryDeep,
                        fontSize: "1.35rem",
                        fontWeight: 700,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-3"
                      style={{
                        ...fonts.bodyFont,
                        color: palette.muted,
                        fontSize: "14px",
                        lineHeight: 1.65,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real celebrations */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${palette.primaryDeep} 0%, #073B2A 100%)`,
          padding: "82px 24px",
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.gold,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.17em",
                textTransform: "uppercase",
              }}
            >
              Real celebrations
            </p>
            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2.6rem, 5vw, 4.7rem)",
                lineHeight: 1,
                fontWeight: 600,
              }}
            >
              Real people.
              <br />
              Unforgettable moments.
            </h2>
            <button
              onClick={() => navigate("/past-events")}
              className="mt-8 inline-flex items-center gap-3 rounded-full"
              style={{
                ...fonts.bodyFont,
                background: palette.gold,
                color: palette.primaryDeep,
                padding: "14px 24px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              See past events <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
            <div
              className="flex flex-col justify-center p-7"
              style={{
                background: palette.surface,
                borderRadius: "5px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
              }}
            >
              <p
                style={{
                  ...fonts.displayFont,
                  color: palette.primaryDeep,
                  fontSize: "1.45rem",
                  lineHeight: 1.5,
                }}
              >
                Every celebration we style becomes a set of real photos, real
                reactions, and a few keepsakes nobody throws away.
              </p>
              <button
                onClick={() => navigate("/reviews")}
                className="mt-6 inline-flex items-center gap-2 self-start"
                style={{
                  ...fonts.bodyFont,
                  color: palette.primaryDeep,
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderBottom: `2px solid ${palette.gold}`,
                  paddingBottom: "2px",
                }}
              >
                Read reviews from real hosts
              </button>
            </div>

            <div
              className="overflow-hidden"
              style={{
                minHeight: "310px",
                borderRadius: "5px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
                border: `1px solid ${hexToRgba(palette.gold, 0.3)}`,
              }}
            >
              <img
                src={wallPuzzleEngagementPhoto}
                alt="A Slice of G event setup"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="grid lg:grid-cols-2">
        <div className="min-h-[380px]">
          <img
            src={heroFullBleed}
            alt="Styled event details"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="flex items-center"
          style={{
            background: `linear-gradient(145deg, #073B2A 0%, ${palette.primaryDeep} 100%)`,
            padding: "68px 36px",
          }}
        >
          <div className="mx-auto max-w-xl">
            <Sparkles size={22} color={palette.gold} strokeWidth={1.4} />
            <h2
              className="mt-5"
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2.7rem, 5vw, 4.6rem)",
                lineHeight: 1.02,
                fontWeight: 600,
              }}
            >
              Let's create something unforgettable together.
            </h2>
            <p
              className="mt-5"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.78)",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              Start with one of our signature experiences or build something
              around the people you're celebrating.
            </p>

            <button
              onClick={() => openPickerForBuilder()}
              className="mt-8 inline-flex items-center gap-3 rounded-full transition-transform hover:-translate-y-0.5"
              style={{
                ...fonts.bodyFont,
                background: palette.gold,
                color: palette.primaryDeep,
                padding: "15px 25px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
              }}
            >
              Build my experience <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
