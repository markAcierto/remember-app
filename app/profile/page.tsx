import Link from "next/link";
import { PILLARS, MOCK_PROGRESS, COMMUNITY_FEED } from "@/lib/mock-data";

export default function ProfilePage() {
  const completedPillars = Object.entries(MOCK_PROGRESS).filter(
    ([, p]) => p.status === "completed"
  ).length;

  const inProgressPillars = Object.entries(MOCK_PROGRESS).filter(
    ([, p]) => p.status === "in-progress"
  ).length;

  const breakthroughs = COMMUNITY_FEED.filter((p) => p.type === "breakthrough").length;

  return (
    <main className="px-4 pt-6">
      <header className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center font-display text-2xl text-brand-pink mb-3">
          K
        </div>
        <h1 className="font-display text-xl text-brand-black">Kyria</h1>
        <p className="text-sm font-sans text-black/40">kyria@example.com</p>
        <span className="pill mt-2">Member since 2026</span>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">
            {completedPillars}
          </p>
          <p className="text-[10px] font-sans text-black/40 mt-1">
            Completed
          </p>
        </div>
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">{inProgressPillars}</p>
          <p className="text-[10px] font-sans text-black/40 mt-1">In progress</p>
        </div>
        <div className="card text-center">
          <p className="font-display text-2xl text-brand-pink">{breakthroughs}</p>
          <p className="text-[10px] font-sans text-black/40 mt-1">Breakthroughs</p>
        </div>
      </section>

      {/* Streak */}
      <section className="mb-8">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Current streak
        </h2>
        <div className="card flex items-center gap-4">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="font-display text-lg text-brand-black">4 days</p>
            <p className="text-xs font-sans text-black/40">
              Daily check-ins in a row
            </p>
          </div>
        </div>
      </section>

      {/* Pillar progress */}
      <section className="mb-8">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Pillar progress
        </h2>
        <div className="flex flex-col gap-2">
          {PILLARS.map((pillar) => {
            const progress =
              MOCK_PROGRESS[pillar.slug] ?? { status: "locked", lessonIndex: 0 };
            const pct =
              progress.status === "completed"
                ? 100
                : progress.status === "in-progress"
                ? Math.round(
                    ((progress.lessonIndex + 1) / pillar.lessonTitles.length) * 100
                  )
                : 0;
            return (
              <Link
                key={pillar.slug}
                href={`/courses/${pillar.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-black/10"
              >
                <span className="text-xs font-sans font-medium w-4 text-black/60">
                  {pillar.letter}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-sans font-medium mb-1 truncate">
                    {pillar.name}
                  </p>
                  <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-pink transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-sans text-black/40 w-8 text-right">
                  {pct}%
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="mb-8">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Settings
        </h2>
        <div className="card flex flex-col divide-y divide-black/5">
          <Link
            href="/auth/login"
            className="flex items-center justify-between py-3 text-sm font-sans"
          >
            <span>Account</span>
            <span className="text-black/30">→</span>
          </Link>
          <button className="flex items-center justify-between py-3 text-sm font-sans">
            <span>Notifications</span>
            <span className="text-black/30">→</span>
          </button>
          <button className="flex items-center justify-between py-3 text-sm font-sans">
            <span>Privacy</span>
            <span className="text-black/30">→</span>
          </button>
        </div>
      </section>

      {/* Sign out */}
      <Link
        href="/auth/login"
        className="block text-center text-sm font-sans text-red-500 py-3"
      >
        Sign out
      </Link>

      <p className="text-xs text-black/30 font-sans mt-6 text-center">
        Remember v0.1 — made with care for the Kyria Mailman brand.
      </p>
    </main>
  );
}