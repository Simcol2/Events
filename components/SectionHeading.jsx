import React from "react";
import { Leaf } from "lucide-react";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className="font-[Space_Grotesk] text-sm font-semibold tracking-[0.34em] text-[#8A6A1E]">
          {eyebrow.toUpperCase()}
        </div>
      )}
      <h1 className="mt-2 font-['Fraunces'] text-5xl font-semibold leading-[.95] tracking-[-0.02em] text-[#0B4933] sm:text-6xl">
        {title}
      </h1>
      <div className={`mt-5 flex items-center gap-3 ${centered ? "justify-center" : "justify-start"}`}>
        <span className="h-px w-10 bg-[#8A6A1E]" />
        <Leaf size={13} strokeWidth={1.4} className="text-[#8A6A1E]" />
        <span className="h-px w-10 bg-[#8A6A1E]" />
      </div>
      {subtitle && (
        <p className={`mt-5 max-w-2xl font-[Space_Grotesk] text-base leading-7 text-[#716B5C] ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
