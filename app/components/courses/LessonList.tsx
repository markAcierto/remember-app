"use client";

import { useState } from "react";
import { completeLessonAction, type CompleteLessonOutcome } from "@/lib/supabase/lesson-actions";
import { COURSES } from "@/lib/progress";

interface LessonListProps {
  courseSlug: string;
  completedLessonIds: string[];
  currentProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  lessonTitles: string[];
}

export default function LessonList({
  courseSlug,
  completedLessonIds,
  currentProgress,
  lessonTitles,
}: LessonListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const course = COURSES.find((c) => c.slug === courseSlug);
  if (!course) return null;

  // Determine which lesson is the current one
  // The current lesson is the first one that is NOT completed
  const currentLessonIndex = course.lessons.findIndex(
    (l) => !completedLessonIds.includes(l.id)
  );

  const handleComplete = async (lessonId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const outcome = await completeLessonAction(courseSlug, lessonId);
      if (!outcome.ok) {
        setError(outcome.message);
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-7">
      <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
        Lessons
      </h2>
      <ol className="flex flex-col gap-2 list-none">
        {course.lessons.map((lesson, i) => {
          const isDone = completedLessonIds.includes(lesson.id);
          const isCurrent = i === currentLessonIndex;
          const isDisabled = !isCurrent && !isDone && currentLessonIndex !== -1;

          return (
            <li key={lesson.id}>
              <div
                onClick={() => isCurrent && !isLoading && handleComplete(lesson.id)}
                className={`card flex items-center gap-3 transition-colors ${
                  isCurrent ? "cursor-pointer border-brand-pink/40 bg-brand-pink/5 hover:bg-brand-pink/10" : "cursor-default"
                } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans font-medium flex-shrink-0 ${
                    isDone
                      ? "bg-brand-pink text-white"
                      : isCurrent
                      ? "bg-white text-brand-pink border border-brand-pink"
                      : "bg-black/5 text-black/40"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-sans ${
                      isDone
                        ? "text-black/50 line-through"
                        : "text-brand-black"
                    }`}
                  >
                    {lesson.title}
                  </p>
                </div>
                {isCurrent && (
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <span className="pill bg-black/10 text-black/40 animate-pulse">
                        Saving...
                      </span>
                    ) : (
                      <span className="pill">Mark Complete</span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {error && (
        <p className="text-xs text-red-500 font-sans mt-2 text-center">
          {error}
        </p>
      )}
    </section>
  );
}
