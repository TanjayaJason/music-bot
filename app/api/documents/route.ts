import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id,title,category,description,document_type,document_date,effective_date,effective_until,revision_label,created_at,updated_at")
      .eq("publication_status", "published")
      .eq("extraction_status", "completed")
      .order("document_date", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ documents: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memuat dokumen." },
      { status: 503 },
    );
  }
}
