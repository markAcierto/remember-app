"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "./auth";
import { createClient } from "./server";
import {
  completeLessonForUser,
  type CompleteLessonOutcome,
} from "./progress";

export type { CompleteLessonOutcome };

/**
 * Server action: complete a lesson for the authenticated user.
 *
 * The Supabase session is resolved from the request cookies on the server,
 * and course access is re-checked against the database here — so client
 * state, localStorage, query params, or route params cannot be used to skip
 * courses.
 */
export async function completeLessonAction(
  courseSlug: string,
  lessonId: string
): Promise<CompleteLessonOutcome> {
  const user = await getAuthUser();
  if (!user) {
    return {
      ok: false,
      code: "not-authenticated",
      message: "Sign in to save your progress.",
    };
  }

  if (
    typeof courseSlug !== "string" ||
    !courseSlug.trim() ||
    typeof lessonId !== "string" ||
    !lessonId.trim()
  ) {
    return { ok: false, code: "invalid-lesson", message: "Invalid lesson." };
  }

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return {
      ok: false,
      code: "db-error",
      message: "Supabase is not configured on the server.",
    };
  }

  const result = await completeLessonForUser(
    supabase,
    user.id,
    courseSlug,
    lessonId
  );

  if (result.ok) {
    revalidatePath("/courses", "page");
    revalidatePath(`/courses/${courseSlug}`, "page");
    revalidatePath("/", "page");
    revalidatePath("/profile", "page");
  }

  return result;
}
