import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../CartContext";

export default function CheckoutSuccess({ navigate }) {
  const { clearCart } = useCart();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("Checkout session is missing.");
      return;
    }

    fetch(`/api/checkout-summary?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load order confirmation.");
        return data;
      })
      .then((data) => {
        setSummary(data);
        clearCart();
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-[70vh] bg-[#FCFBF7] px-5 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8E0CF] bg-white p-8 text-center sm:p-12">
        <CheckCircle2 size={42} className="mx-auto text-[#17724F]" />
        <p className="mt-5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-[#8A6A1E]">
          PAYMENT RECEIVED
        </p>
        <h1 className="mt-2 font-['Fraunces'] text-4xl font-semibold text-[#0B4933]">
          Your order is in.
        </h1>

        {error && <p className="mt-5 font-[Space_Grotesk] text-sm text-red-700">{error}</p>}

        {summary && (
          <div className="mt-7 rounded-xl bg-[#F7F2E8] p-6 text-left">
            {summary.bookingNumber && (
              <div>
                <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.12em] text-[#8A6A1E]">
                  RENTAL RESERVATION
                </p>
                <p className="mt-1 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                  {summary.bookingNumber}
                </p>
              </div>
            )}
            <div className={summary.bookingNumber ? "mt-5 border-t border-[#DDD3BE] pt-5" : ""}>
              <p className="font-[Space_Grotesk] text-sm text-[#5C5645]">
                Payment status: <strong>{summary.paymentStatus}</strong>
              </p>
              {summary.email && (
                <p className="mt-1 font-[Space_Grotesk] text-sm text-[#5C5645]">
                  Confirmation email: {summary.email}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/client")}
            className="rounded-full bg-[#0B4933] px-6 py-3 font-[Space_Grotesk] text-sm font-semibold text-white"
          >
            VIEW MY BOOKING
          </button>
          <button
            onClick={() => navigate("/decor")}
            className="rounded-full border border-[#0B4933] px-6 py-3 font-[Space_Grotesk] text-sm font-semibold text-[#0B4933]"
          >
            BACK TO COLLECTION
          </button>
        </div>
      </div>
    </main>
  );
}
