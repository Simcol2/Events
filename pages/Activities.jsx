import React from "react";
import SectionHeading from "../components/SectionHeading";
import ActivityCard from "../components/ActivityCard";

const ACTIVITIES = [
  {
    label: "The Price Is Right",
    tagline: "Think you know what babies cost?",
    subtitle: "How Well Do You Know Baby?",
    description: "From diapers and detergent to strollers and all the things Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points. Play individually or team up with friends.",
  },
  {
    label: "The Photo Challenge",
    tagline: "Capture the moments Mom will want to remember.",
    subtitle: "Capture Mom's Big Day",
    description: "Each guest receives a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the shower, Mom has a whole album of memories from the people who celebrated with her.",
  },
  {
    label: "The Maternity Shot Challenge",
    tagline: "Can you fake the bump?",
    subtitle: "Can You Fake the Bump?",
    description: "Grab a pillow. Strike a pose. Convince us you're expecting. Guests compete to create the most convincing, ridiculous, glamorous or downright questionable maternity photo. Scan. Upload. Display. The photos appear on the big screen for everyone to see.",
  },
  {
    label: "Baby Trivia",
    tagline: "How well do you really know Mom and Dad?",
    subtitle: "How Well Do You Really Know Mom and Dad?",
    description: "A custom round of baby trivia filled with questions about Mom, Dad, their relationship, their baby and the little details only their closest friends and family should know. Some questions will be easy. Some will absolutely expose you.",
  },
  {
    label: "Baby Naptime Relay",
    tagline: "Three stations. One sleepy baby.",
    subtitle: "Can You Get Baby to Sleep?",
    description: "Race through three stations: bottle chug, diaper change and sing the lullaby. Your lullaby is assigned to you. Sing it correctly to earn your points, finish the course as fast as possible, and prove that you have what it takes to survive bedtime. Fastest caregiver wins.",
    stations: ["Bottle Chug", "Diaper Change", "Sing the Lullaby"],
  },
  {
    label: "Guess the Arrival",
    tagline: "Everyone has a prediction. Only one can be right.",
    subtitle: "When Will Baby Make Their Grand Entrance?",
    description: "Guests enter their prediction for Baby's arrival date and time, guess Baby's name and leave a special private message for Mom. The experience continues after the shower with prediction updates, labour notifications and false alarms as the big day approaches.",
  },
];

export default function Activities({ navigate }) {
  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE FUN PART"
            title="Activities with a point of view."
            subtitle="Not filler games. These are designed to get people moving, laughing, taking pictures and actually talking to each other."
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">SHOWER ACTIVITIES</div>
          <div className="font-[Jost] text-[10px] tracking-[0.12em] text-[#A69C7E]">CUSTOMIZABLE FOR YOUR EVENT</div>
        </div>

        <div>
          {ACTIVITIES.map((activity, index) => (
            <ActivityCard
              key={activity.label}
              activity={activity}
              number={index + 1}
              featured={index === ACTIVITIES.length - 1}
            />
          ))}
        </div>

        <div className="mt-10 bg-[#4E5A44] px-7 py-10 text-center sm:px-12">
          <div className="font-[Parisienne] text-4xl text-[#D4BC91]">make it yours</div>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold text-[#FAF6ED]">Build your celebration.</h2>
          <p className="mx-auto mt-3 max-w-lg font-[Jost] text-sm leading-7 text-[#DAD7C9]">
            Choose the activities that fit your crowd and let the rest of the package do the work.
          </p>
          <button onClick={() => navigate("/reservations")} className="mt-6 border border-[#D4BC91] px-6 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white">
            VIEW PACKAGES
          </button>
        </div>
      </section>
    </div>
  );
}
