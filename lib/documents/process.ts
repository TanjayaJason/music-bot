import "server-only";

import { createDocumentEmbedding } from "@/lib/ai/embeddings";
import { PdfParseV2Extractor } from "@/lib/pdf";
import { chunkSections } from "@/lib/rag/chunk";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function processDocument(documentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("id, storage_path, publication_status")
    .eq("id", documentId)
    .single();
  if (error || !document) throw new Error("Dokumen tidak ditemukan.");

  await supabase.from("documents").update({ extraction_status: "processing", extraction_error: null }).eq("id", documentId);
  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.storage_path);
    if (downloadError || !file) throw new Error(`Unduhan PDF gagal: ${downloadError?.message}`);
    const result = await new PdfParseV2Extractor().extract(new Uint8Array(await file.arrayBuffer()));
    if (result.requiresOcr) throw new Error("OCR diperlukan; PDF ini tidak memiliki teks yang cukup untuk diindeks.");

    const chunks = chunkSections(result.sections);
    const embeddings: number[][] = [];
    for (const chunk of chunks) embeddings.push(await createDocumentEmbedding(chunk.content));

    const { error: transactionError } = await supabase.rpc("replace_document_index", {
      target_document_id: documentId,
      section_payload: result.sections,
      chunk_payload: chunks.map((chunk, index) => ({ ...chunk, embedding: embeddings[index] })),
    });
    if (transactionError) throw new Error(transactionError.message);

    await supabase
      .from("documents")
      .update({
        extraction_status: "ready_for_review",
        extraction_warnings: result.warnings,
        page_count: result.pageCount,
      })
      .eq("id", documentId);
    return result;
  } catch (processingError) {
    const message = processingError instanceof Error ? processingError.message : "Pemrosesan gagal.";
    await supabase
      .from("documents")
      .update({ extraction_status: "failed", extraction_error: message })
      .eq("id", documentId);
    throw processingError;
  }
}
