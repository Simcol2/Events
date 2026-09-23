import React from "react";
import {
  CheckCircle2,
  CreditCard,
  FileSignature,
  CalendarClock,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Pay your deposit",
    body: "Pay the 50% booking deposit now to reserve your rental items.",
    Icon: CreditCard,
  },
  {
    number: "2",
    title: "Sign + choose payment method",
    body: "Sign your rental agreement, then keep a card securely on file for automatic future charges or choose manual payment.",
    Icon: FileSignature,
  },
  {
    number: "3",
    title: "Pay the remaining balance",
    body: "The remaining 50% rental balance is due 7 days before pickup.",
    Icon: CalendarClock,
  },
  {
    number: "4",
    title: "Security deposit",
    body: "Your refundable security deposit is due 48 hours before pickup.",
    Icon: ShieldCheck,
  },
  {
    number: "5",
    title: "Pick up your items",
    body: "Once required payments are complete, your rentals are ready for pickup.",
    Icon: PackageCheck,
  },
];

export default function HowRentalWorks() {
  return (
    <section className="mt-6 rounded-2xl border border-[#E6DDC7] bg-[#FFFDF8] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={19} className="text-[#D9AE45]" />
        <h3 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
          How it works
        </h3>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {steps.map(({ number, title, body, Icon }) => (
          <div key={number} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B4933] font-[Space_Grotesk] text-sm font-bold text-white">
              {number}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-[#8A6A1E]" />
                <p className="font-[Space_Grotesk] text-sm font-bold text-[#292929]">
                  {title}
                </p>
              </div>

              <p className="mt-1 font-[Space_Grotesk] text-xs leading-5 text-[#6F6859]">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
