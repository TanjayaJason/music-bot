export function looksLikeHeading(line: string) {
  const value = line.trim();
  if (value.length < 3 || value.length > 140) return false;
  if (/^(bab|bagian|pasal|lampiran)\s+[ivxlcdm\d]+/i.test(value)) return true;
  if (/^\d+(\.\d+)*[.)]?\s+[A-ZÀ-Ö]/.test(value)) return true;
  const letters = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
  return letters.length > 4 && value === value.toLocaleUpperCase("id-ID");
}

export function splitPageIntoSections(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const groups: Array<{ title: string | null; text: string }> = [];
  let title: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.length) groups.push({ title, text: buffer.join("\n") });
    buffer = [];
  };
  for (const line of lines) {
    if (looksLikeHeading(line)) {
      flush();
      title = line;
    } else buffer.push(line);
  }
  flush();
  return groups.length ? groups : [{ title: null, text: text.trim() }];
}
