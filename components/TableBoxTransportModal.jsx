import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PackageCheck, X } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import { rgba } from "./EditorialKit";

const TRANSPORT_IMAGE = "/photos/how-your-rental-table-box-travels.png";

// Rendered through a portal into document.body, unlike every other modal
// on this page: SiteHeader is `position: sticky` with its own z-50
// stacking context, and a `position: fixed` modal nested deep inside
// <main> (even at a very high z-index) still paints behind it in
// Chromium - a real, pre-existing quirk confirmed by testing, not
// something specific to this component. Escaping to a literal sibling of
// the header in the DOM sidesteps it entirely.
export default function TableBoxTransportModal({
  triggerLabel = "SEE HOW YOUR RENTAL TRAVELS",
  triggerClassName = "",
  triggerStyle = {},
}) {
  const { palette, fonts } = usePalette();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-xs font-bold tracking-[0.11em] transition ${triggerClassName}`}
        style={{
          ...fonts.bodyFont,
          color: palette.primaryDeep,
          borderColor: rgba(palette.primaryDeep, 0.42),
          background: palette.surface,
          boxShadow: `0 8px 24px ${rgba(palette.ink, 0.06)}`,
          ...triggerStyle,
        }}
      >
        <PackageCheck size={16} strokeWidth={2.1} />
        {triggerLabel}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-6"
            style={{
              background: "rgba(8, 18, 14, 0.78)",
              backdropFilter: "blur(8px)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="How your rental travels"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl"
              style={{
                background: palette.surface,
                border: `1px solid ${rgba(palette.gold, 0.38)}`,
                boxShadow: "0 32px 110px rgba(0,0,0,.42)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5"
                style={{ borderColor: palette.line }}
              >
                <div>
                  <p
                    style={{
                      ...fonts.bodyFont,
                      color: palette.goldDeep,
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                    }}
                  >
                    PACKED WITH A PLAN
                  </p>
                  <h2
                    className="mt-1"
                    style={{
                      ...fonts.displayFont,
                      color: palette.primaryDeep,
                      fontSize: "clamp(1.25rem, 2.8vw, 1.8rem)",
                      fontWeight: 650,
                      lineHeight: 1.05,
                    }}
                  >
                    How your rental travels
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close transport guide"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    color: palette.primaryDeep,
                    background: rgba(palette.primaryDeep, 0.06),
                  }}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="overflow-y-auto">
                <img
                  src={withBasePath(TRANSPORT_IMAGE)}
                  alt="Guide showing how glassware, dinnerware, serving pieces, linens and decor are safely packed for Table Box pickup, delivery and return."
                  className="block h-auto w-full"
                />
              </div>

              <div
                className="border-t px-4 py-3 text-center sm:px-5"
                style={{ borderColor: palette.line, background: rgba(palette.primaryDeep, 0.025) }}
              >
                <p
                  style={{
                    ...fonts.bodyFont,
                    color: palette.muted,
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Transport method may vary slightly by order size and item mix.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
