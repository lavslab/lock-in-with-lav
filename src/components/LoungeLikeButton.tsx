
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId: string;
  currentUserId: string;
  initialCount: number;
  initiallyLiked: boolean;
};

export default function LoungeLikeButton({
  postId,
  currentUserId,
  initialCount,
  initiallyLiked,
}: Props) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggleLike() {
    if (busy) return;

    setBusy(true);
    setError("");

    const nextLiked = !liked;

    // Optimistic update.
    setLiked(nextLiked);
    setCount((previous) =>
      Math.max(0, previous + (nextLiked ? 1 : -1))
    );

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (
        authError ||
        !user ||
        user.id !== currentUserId
      ) {
        throw new Error("Please sign in again.");
      }

      if (nextLiked) {
        const { error: likeError } = await supabase
          .from("lounge_post_likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (likeError) throw likeError;
      } else {
        const { error: unlikeError } = await supabase
          .from("lounge_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (unlikeError) throw unlikeError;
      }
    } catch (err) {
      setLiked(!nextLiked);
      setCount((previous) =>
        Math.max(0, previous + (nextLiked ? -1 : 1))
      );

      setError(
        "Couldn't update your like. Please try again."
      );

      console.error("Lounge like error:", err);
    } finally {
      setBusy(false);
    }
  }

  
  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy}
        aria-label={liked ? "Unlike post" : "Like post"}
        aria-pressed={liked}
        className="inline-flex items-center gap-1.5 pt-1.5 text-[#302521] transition hover:text-[#A77B73] disabled:opacity-60"
      >
        <svg
          width="19"
height="19"
          viewBox="0 0 24 24"
          fill={liked ? "#C9938C" : "none"}
          stroke={liked ? "#C9938C" : "currentColor"}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>

        <span className="text-[11px] font-normal tabular-nums">
          {count}
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 text-[10px] text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
