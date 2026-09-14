import {
  PLAY_CONNECT_IDS,
  CREATE_KEEP_IDS,
  ENGAGEMENT_POOL_IDS,
  NEUTRAL_POOL_IDS,
  TUTU_PLAY_CONNECT_IDS,
  TUTU_CREATE_KEEP_IDS,
} from "./packageContent";

// Single source of truth for how each event type prices and shapes its
// experience: starting price, experience pool(s), and the builder's step
// order. pages/PackageBuilder.jsx renders generically off `steps` instead
// of hardcoding a baby-shower-shaped flow, and pages/Home.jsx /
// pages/Experiences.jsx read `startingPrice` for the active event type
// instead of a single flat price constant.
//
// Two step shapes exist:
// - Baby Shower: two 3-pick pools (Play & Connect, Create & Keep), no
//   separate playful step (the games are already inside Play & Connect).
// - Every other event type: one 4-pick pool plus a separate "Want
//   Something Playful?" step for optional games.

const SERVICE_AND_DISPLAY_STEPS = [
  { type: "guestGift", id: "guestGift", label: "Guest Gift" },
  { type: "addons", id: "addons", label: "Make It Yours" },
  { type: "service", id: "service", label: "How Involved Do You Want to Be?" },
  { type: "display", id: "display", label: "The Memory Display" },
];

function neutralFlowSteps() {
  return [
    {
      type: "pool",
      id: "experiences",
      label: "Choose Your Experiences",
      supportingCopy: "Choose 4 ways your guests can be part of the story and leave something meaningful behind.",
      poolIds: NEUTRAL_POOL_IDS,
      chooseCount: 4,
    },
    { type: "guestGift", id: "guestGift", label: "Guest Gift" },
    { type: "addons", id: "addons", label: "Make It Yours" },
    { type: "playful", id: "playful", label: "Want Something Playful?" },
    { type: "service", id: "service", label: "How Involved Do You Want to Be?" },
    { type: "display", id: "display", label: "The Memory Display" },
  ];
}

export const EVENT_CONFIGS = {
  babyShower: {
    startingPrice: 1295,
    guestGiftDefaultId: "readyToPop",
    // Drives BabyShowerBuilderOverview's hero copy. The component's own
    // headline is still hardcoded JSX (it needs a styled line break the
    // plain description string here can't carry), but the eyebrow and
    // description come from here, so this stays the one place to edit them.
    overview: {
      eyebrow: "BUILD YOUR BABY SHOWER EXPERIENCE",
      headline: "Four experiences. One guest gift. Built around your people.",
      description:
        "Start with four interactive experiences: choose 2 ways to Play & Connect and 2 ways to Create & Keep. Then choose your included guest gift and personalize the celebration with displays, extras, or full-service styling.",
    },
    // A dedicated array (not the shared SERVICE_AND_DISPLAY_STEPS) so its
    // step order, labels, and copy can differ from tutuTwirlsTea's without
    // touching that event type's builder.
    steps: [
      {
        type: "pool",
        id: "playConnect",
        label: "Play & Connect",
        customerTitle: "What should your guests do?",
        supportingCopy: "Choose 2 experiences that get your guests talking, laughing, competing, and connecting.",
        includedLabel: "Choose 2. Included in your starting price.",
        poolIds: PLAY_CONNECT_IDS,
        chooseCount: 2,
      },
      {
        type: "pool",
        id: "createKeep",
        label: "Create & Keep",
        customerTitle: "What should you keep from the day?",
        supportingCopy:
          "Choose 2 experiences that turn your guests' words, photos, and memories into something meaningful to keep.",
        includedLabel: "Choose 2. Included in your starting price.",
        poolIds: CREATE_KEEP_IDS,
        chooseCount: 2,
      },
      {
        type: "guestGift",
        id: "guestGift",
        label: "Guest Gift",
        customerTitle: "Choose a little something for your guests",
        supportingCopy: "Ready to Pop is included. Choose it at no additional cost or upgrade to another guest gift.",
      },
      {
        type: "addons",
        id: "addons",
        label: "Make It Yours",
        customerTitle: "Want to add a little more?",
        supportingCopy: "These are completely optional. Your experience already works without them.",
      },
      {
        type: "display",
        id: "display",
        label: "Your Display",
        customerTitle: "How should everything look?",
        supportingCopy: "Choose whether you want to add a styled display moment to your experience.",
      },
      {
        type: "service",
        id: "service",
        label: "Setup & Styling",
        customerTitle: "How involved do you want to be?",
        supportingCopy: "Pick everything up and set it up yourself, or have us handle the styling for you.",
      },
    ],
  },
  engagement: {
    startingPrice: 995,
    guestGiftDefaultId: "readyToPop",
    steps: [
      {
        type: "pool",
        id: "experiences",
        label: "Choose Your Experiences",
        supportingCopy: "Choose 4 ways your guests can be part of the story and leave something meaningful behind.",
        poolIds: ENGAGEMENT_POOL_IDS,
        chooseCount: 4,
      },
      { type: "guestGift", id: "guestGift", label: "Guest Gift" },
      { type: "addons", id: "addons", label: "Make It Yours" },
      { type: "playful", id: "playful", label: "Want Something Playful?" },
      { type: "service", id: "service", label: "How Involved Do You Want to Be?" },
      { type: "display", id: "display", label: "The Memory Display" },
    ],
  },
  birthday: {
    startingPrice: 895,
    guestGiftDefaultId: "readyToPop",
    steps: neutralFlowSteps(),
  },
  tutuTwirlsTea: {
    startingPrice: 495,
    guestGiftDefaultId: "readyToPop",
    steps: [
      {
        type: "pool",
        id: "playConnect",
        label: "Play & Connect",
        supportingCopy: "Choose 2 experiences that get your guests moving, laughing, and connecting.",
        poolIds: TUTU_PLAY_CONNECT_IDS,
        chooseCount: 2,
      },
      {
        type: "pool",
        id: "createKeep",
        label: "Create & Keep",
        supportingCopy: "Now choose 2 ways your guests can create something meaningful to keep.",
        poolIds: TUTU_CREATE_KEEP_IDS,
        chooseCount: 2,
      },
      ...SERVICE_AND_DISPLAY_STEPS,
    ],
  },
  holiday: {
    startingPrice: 895,
    guestGiftDefaultId: "readyToPop",
    steps: neutralFlowSteps(),
  },
  specialMoment: {
    startingPrice: 895,
    guestGiftDefaultId: "readyToPop",
    steps: neutralFlowSteps(),
  },
};

export function getEventConfig(eventTypeId) {
  return EVENT_CONFIGS[eventTypeId] || EVENT_CONFIGS.babyShower;
}
