import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import pictureThisPhoto from "../media/picturethis.png";
import kindnessStationPhoto from "../media/file_00000000dcd4822fb648d37e9526b4b3.png";
import arrivalPhoto from "../media/web_arrival.png";

// Info page only - no shopping here, that's the separate Gifts page.
// Picture This and Kindness Station are the two core experiences (they
// also anchor the homepage and the Package Builder's pools), so they lead
// the list rather than being left out entirely.
const HERO_PHOTOS = [
  { src: pictureThisPhoto, alt: "Picture This guest activity", focus: "center" },
  { src: kindnessStationPhoto, alt: "Kindness Station guest activity", focus: "center" },
  { src: arrivalPhoto, alt: "Guess the Arrival guest activity", focus: "center" },
];

// Same two buckets and the same supporting copy as the Package Builder's
// Baby Shower flow (see eventConfig.js's babyShower.steps), so a visitor
// who reads this page and then builds their experience isn't met with an
// unfamiliar structure. Items are grouped by nature - games and
// competitions under Play & Connect, keepsake-making experiences under
// Create & Keep - even for the two (Maternity Shot Challenge, Guess the
// Arrival) that aren't part of the Package Builder's selectable pools.
const PLAY_CONNECT = [
  {
    label: "Hello World Kindness Station",
    tagline: "A little kindness can change someone's whole day.",
    subtitle: "Celebrate Baby By Being Kind",
    description: "Guests take a card, read a little reminder, and carry it out into the world in celebration of baby's arrival. Add an optional $5 gift card to any note for a pay it forward surprise.",
  },
  {
    label: "Guess the Arrival",
    tagline: "Everyone has a prediction. Only one can be right.",
    subtitle: "When Will Baby Make Their Grand Entrance?",
    description: "Guests enter their prediction for Baby's arrival date and time, guess Baby's name and leave a special private message for Mom. The experience continues after the shower with prediction updates, labour notifications and false alarms as the big day approaches.",
  },
  {
    label: "The Price Is Right",
    tagline: "Think you know what babies cost?",
    subtitle: "How Well Do You Know Baby?",
    description: "From diapers and detergent to strollers and all the things Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points. Play individually or team up with friends.",
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
    label: "The Maternity Shot Challenge",
    tagline: "Can you fake the bump?",
    subtitle: "Can You Fake the Bump?",
    description: "Grab a pillow. Strike a pose. Convince us you're expecting. Guests compete to create the most convincing, ridiculous, glamorous or downright questionable maternity photo. Scan. Upload. Display. The photos appear on the big screen for everyone to see.",
  },
];

const CREATE_KEEP = [
  {
    label: "Picture This",
    tagline: "The moments you wish you could bottle up.",
    subtitle: "Capture A Memory, Leave It Behind",
    description: "Guests capture a photo and leave a handwritten note about their favourite time or story with Mom and Dad, so baby can see what their parents were like when they grow up. Both go into the time capsule to discover someday.",
  },
  {
    label: "The Photo Challenge",
    tagline: "Capture the moments Mom will want to remember.",
    subtitle: "Capture Mom's Big Day",
    description: "Each guest receives a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the shower, Mom has a whole album of memories from the people who celebrated with her.",
  },
];

function ActivityRow({ activity, number, featured = false }) {
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
          <h3 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-none text-[#4E5A44]">
            {activity.label}
          </h3>
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

export default function Activities({ navigate }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_PHOTOS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[520px] sm:w-2/3">
            {HERO_PHOTOS.map((photo, i) => (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === heroIndex ? 1 : 0, objectPosition: photo.focus }}
              />
            ))}
          </div>
          <div className="flex w-full flex-col justify-center px-5 py-10 sm:w-1/3 sm:px-8">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em] text-[#B8935A]">ACTIVITIES</p>
            <h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold leading-[1.05] text-[#4E5A44] sm:text-[42px]">
              Games they'll play. Memories they'll keep.
            </h1>
            <p className="mt-3 font-[Jost] text-sm leading-6 text-[#8C846F]">
              Interactive activities that get every guest laughing, talking, and helping create something they'll keep. Choose the
              ones that fit your crowd when you build your experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">SHOWER ACTIVITIES</div>
          <div className="font-[Jost] text-[10px] tracking-[0.12em] text-[#A69C7E]">CUSTOMIZABLE FOR YOUR EVENT</div>
        </div>

        <div className="mb-2">
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">Play & Connect</h2>
          <p className="mt-2 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
            Experiences that get your guests talking, laughing, competing, and connecting.
          </p>
        </div>
        <div>
          {PLAY_CONNECT.map((activity, index) => (
            <ActivityRow key={activity.label} activity={activity} number={index + 1} />
          ))}
        </div>

        <div className="mb-2 mt-16">
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">Create & Keep</h2>
          <p className="mt-2 max-w-2xl font-[Jost] text-sm leading-6 text-[#8C846F]">
            Experiences where your guests create something meaningful for you to keep.
          </p>
        </div>
        <div>
          {CREATE_KEEP.map((activity, index) => (
            <ActivityRow
              key={activity.label}
              activity={activity}
              number={index + 1}
              featured={index === CREATE_KEEP.length - 1}
            />
          ))}
        </div>

        <div className="mt-10 bg-[#4E5A44] px-7 py-10 text-center sm:px-12">
          <div className="font-[Parisienne] text-4xl text-[#D4BC91]">make it yours</div>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-semibold text-[#FAF6ED]">Build your celebration.</h2>
          <p className="mx-auto mt-3 max-w-lg font-[Jost] text-sm leading-7 text-[#DAD7C9]">
            Choose the activities that fit your crowd and let the rest of the experience do the work.
          </p>
          <button onClick={() => navigate("/package-builder")} className="mt-6 border border-[#D4BC91] px-6 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white">
            BUILD MY EXPERIENCE
          </button>
        </div>
      </section>
    </div>
  );
}
