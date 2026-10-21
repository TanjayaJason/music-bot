import type { RetrievalResult } from "@/types/database";

export const MAX_CONTEXT_SOURCES = 4;
export const MAX_CONTEXT_TOKENS = 3_200;
const CONSERVATIVE_CHARACTERS_PER_TOKEN = 3.5;

export function estimateTokenCount(text: string) {
  return Math.ceil(text.length / CONSERVATIVE_CHARACTERS_PER_TOKEN);
}

function sourceHeading(source: RetrievalResult) {
  return `[S] ${source.documentTitle}, halaman ${source.pageStart}${source.pageEnd !== source.pageStart ? `–${source.pageEnd}` : ""}${source.sectionTitle ? `, bagian ${source.sectionTitle}` : ""}\n`;
}

function truncateAtWord(text: string, maximumCharacters: number) {
  if (text.length <= maximumCharacters) return text;
  const candidate = text.slice(0, maximumCharacters + 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > maximumCharacters * 0.75 ? boundary : maximumCharacters).trimEnd()}…`;
}

export function fitSourcesToContextBudget(
  sources: RetrievalResult[],
  tokenBudget = MAX_CONTEXT_TOKENS,
  sourceLimit = MAX_CONTEXT_SOURCES,
) {
  let remainingTokens = tokenBudget;
  const selected: RetrievalResult[] = [];

  for (const source of sources.slice(0, sourceLimit)) {
    const headingTokens = estimateTokenCount(sourceHeading(source));
    const availableContentTokens = remainingTokens - headingTokens;
    if (availableContentTokens < 80) break;

    const content = truncateAtWord(
      source.content,
      Math.floor(availableContentTokens * CONSERVATIVE_CHARACTERS_PER_TOKEN),
    );
    const usedTokens = headingTokens + estimateTokenCount(content);
    selected.push({ ...source, content });
    remainingTokens -= usedTokens;
  }

  return selected;
}
