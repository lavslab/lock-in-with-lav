
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId: string;
  currentUserId: string;
  onSavedChange?: (saved: boolean) => void;
};

export default function LoungeSaveButton({
  postId,
  currentUserId,
  onSavedChange,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSaved() {
      const { data, error } = await supabase
        .from("lounge_saved_posts")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("LOUNGE SAVED POST:", error);
      } else {
        setSaved(Boolean(data));
      }

      setLoading(false);
    }

    void loadSaved();

    return () => {
      active = false;
    };
  }, [supabase, postId, currentUserId]);

  async function toggleSaved() {
    if (saving || loading) return;

    const wasSaved = saved;
    const nextSaved = !wasSaved;

    setSaved(nextSaved);
    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== currentUserId) {
        throw new Error("Please sign in again.");
      }

      if (wasSaved) {
        const { error } = await supabase
          .from("lounge_saved_posts")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lounge_saved_posts")
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      onSavedChange?.(nextSaved);
    } catch (error) {
      console.error("LOUNGE SAVE ERROR:", error);
      setSaved(wasSaved);
      window.alert("Couldn't update your saved posts. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggleSaved()}
      disabled={loading || saving}
      aria-label={saved ? "Remove saved post" : "Save post"}
      aria-pressed={saved}
      title={saved ? "Unsave post" : "Save post"}
      className="flex shrink-0 items-center justify-center text-[#302521] transition hover:text-[#A77B73] disabled:opacity-50"
    >
      <svg
        width="18"
height="18"
        viewBox="0 0 24 24"
        fill={saved ? "#C9938C" : "none"}
        stroke={saved ? "#C9938C" : "currentColor"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z" />
      </svg>
    </button>
  );
}
