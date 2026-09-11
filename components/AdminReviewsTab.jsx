import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { adminApi } from "../adminApi";

// The moderation queue. Nothing a customer submits is visible on the site
// until it is approved here, so pending is the default filter.
const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await adminApi.listReviews());
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

  const visible = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.status === filter)),
    [reviews, filter]
  );

  const counts = useMemo(
    () =>
      reviews.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
    [reviews]
  );

  const setStatus = async (review, status) => {
    setBusyId(review.id);
    try {
      await adminApi.updateReview(review.id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    if (!window.confirm(`Delete the review from ${review.customer_name}? This can't be undone.`)) return;
    setBusyId(review.id);
    try {
      await adminApi.deleteReview(review.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const sendDue = async () => {
    setSending(true);
    setNotice("");
    try {
      const result = await adminApi.sendDueReviewEmails();
      setNotice(
        result.sent
          ? `Sent ${result.sent} review ${result.sent === 1 ? "email" : "emails"}.`
          : "Nothing was due to send."
      );
      if (result.failed) setError(`${result.failed} failed to send.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Reviews</h2>
        <button
          onClick={sendDue}
          disabled={sending}
          className="rounded-full bg-[#0B4933] px-5 py-2.5 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.14em] text-white disabled:opacity-50"
        >
          {sending ? "SENDING..." : "SEND DUE REVIEW EMAILS"}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-sm border px-3 py-1.5 font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] ${
              filter === f.id
                ? "border-[#0B4933] bg-[#0B4933] text-white"
                : "border-[#D8D0BC] bg-white text-[#5C5645]"
            }`}
          >
            {f.label.toUpperCase()}
            {f.id !== "all" && counts[f.id] ? ` (${counts[f.id]})` : ""}
          </button>
        ))}
      </div>

      {notice && <p className="mb-4 font-[Space_Grotesk] text-sm text-[#0B4933]">{notice}</p>}
      {error && <p className="mb-4 font-[Space_Grotesk] text-sm text-red-700">{error}</p>}
      {loading && <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">Loading reviews...</p>}

      {!loading && !visible.length && (
        <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">
          {filter === "pending" ? "Nothing waiting for you." : "Nothing here yet."}
        </p>
      )}

      <div className="space-y-4">
        {visible.map((review) => {
          const photos = Array.isArray(review.photos) ? review.photos.filter(Boolean) : [];
          return (
            <div key={review.id} className="rounded-sm border border-[#EAE3D3] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={15}
                        strokeWidth={1.5}
                        className={n <= review.rating ? "text-[#8A6A1E]" : "text-[#EAE3D3]"}
                        fill={n <= review.rating ? "#8A6A1E" : "transparent"}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-[Space_Grotesk] text-sm font-semibold text-[#12201A]">
                    {review.customer_name}
                    <span className="ml-2 font-normal text-[#8C846F]">{review.customer_email}</span>
                  </p>
                  <p className="font-[Space_Grotesk] text-xs text-[#8C846F]">{formatDate(review.created_at)}</p>
                </div>
                <span className="rounded-full bg-[#F4F0E4] px-3 py-1 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.08em] text-[#5C5645]">
                  {String(review.status).toUpperCase()}
                </span>
              </div>

              {review.body && (
                <p className="mt-3 font-[Space_Grotesk] text-sm leading-relaxed text-[#12201A]">{review.body}</p>
              )}

              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt="" className="h-20 w-20 rounded-sm object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#F0EBDD] pt-3">
                {review.status !== "approved" && (
                  <button
                    onClick={() => setStatus(review, "approved")}
                    disabled={busyId === review.id}
                    className="rounded-full bg-[#0B4933] px-4 py-2 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.12em] text-white disabled:opacity-50"
                  >
                    APPROVE
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(review, "rejected")}
                    disabled={busyId === review.id}
                    className="rounded-full border border-[#D8D0BC] px-4 py-2 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.12em] text-[#5C5645] disabled:opacity-50"
                  >
                    {review.status === "approved" ? "TAKE DOWN" : "REJECT"}
                  </button>
                )}
                <button
                  onClick={() => remove(review)}
                  disabled={busyId === review.id}
                  className="font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.1em] text-red-700 underline underline-offset-4 disabled:opacity-50"
                >
                  DELETE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
