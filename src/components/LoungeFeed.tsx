
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

export default function LoungeFeed({
  posts,
  currentUserId,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState("all");

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter(
          (post) => post.category === activeCategory
        );

  return (
    <section>
      {/* FEED HEADER */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] tracking-[0.23em] text-[#9D6F67]">
            THE COMMUNITY FEED
          </p>

          <h2 className="mt-2 font-serif text-xl text-[#302521]">
            From the{" "}
            <span className="italic text-[#A77B73]">
              Lounge.
            </span>
          </h2>
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
            ♡
          </span>

          <h3 className="mt-3 font-serif text-xl text-[#302521]">
            Nothing here just yet.
          </h3>

          <p className="mt-3 text-[11px] leading-6 text-[#806D65]">
            Be the first to share something. ♡
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {filteredPosts.map((post) => (
            <article
  key={post.id}
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
                    post.authorName
                      .charAt(0)
                      .toUpperCase()
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

              {/* POST PHOTOS */}
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

              {/* ACTION ROW */}
              <div className="mt-3 flex items-start gap-3">
                <LoungeLikeButton
                  postId={post.id}
                  currentUserId={currentUserId}
                  initialCount={post.likeCount}
                  initiallyLiked={post.likedByMe}
                />

                <div className="pt-1.5">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#302521"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
                  </svg>
                </div>

                <span className="ml-auto pt-2 text-[9px] tracking-[0.14em] text-[#A77B73]">
                  {post.category
                    .replaceAll("_", " ")
                    .toUpperCase()}
                </span>
              </div>

              {/* CAPTION */}
              {post.content && (
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
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
