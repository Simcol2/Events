import React from "react";

// Item descriptions are written with blank lines between sections,
// **bold** lead-ins, and "- " bullet lines, so a long description reads
// as scannable blocks rather than one unbroken wall of text. Text with
// none of those markers renders as a single paragraph, exactly as before.
// Shared by every place a catalog item's full description is shown.
function inlineChunks(text, { blockBold }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong
        key={i}
        className={`font-semibold text-[#0B4933] ${blockBold ? "block" : ""}`}
      >
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{chunk}</React.Fragment>
    )
  );
}

export default function DescriptionBody({ text }) {
  const blocks = String(text)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length && lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="mt-2 list-disc space-y-1 pl-5">
          {lines.map((line, j) => (
            <li key={j} className="font-[Space_Grotesk] text-base leading-6 text-[#5C5645]">
              {inlineChunks(line.slice(2), { blockBold: false })}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="mt-3 font-[Space_Grotesk] text-base leading-6 text-[#5C5645] first:mt-4">
        {inlineChunks(block, { blockBold: true })}
      </p>
    );
  });
}
