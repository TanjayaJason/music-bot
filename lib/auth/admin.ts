import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile?.role === "admin" ? user : null;
}

export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
