import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  LogOut,
  Package,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { supabase } from "../supabaseClient";

const money = (cents, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "CAD").toUpperCase(),
  }).format(Number(cents || 0) / 100);

function dateLabel(value) {
  if (!value) return "Not set";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ children, tone = "green" }) {
  const tones = {
    green: "bg-[#E7F2EC] text-[#0B4933]",
    gold: "bg-[#F7EBCB] text-[#7C5B11]",
    coral: "bg-[#FBE5E5] text-[#8A3142]",
    neutral: "bg-[#F0EBDD] text-[#5C5645]",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[#E7DFCE] bg-[#FFFDF8] p-5 sm:p-6 ${className}`}
      style={{ boxShadow: "0 16px 45px rgba(49, 39, 20, 0.08)" }}
    >
      {children}
    </section>
  );
}

function PaymentRow({ label, due, paid, refundable, onPay, busy }) {
  const complete = due > 0 && paid >= due;
  const remaining = Math.max(0, due - paid);

  return (
    <div className="flex flex-col gap-3 border-t border-[#EEE7D8] py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-[Space_Grotesk] text-sm font-semibold text-[#12201A]">{label}</p>
          {refundable && <StatusPill tone="gold">Refundable</StatusPill>}
          {complete && <StatusPill>Paid</StatusPill>}
        </div>
        <p className="mt-1 font-[Space_Grotesk] text-sm text-[#7E7767]">
          {due > 0 ? `${money(paid)} paid of ${money(due)}` : "Not required for this booking"}
        </p>
      </div>
      {remaining > 0 && (
        <button
          onClick={onPay}
          disabled={busy}
          className="rounded-full bg-[#0B4933] px-5 py-2.5 font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em] text-white disabled:opacity-50"
        >
          {busy ? "OPENING..." : `PAY ${money(remaining)}`}
        </button>
      )}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!supabase) throw new Error("Client login is not connected yet.");
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/client`,
          shouldCreateUser: true,
        },
      });
      if (signInError) throw signInError;
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send the sign-in link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[72vh] bg-[#F8F3E8] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-xl">
        <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.2em] text-[#A17920]">CLIENT PORTAL</p>
        <h1 className="mt-3 font-['Fraunces'] text-4xl font-semibold leading-tight text-[#0B4933] sm:text-5xl">
          Your celebrations, receipts and rentals in one place.
        </h1>
        <p className="mt-4 max-w-lg font-[Space_Grotesk] text-base leading-7 text-[#665F50]">
          Sign in with the same email you used to book or purchase. We will email you a secure sign-in link, no password required.
        </p>

        <Panel className="mt-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-[#17724F]" size={38} />
              <h2 className="mt-4 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Check your email</h2>
              <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#7E7767]">
                Your secure link is on its way to {email}. Open it on this device and you will come straight back here.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label className="font-[Space_Grotesk] text-sm font-semibold text-[#12201A]">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-white px-4 py-3 font-[Space_Grotesk] text-base text-[#12201A] outline-none focus:border-[#0B4933]"
              />
              {error && <p className="mt-3 font-[Space_Grotesk] text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="mt-5 w-full rounded-full bg-[#0B4933] py-3.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em] text-white disabled:opacity-50"
              >
                {busy ? "SENDING..." : "EMAIL MY SIGN-IN LINK"}
              </button>
            </form>
          )}
        </Panel>
      </div>
    </main>
  );
}

export default function ClientPortal() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("bookings");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    supabase.auth.getSession().then(({ data: result }) => {
      setSession(result.session || null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setAuthReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadPortal = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/client-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load your account.");
      setData(payload);
    } catch (err) {
      setError(err.message || "Could not load your account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) loadPortal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const transactionMap = useMemo(() => {
    const map = new Map();
    for (const transaction of data?.transactions || []) {
      if (!transaction.reservation_id) continue;
      if (!map.has(transaction.reservation_id)) map.set(transaction.reservation_id, []);
      map.get(transaction.reservation_id).push(transaction);
    }
    return map;
  }, [data]);

  const openInvoice = async (reservationId, kind) => {
    const actionKey = `${reservationId}:${kind}`;
    setBusyAction(actionKey);
    setError("");
    try {
      const response = await fetch("/api/client-portal?action=invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reservationId, kind }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || "Could not open the invoice.");
      window.location.href = payload.url;
    } catch (err) {
      setError(err.message || "Could not open the invoice.");
      setBusyAction("");
    }
  };

  const openBillingPortal = async () => {
    setBusyAction("billing");
    setError("");
    try {
      const response = await fetch("/api/client-portal?action=billing-portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || "Could not open billing.");
      window.location.href = payload.url;
    } catch (err) {
      setError(err.message || "Could not open billing.");
      setBusyAction("");
    }
  };

  if (!authReady) {
    return <main className="min-h-[65vh] bg-[#F8F3E8] p-10 font-[Space_Grotesk] text-[#7E7767]">Loading...</main>;
  }

  if (!session) return <SignIn />;

  const reservations = data?.reservations || [];
  const reservationItems = data?.reservationItems || [];
  const purchases = data?.purchases || [];
  const purchaseItems = data?.purchaseItems || [];
  const contracts = data?.contracts || [];

  return (
    <main className="min-h-[76vh] bg-[#F8F3E8] px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.2em] text-[#A17920]">MY A SLICE OF G</p>
            <h1 className="mt-2 font-['Fraunces'] text-4xl font-semibold text-[#0B4933] sm:text-5xl">
              Hi{data?.customer?.name ? `, ${String(data.customer.name).split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-2 font-[Space_Grotesk] text-sm text-[#6F6859]">Bookings, deposits, invoices and purchase history.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadPortal}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#CFC5AE] bg-[#FFFDF8] px-4 py-2.5 font-[Space_Grotesk] text-xs font-semibold text-[#0B4933]"
            >
              <RefreshCw size={14} /> {loading ? "REFRESHING" : "REFRESH"}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-[#CFC5AE] bg-[#FFFDF8] px-4 py-2.5 font-[Space_Grotesk] text-xs font-semibold text-[#0B4933]"
            >
              <LogOut size={14} /> SIGN OUT
            </button>
          </div>
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-[Space_Grotesk] text-sm text-red-800">{error}</div>}

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
          {[
            ["bookings", "Bookings", CalendarDays],
            ["purchases", "Purchases", ShoppingBag],
            ["billing", "Billing", ReceiptText],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold ${
                tab === id ? "bg-[#0B4933] text-white" : "border border-[#D8D0BC] bg-[#FFFDF8] text-[#0B4933]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <Panel className="mt-6"><p className="font-[Space_Grotesk] text-sm text-[#7E7767]">Loading your account...</p></Panel>
        ) : null}

        {tab === "bookings" && data && (
          <div className="mt-6 space-y-6">
            {!reservations.length && (
              <Panel>
                <Package className="text-[#D9AE45]" size={30} />
                <h2 className="mt-3 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">No confirmed rentals yet</h2>
                <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#7E7767]">
                  Rental requests will appear here after they are converted into a reservation.
                </p>
              </Panel>
            )}

            {reservations.map((reservation) => {
              const rows = reservationItems.filter((item) => item.reservation_id === reservation.id);
              const tx = transactionMap.get(reservation.id) || [];
              const paid = (kind) => tx.filter((row) => row.kind === kind && row.status === "paid").reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);
              const contract = contracts.find((row) => row.reservation_id === reservation.id);
              const dropoff = reservation.drop_off_date || reservation.dropoff_date || reservation.return_date;
              const balanceDue = Number(reservation.balance_due_cents || 0) || Math.max(0, Number(reservation.rental_total_cents || 0) - Number(reservation.booking_deposit_cents || 0));

              return (
                <Panel key={reservation.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill>{String(reservation.status || "pending").replaceAll("_", " ")}</StatusPill>
                        <span className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em] text-[#9A927F]">
                          {reservation.booking_number || `BOOKING ${reservation.id}`}
                        </span>
                      </div>
                      <h2 className="mt-3 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                        {reservation.event_name || reservation.package_name || "Event rental"}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-[Space_Grotesk] text-sm text-[#6F6859]">
                        <span>Event {dateLabel(reservation.event_date)}</span>
                        {reservation.pickup_date && <span>Pickup {dateLabel(reservation.pickup_date)}</span>}
                        {dropoff && <span>Return {dateLabel(dropoff)}</span>}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.15em] text-[#9A927F]">RENTAL TOTAL</p>
                      <p className="mt-1 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
                        {money(reservation.rental_total_cents, reservation.currency)}
                      </p>
                    </div>
                  </div>

                  {!!rows.length && (
                    <div className="mt-6 rounded-xl bg-[#F8F3E8] p-4">
                      <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.15em] text-[#8A6A1E]">YOUR RENTALS</p>
                      <div className="mt-3 space-y-2">
                        {rows.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 font-[Space_Grotesk] text-sm text-[#3E3A31]">
                            <span>{item.item?.name || item.description || "Rental item"}</span>
                            <span className="font-semibold">x{item.quantity || 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <WalletCards size={18} className="text-[#D9AE45]" />
                        <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">Payments</h3>
                      </div>
                      <PaymentRow
                        label="Booking deposit"
                        due={Number(reservation.booking_deposit_cents || 0)}
                        paid={paid("booking_deposit")}
                        onPay={() => openInvoice(reservation.id, "booking_deposit")}
                        busy={busyAction === `${reservation.id}:booking_deposit`}
                      />
                      <PaymentRow
                        label="Refundable security deposit"
                        due={Number(reservation.security_deposit_cents || 0)}
                        paid={paid("security_deposit")}
                        refundable
                        onPay={() => openInvoice(reservation.id, "security_deposit")}
                        busy={busyAction === `${reservation.id}:security_deposit`}
                      />
                      <PaymentRow
                        label="Remaining balance"
                        due={balanceDue}
                        paid={paid("balance")}
                        onPay={() => openInvoice(reservation.id, "balance")}
                        busy={busyAction === `${reservation.id}:balance`}
                      />
                    </div>

                    <div className="rounded-xl border border-[#E7DFCE] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-[#17724F]" />
                        <h3 className="font-['Fraunces'] text-lg font-semibold text-[#0B4933]">Documents</h3>
                      </div>
                      <div className="mt-4 space-y-3 font-[Space_Grotesk] text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#5C5645]">Rental agreement</span>
                          <StatusPill tone={(contract?.status === "signed" || contract?.signed_at || reservation.contract_status === "signed") ? "green" : "gold"}>
                            {contract?.status || reservation.contract_status || "Pending"}
                          </StatusPill>
                        </div>
                        {contract?.document_url && (
                          <a href={contract.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#0B4933] underline underline-offset-4">
                            <FileText size={15} /> View agreement
                          </a>
                        )}
                        {tx.filter((row) => row.invoice_pdf).map((row) => (
                          <a key={row.id} href={row.invoice_pdf} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 rounded-lg bg-[#F8F3E8] px-3 py-2.5 font-semibold text-[#0B4933]">
                            <span>{row.kind.replaceAll("_", " ")}</span>
                            <ChevronRight size={15} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "purchases" && data && (
          <div className="mt-6 space-y-4">
            {!purchases.length && (
              <Panel>
                <ShoppingBag className="text-[#D9AE45]" size={30} />
                <h2 className="mt-3 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">No purchase history yet</h2>
                <p className="mt-2 font-[Space_Grotesk] text-sm text-[#7E7767]">New Stripe purchases will appear here automatically.</p>
              </Panel>
            )}
            {purchases.map((order) => {
              const rows = purchaseItems.filter((item) => item.purchase_order_id === order.id);
              return (
                <Panel key={order.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill>{order.status || "paid"}</StatusPill>
                        <span className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em] text-[#9A927F]">{order.order_number || "ONLINE ORDER"}</span>
                      </div>
                      <p className="mt-2 font-[Space_Grotesk] text-sm text-[#6F6859]">Purchased {dateLabel(order.purchased_at)}</p>
                    </div>
                    <p className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">{money(order.total_cents, order.currency)}</p>
                  </div>
                  <div className="mt-4 divide-y divide-[#EEE7D8]">
                    {rows.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 py-3 font-[Space_Grotesk] text-sm text-[#4C473C]">
                        <span>{item.name} <span className="text-[#9A927F]">x{item.quantity}</span></span>
                        <span className="font-semibold">{money(item.total_amount_cents, item.currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {order.hosted_invoice_url && <a href={order.hosted_invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#CFC5AE] px-4 py-2 font-[Space_Grotesk] text-xs font-semibold text-[#0B4933]"><ReceiptText size={14} /> VIEW INVOICE</a>}
                    {order.invoice_pdf && <a href={order.invoice_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#CFC5AE] px-4 py-2 font-[Space_Grotesk] text-xs font-semibold text-[#0B4933]"><FileText size={14} /> PDF RECEIPT</a>}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "billing" && data && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Panel>
              <CreditCard className="text-[#D9AE45]" size={28} />
              <h2 className="mt-3 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Stripe billing centre</h2>
              <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#6F6859]">
                Open Stripe's secure billing page to view invoices and payment details connected to your account.
              </p>
              <button
                onClick={openBillingPortal}
                disabled={busyAction === "billing"}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0B4933] px-5 py-3 font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em] text-white disabled:opacity-50"
              >
                <CreditCard size={15} /> {busyAction === "billing" ? "OPENING..." : "OPEN BILLING CENTRE"}
              </button>
            </Panel>

            <Panel>
              <ReceiptText className="text-[#D9AE45]" size={28} />
              <h2 className="mt-3 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Invoice history</h2>
              <div className="mt-4 space-y-3">
                {(data.transactions || []).filter((row) => row.stripe_invoice_id).slice(0, 8).map((row) => (
                  <a
                    key={row.id}
                    href={row.hosted_invoice_url || row.invoice_pdf || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F3E8] px-4 py-3"
                  >
                    <div>
                      <p className="font-[Space_Grotesk] text-sm font-semibold capitalize text-[#12201A]">{row.kind.replaceAll("_", " ")}</p>
                      <p className="mt-0.5 font-[Space_Grotesk] text-xs text-[#8C846F]">{row.status} · {money(row.amount_cents, row.currency)}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#0B4933]" />
                  </a>
                ))}
                {!(data.transactions || []).some((row) => row.stripe_invoice_id) && (
                  <p className="font-[Space_Grotesk] text-sm text-[#7E7767]">No invoices yet.</p>
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </main>
  );
}
