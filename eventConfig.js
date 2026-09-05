import {
  PLAY_CONNECT_IDS,
  CREATE_KEEP_IDS,
  ENGAGEMENT_POOL_IDS,
  NEUTRAL_POOL_IDS,
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
    steps: [
      {
        type: "pool",
        id: "playConnect",
        label: "Play & Connect",
        supportingCopy: "Choose 3 experiences that get your guests talking, laughing, competing, and connecting.",
        poolIds: PLAY_CONNECT_IDS,
        chooseCount: 3,
      },
      {
        type: "pool",
        id: "createKeep",
        label: "Create & Keep",
        supportingCopy: "Now choose 3 ways your guests can create something meaningful for you to keep.",
        poolIds: CREATE_KEEP_IDS,
        chooseCount: 3,
      },
      ...SERVICE_AND_DISPLAY_STEPS,
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
  milestoneBirthday: {
    startingPrice: 895,
    guestGiftDefaultId: "readyToPop",
    steps: neutralFlowSteps(),
  },
  birthday: {
    startingPrice: 895,
    guestGiftDefaultId: "readyToPop",
    steps: neutralFlowSteps(),
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
