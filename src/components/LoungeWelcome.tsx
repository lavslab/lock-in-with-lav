
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LoungeWelcomeProps = {
  userId: string;
  defaultName: string;
};

export default function LoungeWelcome({
  userId,
  defaultName,
}: LoungeWelcomeProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(defaultName);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveProfile(skip = false) {
    if (saving) return;

    setError("");

    const name = skip
      ? "Lounge Member"
      : displayName.trim() || "Lounge Member";

    const handle = skip
      ? null
      : username.trim().toLowerCase().replace(/^@/, "") || null;

    if (name.length > 40) {
      setError("Display names must be 40 characters or less.");
      return;
    }

    if (handle && !/^[a-z0-9_]{3,24}$/.test(handle)) {
      setError(
        "Usernames must be 3–24 characters using letters, numbers, or underscores."
      );
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || authData.user?.id !== userId) {
      setError("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("lounge_profiles")
      .upsert(
        {
          user_id: userId,
          display_name: name,
          username: handle,
          welcome_completed: true,
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      if (saveError.code === "23505") {
        setError("That username is already taken. Try another ♡");
      } else {
        setError("We couldn't save your profile. Please try again.");
      }

      setSaving(false);
      return;
    }

    router.refresh();
    setSaving(false);
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#F7F1ED] px-5 py-10 text-[#302521]">
      <div className="w-full max-w-md rounded-[30px] border border-[#E9DAD3] bg-white p-7 shadow-sm sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAD8D3] text-3xl text-[#A77B73]">
            ♡
          </div>

          <p className="mt-7 text-[10px] tracking-[0.3em] text-[#A77B73]">
            YOUR COMMUNITY SPACE
          </p>

          <h1 className="mt-3 font-serif text-3xl leading-tight">
            Welcome to the Lounge ♡
          </h1>

          <p className="mx-auto mt-4 max-w-xs font-serif text-base italic leading-7 text-[#806D65]">
            Your journey is personal.
            <br />
            Your community doesn&apos;t have to be.
          </p>
        </div>

        <div className="mt-9 space-y-5">
          <div>
            <label
              htmlFor="lounge-display-name"
              className="text-[10px] tracking-[0.2em] text-[#806D65]"
            >
              DISPLAY NAME
            </label>

            <input
              id="lounge-display-name"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              maxLength={40}
              placeholder="What should we call you?"
              className="mt-2 w-full rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-4 text-sm outline-none focus:border-[#B98F87]"
            />
          </div>

          <div>
            <label
              htmlFor="lounge-username"
              className="text-[10px] tracking-[0.2em] text-[#806D65]"
            >
              USERNAME · OPTIONAL
            </label>

            <div className="mt-2 flex items-center rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 focus-within:border-[#B98F87]">
              <span className="text-[#A77B73]">@</span>

              <input
                id="lounge-username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                maxLength={24}
                placeholder="yourusername"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-transparent px-2 py-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E9DAD3] px-4 py-4 text-sm text-[#A77B73]">
            <span>♡</span>
            <span>Profile photos coming soon</span>
          </div>

          {error && (
            <p role="alert" className="text-center text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => saveProfile(false)}
            disabled={saving}
            className="w-full rounded-full bg-[#DDB5AE] px-6 py-4 text-xs tracking-[0.18em] transition hover:bg-[#D3A49C] disabled:opacity-50"
          >
            {saving ? "SAVING..." : "ENTER THE LOUNGE ♡"}
          </button>

          <button
            type="button"
            onClick={() => saveProfile(true)}
            disabled={saving}
            className="block w-full py-2 text-center text-sm text-[#806D65] underline-offset-4 hover:underline disabled:opacity-50"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </main>
  );
}
