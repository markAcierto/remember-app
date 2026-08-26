"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export type ToggleLikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; code: "not-authenticated" | "db-error"; message: string };

/**
 * Toggles the signed-in user's like on a feed post and returns the fresh
 * like count. Requires a real Supabase project (likes are shared state, so
 * there is no demo-mode fallback).
 */
export async function toggleLikeAction(
  postId: string
): Promise<ToggleLikeResult> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!configured) {
    return {
      ok: false,
      code: "db-error",
      message: "Likes need the Supabase database connected.",
    };
  }

  const supabase = createClient();
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, code: "not-authenticated", message: "Sign in to like posts." };
  }

  const { data: existing, error: findError } = await supabase
    .from("feed_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (findError) {
    return { ok: false, code: "db-error", message: "Could not update your like." };
  }

  let liked: boolean;
  if (existing) {
    const { error } = await supabase
      .from("feed_likes")
      .delete()
      .eq("id", String(existing.id));
    if (error) {
      return { ok: false, code: "db-error", message: "Could not update your like." };
    }
    liked = false;
  } else {
    const { error } = await supabase
      .from("feed_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) {
      return { ok: false, code: "db-error", message: "Could not update your like." };
    }
    liked = true;
  }

  const { count } = await supabase
    .from("feed_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  revalidatePath("/");
  revalidatePath("/community");

  return { ok: true, liked, count: count ?? 0 };
}
