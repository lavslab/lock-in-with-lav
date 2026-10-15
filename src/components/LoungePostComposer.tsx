
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

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(
    null
  );
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Keep track of preview URLs so we can release them safely.
  const previewUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

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
        setError("Only JPEG, PNG, and WebP photos are supported.");
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

    // Release the old preview after replacing it.
    releasePreview(oldPreview);

    setEditingPhotoId(null);
    setError("");
    setSuccess("");
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

      // Create the post.
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

      // Upload the original or adjusted photos.
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
          throw new Error("We couldn't attach one of your photos.");
        }
      }

      // Clear photo previews after a successful post.
      photos.forEach((photo) => releasePreview(photo.preview));

      setPhotos([]);
      setContent("");
      setCategory("general");
      setSuccess("Your post has been shared to the Lounge ♡");

      router.refresh();
    } catch (err) {
      // Remove incomplete posts. The database trigger queues
      // any attached photos for secure server-side cleanup.
      // Uploaded files without photo records can be detected
      // by the orphan scan after the safety waiting period.
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
    <section className="mb-6 rounded-3xl border border-[#E9DAD3] bg-white p-5 shadow-sm">
      {/* PROFILE */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-lg text-[#77574E]">
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

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#302521]">
            {displayName}
          </p>

          <p className="truncate text-xs text-[#A18A82]">
            {username
              ? `@${username}`
              : "Make yourself at home ♡"}
          </p>
        </div>

        <Link
          href="/dashboard/lounge/profile"
          aria-label="Edit Lounge profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F1ED] text-lg text-[#806D65] transition hover:bg-[#EAD8D3]"
        >
          ✎
        </Link>
      </div>

      {/* CAPTION */}
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="What's on your mind? Share a little something ♡"
        disabled={posting}
        className="mt-5 w-full resize-none rounded-2xl bg-[#F7F1ED] px-4 py-4 text-sm text-[#302521] outline-none placeholder:text-[#A18A82] focus:ring-1 focus:ring-[#B98F87]"
      />

      {/* CATEGORY */}
      <div className="mt-4">
        <label
          htmlFor="lounge-post-category"
          className="mb-2 block text-[10px] tracking-[0.2em] text-[#806D65]"
        >
          POST CATEGORY
        </label>

        <select
          id="lounge-post-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={posting}
          className="w-full rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-3 text-sm text-[#806D65] outline-none"
        >
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
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
              className="overflow-hidden rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED]"
            >
              <div className="relative aspect-square">
                <img
                  src={photo.preview}
                  alt="Selected post photo"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={posting}
                  aria-label="Remove selected photo"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg text-[#302521] shadow-sm disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                onClick={() => setEditingPhotoId(photo.id)}
                disabled={posting}
                className="w-full bg-white px-2 py-3 text-center text-[11px] font-medium tracking-wide text-[#A77B73] transition hover:bg-[#F1E6E1] disabled:opacity-50"
              >
                ✎ ADJUST PHOTO ♡
              </button>
            </div>
          ))}
        </div>
      )}

      {/* POST ACTIONS */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor="lounge-post-photos"
          className={`text-xs text-[#A77B73] ${
            posting || photos.length >= MAX_PHOTOS
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          + ADD PHOTOS ({photos.length}/4)
        </label>

        <input
          id="lounge-post-photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={selectPhotos}
          disabled={posting || photos.length >= MAX_PHOTOS}
          className="sr-only"
        />

        <button
          type="button"
          onClick={createPost}
          disabled={posting || editingPhotoId !== null}
          className="rounded-full bg-[#DDB5AE] px-7 py-3 text-xs tracking-[0.16em] text-[#302521] transition hover:bg-[#D3A49C] disabled:opacity-50"
        >
          {posting ? "SHARING..." : "SHARE POST ♡"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-xs text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 text-xs text-[#7C8B70]">
          {success}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-5 text-[#A18A82]">
        Posts are visible to Lounge members. Only share photos
        you&apos;re comfortable sharing with the community.
      </p>

      {/* PHOTO EDITOR */}
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
