import "server-only";

import { splitPageIntoSections } from "@/lib/pdf/headings";
import { normalizeTable } from "@/lib/pdf/table-normalizer";
import type { PdfExtractionResult, PdfExtractor } from "@/lib/pdf/types";

export class PdfParseV2Extractor implements PdfExtractor {
  async extract(data: Uint8Array): Promise<PdfExtractionResult> {
    if (data.byteLength < 5 || new TextDecoder().decode(data.slice(0, 5)) !== "%PDF-") {
      throw new Error("Berkas tidak memiliki signature PDF yang valid.");
    }
    // Lazy import agar PDF.js tidak dimuat saat Next.js mengoleksi metadata route.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data, isEvalSupported: false, stopAtErrors: false });
    try {
      // PDF.js memindahkan kepemilikan ArrayBuffer ke worker pada pemuatan pertama.
      // Memanggil tiga operasi sekaligus sebelum dokumen selesai dimuat dapat
      // mencoba mentransfer buffer yang sama lebih dari sekali di Node.js 22.
      const info = await parser.getInfo();
      const textResult = await parser.getText({ cellSeparator: "\t", pageJoiner: "" });
      const tableResult = await parser.getTable();
      const warnings: string[] = [];
      const sections: PdfExtractionResult["sections"] = [];
      let textCharacterCount = 0;

      for (const page of textResult.pages) {
        const pageText = page.text.trim();
        textCharacterCount += pageText.replace(/\s/g, "").length;
        const tablePage = tableResult.pages.find((candidate) => candidate.num === page.num);
        const tables = tablePage?.tables ?? [];

        if (tables.length) {
          tables.forEach((grid, tableIndex) => {
            const normalized = normalizeTable(grid);
            sections.push({
              pageStart: page.num,
              pageEnd: page.num,
              title: `Tabel ${tableIndex + 1} — halaman ${page.num}`,
              type: "table",
              text: normalized.markdown,
              structuredContent: { headers: normalized.headers, rows: normalized.rows, raw: grid },
              needsReview: normalized.ambiguous,
              reviewNote: normalized.ambiguous
                ? "Struktur tabel ambigu; wajib diperiksa sebelum publikasi."
                : undefined,
            });
          });
        }

        if (pageText) {
          splitPageIntoSections(pageText).forEach((group) => {
            sections.push({
              pageStart: page.num,
              pageEnd: page.num,
              title: group.title,
              type: tables.length ? "mixed" : group.title ? "heading" : "paragraph",
              text: group.text,
              structuredContent: null,
              needsReview: false,
            });
          });
        }
      }

      const requiresOcr = textCharacterCount < Math.max(40, textResult.total * 20);
      if (requiresOcr) warnings.push("OCR diperlukan: PDF hampir tidak memiliki lapisan teks.");
      if (!tableResult.pages.some((page) => page.tables.length)) {
        warnings.push("Tidak ada tabel bergaris yang terdeteksi; periksa tabel tanpa garis secara manual.");
      }
      if (sections.some((section) => section.needsReview)) {
        warnings.push("Satu atau beberapa tabel perlu koreksi manusia sebelum publikasi.");
      }

      return {
        pageCount: textResult.total,
        sections,
        warnings,
        requiresOcr,
        metadata: {
          title: info.info?.Title ?? null,
          author: info.info?.Author ?? null,
          fingerprints: info.fingerprints ?? [],
        },
      };
    } finally {
      await parser.destroy();
    }
  }
}
