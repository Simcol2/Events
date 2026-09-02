export interface StorySkeletonRequest {
  theme: string;
  artStyle: string;
  characterPrompt: string;
  tone: string;
  honoreeName?: string;
  totalPages: number;
}

export interface SkeletonPageDraft {
  pageNumber: number;
  slotType: "narration" | "guest_slot";
  textTemplate: string; // narration text, or a template containing {{GUEST}}
  slotLabel?: string; // the prompt shown to guests (guest_slot only)
  slotOrder?: number; // fixed semantic role: 1=lesson, 2=kindness, 3=wish...
  acceptsImage?: boolean;
}

export interface StorySkeletonResult {
  pages: SkeletonPageDraft[];
  styleReference: Record<string, unknown>;
  raw: unknown;
}

export interface WeaveTransitionRequest {
  pageTextTemplate: string;
  guestText: string;
  guestName?: string;
  tone: string;
}

export interface WeaveTransitionResult {
  renderedText: string;
  raw: unknown;
}

export interface FinalNarrativeRequest {
  skeletonPages: SkeletonPageDraft[];
  approvedContributions: Array<{ pageNumber: number; text: string; guestName?: string }>;
  tone: string;
}

export interface FinalNarrativeResult {
  pages: Array<{ pageNumber: number; polishedText: string }>;
  raw: unknown;
}

export interface LlmProvider {
  generateSkeleton(req: StorySkeletonRequest): Promise<StorySkeletonResult>;

  /**
   * Called synchronously inside approve_contribution during a live event.
   * Must stay low-latency (the stub does instant string interpolation) — a
   * real implementation should use a small/cheap model or skip the LLM
   * entirely, since a host approving contributions in front of a room can't
   * tolerate a multi-second hang per click. Never call a slow/expensive model
   * from here; that belongs in polishFinalNarrative instead.
   */
  weaveTransition(req: WeaveTransitionRequest): Promise<WeaveTransitionResult>;

  /** Runs once, post-event, not latency-sensitive — safe to be slow/expensive. */
  polishFinalNarrative(req: FinalNarrativeRequest): Promise<FinalNarrativeResult>;
}
