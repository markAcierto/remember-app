/**
 * Focused tests for the pure course-status helpers in lib/progress.ts.
 *
 * The repo ships no test framework and the "test" task forbids adding
 * heavy dependencies, so this file is a small dependency-free runner:
 * `import { run } from "./progress.test"` from a `tsx`/`ts-node`/`node`
 * entry (or `npm test`) executes every assertion and prints a summary.
 *
 * The pure-logic tests use plain `Course`/`Lesson` objects and a
 * `completedLessonIds` Set — no React, no network. The per-user isolation
 * test drives `getUserCompletedLessonIds` with a fake Supabase client whose
 * tables contain rows for multiple users, so a missing user_id filter would
 * leak one user's progress into another's and fail the suite.
 */
import type { Course, CourseStatus } from "./progress";
import {
  COURSES,
  canAccessCourse,
  getCourseStatus,
  isCourseComplete,
} from "./progress";
import { getUserCompletedLessonIds } from "./supabase/progress";

/** Build a course with `n` deterministic lessons. */
function makeCourse(slug: string, n: number): Course {
  return {
    id: slug,
    slug,
    title: slug,
    letter: slug[0]?.toUpperCase() ?? "X",
    tagline: "",
    affirmation: "",
    checkinQuestion: "",
    lessons: Array.from({ length: n }, (_, order) => ({
      id: `${slug}-lesson-${order}`,
      courseId: slug,
      title: `Lesson ${order + 1}`,
      order,
    })),
  };
}

/** All lesson ids of the given courses, concatenated. */
function allLessonIds(...courses: Course[]): Set<string> {
  const ids = new Set<string>();
  for (const c of courses) for (const l of c.lessons) ids.add(l.id);
  return ids;
}

/**
 * Fake Supabase client emulating a real database: tables hold rows for every
 * user, and only an explicit `.eq(col, value)` filter narrows the result —
 * exactly like the real query builder. If the code under test forgets to
 * filter by `user_id`, rows from all users are returned and the isolation
 * tests fail.
 */
function makeFakeSupabase(
  tables: Record<string, Record<string, unknown>[]>
) {
  return {
    from(table: string) {
      const rows = tables[table] ?? [];
      return {
        select() {
          const filters: { col: string; value: unknown }[] = [];
          return {
            eq(col: string, value: unknown) {
              filters.push({ col, value });
              const data = rows.filter((row) =>
                filters.every((f) => row[f.col] === f.value)
              );
              return { data, error: null };
            },
          };
        },
      };
    },
  } as unknown as Parameters<typeof getUserCompletedLessonIds>[0];
}

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertEqual<T>(
  label: string,
  actual: T,
  expected: T
): void {
  if (actual === expected) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertStatus(
  label: string,
  actual: CourseStatus,
  expected: CourseStatus
): void {
  assertEqual(label, actual, expected);
}

/**
 * Run the full assertion suite. Returns a summary object; when called at
 * module top level (e.g. via `node --loader tsx lib/progress.test.ts` or an
 * `npm test` entry) it also prints the summary and sets process.exitCode.
 */
export async function run(): Promise<{ passed: number; failed: number }> {
  passed = 0;
  failed = 0;
  failures.length = 0;

  const empty = new Set<string>();
  const a = makeCourse("a", 2);
  const b = makeCourse("b", 2);
  const c = makeCourse("c", 2);
  const [a0, a1] = a.lessons.map((l) => l.id);
  const [b0, b1] = b.lessons.map((l) => l.id);
  const [c0, c1] = c.lessons.map((l) => l.id);
  const aComplete = new Set([a0, a1]);

  // isCourseComplete — the building block.
  assertEqual("isCourseComplete empty set on empty course", isCourseComplete({ ...a, lessons: [] }, empty), true);
  assertEqual("isCourseComplete empty set on full course", isCourseComplete(a, empty), false);
  assertEqual("isCourseComplete partial", isCourseComplete(a, new Set([a0])), false);
  assertEqual("isCourseComplete full", isCourseComplete(a, aComplete), true);

  // Single course (index 0) is always at least "available".
  assertStatus("course 0 with no progress -> available", getCourseStatus(0, [a], empty), "available");
  assertStatus("course 0 partial -> available (not completed)", getCourseStatus(0, [a], new Set([a0])), "available");
  assertStatus("course 0 complete -> completed", getCourseStatus(0, [a], aComplete), "completed");

  // Middle course unlocked only when the previous one is complete.
  assertStatus("course 1, previous locked -> locked", getCourseStatus(1, [a, b], empty), "locked");
  assertStatus("course 1, previous partial -> locked", getCourseStatus(1, [a, b], new Set([a0])), "locked");
  assertStatus("course 1, previous complete -> available", getCourseStatus(1, [a, b], aComplete), "available");
  assertStatus("course 1 complete (previous complete) -> completed", getCourseStatus(1, [a, b], allLessonIds(a, b)), "completed");

  // Out-of-bounds index never unlocks.
  assertStatus("negative index -> locked", getCourseStatus(-1, [a, b], allLessonIds(a, b)), "locked");
  assertStatus("index past end -> locked", getCourseStatus(99, [a, b], allLessonIds(a, b)), "locked");

  // Three-deep chain: c unlocked only when b is complete, regardless of a.
  assertStatus("course 2, only a complete -> locked (b not done)", getCourseStatus(2, [a, b, c], aComplete), "locked");
  assertStatus("course 2, a+b complete -> available", getCourseStatus(2, [a, b, c], allLessonIds(a, b)), "available");
  assertStatus("course 2 complete -> completed", getCourseStatus(2, [a, b, c], allLessonIds(a, b, c)), "completed");

  // A completed course stays completed even if a later course is incomplete.
  assertStatus("earlier course still completed when later is open", getCourseStatus(0, [a, b], aComplete), "completed");

  // --- Per-user isolation (real COURSES + fake Supabase client) ---------
  // User A has completed every lesson of courses 1 and 2 -> course 3 is
  // unlocked for A. User B is brand-new with zero rows -> course 1 only.
  // The shared fake tables hold A's rows, so a missing user_id filter would
  // leak them into B's read and fail these assertions.
  const userA = "user-a";
  const userB = "user-b";
  const aCompletedLessonIds = [COURSES[0], COURSES[1]].flatMap((c) =>
    c.lessons.map((l) => l.id)
  );
  const fakeSupabase = makeFakeSupabase({
    lesson_progress: aCompletedLessonIds.map((lessonId) => ({
      user_id: userA,
      lesson_id: lessonId,
      pillar_slug: COURSES[0].slug,
      completed_at: new Date().toISOString(),
    })),
    // Legacy row for A in a later course: must map to lessons and must NOT
    // leak into B (filtered by user_id like the lesson rows).
    course_progress: [
      {
        user_id: userA,
        pillar_slug: "express",
        status: "in-progress",
        lesson_index: 1,
      },
    ],
  });

  const idsA = await getUserCompletedLessonIds(fakeSupabase, userA);
  // 9 lesson rows (courses 1+2) + 1 legacy lesson (express lesson 0).
  assertEqual(
    "user A completed lesson count (9 lesson + 1 legacy)",
    idsA.size,
    aCompletedLessonIds.length + 1
  );
  assertStatus("user A course 1 completed", getCourseStatus(0, COURSES, idsA), "completed");
  assertStatus("user A course 2 completed", getCourseStatus(1, COURSES, idsA), "completed");
  assertStatus("user A course 3 available", getCourseStatus(2, COURSES, idsA), "available");
  assertEqual("user A can access course 3", canAccessCourse(2, COURSES, idsA), true);

  const idsB = await getUserCompletedLessonIds(fakeSupabase, userB);
  assertEqual("user B (new) has zero completed lessons", idsB.size, 0);
  assertStatus("user B course 1 available", getCourseStatus(0, COURSES, idsB), "available");
  assertStatus("user B course 2 locked", getCourseStatus(1, COURSES, idsB), "locked");
  assertStatus("user B course 3 locked", getCourseStatus(2, COURSES, idsB), "locked");
  assertEqual("user B cannot access course 2", canAccessCourse(1, COURSES, idsB), false);
  assertEqual("user B cannot access course 3", canAccessCourse(2, COURSES, idsB), false);

  const summary = { passed, failed };
  if (failures.length) {
    for (const f of failures) console.error(`  FAIL ${f}`);
  }
  console.log(`progress.test: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
  return summary;
}

// Execute when the module is run directly (top-level), not when imported.
// `import.meta.url` comparison is the standard ESM "is main" check and works
// under tsx/ts-node; under a bundler that inlines imports the guard is a
// no-op and importing this file does not auto-run the suite.
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url.endsWith("progress.test.ts")
) {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
