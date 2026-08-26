import Link from "next/link";
import { PILLARS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { getUserCompletedLessonIds, getCourseStatus, getCourseProgress } from "@/lib/supabase/progress";
import { COURSES } from "@/lib/progress";

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-brand-pink text-white",
  available: "bg-brand-pink/10 text-brand-pink border border-brand-pink/30",
  locked: "bg-black/5 text-black/30",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let completedLessonIds = new Set<string>();
  if (user) {
    completedLessonIds = await getUserCompletedLessonIds(supabase, user.id);
  }

  return (
    <main className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-brand-black">Your path</h1>
        <p className="text-sm text-black/50 font-sans mt-1">
          The REMEMBER framework — 8 pillars
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {PILLARS.map((pillar) => {
          const course = COURSES.find((c) => c.slug === pillar.slug);
          if (!course) return null;

          const courseIndex = COURSES.findIndex((c) => c.slug === pillar.slug);
          const status = getCourseStatus(courseIndex, COURSES, completedLessonIds);
          const progress = getCourseProgress(course, completedLessonIds);

          const label =
            status === "completed"
              ? "Completed"
              : status === "locked"
              ? "Locked"
              : `Lesson ${progress.completed + 1} of ${pillar.lessonTitles.length}`;

          const cardClasses = `flex items-center gap-4 p-4 rounded-3xl border transition-all ${
            status === "available"
              ? "border-brand-pink/40 bg-brand-pink/5 ring-1 ring-brand-pink/20"
              : status === "completed"
              ? "border-brand-pink/20 bg-brand-pink/5"
              : "border-black/10 bg-black/[0.02]"
          }`;

          const cardContent = (
            <>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-sans font-bold flex-shrink-0 shadow-sm ${STATUS_STYLE[status]}`}
              >
                {status === "locked" ? "🔒" : pillar.letter}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-sans font-semibold truncate ${status === "locked" ? "text-black/40" : "text-brand-black"}`}>
                  {pillar.name}
                </p>
                <p className="text-xs text-black/40 font-sans mt-0.5">
                  {label}
                </p>
              </div>
              {status === "available" && (
                <span className="text-brand-pink font-sans font-medium" aria-hidden>
                  →
                </span>
              )}
              {status === "completed" && (
                <span className="text-brand-pink font-sans" aria-hidden>
                  ✓
                </span>
              )}
            </>
          );

          if (status === "locked") {
            return (
              <div
                key={pillar.slug}
                aria-disabled="true"
                className={`${cardClasses} opacity-50`}
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={pillar.slug}
              href={`/courses/${pillar.slug}`}
              className={`${cardClasses} hover:border-brand-pink/60 active:scale-[0.98]`}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-black/40 font-sans mt-6 text-center">
        Complete a pillar to unlock the next one.
      </p>
    </main>
  );
}