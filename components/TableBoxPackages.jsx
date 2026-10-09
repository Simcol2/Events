// ASG_TABLE_BOX_CARD_GRID_POLISH_V1 (remove price disclaimer, preserve cart success status)
// ASG_TABLE_BOX_LEGIBILITY_GRID_V1
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import { tableBoxPackagePath } from "../seo";
import { ElevatedCard, Kicker, rgba } from "./EditorialKit";
import TableBoxTransportModal from "./TableBoxTransportModal";
import TableBoxPackageCarousel from "./TableBoxPackageCarousel";
import TableBoxPackageConfigurator from "./TableBoxPackageConfigurator";
import { money, photoUrl, useTableBoxPackages } from "./tableBoxPackageData";

// A plain left-click follows the in-app router; anything else (new tab,
// copy link, crawlers) uses the real href.
function goTo(navigate, path, after) {
  return (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    after?.();
    navigate(path);
  };
}

function PackageModal({ pkg, addons, deliveryItem, navigate, onClose, onAdded }) {
  const { palette, fonts } = usePalette();

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portaled to document.body: SiteHeader is `position: sticky` with its
  // own z-50 stacking context, and a `position: fixed` modal nested deep
  // inside <main> - regardless of z-index - paints behind it in Chromium
  // (a confirmed, pre-existing quirk, not specific to this modal). Escaping
  // to a literal sibling of the header in the DOM sidesteps it entirely.
  return createPortal(
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(12,20,16,.76)", backdropFilter: "blur(7px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={pkg.name}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
        style={{ background: palette.surface, boxShadow: "0 28px 100px rgba(0,0,0,.35)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close package"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,.92)", color: palette.primaryDeep }}
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-[260px] bg-cover bg-center md:min-h-full" style={{ backgroundImage: `url(${photoUrl(pkg.image_url)})` }} />

          <div className="p-6 sm:p-8">
            <Kicker palette={palette} fonts={fonts}>PRE-BUILT TABLE BOX · {pkg.guest_count} GUESTS</Kicker>
            <h2 className="mt-3" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 650 }}>
              {pkg.name}
            </h2>
            <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.65 }}>{pkg.blurb}</p>
            <a
              href={withBasePath(tableBoxPackagePath(pkg.slug))}
              onClick={goTo(navigate, tableBoxPackagePath(pkg.slug), onClose)}
              className="mt-2 inline-block underline"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}
            >
              See the full {pkg.name} Table Box page →
            </a>

            <TableBoxPackageConfigurator
              pkg={pkg}
              addons={addons}
              deliveryItem={deliveryItem}
              onAdded={(added) => {
                onAdded?.(added);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function TableBoxPackages({ navigate }) {
  const { palette, fonts } = usePalette();
  const { packages, addons, deliveryItem, error } = useTableBoxPackages();
  const [activePackage, setActivePackage] = useState(null);
  const [status, setStatus] = useState("");

  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-14">
          <div className="mx-auto max-w-3xl text-left sm:text-center">
            {/* ASG_TABLE_BOX_HERO_NAV_GLASS_V1: readable hero over fixed tabletop artwork */}
            <div
              className="rounded-[30px] border px-5 py-6 shadow-[0_8px_32px_rgba(9,49,37,.08)] sm:px-9 sm:py-9" /* ASG_TABLE_BOX_GLASS_NAV_REFINEMENT_V2 */
              style={{ background: "rgba(255,252,247,.58)", WebkitBackdropFilter: "blur(30px) saturate(115%)", backdropFilter: "blur(30px) saturate(115%)", borderColor: "rgba(255,255,255,.55)" }}
            >
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.18em]" style={{ color: "#FFFFFF", background: "rgba(5,62,45,.86)" }}>HOSTING AT HOME</span>
            <h1
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(3rem, 7vw, 6.4rem)",
                fontWeight: 640,
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
              }}
            >
              Start with a <span style={{ color: palette.accent }}>Table Box.</span>
            </h1>
            <p className="mx-auto mt-6" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(1.35rem, 2.4vw, 2rem)", lineHeight: 1.25 }}>
              Use what you own.
              <br />
              Rent what makes it better.
            </p>
            <p className="mx-auto mt-5 max-w-lg" style={{ ...fonts.bodyFont, color: "#335548", fontSize: "16px", lineHeight: 1.7 }}>
              Want the easy version? Start with a ready-made box, add anything seasonal you want, and see every
              dollar before it goes into your cart.
            </p>
            </div>
            {/* ASG TABLE BOX CHOICE PATHS: two simple ways to start */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Choose how to build your Table Box">
              <a
                href="#ready-made-table-boxes"
                className="group block rounded-[20px] border px-5 py-5 text-left shadow-[0_6px_18px_rgba(9,49,37,.10)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: "#FCF9F2", borderColor: "#D7BE92", color: "#103E2E" }}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#AD5B43" }}>THE EASY START</span>
                <strong className="mt-2 block font-serif text-[23px] leading-tight">Choose a Ready-Made Box</strong>
                <span className="mt-2 block text-sm leading-relaxed" style={{ color: "#335548" }}>A coordinated setup with a visible package price. Customize only if you want to.</span>
                <span className="mt-3 block text-sm font-bold">See ready-made boxes →</span>
              </a>
              <a
                href="#build-your-own-table-box"
                className="group block rounded-[20px] border px-5 py-5 text-left shadow-[0_6px_18px_rgba(9,49,37,.10)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: "#FCF9F2", borderColor: "#D7BE92", color: "#103E2E" }}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#AD5B43" }}>MAKE IT YOURS</span>
                <strong className="mt-2 block font-serif text-[23px] leading-tight">Build My Own</strong>
                <span className="mt-2 block text-sm leading-relaxed" style={{ color: "#335548" }}>Choose the pieces you need from three simple groups. Everything else is optional.</span>
                <span className="mt-3 block text-sm font-bold">Build my box →</span>
              </a>
            </div>
            <div
              className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1 sm:justify-center"
              style={{ ...fonts.bodyFont, color: "#FFFFFF", background: "rgba(5,62,45,.85)", borderRadius: "12px", padding: "9px 14px", fontSize: "14px", fontWeight: 650 }}
            >
              <span>$50 minimum rental</span>
              <span aria-hidden="true">&middot;</span>
              <span>Toronto pickup &amp; return</span>
              <span aria-hidden="true">&middot;</span>
              <span>Delivery + basic setup available</span>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:justify-center">
              <TableBoxTransportModal />
            </div>
          </div>

          {error ? (
            <p className="mt-8" style={{ ...fonts.bodyFont, color: palette.muted }}>{error}</p>
          ) : (
            packages.length > 0 && (
              <>
                <div id="ready-made-table-boxes" className="scroll-mt-28"><TableBoxPackageCarousel packages={packages} onOpen={(pkg) => setActivePackage(pkg)} /></div>
                <nav
                  aria-label="Table Box package pages"
                  className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6"
                >
                  {packages.map((pkg) => (
                    <a
                      key={pkg.id}
                      href={withBasePath(tableBoxPackagePath(pkg.slug))}
                      onClick={goTo(navigate, tableBoxPackagePath(pkg.slug))}
                      className="underline"
                      style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "13px", fontWeight: 600 }}
                    >
                      {pkg.name} Table Box: everything included →
                    </a>
                  ))}
                </nav>
              </>
            )
          )}

          {status && (
            <p className="mt-3 text-center font-semibold" role="status" style={{ ...fonts.bodyFont, color: "#07563F", fontSize: "14px" }}>
              {status}
            </p>
          )}

          {navigate && (
            <div className="mt-10 rounded-[26px] border p-6 text-center shadow-[0_12px_36px_rgba(10,48,35,.12)] sm:p-8" style={{ background: "rgba(255,252,247,.78)", WebkitBackdropFilter: "blur(18px)", backdropFilter: "blur(18px)", borderColor: "rgba(215,190,146,.65)" }}>
              <h3
                style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(1.3rem, 2.6vw, 1.7rem)", fontWeight: 640, lineHeight: 1.2 }}
              >
                Hosting something a little bigger?
              </h3>
              <p className="mx-auto mt-2 max-w-md" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.6 }}>
                Need an arch, backdrop, display stand, signage or larger décor?
              </p>
              <button
                type="button"
                onClick={() => navigate("/decor")}
                className="mt-4"
                style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "14px", fontWeight: 700 }}
              >
                Browse the full décor collection →
              </button>
            </div>
          )}
        </div>
      </section>

      {activePackage && (
        <PackageModal
          pkg={activePackage}
          addons={addons}
          deliveryItem={deliveryItem}
          navigate={navigate}
          onClose={() => setActivePackage(null)}
          onAdded={(pkg) => setStatus(`${pkg.name} added to your cart.`)}
        />
      )}
    </>
  );
}
