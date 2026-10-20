import type { ExtractedSection } from "@/types/database";

export interface PdfExtractionResult {
  pageCount: number;
  sections: ExtractedSection[];
  warnings: string[];
  requiresOcr: boolean;
  metadata: Record<string, unknown>;
}

export interface PdfExtractor {
  extract(data: Uint8Array): Promise<PdfExtractionResult>;
}
