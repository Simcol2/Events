import React from "react";

export default function BuilderStepHeader({
  stepNumber,
  totalSteps,
  title,
  description,
  includedLabel,
  selectedCount,
  chooseCount,
  palette,
  fonts,
}) {
  const complete = typeof chooseCount === "number" && selectedCount >= chooseCount;

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p
          className="text-xs font-bold tracking-[0.2em]"
          style={{
            ...fonts.bodyFont,
            color: palette.goldDeep,
          }}
        >
          STEP {stepNumber} OF {totalSteps}
        </p>

        {typeof chooseCount === "number" && (
          <div
            className="rounded-full px-4 py-2 text-xs font-bold"
            style={{
              ...fonts.bodyFont,
              background: complete ? `${palette.accent}18` : palette.surface,
              border: `1px solid ${complete ? palette.accent : palette.line}`,
              color: complete ? palette.accent : palette.muted,
            }}
          >
            {Math.min(selectedCount, chooseCount)} OF {chooseCount} INCLUDED
          </div>
        )}
      </div>

      <h2
        className="mt-4"
        style={{
          ...fonts.displayFont,
          color: palette.primaryDeep,
          fontSize: "clamp(2rem, 4vw, 3.4rem)",
          lineHeight: 1,
          fontWeight: 650,
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h2>

      <p
        className="mt-4 max-w-2xl text-base leading-7"
        style={{
          ...fonts.bodyFont,
          color: palette.muted,
        }}
      >
        {description}
      </p>

      {includedLabel && (
        <p
          className="mt-4 text-sm font-semibold"
          style={{
            ...fonts.bodyFont,
            color: palette.accent,
          }}
        >
          {includedLabel}
        </p>
      )}
    </header>
  );
}
