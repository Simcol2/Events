import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import AdminPhotoManager from "./AdminPhotoManager";

const EMPTY = {
  name: "",
  description: "",
  tagline: "",
  price: "",
  custom_price: "",
  customizable: false,
  allow_custom_text: false,
  options: [],
  photos: [],
  active: true,
};

function toFormState(gift) {
  if (!gift) return { ...EMPTY };
  return {
    name: gift.name || "",
    description: gift.description || "",
    tagline: gift.tagline || "",
    price: gift.price ?? "",
    custom_price: gift.custom_price ?? "",
    customizable: Boolean(gift.customizable),
    allow_custom_text: Boolean(gift.allow_custom_text),
    options: Array.isArray(gift.options) ? gift.options : [],
    photos: Array.isArray(gift.photos) ? gift.photos : [],
    active: gift.active !== false,
  };
}

// `options` (preset designs a customer picks from, e.g. Pop Up Nostalgia
// Cards' Magic School Bus / Orly / etc.) only matters when customizable is
// on - each one needs its own label and photo, shown in the customization
// dropdown on the Gifts page.
export default function AdminGiftForm({ gift, onSave, onCancel, onDelete, saving }) {
  const [form, setForm] = useState(() => toFormState(gift));
  const isEdit = Boolean(gift);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateOption = (i, field, value) => {
    const next = [...form.options];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, options: next });
  };

  const addOption = () => setForm({ ...form, options: [...form.options, { label: "", photo_url: "" }] });
  const removeOption = (i) => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price === "" ? 0 : Number(form.price),
      custom_price: form.custom_price === "" ? null : Number(form.custom_price),
      options: form.customizable ? form.options.filter((o) => o.label.trim()) : [],
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">NAME</label>
        <input required value={form.name} onChange={set("name")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
      </div>

      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">TAGLINE</label>
        <input value={form.tagline} onChange={set("tagline")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
      </div>

      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">DESCRIPTION</label>
        <textarea rows={3} value={form.description} onChange={set("description")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">PRICE</label>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={set("price")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">CUSTOM PRICE</label>
          <input type="number" min="0" step="0.01" value={form.custom_price} onChange={set("custom_price")} placeholder="Only if different from price" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={form.customizable} onChange={(e) => setForm({ ...form, customizable: e.target.checked })} className="h-3.5 w-3.5 accent-[#4E5A44]" />
        <span className="font-[Jost] text-xs text-[#5C5645]">Customizable (shows a design picker on the Gifts page)</span>
      </label>

      {form.customizable && (
        <div className="rounded-sm border border-[#E4DCC8] p-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={form.allow_custom_text} onChange={(e) => setForm({ ...form, allow_custom_text: e.target.checked })} className="h-3.5 w-3.5 accent-[#4E5A44]" />
            <span className="font-[Jost] text-xs text-[#5C5645]">Allow "Your Choice" (customer types in their own request)</span>
          </label>

          <div className="mt-4 space-y-3">
            <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">PRESET DESIGNS</label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  value={opt.label}
                  onChange={(e) => updateOption(i, "label", e.target.value)}
                  placeholder="Design name"
                  className="w-1/3 rounded-sm border border-[#D8D0BC] px-3 py-2 font-[Jost] text-xs outline-none focus:border-[#4E5A44]"
                />
                <input
                  value={opt.photo_url}
                  onChange={(e) => updateOption(i, "photo_url", e.target.value)}
                  placeholder="Photo URL"
                  className="flex-1 rounded-sm border border-[#D8D0BC] px-3 py-2 font-[Jost] text-xs outline-none focus:border-[#4E5A44]"
                />
                <button type="button" onClick={() => removeOption(i)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-red-700" aria-label="Remove design">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addOption} className="flex items-center gap-1.5 font-[Jost] text-[10px] font-semibold tracking-[0.1em] text-[#4E5A44]">
              <Plus size={12} /> ADD DESIGN
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">PHOTOS</label>
        <div className="mt-1.5">
          <AdminPhotoManager photos={form.photos} onChange={(photos) => setForm({ ...form, photos })} />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-3.5 w-3.5 accent-[#4E5A44]" />
        <span className="font-[Jost] text-xs text-[#5C5645]">Active (visible on the site)</span>
      </label>

      <div className="flex items-center justify-between border-t border-[#E4DCC8] pt-5">
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-[#4E5A44] px-6 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.16em] text-white disabled:opacity-50">
            {saving ? "SAVING..." : isEdit ? "SAVE CHANGES" : "ADD GIFT"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-[#D8D0BC] px-6 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.16em] text-[#4E5A44]">
            CANCEL
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${gift.name}"? This can't be undone.`)) onDelete(gift.id);
            }}
            className="font-[Jost] text-[11px] font-semibold tracking-[0.1em] text-red-700 underline underline-offset-4"
          >
            DELETE
          </button>
        )}
      </div>
    </form>
  );
}
