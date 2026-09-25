import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { withBasePath } from "../apiBase";

// One reusable QR per quantity-tracked product (all 70 clear wine glasses
// share one label). Scanning it opens /scan?i=<item id>, which asks which
// booking is being packed and how many are going in.
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://asliceofg.com";

function productScanUrl(itemId) {
  return `${SITE_URL}${withBasePath(`/scan?i=${encodeURIComponent(itemId)}`)}`;
}

function productCode(itemId) {
  return `ASG-I-${String(itemId).padStart(4, "0")}`;
}

export default function QuantityQrLabels({ items = [] }) {
  const quantityItems = useMemo(
    () =>
      items.filter(
        (item) => item.active !== false && item.tracking_mode !== "serialized" && Number(item.quantity_owned || 0) > 0
      ),
    [items]
  );

  const [qrById, setQrById] = useState({});
  const [printing, setPrinting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        quantityItems.map(async (item) => [item.id, await QRCode.toDataURL(productScanUrl(item.id), { margin: 1, width: 320 })])
      );
      if (!cancelled) setQrById(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [quantityItems]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? quantityItems.filter((item) => item.name.toLowerCase().includes(q)) : quantityItems;
  }, [quantityItems, search]);

  const toPrint = selected.length ? quantityItems.filter((item) => selected.includes(item.id)) : quantityItems;

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  // Only one label sheet may be visible to the printer at a time; the
  // asset sheet in AdminAssetsTab uses the same is-printing switch.
  const print = () => {
    setPrinting(true);
    window.setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 50);
  };

  if (!quantityItems.length) return null;

  return (
    <section className="mt-10 border-t border-[#E6E6E6] pt-8">
      <style>{`
        .quantity-product-label-sheet { display: none; }
        @media print {
          body * { visibility: hidden; }
          .quantity-product-label-sheet.is-printing, .quantity-product-label-sheet.is-printing * { visibility: visible; }
          .quantity-product-label-sheet.is-printing {
            display: grid; position: absolute; left: 0; top: 0; width: 100%;
            grid-template-columns: repeat(3, 1fr); gap: 0.25in; padding: 0.5in;
          }
          .quantity-product-label {
            display: flex; align-items: center; gap: 0.12in;
            min-height: 2.5in; padding: 0.15in;
            border: 1px dashed #bbb; break-inside: avoid;
          }
          .quantity-product-label img { width: 1.5in; height: 1.5in; flex: none; }
          .quantity-product-label-name { font-family: Jost, Helvetica, Arial, sans-serif; font-size: 9pt; font-weight: 600; line-height: 1.2; }
          .quantity-product-label-code { margin-top: 2pt; font-family: Jost, Helvetica, Arial, sans-serif; font-size: 8pt; letter-spacing: 0.06em; color: #444; }
        }
      `}</style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Product QR labels</h3>
          <p className="mt-1 max-w-xl font-[Space_Grotesk] text-xs leading-relaxed text-[#8C846F]">
            One reusable QR per product. Scan it, pick the booking, then enter how many are being packed. You do not
            need a separate label on every glass, charger or napkin.
          </p>
        </div>

        <button
          type="button"
          onClick={print}
          className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] px-5 py-2.5 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.14em] text-[#0B4933]"
        >
          <Printer size={13} />
          PRINT {selected.length ? `${selected.length} PRODUCT LABEL${selected.length === 1 ? "" : "S"}` : "ALL PRODUCT LABELS"}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products"
        className="mb-3 w-full rounded-sm border border-[#D9D9D9] bg-white px-3 py-2.5 font-[Space_Grotesk] text-sm outline-none focus:border-[#0B4933] sm:max-w-xs"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-sm border border-[#E6E6E6] bg-white p-3">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
              className="h-4 w-4 flex-none accent-[#0B4933]"
              aria-label={`Select ${item.name}`}
            />
            {qrById[item.id] ? <img src={qrById[item.id]} alt="" className="h-14 w-14 flex-none" /> : <div className="h-14 w-14 flex-none" />}
            <div className="min-w-0">
              <p className="font-[Space_Grotesk] text-sm font-semibold text-[#292929]">{item.name}</p>
              <p className="font-[Space_Grotesk] text-xs tracking-[0.08em] text-[#8C846F]">
                {productCode(item.id)} · {item.quantity_owned ?? 0} owned
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className={`quantity-product-label-sheet ${printing ? "is-printing" : ""}`}>
        {toPrint.map((item) => (
          <div className="quantity-product-label" key={item.id}>
            {qrById[item.id] && <img src={qrById[item.id]} alt="" />}
            <div>
              <div className="quantity-product-label-name">{item.name}</div>
              <div className="quantity-product-label-code">{productCode(item.id)}</div>
              <div className="quantity-product-label-code">SCAN, THEN ENTER QUANTITY</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
