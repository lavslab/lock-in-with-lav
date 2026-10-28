

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoungePostMenu from "@/components/LoungePostMenu";
import LoungeLikeButton from "@/components/LoungeLikeButton";
import LoungeComments from "@/components/LoungeComments";
import LoungeSaveButton from "@/components/LoungeSaveButton";

type FeedPhoto = {
  id: string;
  storagePath: string;
  url: string;

};

type FeedVideo = {
  id: string;
  storagePath: string;
  url: string;
  duration: number;
  coverUrl: string | null;
};
type FeedPost = {

  id: string;
  userId: string;
  content: string;
  category: string;
  createdAt: string;
  authorName: string;
  authorUsername: string | null;
  authorAvatar: string | null;

  photos: FeedPhoto[];
  video: FeedVideo | null;

  

  likeCount: number;
  likedByMe: boolean;
};

type Props = {
  posts: FeedPost[];
  savedPosts: FeedPost[];
  currentUserId: string;
};

const categories = [
  { value: "all", label: "All posts" },
  { value: "meals", label: "Meals" },
  { value: "movement", label: "Movement" },
  { value: "little_wins", label: "Little Wins" },
  { value: "motivation", label: "Motivation" },
  { value: "general", label: "General" },

];

function formatPostDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",

  });

}

function LoungePostCard({
  post,
  currentUserId,
  onSavedChange,
  targetCommentId,

}: {

  post: FeedPost;
  currentUserId: string;

  onSavedChange: (post: FeedPost, saved: boolean) => void;
  targetCommentId?: string | null;
}) {

  const [commentCount, setCommentCount] = useState(0);
  const [openRequest, setOpenRequest] = useState(0);

  return (
    <article
  id={`lounge-post-${post.id}`}
  className="overflow-hidden rounded-[16px] border border-[#E8DCD6] bg-[#FFFCFA] px-3.5 py-4 shadow-[0_2px_12px_rgba(48,37,33,0.025)] sm:px-5"

>

      {/* AUTHOR HEADER */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-base text-[#77574E]">
          {post.authorAvatar ? (

            <img
              src={post.authorAvatar}
              alt={`${post.authorName}'s avatar`}
              className="h-full w-full object-cover"

            />

          ) : (
            post.authorName.charAt(0).toUpperCase()
          )}

        </div>
        <div className="min-w-0 flex-1">

          <p className="truncate text-[12px] font-semibold text-[#302521]">
            {post.authorName}
          </p>
          <p className="truncate text-[10px] text-[#A18A82]">

            {post.authorUsername
              ? `@${post.authorUsername}`
              : "Lounge Member"}
            {" · "}
            {formatPostDate(post.createdAt)}

          </p>

        </div>

       
<LoungePostMenu
  postId={post.id}
  authorId={post.userId}
  isOwner={post.userId === currentUserId}
  photoPaths={post.photos.map(
    (photo) => photo.storagePath
  )}
  photos={post.photos}
  hasVideo={post.video !== null}
  content={post.content}
  category={post.category}
/>


      </div>

      {/* POST PHOTOS */}

{post.video && (
  <div className="mt-4 flex justify-center">
    <div className="w-fit max-w-full overflow-hidden rounded-xl bg-[#F7F1ED]">
      <video
        src={post.video.url}
        controls
        playsInline
        preload="metadata"
        poster={post.video.coverUrl ?? undefined}
        className="block max-h-[520px] max-w-full object-contain"
      />
    </div>
  </div>
)}

      {post.photos.length > 0 && (
        <div
          className={`grid gap-1.5 ${
            post.photos.length === 1
              ? "grid-cols-1"
              : "grid-cols-2"

          }`}

        >
          {post.photos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-lg bg-[#F1E8E4]"
            >

              <img
                src={photo.url}
                alt="Community post photo"
                className="block h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* TEXT-ONLY POST CONTENT */}

      {post.photos.length === 0 && !post.video && post.content && (
        <p className="my-5 whitespace-pre-wrap break-words text-[15px] font-normal leading-[1.8] tracking-[-0.01em] text-[#302521]">
          {post.content}
        </p>
      )}

      {/* ACTION ROW */}

      <div className="mt-3 flex items-start gap-3">
        <LoungeLikeButton
          postId={post.id}
          currentUserId={currentUserId}
          initialCount={post.likeCount}
          initiallyLiked={post.likedByMe}
        />

        {/* COMMENT BUTTON */}

        <button
          type="button"
          onClick={() =>
            setOpenRequest((previous) => previous + 1)
          }
          aria-label={`Open comments, ${commentCount} total`}
          className="flex items-center gap-1.5 pt-1.5 text-[#302521] transition hover:text-[#A77B73]"

        >

          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >

            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
          </svg>
          <span className="text-[11px]">
            {commentCount}
          </span>
        </button>

        {/* SAVE BUTTON */}

        <div className="pt-1.5">
          <LoungeSaveButton
            postId={post.id}
            currentUserId={currentUserId}
            onSavedChange={(saved) =>
              onSavedChange(post, saved)

            }
          />
        </div>

        {/* CATEGORY */}

        <span className="ml-auto pt-2 text-[9px] tracking-[0.14em] text-[#A77B73]">
          {post.category.replaceAll("_", " ").toUpperCase()}
        </span>
      </div>

      {/* CAPTION — PHOTO POSTS ONLY */}
      {(post.photos.length > 0 || post.video !== null) && post.content && (
        <p className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-6 text-[#302521]">
          <span className="mr-1.5 font-semibold">
            {post.authorName}
          </span>

          {post.content}
        </p>

      )}

      {/* COMMENTS */}

      <div className="mt-3">
        <LoungeComments
          postId={post.id}
          currentUserId={currentUserId}
          onCountChange={setCommentCount}
          openRequest={openRequest}
          targetCommentId={targetCommentId}
        />
      </div>
    </article>

  );
}

export default function LoungeFeed({
  posts,
  savedPosts,
  currentUserId,

}: Props) {
  const searchParams = useSearchParams();
const targetPostId = searchParams.get("post");
const targetCommentId = searchParams.get("comment");

  useEffect(() => {
    if (!targetPostId) return;
    const timer = window.setTimeout(() => {
      if (!targetCommentId) {
        document.getElementById(`lounge-post-${targetPostId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [targetPostId, targetCommentId]);

  const [activeCategory, setActiveCategory] =

    useState("all");

 const [activeView, setActiveView] =

  useState<"all" | "saved">("all");

const [savedPostsList, setSavedPostsList] =
  useState<FeedPost[]>(savedPosts ?? []);
  // Keep saved posts in sync if server props refresh.
  useEffect(() => {
  setSavedPostsList(savedPosts ?? []);
}, [savedPosts]);

  const visiblePosts: FeedPost[] =
  activeView === "saved"
    ? (savedPostsList ?? [])
    : (posts ?? []);

const uniquePosts = Array.from(
  new Map(visiblePosts.map((post) => [post.id, post])).values()
);

const filteredPosts: FeedPost[] =
  activeCategory === "all"
    ? uniquePosts
    : uniquePosts.filter(
        (post) => post.category === activeCategory
      );

  function handleSavedChange(
    changedPost: FeedPost,
    saved: boolean
  ) {

    setSavedPostsList((previous) => {
      if (saved) {
        if (
          previous.some(
            (post) => post.id === changedPost.id
          )
        ) {
          return previous;
        }
        return [changedPost, ...previous];
      }
      return previous.filter(
        (post) => post.id !== changedPost.id
      );
    });
  }
  return (
    <section>

      {/* ALL POSTS / SAVED TABS */}

<div className="mb-3 flex gap-5 border-b border-[#DED0CB]">        <button
          type="button"
          onClick={() => setActiveView("all")}
          aria-pressed={activeView === "all"}
          className={`border-b-2 pb-3 text-[11px] font-medium transition ${
            activeView === "all"
              ? "border-[#A77B73] text-[#302521]"
              : "border-transparent text-[#A18A82]"
          }`}
        >
          All Posts
        </button>

        <button

          type="button"
          onClick={() => setActiveView("saved")}
          aria-pressed={activeView === "saved"}
          className={`flex items-center gap-1.5 border-b-2 pb-3 text-[11px] font-medium transition ${
            activeView === "saved"
              ? "border-[#A77B73] text-[#302521]"
              : "border-transparent text-[#A18A82]"
          }`}
        >
          Saved

          <svg

            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >

            <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z" />
          </svg>
        </button>
      </div>

      {/* FEED HEADER */}

<div className="mb-3 flex items-end justify-between gap-3">        <div>
          <p className="text-[9px] tracking-[0.23em] text-[#9D6F67]">
            {activeView === "saved"
              ? "YOUR COLLECTION"
              : "THE COMMUNITY FEED"}
          </p>

          {activeView === "saved" && (
  <h2 className="mt-2 font-serif text-xl text-[#302521]">
    Your{" "}
    <span className="italic text-[#A77B73]">
      Saved Posts.
    </span>
  </h2>
)}
        </div>

        {/* CATEGORY DROPDOWN */}
        <div className="relative shrink-0">
          <label
            htmlFor="lounge-category-filter"
            className="sr-only"
          >
            Filter posts
          </label>

          <select
            id="lounge-category-filter"
            value={activeCategory}
            onChange={(event) =>
              setActiveCategory(event.target.value)
            }
            className="max-w-[140px] appearance-none rounded-full border border-[#DED0CB] bg-[#FBF8F6] py-2 pl-3 pr-8 text-[10px] text-[#806D65] outline-none focus:border-[#A77B73]"
          >
            {categories.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9D6F67"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >

            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* EMPTY STATE */}

      {filteredPosts.length === 0 ? (
        <div className="border-y border-[#DED0CB] px-5 py-12 text-center">
          <span className="font-serif text-3xl text-[#A77B73]">
            {activeView === "saved" ? "♧" : "♡"}
          </span>

          <h3 className="mt-3 font-serif text-xl text-[#302521]">
            {activeView === "saved"
              ? "Nothing saved just yet."
              : "Nothing here just yet."}
          </h3>

          <p className="mt-3 text-[11px] leading-6 text-[#806D65]">
            {activeView === "saved"
              ? "Save posts you love and find them here. ♡"
              : "Be the first to share something. ♡"}
          </p>
        </div>

      ) : (

        <div className="space-y-7">
          {filteredPosts.map((post) => (
            <LoungePostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onSavedChange={handleSavedChange}
              targetCommentId={post.id === targetPostId ? targetCommentId : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
