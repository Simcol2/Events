import React, { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { usePalette } from "../PaletteContext";

function PriceTable({ rows, palette, fonts, leftHeader, rightHeader }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-sm border" style={{ borderColor: palette.line }}>
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr style={{ background: `${palette.primary}0D` }}>
            <th
              className="px-4 py-3 text-sm font-semibold tracking-[0.05em]"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderBottom: `1px solid ${palette.line}` }}
            >
              {leftHeader}
            </th>
            <th
              className="px-4 py-3 text-sm font-semibold tracking-[0.05em]"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderBottom: `1px solid ${palette.line}` }}
            >
              {rightHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([left, right], i) => (
            <tr key={left} style={{ background: i % 2 === 0 ? palette.surface : "transparent" }}>
              <td
                className="px-4 py-3 text-base"
                style={{ ...fonts.bodyFont, color: palette.ink, borderBottom: i === rows.length - 1 ? "none" : `1px solid ${palette.line}` }}
              >
                {left}
              </td>
              <td
                className="px-4 py-3 text-base font-semibold"
                style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderBottom: i === rows.length - 1 ? "none" : `1px solid ${palette.line}` }}
              >
                {right}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items, palette, fonts }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: palette.gold }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Paragraph({ children, palette, fonts, emphasize }) {
  return (
    <p
      className={`mt-3 leading-relaxed ${emphasize ? "text-lg font-semibold" : "text-base"}`}
      style={{ ...fonts.bodyFont, color: emphasize ? palette.primaryDeep : palette.ink }}
    >
      {children}
    </p>
  );
}

function PolicySection({ number, title, children, palette, fonts }) {
  return (
    <div className="border-t py-10" style={{ borderColor: palette.line }}>
      <div className="flex items-baseline gap-3">
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: palette.primaryDeep, color: "#FFFFFF" }}
        >
          {number}
        </span>
        <h2 className="text-2xl font-semibold sm:text-3xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {title}
        </h2>
      </div>
      <div className="mt-2 pl-11">{children}</div>
    </div>
  );
}

const INDIVIDUAL_DEPOSIT_ROWS = [
  ["$50–$149", "$50"],
  ["$150–$299", "$100"],
  ["$300–$499", "$150"],
  ["$500–$749", "$200"],
  ["$750–$999", "$250"],
  ["$1,000+", "$300"],
];

const EXPERIENCE_DEPOSIT_ROWS = [
  ["$1,200–$1,499", "$350"],
  ["$1,500–$2,499", "$500"],
  ["$2,500–$4,999", "$750"],
  ["$5,000+", "$1,000+"],
];

const SHORT_VERSION = [
  "$50 minimum rental",
  "50% down to reserve",
  "Refundable security deposit paid at booking",
  "Remaining 50% due 24 hours before pickup",
  "Reservations unpaid 12 hours before pickup are automatically cancelled",
  "E-transfer payments are welcome",
  "Security deposit released within 48 hours of return",
  "Toronto pickup and return available",
  "Delivery? Please contact us.",
];

function RentalFAQItem({ item, index, openIndex, setOpenIndex, palette, fonts }) {
  const open = openIndex === index;
  return (
    <div className="border-b" style={{ borderColor: palette.line }}>
      <button
        onClick={() => setOpenIndex(open ? null : index)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold sm:text-lg" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          color={palette.muted}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms ease", flexShrink: 0 }}
        />
      </button>
      {open && <div className="pb-6">{item.a}</div>}
    </div>
  );
}

export default function RentalGuide() {
  const { palette, fonts } = usePalette();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      q: "How much do I have to rent?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Individual rental orders have a $50 minimum rental value.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You don't need to book a full event experience to rent individual pieces.
          </Paragraph>
        </>
      ),
    },
    {
      q: "How much do I have to pay to reserve my rental?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            We require 50% of your rental balance at booking, plus your refundable security deposit.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The 50% booking payment reserves your date and inventory.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your security deposit is separate and refundable.
          </Paragraph>
        </>
      ),
    },
    {
      q: "When do I pay the security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Your refundable security deposit is collected at the time of booking.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You can pay it by card or e-transfer.
          </Paragraph>
        </>
      ),
    },
    {
      q: "How much is the security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            It depends on your rental total.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            For individual rentals:
          </Paragraph>
          <PriceTable
            rows={INDIVIDUAL_DEPOSIT_ROWS}
            palette={palette}
            fonts={fonts}
            leftHeader="Rental Total"
            rightHeader="Security Deposit"
          />
          <Paragraph palette={palette} fonts={fonts} emphasize>
            For full Experiences:
          </Paragraph>
          <PriceTable
            rows={EXPERIENCE_DEPOSIT_ROWS}
            palette={palette}
            fonts={fonts}
            leftHeader="Experience Total"
            rightHeader="Security Deposit"
          />
        </>
      ),
    },
    {
      q: "Is the security deposit part of the rental price?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            No.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The security deposit is separate from your rental cost and is refundable after your items are returned
            and inspected.
          </Paragraph>
        </>
      ),
    },
    {
      q: "When do I get my security deposit back?",
      a: (
        <Paragraph palette={palette} fonts={fonts}>
          Your security deposit is released within 48 hours of equipment return, provided there are no applicable
          damage, missing-item, or other charges under your rental agreement.
        </Paragraph>
      ),
    },
    {
      q: "Can I pay by e-transfer?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Yes!
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We accept e-transfer payments.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You can pay your remaining balance by e-transfer, and your security deposit can also be paid by
            e-transfer.
          </Paragraph>
        </>
      ),
    },
    {
      q: "I want to pay my remaining balance by e-transfer. Is that okay?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Absolutely.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Just contact us before your balance is due so we can arrange it with you.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            This is important because our payment system may otherwise attempt to charge your card or automatically
            cancel an unpaid reservation.
          </Paragraph>
        </>
      ),
    },
    {
      q: "When is my remaining balance due?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Your remaining 50% is due 24 hours before your scheduled pickup time.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We'll send you a reminder before your balance is due.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I forget to pay?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Reservations that haven't been paid in full 12 hours before pickup are automatically cancelled.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If you need to make an e-transfer payment or have another issue with your payment, please contact us
            before that cancellation window.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Why is there a 12-hour cancellation cutoff if payment is due 24 hours before pickup?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            The 24-hour deadline gives you time to complete your payment.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The 12-hour cutoff gives us a final window to release unpaid inventory if the reservation hasn't been
            completed.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If you've arranged an e-transfer payment with us, your reservation will not be treated as an unpaid
            reservation simply because the e-transfer hasn't been received yet.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Can I rent just one or two things?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Yes.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            That's one of the reasons we have a $50 minimum rather than requiring a large rental package.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You can rent individual pieces such as centerpieces, charger plates, glassware, serving pieces, and
            other available decor and event items.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Do I have to book a full Experience to rent your items?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            No.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our Experiences are our larger, curated event experiences.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Individual rentals are available separately for customers who simply need a few beautiful pieces for
            their celebration.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What's the difference between an Individual Rental and an Experience?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            An Individual Rental is exactly what it sounds like: you select the rental pieces you need.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            An Experience brings together interactive experiences, decor, keepsakes, guest elements, and other
            components designed to create a complete celebration experience.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our Experiences start at $1,200.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Can I add rentals to one of your Experiences?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Yes, depending on availability and the configuration of your Experience.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Additional items can be discussed when you're building your Experience.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Do you deliver?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Delivery is available depending on the order and location.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Please contact us for delivery requests.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Delivery pricing is separate unless specifically included in your booking.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Can I pick up my rental myself?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Yes.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Self Setup rentals are available for Toronto pickup and Toronto return.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your booking confirmation will include your pickup and return instructions.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I damage something?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Please don't panic.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Accidents happen.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Contact us and let us know what happened.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We'll assess the item and determine the applicable repair or replacement cost according to your rental
            agreement.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If applicable, the amount may be deducted from your refundable security deposit.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I lose something?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Missing rental items may be subject to a replacement charge.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Where applicable, the cost can be deducted from your security deposit.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If the replacement cost exceeds the security deposit, the remaining amount may be the renter's
            responsibility.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What if something is dirty when I return it?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Normal cleanup is part of our rental process.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            However, items returned with excessive food, residue, stains, or other mess beyond normal use may be
            subject to an additional cleaning charge.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We'll provide specific care and return instructions for items that need special handling.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What if I need to return something late?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Please contact us as soon as possible.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our inventory may be booked for another celebration, so late returns can affect another customer's
            order.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Additional charges may apply if a late return creates additional rental or service costs.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What if my plans change?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Contact us as soon as you know.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our cancellation and rescheduling terms are outlined in your rental agreement.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The earlier you contact us, the more options we may have.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Do I get my security deposit back if I cancel?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Security deposit treatment following a cancellation will depend on the terms of your rental agreement
            and whether the inventory has already been committed, prepared, customized, or otherwise affected by
            the cancellation.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your rental agreement will explain the applicable terms before you finalize your booking.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Can I change my rental after booking?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Please contact us as soon as possible.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Changes are subject to inventory availability and may affect your rental balance or security deposit.
          </Paragraph>
        </>
      ),
    },
    {
      q: "What happens if I need something that's not listed?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Ask us!
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our available inventory changes, and we may be able to help you find what you're looking for.
          </Paragraph>
        </>
      ),
    },
    {
      q: "Why do you require a security deposit?",
      a: (
        <>
          <Paragraph palette={palette} fonts={fonts}>
            Our rental pieces are used for many different celebrations.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The security deposit gives us a little protection while our inventory is in your care, while keeping
            the actual rental price accessible.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            And because it's refundable, you get it back when everything comes home safely.
          </Paragraph>
        </>
      ),
    },
  ];

  return (
    <div style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <p className="text-sm font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          RENTAL POLICY
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Simple rentals. Clear pricing. No surprises.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style={{ ...fonts.bodyFont, color: "#FFFFFFDD" }}>
          Whether you're renting a single centerpiece, a set of charger plates, specialty glassware, or several
          pieces for your celebration, we want the process to be easy to understand from the start.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="text-lg font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          Here are the basics.
        </p>

        <PolicySection number={1} title="Rental Minimum" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Individual rental orders have a minimum rental value of:
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            $50
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            This is the rental value of your items before delivery or other applicable services.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            So yes, you can absolutely rent just a few things.
          </Paragraph>
          <BulletList
            palette={palette}
            fonts={fonts}
            items={["A centerpiece.", "A set of charger plates.", "Specialty wine glasses.", "Serving pieces.", "Table decor."]}
          />
          <Paragraph palette={palette} fonts={fonts}>
            You don't need to book a full event experience to rent from us.
          </Paragraph>
        </PolicySection>

        <PolicySection number={2} title="Reserving Your Rental" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            To reserve your date and rental items, we require:
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            50% of your rental balance + your refundable security deposit
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The 50% payment secures your reservation.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The security deposit is separate and is refundable after your rental is returned and inspected.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your reservation is not considered secured until the required booking payment and security deposit have
            been received.
          </Paragraph>
        </PolicySection>

        <PolicySection number={3} title="Refundable Security Deposit" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Your security deposit is based on the value of your rental order.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Individual Rentals
          </Paragraph>
          <PriceTable
            rows={INDIVIDUAL_DEPOSIT_ROWS}
            palette={palette}
            fonts={fonts}
            leftHeader="Rental Total"
            rightHeader="Refundable Security Deposit"
          />
          <Paragraph palette={palette} fonts={fonts} emphasize>
            Full Experiences
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our full Experiences start at $1,200 and have a separate security deposit structure.
          </Paragraph>
          <PriceTable
            rows={EXPERIENCE_DEPOSIT_ROWS}
            palette={palette}
            fonts={fonts}
            leftHeader="Experience Total"
            rightHeader="Refundable Security Deposit"
          />
          <Paragraph palette={palette} fonts={fonts}>
            Your security deposit is not part of the rental price.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            It is simply held as security while our rental inventory is in your care.
          </Paragraph>
        </PolicySection>

        <PolicySection number={4} title="When Is the Security Deposit Paid?" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            The security deposit is collected at the time of booking.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You can pay your security deposit by card or e-transfer.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Once your rental has been returned and inspected, your security deposit will be released within:
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            48 hours of equipment return
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If there is damage, missing inventory, or another charge covered by your rental agreement, we will
            contact you before applying any applicable amount against the security deposit.
          </Paragraph>
        </PolicySection>

        <PolicySection number={5} title="When Is the Remaining Balance Due?" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Your remaining rental balance is due:
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            24 hours before pickup
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            For example, if your pickup is Saturday at 10:00 AM, your remaining balance is due by Friday at 10:00
            AM.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We will send a reminder before your balance is due.
          </Paragraph>
        </PolicySection>

        <PolicySection number={6} title="What Happens If My Rental Isn't Paid?" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Reservations that have not been paid in full 12 hours before the scheduled pickup time are automatically
            cancelled.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            This helps us make sure inventory isn't being held for an unpaid reservation when another customer could
            have rented it.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If you need to arrange a different payment method, please contact us before the 12-hour cancellation
            window.
          </Paragraph>
        </PolicySection>

        <PolicySection number={7} title="Yes, We Accept E-Transfer" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            We know not everyone wants to use a credit card.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            That's completely okay.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            E-transfer payments are welcome.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            You can pay:
          </Paragraph>
          <BulletList
            palette={palette}
            fonts={fonts}
            items={["Your remaining rental balance by e-transfer", "Your refundable security deposit by e-transfer", "Or both"]}
          />
          <Paragraph palette={palette} fonts={fonts}>
            If you would like to pay your remaining balance by e-transfer, simply contact us before the payment
            deadline so we can arrange it with you.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            This is important because our system may otherwise automatically attempt to process the remaining
            balance or cancel an unpaid reservation.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Once we've arranged your e-transfer payment, your reservation will be handled accordingly.
          </Paragraph>
        </PolicySection>

        <PolicySection number={8} title="Pickup & Return" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Self Setup rentals are available for Toronto pickup and Toronto return.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your confirmation will include your pickup time, location, return instructions, and any special
            handling instructions for your items.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Please return everything:
          </Paragraph>
          <BulletList
            palette={palette}
            fonts={fonts}
            items={[
              "At the agreed time",
              "With all pieces and accessories",
              "In the containers or packaging provided",
              "Protected from weather and damage",
              "In accordance with the care instructions provided",
            ]}
          />
        </PolicySection>

        <PolicySection number={9} title="Delivery" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Need your rentals delivered?
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Please contact us.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Delivery availability and pricing depend on your location, order size, timing, and the services
            required.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Delivery is separate from the rental price unless specifically included in your booking.
          </Paragraph>
        </PolicySection>

        <PolicySection number={10} title="Taking Care of Your Rentals" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            We know accidents happen.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Our goal isn't to make you nervous about using the pieces. We simply ask that you treat our inventory
            with reasonable care.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Please keep rentals:
          </Paragraph>
          <BulletList
            palette={palette}
            fonts={fonts}
            items={[
              "Dry",
              "Secure",
              "Protected from weather",
              "Away from situations where they may be knocked over or damaged",
              "Properly packed for return",
            ]}
          />
          <Paragraph palette={palette} fonts={fonts}>
            For glassware, dishware, serving pieces, and other specialty items, follow the cleaning and packing
            instructions provided with your order.
          </Paragraph>
        </PolicySection>

        <PolicySection number={11} title="Damage & Missing Items" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            If something is accidentally damaged, please let us know.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We will assess the item and determine the applicable repair or replacement cost in accordance with your
            rental agreement.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Where applicable, these costs may be deducted from your refundable security deposit.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If the cost exceeds the security deposit, the remaining balance may be charged to the renter.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We don't expect everything to come back looking brand new.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We simply need our inventory to come back in a condition that allows us to safely and reasonably prepare
            it for its next celebration.
          </Paragraph>
        </PolicySection>

        <PolicySection number={12} title="Late Returns" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Our rental inventory may be reserved for another customer immediately after your event.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Please return everything at the agreed time.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Late returns may result in additional charges if the delay affects another reservation or creates
            additional costs.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If something unexpected happens, contact us as soon as possible.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Communication goes a long way.
          </Paragraph>
        </PolicySection>

        <PolicySection number={13} title="Cancellations & Changes" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Your 50% booking payment reserves your date and the inventory selected for your event.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Cancellation, rescheduling, and order-change terms are outlined in your rental agreement.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If your plans change, please contact us as soon as possible.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The earlier we know, the more options we may have.
          </Paragraph>
        </PolicySection>

        <PolicySection number={14} title="Your Security Deposit Is Not Your Final Payment" palette={palette} fonts={fonts}>
          <Paragraph palette={palette} fonts={fonts}>
            Your security deposit and rental balance are separate.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            Your security deposit does not count toward your remaining rental balance.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            For example, if your rental is $200:
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts} emphasize>
            At booking:
          </Paragraph>
          <BulletList palette={palette} fonts={fonts} items={["$100 booking payment", "$100 refundable security deposit"]} />
          <Paragraph palette={palette} fonts={fonts} emphasize>
            24 hours before pickup:
          </Paragraph>
          <BulletList palette={palette} fonts={fonts} items={["$100 remaining rental balance"]} />
          <Paragraph palette={palette} fonts={fonts} emphasize>
            After return:
          </Paragraph>
          <BulletList palette={palette} fonts={fonts} items={["$100 security deposit released within 48 hours"]} />
          <Paragraph palette={palette} fonts={fonts}>
            So your actual rental cost remains $200.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            The security deposit is simply returned after the rental is safely back with us.
          </Paragraph>
        </PolicySection>

        <div className="mt-4 rounded-xl p-8" style={{ background: `${palette.primary}0D`, border: `1px solid ${palette.line}` }}>
          <p className="text-sm font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
            THE SHORT VERSION
          </p>
          <ul className="mt-4 space-y-2.5">
            {SHORT_VERSION.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: palette.gold }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Have a question?
          </h2>
          <Paragraph palette={palette} fonts={fonts}>
            If you're not sure how much you'll need to put down, what your security deposit will be, or whether
            something can be rented separately, just ask.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We're happy to help you figure it out.
          </Paragraph>
          <p className="mt-4 text-lg font-semibold italic" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Let's make your celebration beautiful without making the rental process complicated.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 py-16 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-sm font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          RENTAL FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Everything you need to know before you rent.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed" style={{ ...fonts.bodyFont, color: "#FFFFFFDD" }}>
          Renting shouldn't feel complicated. Here are the questions we get asked most often.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        {faqs.map((item, i) => (
          <RentalFAQItem
            key={item.q}
            item={item}
            index={i}
            openIndex={openFaqIndex}
            setOpenIndex={setOpenFaqIndex}
            palette={palette}
            fonts={fonts}
          />
        ))}

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Still have a question?
          </h3>
          <Paragraph palette={palette} fonts={fonts}>
            We're happy to help.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            If you're unsure about an item, payment, pickup, delivery, or what you'll need for your event, just
            reach out.
          </Paragraph>
          <Paragraph palette={palette} fonts={fonts}>
            We're here to make renting easy.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
