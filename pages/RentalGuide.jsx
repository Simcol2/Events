import React, { useState } from "react";
import { Check, ChevronDown, CreditCard, MapPin, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { usePalette } from "../PaletteContext";
import {
  ElevatedCard,
  JewelBand,
  Kicker,
  PageHero,
  Reveal,
  SectionIntro,
  paperTexture,
} from "../components/EditorialKit";

const INDIVIDUAL_DEPOSIT_ROWS = [
  ["$50-$149", "$50"],
  ["$150-$299", "$100"],
  ["$300-$499", "$150"],
  ["$500-$749", "$200"],
  ["$750-$999", "$250"],
  ["$1,000+", "$300"],
];

const EXPERIENCE_DEPOSIT_ROWS = [
  ["$1,200-$1,499", "$350"],
  ["$1,500-$2,499", "$500"],
  ["$2,500-$4,999", "$750"],
  ["$5,000+", "$1,000+"],
];

const SHORT_VERSION = [
  "Individual rentals have a $50 minimum.",
  "50% down reserves your date and inventory.",
  "The refundable security deposit is paid at booking.",
  "The remaining 50% is due 24 hours before pickup.",
  "Reservations unpaid 12 hours before pickup are automatically cancelled.",
  "E-transfer payments are welcome.",
  "Security deposits are released within 48 hours after return and inspection.",
  "Toronto pickup and return are available.",
  "Need delivery? Contact us.",
];

function Paragraph({ children, palette, fonts, emphasize }) {
  return (
    <p
      className={`mt-3 leading-relaxed ${emphasize ? "text-lg font-semibold" : "text-base"}`}
      style={{ ...fonts.bodyFont, color: emphasize ? palette.primaryDeep : palette.muted }}
    >
      {children}
    </p>
  );
}

function BulletList({ items, palette, fonts }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: palette.gold }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InlinePriceTable({ rows, leftHeader, rightHeader, palette, fonts }) {
  return (
    <div
      className="mt-3 overflow-hidden"
      style={{
        border: `1px solid ${palette.line}`,
        borderRadius: "5px",
        background: palette.bg,
      }}
    >
      <div className="grid grid-cols-2" style={{ background: palette.primaryDeep, color: "#FFFFFF" }}>
        <div className="px-4 py-3 text-sm font-semibold" style={fonts.bodyFont}>{leftHeader}</div>
        <div className="px-4 py-3 text-sm font-semibold" style={fonts.bodyFont}>{rightHeader}</div>
      </div>
      {rows.map(([left, right], i) => (
        <div
          key={left}
          className="grid grid-cols-2"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${palette.line}`, background: i % 2 === 0 ? palette.bg : "transparent" }}
        >
          <div className="px-4 py-3 text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>{left}</div>
          <div className="px-4 py-3 text-sm font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>{right}</div>
        </div>
      ))}
    </div>
  );
}

function PriceTable({ rows, leftHeader, rightHeader, palette, fonts }) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: `1px solid ${palette.line}`,
        borderRadius: "5px",
        background: palette.surface,
      }}
    >
      <div
        className="grid grid-cols-2"
        style={{ background: palette.primaryDeep, color: "#FFFFFF" }}
      >
        <div className="px-5 py-4 text-sm font-semibold" style={fonts.bodyFont}>{leftHeader}</div>
        <div className="px-5 py-4 text-sm font-semibold" style={fonts.bodyFont}>{rightHeader}</div>
      </div>
      {rows.map(([left, right], i) => (
        <div
          key={left}
          className="grid grid-cols-2"
          style={{
            borderTop: i === 0 ? "none" : `1px solid ${palette.line}`,
            background: i % 2 === 0 ? palette.surface : "transparent",
          }}
        >
          <div className="px-5 py-4 text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>{left}</div>
          <div className="px-5 py-4 text-sm font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>{right}</div>
        </div>
      ))}
    </div>
  );
}

function FAQItem({ item, palette, fonts }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: palette.line }}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-5 py-6 text-left"
      >
        <span className="text-lg font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          color={palette.muted}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 180ms ease",
          }}
        />
      </button>
      {open && <div className="pb-6">{item.a}</div>}
    </div>
  );
}

export default function RentalGuide() {
  const { palette, fonts } = usePalette();

  const highlights = [
    { icon: CreditCard, title: "50% to reserve", body: "The first half secures your date and inventory." },
    { icon: ShieldCheck, title: "Refundable deposit", body: "Security deposits are separate from rental pricing." },
    { icon: Timer, title: "Clear deadlines", body: "Balance due 24 hours before pickup, with a 12-hour cancellation cutoff." },
    { icon: MapPin, title: "Toronto pickup", body: "Pickup and return are available in Toronto. Delivery requests are handled separately." },
  ];

  const faqs = [
    {
      q: "How much do I have to rent?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Individual rental orders have a $50 minimum rental value.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>You don't need to book a full event experience to rent individual pieces.</Paragraph>
        </>
      ),
    },
    {
      q: "How much do I have to pay to reserve my rental?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>We require 50% of your rental balance at booking, plus your refundable security deposit.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>The 50% booking payment reserves your date and inventory.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Your security deposit is separate and refundable.</Paragraph>
        </>
      ),
    },
    {
      q: "When do I pay the security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Your refundable security deposit is collected at the time of booking.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>You can pay it by card or e-transfer.</Paragraph>
        </>
      ),
    },
    {
      q: "How much is the security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>It depends on your rental total.</Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>For individual rentals:</Paragraph>
          <InlinePriceTable rows={INDIVIDUAL_DEPOSIT_ROWS} palette={palette} fonts={fonts} leftHeader="Rental Total" rightHeader="Security Deposit" />
          <Paragraph palette={palette} fonts={fonts} emphasize>For full Experiences:</Paragraph>
          <InlinePriceTable rows={EXPERIENCE_DEPOSIT_ROWS} palette={palette} fonts={fonts} leftHeader="Experience Total" rightHeader="Security Deposit" />
        </>
      ),
    },
    {
      q: "Is the security deposit part of the rental price?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>No.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>The security deposit is separate from your rental cost and is refundable after your items are returned and inspected.</Paragraph>
        </>
      ),
    },
    {
      q: "When do I get my security deposit back?",
      a: (
        <Paragraph palette={palette} fonts={fonts}>
          Your security deposit is released within 48 hours of equipment return, provided there are no applicable damage, missing-item, or other charges under your rental agreement.
        </Paragraph>
      ),
    },
    {
      q: "Can I pay by e-transfer?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>Yes!</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>We accept e-transfer payments.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>You can pay your remaining balance by e-transfer, and your security deposit can also be paid by e-transfer.</Paragraph>
        </>
      ),
    },
    {
      q: "I want to pay my remaining balance by e-transfer. Is that okay?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>Absolutely.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Just contact us before your balance is due so we can arrange it with you.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>This is important because our payment system may otherwise attempt to charge your card or automatically cancel an unpaid reservation.</Paragraph>
        </>
      ),
    },
    {
      q: "When is my remaining balance due?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Your remaining 50% is due 24 hours before your scheduled pickup time.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>We'll send you a reminder before your balance is due.</Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I forget to pay?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Reservations that haven't been paid in full 12 hours before pickup are automatically cancelled.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>If you need to make an e-transfer payment or have another issue with your payment, please contact us before that cancellation window.</Paragraph>
        </>
      ),
    },
    {
      q: "Why is there a 12-hour cancellation cutoff if payment is due 24 hours before pickup?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>The 24-hour deadline gives you time to complete your payment.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>The 12-hour cutoff gives us a final window to release unpaid inventory if the reservation hasn't been completed.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>If you've arranged an e-transfer payment with us, your reservation will not be treated as an unpaid reservation simply because the e-transfer hasn't been received yet.</Paragraph>
        </>
      ),
    },
    {
      q: "Can I rent just one or two things?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>Yes.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>That's one of the reasons we have a $50 minimum rather than requiring a large rental package.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>You can rent individual pieces such as centerpieces, charger plates, glassware, serving pieces, and other available decor and event items.</Paragraph>
        </>
      ),
    },
    {
      q: "Do I have to book a full Experience to rent your items?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>No.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Our Experiences are our larger, curated event experiences.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Individual rentals are available separately for customers who simply need a few beautiful pieces for their celebration.</Paragraph>
        </>
      ),
    },
    {
      q: "What's the difference between an Individual Rental and an Experience?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>An Individual Rental is exactly what it sounds like: you select the rental pieces you need.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>An Experience brings together interactive experiences, decor, keepsakes, guest elements, and other components designed to create a complete celebration experience.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Our Experiences start at $1,200.</Paragraph>
        </>
      ),
    },
    {
      q: "Can I add rentals to one of your Experiences?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Yes, depending on availability and the configuration of your Experience.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Additional items can be discussed when you're building your Experience.</Paragraph>
        </>
      ),
    },
    {
      q: "Do you deliver?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Delivery is available depending on the order and location.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Please contact us for delivery requests.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Delivery pricing is separate unless specifically included in your booking.</Paragraph>
        </>
      ),
    },
    {
      q: "Can I pick up my rental myself?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>Yes.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Self Setup rentals are available for Toronto pickup and Toronto return.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Your booking confirmation will include your pickup and return instructions.</Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I damage something?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Please don't panic.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Accidents happen.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Contact us and let us know what happened.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>We'll assess the item and determine the applicable repair or replacement cost according to your rental agreement.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>If applicable, the amount may be deducted from your refundable security deposit.</Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I lose something?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Missing rental items may be subject to a replacement charge.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Where applicable, the cost can be deducted from your security deposit.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>If the replacement cost exceeds the security deposit, the remaining amount may be the renter's responsibility.</Paragraph>
        </>
      ),
    },
    {
      q: "What if something is dirty when I return it?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Normal cleanup is part of our rental process.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>However, items returned with excessive food, residue, stains, or other mess beyond normal use may be subject to an additional cleaning charge.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>We'll provide specific care and return instructions for items that need special handling.</Paragraph>
        </>
      ),
    },
    {
      q: "What if I need to return something late?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Please contact us as soon as possible.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Our inventory may be booked for another celebration, so late returns can affect another customer's order.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Additional charges may apply if a late return creates additional rental or service costs.</Paragraph>
        </>
      ),
    },
    {
      q: "What if my plans change?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Contact us as soon as you know.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Our cancellation and rescheduling terms are outlined in your rental agreement.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>The earlier you contact us, the more options we may have.</Paragraph>
        </>
      ),
    },
    {
      q: "Do I get my security deposit back if I cancel?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Security deposit treatment following a cancellation will depend on the terms of your rental agreement and whether the inventory has already been committed, prepared, customized, or otherwise affected by the cancellation.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Your rental agreement will explain the applicable terms before you finalize your booking.</Paragraph>
        </>
      ),
    },
    {
      q: "Can I change my rental after booking?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Please contact us as soon as possible.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Changes are subject to inventory availability and may affect your rental balance or security deposit.</Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I need something that's not listed?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>Ask us!</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>Our available inventory changes, and we may be able to help you find what you're looking for.</Paragraph>
        </>
      ),
    },
    {
      q: "Why do you require a security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>Our rental pieces are used for many different celebrations.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>The security deposit gives us a little protection while our inventory is in your care, while keeping the actual rental price accessible.</Paragraph>
          <Paragraph palette={palette} fonts={fonts}>And because it's refundable, you get it back when everything comes home safely.</Paragraph>
        </>
      ),
    },
  ];

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="RENTAL GUIDE"
        title="The practical stuff, without the tiny-print scavenger hunt."
        script="Know what you are agreeing to before you book."
        body="A straightforward guide to minimums, payment timing, security deposits, pickup and return. This page is intentionally less theatrical because rental policies should not require interpretive dance."
        palette={palette}
        fonts={fonts}
        align="center"
      />

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="THE SHORT VERSION"
            title="The rules you probably came here to find."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 60}>
                  <ElevatedCard palette={palette} className="h-full p-7">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{
                        background: i % 2 ? palette.gold : palette.primaryDeep,
                        color: i % 2 ? palette.primaryDeep : "#FFFFFF",
                      }}
                    >
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {item.body}
                    </p>
                  </ElevatedCard>
                </Reveal>
              );
            })}
          </div>

          <ElevatedCard palette={palette} className="mx-auto mt-10 max-w-4xl p-7 sm:p-9">
            <div className="grid gap-3 sm:grid-cols-2">
              {SHORT_VERSION.map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <Check size={15} color={palette.goldDeep} className="mt-1 shrink-0" />
                  <span className="text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.ink }}>{line}</span>
                </div>
              ))}
            </div>
          </ElevatedCard>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "92px 24px" }}>
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            eyebrow="SECURITY DEPOSITS"
            title="Refundable, separate and based on the value of the booking."
            body="The deposit is not part of the rental price. It is held against damage, missing items and other applicable charges, then released after return and inspection."
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-14 grid gap-7 lg:grid-cols-2">
            <ElevatedCard palette={palette} className="p-7">
              <Kicker palette={palette} fonts={fonts}>INDIVIDUAL RENTALS</Kicker>
              <h3 className="mt-3 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                Rental deposit table
              </h3>
              <div className="mt-6">
                <PriceTable
                  rows={INDIVIDUAL_DEPOSIT_ROWS}
                  leftHeader="Rental total"
                  rightHeader="Security deposit"
                  palette={palette}
                  fonts={fonts}
                />
              </div>
            </ElevatedCard>

            <ElevatedCard palette={palette} className="p-7">
              <Kicker palette={palette} fonts={fonts}>FULL EXPERIENCES</Kicker>
              <h3 className="mt-3 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                Experience deposit table
              </h3>
              <div className="mt-6">
                <PriceTable
                  rows={EXPERIENCE_DEPOSIT_ROWS}
                  leftHeader="Experience total"
                  rightHeader="Security deposit"
                  palette={palette}
                  fonts={fonts}
                />
              </div>
            </ElevatedCard>
          </div>
        </div>
      </JewelBand>

      <section style={{ ...paperTexture(palette), padding: "92px 24px" }}>
        <div className="mx-auto max-w-4xl">
          <SectionIntro
            eyebrow="RENTAL FAQ"
            title="The details, without making you decode a contract first."
            palette={palette}
            fonts={fonts}
          />

          <ElevatedCard palette={palette} className="mt-12 px-7 sm:px-9">
            {faqs.map((item) => (
              <FAQItem key={item.q} item={item} palette={palette} fonts={fonts} />
            ))}
          </ElevatedCard>

          <div className="mt-12 text-center">
            <Sparkles className="mx-auto" size={18} color={palette.goldDeep} />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              The full rental agreement provided at booking controls if anything on this summary conflicts with the signed terms.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
