import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { metallicGoldTextStyle, metallicGoldGradient } from "../theme";

export const editorialShadow =
  "0 3px 6px rgba(18,32,26,0.05), 0 18px 44px rgba(18,32,26,0.10), 0 36px 70px rgba(18,32,26,0.06)";

export function rgba(hex, alpha) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(18,32,26,${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function paperTexture(palette) {
  return {
    backgroundColor: palette.bg,
    // Fixed pixel sizes here on purpose: a percentage-based radial sizes
    // itself to the element's full diagonal, so on a tall page the "faint"
    // gold wash actually covered the whole visible viewport at real
    // strength - reading as beige instead of the near-white it should be.
    backgroundImage: [
      `radial-gradient(600px circle at 8% 0%, ${rgba(palette.gold, 0.05)}, transparent 70%)`,
      `radial-gradient(500px circle at 90% 6%, ${rgba(palette.accent, 0.035)}, transparent 70%)`,
      `repeating-linear-gradient(0deg, ${rgba(palette.ink, 0.02)} 0, ${rgba(palette.ink, 0.02)} 1px, transparent 1px, transparent 4px)`,
    ].join(","),
  };
}

export function Reveal({ children, className = "", delay = 0 }) {
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
      { threshold: 0.1 }
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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 720ms ease ${delay}ms, transform 720ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Kicker({ children, palette, fonts, light = false }) {
  return (
    <p
      style={{
        ...fonts.bodyFont,
        ...metallicGoldTextStyle(palette, { onDark: light }),
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

export function ScriptNote({ children, palette, fonts, light = false, style = {} }) {
  return (
    <span
      style={{
        ...fonts.scriptFont,
        display: "inline-block",
        lineHeight: 1,
        transform: "rotate(-2deg)",
        ...(light ? metallicGoldTextStyle(palette, { onDark: true }) : { color: palette.accent }),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  script,
  body,
  children,
  image,
  imageAlt = "",
  palette,
  fonts,
  align = "split",
}) {
  const split = align === "split" && image;

  return (
    <section className="relative overflow-hidden" style={paperTexture(palette)}>
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          width: "420px",
          height: "420px",
          right: "-180px",
          top: "-220px",
          background: rgba(palette.accent, 0.09),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          width: "170px",
          height: "170px",
          left: "-70px",
          bottom: "-70px",
          borderRadius: "46% 54% 42% 58% / 55% 42% 58% 45%",
          background: palette.primary,
          opacity: 0.92,
        }}
      />

      <div
        className={`relative z-10 mx-auto max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:py-28 ${
          split ? "grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center" : ""
        }`}
      >
        <div className={split ? "max-w-xl" : "mx-auto max-w-4xl text-center"}>
          {eyebrow && <Kicker palette={palette} fonts={fonts}>{eyebrow}</Kicker>}

          <h1
            className="mt-4"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: split ? "clamp(3rem, 6vw, 5.7rem)" : "clamp(3.2rem, 6vw, 6rem)",
              fontWeight: 640,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </h1>

          {script && (
            <ScriptNote
              palette={palette}
              fonts={fonts}
              style={{ fontSize: "clamp(2rem, 4.6vw, 4rem)", marginTop: "18px" }}
            >
              {script}
            </ScriptNote>
          )}

          {body && (
            <p
              className={split ? "mt-7 max-w-xl" : "mx-auto mt-7 max-w-2xl"}
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontSize: "17px",
                lineHeight: 1.75,
              }}
            >
              {body}
            </p>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>

        {split && (
          <div
            className="relative mt-12 overflow-hidden lg:mt-0"
            style={{
              minHeight: "520px",
              borderRadius: "5px",
              boxShadow: `${editorialShadow}, 0 30px 60px ${rgba(palette.ink, 0.10)}`,
              border: `1px solid ${rgba(palette.gold, 0.36)}`,
            }}
          >
            <img
              src={image}
              alt={imageAlt}
              className="glossy-photo h-full min-h-[520px] w-full object-cover"
            />
            <div aria-hidden="true" className="glossy-sheen" />
          </div>
        )}
      </div>
    </section>
  );
}

export function JewelBand({ children, palette, className = "", style = {}, tone = "primary", glass = false }) {
  const isSecondary = tone === "secondary";
  const base = isSecondary ? palette.secondary : palette.primary;
  const deep = isSecondary ? palette.secondaryDeep : palette.primaryDeep;
  const bright = isSecondary ? palette.secondaryBright : palette.primaryBright;
  // A third, brighter stop only shows up for a family that actually has one
  // defined (coral does) - other families stay a clean two-stop gradient
  // between their own real deep/base tones rather than gaining an
  // artificial third stop.
  const background =
    bright && bright !== base
      ? `linear-gradient(145deg, ${deep} 0%, ${base} 55%, ${bright} 120%)`
      : `linear-gradient(145deg, ${deep} 0%, ${base} 120%)`;
  // The smaller decorative shape gets a real, intentional companion color
  // (e.g. navy's own #164563) at a visible-but-soft opacity, rather than a
  // translucent smear of whatever the sparing "accent" color happens to be.
  const companionTone = isSecondary ? palette.accent : palette.primaryCompanion;
  const companionAlpha = isSecondary ? 0.18 : 0.4;

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{
        background,
        ...style,
      }}
    >
      {glass && <div aria-hidden="true" className="hero-streak" />}
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          width: "520px",
          height: "520px",
          right: "-240px",
          top: "-250px",
          background: rgba(palette.gold, 0.11),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          width: "280px",
          height: "280px",
          left: "-140px",
          bottom: "-160px",
          background: rgba(companionTone, companionAlpha),
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  palette,
  fonts,
  light = false,
  align = "center",
  max = "max-w-3xl",
}) {
  const centered = align === "center";
  return (
    <div className={`${max} ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Kicker palette={palette} fonts={fonts} light={light}>{eyebrow}</Kicker>}
      <h2
        className="mt-4"
        style={{
          ...fonts.displayFont,
          color: light ? "#FFFFFF" : palette.primaryDeep,
          fontSize: "clamp(2.5rem, 5vw, 4.7rem)",
          lineHeight: 1,
          fontWeight: 630,
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`${centered ? "mx-auto" : ""} mt-6 max-w-2xl`}
          style={{
            ...fonts.bodyFont,
            color: light ? "rgba(255,255,255,0.80)" : palette.muted,
            fontSize: "16px",
            lineHeight: 1.75,
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

export function ElevatedCard({ children, palette, className = "", style = {} }) {
  return (
    <div
      className={`card-satin ${className}`}
      style={{
        background: palette.surface,
        // A tiny colored reflection in one corner, not a wash across the
        // card - 6% is deliberate: enough to feel intentional, nowhere
        // near enough to tint the card's own white/cream base.
        backgroundImage: `radial-gradient(160px 120px at 100% 0%, ${rgba(palette.gold, 0.06)}, transparent 70%)`,
        border: `1px solid ${rgba(palette.gold, 0.35)}`,
        borderRadius: "6px",
        boxShadow: "0 1px 2px rgba(18,32,26,0.04), 0 10px 22px rgba(18,32,26,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, palette, fonts, light = false }) {
  return (
    <button
      onClick={onClick}
      className="btn-gloss inline-flex items-center gap-3 rounded-full transition-transform hover:-translate-y-0.5"
      style={{
        ...fonts.bodyFont,
        background: light
          ? metallicGoldGradient(palette, { onDark: false, angle: "170deg" })
          : `linear-gradient(160deg, ${palette.primary} 0%, ${palette.primaryDeep} 100%)`,
        color: light ? palette.primaryDeep : "#FFFFFF",
        padding: "15px 26px",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        boxShadow: light
          ? `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.12), 0 14px 30px ${rgba(palette.goldDeep, 0.28)}`
          : `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -3px 5px rgba(0,0,0,0.30), 0 8px 16px ${rgba(palette.primaryDeep, 0.35)}, 0 18px 34px ${rgba(palette.primaryDeep, 0.22)}`,
        border: light ? "none" : `1px solid ${palette.gold}`,
      }}
    >
      {children}
      <ArrowRight size={15} />
    </button>
  );
}

export function FullBleedStatement({
  image,
  imageAlt = "",
  eyebrow,
  title,
  body,
  palette,
  fonts,
  children,
  position = "center",
}) {
  return (
    <section
      className="relative min-h-[460px] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(90deg, ${rgba(palette.primaryDeep, 0.93)} 0%, ${rgba(
          palette.primaryDeep,
          0.68
        )} 52%, ${rgba(palette.primaryDeep, 0.28)} 100%), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: position,
        display: "flex",
        alignItems: "center",
      }}
      aria-label={imageAlt || undefined}
    >
      <div aria-hidden="true" className="glossy-sheen" style={{ zIndex: 0 }} />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-10">
        <Reveal className="max-w-3xl">
          {eyebrow && <Kicker palette={palette} fonts={fonts} light>{eyebrow}</Kicker>}
          <h2
            className="mt-4"
            style={{
              ...fonts.displayFont,
              color: "#FFFFFF",
              fontSize: "clamp(3rem, 6vw, 5.8rem)",
              lineHeight: 0.98,
              fontWeight: 630,
              textShadow: "0 5px 28px rgba(0,0,0,0.22)",
            }}
          >
            {title}
          </h2>
          {body && (
            <p
              className="mt-7 max-w-2xl"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.84)",
                fontSize: "17px",
                lineHeight: 1.75,
              }}
            >
              {body}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function SparkleRule({ palette }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <span className="h-px w-16" style={{ background: rgba(palette.gold, 0.5) }} />
      <Sparkles size={15} color={palette.goldDeep} />
      <span className="h-px w-16" style={{ background: rgba(palette.gold, 0.5) }} />
    </div>
  );
}
