import type { ExtractedSection } from "@/types/database";

export interface ChunkDraft {
  sectionIndex: number;
  pageStart: number;
  pageEnd: number;
  content: string;
  metadata: Record<string, unknown>;
}

export function chunkSections(sections: ExtractedSection[], maxChars = 3200): ChunkDraft[] {
  const chunks: ChunkDraft[] = [];
  sections.forEach((section, sectionIndex) => {
    if (section.type === "table" || section.structuredContent) {
      chunks.push({
        sectionIndex,
        pageStart: section.pageStart,
        pageEnd: section.pageEnd,
        content: [section.title, section.text].filter(Boolean).join("\n\n"),
        metadata: { sectionType: section.type, structured: section.structuredContent },
      });
      return;
    }

    const paragraphs = section.text.split(/\n\s*\n/).filter(Boolean);
    let buffer = section.title ? `${section.title}\n\n` : "";
    for (const paragraph of paragraphs) {
      if (buffer.length + paragraph.length > maxChars && buffer.trim()) {
        chunks.push({
          sectionIndex,
          pageStart: section.pageStart,
          pageEnd: section.pageEnd,
          content: buffer.trim(),
          metadata: { sectionType: section.type },
        });
        buffer = section.title ? `${section.title}\n\n${paragraph}` : paragraph;
      } else buffer += `${buffer ? "\n\n" : ""}${paragraph}`;
    }
    if (buffer.trim()) {
      chunks.push({
        sectionIndex,
        pageStart: section.pageStart,
        pageEnd: section.pageEnd,
        content: buffer.trim(),
        metadata: { sectionType: section.type },
      });
    }
  });
  return chunks;
}
