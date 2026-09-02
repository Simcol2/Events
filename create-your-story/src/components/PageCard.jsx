export default function PageCard({ page, isGlowing }) {
  if (!page) return null;

  return (
    <div
      className={`mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center rounded-3xl p-10 text-center transition-shadow duration-700 ${
        isGlowing ? "shadow-[0_0_80px_20px_rgba(255,214,153,0.55)]" : "shadow-none"
      }`}
    >
      {/* min 48px (text-5xl) at every viewport per the projector pro-tip: pastel
          colors and small type both wash out badly on cheap venue projectors. */}
      <p className="text-5xl font-semibold leading-snug text-white sm:text-6xl">{page.rendered_text}</p>
      {page.guest_attribution && (
        <p className="mt-6 text-2xl italic text-stone-200">Contributed by {page.guest_attribution}</p>
      )}
    </div>
  );
}
