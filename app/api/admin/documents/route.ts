import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { safeFilename } from "@/lib/utils";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { documentMetadataSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ documents: data });
  } catch {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = documentMetadataSchema.safeParse(body.metadata);
    if (!parsed.success || typeof body.filename !== "string" || !/\.pdf$/i.test(body.filename)) {
      return NextResponse.json({ error: "Metadata atau nama PDF tidak valid." }, { status: 400 });
    }
    const supabase = createSupabaseAdminClient();
    const documentId = crypto.randomUUID();
    const storagePath = `${documentId}/${safeFilename(body.filename)}`;
    const { data: upload, error: uploadError } = await supabase.storage
      .from("documents")
      .createSignedUploadUrl(storagePath);
    if (uploadError) throw uploadError;
    const { error: insertError } = await supabase.from("documents").insert({
      id: documentId,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      document_type: parsed.data.documentType,
      document_date: parsed.data.documentDate,
      effective_date: parsed.data.effectiveDate,
      effective_until: parsed.data.effectiveUntil,
      revision_label: parsed.data.revisionLabel,
      authority_rank: parsed.data.authorityRank,
      original_filename: body.filename,
      storage_path: storagePath,
      uploaded_by: admin.id,
    });
    if (insertError) throw insertError;
    return NextResponse.json({ id: documentId, storagePath, uploadToken: upload.token }, { status: 201 });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json(
      { error: unauthorized ? "Tidak diizinkan." : "Dokumen gagal dibuat." },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
