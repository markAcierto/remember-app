/**
 * Pure feed/streak helpers — no React, no Supabase, so they can be unit
 * tested directly with tsx (see lib/feed.test.ts) and reused by both the
 * server data layer (lib/supabase/feed.ts) and the client components.
 */

/** Local calendar day key, e.g. "2026-08-26". Streaks are day-based. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Consecutive-day streak ending today (or yesterday, if the user has not
 * checked in today yet). Dates may be ISO strings or Date objects; invalid
 * entries are ignored. Returns 0 for an empty list.
 */
export function computeStreak(
  dates: Array<string | Date>,
  now: string | Date = new Date()
): number {
  const days = new Set<string>();
  for (const entry of dates) {
    const date = typeof entry === "string" ? new Date(entry) : entry;
    if (Number.isNaN(date.getTime())) continue;
    days.add(dayKey(date));
  }
  if (days.size === 0) return 0;

  const anchor = new Date(
    typeof now === "string" ? new Date(now) : now
  );
  if (Number.isNaN(anchor.getTime())) return 0;

  let cursor = new Date(anchor);
  // A streak that ended yesterday is still "alive" for today.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Compact relative time label: "now", "5m", "2h", "3d", "Aug 12", or
 * "Aug 12, 2025" for older posts. Invalid input returns "".
 */
export function relativeTime(
  input: string | Date,
  now: string | Date = new Date()
): string {
  const then = typeof input === "string" ? new Date(input) : input;
  const nowMs =
    typeof now === "string" ? new Date(now).getTime() : now.getTime();
  const thenMs = then.getTime();
  if (Number.isNaN(thenMs) || Number.isNaN(nowMs)) return "";

  const diffMs = nowMs - thenMs;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const month = then.toLocaleDateString("en-US", { month: "short" });
  const sameYear = then.getFullYear() === new Date(nowMs).getFullYear();
  return sameYear
    ? `${month} ${then.getDate()}`
    : `${month} ${then.getDate()}, ${then.getFullYear()}`;
}
