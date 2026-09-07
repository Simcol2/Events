import {
  Sparkles,
  Camera,
  Mail,
  Leaf,
  Brain,
  Music,
  Hand,
  Heart,
  BookOpen,
  Puzzle,
  Images,
  Mic,
  Smartphone,
  PartyPopper,
  Sprout,
  Frame,
  LampCeiling,
  Tag,
  Aperture,
  Moon,
  Gift,
  Lightbulb,
  Flower2,
  LayoutGrid,
} from "lucide-react";
import pictureThisPhoto from "./media/picturethis.png";
import ohBabyCenterPhoto from "./media/ohbabycenter.png";
import babyTriviaPhoto from "./media/babytrivia.png";
import kindnessStationPhoto from "./media/file_00000000dcd4822fb648d37e9526b4b3.png";
import complimentBoxPhoto from "./media/kindness-station-compliment-box.jpg";
import wallPuzzleShowerPhoto from "./media/wallpuzzle-babyshower.png";
import wallPuzzleShowerFramedPhoto from "./media/wallpuzzle-babyshower-framed.png";
import nurseryRhymeKeepsakePhoto from "./media/nurseryrhyme-keepsake.png";
import grownFolksLootBagPhoto from "./media/grownfolkslootbag.png";
import grownFolksLootBagPhoto2 from "./media/grownfolkslootbag-2.png";
import wallPuzzleEngagementPhoto from "./media/file_00000000a204822f9ab953201c8b7043.png";
import ohBabyBlocksPhoto from "./media/oh-baby-blocks-tablescape.png";
import ohBabyTrayPhoto from "./media/oh-sweet-baby-tray.png";
import centerpieceThanksgivingPhoto from "./media/centerpiece-thanksgiving.png";
import centerpieceChristmasPhoto from "./media/centerpiece-christmas.png";
import centerpieceSpecialMomentPhoto from "./media/centerpiece-special-moment.png";
import timeCapsulePhoto from "./media/timecapsul.png";
import photoWallPhoto from "./media/featurewall.png";
import lilRootsPhoto from "./media/lilroots.png";
import arrivalPhoto from "./media/web_arrival.png";
import nurseryRhymePhoto from "./media/poem.png";
import welcomeSignPhoto from "./media/welcomesign.png";
import readyToPopPhoto from "./media/readytopop.png";
import readyToPopPhoto2 from "./media/readytopop-2.jpg";
import babyNaptimeRelayPhoto1 from "./media/babynaptimerelay-1.png";
import babyNaptimeRelayPhoto2 from "./media/babynaptimerelay-2.jpg";
import photoChallengeMomPhoto1 from "./media/photochallenge-mom-1.jpg";
import photoChallengeMomPhoto2 from "./media/photochallenge-mom-2.png";
import photoChallengePillowBumpPhoto from "./media/photochallenge-pillowbump.png";

// Per-event pricing/pool/guest-gift/builder-step configuration now lives in
// eventConfig.js (the "one experience, priced and shaped per event type"
// architecture) - see EVENT_CONFIGS there for starting prices.
export const DEFAULT_GUEST_COUNT = 30;

// Every experience item can read differently depending on what's being
// celebrated. `copy.default` is the fallback used for any event type
// without its own entry; `photos.default` is likewise the fallback image.
// Photos are `null` until real event-specific photography is added -
// PhotoSlot already renders a "Photo coming soon" placeholder for those.
export const MAIN_PACKAGE_ITEMS = [
  {
    id: "pictureThis",
    icon: Camera,
    copy: {
      default: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about a favourite memory, moment, or story from the celebration. Both go into the time capsule to look back on someday.",
      },
      babyShower: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about their favourite time or story with Mom and Dad, so baby can see what their parents were like when they grow up. Both go into the time capsule to discover someday.",
      },
      engagement: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about a favourite memory or moment with the couple. Both go into the time capsule to discover someday.",
      },
      birthday: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about their favourite story about the guest of honor. Both go into the time capsule to keep.",
      },
      holiday: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about a favourite holiday memory of the person you're celebrating. Both go into the time capsule to open again next season.",
      },
      specialMoment: {
        name: "Picture This",
        tagline: "The moments you wish you could bottle up.",
        description:
          "Guests capture a photo and leave a handwritten note about a favourite memory of this moment. Both go into the time capsule to keep.",
      },
    },
    photos: {
      default: pictureThisPhoto,
      babyShower: pictureThisPhoto,
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      stats: { bestFor: "Photo-loving groups", length: "1-3 minutes per guest", guests: "Individual guests or groups", createsKeepsake: "Yes", energy: 4 },
      whatItIs: "An interactive photo-and-message station that gives guests a fun way to participate while creating something personal for the family.",
      howItWorks: [
        "Guests take a photo at the station.",
        "They add a handwritten message, note, or memory.",
        "Both get clipped to the display wall.",
        "The experience can stand completely on its own, the finished photos and messages don't have to go into a Time Capsule.",
      ],
      whatsIncluded: ["Styled photo station", "Photo capture setup", "Message cards/materials", "Display/signage", "Collection materials"],
      whatGuestsDo: "Take a photo and leave a handwritten message.",
      whatTheFamilyKeeps: "The photos and messages created by their guests.",
      personalization: ["Baby's name", "Event colours", "Custom prompts", "Custom signage", "Photo layout/design"],
      spaceRequired: "Small-to-medium station area.",
      approximateDuration: "1-3 minutes per guest.",
      optionalAddOns: ["Time Capsule", "Voice Memories", "Custom keepsake album", "Additional photo prints"],
    },
  },
  {
    id: "kindnessStation",
    icon: Heart,
    copy: {
      default: {
        name: "Kindness Station",
        tagline: "Give a little kindness. Leave a little behind.",
        description:
          "Two ways to make someone's day. Guests take a kindness card and pass a little encouragement along to a stranger, then write down something wonderful they have always meant to say about the guest of honour, seal it, and drop it into A Box of Compliments. Add an optional $5 gift card to any kindness card for a pay it forward surprise.",
      },
      babyShower: {
        name: "Hello World Kindness Station",
        tagline: "Give a little kindness. Leave a little behind.",
        description:
          "Two ways to make someone's day. Guests take a kindness card out into the world in celebration of baby's arrival, then write the compliment they have always meant to give Mom, seal it, and add it to A Box of Compliments she takes home. Add an optional $5 gift card to any kindness card for a pay it forward surprise.",
      },
      engagement: {
        name: "Kindness Station",
        tagline: "Give a little kindness. Leave a little behind.",
        description:
          "Two ways to make someone's day. Guests carry an act of kindness into the world in honour of the couple, then write the thing they have always meant to say about them, seal it, and add it to A Box of Compliments the couple keeps. Add an optional $5 gift card to any kindness card for a pay it forward surprise.",
      },
      birthday: {
        name: "Kindness Station",
        tagline: "Give a little kindness. Leave a little behind.",
        description:
          "Two ways to make someone's day. Guests take a kindness card out into the world, then write the compliment they have always meant to give the birthday guest of honour, seal it, and add it to A Box of Compliments they take home. Add an optional $5 gift card for a pay it forward surprise.",
      },
      holiday: {
        name: "Season of Kindness Station",
        tagline: "Spread a little extra this season.",
        description:
          "Two ways to make someone's day. Guests carry the spirit of the season to someone outside the room, then write down something they appreciate about the host but rarely say out loud, seal it, and add it to A Box of Compliments. Add an optional $5 gift card for a pay it forward surprise.",
      },
      specialMoment: {
        name: "Kindness Station",
        tagline: "Give a little kindness. Leave a little behind.",
        description:
          "Two ways to make someone's day. Guests take a kindness card out into the world, then write the thing they have always meant to say about the person being celebrated, seal it, and add it to A Box of Compliments they keep. Add an optional $5 gift card for a pay it forward surprise.",
      },
    },
    photos: {
      default: [kindnessStationPhoto, complimentBoxPhoto],
      babyShower: [kindnessStationPhoto, complimentBoxPhoto],
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      stats: { bestFor: "Meaningful, family-focused celebrations", length: "10-20 minutes", guests: "Individual guests", createsKeepsake: "Yes", energy: 2 },
      whatItIs:
        "Kindness Station gives guests two ways to make someone's day. First they choose a kindness card and pass a little encouragement along to someone else. Then comes A Box of Compliments, where guests write down the wonderful thing about the guest of honour they have always meant to say but never quite had the chance to.",
      howItWorks: [
        "Guests choose a kindness card and carry that small act of encouragement out into the world.",
        "An optional $5 gift card can be added to any kindness card for a pay it forward surprise.",
        "At A Box of Compliments, guests think of something genuinely wonderful about the guest of honour. Something they have admired from afar, something that meant more than the person realized, or something they appreciate but rarely say out loud.",
        "They write it down, seal it, and place it in the box.",
        "A compliment, unsaid, finally delivered.",
      ],
      whatsIncluded: [
        "Styled kindness station",
        "Kindness cards",
        "Compliment cards and sealing envelopes",
        "A Box of Compliments",
        "Writing materials",
        "Display and signage",
      ],
      whatGuestsDo:
        "Pass a little kindness on to a stranger, then finally say the thing they have always meant to say about the person being celebrated.",
      whatTheFamilyKeeps:
        "The Box of Compliments goes home sealed, to be opened on a rainy day, a hard week, or simply whenever they need a reminder of how loved and appreciated they are. It is a box full of things worth remembering.",
      personalization: [
        "Guest of honour's name",
        "Custom compliment prompts",
        "Custom kindness cards",
        "Event colours",
        "Custom signage",
        "Keepsake box finish",
      ],
      spaceRequired: "Small tabletop or dedicated station.",
      approximateDuration: "Guests can take part in 2-5 minutes each.",
      optionalAddOns: ["$5 pay it forward gift cards", "Upgraded keepsake box", "Additional prompts", "Coordinating display"],
    },
  },
  {
    id: "storybook",
    icon: BookOpen,
    copy: {
      default: {
        name: "Their Story Book",
        tagline: "Every guest becomes part of the story.",
        description:
          "Each guest contributes a page (a memory, a wish, a little drawing) to a keepsake storybook that becomes part of the story you're celebrating.",
      },
      babyShower: {
        name: "First Story Book",
        tagline: "Baby's first story, written by everyone who loves them.",
        description:
          "Guests help create a one-of-a-kind illustrated story for baby by adding words, ideas, wishes, characters, memories, and little pieces of their imagination.",
      },
      engagement: {
        name: "Our Story Book",
        tagline: "A love story written by everyone who knows them.",
        description:
          "Guests contribute words, memories, wishes, and pieces of the couple's journey to create an illustrated keepsake.",
      },
      birthday: {
        name: "Their Story So Far",
        tagline: "A page from everyone who came to celebrate.",
        description:
          "Every guest adds a page to a keepsake storybook (a memory, a wish, or a little note), building something to keep long after the party ends.",
      },
      holiday: {
        name: "Our Holiday Story",
        tagline: "A page for every guest, a story for every year.",
        description:
          "Every guest adds a page about this year's celebration (a memory, a wish, a little tradition), building a storybook you can add to each season.",
      },
      specialMoment: {
        name: "Our Story Together",
        tagline: "A page from everyone who was there.",
        description:
          "Every guest contributes a page (a memory, a wish, a little drawing) to a keepsake storybook built entirely around this moment.",
      },
    },
    photos: {
      default: null,
      babyShower: null,
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      stats: { bestFor: "Sentimental celebrations", length: "2-5 minutes per guest", guests: "Individual guests", createsKeepsake: "Yes", energy: 2 },
      whatItIs: "A collaborative guest book experience where family and friends contribute words, wishes, and pieces of a story for baby.",
      howItWorks: [
        "Guests are handed a blank page from the book.",
        "They respond to a prompt and fill it with a memory, a wish, or a doodle.",
        "Pages get collected and bound into one storybook.",
        "You keep the finished book after the event.",
      ],
      whatsIncluded: ["Story book", "Guest contribution pages", "Writing materials", "Styled display", "Instructions/signage"],
      whatGuestsDo: "Write a message, memory, wish, or piece of advice for baby.",
      whatTheFamilyKeeps: "A completed guest-created story book filled with personal messages.",
      personalization: ["Baby's name", "Custom cover", "Custom prompts", "Event colours", "Family-specific questions"],
      spaceRequired: "Small tabletop or seating area.",
      approximateDuration: "2-5 minutes per guest.",
      optionalAddOns: ["Custom book cover", "Additional pages", "Premium keepsake box"],
    },
  },
  {
    id: "babyTrivia",
    icon: Brain,
    copy: {
      default: {
        name: "Know Them Best",
        tagline: "Think you know them best? Let's see.",
        description:
          "A custom trivia experience about the person or people you're celebrating. Guests answer questions, compare guesses, and compete to see who really knows them best.",
      },
      babyShower: {
        name: "Baby Trivia Card Pack",
        tagline: "Think you know baby? Let's see.",
        description:
          "A playful collection of baby and parent trivia for guests to test their knowledge. Add up to 15 custom questions all about Mom and Dad.",
      },
      birthday: {
        name: "Birthday Trivia Card Pack",
        tagline: "How well do you really know them?",
        description:
          "A playful round of trivia about the guest of honor, with up to 15 custom questions to keep guests guessing.",
      },
      holiday: {
        name: "Holiday Trivia Card Pack",
        tagline: "Test your holiday know-how.",
        description:
          "A playful round of holiday trivia, with up to 15 custom questions about your family's own traditions and favourite moments.",
      },
      specialMoment: {
        name: "Trivia Card Pack",
        tagline: "How well do you really know them?",
        description:
          "A playful round of trivia, with up to 15 custom questions built entirely around the people you're celebrating.",
      },
    },
    photos: {
      default: babyTriviaPhoto,
      babyShower: babyTriviaPhoto,
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      stats: { bestFor: "Mixed groups", length: "10-15 minutes", guests: "Individual or table groups", createsKeepsake: "No", energy: 3 },
      whatItIs: "A ready-to-play baby trivia game featuring fun questions about pregnancy, babies, and parenthood.",
      howItWorks: [
        "Send us up to 15 questions about the guest of honor.",
        "We turn them into a printed card pack.",
        "Guests answer individually or in teams.",
        "Answers are revealed and the guest or team with the most correct answers wins.",
      ],
      whatsIncluded: ["Baby trivia cards", "Answer key", "Game instructions", "Display/setup materials"],
      whatGuestsDo: "Answer questions, compare answers, and compete to see who knows the most about babies.",
      whatTheFamilyKeeps: "The game itself is primarily an activity rather than a keepsake.",
      personalization: ["Baby's name", "Parents' names", "Shower colours", "Custom questions"],
      spaceRequired: "Small tabletop or designated game area.",
      approximateDuration: "10-15 minutes.",
      optionalAddOns: ["Custom trivia questions", "Coordinating prize", "Additional games"],
    },
  },
  {
    id: "wallPuzzle",
    icon: Puzzle,
    copy: {
      default: {
        name: "Custom Wall Puzzle",
        tagline: "Help us put it together.",
        description:
          "A giant portrait puzzle guests gradually assemble throughout the celebration, piece by piece, together. A smaller framed print of the finished piece becomes your keepsake, and you're welcome to keep the full-size assembled puzzle too.",
      },
      babyShower: {
        name: "Put Baby Together",
        tagline: "Everyone adds a piece. Together, you create baby.",
        description:
          "A giant portrait of baby becomes an interactive puzzle that guests work together to complete throughout the shower. A smaller framed print of the finished piece becomes baby's keepsake for the nursery, and you're welcome to keep the full-size assembled puzzle too.",
      },
      engagement: {
        name: "Custom Wall Puzzle",
        tagline: "Everyone adds a piece. Together, you create the picture.",
        description:
          "A meaningful photo becomes an interactive puzzle that guests assemble throughout the celebration. A smaller framed print of the finished piece becomes wall art for the home, and you're welcome to keep the full-size assembled puzzle too.",
      },
      birthday: {
        name: "Custom Wall Puzzle",
        tagline: "Help us put it together.",
        description:
          "A giant portrait puzzle guests gradually assemble throughout the party. A smaller framed print of the finished piece becomes a keepsake built by everyone who came, and you're welcome to keep the full-size assembled puzzle too.",
      },
      holiday: {
        name: "Custom Wall Puzzle",
        tagline: "A picture worth piecing together.",
        description:
          "A giant seasonal or family portrait puzzle guests gradually assemble throughout the celebration. A smaller framed print of the finished piece becomes your keepsake, and you're welcome to keep the full-size assembled puzzle too.",
      },
      specialMoment: {
        name: "Put Together",
        tagline: "Your love. Your people. One beautiful picture.",
        description:
          "A giant portrait puzzle of the two of you, guests gradually assemble it throughout the celebration. A smaller framed print of the finished piece becomes a keepsake made by the people who celebrate your love, and you're welcome to keep the full-size assembled puzzle too.",
      },
    },
    photos: {
      // babyShower gets its own photo since a shower puzzle uses an
      // illustrated/rendered baby portrait rather than a real one (there's
      // no baby to photograph yet).
      default: null,
      babyShower: [wallPuzzleShowerPhoto, wallPuzzleShowerFramedPhoto],
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: wallPuzzleEngagementPhoto,
    },
    details: {
      stats: { bestFor: "Creative groups", length: "10-30 minutes", guests: "Individuals or small groups", createsKeepsake: "Yes", energy: 3 },
      whatItIs: "A collaborative art activity where guests contribute pieces that come together to create one finished artwork for the family.",
      howItWorks: [
        "We turn your photo into a large format puzzle.",
        "It's set out at the start of the event.",
        "Guests decorate, create, or contribute individual pieces.",
        "Once assembled, the pieces become one completed artwork the family keeps.",
      ],
      whatsIncluded: ["Art materials", "Individual guest pieces", "Assembly/display materials", "Instructions", "A smaller framed print of the finished piece", "Finished display setup"],
      whatGuestsDo: "Create their individual contribution and add it to the larger piece.",
      whatTheFamilyKeeps: "A smaller framed print of the finished piece, made to keep. The full-size assembled puzzle is yours to keep too, if you'd like it.",
      personalization: ["Baby's name", "Colours", "Theme", "Custom artwork concept", "Custom wording"],
      spaceRequired: "Medium tabletop/work area.",
      approximateDuration: "10-30 minutes depending on group size.",
      optionalAddOns: ["Premium framing", "Custom artwork", "Additional embellishments"],
    },
  },
  {
    id: "timeCapsule",
    icon: Mail,
    copy: {
      default: {
        name: "Time Capsule",
        tagline: "Your guests fill it today. Your family opens it someday.",
        description:
          "Guests leave messages, wishes, predictions, memories, and photographs for the future, along with everything from Picture This, ready to open again years later.",
      },
      babyShower: {
        name: "Time Capsule",
        tagline: "Your guests fill it today. Your family opens it someday.",
        description:
          "Every photo and note from Picture This gets sealed inside, along with guest wishes and predictions: stories about Mom and Dad from the people who celebrated baby before they ever knew them, saved for the future.",
      },
      engagement: {
        name: "Time Capsule",
        tagline: "Your guests fill it today. You open it someday.",
        description:
          "Guests leave messages, wishes, predictions, and memories for the couple to open on an anniversary or future milestone.",
      },
      birthday: {
        name: "Time Capsule",
        tagline: "Your guests fill it today. You open it someday.",
        description:
          "Every photo and note from Picture This gets sealed inside, ready to open again on a birthday down the road.",
      },
      holiday: {
        name: "Time Capsule",
        tagline: "A moment from this year, saved for next.",
        description:
          "Every photo and note from Picture This gets sealed inside, ready to open again next holiday season.",
      },
      specialMoment: {
        name: "Time Capsule",
        tagline: "Your guests fill it today. You open it someday.",
        description:
          "Every photo and note from Picture This gets sealed inside, ready to open again in the future.",
      },
    },
    photos: {
      default: timeCapsulePhoto,
      babyShower: timeCapsulePhoto,
      engagement: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      stats: { bestFor: "Sentimental hosts", length: "Throughout event", guests: "Everyone", createsKeepsake: "Yes", energy: 2 },
      whatItIs: "A curated keepsake experience where guests contribute photos, messages, wishes, predictions, and memories to be sealed away and opened at a chosen future date.",
      howItWorks: [
        "Photos, notes, wishes, and predictions go in throughout the event.",
        "Guests contribute pieces throughout the celebration.",
        "The completed collection is sealed at the end of the celebration.",
        "You choose when it gets opened again.",
      ],
      whatsIncluded: ["Time Capsule container", "Guest contribution materials", "Prompt cards", "Collection/display setup", "Sealing materials"],
      whatGuestsDo: "Leave a message, memory, photo, prediction, or wish for the future.",
      whatTheFamilyKeeps: "The complete time capsule and everything placed inside it.",
      personalization: ["Baby's name", "Future opening date", "Custom prompts", "Custom cards", "Custom container/signage", "Event colours"],
      spaceRequired: "Small tabletop or display area.",
      approximateDuration: "Available throughout the event.",
      optionalAddOns: ["Picture This", "Voice Memories", "Premium keepsake box", "Additional prompt sets"],
    },
  },
];

// The Customizable Serving Dish lives outside the experience pools entirely
// (it's decor, not an interactive experience) - surfaced as its own card in
// the Package Builder's Make It Yours step, priced live from the Supabase
// decor catalog (see CENTERPIECE_LARGE_CATALOG_NAME / resolveSetupItem's
// centerpieceLarge branch), not from this copy object.
export const CUSTOM_SERVING_DISH = {
  id: "centerpieceLarge",
  icon: Leaf,
  name: "Custom Serving Dish",
  tagline: "A beautiful piece for the table, made just for the celebration.",
  description:
    "A custom display featuring photos from your celebration, with space to serve your favourite treats at the centre of it all.",
  photos: {
    default: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
    babyShower: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
    holiday: [centerpieceThanksgivingPhoto, centerpieceChristmasPhoto],
    specialMoment: [centerpieceSpecialMomentPhoto],
  },
  details: {
    summary: "A custom serving dish built around real photos. Doubles as your dessert table's main feature.",
    howItWorks: [
      "Send us the photos you want featured.",
      "We design the piece around them.",
      "It arrives ready to set up on your table.",
      "Serve treats right alongside it.",
    ],
    goodToKnow: [
      "Photos are due at least 2 weeks before your event.",
      "Design changes with the season and occasion.",
    ],
  },
};

// Resolves one package item's copy + photo(s) for the active event type,
// falling back to `default` for anything without an explicit override. A
// photo entry can be a single image or an array of images; either way this
// always returns a normalized `photoUrls` array (empty when there's no
// photo yet), which PhotoSlot turns into a crossfading slideshow when it
// has more than one image.
export function resolvePackageItem(item, eventTypeId) {
  const copy = item.copy[eventTypeId] || item.copy.default;
  const raw = item.photos[eventTypeId] ?? item.photos.default ?? null;
  const photoUrls = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean);
  return { id: item.id, icon: item.icon, photoUrls, details: item.details, ...copy };
}

// Setup items that don't already exist as one of the MAIN_PACKAGE_ITEMS
// (those stay Home.jsx's homepage preview, unchanged) or as an ADDONS entry.
// Same copy/photos shape as MAIN_PACKAGE_ITEMS so resolvePackageItem() works
// the same way for these. `default` copy is the event-neutral version used
// for the Play & Connect pool (Baby Shower) and the "Want Something
// Playful?" add-on step (every other event type); `babyShower` overrides it
// with the baby-specific version where the two differ.
export const SETUP_ONLY_ITEMS = [
  {
    id: "babyNaptimeRelay",
    icon: Moon,
    copy: {
      default: {
        name: "The Challenge Course",
        tagline: "Three stations. One challenge.",
        description:
          "Guests race through three themed stations, competing solo or in teams to finish the course the fastest.",
      },
      babyShower: {
        name: "Baby Naptime Relay",
        tagline: "Three stations. One sleepy baby.",
        description:
          "Race through three stations: bottle chug, diaper change, and sing the lullaby. Your lullaby is assigned to you. Sing it correctly to earn your points, finish the course as fast as possible, and prove you have what it takes to survive bedtime. Fastest caregiver wins.",
      },
    },
    photos: { default: null, babyShower: [babyNaptimeRelayPhoto1, babyNaptimeRelayPhoto2] },
    details: {
      stats: { bestFor: "High-energy groups", length: "15-20 minutes", guests: "Teams", createsKeepsake: "No", energy: 5 },
      whatItIs: "A fast-paced relay designed to get guests laughing, competing, and fully involved.",
      howItWorks: [
        "Guests divide into teams.",
        "They race through bottle chug, diaper change, and lullaby stations.",
        "Each stage has to be completed correctly to score.",
        "The fastest team wins.",
      ],
      whatsIncluded: ["Relay challenge materials", "Baby-themed props", "Instructions", "Scorekeeping materials"],
      whatGuestsDo: "Race, complete challenges, cheer for their teams, and try not to completely lose it along the way.",
      whatTheFamilyKeeps: "No permanent keepsake; the value is in the experience and memories created during the celebration.",
      personalization: ["Baby's name", "Team names", "Custom challenge cards", "Shower colours"],
      spaceRequired: "Medium-to-large open area.",
      approximateDuration: "15-20 minutes.",
      optionalAddOns: ["Custom challenges", "Winner's prize", "Additional relay rounds"],
    },
  },
  {
    id: "priceIsRight",
    icon: Tag,
    copy: {
      default: {
        name: "The Price Is Right",
        tagline: "Think you know what it costs?",
        description:
          "Guests guess prices, rack up points, and compete to see who has the sharpest eye for a deal.",
      },
      babyShower: {
        name: "The Price Is Right",
        tagline: "Think you know what babies cost?",
        description:
          "From diapers and detergent to strollers and everything Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points, play solo or team up with friends.",
      },
    },
    photos: { default: null },
    details: {
      stats: { bestFor: "Competitive groups", length: "15-20 minutes", guests: "Individuals or teams", createsKeepsake: "No", energy: 4 },
      whatItIs: "A baby-themed guessing game inspired by the classic price-guessing format.",
      howItWorks: [
        "Guests see a list of real items tied to the celebration.",
        "They guess the retail price of different baby products.",
        "Closest without going over wins.",
        "Play individually or in teams.",
      ],
      whatsIncluded: ["Game cards", "Baby product prompts", "Answer sheets", "Instructions", "Scorekeeping materials"],
      whatGuestsDo: "Look at baby products, make their best price guesses, and compete for the highest score.",
      whatTheFamilyKeeps: "The game is designed as an interactive experience rather than a physical keepsake.",
      personalization: ["Custom baby-related items", "Baby's name", "Shower colours", "Custom questions"],
      spaceRequired: "Small-to-medium game area.",
      approximateDuration: "15-20 minutes.",
      optionalAddOns: ["Custom prize", "Additional rounds", "Personalized game cards"],
    },
  },
  {
    id: "photoChallenge",
    icon: Aperture,
    copy: {
      default: {
        name: "The Photo Challenge",
        tagline: "Capture the moments they'll want to remember.",
        description:
          "Each guest gets a secret photo challenge with one goal: capture a picture that fits the assignment. Scan the QR code and add it to the shared album. By the end of the celebration, you have a whole album of memories from the people who came to celebrate.",
      },
      babyShower: {
        name: "The Photo Challenge",
        tagline: "Capture the moments Mom will want to remember.",
        description:
          "Each guest gets a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the celebration, Mom has a whole album of memories from the people who came to celebrate her.",
      },
      engagement: {
        name: "The Photo Challenge",
        tagline: "Capture the moments they'll want to remember.",
        description:
          "Each guest receives a secret photo challenge focused on the couple. Scan the QR code and add it to the shared album. By the end of the celebration, the couple has an album seen through the eyes of the people who love them.",
      },
    },
    photos: { default: null, babyShower: [photoChallengeMomPhoto1, photoChallengeMomPhoto2, photoChallengePillowBumpPhoto] },
    details: {
      stats: { bestFor: "Social, playful groups", length: "Throughout the event", guests: "Everyone", createsKeepsake: "Yes", energy: 4 },
      whatItIs: "A collection of photo challenges that encourage guests to capture funny, sweet, and unexpected moments throughout the celebration.",
      howItWorks: [
        "Each guest receives a hidden photo challenge.",
        "They find their moment and snap the photo.",
        "They scan a QR code to upload it.",
        "Every photo lands in one shared album by the end.",
      ],
      whatsIncluded: ["Photo challenge prompts", "Guest instructions", "Display/signage", "Challenge materials"],
      whatGuestsDo: "Complete photo prompts and capture moments throughout the celebration.",
      whatTheFamilyKeeps: "The collection of guest-generated photos.",
      personalization: ["Custom prompts", "Baby's name", "Event theme", "Custom challenges"],
      spaceRequired: "Minimal.",
      approximateDuration: "Throughout the event.",
      optionalAddOns: ["Photo printing", "Custom photo album", "Digital gallery", "Prize for challenge winner"],
    },
  },
];

// Experience pools, per event type. No id appears in more than one pool for
// the same event, so an item is never offered twice. guessArrival isn't in
// any pool - it's a paid ADDONS upgrade, purchasable in the Make It Yours
// step and previewed on the homepage's "Guess the Arrival" modal.
//
// Baby Shower and Tutu Twirls & Tea are the two-pool event types; every
// other event type uses a single 4-pick pool plus the separate Playful
// Add-On step (see PLAYFUL_ADDON_IDS below).
export const PLAY_CONNECT_IDS = ["babyTrivia", "babyNaptimeRelay", "priceIsRight", "kindnessStation"];
export const CREATE_KEEP_IDS = ["pictureThis", "photoChallenge", "storybook", "wallPuzzle", "timeCapsule", "nurseryRhyme"];
export const ENGAGEMENT_POOL_IDS = ["pictureThis", "photoChallenge", "storybook", "wallPuzzle", "timeCapsule", "kindnessStation"];
export const NEUTRAL_POOL_IDS = ["pictureThis", "storybook", "wallPuzzle", "timeCapsule", "kindnessStation"];
// Tutu Twirls & Tea: two 3-item pools, choose 2 of 3 each (not 3 of 3, so
// there's a real choice to make in both).
export const TUTU_PLAY_CONNECT_IDS = ["pictureThis", "photoChallenge", "kindnessStation"];
export const TUTU_CREATE_KEEP_IDS = ["storybook", "wallPuzzle", "timeCapsule"];

// Resolves any pool id's copy/photo for the active event type, whichever
// list it lives in - MAIN_PACKAGE_ITEMS/SETUP_ONLY_ITEMS (event-aware
// copy via resolvePackageItem) or an ADDONS entry reused as a free-pick
// pool candidate (nurseryRhyme / Custom Art Piece). Used by the homepage's
// Signature Experiences preview and the Experiences page - the Package
// Builder has its own resolveSetupItem() that additionally handles the
// live-catalog Custom Serving Dish, which never appears in a pool.
export function resolveExperienceItem(id, eventTypeId) {
  const staticItem = MAIN_PACKAGE_ITEMS.find((m) => m.id === id) || SETUP_ONLY_ITEMS.find((m) => m.id === id);
  if (staticItem) return resolvePackageItem(staticItem, eventTypeId);
  const addon = ADDONS.find((a) => a.id === id);
  if (addon) {
    return {
      id,
      icon: addon.icon,
      name: addon.name,
      tagline: addon.tagline,
      description: addon.description,
      photoUrls: addon.photoUrls || (addon.photoUrl ? [addon.photoUrl] : []),
      details: addon.details,
    };
  }
  return null;
}

// "Want Something Playful?" add-on step - Engagement, Birthday, Holiday, and
// Special Moment builds only (Baby Shower already has Play & Connect).
// Reuses the same items' event-neutral `default` copy (Know Them Best / The
// Challenge Course / The Price Is Right).
export const PLAYFUL_ADDON_IDS = ["babyTrivia", "babyNaptimeRelay", "priceIsRight"];
export const PLAYFUL_ADDON_PRICE = 125;

// Flat price for an "Additional Keepsake Experience" - any pool pick beyond
// an event's included count. Addon-reuse items (nurseryRhyme / Custom Art
// Piece) keep their own real `price` instead via resolveSetupItem's
// fallback, matching the plan's allowance for product-specific pricing.
export const SETUP_ADDON_PRICE = 125;

// The exact live-catalog item name centerpieceLarge is matched against.
export const CENTERPIECE_LARGE_CATALOG_NAME = "Customizable Serving Dish (Center Piece) - Large";

// Optional upgrades layered on top of the fixed package via the Package
// Builder's Make It Yours step. nurseryRhyme (Custom Art Piece) also lives
// in CREATE_KEEP_IDS above as a free-pick candidate - when not chosen free,
// Make It Yours surfaces it at its price here through the pool-overflow
// mechanic instead of rendering it twice. pictureThisDigitalAlbum is
// tech/digital in nature and only enabled once Picture This is in the
// package - see DIGITAL_ADDON_IDS below.
export const ADDONS = [
  {
    id: "guessArrival",
    icon: Sparkles,
    name: "Guess the Arrival",
    tagline: "The baby shower game that keeps going after the shower.",
    description:
      "Your own private digital baby shower experience, personalized down to the colours. Every guest gets their own page to guess the date, the time, where Mom will be, and who she'll be with, then watches the live board update as everyone else weighs in. You get a private host dashboard to manage it all and reveal who got closest when baby actually arrives.",
    price: 149,
    photoUrl: arrivalPhoto,
    fit: "contain",
    details: {
      stats: {
        bestFor: "Guests who love guessing games and digital experiences",
        length: "5-10 minutes to play; continues until baby arrives",
        guests: "Everyone with a phone",
        createsKeepsake: "Digital record",
        energy: 4,
      },
      whatItIs: "A personalized digital baby-arrival guessing game where guests make their predictions about when and how baby will arrive.",
      howItWorks: [
        "Every guest gets their own link to a personalized Guess the Arrival page, branded with baby's name, your shower colours, and a custom hero image.",
        "They scan in and submit their predictions: arrival date, time, where Mom will be, who she'll be with, and any other customized questions, plus an optional private message just for Mom.",
        "Everyone sees everyone's guesses on a live board.",
        "The game continues long after the shower is over, with reminders as the due date gets closer.",
        "You get a private host dashboard to manage every guess, enter the real arrival date, and reveal the winner once baby is here.",
      ],
      whatsIncluded: [
        "Personalized digital game page",
        "Custom event branding",
        "Guest prediction form",
        "Live guessing board",
        "Host dashboard",
        "Winner tracking",
        "Due-date reveal",
        "Email collection",
        "Guest reminders",
        "Post-event winner functionality",
      ],
      whatGuestsDo: "Submit their predictions, see the live board, and wait to see whose prediction comes closest.",
      whatTheFamilyKeeps: "A digital record of everyone's predictions and the eventual winner.",
      personalization: [
        "Baby's name",
        "Parents' names",
        "Event colours",
        "Welcome message",
        "Custom questions",
        "Custom URL/page",
        "Optional trivia",
        "Optional bonus rounds",
        "Event imagery",
      ],
      spaceRequired: "None beyond guests having access to their phones.",
      approximateDuration: "5-10 minutes at the shower, with the experience continuing afterward.",
      optionalAddOns: ["Custom trivia", "Bonus guessing round", "Additional personalized questions", "Custom digital graphics"],
    },
  },
  {
    id: "pictureThisDigitalAlbum",
    icon: Smartphone,
    name: "Digital Photo Album",
    tagline: "An upgrade to the Picture This activity.",
    description:
      "Every photo from Picture This also lands in a private digital album guests can keep adding to and revisit anytime, on top of the physical display.",
    price: 150,
    details: {
      summary: "A digital twin of your Picture This display. Every photo lands online too, not just on the wall.",
      howItWorks: [
        "Every photo taken for Picture This is also saved digitally.",
        "Guests get a link to the private album.",
        "Anyone can revisit or add to it after the event.",
        "No extra step required from guests.",
      ],
      goodToKnow: [
        "Only available if Picture This is part of your package.",
        "Album stays accessible after the event ends.",
      ],
    },
  },
  {
    id: "nurseryRhyme",
    icon: Music,
    name: "Custom Art Piece",
    tagline: "A piece of art that holds a story only you could tell.",
    description:
      "A custom framed piece made ahead of time from the photos, lyrics, or words that matter most. It's displayed as decor during the celebration, then becomes a gift for Mom to keep afterward.",
    price: 175,
    photoUrl: nurseryRhymePhoto,
    photoUrls: [nurseryRhymePhoto, nurseryRhymeKeepsakePhoto],
    details: {
      stats: { bestFor: "Design-conscious and sentimental hosts", length: "Throughout event", guests: "On display for everyone", createsKeepsake: "Yes", energy: 1 },
      whatItIs: "A custom-made art piece, created ahead of the event from the photos, lyrics, or words that matter most to you.",
      howItWorks: [
        "The host submits the photos, lyrics, or words that matter most, ahead of the event.",
        "We design and create a custom piece around them.",
        "It arrives ready before your celebration and is displayed as part of your decor.",
        "Afterward, it's a keepsake gift for Mom to take home.",
      ],
      whatsIncluded: ["Custom art concept", "Materials", "Professional printing and framing", "Display setup at your event"],
      whatGuestsDo: "Enjoy it as part of the event's decor.",
      whatTheFamilyKeeps: "The finished piece itself, a gift for Mom that doubles as decor for the celebration.",
      personalization: ["Artwork style", "Colours", "Theme", "Names", "Date", "Custom wording"],
      spaceRequired: "Wall or tabletop display space.",
      approximateDuration: "Displayed throughout the event.",
      optionalAddOns: ["Premium framing", "Larger artwork", "Custom illustration"],
    },
  },
  {
    id: "welcomeSign",
    icon: Hand,
    name: "Welcome Sign",
    tagline: "First impressions, but make them fun.",
    description:
      "A custom welcome sign designed around your theme and ready to greet your guests as they arrive.",
    price: 125,
    photoUrl: welcomeSignPhoto,
    details: {
      summary: "A custom welcome sign that greets your guests the moment they walk in.",
      howItWorks: [
        "Tell us your theme and wording.",
        "We design a sign to match.",
        "It's printed and framed for you.",
        "It's ready to set up at your entrance.",
      ],
      goodToKnow: [
        "Ready within about a week.",
        "Comes with a stand, no extra hardware needed.",
      ],
    },
  },
  {
    id: "photoWall",
    icon: Images,
    name: "Photo Wall / Feature Wall",
    tagline: "Your guests' new favourite place to take a picture.",
    description:
      "Turn your photo display into a full feature moment with balloons, florals, fabric, and statement details designed to coordinate with your celebration.",
    price: 350,
    photoUrl: photoWallPhoto,
    details: {
      summary: "Turns your photo display into a full feature moment with balloons, florals, and fabric.",
      howItWorks: [
        "We design the wall around your existing display piece.",
        "Balloons, florals, and fabric are added to match your theme.",
        "It's installed on site before your event starts.",
        "Guests get a full backdrop, not just a display.",
      ],
      goodToKnow: [
        "Setup happens the day of your event.",
        "Pairs well with Picture This or the Custom Wall Puzzle.",
      ],
    },
  },
  {
    id: "voiceNotes",
    icon: Mic,
    name: "Voice Memories",
    tagline: "Because sometimes hearing someone's voice years from now means more than reading their words.",
    description:
      "A digital guest-message experience that lets family and friends record a personal voice message for the child or parents.",
    price: 300,
    details: {
      stats: { bestFor: "Sentimental families", length: "1-3 minutes per guest", guests: "Individual guests", createsKeepsake: "Yes", energy: 2 },
      whatItIs: "A digital guest-message experience that lets family and friends record a personal voice message for the child or parents.",
      howItWorks: [
        "Guests record a short message using their phone or the provided experience setup.",
        "The recordings are collected digitally for the family.",
        "Recordings are saved and sealed with the Time Capsule.",
        "You can revisit them whenever you'd like.",
      ],
      whatsIncluded: ["Voice recording experience", "Guest instructions", "Digital collection", "Event-specific setup"],
      whatGuestsDo: "Record a message, wish, story, or piece of advice.",
      whatTheFamilyKeeps: "Digital voice recordings from their guests.",
      personalization: ["Baby's name", "Custom prompts", "Event branding", "Custom welcome message"],
      spaceRequired: "Minimal.",
      approximateDuration: "1-3 minutes per guest.",
      optionalAddOns: ["Picture This", "Time Capsule", "Custom digital keepsake page"],
    },
  },
  {
    id: "digitalAlbum",
    icon: Smartphone,
    name: "Digital Memory Album",
    tagline: "Keep the memories going long after the party.",
    description:
      "Your photos live in a private digital album you can keep adding to. Guests can tap and view the collection with a simple NFC touch.",
    price: 100,
    details: {
      summary: "A private digital photo album guests can tap into and add to, using a simple NFC touch.",
      howItWorks: [
        "We set up an NFC tap point at your event.",
        "Guests tap their phone to open the album instantly.",
        "They can view existing photos or add their own.",
        "The album stays live after the event ends.",
      ],
      goodToKnow: [
        "Works with any modern smartphone, no app needed.",
        "You keep access to the album permanently.",
      ],
    },
  },
];

// Gated on Picture This being in the package (free or paid) rather than
// hidden entirely - see hasPictureThis in PackageBuilder.jsx.
export const DIGITAL_ADDON_IDS = ["pictureThisDigitalAlbum"];

// Every package includes a guest gift. Each option has its own included
// guest count and its own per-guest overage rate, both set independently
// per gift, not shared across all three.
export const KEEPSAKES = [
  {
    id: "readyToPop",
    icon: PartyPopper,
    name: "Ready to Pop",
    // The included guest gift keeps the same product but a different name
    // per event type, matching the plan's naming rule (never a generic
    // "Guest Gift"). See resolveKeepsakeName().
    nameByEventType: {
      babyShower: "Ready to Pop",
      engagement: "They Popped the Question",
      default: "A Little Something for the Road",
    },
    tagline: "Included with your package.",
    description:
      "A cute, custom wrapped popcorn kit paired with a gourmet treat. Designed to match your celebration and give guests a little thank you they can actually enjoy.",
    upgradePrice: 0,
    includedGuestCount: 25,
    overagePricePerGuest: 4,
    // Sold individually on the Gifts page, separate from its role as a
    // package guest gift (upgradePrice/overagePricePerGuest above).
    standalonePrice: 5,
    photoUrls: [readyToPopPhoto, readyToPopPhoto2],
    details: {
      summary: "A cute, ready made popcorn kit paired with a gourmet treat for every guest.",
      howItWorks: [
        "Kits are custom wrapped to match your event.",
        "Each one includes popcorn plus a gourmet treat.",
        "They're set out or handed to guests as they leave.",
        "Included free for your first set of guests.",
      ],
      goodToKnow: [
        "No setup needed, arrives ready to hand out.",
        "Extra guests beyond your included count are billed per guest.",
      ],
    },
  },
  {
    id: "lilRoots",
    icon: Sprout,
    name: "Lil Roots",
    tagline: "Upgrade your guest gift.",
    description:
      "A planted seedling in a beautifully wrapped keepsake jar, paired with a gourmet treat. A tiny reminder of the people everyone came to celebrate.",
    upgradePrice: 225,
    includedGuestCount: 25,
    overagePricePerGuest: 13,
    // Sold individually on the Gifts page, separate from its role as a
    // package guest gift upgrade (upgradePrice above).
    standalonePrice: 15,
    photoUrl: lilRootsPhoto,
    details: {
      summary: "A planted seedling in a keepsake jar, paired with a gourmet treat. A gift that keeps growing.",
      howItWorks: [
        "Each jar comes planted and ready to grow.",
        "A gourmet treat is paired alongside it.",
        "Jars are custom labeled for your event.",
        "Guests take them home to plant and grow.",
      ],
      goodToKnow: [
        "Needs sunlight and water like any seedling.",
        "Applies to your included guest count, extra guests billed per guest.",
      ],
    },
  },
  {
    id: "grownFolksLootBags",
    icon: Gift,
    name: "Grown Folks Loot Bags",
    tagline: "Likkle sweetness fi big people business.",
    description:
      "A box of 3 full size rum cupcakes, individually gift boxed and vacuum sealed to lock in every bit of freshness. Hand someone this box and watch their whole day improve.",
    upgradePrice: 0,
    includedGuestCount: 10,
    overagePricePerGuest: 6,
    // Sold individually on the Gifts page as a $15 box of 3, separate from
    // its role as a package guest gift (upgradePrice/overagePricePerGuest
    // above).
    standalonePrice: 15,
    photoUrls: [grownFolksLootBagPhoto, grownFolksLootBagPhoto2],
    details: {
      summary: "A box of 3 full size rum cupcakes, individually gift boxed and vacuum sealed to lock in every bit of freshness.",
      howItWorks: [
        "Rum cupcakes are baked and boxed from our own dessert line.",
        "Each box is vacuum sealed to lock in freshness.",
        "They're set out or handed out at your event.",
        "Included free for your first set of guests.",
      ],
      goodToKnow: [
        "Extra guests beyond your included count are billed per guest.",
        "Ask about swapping in a specific dessert flavor.",
      ],
    },
  },
];

// Resolves a guest gift's display name for the active event type, falling
// back to its plain `name` for keepsakes without event-specific naming
// (Lil Roots, Grown Folks Loot Bags).
export function resolveKeepsakeName(keepsake, eventTypeId) {
  if (!keepsake.nameByEventType) return keepsake.name;
  return keepsake.nameByEventType[eventTypeId] || keepsake.nameByEventType.default;
}

// Backdrop/display setups - never included in a package, always an add-on.
// Both displays cost the same regardless of which one is chosen; price
// only depends on the setup option below.
export const DISPLAYS = [
  {
    id: "archedIridescent",
    icon: LampCeiling,
    name: "Arched Iridescent Light Up Display",
    tagline: "Glowing, dreamy, unmistakably yours.",
    description:
      "A free-standing arched display that lights up the room, dressed in color draping that matches your theme. Just needs a nearby outlet, we bring the extension cords.",
    photoUrl: "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/iradescentlight.png",
    details: {
      summary: "A glowing arched display with color draping that matches your theme.",
      howItWorks: [
        "Tell us your event colors.",
        "We drape the arch to match your theme.",
        "It's set up free standing near a power outlet.",
        "It lights up for the full length of your event.",
      ],
      goodToKnow: [
        "Needs a nearby outlet, extension cords included.",
        "Setup pricing is separate, see Setup Pricing below.",
      ],
    },
  },
  {
    id: "blackGoldGeometric",
    icon: Frame,
    name: "Black and Gold Geometric Display",
    tagline: "Sleek lines, statement presence.",
    description:
      "A bold geometric frame in black and gold, 6 feet by 4 feet and free-standing, with your own custom text taking center stage. This is the piece guests walk in and photograph first.",
    photoUrl: "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/blackandgolddisplay.png",
    details: {
      summary: "A bold black and gold geometric frame, 6 feet by 4 feet, built to be the first thing guests photograph.",
      howItWorks: [
        "Share the custom text you want on the center panel.",
        "We build and bring the display to your event.",
        "It's set up free standing, no mounting needed.",
        "You choose self setup or professional install.",
      ],
      goodToKnow: [
        "Needs about 6 feet of wall or floor space.",
        "Setup pricing is separate, see Setup Pricing below.",
      ],
    },
  },
  {
    id: "allOfTheLights",
    icon: Lightbulb,
    name: "All Of The Lights",
    tagline: "Every corner glows. Every photo pops.",
    description:
      "Two arched, light-lined walls dressed in flowing draping, framed palm leaf accents, and a personalized neon sign in the middle spelling out your celebration. Approximately 10 feet wide and 6 feet tall, this is the display that turns a room into a photo studio.",
    photoUrl: "/photos/all-of-the-lights-display.jpg",
    details: {
      summary: "Two glowing arched walls with draping, palm accents, and a personalized neon sign, about 10 feet wide and 6 feet tall.",
      howItWorks: [
        "Share the wording you want lit up in neon.",
        "Tell us your draping color, it's fully customizable.",
        "We build and bring the display to your event.",
        "It's set up free standing near a power outlet.",
      ],
      goodToKnow: [
        "Approximately 10 feet wide and 6 feet tall.",
        "Requires a nearby outlet.",
        "Draping color can be customized, contact us for requests.",
        "Setup pricing is separate, see Setup Pricing below.",
      ],
    },
  },
  {
    id: "ohBabyGridWall",
    icon: LayoutGrid,
    name: "Oh Baby",
    tagline: "Playful squares, pops of color.",
    description:
      "A dimensional grid wall in crisp white, accented with colored cube inserts and warm up-lighting, paired with an arched light-up frame, flowing draping, and a personalized neon sign. Approximately 8 feet wide, with fully customizable draping and accent colors to match your theme.",
    photoUrl: "/photos/oh-baby-grid-wall-display.jpg",
    details: {
      summary: "A dimensional grid wall with colored cube accents, an arched light-up frame, and a personalized neon sign, about 8 feet wide.",
      howItWorks: [
        "Share the wording you want lit up in neon.",
        "Tell us your draping and accent colors, it's fully customizable.",
        "We build and bring the display to your event.",
        "It's set up free standing near a power outlet.",
      ],
      goodToKnow: [
        "Approximately 8 feet wide.",
        "Requires a nearby outlet.",
        "Draping and accent color can be customized, contact us for requests.",
        "Setup pricing is separate, see Setup Pricing below.",
      ],
    },
  },
  {
    id: "heyGirlHey",
    icon: Flower2,
    name: "Hey Girl Hey",
    tagline: "Bold color, big blooms, bigger energy.",
    description:
      "Twin gold arches wrapped in string lights, dressed in flowing pink and green draping, and framed with oversized tropical florals and greenery. A personalized neon sign takes center stage, flanked by gold and jewel-toned pedestal columns. Approximately 10 feet wide and 6 feet tall, this display brings the drama.",
    photoUrl: "/photos/hey-girl-hey-display.jpg",
    details: {
      summary: "Twin gold arches with pink and green draping, oversized tropical florals, and a personalized neon sign, about 10 feet wide and 6 feet tall.",
      howItWorks: [
        "Share the wording you want lit up in neon.",
        "We build and bring the display to your event.",
        "It's set up free standing near a power outlet.",
        "It lights up for the full length of your event.",
      ],
      goodToKnow: [
        "Approximately 10 feet wide and 6 feet tall.",
        "Requires a nearby outlet.",
        "Setup pricing is separate, see Setup Pricing below.",
      ],
    },
  },
];

// Memory Display setup tiers. "No Display" is the implicit default
// (no displayId chosen at all) so it isn't listed here - see
// pages/PackageBuilder.jsx's display step.
export const DISPLAY_SETUP_OPTIONS = [
  {
    id: "diy",
    label: "Self-Styled Memory Display",
    price: 150,
    description: "Receive the display components and style the setup yourself.",
  },
  {
    id: "professional",
    label: "Professionally Styled Memory Display",
    price: 350,
    description: "We'll design, arrange, and style the display so your interactive experiences and keepsakes have a beautiful focal point at the event.",
  },
];

// How involved the customer wants to be, independent of the Memory Display
// choice above - a customer can mix either service style with either
// display tier. Self Setup is for Toronto pickup or Toronto drop-off;
// delivery is handled by direct contact rather than a set fee.
export const SERVICE_STYLE_OPTIONS = [
  {
    id: "self",
    label: "Self Setup",
    price: 0,
    description:
      "Everything arrives prepared and ready for you to place and arrange. Self Setup is for Toronto pickup or Toronto drop-off. Need delivery? Please contact us.",
  },
  {
    id: "full",
    label: "Event Stylist",
    price: 395,
    description:
      "You don't lift a finger. We bring everything, set it up, style it, make sure every detail is ready, and take it all back when the celebration is over.",
  },
];

export const HST_RATE = 0.13;
