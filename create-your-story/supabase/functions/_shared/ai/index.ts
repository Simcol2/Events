import type { LlmProvider } from "./llm.ts";
import type { ImageProvider } from "./image.ts";
import { StubLlmProvider } from "./llm.stub.ts";
import { StubImageProvider } from "./image.stub.ts";

// The only place calling code touches. Swapping to a real provider later is
// one new class + an env var — zero changes to any Edge Function that calls
// getLlmProvider()/getImageProvider().
export function getLlmProvider(): LlmProvider {
  const provider = Deno.env.get("LLM_PROVIDER") ?? "stub";
  switch (provider) {
    case "stub":
      return new StubLlmProvider();
    // case "openai": return new OpenAiLlmProvider(Deno.env.get("OPENAI_API_KEY")!);
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}

export function getImageProvider(): ImageProvider {
  const provider = Deno.env.get("IMAGE_PROVIDER") ?? "stub";
  switch (provider) {
    case "stub":
      return new StubImageProvider();
    // case "stability": return new StabilityImageProvider(Deno.env.get("STABILITY_API_KEY")!);
    default:
      throw new Error(`Unknown IMAGE_PROVIDER: ${provider}`);
  }
}
