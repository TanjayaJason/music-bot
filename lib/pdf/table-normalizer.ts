export interface NormalizedTable {
  headers: string[];
  rows: Array<Record<string, string>>;
  markdown: string;
  ambiguous: boolean;
}

function uniqueHeaders(row: string[]) {
  const seen = new Map<string, number>();
  return row.map((cell, index) => {
    const base = cell.trim() || `kolom_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

export function normalizeTable(grid: string[][]): NormalizedTable {
  const cleaned = grid.map((row) => row.map((cell) => cell.trim()));
  const width = Math.max(0, ...cleaned.map((row) => row.length));
  const padded = cleaned.map((row) => [...row, ...Array(width - row.length).fill("")]);
  const headers = uniqueHeaders(padded[0] ?? []);
  const inherited = Array(width).fill("") as string[];
  let ambiguous = width < 2 || headers.every((header) => /^kolom_/.test(header));
  const rows = padded.slice(1).map((row) => {
    const record: Record<string, string> = {};
    row.forEach((cell, index) => {
      if (cell) inherited[index] = cell;
      record[headers[index]] = cell || inherited[index] || "";
    });
    if (row.every((cell) => !cell)) ambiguous = true;
    return record;
  });
  const markdownRows = [headers, ...padded.slice(1)].map(
    (row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`,
  );
  markdownRows.splice(1, 0, `| ${headers.map(() => "---").join(" | ")} |`);
  return { headers, rows, markdown: markdownRows.join("\n"), ambiguous };
}
