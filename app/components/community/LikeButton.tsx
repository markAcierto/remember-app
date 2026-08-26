"use client";

import { useState, useTransition } from "react";

import { toggleLikeAction } from "@/lib/supabase/like-actions";

type LikeButtonProps = {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
};

export function LikeButton({
  postId,
  initialCount,
  initialLiked,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleLikeAction(postId);
      if (result.ok) {
        setLiked(result.liked);
        setCount(result.count);
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="font-sans text-xs text-brand-pink">{message}</span>
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Unlike post" : "Like post"}
        className={`rounded-full border px-3 py-1.5 font-sans text-xs transition active:scale-[0.98] disabled:opacity-50 ${
          liked
            ? "border-transparent bg-brand-pink text-white"
            : "border-black/15 bg-white text-brand-black/70"
        }`}
      >
        {liked ? "♥" : "♡"} {count}
      </button>
    </div>
  );
}
