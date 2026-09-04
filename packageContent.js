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
} from "lucide-react";
import pictureThisPhoto from "./media/picturethis.png";
import ohBabyCenterPhoto from "./media/ohbabycenter.png";
import babyTriviaPhoto from "./media/babytrivia.png";
import kindnessStationPhoto from "./media/file_00000000dcd4822fb648d37e9526b4b3.png";
import wallPuzzleBabyPhoto from "./media/file_00000000f7a8822fbf984e976f7ea0b4.png";
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

export const PACKAGE_NAME = "Made for Memories";

export const PACKAGE_INTRO = {
  eyebrow: "THE MADE FOR MEMORIES PACKAGE",
  title: "You bring the people. We bring the details.",
  body: "Seven signature pieces, built around one idea: your guests shouldn't just show up, they should leave something behind. Then build it out with any upgrades that make it even more you.",
};

// Placeholder pricing — easy to swap once real numbers are set.
export const MADE_FOR_MEMORIES_PRICE = 795;
export const DEFAULT_GUEST_COUNT = 30;

// Every item in the fixed 7-piece package can read differently depending on
// what's being celebrated. `copy.default` is the fallback used for any event
// type without its own entry; `photos.default` is likewise the fallback
// image. Photos are `null` until real event-specific photography is added —
// PhotoSlot already renders a "Photo coming soon" placeholder for those.
export const MAIN_PACKAGE_ITEMS = [
  {
    id: "pictureThis",
    icon: Camera,
    copy: {
      default: {
        name: "Picture This",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and leave a written note or a quick voice recording about a favourite memory. Both go into the time capsule to look back on someday.",
      },
      babyShower: {
        name: "Picture This",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and write a note or record a quick voice message about their favourite time or story with Mom and Dad, so baby can see what their parents were like when they grow up. Both go into the time capsule to discover someday.",
      },
      milestoneBirthday: {
        name: "Picture This: Their Year in Review",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and write a note or record a quick voice message about their favourite story of the birthday kiddo this year. Both go into the time capsule to look back on someday.",
      },
      birthday: {
        name: "Picture This",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and leave a note or a quick voice message with their favourite story about the guest of honor. Both go into the time capsule to keep.",
      },
      holiday: {
        name: "Picture This",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and leave a note or a quick voice message with a favourite holiday memory of the person you're celebrating. Both go into the time capsule to open again next season.",
      },
      specialMoment: {
        name: "Picture This",
        tagline: "Snap a photo. Share a memory.",
        description:
          "Guests snap a photo and leave a note or a quick voice message with a favourite memory of this moment. Both go into the time capsule to keep.",
      },
    },
    photos: {
      default: pictureThisPhoto,
      babyShower: pictureThisPhoto,
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      summary: "A photo wall guests build together. Every photo comes with a note or voice memo, all sealed in the Time Capsule.",
      howItWorks: [
        "Guests snap a photo at the event.",
        "They write a short note or record a quick voice memo.",
        "Both get clipped to the display wall.",
        "Everything gets sealed inside the Time Capsule to open later.",
      ],
      goodToKnow: [
        "Setup takes about 10 minutes.",
        "Works for any group size.",
        "Pairs with the Digital Photo Album for an online copy too.",
      ],
    },
  },
  {
    id: "kindnessStation",
    icon: Heart,
    copy: {
      default: {
        name: "Kindness Station",
        tagline: "Take one. Pass it on.",
        description:
          "Guests take a card of encouragement to carry out into the world, a small act of kindness done in your honor. Add an optional $5 gift card to any note for a pay it forward surprise.",
      },
      babyShower: {
        name: "Hello World Kindness Station",
        tagline: "A little kindness can change someone's whole day.",
        description:
          "Guests take a card, read a little reminder, and carry it out into the world in celebration of baby's arrival. Add an optional $5 gift card to any note for a pay it forward surprise.",
      },
      milestoneBirthday: {
        name: "Kindness Corner",
        tagline: "Teaching kindness, one birthday at a time.",
        description:
          "In honor of the birthday, guests take a kindness card to carry out into the world, a sweet little tradition that can grow with your little one every year. Add an optional $5 gift card for a pay it forward surprise.",
      },
      birthday: {
        name: "Kindness Station",
        tagline: "Take one. Pass it on.",
        description:
          "Guests take a card of kindness to carry out into the world, turning the party into something that reaches beyond the room. Add an optional $5 gift card for a pay it forward surprise.",
      },
      holiday: {
        name: "Season of Kindness Station",
        tagline: "Spread a little extra this season.",
        description:
          "Guests take a card of kindness to carry out into the world, sharing the spirit of the season with people outside the room. Add an optional $5 gift card for a pay it forward surprise.",
      },
      specialMoment: {
        name: "Kindness Station",
        tagline: "A little kindness, for someone else.",
        description:
          "Guests take a card of kindness to carry out into the world, a quiet way of marking the occasion that reaches beyond your guest list. Add an optional $5 gift card for a pay it forward surprise.",
      },
    },
    photos: {
      default: kindnessStationPhoto,
      babyShower: kindnessStationPhoto,
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      summary: "A simple take one, give one card station. Guests grab a card of encouragement and carry a small act of kindness back into the world.",
      howItWorks: [
        "Guests approach the station and pick a card.",
        "Each card has a short kindness prompt to complete.",
        "An optional $5 gift card can be added to any note.",
        "Guests take their card home as a reminder to pass it on.",
      ],
      goodToKnow: [
        "No setup needed beyond the display.",
        "Great for guests of all ages.",
      ],
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
        tagline: "The story starts before they even arrive.",
        description:
          "Every guest becomes one of baby's story friends and contributes a page (a doodle, a wish, something they hope baby learns) to a keepsake storybook that begins their very first adventure.",
      },
      milestoneBirthday: {
        name: "Their Big Adventure",
        tagline: "Guests write the next chapter.",
        description:
          "Every guest adds a page to a growing storybook (a memory, a lesson, a little piece of this year's adventure), building a keepsake you'll add to for every birthday to come.",
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
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      summary: "A shared keepsake storybook. Every guest fills one page, and the finished book becomes something you keep forever.",
      howItWorks: [
        "Guests are handed a blank page from the book.",
        "They fill it with a memory, a wish, or a doodle.",
        "Pages get collected and bound into one storybook.",
        "You keep the finished book after the event.",
      ],
      goodToKnow: [
        "Takes about 2 minutes per guest.",
        "Comes in as an add-on if it's not one of your included picks.",
      ],
    },
  },
  {
    id: "ohBabyCenterpiece",
    icon: Leaf,
    copy: {
      default: {
        name: "Milestone Centerpiece",
        tagline: "A centerpiece with a little history.",
        description:
          "A custom display featuring photos from before, with space to serve your favourite treats at the centre of it all.",
      },
      babyShower: {
        name: "Oh Baby Decor",
        tagline: "A centerpiece with a little history.",
        description:
          "A custom wooden display featuring childhood photos of Mom and Dad, with space to serve your favourite shower treats.",
      },
      milestoneBirthday: {
        name: "Growing Up Centerpiece",
        tagline: "A look back at how far they've come.",
        description:
          "A custom display featuring photos from their first years, with space to serve your favourite birthday treats at the centre of the table.",
      },
      birthday: {
        name: "Birthday Centerpiece",
        tagline: "A centerpiece worth celebrating.",
        description:
          "A custom display featuring photos of the guest of honor, with space to serve your favourite birthday treats.",
      },
      holiday: {
        name: "Holiday Centerpiece",
        tagline: "A centerpiece with a little history.",
        description:
          "A custom display featuring favourite holiday photos, with space to serve your favourite seasonal treats.",
      },
      specialMoment: {
        name: "Custom Centerpiece",
        tagline: "Simple, elegant, unforgettable.",
        description:
          "A custom candle and floral centerpiece designed around your colour palette, set at the centre of your table.",
      },
    },
    photos: {
      default: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
      babyShower: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
      milestoneBirthday: null,
      birthday: null,
      holiday: [centerpieceThanksgivingPhoto, centerpieceChristmasPhoto],
      specialMoment: [centerpieceSpecialMomentPhoto],
    },
    details: {
      summary: "A custom centerpiece built around real photos. Doubles as your dessert table's main feature.",
      howItWorks: [
        "Send us the photos you want featured.",
        "We design the centerpiece around them.",
        "It arrives ready to set up on your table.",
        "Serve treats right alongside it.",
      ],
      goodToKnow: [
        "Photos are due at least 2 weeks before your event.",
        "Design changes with the season and occasion.",
      ],
    },
  },
  {
    id: "babyTrivia",
    icon: Brain,
    copy: {
      default: {
        name: "Trivia Card Pack",
        tagline: "How well do you really know them?",
        description:
          "A playful round of trivia with up to 15 custom questions guests will love guessing about the people you're celebrating.",
      },
      babyShower: {
        name: "Baby Trivia Card Pack",
        tagline: "Think you know babies? Let's see.",
        description:
          "A playful collection of baby and parent trivia for guests to test their knowledge. Add up to 15 custom questions all about Mom and Dad.",
      },
      milestoneBirthday: {
        name: "Birthday Trivia Card Pack",
        tagline: "How well do you know the birthday star?",
        description:
          "A playful round of trivia all about the birthday kiddo, with up to 15 custom questions guests will love guessing.",
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
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      summary: "A custom trivia round built entirely around the people you're celebrating.",
      howItWorks: [
        "Send us up to 15 questions about the guest of honor.",
        "We turn them into a printed card pack.",
        "Guests answer individually or in teams.",
        "Whoever scores highest wins bragging rights.",
      ],
      goodToKnow: [
        "Takes about 15 minutes to play.",
        "Answer key included so anyone can host it.",
      ],
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
          "A giant portrait puzzle guests gradually assemble throughout the celebration, piece by piece, together, becoming a keepsake to hang afterward.",
      },
      babyShower: {
        name: "Put Baby Together",
        tagline: "Help us complete the picture.",
        description:
          "A giant portrait of baby is broken into puzzle pieces. Guests gradually assemble it throughout the shower, and the finished piece becomes a keepsake for the nursery.",
      },
      milestoneBirthday: {
        name: "Piece By Piece",
        tagline: "A portrait guests build together.",
        description:
          "A giant portrait puzzle guests gradually assemble throughout the party, becoming a one-of-a-kind keepsake to hang afterward.",
      },
      birthday: {
        name: "Custom Wall Puzzle",
        tagline: "Help us put it together.",
        description:
          "A giant portrait puzzle guests gradually assemble throughout the party, a keepsake built by everyone who came.",
      },
      holiday: {
        name: "Custom Wall Puzzle",
        tagline: "A picture worth piecing together.",
        description:
          "A giant seasonal or family portrait puzzle guests gradually assemble throughout the celebration.",
      },
      specialMoment: {
        name: "Put Together",
        tagline: "Your love. Your people. One beautiful picture.",
        description:
          "A giant portrait puzzle of the two of you, guests gradually assemble it throughout the celebration, a keepsake made by the people who celebrate your love.",
      },
    },
    photos: {
      // No bump/ultrasound photo exists yet for the baby-shower variant —
      // showing the toddler portrait there doesn't make sense (there's no
      // baby to photograph yet at a shower), so it stays null ("photo
      // coming soon") until a real one is supplied. The toddler portrait
      // is only correct for the 1st-3rd-birthday variant.
      default: null,
      babyShower: null,
      milestoneBirthday: wallPuzzleBabyPhoto,
      birthday: null,
      holiday: null,
      specialMoment: wallPuzzleEngagementPhoto,
    },
    details: {
      summary: "A giant portrait puzzle guests build together, piece by piece, throughout the celebration.",
      howItWorks: [
        "We turn your photo into a large format puzzle.",
        "It's set out at the start of the event.",
        "Guests add pieces whenever they pass by.",
        "The finished portrait becomes a keepsake to hang.",
      ],
      goodToKnow: [
        "Needs a flat surface and a bit of table space.",
        "Usually finishes by the end of the event.",
      ],
    },
  },
  {
    id: "timeCapsule",
    icon: Mail,
    copy: {
      default: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Every photo, note, and voice recording from Picture This gets sealed inside, ready to open again in the future.",
      },
      babyShower: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Every photo, note, and voice message from Picture This gets sealed inside: stories about Mom and Dad from the people who celebrated baby before they ever knew them, saved for the future.",
      },
      milestoneBirthday: {
        name: "The World at 18 Time Capsule",
        tagline: "What will the world look like when they turn 18?",
        description:
          "Every photo, note, and voice message from Picture This gets sealed inside, along with guest predictions about the world, opened together on their 18th birthday.",
      },
      birthday: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Every photo, note, and voice message from Picture This gets sealed inside, ready to open again on a birthday down the road.",
      },
      holiday: {
        name: "Time Capsule",
        tagline: "A moment from this year, saved for next.",
        description:
          "Every photo, note, and voice message from Picture This gets sealed inside, ready to open again next holiday season.",
      },
      specialMoment: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Every photo, note, and voice message from Picture This gets sealed inside, ready to open again in the future.",
      },
    },
    photos: {
      default: timeCapsulePhoto,
      babyShower: timeCapsulePhoto,
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
    },
    details: {
      summary: "A sealed keepsake box that holds everything from Picture This, ready to open again in the future.",
      howItWorks: [
        "Photos, notes, and voice memos go in throughout the event.",
        "The box is sealed at the end of the celebration.",
        "You choose when it gets opened again.",
        "Everyone who contributed becomes part of that memory.",
      ],
      goodToKnow: [
        "Pairs with Picture This, but works as a standalone keepsake too.",
        "Comes with a suggested open date tag.",
      ],
    },
  },
];

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

// Setup items that don't already exist as one of the 7 MAIN_PACKAGE_ITEMS
// (those stay Home.jsx's "seven signature pieces" preview, unchanged) or as
// an ADDONS entry. Same copy/photos shape as MAIN_PACKAGE_ITEMS so
// resolvePackageItem() works the same way for these. No per-event-type
// copy yet, just `default` - can be filled in later per event type the
// same way the other pieces are.
export const SETUP_ONLY_ITEMS = [
  {
    id: "babyNaptimeRelay",
    icon: Moon,
    copy: {
      default: {
        name: "Baby Naptime Relay",
        tagline: "Three stations. One sleepy baby.",
        description:
          "Race through three stations: bottle chug, diaper change, and sing the lullaby. Your lullaby is assigned to you. Sing it correctly to earn your points, finish the course as fast as possible, and prove you have what it takes to survive bedtime. Fastest caregiver wins.",
      },
    },
    photos: { default: null },
    details: {
      summary: "A three station relay race testing who can actually survive bedtime.",
      howItWorks: [
        "Guests race through bottle chug, diaper change, and lullaby stations.",
        "Each stage has to be completed correctly to score.",
        "Fastest total time wins.",
        "Great for teams or solo racers.",
      ],
      goodToKnow: [
        "Takes about 10 minutes per group.",
        "Needs a small clear space to run.",
      ],
    },
  },
  {
    id: "priceIsRight",
    icon: Tag,
    copy: {
      default: {
        name: "The Price Is Right",
        tagline: "Think you know what babies cost?",
        description:
          "From diapers and detergent to strollers and everything Mom actually registered for, put your pricing skills to the test. Guess the price. Guess where it's cheaper. Guess what Mom bought. Rack up the points, play solo or team up with friends.",
      },
    },
    photos: { default: null },
    details: {
      summary: "A pricing guessing game built around real baby gear and registry items.",
      howItWorks: [
        "Guests see a list of real baby items.",
        "They guess the price of each one.",
        "Closest guess without going over wins the round.",
        "Play individually or in teams.",
      ],
      goodToKnow: [
        "Takes about 15 minutes to play.",
        "Prices are pulled from Mom's actual registry when possible.",
      ],
    },
  },
  {
    id: "photoChallenge",
    icon: Aperture,
    copy: {
      default: {
        name: "The Photo Challenge",
        tagline: "Capture the moments Mom will want to remember.",
        description:
          "Each guest gets a secret photo challenge with one goal: capture a picture of Mom that fits the assignment. Scan the QR code and add it to the shared album. By the end of the celebration, Mom has a whole album of memories from the people who came to celebrate her.",
      },
    },
    photos: { default: null },
    details: {
      summary: "A scavenger hunt style photo game where every guest gets a secret assignment.",
      howItWorks: [
        "Each guest receives a hidden photo challenge.",
        "They find their moment and snap the photo.",
        "They scan a QR code to upload it.",
        "Every photo lands in one shared album by the end.",
      ],
      goodToKnow: [
        "Runs the whole length of the event.",
        "No app download needed, just a phone camera.",
      ],
    },
  },
];

// The base package includes 3 setup picks in Step 1, then 3 more in Step 2,
// both chosen from this fixed, curated list rather than the live Decor
// catalog (the one exception is centerpieceLarge, which is pulled from the
// live catalog by name - see CENTERPIECE_LARGE_CATALOG_NAME). Four items
// appear in both step lists on purpose: picking one in Step 1 removes it
// from Step 2's options, so nothing gets picked twice.
export const SETUP_STEP_1_IDS = ["pictureThis", "centerpieceLarge", "kindnessStation", "babyTrivia", "babyNaptimeRelay", "priceIsRight"];
export const SETUP_STEP_2_IDS = ["guessArrival", "timeCapsule", "wallPuzzle", "centerpieceLarge", "kindnessStation", "babyTrivia", "babyNaptimeRelay", "photoChallenge", "nurseryRhyme"];

export const SETUP_INCLUDED_COUNT = 3;

// Default price when a setup pool item is picked beyond the included 6.
// Some items have their own real price instead of this default - see
// SETUP_ADDON_PRICE_OVERRIDES.
export const SETUP_ADDON_PRICE = 75;
export const SETUP_ADDON_PRICE_OVERRIDES = {
  guessArrival: 150,
  nurseryRhyme: 175,
};

// The exact live-catalog item name centerpieceLarge is matched against.
export const CENTERPIECE_LARGE_CATALOG_NAME = "Customizable Serving Dish (Center Piece) - Large";

// Optional upgrades layered on top of the fixed package via the Package
// Builder's Add-Ons step. guessArrival and nurseryRhyme also live in the
// Setup pool (see SETUP_STEP_1_IDS/SETUP_STEP_2_IDS above) as free-pick
// candidates - when not chosen free, the Add-Ons step surfaces them at
// their price here through the setup-pool-overflow mechanic instead of
// rendering them twice. pictureThisDigitalAlbum is tech/digital in nature
// and only enabled once Picture This is in the package - see
// DIGITAL_ADDON_IDS below.
export const ADDONS = [
  {
    id: "guessArrival",
    icon: Sparkles,
    name: "Guess the Arrival Day",
    tagline: "When will baby make their grand entrance?",
    description:
      "Guests make their best guess on a personalized online game: the date, the time, and even what Mom will be doing when it all begins.",
    price: 150,
    photoUrl: arrivalPhoto,
    fit: "contain",
    details: {
      summary: "An online guessing game for when baby will actually arrive.",
      howItWorks: [
        "We build a private, personalized guessing page.",
        "Guests submit the date, time, and even what Mom might be doing.",
        "The page updates live once labor starts.",
        "Winner gets bragging rights when baby arrives.",
      ],
      goodToKnow: [
        "Link works on any phone or computer.",
        "Stays live until baby actually arrives.",
      ],
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
    name: "Custom Nursery Rhyme",
    tagline: "A story about the two people who started it all.",
    description:
      "We turn your story into a one-of-a-kind rhyme, beautifully printed and framed as part of the decor.",
    price: 175,
    photoUrl: nurseryRhymePhoto,
    details: {
      summary: "Your love story, turned into a custom rhyme and framed as part of your decor.",
      howItWorks: [
        "Share your story with us.",
        "We write a custom rhyme around it.",
        "It's professionally printed and framed.",
        "It arrives ready to display at your event.",
      ],
      goodToKnow: [
        "Takes about 1 to 2 weeks to produce.",
        "Frame style matches your event's theme.",
      ],
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
    name: "Voice Notes",
    tagline: "Because sometimes a story is better heard than read.",
    description:
      "Guests can record a little message, memory, or story to be discovered years from now. Each recording becomes part of the time capsule.",
    price: 300,
    details: {
      summary: "Lets guests record a short voice message that becomes part of your Time Capsule.",
      howItWorks: [
        "A simple recorder is set up at the event.",
        "Guests press record and leave a message.",
        "Recordings are saved and sealed with the Time Capsule.",
        "You can listen back whenever you open it.",
      ],
      goodToKnow: [
        "No app or sign up needed for guests.",
        "Recordings are yours to keep permanently.",
      ],
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

// Placeholder - update once a real price is set.
export const CUSTOM_STORY_BOOK_PRICE = 75;

// Every package includes a guest gift. Each option has its own included
// guest count and its own per-guest overage rate, both set independently
// per gift, not shared across all three.
export const KEEPSAKES = [
  {
    id: "readyToPop",
    icon: PartyPopper,
    name: "Ready to Pop",
    tagline: "Included with your package.",
    description:
      "A cute, custom wrapped popcorn kit paired with a gourmet treat. Designed to match your celebration and give guests a little thank you they can actually enjoy.",
    upgradePrice: 0,
    includedGuestCount: 25,
    overagePricePerGuest: 4,
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
    tagline: "A sweet favor for every guest.",
    description:
      "Every guest goes home with their own individually wrapped treat from our dessert line, a little something sweet to remember the celebration by.",
    upgradePrice: 0,
    includedGuestCount: 10,
    overagePricePerGuest: 6,
    details: {
      summary: "An individually wrapped dessert treat for every guest, straight from our own dessert line.",
      howItWorks: [
        "Treats are selected from our dessert menu.",
        "Each one is individually wrapped for guests.",
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

// Backdrop/display setups - never included in a package, always an add-on.
// Both displays cost the same regardless of which one is chosen; price
// only depends on the setup option below.
export const DISPLAYS = [
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
];

export const DISPLAY_SETUP_OPTIONS = [
  {
    id: "diy",
    label: "Self Setup",
    price: 500,
    description: "You bring the energy, we bring easy to follow instructions and floral arrangements that arrive already arranged. Setup takes minutes, not stress.",
  },
  {
    id: "professional",
    label: "Professional Install and Removal",
    price: 750,
    description: "Sit back and let us handle it. We arrive, install, and remove your display start to finish, so the only thing on your to do list is showing up.",
  },
];
