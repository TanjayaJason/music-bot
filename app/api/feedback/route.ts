import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { feedbackSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = feedbackSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Masukan tidak valid." }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("feedback").insert({
    message_id: parsed.data.messageId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });
  if (error) return NextResponse.json({ error: "Masukan gagal disimpan." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
