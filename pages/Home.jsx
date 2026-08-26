import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SAGE, SAGE_DEEP, GOLD, CREAM, INK, LINE, MUTED, displayFont, scriptFont, bodyFont, ensureFonts } from "../theme";

const PILLARS = [
  {
    num: "01",
    title: "THE DECOR",
    body: "Statement pieces, tabletop details, and the little things that pull a story together.",
    path: "/decor",
  },
  {
    num: "02",
    title: "THE DIGITAL EXPERIENCE",
    body: "A personalized web app for your event — guest predictions, private messages, a results board that outlives the party.",
    path: "/reservations",
  },
  {
    num: "03",
    title: "THE FUN",
    body: "Photo challenges, trivia, and prediction games your guests actually want to play.",
    path: "/activities",
  },
  {
    num: "04",
    title: "THE KEEPSAKE",
    body: "Something guests take home that means more than a favor bag ever did.",
    path: "/collections",
  },
];

export default function Home({ navigate }) {
  ensureFonts();
  return (
    <div style={{ color: INK }}>
      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="text-[10px] font-semibold tracking-[0.35em]" style={{ ...bodyFont, color: GOLD }}>
              CELEBRATIONS WITH A STORY TO TELL
            </div>
            <h1
              className="mt-5 text-[64px] font-semibold leading-[.9] tracking-[-0.03em] sm:text-[84px]"
              style={{ ...displayFont, color: SAGE_DEEP }}
            >
              Every story
              <br />
              deserves its own
              <br />
              <span style={{ ...scriptFont, fontWeight: 400, color: GOLD, fontSize: "0.72em", letterSpacing: "normal" }}>
                collection.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-[15px] leading-8" style={{ ...bodyFont, color: "#716B5C" }}>
              Curated decor, a personalized digital experience, and interactive moments guests actually
              remember — bundled into one story, built entirely around the people at the center of it.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/collections")}
                className="inline-flex items-center gap-3 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white transition"
                style={{ ...bodyFont, background: SAGE_DEEP }}
              >
                VIEW THE COLLECTIONS <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate("/reservations")}
                className="inline-flex items-center gap-3 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] transition"
                style={{ ...bodyFont, border: `1px solid ${GOLD}`, color: SAGE_DEEP }}
              >
                PLAN YOUR EVENT
              </button>
            </div>
          </div>

          <div className="relative min-h-[420px]" style={{ background: "#EAE5D7" }}>
            <div className="absolute inset-5" style={{ border: `1px solid ${GOLD}99` }} />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <div>
                <div className="text-6xl" style={{ ...scriptFont, color: GOLD }}>sophisticated</div>
                <div className="mt-1 text-6xl font-semibold" style={{ ...displayFont, color: SAGE_DEEP }}>nostalgia</div>
                <div className="mx-auto mt-5 h-px w-14" style={{ background: GOLD }} />
                <div className="mt-5 text-[9px] tracking-[0.28em]" style={{ ...bodyFont, color: "#817A68" }}>
                  STORY COLLECTIONS · $350–$499 CAD
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <p className="text-[9px] font-semibold tracking-[0.3em]" style={{ ...bodyFont, color: GOLD }}>
            THE EXPERIENCE
          </p>
          <h2 className="mt-3 text-5xl font-semibold leading-none sm:text-6xl" style={{ ...displayFont, color: SAGE_DEEP }}>
            More than a rental.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7" style={{ ...bodyFont, color: "#716B5C" }}>
            Every collection is built on four pillars, so nothing about your day feels like an
            afterthought — and nothing about hosting it feels like a second job.
          </p>
        </div>

        <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ border: `1px solid ${LINE}`, background: LINE }}>
          {PILLARS.map((p) => (
            <button
              key={p.num}
              onClick={() => navigate(p.path)}
              className="p-8 text-left transition sm:p-10"
              style={{ background: CREAM }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F3EEE2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = CREAM)}
            >
              <div className="text-4xl" style={{ ...displayFont, color: GOLD }}>{p.num}</div>
              <h3 className="mt-8 text-[10px] font-semibold tracking-[0.25em]" style={{ ...bodyFont, color: SAGE_DEEP }}>
                {p.title}
              </h3>
              <p className="mt-4 text-sm leading-7" style={{ ...bodyFont, color: "#716B5C" }}>{p.body}</p>
              <div className="mt-7 flex items-center gap-2 text-[9px] font-semibold tracking-[0.18em]" style={{ ...bodyFont, color: GOLD }}>
                EXPLORE <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: SAGE_DEEP, color: CREAM }}>
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
          <Sparkles className="mx-auto" color={GOLD} size={20} strokeWidth={1.2} />
          <div className="mt-5 text-[9px] font-semibold tracking-[0.3em]" style={{ ...bodyFont, color: "#D4BC91" }}>
            THE POINT
          </div>
          <h2 className="mt-4 text-5xl font-semibold leading-none sm:text-6xl" style={{ ...displayFont }}>
            The vibe is in the details.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7" style={{ ...bodyFont, color: "#DAD7C9" }}>
            Start with a Collection, browse the decor, or build exactly what you have in mind.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/collections")}
              className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white"
              style={{ ...bodyFont, border: `1px solid ${"#D4BC91"}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              VIEW THE COLLECTIONS
            </button>
            <button
              onClick={() => navigate("/reservations")}
              className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em]"
              style={{ ...bodyFont, background: GOLD, color: SAGE_DEEP }}
            >
              START PLANNING
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
