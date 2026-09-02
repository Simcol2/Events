import type {
  FinalNarrativeRequest,
  FinalNarrativeResult,
  LlmProvider,
  SkeletonPageDraft,
  StorySkeletonRequest,
  StorySkeletonResult,
  WeaveTransitionRequest,
  WeaveTransitionResult,
} from "./llm.ts";

// Fixed semantic slot roles, in narrative order, per the product spec's
// pro-tip: pre-assign prompts to specific story beats consistently rather
// than scattering them randomly, so every event's book has the same shape.
const GUEST_SLOT_ROLES = [
  {
    slotOrder: 1,
    slotLabel: (honoree: string) =>
      `Finish this sentence for the story: "Along the way, ${honoree} learned to ___."`,
    template: (honoree: string) => `Along the way, ${honoree} learned to {{GUEST}}.`,
    acceptsImage: false,
  },
  {
    slotOrder: 2,
    slotLabel: () =>
      `Finish this sentence: "When the path grew uncertain, a friend showed them ___."`,
    template: () => `When the path grew uncertain, a friend showed them {{GUEST}}.`,
    acceptsImage: false,
  },
  {
    slotOrder: 3,
    slotLabel: (honoree: string) => `What is your wish for ${honoree}'s future? (a sentence or a doodle both work)`,
    template: (honoree: string) => `And as the story drew to a close, everyone gathered to wish that {{GUEST}} for ${honoree}.`,
    acceptsImage: true,
  },
];

function honoreeOrDefault(honoreeName?: string) {
  return honoreeName?.trim() || "our little hero";
}

function buildNarrationLine(index: number, total: number, theme: string, characterPrompt: string, honoree: string) {
  if (index === 0) {
    return `Once upon a time, in a world of ${theme}, ${characterPrompt} set off on a journey unlike any other.`;
  }
  if (index === total - 1) {
    return `And from that day on, ${honoree} carried the magic of ${theme} in their heart, forever.`;
  }
  return `The journey continued, each step revealing more of the wonder that ${theme} had to offer.`;
}

export class StubLlmProvider implements LlmProvider {
  async generateSkeleton(req: StorySkeletonRequest): Promise<StorySkeletonResult> {
    const total = Math.max(req.totalPages, GUEST_SLOT_ROLES.length + 2);
    const honoree = honoreeOrDefault(req.honoreeName);

    // Spread the 3 fixed guest slots across the middle of the book (roughly
    // 30%, 55%, 80% through), narration everywhere else, so position is
    // deterministic and consistent across every event.
    const guestPageNumbers = GUEST_SLOT_ROLES.map((_, i) =>
      Math.min(total - 1, Math.max(2, Math.round(total * [0.3, 0.55, 0.8][i])))
    );

    const pages: SkeletonPageDraft[] = [];
    let guestIdx = 0;
    for (let i = 0; i < total; i++) {
      const pageNumber = i + 1;
      if (guestIdx < guestPageNumbers.length && pageNumber === guestPageNumbers[guestIdx]) {
        const role = GUEST_SLOT_ROLES[guestIdx];
        pages.push({
          pageNumber,
          slotType: "guest_slot",
          textTemplate: role.template(honoree),
          slotLabel: role.slotLabel(honoree),
          slotOrder: role.slotOrder,
          acceptsImage: role.acceptsImage,
        });
        guestIdx++;
      } else {
        pages.push({
          pageNumber,
          slotType: "narration",
          textTemplate: buildNarrationLine(i, total, req.theme, req.characterPrompt, honoree),
        });
      }
    }

    return {
      pages,
      styleReference: {
        artStyle: req.artStyle,
        characterPrompt: req.characterPrompt,
        theme: req.theme,
      },
      raw: { provider: "stub", generatedAt: new Date().toISOString() },
    };
  }

  async weaveTransition(req: WeaveTransitionRequest): Promise<WeaveTransitionResult> {
    const fragment = req.guestText.trim().replace(/[.!?]+$/, "");
    const renderedText = req.pageTextTemplate.replace("{{GUEST}}", fragment || "something wonderful");
    return { renderedText, raw: { provider: "stub" } };
  }

  async polishFinalNarrative(req: FinalNarrativeRequest): Promise<FinalNarrativeResult> {
    // Deliberately a visibly different pass from the live-draft phrasing, so
    // "rough cut" vs. "masterpiece" reads as a real distinction in a demo:
    // a closing-sentence flourish plus consistent capitalization.
    const pages = req.skeletonPages.map((p) => {
      const contribution = req.approvedContributions.find((c) => c.pageNumber === p.pageNumber);
      let text = p.textTemplate;
      if (p.slotType === "guest_slot") {
        const fragment = (contribution?.text ?? "something wonderful").trim().replace(/[.!?]+$/, "");
        text = p.textTemplate.replace("{{GUEST}}", fragment);
      }
      const polished = text.charAt(0).toUpperCase() + text.slice(1);
      return { pageNumber: p.pageNumber, polishedText: polished };
    });

    return { pages, raw: { provider: "stub" } };
  }
}
