import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateGroundedAnswer } from "@/lib/ai/groq";
import { getEnv } from "@/lib/config";
import { retrievePublishedContext } from "@/lib/rag/retrieve";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { chatSchema } from "@/lib/validation/schemas";

export const maxDuration = 45;

function toCitation(source: Awaited<ReturnType<typeof retrievePublishedContext>>[number]) {
  return { documentId: source.documentId, documentTitle: source.documentTitle,
    pageStart: source.pageStart, pageEnd: source.pageEnd, sectionTitle: source.sectionTitle,
    excerpt: source.excerpt, score: source.score };
}

export async function POST(request: Request) {
  try {
    const parsed = chatSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const requestHeaders = await headers();
    const clientIp = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const clientKey = createHash("sha256").update(clientIp).digest("hex");
    const supabase = createSupabaseAdminClient();
    const env = getEnv();
    const { data: allowed, error: rateError } = await supabase.rpc("check_public_rate_limit", {
      client_key_input: clientKey,
      hourly_limit: env.PUBLIC_CHAT_REQUESTS_PER_HOUR,
    });
    if (rateError) throw new Error("Pemeriksaan batas penggunaan gagal.");
    if (!allowed) {
      return NextResponse.json(
        { error: "Batas pertanyaan per jam telah tercapai. Silakan coba lagi nanti." },
        { status: 429 },
      );
    }

    const sources = await retrievePublishedContext(parsed.data.message);
    const answer = await generateGroundedAnswer(parsed.data.message, sources);
    let sessionId = parsed.data.sessionId;
    if (!sessionId) {
      const { data: session } = await supabase.from("chat_sessions").insert({}).select("id").single();
      sessionId = session?.id;
    }
    let messageId: string | undefined;
    if (sessionId) {
      await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: parsed.data.message });
      const { data: saved } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: answer,
          citations: sources.map(toCitation),
        })
        .select("id")
        .single();
      messageId = saved?.id;
    }
    return NextResponse.json({
      answer,
      sessionId,
      messageId,
      citations: sources.map(toCitation),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Layanan chat tidak tersedia.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
