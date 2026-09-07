import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Printer, Plus, Loader2 } from "lucide-react";
import { adminApi } from "../adminApi";

// The physical asset registry and the label sheet.
//
// Each QR encodes a full https://.../scan?c=ASG-0001 URL rather than the
// bare code, so the phone's own camera app opens it without needing any
// scanner app installed. The code is printed under the QR too, so a label
// that gets scuffed can still be typed in.
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://asliceofg.com";

function scanUrl(code) {
  return `${SITE_URL}/scan?c=${encodeURIComponent(code)}`;
}

function StatusPill({ status }) {
  const styles = {
    in_stock: "bg-[#ECF3EC] text-[#3F6B45]",
    out: "bg-[#FBF1DE] text-[#8A5D14]",
    held: "bg-[#FAECEA] text-[#8E2F27]",
    retired: "bg-[#F0EBDD] text-[#6A6353]",
  };
  const labels = { in_stock: "In stock", out: "Out", held: "Held", retired: "Retired" };
  return (
    <span className={`rounded-full px-2.5 py-1 font-[Jost] text-[10px] font-semibold tracking-[0.08em] ${styles[status] || styles.retired}`}>
      {(labels[status] || status).toUpperCase()}
    </span>
  );
}

function NewAssetForm({ items, onCreate, onCancel, saving }) {
  const [kind, setKind] = useState("unit");
  const [itemId, setItemId] = useState("");
  const [label, setLabel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [delicate, setDelicate] = useState(false);

  // Naming a unit after its catalogue row is right almost every time, so
  // it fills in on selection and stays editable for the exceptions.
  const pickItem = (value) => {
    setItemId(value);
    const match = items.find((i) => String(i.id) === String(value));
    if (match && !label.trim()) setLabel(match.name);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          kind,
          itemId: kind === "unit" && itemId ? Number(itemId) : null,
          label: label.trim(),
          delicate,
          quantity: Number(quantity) || 1,
        });
      }}
      className="mb-6 rounded-sm border border-[#E4DCC8] bg-white p-5"
    >
      <h3 className="mb-4 font-['Cormorant_Garamond'] text-xl font-semibold text-[#4E5A44]">Add assets</h3>

      <div className="mb-4 flex gap-2">
        {[
          { id: "unit", label: "Single asset", hint: "One object, one code" },
          { id: "box", label: "Counted box", hint: "Contents change per rental" },
        ].map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`flex-1 rounded-sm border p-3 text-left ${
              kind === k.id ? "border-[#4E5A44] bg-[#F4F7F2]" : "border-[#D8D0BC] bg-white"
            }`}
          >
            <span className="block font-[Jost] text-sm font-semibold text-[#3A342A]">{k.label}</span>
            <span className="block font-[Jost] text-xs text-[#8C846F]">{k.hint}</span>
          </button>
        ))}
      </div>

      {kind === "unit" && (
        <div className="mb-4">
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">
            CATALOGUE ITEM
          </label>
          <select
            value={itemId}
            onChange={(e) => pickItem(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]"
          >
            <option value="">Not tied to a catalogue item</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">
            LABEL
          </label>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={kind === "box" ? "e.g. Box 1" : "What this object is"}
            className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]"
          />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">
            HOW MANY
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]"
          />
        </div>
      </div>

      <label className="mb-4 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={delicate}
          onChange={(e) => setDelicate(e.target.checked)}
          className="h-3.5 w-3.5 accent-[#4E5A44]"
        />
        <span className="font-[Jost] text-xs text-[#5C5645]">
          Delicate, prompt for padding at check-out
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#4E5A44] px-6 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.16em] text-white disabled:opacity-50"
        >
          {saving ? "ADDING..." : "ADD"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[#D8D0BC] px-6 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.16em] text-[#4E5A44]"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

// Rendered into a hidden container and sent straight to the browser's own
// print dialog, sized for a 3-across sheet of 2.5 inch square labels. No
// label printer needed; regular Avery stock and a home printer work.
function LabelSheet({ assets, qrByCode }) {
  return (
    <div className="label-sheet">
      {assets.map((a) => (
        <div className="label" key={a.id}>
          {qrByCode[a.code] ? <img src={qrByCode[a.code]} alt="" /> : <div className="qr-placeholder" />}
          <div className="label-text">
            <div className="label-name">{a.label}</div>
            <div className="label-code">{a.code}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAssetsTab() {
  const [assets, setAssets] = useState([]);
  const [unlabelled, setUnlabelled] = useState([]);
  const [items, setItems] = useState([]);
  const [qrByCode, setQrByCode] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const printRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [assetData, itemList] = await Promise.all([adminApi.listAssets(), adminApi.listItems()]);
      setAssets(assetData.assets || []);
      setUnlabelled(assetData.unlabelled || []);
      setItems(itemList);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // QR images are generated in the browser rather than stored, so a code
  // never has a stale picture and nothing extra has to be kept in sync.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        assets.map(async (a) => [a.code, await QRCode.toDataURL(scanUrl(a.code), { margin: 1, width: 320 })])
      );
      if (!cancelled) setQrByCode(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [assets]);

  const create = async (payload) => {
    setSaving(true);
    try {
      await adminApi.createAssets(payload);
      setAdding(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDelicate = async (asset) => {
    try {
      await adminApi.updateAsset(asset.id, { delicate: !asset.delicate });
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, delicate: !a.delicate } : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelected = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toPrint = useMemo(
    () => (selected.length ? assets.filter((a) => selected.includes(a.id)) : assets),
    [assets, selected]
  );

  const print = () => window.print();

  if (loading) return <p className="font-[Jost] text-sm text-[#8C846F]">Loading assets...</p>;

  return (
    <div>
      <style>{`
        .label-sheet { display: none; }
        @media print {
          body * { visibility: hidden; }
          .label-sheet, .label-sheet * { visibility: visible; }
          .label-sheet {
            display: grid; position: absolute; left: 0; top: 0; width: 100%;
            grid-template-columns: repeat(3, 1fr); gap: 0.25in; padding: 0.5in;
          }
          .label {
            display: flex; align-items: center; gap: 0.12in;
            height: 2.5in; padding: 0.15in;
            border: 1px dashed #bbb; break-inside: avoid;
          }
          .label img, .qr-placeholder { width: 1.5in; height: 1.5in; flex: none; }
          .label-text { font-family: Jost, Helvetica, Arial, sans-serif; overflow: hidden; }
          .label-name { font-size: 9pt; font-weight: 600; line-height: 1.2; }
          .label-code { font-size: 8pt; letter-spacing: 0.06em; color: #444; margin-top: 2pt; }
        }
      `}</style>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Assets</h2>
        <div className="flex gap-3">
          <button
            onClick={print}
            disabled={!toPrint.length}
            className="inline-flex items-center gap-2 rounded-full border border-[#D8D0BC] px-5 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.14em] text-[#4E5A44] disabled:opacity-50"
          >
            <Printer size={13} />
            PRINT {selected.length ? `${selected.length} LABEL${selected.length === 1 ? "" : "S"}` : "ALL LABELS"}
          </button>
          <button
            onClick={() => setAdding((a) => !a)}
            className="inline-flex items-center gap-2 rounded-full bg-[#4E5A44] px-5 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.14em] text-white"
          >
            <Plus size={13} />
            ADD ASSETS
          </button>
        </div>
      </div>

      {error && <p className="mb-4 font-[Jost] text-sm text-red-700">{error}</p>}

      {adding && (
        <NewAssetForm items={items} onCreate={create} onCancel={() => setAdding(false)} saving={saving} />
      )}

      {unlabelled.length > 0 && (
        <div className="mb-6 rounded-sm border border-[#E0AD5C] bg-[#FBF1DE] p-4">
          <p className="font-[Jost] text-sm font-semibold text-[#8A5D14]">
            {unlabelled.length} catalogue {unlabelled.length === 1 ? "item has" : "items have"} nothing physical registered yet
          </p>
          <p className="mt-1 font-[Jost] text-xs text-[#8A5D14]">
            {unlabelled.map((i) => i.name).join(", ")}
          </p>
          <p className="mt-2 font-[Jost] text-xs text-[#6A6353]">
            Add a single asset for each object you hand over, or a counted box for anything you rent
            by the number.
          </p>
        </div>
      )}

      {!assets.length && (
        <p className="font-[Jost] text-sm text-[#8C846F]">
          No assets yet. Everything you add to the catalogue from now on gets a code automatically.
        </p>
      )}

      <div className="space-y-2">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex flex-wrap items-center gap-4 rounded-sm border border-[#E4DCC8] bg-white p-3"
          >
            <input
              type="checkbox"
              checked={selected.includes(asset.id)}
              onChange={() => toggleSelected(asset.id)}
              className="h-4 w-4 accent-[#4E5A44]"
              aria-label={`Select ${asset.code}`}
            />
            {qrByCode[asset.code] ? (
              <img src={qrByCode[asset.code]} alt="" className="h-12 w-12" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center">
                <Loader2 size={14} className="animate-spin text-[#A69C7E]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-[Jost] text-sm font-semibold text-[#3A342A]">{asset.label}</p>
              <p className="font-[Jost] text-xs tracking-[0.08em] text-[#8C846F]">
                {asset.code} · {asset.kind === "box" ? "Counted box" : "Single asset"}
                {asset.item_name ? ` · ${asset.item_name}` : ""}
              </p>
            </div>
            <button
              onClick={() => toggleDelicate(asset)}
              className={`rounded-full px-3 py-1 font-[Jost] text-[10px] font-semibold tracking-[0.08em] ${
                asset.delicate ? "bg-[#FBF1DE] text-[#8A5D14]" : "bg-[#F0EBDD] text-[#8C846F]"
              }`}
            >
              {asset.delicate ? "DELICATE" : "NOT DELICATE"}
            </button>
            <StatusPill status={asset.status} />
          </div>
        ))}
      </div>

      <div ref={printRef}>
        <LabelSheet assets={toPrint} qrByCode={qrByCode} />
      </div>
    </div>
  );
}
