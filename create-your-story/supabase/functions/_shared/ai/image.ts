export interface IllustrationRequest {
  pageText: string;
  styleReference: Record<string, unknown>;
  pageNumber: number;
  eventId: string;
}

export interface IllustrationResult {
  imageBytes: Uint8Array;
  mimeType: string;
  raw: unknown;
}

export interface ImageProvider {
  generateIllustration(req: IllustrationRequest): Promise<IllustrationResult>;
}
