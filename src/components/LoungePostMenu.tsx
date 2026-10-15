
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoungeReportModal from "@/components/LoungeReportModal";

type Props = {
  postId: string;
  authorId: string;
  isOwner: boolean;
  photoPaths?: string[];
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
  content,
  category,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
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

  async function saveEdit() {
    if (!isOwner || saving) return;

    const text = editedContent.trim();

    if (!text) {
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
