import React from "react";
import { Sparkles, Leaf } from "lucide-react";

const ACTIVITIES = [
  {
    label: "The Price Is Right",
    tagline: "Think you know what babies cost?",
    subtitle: "How Well Do You Know Baby?",
    description:
      "Think you know what babies cost? Think again. From diapers and detergent to strollers and all the things Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points. Play individually or team up with friends.",
  },
  {
    label: "The Photo Challenge",
    tagline: "Capture the moments Mom will want to remember.",
    subtitle: "Capture Mom's Big Day",
    description:
      "Each guest receives a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the shower, Mom has a whole album of memories from the people who celebrated with her.",
  },
  {
    label: "The Maternity Shot Challenge",
    tagline: "Can you fake the bump?",
    subtitle: "Can You Fake the Bump?",
    description:
      "Grab a pillow. Strike a pose. Convince us you're expecting. Guests compete to create the most convincing, ridiculous, glamorous, or questionable maternity photo. Scan. Upload. Display. The photos appear on the big screen for everyone to see.",
  },
  {
    label: "Baby Trivia",
    tagline: "How well do you really know Mom and Dad?",
    subtitle: "How Well Do You Really Know Mom and Dad?",
    description:
      "Put your knowledge to the test with custom baby trivia filled with questions about Mom, Dad, their relationship, their baby, and the little details only their closest friends and family should know.",
  },
  {
    label: "Baby Naptime Relay",
    tagline: "Three stations. One sleepy baby.",
    subtitle: "Can You Get Baby to Sleep?",
    description:
      "You've got one baby. Three challenges. One mission: get that baby to sleep. Race through bottle chug, diaper change, and sing the lullaby. Finish the course as fast as possible and prove you have what it takes to survive bedtime.",
    stations: ["Bottle Chug", "Diaper Change", "Sing the Lullaby"],
  },
];

const GUESS_THE_ARRIVAL = {
  label: "Guess the Arrival",
  tagline: "Everyone has a prediction. Only one can be right.",
  subtitle: "When Will Baby Make Their Grand Entrance?",
  description:
    "Guests can predict Baby's arrival date and time, guess the baby's name, and leave a private message for Mom. Guests can opt into email notifications when predictions come true, while Mom can send labour and false-labour updates as the big day approaches.",
};

const CREAM = "#FAF6ED";
const SAGE_DEEP = "#4E5A44";
const SAGE = "#6B7A5E";
const GOLD = "#B8935A";
const INK = "#3A342A";
const LINE = "#E4DCC8";
const MUTED = "#A69C7E";

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-5">
      <span className="h-px w-12" style={{ background: GOLD }} />
      <Leaf size={14} color={GOLD} />
      <span className="h-px w-12" style={{ background: GOLD }} />
    </div>
  );
}

function ActivityCard({ activity }) {
  return (
    <article className="bg-white border rounded-sm p-6 sm:p-8" style={{ borderColor: LINE }}>
      <p className="text-[11px] tracking-[0.22em] font-medium mb-2" style={{ color: GOLD }}>
        {activity.tagline.toUpperCase()}
      </p>
      <h2 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: SAGE_DEEP }}>
        {activity.label}
      </h2>
      <p className="text-sm italic mt-1 mb-4" style={{ color: "#8A8268" }}>
        {activity.subtitle}
      </p>
      <p className="text-sm leading-7" style={{ color: "#5C5645" }}>
        {activity.description}
      </p>
      {activity.stations && (
        <div className="flex flex-wrap gap-2 mt-5">
          {activity.stations.map((station) => (
            <span key={station} className="px-3 py-1.5 rounded-full text-xs" style={{ background: "#F1F4EC", color: SAGE_DEEP }}>
              {station}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs tracking-[0.35em] font-medium" style={{ color: GOLD }}>THE</p>
          <h1 className="text-5xl sm:text-6xl font-semibold -mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: SAGE_DEEP }}>
            Shower Activities
          </h1>
          <Divider />
          <p className="text-2xl" style={{ fontFamily: "'Parisienne', cursive" }}>
            Choose your fun.
          </p>
          <p className="mt-5 text-sm leading-6" style={{ color: MUTED }}>
            Thoughtfully designed games and experiences that give guests something to do
            and Mom something worth remembering.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-5">
          {ACTIVITIES.map((activity) => (
            <ActivityCard key={activity.label} activity={activity} />
          ))}
        </section>

        <section className="mt-6 rounded-sm p-6 sm:p-8" style={{ background: "#F1F4EC", border: `1.5px solid ${SAGE}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} color={SAGE} />
            <span className="text-[11px] tracking-[0.2em] font-semibold" style={{ color: SAGE }}>
              INCLUDED WITH EVERY PACKAGE
            </span>
          </div>
          <ActivityCard activity={GUESS_THE_ARRIVAL} />
        </section>
      </div>
    </main>
  );
}
