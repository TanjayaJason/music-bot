import { describe,expect,it } from "vitest";
import { normalizeQuery } from "@/lib/rag/normalize-query";
describe("normalisasi pertanyaan",()=>{it("menangkap tanggal Indonesia secara presisi",()=>{const result=normalizeQuery("Apa lagu pembuka untuk 8 November 2026?");expect(result.date).toBe("2026-11-08");expect(result.normalized).toContain("nyanyian pembuka")});it("memperluas singkatan liturgis",()=>{expect(normalizeQuery("Aturan Mzm dan komuni").normalized).toContain("mazmur tanggapan");expect(normalizeQuery("Aturan Mzm dan komuni").normalized).toContain("nyanyian komuni")})});
