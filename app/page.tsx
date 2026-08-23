import Link from "next/link";
import { PILLARS, COMMUNITY_FEED, type FeedPost } from "@/lib/mock-data";

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-brand-pink text-white",
  "in-progress": "bg-brand-pink/10 text-brand-pink border border-brand-pink/30",
  locked: "bg-black/5 text-black/30",
};

function feedIcon(post: FeedPost) {
  return post.type === "breakthrough" ? "🔥" : "📝";
}

function feedLabel(post: FeedPost) {
  return post.type === "breakthrough" ? "Breakthrough" : "Daily check-in";
}

export default function HomePage() {
  const recentPosts = COMMUNITY_FEED.slice(0, 3);

  return (
    <main className="px-4 pt-6 pb-4">
      {/* Greeting */}
      <header className="mb-6">
        <h1 className="font-display text-3xl text-brand-black leading-tight">
          Remember
        </h1>
        <p className="text-sm text-black/50 font-sans mt-1">
          Your path to intentional responses
        </p>
      </header>

      {/* Quick path preview */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-brand-black">Your path</h2>
          <Link
            href="/courses"
            className="text-xs font-sans text-brand-pink font-medium"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PILLARS.slice(0, 4).map((pillar) => (
            <Link
              key={pillar.slug}
              href={`/courses/${pillar.slug}`}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-black/10 bg-white active:bg-black/5 transition"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-sans font-semibold ${STATUS_STYLE[
                  pillar.slug === "recognize" || pillar.slug === "evaluate"
                    ? "completed"
                    : pillar.slug === "manage"
                    ? "in-progress"
                    : "locked"
                ]}`}
              >
                {pillar.letter}
              </div>
              <span className="text-[10px] font-sans text-black/50 text-center leading-tight line-clamp-2">
                {pillar.name.split(" ").slice(0, 2).join(" ")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Community feed preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-brand-black">
            Community
          </h2>
          <Link
            href="/community"
            className="text-xs font-sans text-brand-pink font-medium"
          >
            See all →
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href="/community"
              className="card flex items-start gap-3 active:bg-black/5 transition"
            >
              <div className="text-lg leading-none mt-0.5">{feedIcon(post)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-sans font-medium">
                    {post.author}
                  </span>
                  <span className="text-[10px] font-sans text-black/30">
                    {post.time}
                  </span>
                </div>
                <p className="text-sm font-sans text-black/70 leading-snug line-clamp-2">
                  {post.text}
                </p>
                <span className="pill inline-block mt-1.5">{feedLabel(post)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}