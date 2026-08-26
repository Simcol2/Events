import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Leaf } from "lucide-react";

import heroImage from "./media/file_000000009b0081f6ab943d7379508069.png";

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : "translateY(28px)",
        transition: `opacity 800ms ease ${delay}ms, transform 800ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home({ navigate }) {
  const heroRef = useRef(null);
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const progress =
          (viewportHeight - rect.top) /
          (viewportHeight + rect.height);

        setHeroOffset((progress - 0.5) * 35);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={heroRef}
        className="relative border-b border-[#E4DCC8] overflow-hidden"
        style={{
          background: "#FAF6ED",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">

          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

            {/* HERO COPY */}

            <Reveal className="relative z-10">
              <div
                className="font-[Jost] text-[10px] font-semibold tracking-[0.35em]"
                style={{
                  color: "#B8935A",
                }}
              >
                EVENT RENTALS, REIMAGINED
              </div>

              <h1
                className="mt-5 font-['Cormorant_Garamond'] font-semibold tracking-[-0.04em]"
                style={{
                  color: "#4E5A44",
                  fontSize: "clamp(4rem, 8vw, 7rem)",
                  lineHeight: 0.82,
                }}
              >
                You bring
                <br />
                the people.
              </h1>

              <div
                className="mt-3 font-[Parisienne] text-5xl font-normal sm:text-6xl lg:text-7xl"
                style={{
                  color: "#B8935A",
                }}
              >
                We bring the vibe.
              </div>

              <p
                className="mt-8 max-w-xl font-[Jost] text-[15px] leading-8"
                style={{
                  color: "#716B5C",
                }}
              >
                Thoughtfully curated decor, playful activities
                and little details that make a celebration feel
                like yours.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">

                <button
                  onClick={() => navigate("/reservations")}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "#4E5A44",
                    boxShadow: "0 8px 20px rgba(78,90,68,.10)",
                  }}
                >
                  PLAN YOUR EVENT

                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/decor")}
                  className="group inline-flex items-center gap-3 border px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: "#B8935A",
                    color: "#4E5A44",
                  }}
                >
                  EXPLORE DECOR

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

              </div>
            </Reveal>


            {/* HERO IMAGE */}

            <Reveal delay={150}>
              <div
                className="relative group"
                style={{
                  transform: `translateY(${heroOffset}px)`,
                  transition: "transform 120ms linear",
                }}
              >

                <div
                  className="absolute -inset-3 opacity-40"
                  style={{
                    border: "1px solid #B8935A",
                  }}
                />

                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: "4 / 5",
                    background: "#EAE5D7",
                  }}
                >

                  <img
                    src={heroImage}
                    alt="A Slice of G Events"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]"
                  />

                  {/* subtle image overlay */}

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(30,35,27,.02) 0%, rgba(30,35,27,.10) 100%)",
                    }}
                  />

                </div>

                {/* IMAGE CAPTION */}

                <div
                  className="absolute bottom-5 left-5 right-5 flex items-end justify-between"
                >
                  <div
                    className="px-4 py-3 backdrop-blur-sm"
                    style={{
                      background:
                        "rgba(250,246,237,.88)",
                    }}
                  >
                    <div
                      className="font-[Jost] text-[9px] font-semibold tracking-[0.25em]"
                      style={{
                        color: "#4E5A44",
                      }}
                    >
                      A SLICE OF G
                    </div>

                    <div
                      className="mt-1 font-[Jost] text-[8px] tracking-[0.18em]"
                      style={{
                        color: "#8A8268",
                      }}
                    >
                      BABY SHOWERS · CELEBRATIONS · MOMENTS
                    </div>
                  </div>
                </div>

              </div>
            </Reveal>

          </div>
        </div>
      </section>


      {/* =====================================================
          EXPERIENCE
      ===================================================== */}

      <section
        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32"
      >

        <Reveal>
          <SectionHeading
            eyebrow="THE EXPERIENCE"
            title="More than a rental."
            subtitle="A Slice of G is built around the pieces that make a party feel intentional, without making the host become an event planner."
          />
        </Reveal>


        <div className="mt-16 grid gap-px border border-[#E4DCC8] bg-[#E4DCC8] md:grid-cols-3">

          {[
            [
              "01",
              "THE DECOR",
              "Statement pieces, tabletop details and the little things that pull a theme together.",
              "/decor",
            ],
            [
              "02",
              "THE ACTIVITIES",
              "Games and experiences guests actually want to participate in.",
              "/activities",
            ],
            [
              "03",
              "THE PACKAGE",
              "A curated setup that gives you the vibe without the shopping list.",
              "/reservations",
            ],
          ].map(([num, title, body, path], index) => (

            <Reveal key={num} delay={index * 100}>

              <button
                onClick={() => navigate(path)}
                className="group h-full w-full bg-[#FAF6ED] p-8 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-[#F3EEE2] sm:p-10"
              >

                <div
                  className="font-[Cormorant_Garamond] text-4xl transition-transform duration-500 group-hover:translate-x-1"
                  style={{
                    color: "#B8935A",
                  }}
                >
                  {num}
                </div>

                <h2
                  className="mt-8 font-[Jost] text-[10px] font-semibold tracking-[0.25em]"
                  style={{
                    color: "#4E5A44",
                  }}
                >
                  {title}
                </h2>

                <p
                  className="mt-4 font-[Jost] text-sm leading-7"
                  style={{
                    color: "#716B5C",
                  }}
                >
                  {body}
                </p>

                <div
                  className="mt-7 flex items-center gap-2 font-[Jost] text-[9px] font-semibold tracking-[0.18em]"
                  style={{
                    color: "#B8935A",
                  }}
                >
                  EXPLORE

                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>

              </button>

            </Reveal>

          ))}

        </div>
      </section>


      {/* =====================================================
          VISUAL BREAK
      ===================================================== */}

      <Reveal>

        <section className="relative overflow-hidden bg-[#F3EEE2]">

          <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">

            <div className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">

              <Leaf
                size={18}
                strokeWidth={1.2}
                style={{
                  color: "#B8935A",
                }}
              />

              <div
                className="mt-5 font-[Jost] text-[9px] font-semibold tracking-[0.3em]"
                style={{
                  color: "#817A68",
                }}
              >
                BEAUTIFULLY CONSIDERED
              </div>

              <h2
                className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl"
                style={{
                  color: "#4E5A44",
                }}
              >
                It's the little
                <br />
                things.
              </h2>

              <p
                className="mt-6 max-w-xl font-[Jost] text-sm leading-7"
                style={{
                  color: "#716B5C",
                }}
              >
                The right table detail. The game everyone
                actually wants to play. The tiny moment that
                makes someone stop and say, "This is so us."
              </p>

            </div>

            <div
              className="min-h-[360px] lg:min-h-[500px]"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

          </div>

        </section>

      </Reveal>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section
        className="bg-[#4E5A44] text-[#FAF6ED]"
      >

        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">

          <Reveal>

            <Sparkles
              className="mx-auto"
              style={{
                color: "#B8935A",
              }}
              size={20}
              strokeWidth={1.2}
            />

            <div
              className="mt-5 font-[Jost] text-[9px] font-semibold tracking-[0.3em]"
              style={{
                color: "#D4BC91",
              }}
            >
              THE POINT
            </div>

            <h2
              className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl"
            >
              The vibe is in the details.
            </h2>

            <p
              className="mx-auto mt-6 max-w-xl font-[Jost] text-sm leading-7"
              style={{
                color: "#DAD7C9",
              }}
            >
              Start with a package, browse the collection,
              or build exactly what you have in mind.
            </p>

            <button
              onClick={() => navigate("/reservations")}
              className="group mt-8 inline-flex items-center gap-3 border border-[#D4BC91] px-7 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5"
            >
              START PLANNING

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

          </Reveal>

        </div>

      </section>

    </div>
  );
}
