import Link from "next/link";

import { SignOutButton } from "../components/SignOutButton";

import { PILLARS } from "@/lib/mock-data";
import {
  COURSES,
  getCourseProgress,
  getCourseStatus,
  type CourseStatus,
} from "@/lib/progress";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserCompletedLessonIds } from "@/lib/supabase/progress";
import { computeStreak } from "@/lib/feed";
import { getDailyLogDates, getUserBreakthroughCount } from "@/lib/supabase/feed";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const user = await getAuthUser();

  // Per-user progress only. A new or signed-out user gets an empty set,
  // which means exactly one course (the first) is available.
  let completedLessonIds = new Set<string>();
  if (user) {
    completedLessonIds = await getUserCompletedLessonIds(supabase, user.id);
  }

  const statusFor = (slug: string): CourseStatus => {
    const index = COURSES.findIndex((c) => c.slug === slug);
    return getCourseStatus(index, COURSES, completedLessonIds);
  };

  const completedPillars = COURSES.filter(
    (c) => statusFor(c.slug) === "completed"
  ).length;

  const inProgressPillars = COURSES.filter(
    (c) => statusFor(c.slug) === "available"
  ).length;

  // Live stats require a signed-in user with Supabase configured.
  let streak: number | null = null;
  let breakthroughs: number | null = null;
  if (user) {
    const [logDates, breakthroughCount] = await Promise.all([
      getDailyLogDates(supabase, user.id),
      getUserBreakthroughCount(supabase, user.id),
    ]);
    streak = logDates ? computeStreak(logDates) : null;
    breakthroughs = breakthroughCount;
  }

  const email = user?.email ?? "not signed in";
  const initials = (user?.email ?? "k")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="px-4 pt-6 pb-28">
      <header className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink/10 font-display text-2xl text-brand-pink">
          {initials}
        </div>
        <h1 className="font-display text-xl text-brand-black">
          {user ? "Your profile" : "Kyria"}
        </h1>
        <p className="font-sans text-sm text-black/40">{email}</p>
        <span className="pill mt-2">
          {user ? "Member since 2026" : "Guest view"}
        </span>
      </header>

      <section className="mb-8 grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">
            {completedPillars}
          </p>
          <p className="mt-1 font-sans text-[10px] text-black/40">
            Completed
          </p>
        </div>
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">
            {inProgressPillars}
          </p>
          <p className="mt-1 font-sans text-[10px] text-black/40">
            In progress
          </p>
        </div>
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">
            {breakthroughs === null ? "—" : breakthroughs}
          </p>
          <p className="mt-1 font-sans text-[10px] text-black/40">
            Breakthroughs
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-black/40">
          Current streak
        </h2>
        <div className="card flex items-center gap-4">
          <div className="font-display text-2xl text-brand-pink">
            {streak !== null ? streak : "—"}
          </div>
          <div>
            <p className="font-display text-lg text-brand-black">
              {streak === null
                ? "Not tracked yet"
                : `${streak} day${streak === 1 ? "" : "s"}`}
            </p>
            <p className="font-sans text-xs text-black/40">
              {user
                ? "Daily check-ins in a row"
                : "Sign in and log check-ins to build a streak"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-black/40">
          Pillar progress
        </h2>
        <div className="flex flex-col gap-2">
          {PILLARS.map((pillar) => {
            const status = statusFor(pillar.slug);
            const course = COURSES.find((c) => c.slug === pillar.slug);
            const progress = course
              ? getCourseProgress(course, completedLessonIds)
              : {
                  completed: 0,
                  total: pillar.lessonTitles.length,
                  percentage: 0,
                };
            const pct = progress.percentage;

            const itemClasses =
              "flex items-center gap-3 rounded-xl border border-black/10 p-3";

            const itemContent = (
              <>
                <span className="w-4 font-sans text-xs font-medium text-black/60">
                  {pillar.letter}
                </span>
                <div className="flex-1">
                  <p className="mb-1 truncate font-sans text-xs font-medium">
                    {pillar.name}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-brand-pink transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right font-sans text-[10px] text-black/40">
                  {pct}%
                </span>
              </>
            );

            if (status === "locked") {
              return (
                <div
                  key={pillar.slug}
                  aria-disabled="true"
                  className={`${itemClasses} opacity-50`}
                >
                  {itemContent}
                </div>
              );
            }

            return (
              <Link key={pillar.slug} href={`/courses/${pillar.slug}`} className={itemClasses}>
                {itemContent}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-black/40">
          Account
        </h2>
        <div className="card flex flex-col divide-y divide-black/5">
          {user ? (
            <div className="flex items-center justify-between py-3 font-sans text-sm">
              <span>Signed in as {user.email}</span>
              <span className="text-black/30">✓</span>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center justify-between py-3 font-sans text-sm"
            >
              <span>Sign in to sync your stats</span>
              <span className="text-black/30">→</span>
            </Link>
          )}
        </div>
      </section>

      {user ? (
        <SignOutButton />
      ) : (
        <Link href="/auth/login" className="btn-primary block text-center">
          Sign in
        </Link>
      )}

      <p className="mt-6 text-center font-sans text-xs text-black/30">
        Kyria v0.1 — made with care for the Kyria Mailman brand.
      </p>
    </main>
  );
}
