
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import LoungeReportModal from "@/components/LoungeReportModal";

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
};

type Author = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_path: string | null;
};

type Props = {
  postId: string;
  currentUserId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export default function LoungeComments({
  postId,
  currentUserId,
}: Props) {
  const [supabase] = useState(() => createClient());

  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);

    const { data, error: commentsError } = await supabase
      .from("lounge_post_comments")
      .select(
        "id, post_id, user_id, parent_id, content, created_at"
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("LOUNGE COMMENTS:", commentsError);
      setError("Couldn't load comments.");
      setLoading(false);
      return;
    }

    const loadedComments: Comment[] = data ?? [];
    setComments(loadedComments);

    const userIds = [
      ...new Set(loadedComments.map((item) => item.user_id)),
    ];

    if (userIds.length > 0) {
      const { data: authorData, error: authorError } =
        await supabase
          .from("lounge_profiles")
          .select(
            "user_id, display_name, username, avatar_path"
          )
          .in("user_id", userIds);

      if (authorError) {
        console.error(
          "LOUNGE COMMENT AUTHORS:",
          authorError
        );
      }

      setAuthors(authorData ?? []);
    } else {
      setAuthors([]);
    }

    setLoading(false);
  }, [postId, supabase]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (open && replyTo) {
      textareaRef.current?.focus();
    }
  }, [open, replyTo]);

  const authorMap = new Map(
    authors.map((author) => [author.user_id, author])
  );

  const topLevelComments = comments.filter(
    (comment) => comment.parent_id === null
  );

  const replyTarget = comments.find(
    (comment) => comment.id === replyTo
  );

  const replyTargetName = replyTarget
    ? authorMap.get(replyTarget.user_id)?.display_name ||
      "Lounge Member"
    : null;

  function startReply(commentId: string) {
    setOpen(true);
    setReplyTo(commentId);
    setContent("");
    setError("");
  }

  function startReporting(commentId: string) {
    setReportCommentId(commentId);
    setError("");
  }

  async function submitComment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const text = content.trim();

    if (!text || saving) return;

    if (text.length > 1000) {
      setError("Comments must be 1,000 characters or less.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== currentUserId) {
        throw new Error("Please sign in again.");
      }

      const { error: insertError } = await supabase
        .from("lounge_post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_id: replyTo,
          content: text,
        });

      if (insertError) throw insertError;

      setContent("");
      setReplyTo(null);

      await loadComments();
    } catch (err) {
      console.error("LOUNGE COMMENT ERROR:", err);
      setError(
        "Couldn't share your comment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Delete this comment and any replies to it?"
    );

    if (!confirmed) return;

    setDeletingId(commentId);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== currentUserId) {
        throw new Error("Please sign in again.");
      }

      const { data, error: deleteError } = await supabase
        .from("lounge_post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select("id");

      if (deleteError || !data?.length) {
        throw new Error("Could not delete comment.");
      }

      if (replyTo === commentId) {
        setReplyTo(null);
      }

      await loadComments();
    } catch (err) {
      console.error("LOUNGE DELETE COMMENT:", err);
      setError("Couldn't delete your comment.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderComment(
    comment: Comment,
    isReply = false
  ) {
    const author = authorMap.get(comment.user_id);
    const name = author?.display_name || "Lounge Member";

    const avatarUrl = author?.avatar_path
      ? supabase.storage
          .from("lounge-avatars")
          .getPublicUrl(author.avatar_path).data.publicUrl
      : null;

    const isMyComment = comment.user_id === currentUserId;

    return (
      <div
        key={comment.id}
        className={`flex min-w-0 items-start gap-2 ${
          isReply ? "ml-5 mt-3 sm:ml-9" : "mt-4"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-sm text-[#77574E]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1 rounded-2xl bg-[#F7F1ED] px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-medium text-[#302521]">
              {name}
            </p>

            <span className="shrink-0 text-[10px] text-[#A18A82]">
              {formatDate(comment.created_at)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-[#302521]">
            {comment.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            {!isReply && (
              <button
                type="button"
                onClick={() => startReply(comment.id)}
                className="text-[11px] text-[#A77B73]"
              >
                Reply
              </button>
            )}

            {isMyComment ? (
              <button
                type="button"
                onClick={() => deleteComment(comment.id)}
                disabled={deletingId !== null}
                className="text-[11px] text-[#A18A82] disabled:opacity-50"
              >
                {deletingId === comment.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startReporting(comment.id)}
                className="text-[11px] text-[#A77B73] transition hover:text-[#77574E]"
                aria-label={`Report comment by ${name}`}
              >
                ⚑ Report
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* COMMENT BUTTON */}
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);
          setError("");
        }}
        aria-expanded={open}
        aria-label={open ? "Hide comments" : "Show comments"}
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 py-2 text-[#A77B73] transition hover:bg-[#F7F1ED]"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B98F87"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
        </svg>

        <span className="text-xs">
          {loading ? "…" : comments.length}
        </span>
      </button>

      {/* FULL-WIDTH CONVERSATION */}
      {open && (
        <div className="mt-3 w-full min-w-0 border-t border-[#F0E6E1] pt-4">
          <p className="text-[10px] tracking-[0.18em] text-[#A77B73]">
            THE CONVERSATION ♡
          </p>

          {loading ? (
            <p className="mt-4 text-xs text-[#806D65]">
              Loading comments...
            </p>
          ) : topLevelComments.length === 0 ? (
            <p className="mt-4 text-xs text-[#806D65]">
              No comments yet. Leave a little love ♡
            </p>
          ) : (
            <div className="w-full min-w-0">
              {topLevelComments.map((comment) => (
                <div key={comment.id}>
                  {renderComment(comment)}

                  {comments
                    .filter(
                      (reply) =>
                        reply.parent_id === comment.id
                    )
                    .map((reply) =>
                      renderComment(reply, true)
                    )}
                </div>
              ))}
            </div>
          )}

          {replyTo && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#F7F1ED] px-3 py-3">
              <p className="min-w-0 truncate text-xs text-[#806D65]">
                Replying to {replyTargetName} ♡
              </p>

              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setContent("");
                }}
                className="shrink-0 text-xs text-[#A77B73]"
              >
                Cancel
              </button>
            </div>
          )}

          <form
            onSubmit={submitComment}
            className="mt-5 flex w-full min-w-0 flex-col gap-3"
          >
            <label
              htmlFor={`lounge-comment-${postId}`}
              className="sr-only"
            >
              {replyTo ? "Write your reply" : "Write a comment"}
            </label>

            <textarea
              ref={textareaRef}
              id={`lounge-comment-${postId}`}
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              maxLength={1000}
              rows={3}
              placeholder={
                replyTo
                  ? "Write your reply... ♡"
                  : "Leave a little love... ♡"
              }
              disabled={saving}
              className="block w-full min-w-0 resize-y rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-3 text-sm text-[#302521] outline-none placeholder:text-[#A18A82] focus:ring-1 focus:ring-[#B98F87] disabled:opacity-50"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#A18A82]">
                {content.length}/1000
              </span>

              <button
                type="submit"
                disabled={saving || !content.trim()}
                className="shrink-0 rounded-full bg-[#DDB5AE] px-6 py-3 text-[11px] tracking-[0.1em] text-[#302521] transition hover:bg-[#D3A49C] disabled:opacity-50"
              >
                {saving
                  ? "POSTING..."
                  : replyTo
                    ? "SEND REPLY ♡"
                    : "POST ♡"}
              </button>
            </div>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-3 text-xs text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      )}

      {!open && error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* REPORT COMMENT MODAL */}
      {reportCommentId && (
        <LoungeReportModal
          commentId={reportCommentId}
          onClose={() => setReportCommentId(null)}
        />
      )}
    </div>
  );
}
