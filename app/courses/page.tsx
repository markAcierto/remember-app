import Link from "next/link";
import { PILLARS, MOCK_PROGRESS } from "@/lib/mock-data";

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-brand-pink text-white",
  "in-progress": "bg-brand-pink/10 text-brand-pink border border-brand-pink/30",
  locked: "bg-black/5 text-black/30",
};

export default function CoursesPage() {
  return (
    <main className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-brand-black">Your path</h1>
        <p className="text-sm text-black/50 font-sans mt-1">
          The REMEMBER framework — 8 pillars
        </p>
      </header>

      <div className="flex flex-col gap-2">
        {PILLARS.map((pillar) => {
          const progress =
            MOCK_PROGRESS[pillar.slug] ?? { status: "locked", lessonIndex: 0 };
          const label =
            progress.status === "completed"
              ? "Completed"
              : progress.status === "in-progress"
              ? `Lesson ${progress.lessonIndex + 1} of ${pillar.lessonTitles.length}`
              : "Locked";

          return (
            <Link
              key={pillar.slug}
              href={
                progress.status === "locked"
                  ? "#"
                  : `/courses/${pillar.slug}`
              }
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                progress.status === "in-progress"
                  ? "border-brand-pink/30 bg-brand-pink/5"
                  : "border-black/10"
              } ${progress.status === "locked" ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium flex-shrink-0 ${STATUS_STYLE[progress.status]}`}
              >
                {pillar.letter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium truncate">
                  {pillar.name}
                </p>
                <p className="text-xs text-black/40 font-sans">{label}</p>
              </div>
              {progress.status === "in-progress" && (
                <span aria-hidden>→</span>
              )}
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