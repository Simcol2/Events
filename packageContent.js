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
} from "lucide-react";
import pictureThisPhoto from "./media/picturethis.png";
import ohBabyCenterPhoto from "./media/ohbabycenter.png";
import babyTriviaPhoto from "./media/babytrivia.png";
import kindnessStationPhoto from "./media/file_00000000dcd4822fb648d37e9526b4b3.png";
import wallPuzzleBabyPhoto from "./media/file_00000000f7a8822fbf984e976f7ea0b4.png";
import wallPuzzleEngagementPhoto from "./media/file_00000000a204822f9ab953201c8b7043.png";
import ohBabyBlocksPhoto from "./media/oh-baby-blocks-tablescape.png";
import ohBabyTrayPhoto from "./media/oh-sweet-baby-tray.png";
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
        tagline: "Snap it. Print it. Keep it.",
        description:
          "Guests print their favourite photo from the celebration and add it to your custom photo display, a growing, hands-on keepsake everyone helps build.",
      },
      babyShower: {
        name: "Picture This",
        tagline: "Snap it. Print it. Keep it.",
        description:
          "Guests print their favourite photo from the shower and add it to your custom photo display. At the end of the day, everything goes into baby's time capsule to discover someday.",
      },
      milestoneBirthday: {
        name: "Picture This: Their Year in Review",
        tagline: "Capture the year that flew by.",
        description:
          "Guests take photos throughout the party and add them to a custom display celebrating everything about the year that just happened.",
      },
      birthday: {
        name: "Picture This",
        tagline: "Snap it. Print it. Keep it.",
        description:
          "Guests print their favourite photo from the party and add it to a custom photo display, a keepsake of everyone who came to celebrate.",
      },
      holiday: {
        name: "Picture This",
        tagline: "Capture the season.",
        description:
          "Guests print and pin up their favourite photos from the celebration, building a shared display of the season together.",
      },
      specialMoment: {
        name: "Picture This",
        tagline: "Every moment, captured.",
        description:
          "Guests print their favourite photo from the day and add it to a custom display, a keepsake built by everyone who was there.",
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
  },
  {
    id: "kindnessStation",
    icon: Heart,
    copy: {
      default: {
        name: "Kindness Station",
        tagline: "Be kind. Pass it on.",
        description:
          "Guests write little notes of encouragement for a stranger to find and take home, a small act of kindness carried out into the world in your honor.",
      },
      babyShower: {
        name: "Hello World Kindness Station",
        tagline: "A little kindness can change someone's whole day.",
        description:
          "Guests pick a card, read a little reminder, and pass it on, carrying something positive out into the world in celebration of baby's arrival.",
      },
      milestoneBirthday: {
        name: "Kindness Corner",
        tagline: "Teaching kindness, one birthday at a time.",
        description:
          "In honor of the birthday, guests leave a kind note for a stranger to find, a sweet little tradition that can grow with your little one every year.",
      },
      birthday: {
        name: "Kindness Station",
        tagline: "Be kind. Pass it on.",
        description:
          "Guests write a small note of kindness for a stranger to find later, turning the party into something that reaches beyond the room.",
      },
      holiday: {
        name: "Season of Kindness Station",
        tagline: "Spread a little extra this season.",
        description:
          "Guests write notes of kindness for strangers to find, sharing the spirit of the season with people outside the room.",
      },
      specialMoment: {
        name: "Kindness Station",
        tagline: "A little kindness, for someone else.",
        description:
          "Guests leave a small note of kindness for a stranger to find, a quiet way of marking the occasion that reaches beyond your guest list.",
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
        tagline: "A centerpiece with a little history.",
        description:
          "A custom display featuring photos that matter to your moment, with space to serve your favourite treats.",
      },
    },
    photos: {
      default: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
      babyShower: [ohBabyCenterPhoto, ohBabyBlocksPhoto, ohBabyTrayPhoto],
      milestoneBirthday: null,
      birthday: null,
      holiday: null,
      specialMoment: null,
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
  },
  {
    id: "timeCapsule",
    icon: Mail,
    copy: {
      default: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Photos, stories, and sweet little memories from the people who celebrated with you, sealed up and saved for the future.",
      },
      babyShower: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Photos, stories, and sweet little memories from the people who celebrated baby before they ever knew them. Sealed up and saved for the future.",
      },
      milestoneBirthday: {
        name: "The World at 18 Time Capsule",
        tagline: "What will the world look like when they turn 18?",
        description:
          "Guests make predictions about the world and leave a message for your little one's future self, sealed up and opened together on their 18th birthday.",
      },
      birthday: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Guests leave a note, a memory, or a message for the future, sealed up and saved to open again on a birthday down the road.",
      },
      holiday: {
        name: "Time Capsule",
        tagline: "A moment from this year, saved for next.",
        description:
          "Guests leave a note or memory from this year's celebration, sealed up to open again next holiday season.",
      },
      specialMoment: {
        name: "Time Capsule",
        tagline: "A little piece of today, saved for tomorrow.",
        description:
          "Photos, stories, and sweet little memories from everyone who was there, sealed up and saved for the future.",
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
  return { id: item.id, icon: item.icon, photoUrls, ...copy };
}

// Optional upgrades layered on top of the fixed package via the Package
// Builder's "build your own" flow. Placeholder pricing throughout.
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
  },
  {
    id: "voiceNotes",
    icon: Mic,
    name: "Voice Notes",
    tagline: "Because sometimes a story is better heard than read.",
    description:
      "Guests can record a little message, memory, or story to be discovered years from now. Each recording becomes part of the time capsule.",
    price: 300,
  },
  {
    id: "digitalAlbum",
    icon: Smartphone,
    name: "Digital Memory Album",
    tagline: "Keep the memories going long after the party.",
    description:
      "Your photos live in a private digital album you can keep adding to. Guests can tap and view the collection with a simple NFC touch.",
    price: 100,
  },
];

export const KEEPSAKES = [
  {
    id: "readyToPop",
    icon: PartyPopper,
    name: "Ready to Pop",
    tagline: "A little something to take home.",
    description:
      "A cute, custom wrapped popcorn kit paired with a gourmet treat. Designed to match your celebration and give guests a little thank you they can actually enjoy.",
    pricePerGuest: 10,
  },
  {
    id: "lilRoots",
    icon: Sprout,
    name: "Lil Roots",
    tagline: "A little something is growing.",
    description:
      "A planted seedling in a beautifully wrapped keepsake jar, paired with a gourmet treat. A tiny reminder of the people everyone came to celebrate.",
    pricePerGuest: 15,
    photoUrl: lilRootsPhoto,
  },
];
