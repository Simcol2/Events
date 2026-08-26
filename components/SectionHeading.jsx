import React from "react";
import { Leaf } from "lucide-react";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className="font-[Jost] text-[10px] font-semibold tracking-[0.34em] text-[#B8935A]">
          {eyebrow.toUpperCase()}
        </div>
      )}
      <h1 className="mt-2 font-['Cormorant_Garamond'] text-5xl font-semibold leading-[.95] tracking-[-0.02em] text-[#4E5A44] sm:text-6xl">
        {title}
      </h1>
      <div className={`mt-5 flex items-center gap-3 ${centered ? "justify-center" : "justify-start"}`}>
        <span className="h-px w-10 bg-[#B8935A]" />
        <Leaf size={13} strokeWidth={1.4} className="text-[#B8935A]" />
        <span className="h-px w-10 bg-[#B8935A]" />
      </div>
      {subtitle && (
        <p className={`mt-5 max-w-2xl font-[Jost] text-sm leading-7 text-[#716B5C] ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
