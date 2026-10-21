import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { openGroundedAnswerStream, UNKNOWN_ANSWER } from "@/lib/ai/groq";
import { getEnv } from "@/lib/config";
import { retrievePublishedContext } from "@/lib/rag/retrieve";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { chatSchema } from "@/lib/validation/schemas";

export const maxDuration = 45;

function toCitation(source: Awaited<ReturnType<typeof retrievePublishedContext>>[number]) {
  return {
    documentId: source.documentId,
    documentTitle: source.documentTitle,
    pageStart: source.pageStart,
    pageEnd: source.pageEnd,
    sectionTitle: source.sectionTitle,
    excerpt: source.excerpt,
    score: source.score,
  };
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
    const answerStream = await openGroundedAnswerStream(parsed.data.message, sources);
    const citations = sources.map(toCitation);
    let sessionId = parsed.data.sessionId;

    if (!sessionId) {
      const { data: session } = await supabase.from("chat_sessions").insert({}).select("id").single();
      sessionId = session?.id;
    }
    if (sessionId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: parsed.data.message,
      });
    }

    const encoder = new TextEncoder();
    const send = (controller: ReadableStreamDefaultController<Uint8Array>, event: object) => {
      controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
    };

    let canceled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let answer = "";
        try {
          send(controller, { type: "meta", sessionId });
          for await (const delta of answerStream) {
            answer += delta;
            send(controller, { type: "delta", content: delta });
          }

          if (!answer.trim()) {
            answer = UNKNOWN_ANSWER;
            send(controller, { type: "delta", content: answer });
          }

          let messageId: string | undefined;
          if (sessionId) {
            const { data: saved } = await supabase
              .from("chat_messages")
              .insert({
                session_id: sessionId,
                role: "assistant",
                content: answer,
                citations,
              })
              .select("id")
              .single();
            messageId = saved?.id;
          }

          if (!canceled) {
            send(controller, { type: "done", messageId, citations });
            controller.close();
          }
        } catch (error) {
          if (canceled) return;
          const message = error instanceof Error ? error.message : "Layanan chat tidak tersedia.";
          send(controller, { type: "error", message });
          controller.close();
        }
      },
      async cancel() {
        canceled = true;
        await answerStream.return(undefined);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Layanan chat tidak tersedia.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
