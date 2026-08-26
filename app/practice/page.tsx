import { PracticePanel } from "./PracticePanel";

import { getAuthUser } from "@/lib/supabase/auth";
import { computeStreak } from "@/lib/feed";
import {
  getDailyLogDates,
  getUserRecentCheckins,
  type RecentCheckin,
} from "@/lib/supabase/feed";
import { createClient } from "@/lib/supabase/server";

export default async function PracticePage() {
  const supabase = createClient();
  const user = await getAuthUser();

  let recentCheckins: RecentCheckin[] = [];
  let streak: number | null = null;

  if (user) {
    const [logs, checkins] = await Promise.all([
      getDailyLogDates(supabase, user.id),
      getUserRecentCheckins(supabase, user.id),
    ]);
    streak = logs ? computeStreak(logs) : null;
    recentCheckins = checkins ?? [];
  }

  return (
    <PracticePanel
      recentCheckins={recentCheckins}
      streak={streak}
    />
  );
}
