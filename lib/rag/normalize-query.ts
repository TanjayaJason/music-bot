const MONTHS: Record<string, string> = {
  januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
  juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
};

const LITURGICAL_ALIASES: Record<string, string> = {
  mzm: "mazmur tanggapan",
  persembahan: "persiapan persembahan",
  komuni: "nyanyian komuni",
  pembuka: "nyanyian pembuka",
  penutup: "nyanyian penutup",
  adven: "masa adven",
};

export interface NormalizedQuery {
  normalized: string;
  date: string | null;
  terms: string[];
}

export function normalizeQuery(input: string): NormalizedQuery {
  let normalized = input.toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();
  for (const [alias, replacement] of Object.entries(LITURGICAL_ALIASES)) {
    normalized = normalized.replace(new RegExp(`\\b${alias}\\b`, "gi"), replacement);
  }

  let date: string | null = null;
  const dateMatch = normalized.match(/\b(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(20\d{2})\b/);
  if (dateMatch) {
    date = `${dateMatch[3]}-${MONTHS[dateMatch[2]]}-${dateMatch[1].padStart(2, "0")}`;
    normalized += ` ${date}`;
  }

  const terms = normalized
    .split(/[^\p{L}\p{N}-]+/u)
    .filter((word) => word.length > 2)
    .slice(0, 16);
  return { normalized, date, terms };
}
