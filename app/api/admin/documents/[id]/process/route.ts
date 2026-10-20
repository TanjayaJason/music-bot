import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { processDocument } from "@/lib/documents/process";

export const maxDuration = 60;

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const result = await processDocument(id);
    return NextResponse.json({ pageCount: result.pageCount, warnings: result.warnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pemrosesan gagal.";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
