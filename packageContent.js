import { Sparkles, Camera, Mail, Leaf, Brain, Music, Hand, Images, Mic, Smartphone, PartyPopper, Sprout } from "lucide-react";
import arrivalPhoto from "./media/web_arrival.png";
import timeCapsulePhoto from "./media/timecapsul.png";
import nurseryRhymePhoto from "./media/poem.png";
import welcomeSignPhoto from "./media/welcomesign.png";
import photoWallPhoto from "./media/featurewall.png";
import lilRootsPhoto from "./media/lilroots.png";
import babyTriviaPhoto from "./media/babytrivia.png";
import ohBabyCenterPhoto from "./media/ohbabycenter.png";
import pictureThisPhoto from "./media/picturethis.png";

export const PACKAGE_INTRO = {
  eyebrow: "MADE FOR MEMORIES",
  title: "You bring the people. We bring the details.",
  body: "Choose the Essentials and build your experience with the add-ons you love, or let us put the whole thing together for you. Either way, your shower gets the fun stuff guests actually interact with, plus keepsakes Mom and Dad can enjoy long after the balloons come down.",
};

export const ESSENTIALS_FEATURES = [
  {
    id: "guessArrival",
    icon: Sparkles,
    name: "Guess the Arrival Day",
    tagline: "When will baby make their grand entrance?",
    description:
      "Guests make their best guess on your personalized online game. They can pick the date, time, and even predict what Mom will be doing when it all begins.",
    photoUrl: arrivalPhoto,
  },
  {
    id: "pictureThis",
    icon: Camera,
    name: "Picture This",
    tagline: "Snap it. Print it. Keep it.",
    description:
      "Guests print their favourite photo from the day and add it to your custom photo display. At the end of the shower, everything goes into baby's time capsule to discover someday.",
  },
  {
    id: "timeCapsule",
    icon: Mail,
    name: "Time Capsule",
    tagline: "A little piece of today, saved for tomorrow.",
    description:
      "Photos, stories, and sweet little memories from the people who celebrated baby before they ever knew them. Sealed up and saved for the future.",
    photoUrl: timeCapsulePhoto,
  },
  {
    id: "ohBabyCenterpiece",
    icon: Leaf,
    name: "Oh Baby Centerpiece",
    tagline: "A centerpiece with a little history.",
    description:
      "A custom wooden display featuring childhood photos of Mom and Dad, with space to serve your favourite shower treats.",
  },
  {
    id: "babyTrivia",
    icon: Brain,
    name: "Baby Trivia Card Pack",
    tagline: "Think you know babies? Let's see.",
    description:
      "A playful collection of baby and parent trivia for guests to test their knowledge. You can also add up to 15 custom questions all about Mom and Dad.",
  },
  {
    id: "nurseryRhyme",
    icon: Music,
    name: "Custom Nursery Rhyme",
    tagline: "A story about the two people who started it all.",
    description:
      "We turn Mom and Dad's story into a one of a kind nursery rhyme, beautifully printed and framed as part of the shower decor.",
    photoUrl: nurseryRhymePhoto,
  },
  {
    id: "welcomeSign",
    icon: Hand,
    name: "Welcome Sign",
    tagline: "First impressions, but make them fun.",
    description:
      "A custom welcome sign designed around your shower theme and ready to greet your guests as they arrive.",
    photoUrl: welcomeSignPhoto,
  },
];

export const ADDONS = [
  {
    id: "photoWall",
    icon: Images,
    name: "Photo Wall / Feature Wall",
    tagline: "Your guests' new favourite place to take a picture.",
    description:
      "Turn your photo display into a full feature moment with balloons, florals, fabric, and statement details designed to coordinate with your shower.",
    price: 350,
    photoUrl: photoWallPhoto,
  },
  {
    id: "voiceNotes",
    icon: Mic,
    name: "Voice Notes",
    tagline: "Because sometimes a story is better heard than read.",
    description:
      "Guests can record a little message, memory, or story for baby to discover years from now. Each recording becomes part of the time capsule.",
    price: 300,
  },
  {
    id: "digitalAlbum",
    icon: Smartphone,
    name: "Digital Memory Album",
    tagline: "Keep the memories going long after the shower.",
    description:
      "Your photos live in a private digital album that Mom and Dad can keep adding to. Guests can tap and view the collection with a simple NFC touch.",
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
      "A cute, custom wrapped popcorn kit paired with a gourmet treat. Designed to match your shower and give guests a little thank you they can actually enjoy.",
    pricePerGuest: 10,
  },
  {
    id: "lilRoots",
    icon: Sprout,
    name: "Lil Roots",
    tagline: "A little something is growing.",
    description:
      "A planted seedling in a beautifully wrapped keepsake jar, paired with a gourmet treat. A tiny reminder of the little person everyone came to celebrate.",
    pricePerGuest: 15,
    photoUrl: lilRootsPhoto,
  },
];
