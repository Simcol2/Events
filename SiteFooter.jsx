import React from "react";

export default function SiteFooter({ navigate }) {
  return (
    <footer className="mt-24 border-t border-[#E4DCC8] bg-[#F3EEE2]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_.7fr_.7fr]">
          <div>
            <div className="font-[Jost] text-[9px] font-semibold tracking-[0.4em] text-[#B8935A]">A SLICE OF G</div>
            <div className="mt-1 font-['Cormorant_Garamond'] text-4xl font-semibold text-[#4E5A44]">EVENTS</div>
            <p className="mt-4 max-w-md font-[Jost] text-sm leading-7 text-[#716B5C]">
              Thoughtfully curated pieces, playful activities and beautifully designed details for celebrations worth remembering.
            </p>
          </div>

          <div>
            <div className="font-[Jost] text-[10px] font-semibold tracking-[0.22em] text-[#B8935A]">EXPLORE</div>
            <div className="mt-4 space-y-3 font-[Jost] text-sm text-[#4E5A44]">
              <button onClick={() => navigate("/decor")} className="block hover:text-[#B8935A]">Decor Collection</button>
              <button onClick={() => navigate("/activities")} className="block hover:text-[#B8935A]">Activities</button>
              <button onClick={() => navigate("/reservations")} className="block hover:text-[#B8935A]">Reservations</button>
            </div>
          </div>

          <div>
            <div className="font-[Jost] text-[10px] font-semibold tracking-[0.22em] text-[#B8935A]">THE IDEA</div>
            <p className="mt-4 font-[Jost] text-sm leading-7 text-[#716B5C]">
              You bring the people. We help create the vibe.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[#DCD2BC] pt-5 font-[Jost] text-[10px] tracking-[0.12em] text-[#918873]">
          © {new Date().getFullYear()} A Slice of G Events
        </div>
      </div>
    </footer>
  );
}
