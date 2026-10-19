
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import LoungePostPhotoEditor from "@/components/LoungePostPhotoEditor";

const MAX_PHOTOS = 4;
const MAX_SIZE = 5 * 1024 * 1024;

const categories = [
  { value: "general", label: "General" },
  { value: "meals", label: "Meals" },
  { value: "movement", label: "Movement" },
  { value: "little_wins", label: "Little Wins" },
  { value: "motivation", label: "Motivation" },
];

type SelectedPhoto = {
  id: string;
  file: File;
  preview: string;
};

type Props = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
};

export default function LoungePostComposer({
  displayName,
  username,
  avatarUrl,
}: Props) {
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<
    string | null
  >(null);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      textareaRef.current?.focus();
    }
  }, [isExpanded]);

  function createPreview(file: File) {
    const url = URL.createObjectURL(file);
    previewUrls.current.add(url);
    return url;
  }

  function releasePreview(url: string) {
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
  }

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    setError("");
    setSuccess("");

    if (files.length + photos.length > MAX_PHOTOS) {
      setError("You can add up to four photos per post.");
      return;
    }

    for (const file of files) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type
        )
      ) {
        setError(
          "Only JPEG, PNG, and WebP photos are supported."
        );
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Each photo must be 5 MB or smaller.");
        return;
      }
    }

    const nextPhotos: SelectedPhoto[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: createPreview(file),
    }));

    setPhotos((current) => [...current, ...nextPhotos]);
    setIsExpanded(true);
  }

  function removePhoto(id: string) {
    const photo = photos.find((item) => item.id === id);

    if (photo) {
      releasePreview(photo.preview);
    }

    setPhotos((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingPhotoId === id) {
      setEditingPhotoId(null);
    }
  }

  const editingPhoto =
    photos.find((photo) => photo.id === editingPhotoId) ?? null;

  async function saveAdjustedPhoto(blob: Blob) {
    if (!editingPhoto || posting) return;

    if (blob.size > MAX_SIZE) {
      throw new Error(
        "The adjusted photo is too large. Try a smaller crop."
      );
    }

    const updatedFile = new File(
      [blob],
      `lounge-photo-${crypto.randomUUID()}.jpg`,
      { type: "image/jpeg" }
    );

    const newPreview = createPreview(updatedFile);
    const oldPreview = editingPhoto.preview;

    setPhotos((current) =>
      current.map((photo) =>
        photo.id === editingPhoto.id
          ? {
              ...photo,
              file: updatedFile,
              preview: newPreview,
            }
          : photo
      )
    );

    releasePreview(oldPreview);
    setEditingPhotoId(null);
    setError("");
    setSuccess("");
  }

  function closeComposer() {
    if (posting || editingPhotoId) return;

    // Keep the draft if the member closes the composer.
    setIsExpanded(false);
  }

  async function createPost() {
    if (posting || editingPhotoId) return;

    setError("");
    setSuccess("");

    const text = content.trim();

    if (!text) {
      setError("Write a little something before posting ♡");
      return;
    }

    if (text.length > 2000) {
      setError("Posts must be 2,000 characters or less.");
      return;
    }

    setPosting(true);

    const supabase = createClient();
    let createdPostId: string | null = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      const { data: post, error: postError } = await supabase
        .from("lounge_posts")
        .insert({
          user_id: user.id,
          content: text,
          category,
        })
        .select("id")
        .single();

      if (postError || !post) {
        throw new Error("We couldn't create your post.");
      }

      createdPostId = post.id;

      for (let index = 0; index < photos.length; index++) {
        const photo = photos[index];

        const extension =
          photo.file.type === "image/png"
            ? "png"
            : photo.file.type === "image/webp"
              ? "webp"
              : "jpg";

        const path = `${user.id}/${post.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("lounge-posts")
          .upload(path, photo.file, {
            contentType: photo.file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error("One of your photos couldn't upload.");
        }

        const { error: photoError } = await supabase
          .from("lounge_post_photos")
          .insert({
            post_id: post.id,
            user_id: user.id,
            storage_path: path,
            position: index,
          });

        if (photoError) {
          throw new Error(
            "We couldn't attach one of your photos."
          );
        }
      }

      photos.forEach((photo) =>
        releasePreview(photo.preview)
      );

      setPhotos([]);
      setContent("");
      setCategory("general");
      setIsExpanded(false);
      setSuccess("Shared with the Lounge ♡");

      router.refresh();
    } catch (err) {
      // Preserve existing cleanup behaviour for incomplete posts.
      if (createdPostId) {
        const { error: deletePostError } = await supabase
          .from("lounge_posts")
          .delete()
          .eq("id", createdPostId);

        if (deletePostError) {
          console.error(
            "Post cleanup failed:",
            deletePostError
          );
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="mb-8 overflow-hidden rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6]">
      {/* COMPACT COMPOSER */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-lg text-[#77574E]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Your Lounge avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          {!isExpanded ? (
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setIsExpanded(true);
              }}
              className="min-h-11 min-w-0 flex-1 rounded-full border border-[#E9DFDA] bg-[#F7F1ED] px-4 py-3 text-left text-[11px] text-[#A08B83] transition hover:border-[#CBA9A2]"
            >
              What's on your mind? ♡
            </button>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#302521]">
                {displayName}
              </p>

              <p className="truncate text-[10px] text-[#A18A82]">
                {username
                  ? `@${username}`
                  : "Sharing with the Lounge"}
              </p>
            </div>
          )}

          <Link
            href="/dashboard/lounge/profile"
            aria-label="Edit Lounge profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F1ED] text-[#806D65] transition hover:bg-[#EAD8D3]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 5 4 4M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" />
            </svg>
          </Link>
        </div>

        {!isExpanded && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E9DFDA] pt-3">
            <p className="text-[9px] text-[#9D6F67]">
              Share a little something.
            </p>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setIsExpanded(true);
              }}
              className="rounded-full bg-[#211C19] px-5 py-2.5 text-[9px] tracking-[0.12em] text-white transition hover:bg-[#4A3933]"
            >
              CREATE POST ↗
            </button>
          </div>
        )}

        {/* EXPANDED COMPOSER */}
        {isExpanded && (
          <div className="mt-5 border-t border-[#E9DFDA] pt-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              maxLength={2000}
              rows={4}
              placeholder="A little win, a thought, a moment worth sharing... ♡"
              disabled={posting}
              className="w-full resize-none rounded-2xl bg-[#F7F1ED] px-4 py-4 text-[12px] leading-6 text-[#302521] outline-none placeholder:text-[#A18A82] focus:ring-1 focus:ring-[#B98F87]"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-[9px] text-[#A18A82]">
                {content.length}/2000
              </span>
            </div>

            <div className="mt-4">
              <label
                htmlFor="lounge-post-category"
                className="mb-2 block text-[9px] tracking-[0.16em] text-[#9D6F67]"
              >
                CATEGORY
              </label>

              <select
                id="lounge-post-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                disabled={posting}
                className="w-full rounded-xl border border-[#E9DFDA] bg-[#F7F1ED] px-4 py-3 text-[11px] text-[#806D65] outline-none focus:border-[#B98F87]"
              >
                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PHOTO PREVIEWS */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border border-[#E9DAD3] bg-[#F7F1ED]"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={photo.preview}
                        alt="Selected post photo"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePhoto(photo.id)
                        }
                        disabled={posting}
                        aria-label="Remove selected photo"
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg text-[#302521] shadow-sm disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingPhotoId(photo.id)
                      }
                      disabled={posting}
                      className="w-full bg-[#FBF8F6] px-2 py-3 text-center text-[9px] tracking-[0.12em] text-[#A77B73] transition hover:bg-[#F1E6E1] disabled:opacity-50"
                    >
                      ADJUST PHOTO ↗
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="lounge-post-photos"
                className={`flex items-center gap-2 text-[10px] text-[#A77B73] ${
                  posting || photos.length >= MAX_PHOTOS
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                  />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>

                ADD PHOTOS ({photos.length}/4)
              </label>

              <input
                id="lounge-post-photos"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhotos}
                disabled={
                  posting || photos.length >= MAX_PHOTOS
                }
                className="sr-only"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeComposer}
                  disabled={posting}
                  className="text-[9px] tracking-[0.1em] text-[#8C7770] disabled:opacity-50"
                >
                  CLOSE
                </button>

                <button
                  type="button"
                  onClick={createPost}
                  disabled={
                    posting ||
                    editingPhotoId !== null ||
                    !content.trim()
                  }
                  className="rounded-full bg-[#211C19] px-5 py-3 text-[9px] tracking-[0.13em] text-white transition hover:bg-[#4A3933] disabled:opacity-50"
                >
                  {posting ? "SHARING..." : "SHARE POST ↗"}
                </button>
              </div>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-[#A18A82]">
              Posts are visible to Lounge members. Share
              only what you're comfortable sharing.
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 text-[11px] text-red-600"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-4 text-[11px] text-[#6C8061]"
          >
            {success}
          </p>
        )}
      </div>

      {editingPhoto && (
        <LoungePostPhotoEditor
          image={editingPhoto.preview}
          onCancel={() => setEditingPhotoId(null)}
          onSave={saveAdjustedPhoto}
        />
      )}
    </section>
  );
}
