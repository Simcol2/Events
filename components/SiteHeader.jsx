import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
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
          <div className="font-[Jost] text-sm font-semibold tracking-[0.42em]" style={{ color: palette.gold }}>
            A SLICE OF G
          </div>
          <div
            className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-none tracking-[0.03em]"
            style={{ color: palette.primaryDeep }}
          >
            EVENTS
          </div>
        </button>

        <nav className="hidden items-center gap-3 md:flex lg:gap-4">
          {nav.map(({ label, path, cta, children }) => {
            const active = path === "/" ? current === "home" : current === path.slice(1);
            if (cta) {
              return (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className="rounded-full px-4 py-2.5 font-[Jost] text-sm font-semibold tracking-[0.1em] text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: palette.primaryDeep }}
                >
                  {label.toUpperCase()}
                </button>
              );
            }
            if (children) {
              const childActive = children.some((c) => current === c.path.slice(1));
              return (
                <div key={path} className="group relative">
                  <button
                    onClick={() => go(path)}
                    className="relative flex items-center gap-1 whitespace-nowrap py-2 font-[Jost] text-sm font-medium tracking-[0.02em] transition-colors"
                    style={{ color: active || childActive ? palette.primaryDeep : palette.muted }}
                  >
                    {label.toUpperCase()}
                    <ChevronDown size={13} />
                    {(active || childActive) && (
                      <span
                        className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-5"
                        style={{ background: palette.gold }}
                      />
                    )}
                  </button>
                  <div
                    className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-sm pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                  >
                    <div className="overflow-hidden rounded-sm shadow-lg" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
                      {children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => go(child.path)}
                          className="block w-full whitespace-nowrap px-5 py-3 text-left font-[Jost] text-sm font-medium tracking-[0.1em] transition-colors hover:opacity-70"
                          style={{ color: current === child.path.slice(1) ? palette.primaryDeep : palette.ink }}
                        >
                          {child.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className="relative whitespace-nowrap py-2 font-[Jost] text-sm font-medium tracking-[0.02em] transition-colors"
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
            {nav.map(({ label, path, cta, children }) => (
              <React.Fragment key={path}>
                <button
                  onClick={() => go(path)}
                  className={cta ? "mt-3 rounded-full py-3.5 text-center font-[Jost] text-sm font-semibold tracking-[0.22em] text-white" : "py-4 text-left font-[Jost] text-sm font-medium tracking-[0.22em]"}
                  style={cta ? { background: palette.primaryDeep } : { borderBottom: children ? "none" : `1px solid ${palette.line}CC`, color: palette.primaryDeep }}
                >
                  {label.toUpperCase()}
                </button>
                {children?.map((child) => (
                  <button
                    key={child.path}
                    onClick={() => go(child.path)}
                    className="py-3 pl-5 text-left font-[Jost] text-sm font-medium tracking-[0.18em]"
                    style={{ borderBottom: `1px solid ${palette.line}CC`, color: palette.muted }}
                  >
                    {child.label.toUpperCase()}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
