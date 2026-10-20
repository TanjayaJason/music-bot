import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-20b"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(20).default(8),
  PUBLIC_CHAT_REQUESTS_PER_HOUR: z.coerce.number().int().min(1).max(100).default(20),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Konfigurasi lingkungan belum lengkap: ${missing}`);
  }
  return parsed.data;
}

export function hasPublicSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
