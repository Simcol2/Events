import type { IllustrationRequest, IllustrationResult, ImageProvider } from "./image.ts";
import { encodeSolidColorPng } from "./pngEncoder.ts";

// A handful of pastel placeholder colors, picked by pageNumber % N, so the
// final book/PDF shows visibly distinct art per page with zero external
// calls or cost. Swap for a real ImageProvider (DALL-E, Stable Diffusion,
// etc.) via IMAGE_PROVIDER — nothing calling this interface needs to change.
const PASTEL_PALETTE: Array<[number, number, number]> = [
  [255, 214, 224], // blush pink
  [214, 235, 255], // soft sky blue
  [223, 255, 219], // mint green
  [255, 244, 214], // buttercream yellow
  [230, 220, 255], // lavender
  [255, 226, 204], // peach
];

export class StubImageProvider implements ImageProvider {
  async generateIllustration(req: IllustrationRequest): Promise<IllustrationResult> {
    const color = PASTEL_PALETTE[req.pageNumber % PASTEL_PALETTE.length];
    const imageBytes = await encodeSolidColorPng(800, 600, color);
    return { imageBytes, mimeType: "image/png", raw: { provider: "stub", color } };
  }
}
