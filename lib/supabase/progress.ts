import type { SupabaseClient } from "@supabase/supabase-js";
import {
  COURSES,
  canAccessCourse,
  deriveCompletedLessonIds,
  getCourseProgress,
  getCourseStatus,
  getLatestAvailableCourseIndex,
  isCourseComplete,
  type Course,
  type Lesson,
} from "../progress";

/**
 * Server-side course progress data access.
 *
 * Every function takes the Supabase client as a parameter so the logic can
 * be unit tested with a fake client, and so it can be swapped for any
 * other persistence backend later without touching the pages.
 *
 * Access control is enforced here (not in the UI): a lesson can only be
 * completed for a course that is "available" or already "completed" for
 * the given user, based on the user's own saved rows.
 */

export type CompleteLessonOutcome =
  | {
      ok: true;
      alreadyCompleted: boolean;
      completed: number;
      total: number;
      percentage: number;
      courseCompleted: boolean;
      nextCourseSlug: string | null;
    }
  | {
      ok: false;
      code:
        | "not-found"
        | "invalid-lesson"
        | "locked"
        | "db-error"
        | "not-authenticated";
      message: string;
      latestAvailableSlug?: string;
    };

/**
 * Loads the user's set of completed lesson ids, merging the per-lesson
 * table with any legacy course_progress rows. Errors on either table are
 * tolerated (treated as empty) so a missing table degrades to "new user"
 * instead of crashing the page.
 */
export async function getUserCompletedLessonIds(
  supabase: SupabaseClient,
  userId: string,
  courses: Course[] = COURSES
): Promise<Set<string>> {
  const [lessonRes, legacyRes] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId),
    supabase
      .from("course_progress")
      .select("pillar_slug, status, lesson_index")
      .eq("user_id", userId),
  ]);

  const lessonRows = ((lessonRes.data ?? []) as { lesson_id: string }[]).map(
    (r) => ({ lessonId: r.lesson_id })
  );
  const legacyRows = (
    (legacyRes.data ?? []) as {
      pillar_slug: string;
      status: string;
      lesson_index: number;
    }[]
  ).map((r) => ({
    pillarSlug: r.pillar_slug,
    status: r.status,
    lessonIndex: typeof r.lesson_index === "number" ? r.lesson_index : 0,
  }));

  return deriveCompletedLessonIds({ lessonRows, legacyRows, courses });
}

export function findLesson(
  courseSlug: string,
  lessonId: string,
  courses: Course[] = COURSES
): { course: Course; lesson: Lesson } | null {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return null;
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, lesson };
}

/**
 * Records lesson completion for the authenticated user.
 *
 * Guarantees:
 *  - idempotent: completing an already-completed lesson is a no-op
 *    (no duplicate row, thanks to the (user_id, lesson_id) primary key and
 *    upsert with ignoreDuplicates);
 *  - no course skipping: the course must be available/completed for THIS
 *    user before a lesson in it can be completed;
 *  - a lesson id from another course is rejected.
 */
export async function completeLessonForUser(
  supabase: SupabaseClient,
  userId: string,
  courseSlug: string,
  lessonId: string,
  courses: Course[] = COURSES
): Promise<CompleteLessonOutcome> {
  if (!courseSlug || !lessonId) {
    return { ok: false, code: "invalid-lesson", message: "Invalid lesson." };
  }

  const index = courses.findIndex((c) => c.slug === courseSlug);
  if (index === -1) {
    return {
      ok: false,
      code: "not-found",
      message: "This course does not exist.",
    };
  }

  const course = courses[index];
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return {
      ok: false,
      code: "invalid-lesson",
      message: "That lesson does not belong to this course.",
    };
  }

  const completedIds = await getUserCompletedLessonIds(
    supabase,
    userId,
    courses
  );

  const progress = getCourseProgress(course, completedIds);
  const courseCompleted = isCourseComplete(course, completedIds);
  const nextIndex = index + 1;
  const nextCourseSlug =
    courseCompleted && nextIndex < courses.length
      ? courses[nextIndex].slug
      : null;

  // Already completed -> idempotent success, nothing is written.
  if (completedIds.has(lesson.id)) {
    return {
      ok: true,
      alreadyCompleted: true,
      ...progress,
      courseCompleted,
      nextCourseSlug,
    };
  }

  // Server-side access control: no skipping locked courses.
  if (!canAccessCourse(index, courses, completedIds)) {
    const latest = getLatestAvailableCourseIndex(courses, completedIds);
    return {
      ok: false,
      code: "locked",
      message: `Finish "${courses[
        Math.max(0, index - 1)
      ].title}" before starting "${course.title}".`,
      latestAvailableSlug: courses[latest].slug,
    };
  }

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lesson.id,
        pillar_slug: course.slug,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );

  if (error) {
    const missingTable =
      /42P01|undefined_table|relation "public\.lesson_progress" does not exist/i.test(
        error.message ?? ""
      );
    return {
      ok: false,
      code: "db-error",
      message: missingTable
        ? "Progress tracking is not set up yet. Run supabase/schema.sql in your Supabase project, then try again."
        : "Could not save progress. Please try again.",
    };
  }

  const now = new Set(completedIds);
  now.add(lesson.id);
  const freshProgress = getCourseProgress(course, now);
  const freshCourseCompleted = isCourseComplete(course, now);
  const freshNext =
    freshCourseCompleted && nextIndex < courses.length
      ? courses[nextIndex].slug
      : null;

  return {
    ok: true,
    alreadyCompleted: false,
    ...freshProgress,
    courseCompleted: freshCourseCompleted,
    nextCourseSlug: freshNext,
  };
}

export { getCourseStatus, getCourseProgress };
