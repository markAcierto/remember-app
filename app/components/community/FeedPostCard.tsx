import { PILLARS } from "@/lib/mock-data";
import type { FeedPostView } from "@/lib/supabase/feed";

import { LikeButton } from "./LikeButton";

type FeedPostCardProps = {
  post: Pick<
    FeedPostView,
    "id" | "author" | "text" | "type" | "pillarSlug" | "time"
  > & {
    likeCount?: number;
    likedByMe?: boolean;
  };
  /** Render an interactive like button (community page only). */
  interactive?: boolean;
};

function pillarShortName(slug: string | null): string | null {
  if (!slug) return null;
  const pillar = PILLARS.find((entry) => entry.slug === slug);
  if (!pillar) return slug;
  return pillar.name.split(" ")[0];
}

export function FeedPostCard({ post, interactive = false }: FeedPostCardProps) {
  const shortName = pillarShortName(post.pillarSlug);

  return (
    <article className="card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-sm font-medium text-brand-black">
            {post.author}
          </span>
          <span
            className={
              post.type === "breakthrough"
                ? "pill"
                : "pill border border-black/10 bg-black/5 text-brand-black/70"
            }
          >
            {post.type === "breakthrough" ? "breakthrough" : "check-in"}
          </span>
          {shortName && (
            <span className="pill border border-black/10 bg-black/5 text-brand-black/70">
              {shortName}
            </span>
          )}
        </div>
        <span className="shrink-0 font-sans text-xs text-brand-black/50">
          {post.time}
        </span>
      </div>
      <p className="mt-2 font-sans text-sm text-brand-black/80">{post.text}</p>
      {interactive && (
        <div className="mt-3 flex items-center justify-end">
          <LikeButton
            postId={post.id}
            initialCount={post.likeCount ?? 0}
            initialLiked={post.likedByMe ?? false}
          />
        </div>
      )}
    </article>
  );
}
