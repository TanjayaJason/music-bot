export type PublicationStatus = "draft" | "published" | "archived" | "superseded";
export type ExtractionStatus =
  | "pending"
  | "processing"
  | "ready_for_review"
  | "completed"
  | "failed";

export interface Citation {
  documentId: string;
  documentTitle: string;
  pageStart: number;
  pageEnd: number;
  sectionTitle?: string | null;
  excerpt: string;
  score?: number;
}

export interface DocumentSummary {
  id: string;
  title: string;
  category: string;
  description: string | null;
  document_type: "table" | "long_form" | "mixed";
  document_date: string | null;
  effective_date: string | null;
  effective_until: string | null;
  revision_label: string | null;
  storage_path: string;
  extraction_status: ExtractionStatus;
  publication_status: PublicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ExtractedSection {
  pageStart: number;
  pageEnd: number;
  title: string | null;
  type: "heading" | "paragraph" | "table" | "mixed";
  text: string;
  structuredContent: Record<string, unknown> | null;
  needsReview: boolean;
  reviewNote?: string;
}

export interface RetrievalResult extends Citation {
  content: string;
  metadata: Record<string, unknown>;
}
