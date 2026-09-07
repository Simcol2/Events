import React, { useEffect, useMemo, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "../supabaseClient";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

// Only approved reviews are readable with the public key (see the RLS
// policy in supabase/reviews_setup.sql), so this page cannot accidentally
// show something still sitting in the moderation queue.
const GOOGLE_REVIEW_URL = import.meta.env.VITE_GOOGLE_REVIEW_URL || "";

function Stars({ rating, size = 16, palette }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.5}
          style={{
            color: n <= rating ? palette.gold : palette.line,
            fill: n <= rating ? palette.gold : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export default function Reviews() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Reviews aren't connected yet.");
      return;
    }
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("id, rating, body, customer_name, photos, published_at, created_at")
        .eq("status", "approved")
        .order("published_at", { ascending: false });
      if (fetchError) setError(fetchError.message);
      else setReviews(data || []);
      setLoading(false);
    })();
  }, []);

  const summary = useMemo(() => {
    if (!reviews.length) return null;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return { average: total / reviews.length, count: reviews.length };
  }, [reviews]);

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-sm font-semibold tracking-[0.35em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A SLICE OF G EVENTS
        </p>
        <h1 className="mt-3 text-6xl font-bold sm:text-7xl" style={{ ...fonts.displayFont, color: palette.gold }}>
          Reviews
        </h1>
        <p className="mt-4 text-2xl sm:text-3xl" style={{ ...fonts.scriptFont, color: "#FFFFFF" }}>
          In the words of the people who threw the party.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        {summary && (
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <Stars rating={Math.round(summary.average)} size={22} palette={palette} />
              <span className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                {summary.average.toFixed(1)}
              </span>
            </div>
            <p className="mt-2 text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Based on {summary.count} {summary.count === 1 ? "review" : "reviews"} from real bookings.
            </p>
          </div>
        )}

        {loading && (
          <p className="text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Loading reviews
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
            {error}
          </p>
        )}

        {!loading && !error && !reviews.length && (
          <div
            className="rounded-sm p-10 text-center"
            style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
          >
            <Quote size={26} className="mx-auto" style={{ color: palette.gold }} />
            <h2 className="mt-4 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              The first reviews are on their way
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
              Every review here comes from someone who actually booked with us. As soon as the first celebrations
              wrap up, their words will land on this page.
            </p>
            <button
              onClick={() => openPickerForBuilder()}
              className="mt-6 rounded-sm px-7 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
            >
              BUILD MY EXPERIENCE
            </button>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {reviews.map((review) => {
              const photos = Array.isArray(review.photos) ? review.photos.filter(Boolean) : [];
              return (
                <article
                  key={review.id}
                  className="flex flex-col rounded-sm p-6"
                  style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
                >
                  <Stars rating={review.rating} palette={palette} />
                  {review.body && (
                    <p className="mt-4 flex-1 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                      {review.body}
                    </p>
                  )}
                  {photos.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {photos.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-24 w-24 rounded-sm object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-5 border-t pt-4" style={{ borderColor: palette.line }}>
                    <p className="text-base font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                      {review.customer_name}
                    </p>
                    <p className="text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {formatDate(review.published_at || review.created_at)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {GOOGLE_REVIEW_URL && (
          <div className="mt-14 text-center">
            <p className="text-base" style={{ ...fonts.bodyFont, color: palette.ink }}>
              Booked with us before?
            </p>
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-sm px-7 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
            >
              LEAVE A GOOGLE REVIEW
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
