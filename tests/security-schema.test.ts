import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe,expect,it } from "vitest";
const sql=readFileSync(resolve("supabase/migrations/202610200001_initial_schema.sql"),"utf8");
describe("keamanan skema",()=>{it("mengaktifkan RLS pada seluruh data sensitif",()=>{for(const table of ["profiles","documents","document_sections","document_chunks","chat_sessions","chat_messages","feedback","rate_limits"])expect(sql).toContain(`alter table public.${table} enable row level security`)});it("pencarian publik hanya memakai dokumen terbit dan indeks lengkap",()=>{expect(sql).toContain("d.publication_status = 'published'");expect(sql).toContain("d.extraction_status = 'completed'");expect(sql).toContain("replacement.supersedes_document_id = d.id")});it("fungsi istimewa tidak dapat dipanggil anon",()=>{expect(sql).toMatch(/revoke all on function public\.hybrid_search_published_chunks[\s\S]*from public,anon,authenticated/)})});
