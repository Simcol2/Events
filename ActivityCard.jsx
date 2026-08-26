import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function ActivityCard({ activity, number, featured = false }) {
  return (
    <article className={`group relative border-t border-[#DCD2BC] py-8 ${featured ? "bg-[#F0F3EA] px-6 sm:px-8" : ""}`}>
      <div className="grid gap-5 md:grid-cols-[70px_1fr_auto] md:items-start md:gap-8">
        <div className="font-[Cormorant_Garamond] text-4xl font-medium text-[#B8935A]">
          {String(number).padStart(2, "0")}
        </div>

        <div>
          <div className="font-[Jost] text-[9px] font-semibold tracking-[0.22em] text-[#B8935A]">
            {activity.tagline}
          </div>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-none text-[#4E5A44]">
            {activity.label}
          </h2>
          <div className="mt-2 font-['Cormorant_Garamond'] text-xl italic text-[#817A68]">
            {activity.subtitle}
          </div>
          <p className="mt-4 max-w-2xl font-[Jost] text-sm leading-7 text-[#5C5645]">
            {activity.description}
          </p>

          {activity.stations && (
            <div className="mt-5 flex flex-wrap gap-2">
              {activity.stations.map((station) => (
                <span key={station} className="border border-[#CFC7B1] px-3 py-1.5 font-[Jost] text-[9px] tracking-[0.12em] text-[#68775F]">
                  {station.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        <ArrowUpRight size={18} strokeWidth={1.2} className="text-[#B8935A] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </article>
  );
}
