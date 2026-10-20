import "server-only";

import { getEnv } from "@/lib/config";

export async function createEmbedding(text: string): Promise<number[]> {
  const env = getEnv();
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_EMBEDDING_MODEL)}:embedContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${env.GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text: text.slice(0, 12_000) }] },
          outputDimensionality: 768,
          taskType: "RETRIEVAL_QUERY",
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 429) throw new Error("Kuota embedding Gemini sedang habis.");
      throw new Error(`Embedding gagal (${response.status}): ${detail.slice(0, 200)}`);
    }
    const result = (await response.json()) as { embedding?: { values?: number[] } };
    if (result.embedding?.values?.length !== 768) {
      throw new Error("Dimensi embedding tidak sesuai (diharapkan 768).");
    }
    return result.embedding.values;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createDocumentEmbedding(text: string): Promise<number[]> {
  const env = getEnv();
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY belum dikonfigurasi.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_EMBEDDING_MODEL)}:embedContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${env.GEMINI_EMBEDDING_MODEL}`,
        content: { parts: [{ text: text.slice(0, 12_000) }] },
        outputDimensionality: 768,
        taskType: "RETRIEVAL_DOCUMENT",
      }),
    },
  );
  if (!response.ok) throw new Error(`Embedding dokumen gagal (${response.status}).`);
  const result = (await response.json()) as { embedding?: { values?: number[] } };
  if (result.embedding?.values?.length !== 768) throw new Error("Dimensi embedding tidak valid.");
  return result.embedding.values;
}
