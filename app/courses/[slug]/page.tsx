import Link from "next/link";
import { notFound } from "next/navigation";
import { PILLARS, MOCK_PROGRESS } from "@/lib/mock-data";

export default function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const pillar = PILLARS.find((p) => p.slug === params.slug);

  if (!pillar) {
    notFound();
  }

  const progress =
    MOCK_PROGRESS[pillar.slug] ?? { status: "locked", lessonIndex: 0 };

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
        {progress.status === "in-progress" && (
          <span className="pill inline-block mt-3">
            Lesson {progress.lessonIndex + 1} of {pillar.lessonTitles.length}
          </span>
        )}
      </header>

      {/* Lessons */}
      <section className="mb-7">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Lessons
        </h2>
        <ol className="flex flex-col gap-2 list-none">
          {pillar.lessonTitles.map((title, i) => {
            const isDone =
              progress.status === "completed" || i < progress.lessonIndex;
            const isCurrent =
              progress.status === "in-progress" && i === progress.lessonIndex;
            return (
              <li key={title}>
                <div
                  className={`card flex items-center gap-3 ${
                    isCurrent ? "border-brand-pink/40 bg-brand-pink/5" : ""
                  }`}
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
                      {title}
                    </p>
                  </div>
                  {isCurrent && <span className="pill">Up next</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Affirmation */}
      <section className="mb-7">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Affirmation
        </h2>
        <blockquote className="card border-l-4 border-l-brand-pink bg-brand-pink/5 font-display text-base text-brand-black italic leading-relaxed">
          "{pillar.affirmation}"
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

      <p className="text-xs text-black/40 font-sans mt-8 text-center">
        Progress is mock data — wire this up to Supabase once the schema exists.
      </p>
    </main>
  );
}