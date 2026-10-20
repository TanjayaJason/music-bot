import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const supabase = createSupabaseAdminClient();
    const { data: document } = await supabase
      .from("documents")
      .select("extraction_status")
      .eq("id", id)
      .single();
    if (!document || document.extraction_status !== "ready_for_review") {
      return NextResponse.json({ error: "Dokumen belum siap ditinjau." }, { status: 409 });
    }
    const { count } = await supabase
      .from("document_sections")
      .select("id", { count: "exact", head: true })
      .eq("document_id", id)
      .eq("review_status", "needs_review");
    if (count) return NextResponse.json({ error: "Masih ada bagian yang perlu ditinjau." }, { status: 409 });
    const { error } = await supabase
      .from("documents")
      .update({ publication_status: "published", extraction_status: "completed", published_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Publikasi gagal." }, { status: 500 });
  }
}
