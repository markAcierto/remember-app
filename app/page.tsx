import Link from "next/link";

import { FeedPostCard } from "./components/community/FeedPostCard";

import { PILLARS, COMMUNITY_FEED } from "@/lib/mock-data";
import { getFeedPosts } from "@/lib/supabase/feed";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const [remotePosts, user] = await Promise.all([
    getFeedPosts(supabase, { limit: 3 }),
    getAuthUser(),
  ]);
  const posts =
    remotePosts ??
    COMMUNITY_FEED.map((post) => ({
      ...post,
      pillarSlug: post.pillar ?? null,
      likeCount: 0,
      likedByMe: false,
    }));

  return (
    <div className="space-y-10 pb-28">
      <section>
        <p className="pill mb-3">Your AI companion for real change</p>
        <h1 className="h1-brand">
          Feel better about your life.
          <br />
          Start with one small step.
        </h1>
        <p className="mt-3 max-w-md font-sans text-sm text-brand-black/60">
          Kyria pairs you with a practice: one video, one question, one short
          answer a day. Real progress is built out of small, honest moments —
          and the people beside you.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/practice" className="btn-primary">
            {user ? "Continue practice" : "Start practice"}
          </Link>
          <Link href="/community" className="btn-secondary">
            See the community
          </Link>
        </div>
      </section>

      <section>
        <h2 className="h2-brand mb-4">Pick a practice</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.slug}
              href={`/courses/${pillar.slug}`}
              className="card w-56 shrink-0"
            >
              <p className="font-display text-lg text-brand-black">
                {pillar.name}
              </p>
              <p className="mt-1 font-sans text-xs text-brand-black/60">
                {pillar.checkinQuestion}
              </p>
              <span className="pill mt-3 inline-block">Daily check-in</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="h2-brand">From the community</h2>
          <Link
            href="/community"
            className="font-sans text-sm text-brand-pink"
          >
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
