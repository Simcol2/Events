import React, { useEffect, useRef, useState } from "react";
import { Star, X, Loader2, Check } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { resizeImageFile, blobToBase64 } from "../imageResize";

const MAX_PHOTOS = 5;

function getToken() {
  try {
    return new URLSearchParams(window.location.search).get("token") || "";
  } catch {
    return "";
  }
}

// Rating first, because it is the only required answer and the one people
// arrive ready to give. Everything after it is optional.
function StarPicker({ value, onChange, palette, fonts }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "Not what we hoped", "Below expectations", "Good", "Great", "Perfect"];

  return (
    <div>
      <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            className="rounded-sm p-1 transition-transform hover:scale-110"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={value === n}
          >
            <Star
              size={34}
              strokeWidth={1.5}
              style={{
                color: n <= active ? palette.goldDeep : palette.line,
                fill: n <= active ? palette.goldDeep : "transparent",
              }}
            />
          </button>
        ))}
      </div>
      <p className="mt-2 h-5 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
        {labels[active] || ""}
      </p>
    </div>
  );
}

export default function LeaveReview({ navigate }) {
  const { palette, fonts } = usePalette();
  const token = getToken();
  const fileInputRef = useRef(null);

  const [state, setState] = useState("loading"); // loading | form | done | error | already
  const [message, setMessage] = useState("");
  const [greeting, setGreeting] = useState({ firstName: "", googleReviewUrl: "" });

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]); // { preview, contentType, base64 }
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState("error");
      setMessage("That review link isn't valid. Check the link in your email, or reply to it and we'll sort it out.");
      return undefined;
    }
    (async () => {
      try {
        const res = await fetch(`/api/review-lookup?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          setMessage(data.error || "That review link isn't valid.");
          return;
        }
        setGreeting({ firstName: data.firstName || "", googleReviewUrl: data.googleReviewUrl || "" });
        setState(data.alreadySubmitted ? "already" : "form");
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("We couldn't load your review link. Please try again in a moment.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const addPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    try {
      const prepared = [];
      for (const file of files.slice(0, room)) {
        const resized = await resizeImageFile(file);
        prepared.push({
          preview: URL.createObjectURL(resized),
          contentType: "image/jpeg",
          base64: await blobToBase64(resized),
        });
      }
      setPhotos((prev) => [...prev, ...prepared]);
    } catch (err) {
      setPhotoError(err.message || "We couldn't read that photo.");
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setMessage("Please choose a star rating first.");
      return;
    }
    if (!name.trim()) {
      setMessage("Please add your name.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/review-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          body,
          customerName: name.trim(),
          photos: photos.map(({ contentType, base64 }) => ({ contentType, base64 })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      if (data.googleReviewUrl) setGreeting((g) => ({ ...g, googleReviewUrl: data.googleReviewUrl }));
      setState("done");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-screen px-5 py-16 sm:px-8" style={{ background: palette.bg }}>
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </div>
  );

  if (state === "loading") {
    return shell(
      <div className="flex items-center justify-center gap-3 py-24" style={{ color: palette.muted }}>
        <Loader2 size={20} className="animate-spin" />
        <span style={fonts.bodyFont}>Loading your review link</span>
      </div>
    );
  }

  if (state === "error") {
    return shell(
      <div
        className="rounded-sm p-8 text-center"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <h1 className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          We couldn't open that link
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {message}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-sm px-6 py-3 text-sm font-semibold tracking-[0.1em] text-white"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          BACK TO THE SITE
        </button>
      </div>
    );
  }

  if (state === "already" || state === "done") {
    const isNew = state === "done";
    return shell(
      <div
        className="rounded-sm p-8 text-center"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: `${palette.accent}1F`, color: palette.accent }}
        >
          <Check size={24} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {isNew ? "Thank you" : "You've already left this one"}
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {isNew
            ? "Your review is with us now. We read every one, and it goes up on the site once we've had a look."
            : "Thanks for the review you already sent through. There's nothing more you need to do."}
        </p>

        {greeting.googleReviewUrl && (
          <div className="mt-8 border-t pt-8" style={{ borderColor: palette.line }}>
            <p className="text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
              If you have another minute, leaving the same words on Google helps other families find us.
            </p>
            <a
              href={greeting.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-sm px-7 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
            >
              REVIEW US ON GOOGLE
            </a>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="mt-8 block w-full text-sm font-semibold tracking-[0.1em] underline underline-offset-4"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
        >
          BACK TO THE SITE
        </button>
      </div>
    );
  }

  return shell(
    <>
      <p className="text-sm font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.goldDeep }}>
        A SLICE OF G EVENTS
      </p>
      <h1 className="mt-3 text-4xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {greeting.firstName ? `How did it go, ${greeting.firstName}?` : "How did it go?"}
      </h1>
      <p className="mt-3 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
        Tell us what the day was like. It takes about a minute, and photos are welcome if you have some you love.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-sm p-6 sm:p-8"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <label className="block text-sm font-semibold tracking-[0.12em]" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
          YOUR RATING
        </label>
        <div className="mt-3">
          <StarPicker value={rating} onChange={setRating} palette={palette} fonts={fonts} />
        </div>

        <label
          className="mt-7 block text-sm font-semibold tracking-[0.12em]"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
        >
          IN YOUR WORDS
        </label>
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What stood out? What did your guests say?"
          className="mt-2 w-full rounded-sm px-3 py-2.5 text-base outline-none"
          style={{ ...fonts.bodyFont, border: `1px solid ${palette.line}`, background: "#FFFFFF", color: palette.ink }}
        />

        <label
          className="mt-6 block text-sm font-semibold tracking-[0.12em]"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
        >
          PHOTOS (OPTIONAL)
        </label>
        <p className="mt-1 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
          Up to {MAX_PHOTOS}. They go up on the site only after we've reviewed them.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((photo, i) => (
            <div key={photo.preview} className="relative h-20 w-20 overflow-hidden rounded-sm">
              <img src={photo.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
                style={{ background: "rgba(20,18,12,0.7)" }}
                aria-label="Remove photo"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-20 w-20 rounded-sm text-sm"
              style={{ border: `1px dashed ${palette.line}`, color: palette.muted, ...fonts.bodyFont }}
            >
              + Add
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        {photoError && (
          <p className="mt-2 text-sm" style={{ ...fonts.bodyFont, color: "#B23B3B" }}>
            {photoError}
          </p>
        )}

        <label
          className="mt-6 block text-sm font-semibold tracking-[0.12em]"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
        >
          YOUR NAME
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How you'd like it to appear"
          className="mt-2 w-full rounded-sm px-3 py-2.5 text-base outline-none"
          style={{ ...fonts.bodyFont, border: `1px solid ${palette.line}`, background: "#FFFFFF", color: palette.ink }}
        />

        {message && (
          <p className="mt-4 text-sm" style={{ ...fonts.bodyFont, color: "#B23B3B" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white disabled:opacity-60"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? "SENDING" : "SEND MY REVIEW"}
        </button>
      </form>
    </>
  );
}
