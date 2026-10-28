
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoungeReportModal from "@/components/LoungeReportModal";
import LoungePostPhotoEditor from "@/components/LoungePostPhotoEditor";


type Props = {
  postId: string;
  authorId: string;
  isOwner: boolean;
  photoPaths?: string[];
  hasVideo: boolean;
  photos: {
    id: string;
    storagePath: string;
    url: string;
  }[];
  content: string;
  category: string;
};


const categories = [
  { value: "general", label: "General" },
  { value: "meals", label: "Meals" },
  { value: "movement", label: "Movement" },
  { value: "little_wins", label: "Little Wins" },
  { value: "motivation", label: "Motivation" },
];

export default function LoungePostMenu({
  postId,
  authorId,
  isOwner,
    photos,
     hasVideo,
  content,
  category,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [confirmBlocking, setConfirmBlocking] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editedContent, setEditedContent] = useState(content);
  const [editedCategory, setEditedCategory] = useState(category);
  const [error, setError] = useState("");

  function startEditing() {
    setEditedContent(content);
    setEditedCategory(category);
    setError("");
    setOpen(false);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditedContent(content);
    setEditedCategory(category);
    setError("");
  }

  function startReporting() {
    setOpen(false);
    setError("");
    setReporting(true);
  }

  function startBlocking() {
    setOpen(false);
    setError("");
    setConfirmBlocking(true);
  }

  async function blockMember() {
    if (isOwner || blocking || !authorId) return;

    setBlocking(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      if (user.id === authorId) {
        throw new Error("You can't block yourself.");
      }

      const { error: blockError } = await supabase
        .from("lounge_blocks")
        .insert({
          blocker_id: user.id,
          blocked_id: authorId,
        });

      if (blockError) {
        throw new Error(blockError.message);
      }

      setConfirmBlocking(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't block this member. Please try again."
      );
    } finally {
      setBlocking(false);
    }
  }


async function saveEditedPhoto(photoId: string, blob: Blob) {
  if (!isOwner) {
    throw new Error("You can only edit your own photos.");
  }

  const photo = photos.find((item) => item.id === photoId);

  if (!photo) {
    throw new Error("Photo not found.");
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Please sign in again.");
  }

  const newPath = `${user.id}/${postId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("lounge-posts")
    .upload(newPath, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Could not upload your adjusted photo.");
  }

  const { data: updated, error: updateError } = await supabase
    .from("lounge_post_photos")
    .update({ storage_path: newPath })
    .eq("id", photoId)
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("storage_path", photo.storagePath)
    .select("id");

  if (updateError || !updated?.length) {
    // The orphaned upload will be handled by server-side cleanup.
    throw new Error("Could not save your adjusted photo. Please try again.");
  }

 if (localPhotoUrl) {
  URL.revokeObjectURL(localPhotoUrl);
}

setLocalPhotoUrl(null);
setEditingPhotoId(null);
setEditing(false);
router.refresh();
}


  async function saveEdit() {
    if (!isOwner || saving) return;

    const text = editedContent.trim();

    if (!text && photos.length === 0 && !hasVideo) {
  setError("Your post needs a little caption ♡");
  return;
}

    if (text.length > 2000) {
      setError("Posts must be 2,000 characters or less.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      const { data, error: updateError } = await supabase
        .from("lounge_posts")
        .update({
          content: text,
          category: editedCategory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id)
        .select("id");

      if (updateError || !data?.length) {
        throw new Error("We couldn't save your changes.");
      }

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!isOwner || deleting) return;

    const confirmed = window.confirm(
      "Delete this post? This can't be undone. ♡"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      const { data: deleted, error: deleteError } = await supabase
        .from("lounge_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id)
        .select("id");

      if (deleteError || !deleted?.length) {
        throw new Error("We couldn't delete this post.");
      }

      // The database trigger queues associated photos for
      // secure server-side Storage cleanup.
      // The browser must not delete Storage objects directly.

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Post options"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#806D65] transition hover:bg-[#F7F1ED]"
      >
        ···
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-20 min-w-44 rounded-2xl border border-[#E9DAD3] bg-white p-2 shadow-lg">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={startEditing}
                className="w-full rounded-xl px-3 py-3 text-left text-xs text-[#806D65] transition hover:bg-[#F7F1ED]"
              >
                ✎ Edit post
              </button>

              <button
                type="button"
                onClick={deletePost}
                disabled={deleting}
                className="w-full rounded-xl px-3 py-3 text-left text-xs text-red-600 transition hover:bg-[#F7F1ED] disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete post"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startReporting}
                className="w-full rounded-xl px-3 py-3 text-left text-xs text-[#806D65] transition hover:bg-[#F7F1ED]"
              >
                ⚑ Report post
              </button>

              <div className="my-1 border-t border-[#F0E6E1]" />

              <button
                type="button"
                onClick={startBlocking}
                className="w-full rounded-xl px-3 py-3 text-left text-xs text-red-600 transition hover:bg-[#F7F1ED]"
              >
                ⊘ Block member
              </button>
            </>
          )}
        </div>
      )}

      {confirmBlocking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Block Lounge member"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#302521]">
              Block this member? ♡
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#806D65]">
              You won't see each other's Lounge posts or comments,
              and you won't be able to interact with each other's
              posts.
            </p>

            <p className="mt-3 text-xs leading-5 text-[#A77B73]">
              You can unblock this member later.
            </p>

            {error && (
              <p role="alert" className="mt-4 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmBlocking(false);
                  setError("");
                }}
                disabled={blocking}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={blockMember}
                disabled={blocking}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
              >
                {blocking ? "BLOCKING..." : "BLOCK MEMBER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit Lounge post"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#302521]">
              Edit your post ♡
            </h2>

            <textarea
              value={editedContent}
              onChange={(event) =>
                setEditedContent(event.target.value)
              }
              maxLength={2000}
              rows={5}
              disabled={saving}
              className="mt-5 w-full resize-none rounded-2xl bg-[#F7F1ED] p-4 text-sm text-[#302521] outline-none focus:ring-1 focus:ring-[#B98F87]"
            />

            <label className="mt-4 block text-[10px] tracking-[0.2em] text-[#806D65]">
              POST CATEGORY
            </label>

            <select
              value={editedCategory}
              onChange={(event) =>
                setEditedCategory(event.target.value)
              }
              disabled={saving}
              className="mt-2 w-full rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-3 text-sm text-[#806D65] outline-none"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>



{/* EDIT POST PHOTOS */}
{photos.length > 0 && (
  <div className="mt-5">
    <p className="mb-3 text-[10px] tracking-[0.2em] text-[#806D65]">
      POST PHOTOS
    </p>

    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="overflow-hidden rounded-xl border border-[#E9DAD3] bg-[#F7F1ED]"
        >
          <img
            src={photo.url}
            alt="Your posted photo"
            className="aspect-square w-full object-cover"
          />

          <button
            type="button"
            
onClick={async () => {
  setError("");

  try {
    const response = await fetch(photo.url);

    if (!response.ok) {
      throw new Error("Could not load this photo.");
    }

    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);

    setLocalPhotoUrl(localUrl);
    setEditingPhotoId(photo.id);
  } catch {
    setError("Could not prepare this photo for editing.");
  }
}}

            disabled={saving}
            className="w-full bg-[#FBF8F6] px-2 py-3 text-[10px] tracking-[0.1em] text-[#A77B73] transition hover:bg-[#F1E6E1] disabled:opacity-50"
          >
            ADJUST PHOTO →
          </button>
        </div>
      ))}
    </div>
  </div>
)}

            {error && (
              <p role="alert" className="mt-4 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SAVE CHANGES ♡"}
              </button>
            </div>
          </div>
        </div>
      )}


{editingPhotoId && (() => {
  const selectedPhoto = photos.find(
    (photo) => photo.id === editingPhotoId
  );

  if (!selectedPhoto) return null;

  return (
    <LoungePostPhotoEditor
    image={localPhotoUrl ?? selectedPhoto.url}
      onCancel={() => {
  if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
  setLocalPhotoUrl(null);
  setEditingPhotoId(null);
}}  
onSave={(blob) => saveEditedPhoto(selectedPhoto.id, blob)}

    />
  );
})()}
      {reporting && (
        <LoungeReportModal
          postId={postId}
          onClose={() => setReporting(false)}
        />
      )}

      {!editing && !confirmBlocking && error && (
        <p
          role="alert"
          className="absolute right-0 top-12 z-30 w-56 rounded-xl bg-white p-3 text-xs text-red-600 shadow-lg"
        >
          {error}
        </p>
      )}
    </div>
  );
}
