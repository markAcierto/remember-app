import Link from "next/link";

import { CommunityFeed, type CommunityPost } from "./CommunityFeed";

import { COMMUNITY_FEED } from "@/lib/mock-data";
import { getFeedPosts, type FeedPostView } from "@/lib/supabase/feed";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

function toCommunityPost(post: FeedPostView): CommunityPost {
  return {
    id: post.id,
    author: post.author,
    text: post.text,
    type: post.type,
    pillarSlug: post.pillarSlug,
    time: post.time,
    likeCount: post.likeCount,
    likedByMe: post.likedByMe,
  };
}

export default async function CommunityPage() {
  const supabase = createClient();
  const user = await getAuthUser();
  const remote = await getFeedPosts(supabase, {
    limit: 50,
    userId: user?.id ?? null,
  });

  const live = remote !== null;
  let posts: CommunityPost[];
  if (live) {
    posts = remote.map(toCommunityPost);
  } else {
    posts = COMMUNITY_FEED.map((post) => ({
      id: post.id,
      author: post.author,
      text: post.text,
      type: post.type,
      pillarSlug: post.pillar ?? null,
      time: post.time,
      likeCount: 0,
      likedByMe: false,
    }));
  }

  return (
    <main className="px-4 pt-6 pb-28">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-brand-black">Community</h1>
        <p className="mt-1 font-sans text-sm text-black/50">
          Breakthroughs and daily check-ins from people on the same path.
        </p>
        <p className="mt-2 inline-block rounded-full border border-black/10 bg-black/5 px-3 py-1 font-sans text-xs text-black/60">
          {live
            ? "Live — posts sync from your Supabase project"
            : "Sample feed — connect Supabase to see the real community"}
        </p>
      </header>

      <CommunityFeed posts={posts} interactive={live} />

      <Link href="/practice" className="btn-primary mt-8 block text-center">
        Share your own check-in
      </Link>
    </main>
  );
}
