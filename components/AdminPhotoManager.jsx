import React, { useRef, useState } from "react";
import { X, ChevronUp, ChevronDown, Upload } from "lucide-react";
import { getStoredPasscode } from "../adminApi";
import { resizeImageFile, blobToBase64 } from "../imageResize";

// `photos` is a plain array of URL strings, first = the one shown as the
// card's cover photo everywhere on the site. Reordering here is what
// controls that - there's no separate "set as cover" flag anywhere.
export default function AdminPhotoManager({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const list = Array.isArray(photos) ? photos : [];

  const handleFiles = async (files) => {
    setUploading(true);
    setError("");
    try {
      const newUrls = [];
      for (const file of Array.from(files)) {
        const resized = await resizeImageFile(file);
        const base64 = await blobToBase64(resized);
        const res = await fetch("/api/admin-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Passcode": getStoredPasscode() },
          body: JSON.stringify({
            filename: file.name.replace(/\.[^./]+$/, ".jpg"),
            contentType: "image/jpeg",
            base64,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed");
        newUrls.push(data.url);
      }
      onChange([...list, ...newUrls]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));

  const moveUp = (i) => {
    if (i === 0) return;
    const next = [...list];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };

  const moveDown = (i) => {
    if (i === list.length - 1) return;
    const next = [...list];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {list.map((url, i) => (
          <div key={url + i} className="relative h-24 w-24 overflow-hidden rounded-sm border border-[#D8D0BC]">
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-sm bg-[#4E5A44] px-1.5 py-0.5 font-[Jost] text-[8px] font-semibold text-white">
                FIRST
              </span>
            )}
            <div className="absolute bottom-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#4E5A44] disabled:opacity-30"
                aria-label="Move earlier"
              >
                <ChevronUp size={11} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === list.length - 1}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#4E5A44] disabled:opacity-30"
                aria-label="Move later"
              >
                <ChevronDown size={11} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-red-700"
                aria-label="Remove photo"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-[#D8D0BC] text-[#8C846F]">
          <Upload size={16} />
          <span className="font-[Jost] text-[9px]">{uploading ? "Uploading..." : "Add photo"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 font-[Jost] text-xs text-red-700">{error}</p>}
      <p className="mt-2 font-[Jost] text-[10px] text-[#A69C7E]">
        The first photo is what shows on the site. Use the arrows to reorder, the X to remove.
      </p>
    </div>
  );
}
