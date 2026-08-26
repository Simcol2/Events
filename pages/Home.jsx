import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function Home({ navigate }) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#E4DCC8]">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="font-[Jost] text-[10px] font-semibold tracking-[0.35em] text-[#B8935A]">
              EVENT RENTALS, REIMAGINED
            </div>
            <h1 className="mt-5 font-['Cormorant_Garamond'] text-[72px] font-semibold leading-[.84] tracking-[-0.04em] text-[#4E5A44] sm:text-[92px]">
              You bring
              <br />
              the people.
              <br />
              <span className="font-[Parisienne] text-[62px] font-normal tracking-normal text-[#B8935A] sm:text-[76px]">
                We bring the vibe.
              </span>
            </h1>
            <p className="mt-8 max-w-xl font-[Jost] text-[15px] leading-8 text-[#716B5C]">
              Thoughtfully curated decor, playful activities and little details that make a celebration feel like yours.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => navigate("/reservations")} className="inline-flex items-center gap-3 bg-[#4E5A44] px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white transition hover:bg-[#3F4937]">
                PLAN YOUR EVENT <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate("/decor")} className="inline-flex items-center gap-3 border border-[#B8935A] px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44] transition hover:bg-[#F3EEE2]">
                EXPLORE DECOR
              </button>
            </div>
          </div>

          <div className="relative min-h-[420px] bg-[#EAE5D7]">
            <div className="absolute inset-5 border border-[#B8935A]/60" />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <div>
                <div className="font-[Parisienne] text-6xl text-[#B8935A]">beautifully</div>
                <div className="mt-1 font-['Cormorant_Garamond'] text-6xl font-semibold text-[#4E5A44]">curated</div>
                <div className="mx-auto mt-5 h-px w-14 bg-[#B8935A]" />
                <div className="mt-5 font-[Jost] text-[9px] tracking-[0.28em] text-[#817A68]">BABY SHOWERS · CELEBRATIONS · MOMENTS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="THE EXPERIENCE"
          title="More than a rental."
          subtitle="A Slice of G is built around the pieces that make a party feel intentional, without making the host become an event planner."
        />

        <div className="mt-16 grid gap-px border border-[#E4DCC8] bg-[#E4DCC8] md:grid-cols-3">
          {[
            ["01", "THE DECOR", "Statement pieces, tabletop details and the little things that pull a theme together.", "/decor"],
            ["02", "THE ACTIVITIES", "Games and experiences guests actually want to participate in.", "/activities"],
            ["03", "THE PACKAGE", "A curated setup that gives you the vibe without the shopping list.", "/reservations"],
          ].map(([num, title, body, path]) => (
            <button key={num} onClick={() => navigate(path)} className="bg-[#FAF6ED] p-8 text-left transition hover:bg-[#F3EEE2] sm:p-10">
              <div className="font-[Cormorant_Garamond] text-4xl text-[#B8935A]">{num}</div>
              <h2 className="mt-8 font-[Jost] text-[10px] font-semibold tracking-[0.25em] text-[#4E5A44]">{title}</h2>
              <p className="mt-4 font-[Jost] text-sm leading-7 text-[#716B5C]">{body}</p>
              <div className="mt-7 flex items-center gap-2 font-[Jost] text-[9px] font-semibold tracking-[0.18em] text-[#B8935A]">
                EXPLORE <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#4E5A44] text-[#FAF6ED]">
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
          <Sparkles className="mx-auto text-[#B8935A]" size={20} strokeWidth={1.2} />
          <div className="mt-5 font-[Jost] text-[9px] font-semibold tracking-[0.3em] text-[#D4BC91]">THE POINT</div>
          <h2 className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl">
            The vibe is in the details.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-[Jost] text-sm leading-7 text-[#DAD7C9]">
            Start with a package, browse the collection, or build exactly what you have in mind.
          </p>
          <button onClick={() => navigate("/reservations")} className="mt-8 border border-[#D4BC91] px-7 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white hover:bg-white/5">
            START PLANNING
          </button>
        </div>
      </section>
    </div>
  );
}
