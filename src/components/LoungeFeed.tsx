
"use client";

import { useState } from "react";
import LoungePostMenu from "@/components/LoungePostMenu";
import LoungeLikeButton from "@/components/LoungeLikeButton";
import LoungeComments from "@/components/LoungeComments";

type FeedPhoto = {
  id: string;
  storagePath: string;
  url: string;
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
  likeCount: number;
  likedByMe: boolean;
};

type Props = {
  posts: FeedPost[];
  currentUserId: string;
};

const categories = [
  { value: "all", label: "All Posts" },
  { value: "meals", label: "Meals" },
  { value: "movement", label: "Movement" },
  { value: "little_wins", label: "Little Wins" },
  { value: "motivation", label: "Motivation" },
  { value: "general", label: "General" },
];

const categoryLabels: Record<string, string> = {
  general: "General",
  meals: "Meals",
  movement: "Movement",
  little_wins: "Little Wins",
  motivation: "Motivation",
};

function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LoungeFeed({
  posts,
  currentUserId,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter(
          (post) => post.category === activeCategory
        );

  return (
    <section>
      {/* FEED HEADING */}
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
          THE COMMUNITY FEED
        </p>

        <h2 className="mt-2 font-serif text-2xl text-[#302521]">
          The latest from the Lounge ♡
        </h2>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const selected =
            activeCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() =>
                setActiveCategory(category.value)
              }
              aria-pressed={selected}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[11px] transition ${
                selected
                  ? "border-[#B98F87] bg-[#DDB5AE] text-[#302521]"
                  : "border-[#E9DAD3] bg-white text-[#806D65] hover:border-[#B98F87]"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* EMPTY FEED */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-[#E9DAD3] bg-white px-6 py-10 text-center shadow-sm">
          <div className="mb-5 text-3xl text-[#A77B73]">
            ♡
          </div>

          <h3 className="font-serif text-2xl text-[#302521]">
            {activeCategory === "all"
              ? "Something good is growing here."
              : "Nothing here just yet ♡"}
          </h3>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#806D65]">
            {activeCategory === "all"
              ? "A place for little wins, honest conversations, encouragement, and showing up together."
              : "Be the first to share something in this category."}
          </p>

          <p className="mt-7 text-[10px] tracking-[0.2em] text-[#A77B73]">
            {activeCategory === "all"
              ? "BE THE FIRST TO SHARE ♡"
              : "YOUR NEXT POST COULD GO HERE"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-[#E9DAD3] bg-white p-5 shadow-sm"
            >
              {/* POST HEADER */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-lg text-[#77574E]">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={`${post.authorName}'s avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    post.authorName
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#302521]">
                    {post.authorName}
                  </p>

                  <p className="truncate text-xs text-[#A18A82]">
                    {post.authorUsername
                      ? `@${post.authorUsername}`
                      : "Lounge Member"}
                    {" · "}
                    {formatPostDate(post.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[#F7F1ED] px-3 py-2 text-[10px] text-[#A77B73]">
                    {categoryLabels[post.category] ||
                      "General"}
                  </span>

                  <LoungePostMenu
                    postId={post.id}
                    authorId={post.userId}
                    isOwner={
                      post.userId === currentUserId
                    }
                    photoPaths={post.photos.map(
                      (photo) => photo.storagePath
                    )}
                    content={post.content}
                    category={post.category}
                  />
                </div>
              </div>

              {/* POST CAPTION */}
              <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#302521]">
                {post.content}
              </p>

              {/* POST PHOTOS */}
              {post.photos.length > 0 && (
                <div
                  className={`mt-4 grid gap-2 ${
                    post.photos.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-2"
                  }`}
                >
                  {post.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-2xl bg-[#F7F1ED]"
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

              {/* LIKES + COMMENTS */}
              <div className="mt-4 border-t border-[#F0E6E1] pt-2">
                <div className="flex flex-wrap items-start gap-x-3">
                  <LoungeLikeButton
                    postId={post.id}
                    currentUserId={currentUserId}
                    initialCount={post.likeCount}
                    initiallyLiked={post.likedByMe}
                  />

                  <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <LoungeComments
                      postId={post.id}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>
              </div>

              {/* LITTLE WINS MESSAGE ONLY */}
              {post.category === "little_wins" && (
                <div className="mt-3">
                  <p className="text-xs italic text-[#A77B73]">
                    A little progress is still progress. ♡
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
