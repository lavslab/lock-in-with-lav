
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoungeAvatarCropper from "@/components/LoungeAvatarCropper";
import LoungeBlockedMembers from "@/components/LoungeBlockedMembers";
import { createClient } from "@/lib/supabase/client";


const BUCKET = "lounge-avatars";
const MAX_SIZE = 2 * 1024 * 1024;

export default function LoungeProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getAvatarUrl(path: string) {
    const supabase = createClient();

    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("lounge_profiles")
        .select("display_name, username, avatar_path")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError || !data) {
        setError("We couldn't load your Lounge profile.");
      } else {
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setAvatarPath(data.avatar_path || null);

        if (data.avatar_path) {
          setAvatarUrl(getAvatarUrl(data.avatar_path));
        }
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function closeCropper() {
    if (cropImage?.startsWith("blob:")) {
      URL.revokeObjectURL(cropImage);
    }

    setCropImage(null);
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || uploading || removing) return;

    setError("");
    setSuccess("");

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Your photo must be smaller than 2 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCropImage(imageUrl);
  }

  function adjustExistingPhoto() {
    if (!avatarUrl || uploading || removing) return;

    setError("");
    setSuccess("");
    setCropImage(avatarUrl);
  }

  async function saveCroppedPhoto(blob: Blob) {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in again.");
      }

      if (blob.size > MAX_SIZE) {
        throw new Error("The cropped photo exceeds 2 MB.");
      }

      const newPath =
        `${user.id}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error("Couldn't upload your photo.");
      }

      const { data, error: updateError } = await supabase
        .from("lounge_profiles")
        .update({ avatar_path: newPath })
        .eq("user_id", user.id)
        .select("user_id")
        .single();

      if (updateError || !data) {
        await supabase.storage.from(BUCKET).remove([newPath]);
        throw new Error("Couldn't save your photo.");
      }

      const oldPath = avatarPath;

      setAvatarPath(newPath);
      setAvatarUrl(getAvatarUrl(newPath));
      setSuccess("Your profile photo has been updated ♡");

      closeCropper();
      router.refresh();

      if (oldPath && oldPath !== newPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);

        if (cleanupError) {
          console.warn("Old avatar cleanup failed.");
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!avatarPath || removing || uploading) return;

    setRemoving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in again.");
      }

      const oldPath = avatarPath;

      const { data, error: updateError } = await supabase
        .from("lounge_profiles")
        .update({ avatar_path: null })
        .eq("user_id", user.id)
        .select("user_id")
        .single();

      if (updateError || !data) {
        throw new Error("Couldn't remove your photo.");
      }

      setAvatarPath(null);
      setAvatarUrl(null);
      setSuccess("Your photo has been removed ♡");

      router.refresh();

      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([oldPath]);

      if (deleteError) {
        console.warn("Avatar file cleanup failed.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setRemoving(false);
    }
  }

  async function saveProfile() {
    if (saving || uploading || removing) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const name = displayName.trim();
      const handle = username
        .trim()
        .toLowerCase()
        .replace(/^@/, "");

      if (!name || name.length > 40) {
        throw new Error(
          "Enter a display name between 1 and 40 characters."
        );
      }

      if (handle && !/^[a-z0-9_]{3,24}$/.test(handle)) {
        throw new Error(
          "Usernames must be 3–24 characters using letters, numbers, or underscores."
        );
      }

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in again.");
      }

      const { data, error: updateError } = await supabase
        .from("lounge_profiles")
        .update({
          display_name: name,
          username: handle || null,
        })
        .eq("user_id", user.id)
        .select("user_id")
        .single();

      if (updateError || !data) {
        throw new Error(
          updateError?.code === "23505"
            ? "That username is already taken ♡"
            : "Couldn't save your profile."
        );
      }

      setSuccess("Your Lounge profile has been updated ♡");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] p-8 text-center text-[#806D65]">
        Loading your Lounge profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-8 text-[#302521]">
      <div className="mx-auto max-w-md">
        <Link
          href="/dashboard/lounge"
          className="text-xs text-[#A77B73]"
        >
          ← Back to the Lounge
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-[10px] tracking-[0.3em] text-[#A77B73]">
            YOUR COMMUNITY IDENTITY
          </p>

          <h1 className="mt-3 font-serif text-4xl">
            Lounge Profile ♡
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#806D65]">
            A little space to make your Lounge identity your own.
          </p>
        </header>

        <section className="rounded-3xl border border-[#E9DAD3] bg-white p-6 shadow-sm">
          <div className="mb-7 flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#EAD8D3] font-serif text-3xl text-[#77574E]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your Lounge avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase() || "♡"
              )}
            </div>

            <label
              htmlFor="lounge-avatar"
              className="mt-4 cursor-pointer rounded-full border border-[#DDB5AE] px-5 py-3 text-xs text-[#806D65]"
            >
              {uploading
                ? "UPLOADING..."
                : avatarPath
                ? "CHANGE PHOTO ♡"
                : "ADD PHOTO ♡"}
            </label>

            <input
              id="lounge-avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectPhoto}
              disabled={uploading || removing}
              className="sr-only"
            />

            {avatarPath && (
              <>
                <button
                  type="button"
                  onClick={adjustExistingPhoto}
                  disabled={uploading || removing}
                  className="mt-3 text-xs text-[#A77B73] underline underline-offset-4 disabled:opacity-50"
                >
                  Adjust current photo ♡
                </button>

                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={uploading || removing}
                  className="mt-3 text-xs text-[#806D65] underline underline-offset-4 disabled:opacity-50"
                >
                  {removing ? "Removing..." : "Remove photo"}
                </button>
              </>
            )}

            <p className="mt-4 text-center text-[11px] leading-5 text-[#A18A82]">
              JPEG, PNG, or WebP · Maximum 2 MB
              <br />
              Your photo will be publicly accessible.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="display-name"
                className="text-[10px] tracking-[0.2em] text-[#806D65]"
              >
                DISPLAY NAME
              </label>

              <input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                className="mt-2 w-full rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-4 text-sm outline-none focus:border-[#B98F87]"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="text-[10px] tracking-[0.2em] text-[#806D65]"
              >
                USERNAME · OPTIONAL
              </label>

              <div className="mt-2 flex items-center rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 focus-within:border-[#B98F87]">
                <span className="text-[#A77B73]">@</span>

                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={24}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-transparent px-2 py-4 text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-xs text-[#7C8B70]">
                {success}
              </p>
            )}

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving || uploading || removing}
              className="w-full rounded-full bg-[#DDB5AE] px-6 py-4 text-xs tracking-[0.18em] transition hover:bg-[#D3A49C] disabled:opacity-50"
            >
              {saving ? "SAVING..." : "SAVE CHANGES ♡"}
            </button>
          </div>
         </section>

        <LoungeBlockedMembers />

        <p className="mt-6 text-center font-serif text-sm italic text-[#A77B73]">
          Your space. Your identity. Your journey.
        </p>
      </div>

      {cropImage && (
        <LoungeAvatarCropper
          image={cropImage}
          onCancel={closeCropper}
          onSave={saveCroppedPhoto}
        />
      )}
    </main>
  );
}
