

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

type CommentLike = {

  comment_id: string;

  user_id: string;

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

  onCountChange?: (count: number) => void;

  openRequest?: number;

  targetCommentId?: string | null;

};

function formatDate(value: string) {

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-CA", {

    month: "short",

    day: "numeric",

  });

}

export default function LoungeComments({

  postId,

  currentUserId,

  onCountChange,

  openRequest = 0,

  targetCommentId = null,

}: Props) {

  const [supabase] = useState(() => createClient());

  const [comments, setComments] = useState<Comment[]>([]);

  const [commentLikes, setCommentLikes] = useState<CommentLike[]>([]);

const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  const [authors, setAuthors] = useState<Author[]>([]);

  const [showAll, setShowAll] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);

  const [content, setContent] = useState("");

  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [reportCommentId, setReportCommentId] =

    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =

    useState<string | null>(null);

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
  // Load likes for all comments and replies on this post.
const commentIds = loadedComments.map((comment) => comment.id);

if (commentIds.length > 0) {

  const { data: likesData, error: likesError } = await supabase

    .from("lounge_comment_likes")

    .select("comment_id, user_id")

    .in("comment_id", commentIds);

  if (likesError) {

    console.error("LOUNGE COMMENT LIKES:", likesError);

  } else {

    setCommentLikes(likesData ?? []);

  }

} else {

  setCommentLikes([]);

}

    onCountChange?.(loadedComments.length);

    const userIds = [

      ...new Set(

        loadedComments.map((comment) => comment.user_id)

      ),

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

    if (replyTo) {

      textareaRef.current?.focus();

    }

  }, [replyTo]);

 useEffect(() => {

  if (openRequest === 0) return;

  setCommentsOpen(true);

  setShowAll(true);

}, [openRequest]);

  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (!targetCommentId || loading || !comments.some((comment) => comment.id === targetCommentId)) return;
    setCommentsOpen(true);
    setShowAll(true);
    setHighlightedCommentId(targetCommentId);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`lounge-comment-${targetCommentId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
    const highlightTimer = window.setTimeout(() => setHighlightedCommentId(null), 2200);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [targetCommentId, loading, comments]);

  const authorMap = new Map(

    authors.map((author) => [author.user_id, author])

  );

  const topLevelComments = comments.filter(

    (comment) => comment.parent_id === null

  );

  const visibleTopLevelComments = commentsOpen

  ? topLevelComments

  : topLevelComments.slice(-2);

  const replyTarget = comments.find(

    (comment) => comment.id === replyTo

  );

  const replyTargetName = replyTarget

    ? authorMap.get(replyTarget.user_id)?.display_name ||

      "Lounge Member"

    : null;

async function toggleCommentLike(commentId: string) {

  if (likingCommentId) return;

  const alreadyLiked = commentLikes.some(

    (like) =>

      like.comment_id === commentId &&

      like.user_id === currentUserId

  );

  setLikingCommentId(commentId);

  setError("");
  // Update the heart immediately.
  setCommentLikes((previous) =>

    alreadyLiked

      ? previous.filter(

          (like) =>

            !(

              like.comment_id === commentId &&

              like.user_id === currentUserId

            )

        )

      : [

          ...previous,

          {

            comment_id: commentId,

            user_id: currentUserId,

          },

        ]

  );

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

    if (alreadyLiked) {

      const { error: unlikeError } = await supabase

        .from("lounge_comment_likes")

        .delete()

        .eq("comment_id", commentId)

        .eq("user_id", user.id);

      if (unlikeError) throw unlikeError;

    } else {

      const { error: likeError } = await supabase

        .from("lounge_comment_likes")

        .insert({

          comment_id: commentId,

          user_id: user.id,

        });

      if (likeError) throw likeError;

    }

  } catch (err) {
  // Restore the original state if saving fails.
    setCommentLikes((previous) =>

      alreadyLiked

        ? [

            ...previous,

            {

              comment_id: commentId,

              user_id: currentUserId,

            },

          ]

        : previous.filter(

            (like) =>

              !(

                like.comment_id === commentId &&

                like.user_id === currentUserId

              )

          )

    );

    setError("Couldn't update your comment like.");

    console.error("LOUNGE COMMENT LIKE ERROR:", err);

  } finally {

    setLikingCommentId(null);

  }

}

  function startReply(commentId: string) {

  setCommentsOpen(true);

  setShowAll(true);

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

      if (

        authError ||

        !user ||

        user.id !== currentUserId

      ) {

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

      const message =

        err instanceof Error

          ? err.message

          : err && typeof err === "object" && "message" in err

            ? String(err.message)

            : "Couldn't share your comment. Please try again.";

      setError(message);

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

      if (

        authError ||

        !user ||

        user.id !== currentUserId

      ) {

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

    const isMyComment =

      comment.user_id === currentUserId;

      const likedByMe = commentLikes.some(

  (like) =>

    like.comment_id === comment.id &&

    like.user_id === currentUserId

);

const commentLikeCount = commentLikes.filter(

  (like) => like.comment_id === comment.id

).length;

    return (

      <div

  key={comment.id}

  id={`lounge-comment-${comment.id}`}

  className={`flex min-w-0 scroll-mt-24 items-start gap-2.5 rounded-xl p-2 transition-colors ${

    isReply ? "ml-7 mt-3" : "mt-3"

  } ${

    highlightedCommentId === comment.id

  ? "bg-[#F1E5E0] ring-1 ring-[#E4C8C0]"

  : ""

  }`}

>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-xs text-[#77574E]">

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

<div className="min-w-0 flex-1">

  <div className="flex items-start gap-2">

    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[11px] leading-[1.7] text-[#4D413D]">

      <span className="mr-1.5 font-semibold text-[#302521]">

        {name}

      </span>

      {comment.content}

    </p>

    <button

      type="button"

      onClick={() => void toggleCommentLike(comment.id)}

      disabled={likingCommentId !== null}

      aria-label={

        likedByMe ? "Unlike comment" : "Like comment"

      }

      aria-pressed={likedByMe}

      className="flex shrink-0 items-center gap-1 pt-0.5 text-[#A18A82] transition hover:text-[#C9938C] disabled:opacity-50"

    >

      <svg

        width="12"

        height="12"

        viewBox="0 0 24 24"

        fill={likedByMe ? "#C9938C" : "none"}

        stroke={likedByMe ? "#C9938C" : "currentColor"}

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

        aria-hidden="true"

      >

        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />

      </svg>

      {commentLikeCount > 0 && (

        <span className="text-[9px] tabular-nums">

          {commentLikeCount}

        </span>

      )}

    </button>

  </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">

            <span className="text-[9px] text-[#A18A82]">

              {formatDate(comment.created_at)}

            </span>

            {(

              <button

                type="button"

                onClick={() => startReply(comment.id)}

                className="text-[9px] font-medium text-[#9D6F67]"

              >

                Reply

              </button>

            )}

            {isMyComment ? (

              <button

                type="button"

                onClick={() =>

                  void deleteComment(comment.id)

                }

                disabled={deletingId !== null}

                className="text-[9px] text-[#A18A82] disabled:opacity-50"

              >

                {deletingId === comment.id

                  ? "Deleting..."

                  : "Delete"}

              </button>

            ) : (

              <button

                type="button"

                onClick={() =>

                  startReporting(comment.id)

                }

                className="text-[9px] text-[#A18A82]"

                aria-label={`Report comment by ${name}`}

              >

                Report

              </button>

            )}

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="w-full min-w-0">

      {!loading && comments.length > 0 && (

        <div className="mt-3">

          {topLevelComments.length > 2 && (

            <button

              type="button"

              onClick={() => {

  setCommentsOpen((previous) => !previous);

}}aria-expanded={commentsOpen}

              className="text-[10px] text-[#9D6F67] transition hover:text-[#302521]"

            >

              {commentsOpen

  ? "Hide comments ↑"

  : `View all ${comments.length} comments`}

            </button>

          )}

          {visibleTopLevelComments.map((comment) => {

const replies = comments.filter((reply) => {

  let parentId = reply.parent_id;

  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {

    if (parentId === comment.id) return true;

    visited.add(parentId);

    const parent = comments.find(

      (item) => item.id === parentId

    );

    parentId = parent?.parent_id ?? null;

  }

  return false;

});

return (

  <div key={comment.id}>

    {renderComment(comment)}

    {commentsOpen &&

  replies.map((reply) =>

    renderComment(reply, true)

  )}

  </div>

);

          })}

          {!commentsOpen &&

            topLevelComments.length <= 2 &&

            comments.some(

              (comment) => comment.parent_id !== null

            ) && (

              <button

                type="button"

                onClick={() => {

  setCommentsOpen(true);

  setShowAll(true);

}}

                className="ml-9 mt-2 text-[10px] text-[#9D6F67]"

              >

                View replies

              </button>

            )}

        </div>

      )}

      {loading && (

        <p className="mt-3 text-[10px] text-[#A18A82]">

          Loading comments...

        </p>

      )}

      {/* REPLY INDICATOR */}

      {replyTo && (

        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-[#F1E5E0] px-3 py-2">

          <p className="min-w-0 truncate text-[10px] text-[#806D65]">

            Replying to {replyTargetName}

          </p>

          <button

            type="button"

            onClick={() => {

              setReplyTo(null);

              setContent("");

            }}

            className="shrink-0 text-[10px] text-[#9D6F67]"

          >

            Cancel

          </button>

        </div>

      )}

      {/* COMMENT INPUT */}

      <form

        onSubmit={submitComment}

        className="mt-4"

      >

        <label

          htmlFor={`lounge-comment-${postId}`}

          className="sr-only"

        >

          {replyTo

            ? "Write your reply"

            : "Write a comment"}

        </label>

        <div className="flex min-w-0 items-end gap-2 rounded-2xl border border-[#E7DAD4] bg-[#F7F1ED] px-3 py-2">

          <textarea

            ref={textareaRef}

            id={`lounge-comment-${postId}`}

            value={content}

            onChange={(event) =>

              setContent(event.target.value)

            }

            maxLength={1000}

            rows={1}

            placeholder={

              replyTo

                ? "Write a reply..."

                : "Add a comment..."

            }

            disabled={saving}

            className="max-h-28 min-h-7 min-w-0 flex-1 resize-none bg-transparent py-1 text-[11px] leading-5 text-[#302521] outline-none placeholder:text-[#A18A82] disabled:opacity-50"

          />

          <button

            type="submit"

            disabled={saving || !content.trim()}

            className="shrink-0 px-1 py-1.5 text-[10px] font-semibold text-[#A77B73] transition hover:text-[#302521] disabled:opacity-40"

          >

            {saving ? "..." : "Post"}

          </button>

        </div>

        {content.length > 800 && (

          <p className="mt-1 text-right text-[9px] text-[#A18A82]">

            {content.length}/1000

          </p>

        )}

      </form>

      {error && (

        <p

          role="alert"

          className="mt-2 text-[10px] text-red-600"

        >

          {error}

        </p>

      )}

      {/* REPORT MODAL */}

      {reportCommentId && (

        <LoungeReportModal

          commentId={reportCommentId}

          onClose={() =>

            setReportCommentId(null)

          }

        />

      )}

    </div>

  );

}
