import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  Palette,
  Scissors,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { hexToRgba, paperTexture } from "../theme";

import keepsakeImage from "../media/timecapsul.png";
import kindnessImage from "../media/poem.png";
import eventImage from "../media/file_00000000a204822f9ab953201c8b7043.png";
import ownerPortrait from "../media/owner-portrait.jpg";

const shadow =
  "0 3px 6px rgba(18,32,26,0.05), 0 18px 44px rgba(18,32,26,0.10), 0 36px 70px rgba(18,32,26,0.06)";

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

function Scribble({ children, fonts, color, style = {} }) {
  return (
    <span
      style={{
        ...fonts.scriptFont,
        display: "inline-block",
        color,
        lineHeight: 1,
        transform: "rotate(-2deg)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

const STARTING_POINTS = [
  {
    icon: Lightbulb,
    label: "The half-formed idea",
    text: "You know the feeling you want. The details are still somewhere in the fog.",
    rotate: "-2deg",
  },
  {
    icon: Palette,
    label: "The look",
    text: "Three screenshots, two colours and a sentence that starts with 'sort of like this...'",
    rotate: "1.5deg",
  },
  {
    icon: Scissors,
    label: "The weird problem",
    text: "The space is awkward. The thing does not exist. You need somebody to figure it out.",
    rotate: "-1deg",
  },
  {
    icon: WandSparkles,
    label: "The ridiculous thought",
    text: "It starts with 'this might sound crazy, but...' which is usually where things get interesting.",
    rotate: "2deg",
  },
];

const WHAT_I_LOVE = [
  "A screenshot with no instructions.",
  "A problem that needs a weird solution.",
  "A colour you are obsessed with.",
  "A space that refuses to cooperate.",
  "A sentence that starts with 'I had this idea...'",
  "Being told to just run with it.",
];

export default function About() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const texture = paperTexture(palette);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: palette.bg, color: palette.ink }}>
      <section className="relative overflow-hidden" style={{ ...texture, padding: "74px 24px 90px" }}>
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: "420px",
            height: "420px",
            right: "-180px",
            top: "-210px",
            background: hexToRgba(palette.accent, 0.1),
          }}
        />
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            width: "190px",
            height: "190px",
            left: "-70px",
            bottom: "-70px",
            borderRadius: "46% 54% 42% 58% / 55% 42% 58% 45%",
            background: palette.primary,
            opacity: 0.92,
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.primary,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "18px",
              }}
            >
              About A Slice of G
            </p>

            <h1
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(3.3rem, 7vw, 6.6rem)",
                lineHeight: 0.92,
                fontWeight: 650,
                letterSpacing: "-0.045em",
                margin: 0,
              }}
            >
              Everybody needs that creative friend.
            </h1>

            <Scribble
              fonts={fonts}
              color={palette.accent}
              style={{
                fontSize: "clamp(2rem, 5vw, 4.2rem)",
                marginTop: "20px",
              }}
            >
              Hi. I'm that friend.
            </Scribble>

            <p
              style={{
                ...fonts.bodyFont,
                maxWidth: "600px",
                color: palette.ink,
                fontSize: "18px",
                lineHeight: 1.75,
                marginTop: "28px",
              }}
            >
              The one you send a photo to and ask, "Do you think we could make something like this?"
              The one who hears, "Okay, so here's the problem I'm trying to solve..." and immediately
              has seventeen ideas.
            </p>

            <p
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(1.5rem, 3vw, 2.35rem)",
                fontWeight: 650,
                lineHeight: 1.25,
                marginTop: "26px",
              }}
            >
              And if you don't have one, you can borrow me.
            </p>
          </div>

          <div className="relative mx-auto h-[430px] w-full max-w-[470px] sm:h-[540px]">
            <div
              className="absolute right-[2%] top-[6%]"
              style={{
                width: "58%",
                height: "60%",
                background: `linear-gradient(145deg, ${palette.primary}, ${palette.primaryDeep})`,
                border: `3px solid ${palette.gold}`,
                borderRadius: "48% 48% 8% 8%",
                zIndex: 1,
              }}
            />

            <div
              className="absolute overflow-hidden bg-white"
              style={{
                width: "64%",
                aspectRatio: "4 / 4.8",
                top: "0",
                left: "6%",
                padding: "10px 10px 36px",
                transform: "rotate(-5deg)",
                boxShadow: shadow,
                zIndex: 3,
              }}
            >
              <img src={ownerPortrait} alt="Simone, the founder of A Slice of G Events" className="h-full w-full object-cover" />
            </div>

            <div
              className="absolute overflow-hidden bg-white"
              style={{
                width: "52%",
                aspectRatio: "4 / 4.8",
                right: "0",
                bottom: "5%",
                padding: "10px 10px 36px",
                transform: "rotate(5deg)",
                boxShadow: shadow,
                zIndex: 4,
              }}
            >
              <img src={eventImage} alt="A customized event detail" className="h-full w-full object-cover" />
            </div>

            <div
              className="absolute left-0 bottom-[7%] z-10 flex h-32 w-32 items-center justify-center rounded-full p-5 text-center"
              style={{
                background: palette.gold,
                color: palette.primaryDeep,
                boxShadow: shadow,
                transform: "rotate(-7deg)",
              }}
            >
              <span
                style={{
                  ...fonts.bodyFont,
                  fontSize: "11px",
                  fontWeight: 900,
                  lineHeight: 1.35,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ideas welcome.
                <br />
                Weird ones especially.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: palette.primaryDeep, padding: "88px 24px 102px" }}>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.gold,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              My favourite kind of brief
            </p>

            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontWeight: 620,
                lineHeight: 1,
              }}
            >
              Give me the problem.
              <br />
              Let me run with it.
            </h2>

            <p
              className="mx-auto mt-6 max-w-2xl"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.82)",
                fontSize: "17px",
                lineHeight: 1.72,
              }}
            >
              Some people love exact instructions. I love being told what you are trying to achieve,
              what you want it to feel like, or what is not working, and then being given room to create.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STARTING_POINTS.map((item, i) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.label} delay={i * 80}>
                  <div
                    className="h-full p-7"
                    style={{
                      background: palette.surface,
                      borderRadius: "6px",
                      boxShadow: "0 26px 64px rgba(0,0,0,0.22)",
                      border: `1px solid ${hexToRgba(palette.gold, 0.3)}`,
                      transform: `rotate(${item.rotate})`,
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        background: i % 2 === 0 ? palette.accent : palette.gold,
                        color: i % 2 === 0 ? "#FFFFFF" : palette.primaryDeep,
                      }}
                    >
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <h3
                      className="mt-6"
                      style={{
                        ...fonts.displayFont,
                        color: palette.primaryDeep,
                        fontSize: "1.45rem",
                        lineHeight: 1.1,
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </h3>

                    <p
                      className="mt-3"
                      style={{
                        ...fonts.bodyFont,
                        color: palette.muted,
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                lineHeight: 1.25,
              }}
            >
              Customization doesn't scare me.
            </p>

            <Scribble
              fonts={fonts}
              color={palette.gold}
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                marginTop: "10px",
              }}
            >
              It excites me.
            </Scribble>

            <p
              className="mx-auto mt-6 max-w-2xl"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.78)",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              Honestly, making the exact same thing over and over again gets a little boring.
              I'd much rather figure out how to make your version work.
            </p>
          </div>
        </div>
      </section>

      <section style={{ ...texture, padding: "92px 24px" }}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="relative min-h-[480px]">
            <div
              className="absolute left-[4%] top-[5%] overflow-hidden"
              style={{
                width: "70%",
                aspectRatio: "4 / 4.5",
                borderRadius: "4px",
                boxShadow: shadow,
              }}
            >
              <img src={keepsakeImage} alt="Creative event keepsake" className="h-full w-full object-cover" />
            </div>

            <div
              className="absolute bottom-[2%] right-[2%] overflow-hidden bg-white"
              style={{
                width: "50%",
                aspectRatio: "4 / 4.7",
                padding: "9px 9px 32px",
                transform: "rotate(5deg)",
                boxShadow: shadow,
              }}
            >
              <img src={kindnessImage} alt="Customized event detail" className="h-full w-full object-cover" />
            </div>

            <div
              className="absolute left-[5%] bottom-[4%] px-5 py-4"
              style={{
                background: palette.accent,
                color: "#FFFFFF",
                transform: "rotate(-4deg)",
                boxShadow: shadow,
              }}
            >
              <span
                style={{
                  ...fonts.scriptFont,
                  fontSize: "1.55rem",
                }}
              >
                let me figure it out
              </span>
            </div>
          </div>

          <div>
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.primary,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Bring me the messy beginning
            </p>

            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
                lineHeight: 1.02,
                fontWeight: 630,
              }}
            >
              You do not need to arrive with a finished idea.
            </h2>

            <p
              className="mt-6"
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontSize: "17px",
                lineHeight: 1.75,
              }}
            >
              Maybe you found three completely different inspiration photos and somehow want them
              to have a baby. Maybe you know exactly how you want people to feel, but have absolutely
              no idea what that should look like.
            </p>

            <p
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.accent,
                fontSize: "1.7rem",
                fontStyle: "italic",
                lineHeight: 1.3,
              }}
            >
              That's the fun part.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {WHAT_I_LOVE.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 px-4 py-4"
                  style={{
                    background: palette.surface,
                    border: `1px solid ${hexToRgba(palette.gold, 0.3)}`,
                    boxShadow: "0 8px 20px rgba(18,32,26,0.05)",
                  }}
                >
                  <Sparkles size={15} color={palette.gold} className="mt-1 shrink-0" />
                  <span
                    style={{
                      ...fonts.bodyFont,
                      color: palette.primaryDeep,
                      fontSize: "14px",
                      lineHeight: 1.55,
                      fontWeight: 650,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: palette.bg, padding: "100px 24px 0" }}>
        <div className="mx-auto max-w-5xl">
          <div
            className="mx-auto max-w-3xl border px-7 py-12 text-center sm:px-12"
            style={{
              borderColor: palette.line,
              background: palette.surface,
              boxShadow: "0 8px 30px rgba(18,32,26,0.04)",
            }}
          >
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Previous performance feedback
            </p>

            <h2
              className="mt-5"
              style={{
                ...fonts.displayFont,
                color: palette.ink,
                fontSize: "clamp(2.3rem, 5vw, 4rem)",
                lineHeight: 1.08,
                fontWeight: 600,
              }}
            >
              Apparently, I was "doing too much."
            </h2>

            <div className="mx-auto mt-8 max-w-2xl space-y-4 text-left">
              {[
                "Spending too much time making things look pretty.",
                "Adding things nobody asked me to add.",
                "Taking a functional thing and wondering why it could not also be beautiful.",
                "Going beyond simply making it work.",
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-start gap-4 border-b pb-4"
                  style={{ borderColor: palette.line }}
                >
                  <span style={{ color: palette.muted }}>&bull;</span>
                  <p
                    style={{
                      ...fonts.bodyFont,
                      color: palette.muted,
                      fontSize: "15px",
                      lineHeight: 1.65,
                    }}
                  >
                    {line}
                  </p>
                </div>
              ))}
            </div>

            <p
              className="mx-auto mt-8 max-w-2xl"
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
                fontSize: "16px",
                lineHeight: 1.75,
              }}
            >
              And, technically, they weren't wrong. For a long time, that felt like something
              I was supposed to tone down.
            </p>
          </div>
        </div>

        <div
          className="relative mt-20 flex min-h-[560px] items-center overflow-hidden"
          style={{
            marginLeft: "-24px",
            marginRight: "-24px",
            backgroundImage: `linear-gradient(90deg, ${hexToRgba(palette.primaryDeep, 0.9)} 0%, ${hexToRgba(palette.primaryDeep, 0.72)} 48%, ${hexToRgba(palette.primaryDeep, 0.3)} 100%), url(${eventImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-7 py-24 sm:px-10">
            <Reveal className="max-w-4xl">
              <p
                style={{
                  ...fonts.bodyFont,
                  color: palette.gold,
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Turns out...
              </p>

              <h2
                className="mt-4"
                style={{
                  ...fonts.displayFont,
                  color: "#FFFFFF",
                  fontSize: "clamp(3.2rem, 8vw, 7.6rem)",
                  lineHeight: 0.92,
                  fontWeight: 650,
                  letterSpacing: "-0.04em",
                  textShadow: "0 8px 36px rgba(0,0,0,0.22)",
                }}
              >
                I was just sitting at the wrong table.
              </h2>

              <p
                className="mt-8 max-w-2xl"
                style={{
                  ...fonts.bodyFont,
                  color: "rgba(255,255,255,0.84)",
                  fontSize: "18px",
                  lineHeight: 1.75,
                }}
              >
                Because here, there is no such thing as caring too much about the details.
                There is no reason the practical thing cannot also be the beautiful thing.
              </p>

              <Scribble
                fonts={fonts}
                color={palette.gold}
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 4.3rem)",
                  marginTop: "24px",
                }}
              >
                And "doing too much" is kind of the whole point.
              </Scribble>
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ ...texture, padding: "100px 24px" }}>
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.primary,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              That is how A Slice of G works
            </p>

            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                lineHeight: 1,
                fontWeight: 630,
              }}
            >
              I do not want your celebration to look like I pulled it off a shelf.
            </h2>

            <p
              className="mx-auto mt-7 max-w-2xl"
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontSize: "17px",
                lineHeight: 1.75,
              }}
            >
              I want to know who we are celebrating. What makes them laugh. What they love.
              What you want your guests to remember.
            </p>
          </div>

          <div
            className="mx-auto mt-12 max-w-3xl px-7 py-8 text-center sm:px-12 sm:py-11"
            style={{
              background: palette.primaryDeep,
              boxShadow: shadow,
              border: `1px solid ${palette.gold}`,
              transform: "rotate(-1deg)",
            }}
          >
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.gold,
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              The goal
            </p>

            <p
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.2,
                fontWeight: 620,
              }}
            >
              "Wait. This is SO them."
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-3xl">
            <p
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              Sometimes that means starting with one of our existing experiences and making it yours.
              Sometimes it means changing something I have already created.
            </p>

            <p
              className="mt-5"
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              And sometimes it means looking at me and saying:
            </p>

            <p
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.accent,
                fontSize: "clamp(2.3rem, 5vw, 4.5rem)",
                fontStyle: "italic",
                lineHeight: 1.1,
              }}
            >
              "I have an idea..."
            </p>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${palette.primary} 0%, ${palette.primaryDeep} 72%, ${palette.ink} 100%)`,
          padding: "92px 24px",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: "420px",
            height: "420px",
            right: "-160px",
            bottom: "-240px",
            background: hexToRgba(palette.gold, 0.13),
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Scribble
            fonts={fonts}
            color={palette.gold}
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4.3rem)",
            }}
          >
            Perfect.
          </Scribble>

          <h2
            className="mt-5"
            style={{
              ...fonts.displayFont,
              color: "#FFFFFF",
              fontSize: "clamp(3rem, 7vw, 6.3rem)",
              lineHeight: 0.96,
              fontWeight: 630,
              letterSpacing: "-0.035em",
            }}
          >
            Pull up a chair.
          </h2>

          <p
            className="mt-5"
            style={{
              ...fonts.displayFont,
              color: "#FFFFFF",
              fontSize: "clamp(1.6rem, 3vw, 2.7rem)",
              lineHeight: 1.2,
            }}
          >
            You're at my table now.
          </p>

          <button
            onClick={() => openPickerForBuilder()}
            className="mt-9 inline-flex items-center gap-3 rounded-full transition-transform hover:-translate-y-0.5"
            style={{
              ...fonts.bodyFont,
              background: palette.gold,
              color: palette.primaryDeep,
              padding: "16px 28px",
              fontSize: "12px",
              fontWeight: 850,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              boxShadow: "0 14px 30px rgba(0,0,0,0.20)",
            }}
          >
            Tell me your idea
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
