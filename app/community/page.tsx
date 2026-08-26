"use client";

import { useState } from "react";
import Link from "next/link";
import { COMMUNITY_FEED, PILLARS, type FeedPost } from "@/lib/mock-data";

function feedIcon(post: FeedPost) {
  return post.type === "breakthrough" ? "🔥" : "📝";
}

function feedLabel(post: FeedPost) {
  return post.type === "breakthrough" ? "Breakthrough" : "Check-in";
}

function pillarName(slug?: string) {
  if (!slug) return null;
  return PILLARS.find((p) => p.slug === slug)?.name ?? null;
}

export default function CommunityPage() {
  const [filter, setFilter] = useState<"all" | "breakthrough" | "checkin">("all");

  const filtered =
    filter === "all"
      ? COMMUNITY_FEED
      : COMMUNITY_FEED.filter((p) => p.type === filter);

  return (
    <main className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-brand-black">Community</h1>
        <p className="text-sm text-black/50 font-sans mt-1">
          Breakthroughs and daily check-ins from people on the same path.
        </p>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(
          [
            { key: "all", label: "All" },
            { key: "breakthrough", label: "🔥 Breakthroughs" },
            { key: "checkin", label: "📝 Check-ins" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition ${
              filter === tab.key
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white text-black/60 border-black/15 active:bg-black/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        {filtered.map((post) => (
          <article key={post.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center text-xs font-sans font-semibold text-brand-pink">
                {post.author[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-medium">{post.author}</p>
                <p className="text-[10px] font-sans text-black/30">{post.time}</p>
              </div>
              <span className="pill">{feedLabel(post)}</span>
            </div>

            <p className="text-sm font-sans text-black/70 leading-relaxed">
              {post.text}
            </p>

            {pillarName(post.pillar) && (
              <Link
                href={`/courses/${post.pillar}`}
                className="inline-flex items-center gap-1 mt-2 text-xs font-sans text-brand-pink font-medium"
              >
                {feedIcon(post)} {pillarName(post.pillar)}
              </Link>
            )}

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5">
              <button className="flex items-center gap-1 text-xs font-sans text-black/40 active:text-brand-pink transition">
                <span>❤️</span> {Math.floor(Math.random() * 50) + 5}
              </button>
              <button className="flex items-center gap-1 text-xs font-sans text-black/40 active:text-brand-pink transition">
                <span>💬</span> {Math.floor(Math.random() * 10)}
              </button>
              <button className="flex items-center gap-1 text-xs font-sans text-black/40 active:text-brand-pink transition">
                <span>↗</span> Share
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-sm font-sans text-black/50">
            No posts yet in this category. Be the first!
          </p>
        </div>
      )}

      <Link
        href="/practice"
        className="btn-primary block text-center mt-8"
      >
        Share your own check-in →
      </Link>
    </main>
  );
}