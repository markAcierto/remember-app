"use client";

import { useState } from "react";

import { FeedPostCard } from "../components/community/FeedPostCard";

export type CommunityPost = {
  id: string;
  author: string;
  text: string;
  type: "breakthrough" | "checkin";
  pillarSlug: string | null;
  time: string;
  likeCount: number;
  likedByMe: boolean;
};

type CommunityFeedProps = {
  posts: CommunityPost[];
  /** Enable the interactive like button (live Supabase data only). */
  interactive: boolean;
};

const TABS = [
  { key: "all", label: "All" },
  { key: "breakthrough", label: "Breakthroughs" },
  { key: "checkin", label: "Check-ins" },
] as const;

type FilterKey = (typeof TABS)[number]["key"];

export function CommunityFeed({ posts, interactive }: CommunityFeedProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible =
    filter === "all" ? posts : posts.filter((post) => post.type === filter);

  return (
    <>
      <div className="mb-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
              filter === tab.key
                ? "border-brand-pink bg-brand-pink text-white"
                : "border-black/15 bg-white text-black/60 active:bg-black/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((post) => (
          <FeedPostCard key={post.id} post={post} interactive={interactive} />
        ))}
        {visible.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-sans text-sm text-black/50">
              No {filter === "breakthrough" ? "breakthroughs" : "check-ins"} yet
              in this category. Be the first to share one.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
