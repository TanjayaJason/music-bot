import "server-only";

import { createEmbedding } from "@/lib/ai/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fitSourcesToContextBudget } from "@/lib/rag/context-budget";
import { normalizeQuery } from "@/lib/rag/normalize-query";
import type { RetrievalResult } from "@/types/database";

export async function retrievePublishedContext(query: string): Promise<RetrievalResult[]> {
  const normalized = normalizeQuery(query);
  const embedding = await createEmbedding(normalized.normalized);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("hybrid_search_published_chunks", {
    query_text: normalized.normalized,
    query_embedding: embedding,
    match_count: 7,
    filter_date: normalized.date,
  });
  if (error) throw new Error(`Pencarian basis pengetahuan gagal: ${error.message}`);

  const rankedSources = ((data ?? []) as Array<Record<string, unknown>>)
    .filter((row) => Number(row.combined_score ?? 0) >= 0.12)
    .map((row) => ({
      documentId: String(row.document_id),
      documentTitle: String(row.document_title),
      pageStart: Number(row.page_start),
      pageEnd: Number(row.page_end),
      sectionTitle: row.section_title ? String(row.section_title) : null,
      excerpt: String(row.content).slice(0, 360),
      content: String(row.content).slice(0, 5000),
      score: Number(row.combined_score),
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    }));

  return fitSourcesToContextBudget(rankedSources);
}
