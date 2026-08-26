import Link from "next/link";
import { notFound } from "next/navigation";
import { PILLARS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { getUserCompletedLessonIds, getCourseProgress, getCourseStatus } from "@/lib/supabase/progress";
import { getAuthUser } from "@/lib/supabase/auth";
import { COURSES } from "@/lib/progress";
import LessonList from "@/app/components/courses/LessonList";

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const pillar = PILLARS.find((p) => p.slug === slug);

  if (!pillar) {
    notFound();
  }

  const supabase = await createClient();
  const user = await getAuthUser();

  // Default progress if not logged in or no data found
  let completedLessonIds = new Set<string>();
  let courseStatus: "locked" | "available" | "completed" = "locked";
  let progress = { completed: 0, total: pillar.lessonTitles.length, percentage: 0 };

  if (user) {
    completedLessonIds = await getUserCompletedLessonIds(
      supabase,
      user.id
    );
    
    const courseIndex = COURSES.findIndex((c) => c.slug === slug);
    courseStatus = getCourseStatus(courseIndex, COURSES, completedLessonIds);
    
    const course = COURSES.find((c) => c.slug === slug);
    if (course) {
      progress = getCourseProgress(course, completedLessonIds);
    }
  } else {
    // If not logged in, first course is available, others locked
    courseStatus = slug === "recognize" ? "available" : "locked";
  }

  if (courseStatus === "locked") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-2xl mb-4">
          🔒
        </div>
        <h2 className="font-display text-xl text-brand-black mb-2">
          Course Locked
        </h2>
        <p className="text-sm text-black/50 font-sans max-w-xs mb-6">
          Complete the previous pillars in your path to unlock this course.
        </p>
        <Link
          href="/courses"
          className="btn-primary inline-flex items-center gap-1"
        >
          Back to your path
        </Link>
      </div>
    );
  }

  return (
    <main className="px-4 pt-6">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm font-sans text-black/50 mb-4"
      >
        <span aria-hidden>←</span> Back to your path
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-brand-pink text-white flex items-center justify-center font-sans font-semibold">
            {pillar.letter}
          </div>
          <div>
            <h1 className="font-display text-xl text-brand-black leading-tight">
              {pillar.name}
            </h1>
            <p className="text-sm text-black/50 font-sans mt-0.5">
              {pillar.tagline}
            </p>
          </div>
        </div>
        {progress.completed < pillar.lessonTitles.length && (
          <span className="pill inline-block mt-3">
            Lesson {progress.completed + 1} of {pillar.lessonTitles.length}
          </span>
        )}
      </header>

      {/* Lessons */}
      <LessonList
        courseSlug={slug}
        completedLessonIds={Array.from(completedLessonIds)}
        currentProgress={progress}
        lessonTitles={pillar.lessonTitles}
      />

      {/* Affirmation */}
      <section className="mb-7">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Affirmation
        </h2>
        <blockquote className="card border-l-4 border-l-brand-pink bg-brand-pink/5 font-display text-base text-brand-black italic leading-relaxed">
          &quot;{pillar.affirmation}&quot;
        </blockquote>
      </section>

      {/* Daily check-in question */}
      <section>
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Daily check-in
        </h2>
        <div className="card">
          <p className="text-sm font-sans text-black/70 leading-relaxed">
            {pillar.checkinQuestion}
          </p>
          <Link
            href="/practice"
            className="btn-primary inline-flex items-center gap-1 mt-4"
          >
            Log your response →
          </Link>
        </div>
      </section>


    </main>
  );
}