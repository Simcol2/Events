import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "../CartContext";
import { API_BASE } from "../apiBase";

export default function CheckoutSuccess({ navigate }) {
  const { clearCart } = useCart();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [squareDepositPaid, setSquareDepositPaid] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const isSquareDepositPaid = params.get("square_deposit_paid") === "1";
    const squareBooking = params.get("booking");
    const cardNotSaved = params.get("card_not_saved") === "1";

    if (isSquareDepositPaid) {
      // The 50% booking deposit was already charged in the checkout modal
      // (see api/square.js's chargeBookingDeposit) - there is no separate
      // invoice to wait on. Nothing to fetch here.
      setSquareDepositPaid({ bookingNumber: squareBooking || null, cardNotSaved });
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

        {squareDepositPaid ? (
          <>
            <p className="mt-5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-[#8A6A1E]">
              DEPOSIT RECEIVED
            </p>
            <h1 className="mt-2 font-['Fraunces'] text-4xl font-semibold text-[#0B4933]">
              Your rental reservation is in.
            </h1>

            <div className="mt-7 rounded-xl bg-[#F7F2E8] p-6 text-left">
              {squareDepositPaid.bookingNumber && (
                <div>
                  <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.12em] text-[#8A6A1E]">
                    RENTAL RESERVATION
                  </p>
                  <p className="mt-1 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                    {squareDepositPaid.bookingNumber}
                  </p>
                </div>
              )}
              <div className={squareDepositPaid.bookingNumber ? "mt-5 border-t border-[#DDD3BE] pt-5" : ""}>
                <p className="font-[Space_Grotesk] text-sm leading-6 text-[#5C5645]">
                  Your dates are on hold and your 50% booking deposit is paid. We'll be in touch with your
                  rental agreement to sign next. Check your portal any time for your remaining balance and
                  security deposit due dates.
                </p>
              </div>
            </div>

            {squareDepositPaid.cardNotSaved && (
              <div className="mt-4 rounded-xl border border-[#E7D7AD] bg-[#FFFDF6] p-4 text-left">
                <p className="font-[Space_Grotesk] text-sm font-semibold text-[#6B5517]">
                  Your card was not saved
                </p>
                <p className="mt-1 font-[Space_Grotesk] text-xs leading-5 text-[#6F6859]">
                  Your deposit was paid and your booking is active, but we could not save your card for automatic
                  future charges. Please pay your remaining balance at least 7 days before pickup and your
                  security deposit at least 48 hours before pickup from your client portal.
                </p>
              </div>
            )}
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
