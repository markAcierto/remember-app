import type { SupabaseClient } from "@supabase/supabase-js";

import { relativeTime } from "@/lib/feed";

/**
 * Server-side feed data access.
 *
 * Every function returns `null` (or empty data) when Supabase is not
 * configured or the schema has not been applied yet, so pages can fall back
 * to the bundled mock data (lib/mock-data.ts) and the app still works
 * end-to-end before the first database setup.
 */

export type FeedPostView = {
  id: string;
  author: string;
  text: string;
  type: "breakthrough" | "checkin";
  pillarSlug: string | null;
  /** Already formatted with relativeTime(). */
  time: string;
  likeCount: number;
  likedByMe: boolean;
};

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function asFeedType(value: unknown): "breakthrough" | "checkin" {
  return value === "breakthrough" ? "breakthrough" : "checkin";
}

/**
 * Latest community posts with like counts, newest first.
 * `userId` (the signed-in user, if any) drives `likedByMe`.
 */
export async function getFeedPosts(
  supabase: SupabaseClient,
  opts: { limit?: number; userId?: string | null } = {}
): Promise<FeedPostView[] | null> {
  if (!isConfigured()) return null;

  const { data, error } = await supabase
    .from("feed_posts")
    .select("id, display_name, type, pillar_slug, text, created_at")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);
  if (error || !data) return null;
  if (data.length === 0) return [];

  const ids = data.map((row) => String(row.id));
  const { data: likes } = await supabase
    .from("feed_likes")
    .select("post_id, user_id")
    .in("post_id", ids);

  const counts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes ?? []) {
    const key = String(like.post_id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (opts.userId && like.user_id === opts.userId) likedByMe.add(key);
  }

  return data.map((row) => {
    const id = String(row.id);
    return {
      id,
      author: typeof row.display_name === "string" && row.display_name
        ? row.display_name
        : "Kyrian",
      text: String(row.text ?? ""),
      type: asFeedType(row.type),
      pillarSlug:
        typeof row.pillar_slug === "string" ? row.pillar_slug : null,
      time: relativeTime(String(row.created_at)),
      likeCount: counts.get(id) ?? 0,
      likedByMe: likedByMe.has(id),
    };
  });
}

/**
 * Distinct calendar days on which the user has a daily_log entry, newest
 * first. Feeds the profile streak (lib/feed.ts computeStreak).
 */
export async function getDailyLogDates(
  supabase: SupabaseClient,
  userId: string
): Promise<string[] | null> {
  if (!isConfigured()) return null;

  const { data, error } = await supabase
    .from("daily_logs")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return null;

  return data.map((row) => String(row.created_at));
}

export type RecentCheckin = {
  id: string;
  text: string;
  pillarSlug: string | null;
  time: string;
};

/**
 * The user's own most recent check-in posts (practice page recap), newest
 * first.
 */
export async function getUserRecentCheckins(
  supabase: SupabaseClient,
  userId: string,
  limit = 3
): Promise<RecentCheckin[] | null> {
  if (!isConfigured()) return null;

  const { data, error } = await supabase
    .from("feed_posts")
    .select("id, text, pillar_slug, created_at")
    .eq("user_id", userId)
    .eq("type", "checkin")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return null;

  return data.map((row) => ({
    id: String(row.id),
    text: String(row.text ?? ""),
    pillarSlug:
      typeof row.pillar_slug === "string" ? row.pillar_slug : null,
    time: relativeTime(String(row.created_at)),
  }));
}

/** Count of the user's breakthrough posts (profile stat). */
export async function getUserBreakthroughCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number | null> {
  if (!isConfigured()) return null;

  const { count, error } = await supabase
    .from("feed_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "breakthrough");
  if (error || count === null) return null;

  return count;
}
