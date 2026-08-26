/**
 * Course / lesson progression logic for the REMEMBER path.
 *
 * Pure, framework-free functions (no Supabase, no React) so they can be
 * unit tested. The source of truth for the 8 courses and their lessons is
 * PILLARS in lib/mock-data.ts — typed Course/Lesson objects are derived
 * from it here, so reordering lessons in the mock data still produces
 * stable lesson ids.
 */
import { PILLARS } from "./mock-data";

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  order: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  letter: string;
  tagline: string;
  affirmation: string;
  checkinQuestion: string;
  lessons: Lesson[];
};

export type CourseStatus = "locked" | "available" | "completed";

export type CourseProgress = {
  completed: number;
  total: number;
  percentage: number;
};

/**
 * Deterministic lesson id from pillar slug + lesson title.
 * Stable even if lessons are reordered in the mock data.
 */
export function lessonIdFor(pillarSlug: string, title: string): string {
  let h = 5381;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) + h + title.charCodeAt(i)) >>> 0;
  }
  return `${pillarSlug}-${h.toString(16)}`;
}

/** The 8 courses (REM → B → E → M → B → E → R) derived from mock data. */
export const COURSES: Course[] = PILLARS.map((p) => ({
  id: p.slug,
  slug: p.slug,
  title: p.name,
  letter: p.letter,
  tagline: p.tagline,
  affirmation: p.affirmation,
  checkinQuestion: p.checkinQuestion,
  lessons: p.lessonTitles.map((title, order) => ({
    id: lessonIdFor(p.slug, title),
    courseId: p.slug,
    title,
    order,
  })),
}));

export function getCourseIndex(slug: string): number {
  return COURSES.findIndex((c) => c.slug === slug);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES[getCourseIndex(slug)];
}

/**
 * A course is complete only when every one of its lessons is in the
 * completed set. A course with zero lessons counts as complete (the
 * reference logic uses Array.every, which is true for empty arrays) — this
 * does not incorrectly unlock anything because completion of an empty
 * course only ever helps its own successor, and all 8 real courses have
 * lessons.
 */
export function isCourseComplete(
  course: Course,
  completedLessonIds: ReadonlySet<string>
): boolean {
  return course.lessons.every((l) => completedLessonIds.has(l.id));
}

export function getCourseStatus(
  courseIndex: number,
  courses: Course[],
  completedLessonIds: ReadonlySet<string>
): CourseStatus {
  if (courseIndex < 0 || courseIndex >= courses.length) return "locked";
  const course = courses[courseIndex];

  if (isCourseComplete(course, completedLessonIds)) {
    return "completed";
  }

  if (courseIndex === 0) {
    return "available";
  }

  const previous = courses[courseIndex - 1];
  return isCourseComplete(previous, completedLessonIds)
    ? "available"
    : "locked";
}

export function getCourseProgress(
  course: Course,
  completedLessonIds: ReadonlySet<string>
): CourseProgress {
  const completed = course.lessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;
  const total = course.lessons.length;
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * The course the user is "at": the first course that is not yet completed,
 * or the last course when everything is completed. Used to redirect
 * attempts to open locked courses.
 */
export function getLatestAvailableCourseIndex(
  courses: Course[],
  completedLessonIds: ReadonlySet<string>
): number {
  for (let i = 0; i < courses.length; i++) {
    if (!isCourseComplete(courses[i], completedLessonIds)) return i;
  }
  return Math.max(0, courses.length - 1);
}

/** Access decision for a course (course cards, direct URLs, API). */
export function canAccessCourse(
  courseIndex: number,
  courses: Course[],
  completedLessonIds: ReadonlySet<string>
): boolean {
  return getCourseStatus(courseIndex, courses, completedLessonIds) !== "locked";
}

/** True when the lesson id belongs to the given course. */
export function lessonBelongsToCourse(
  course: Course,
  lessonId: string
): boolean {
  return course.lessons.some((l) => l.id === lessonId);
}

type LegacyCourseProgressRow = {
  pillarSlug: string;
  status: string;
  lessonIndex: number;
};

/**
 * Merges per-lesson rows and legacy course_progress rows into a single set
 * of completed lesson ids. A Set naturally deduplicates duplicate records.
 *
 * Legacy mapping (course_progress rows from the pre-lesson era):
 *  - "completed"            -> all lessons of that course
 *  - "in-progress"          -> the first `lesson_index` lessons (0-based
 *                              lesson index of the lesson in progress, so
 *                              lesson_index = number of completed lessons)
 *  - "locked"               -> nothing
 */
export function deriveCompletedLessonIds(options: {
  lessonRows: { lessonId: string }[];
  legacyRows: LegacyCourseProgressRow[];
  courses?: Course[];
}): Set<string> {
  const courses = options.courses ?? COURSES;
  const ids = new Set<string>();

  for (const row of options.lessonRows) {
    if (row.lessonId) ids.add(row.lessonId);
  }

  for (const row of options.legacyRows) {
    const course = courses.find((c) => c.slug === row.pillarSlug);
    if (!course) continue; // unknown pillar -> ignore

    if (row.status === "completed") {
      for (const l of course.lessons) ids.add(l.id);
    } else if (row.status === "in-progress") {
      const n = Math.max(0, Math.min(row.lessonIndex, course.lessons.length));
      for (let i = 0; i < n; i++) ids.add(course.lessons[i].id);
    }
  }

  return ids;
}
