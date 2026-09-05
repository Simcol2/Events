import React, { useState } from "react";
import AdminPhotoManager from "./AdminPhotoManager";
import { TAGS } from "../decorTags";

const EMPTY = {
  name: "",
  description: "",
  size: "",
  gender: "",
  quantity_owned: 1,
  rental_price: "",
  purchase_price: "",
  condition_notes: "",
  variant_group: "",
  variant_label: "",
  active: true,
  photos: [],
  category: "",
};

function toFormState(item) {
  if (!item) return { ...EMPTY };
  return {
    name: item.name || "",
    description: item.description || "",
    size: item.size || "",
    gender: item.gender || "",
    quantity_owned: item.quantity_owned ?? 1,
    rental_price: item.rental_price ?? "",
    purchase_price: item.purchase_price ?? "",
    condition_notes: item.condition_notes || "",
    variant_group: item.variant_group || "",
    variant_label: item.variant_label || "",
    active: item.active !== false,
    photos: Array.isArray(item.photos) ? item.photos : [],
    category: item.category || "",
  };
}

function selectedTagIds(category) {
  const parts = String(category || "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  return parts;
}

// A row's `category` column is a comma-separated list of the fixed tag
// ids (see decorTags.js) - this form edits that as checkboxes instead of
// free text so a typo can never again silently break the site's filter
// (see pages/Decor.jsx's parseItemTags for the bug this used to cause).
export default function AdminItemForm({ item, onSave, onCancel, onDelete, saving }) {
  const [form, setForm] = useState(() => toFormState(item));
  const [tagIds, setTagIds] = useState(() => selectedTagIds(item?.category));
  const isEdit = Boolean(item);

  const toggleTag = (id) =>
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      category: TAGS.filter((t) => tagIds.includes(t.id)).map((t) => t.label).join(", "),
      quantity_owned: form.quantity_owned === "" ? null : Number(form.quantity_owned),
      rental_price: form.rental_price === "" ? null : Number(form.rental_price),
      purchase_price: form.purchase_price === "" ? null : Number(form.purchase_price),
      variant_group: form.variant_group.trim() || null,
      variant_label: form.variant_label.trim() || null,
      gender: form.gender.trim() || null,
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
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">DESCRIPTION</label>
        <textarea rows={3} value={form.description} onChange={set("description")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
      </div>

      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">TAGS</label>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {TAGS.map((tag) => (
            <label key={tag.id} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} className="h-3.5 w-3.5 accent-[#4E5A44]" />
              <span className="font-[Jost] text-xs text-[#5C5645]">{tag.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">SIZE</label>
          <input value={form.size} onChange={set("size")} placeholder="e.g. 6 x 8 in" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">GENDER</label>
          <select value={form.gender} onChange={set("gender")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]">
            <option value="">Not gendered</option>
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">QUANTITY OWNED</label>
          <input type="number" min="0" value={form.quantity_owned} onChange={set("quantity_owned")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">RENTAL PRICE</label>
          <input type="number" min="0" step="0.01" value={form.rental_price} onChange={set("rental_price")} placeholder="Blank = not rentable" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">PURCHASE PRICE</label>
          <input type="number" min="0" step="0.01" value={form.purchase_price} onChange={set("purchase_price")} placeholder="Blank = not purchasable" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">VARIANT GROUP</label>
          <input value={form.variant_group} onChange={set("variant_group")} placeholder="Same text on every row that shares one card" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
        <div>
          <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">VARIANT LABEL</label>
          <input value={form.variant_label} onChange={set("variant_label")} placeholder="e.g. Large, Small" className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
        </div>
      </div>

      <div>
        <label className="block font-[Jost] text-[10px] font-semibold tracking-[0.12em] text-[#4E5A44]">CONDITION NOTES</label>
        <textarea rows={2} value={form.condition_notes} onChange={set("condition_notes")} className="mt-1.5 w-full rounded-sm border border-[#D8D0BC] px-3 py-2.5 font-[Jost] text-sm outline-none focus:border-[#4E5A44]" />
      </div>

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
            {saving ? "SAVING..." : isEdit ? "SAVE CHANGES" : "ADD ITEM"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-[#D8D0BC] px-6 py-2.5 font-[Jost] text-[11px] font-semibold tracking-[0.16em] text-[#4E5A44]">
            CANCEL
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${item.name}"? This can't be undone.`)) onDelete(item.id);
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
