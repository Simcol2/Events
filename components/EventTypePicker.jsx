import React, { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

const EXIT_DURATION = 280;

// Full-screen overlay asking "what are you planning?" It auto-opens once
// (see App.jsx) and is reopened anytime via the persistent EventTypeBar in
// the header. Picking a card, or dismissing, both resolve the choice so it
// never nags a visitor twice; see EventTypeContext.closePicker.
//
// Stays mounted a beat after `isPickerOpen` goes false so the fade/scale-out
// can actually play instead of the whole thing snapping away instantly.
export default function EventTypePicker() {
  const { palette, fonts } = usePalette();
  const { eventTypes, eventTypeId, isPickerOpen, chooseEventType, closePicker } = useEventType();
  const [mounted, setMounted] = useState(isPickerOpen);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isPickerOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = "";
      };
    }
    if (mounted) {
      setEntered(false);
      const timer = setTimeout(() => setMounted(false), EXIT_DURATION);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPickerOpen]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
      style={{
        background: "rgba(20,18,12,.72)",
        backdropFilter: "blur(6px)",
        opacity: entered ? 1 : 0,
        transition: `opacity ${EXIT_DURATION}ms ease`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose what you're planning"
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
        style={{
          background: palette.surface,
          boxShadow: "0 24px 80px rgba(0,0,0,.35)",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) scale(1)" : "translateY(14px) scale(0.97)",
          transition: `opacity ${EXIT_DURATION}ms ease, transform ${EXIT_DURATION}ms cubic-bezier(.22,1,.36,1)`,
        }}
      >
        <button
          onClick={closePicker}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ color: palette.muted }}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="px-6 pb-8 pt-10 text-center sm:px-12">
          <Heart className="mx-auto" size={22} strokeWidth={1.4} style={{ color: palette.gold }} />
          <p
            className="mt-4 text-xs font-semibold tracking-[0.3em]"
            style={{ ...fonts.bodyFont, color: palette.gold }}
          >
            LET'S START WITH THE CELEBRATION
          </p>
          <h2
            className="mt-2 text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            What are you celebrating?
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-base leading-6"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            Choose your event and we'll show you the experiences designed for it.
            You can change this anytime.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {eventTypes.map((type) => {
              const active = type.id === eventTypeId;
              return (
                <button
                  key={type.id}
                  onClick={() => chooseEventType(type.id)}
                  className="rounded-xl px-5 py-4 text-left transition-all hover:-translate-y-0.5"
                  style={{
                    background: active ? `${palette.accent}14` : palette.bg,
                    border: active ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`,
                  }}
                >
                  <span
                    className="text-base font-semibold"
                    style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                  >
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={closePicker}
            className="mt-7 text-sm font-semibold tracking-[0.15em] underline underline-offset-4"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            NOT SURE YET? SKIP FOR NOW
          </button>
        </div>
      </div>
    </div>
  );
}
