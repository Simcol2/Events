import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../CartContext";
import { API_BASE } from "../apiBase";

export default function CheckoutSuccess({ navigate }) {
  const { clearCart } = useCart();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [squarePending, setSquarePending] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const isSquarePending = params.get("square_pending") === "1";
    const squareBooking = params.get("booking");

    if (isSquarePending) {
      // The Square rental order and invoice draft exist, but no payment has
      // happened yet - the seller still needs to attach the rental
      // agreement and publish the invoice before Square emails the
      // customer their booking-deposit request. Nothing to fetch here.
      setSquarePending({ bookingNumber: squareBooking || null });
      clearCart();
      return;
    }

    if (!sessionId) {
      setError("Checkout session is missing.");
      return;
    }

    fetch(`${API_BASE}/checkout-summary?session_id=${encodeURIComponent(sessionId)}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-[70vh] bg-[#FFFFFF] px-5 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8E0CF] bg-white p-8 text-center sm:p-12">
        <CheckCircle2 size={42} className="mx-auto text-[#17724F]" />

        {squarePending ? (
          <>
            <p className="mt-5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-[#8A6A1E]">
              BOOKING RECEIVED
            </p>
            <h1 className="mt-2 font-['Fraunces'] text-4xl font-semibold text-[#0B4933]">
              Your rental reservation is in.
            </h1>

            <div className="mt-7 rounded-xl bg-[#F7F2E8] p-6 text-left">
              {squarePending.bookingNumber && (
                <div>
                  <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.12em] text-[#8A6A1E]">
                    RENTAL RESERVATION
                  </p>
                  <p className="mt-1 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                    {squarePending.bookingNumber}
                  </p>
                </div>
              )}
              <div className={squarePending.bookingNumber ? "mt-5 border-t border-[#DDD3BE] pt-5" : ""}>
                <p className="font-[Space_Grotesk] text-sm leading-6 text-[#5C5645]">
                  Your dates are on hold. We're preparing your rental agreement, and Square will email you a
                  secure invoice for your 50% booking deposit once it's ready to sign and pay.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
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
