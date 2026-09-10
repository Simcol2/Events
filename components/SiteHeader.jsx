import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import EventTypeBar from "./EventTypeBar";

export default function SiteHeader({ current, navigate, nav }) {
  const { palette, fonts } = usePalette();
  const { chooseEventType, openPickerForBuilder } = useEventType();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Most nav items just navigate. A few carry extra intent: `opensPicker`
  // shows the "what are you planning?" popup instead of navigating directly
  // (used by the Build My Experience CTA and the group parents that don't
  // map to one event type), and `eventTypeId` pre-selects a type before
  // navigating (used by the specific event links inside those groups).
  const go = (item) => {
    setOpen(false);
    if (item.opensPicker) {
      openPickerForBuilder();
      return;
    }
    if (item.eventTypeId) chooseEventType(item.eventTypeId);
    navigate(item.path);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ borderBottom: `1px solid ${palette.line}CC`, background: `${palette.bg}F2` }}
    >
      {/* Event-type bar sits above everything else, on every page */}
      <EventTypeBar />

      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => go({ path: "/" })} className="group text-left">
          <div className="font-[Jost] text-sm font-semibold tracking-[0.42em]" style={{ color: palette.goldDeep }}>
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
          {nav.map((item) => {
            const { label, path, cta, children } = item;
            const active = path === "/" ? current === "home" : current === path.slice(1);
            if (cta) {
              return (
                <button
                  key={path}
                  onClick={() => go(item)}
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
                    onClick={() => go(item)}
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
                          key={child.path + (child.eventTypeId || "")}
                          onClick={() => go(child)}
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
                onClick={() => go(item)}
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
            {nav.map((item) => {
              const isExpanded = Boolean(expanded[item.path]);
              return (
                <React.Fragment key={item.path}>
                  <button
                    onClick={() => (item.children ? toggleExpanded(item.path) : go(item))}
                    className={
                      item.cta
                        ? "mt-3 rounded-full py-3.5 text-center font-[Jost] text-sm font-semibold tracking-[0.22em] text-white"
                        : "flex items-center justify-between py-4 text-left font-[Jost] text-sm font-medium tracking-[0.22em]"
                    }
                    style={
                      item.cta
                        ? { background: palette.primaryDeep }
                        : { borderBottom: item.children && isExpanded ? "none" : `1px solid ${palette.line}CC`, color: palette.primaryDeep }
                    }
                  >
                    {item.label.toUpperCase()}
                    {item.children && (
                      <span aria-hidden="true" style={{ color: palette.goldDeep }}>
                        {isExpanded ? "−" : "+"}
                      </span>
                    )}
                  </button>
                  {item.children && isExpanded &&
                    item.children.map((child) => (
                      <button
                        key={child.path + (child.eventTypeId || "")}
                        onClick={() => go(child)}
                        className="py-3 pl-5 text-left font-[Jost] text-sm font-medium tracking-[0.18em]"
                        style={{ borderBottom: `1px solid ${palette.line}CC`, color: palette.muted }}
                      >
                        {child.label.toUpperCase()}
                      </button>
                    ))}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
