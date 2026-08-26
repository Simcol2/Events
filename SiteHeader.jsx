import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function SiteHeader({ current, navigate, nav }) {
  const [open, setOpen] = useState(false);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E4DCC8]/80 bg-[#FAF6ED]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => go("/")} className="group text-left">
          <div className="font-[Jost] text-[9px] font-semibold tracking-[0.42em] text-[#B8935A]">A SLICE OF G</div>
          <div className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-none tracking-[0.03em] text-[#4E5A44]">
            EVENTS
          </div>
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map(({ label, path }) => {
            const active =
              (current === "home" && path === "/") ||
              (current === "decor" && path === "/decor") ||
              (current === "activities" && path === "/activities") ||
              (current === "reservations" && path === "/reservations");
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className={`relative py-2 font-[Jost] text-[11px] font-medium tracking-[0.2em] transition-colors ${
                  active ? "text-[#4E5A44]" : "text-[#7C7667] hover:text-[#4E5A44]"
                }`}
              >
                {label.toUpperCase()}
                {active && <span className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-5 bg-[#B8935A]" />}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 text-[#4E5A44] md:hidden"
          aria-label="Open menu"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#E4DCC8] bg-[#FAF6ED] px-5 py-4 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col">
            {nav.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => go(path)}
                className="border-b border-[#E4DCC8]/70 py-4 text-left font-[Jost] text-[11px] font-medium tracking-[0.22em] text-[#4E5A44]"
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
