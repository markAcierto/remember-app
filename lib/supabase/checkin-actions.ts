"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export type LogCheckinResult =
  | { ok: true; mode: "remote"; feedPosted: boolean }
  | { ok: true; mode: "demo" }
  | { ok: false; code: "invalid" | "db-error"; message: string };

/**
 * Saves a practice check-in.
 *
 * - Supabase configured + signed in: writes a daily_log row and a
 *   "checkin" feed post, then revalidates the feed pages.
 * - Supabase not configured: returns demo mode so the app stays fully
 *   usable (README: "works out of the box, syncs when configured").
 * - Configured + not signed in: same demo-mode fallback, so a guest is
 *   never blocked.
 * - Configured + signed in + tables missing: surfaces a clear
 *   "run supabase/schema.sql" error instead of faking a save.
 */
export async function logCheckinAction(
  pillarSlug: string | null,
  question: string,
  response: string
): Promise<LogCheckinResult> {
  const trimmed = response.trim();
  if (!trimmed) {
    return { ok: false, code: "invalid", message: "Write a short answer first." };
  }

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!configured) {
    return { ok: true, mode: "demo" };
  }

  const supabase = createClient();
  const user = await getAuthUser();
  if (!user) {
    return { ok: true, mode: "demo" };
  }

  let displayName =
    typeof user.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]
      : "Kyrian";
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile && typeof profile.display_name === "string" && profile.display_name) {
    displayName = profile.display_name;
  }

  const { error: logError } = await supabase.from("daily_logs").insert({
    user_id: user.id,
    pillar_slug: pillarSlug,
    question: question.trim() || null,
    response: trimmed,
  });
  if (logError) {
    return {
      ok: false,
      code: "db-error",
      message:
        "Could not save your check-in. If you just created the project, run supabase/schema.sql in the Supabase SQL editor, then try again.",
    };
  }

  const { error: feedError } = await supabase.from("feed_posts").insert({
    user_id: user.id,
    display_name: displayName,
    type: "checkin",
    pillar_slug: pillarSlug,
    text: trimmed,
  });

  revalidatePath("/");
  revalidatePath("/community");

  return { ok: true, mode: "remote", feedPosted: feedError === null };
}
