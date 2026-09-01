import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePalette } from "../PaletteContext";
import EventTypeBar from "./EventTypeBar";

export default function SiteHeader({ current, navigate, nav }) {
  const { palette, fonts } = usePalette();
  const [open, setOpen] = useState(false);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ borderBottom: `1px solid ${palette.line}CC`, background: `${palette.bg}F2` }}
    >
      {/* Event-type bar sits above everything else, on every page */}
      <EventTypeBar />

      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => go("/")} className="group text-left">
          <div className="font-[Jost] text-[9px] font-semibold tracking-[0.42em]" style={{ color: palette.gold }}>
            A SLICE OF G
          </div>
          <div
            className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-none tracking-[0.03em]"
            style={{ color: palette.primaryDeep }}
          >
            EVENTS
          </div>
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map(({ label, path }) => {
            const active = path === "/" ? current === "home" : current === path.slice(1);
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className="relative py-2 font-[Jost] text-[11px] font-medium tracking-[0.2em] transition-colors"
                style={{ color: active ? palette.primaryDeep : palette.muted }}
              >
                {label.toUpperCase()}
                {active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-5"
                    style={{ background: palette.gold }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 md:hidden"
          style={{ color: palette.primaryDeep }}
          aria-label="Open menu"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open && (
        <div className="px-5 py-4 md:hidden" style={{ borderTop: `1px solid ${palette.line}`, background: palette.bg }}>
          <nav className="mx-auto flex max-w-7xl flex-col">
            {nav.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => go(path)}
                className="py-4 text-left font-[Jost] text-[11px] font-medium tracking-[0.22em]"
                style={{ borderBottom: `1px solid ${palette.line}CC`, color: palette.primaryDeep }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
