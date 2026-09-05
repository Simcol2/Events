import React, { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { usePalette } from "../PaletteContext";

// Newsletter signup is a placeholder for now - no email service is wired
// up yet, so submitting just acknowledges the input rather than sending
// anywhere. Swap handleSubmit for a real subscribe call once one exists.
function NewsletterSignup({ palette, fonts }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="mt-4 text-sm" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
        Thanks, you're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex max-w-xs gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-sm border bg-transparent px-3 py-2.5 text-sm outline-none"
        style={{ ...fonts.bodyFont, borderColor: palette.line, color: palette.ink }}
      />
      <button
        type="submit"
        className="flex-shrink-0 rounded-sm px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-white"
        style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
      >
        JOIN
      </button>
    </form>
  );
}

export default function SiteFooter({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <footer className="mt-24" style={{ borderTop: `1px solid ${palette.line}`, background: `${palette.primary}0D` }}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_.7fr_.7fr_.9fr]">
          <div>
            <div className="text-xs font-semibold tracking-[0.4em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              A SLICE OF G
            </div>
            <div className="mt-1 text-4xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              EVENTS
            </div>
            <p className="mt-4 max-w-md text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Interactive event experiences that become keepsakes. You bring the people, we create the experience.
            </p>
            <div className="mt-5 space-y-2 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
              <div className="flex items-center gap-2">
                <MapPin size={14} color={palette.gold} />
                Toronto & the GTA
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} color={palette.gold} />
                hello@asliceofgevents.com
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.22em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              EXPLORE
            </div>
            <div className="mt-4 space-y-3 text-base" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
              <button onClick={() => navigate("/how-it-works")} className="block hover:opacity-70">How It Works</button>
              <button onClick={() => navigate("/experiences")} className="block hover:opacity-70">Experiences</button>
              <button onClick={() => navigate("/decor")} className="block hover:opacity-70">Decor Collection</button>
              <button onClick={() => navigate("/activities")} className="block hover:opacity-70">Activities</button>
              <button onClick={() => navigate("/gifts")} className="block hover:opacity-70">Gifts</button>
              <button onClick={() => navigate("/catering")} className="block hover:opacity-70">Catering</button>
              <button onClick={() => navigate("/past-events")} className="block hover:opacity-70">Past Events</button>
              <button onClick={() => navigate("/about")} className="block hover:opacity-70">About</button>
              <button onClick={() => navigate("/package-builder")} className="block hover:opacity-70">Build My Experience</button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.22em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              MORE
            </div>
            <div className="mt-4 space-y-3 text-base" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
              <button onClick={() => navigate("/faq")} className="block hover:opacity-70">FAQ</button>
              <button onClick={() => navigate("/display-options")} className="block hover:opacity-70">Display Options</button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.22em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              STAY IN THE LOOP
            </div>
            <p className="mt-4 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              New experiences, seasonal ideas, and the occasional offer.
            </p>
            <NewsletterSignup palette={palette} fonts={fonts} />
          </div>
        </div>

        <div className="mt-12 pt-5 text-xs tracking-[0.12em]" style={{ ...fonts.bodyFont, color: palette.muted, borderTop: `1px solid ${palette.line}` }}>
          © {new Date().getFullYear()} A Slice of G Events
        </div>
      </div>
    </footer>
  );
}
