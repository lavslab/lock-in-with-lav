"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();

  // Use the same browser-client pattern as the rest of the current auth flow.
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const initial =
    !isLoadingUser && firstName && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      setIsLoadingUser(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        console.error("Could not load account:", error);
      }

      if (!user) {
        router.replace("/auth");
        return;
      }

      const savedName =
        typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name.trim()
          : "";

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setEmail(user.email ?? "");
      setIsLoadingUser(false);
    };

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const handleProfileSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanName = firstName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setProfileMessage("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      setProfileMessage("Please enter your email.");
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfileMessage("We could not find your account.");
      setIsSavingProfile(false);
      return;
    }

    const currentEmail = user.email ?? "";

    const updates: {
      email?: string;
      data: {
        name: string;
      };
    } = {
      data: {
        name: cleanName,
      },
    };

    if (cleanEmail !== currentEmail) {
      updates.email = cleanEmail;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      console.error("Could not update profile:", error);
      setProfileMessage(error.message);
      setIsSavingProfile(false);
      return;
    }

    setFirstName(cleanName);

    if (cleanEmail !== currentEmail) {
      setProfileMessage(
        "Profile saved. Check your email to confirm your new email address. ♡"
      );
    } else {
      setProfileMessage("Profile updated. ♡");
    }

    setIsSavingProfile(false);
    router.refresh();
  };

  const handlePasswordSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPasswordMessage("");

    if (!newPassword) {
      setPasswordMessage("Enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "Your new password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Your passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Could not update password:", error);
      setPasswordMessage(error.message);
      setIsSavingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated. ♡");
    setIsSavingPassword(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
      return;
    }

    router.replace("/auth");
    router.refresh();
  };

  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="flex flex-1 items-center justify-center px-6 py-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#DDB5AE] bg-[#FBF8F6] font-serif text-2xl text-[#A77B73]">
                ♡
              </div>

              <p className="mt-6 text-[10px] tracking-[0.35em] text-[#9D6F67]">
                LOCKING IN
              </p>

              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                loading your account... ♡
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="border-b border-[#DED0CB] pb-8">
            <p className="text-[10px] tracking-[0.35em] text-[#9D6F67]">
              MEMBER SETTINGS
            </p>

            <h1 className="mt-4 font-serif text-5xl md:text-6xl">
              My Account
            </h1>

            <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
              your space, your settings. ♡
            </p>
          </header>

          <div className="mt-10 max-w-4xl space-y-8">
            {/* PROFILE */}
            <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DDB5AE] font-serif text-2xl">
                  {initial}
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    PROFILE
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">
                    Account details
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#806E68]">
                    Keep your name and email address up to date.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfileSave}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="text-[10px] tracking-[0.22em] text-[#806E68]"
                  >
                    NAME
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={isLoadingUser ? "" : firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    disabled={isLoadingUser || isSavingProfile}
                    className="mt-3 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-5 py-4 text-sm outline-none transition focus:border-[#A77B73] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-[10px] tracking-[0.22em] text-[#806E68]"
                  >
                    EMAIL
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    disabled={isLoadingUser || isSavingProfile}
                    className="mt-3 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-5 py-4 text-sm outline-none transition focus:border-[#A77B73] disabled:opacity-60"
                  />
                </div>

                {profileMessage && (
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    {profileMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoadingUser || isSavingProfile}
                  className="rounded-full bg-[#211C19] px-7 py-3 text-[10px] tracking-[0.25em] text-[#F7F1ED] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingProfile ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            </section>

            {/* SECURITY */}
            <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
              <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                SECURITY
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Change password
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#806E68]">
                Choose a new password for your Lock In account.
              </p>

              <form
                onSubmit={handlePasswordSave}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="text-[10px] tracking-[0.22em] text-[#806E68]"
                  >
                    NEW PASSWORD
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={isSavingPassword}
                    className="mt-3 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-5 py-4 text-sm outline-none transition focus:border-[#A77B73] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="text-[10px] tracking-[0.22em] text-[#806E68]"
                  >
                    CONFIRM NEW PASSWORD
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={isSavingPassword}
                    className="mt-3 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-5 py-4 text-sm outline-none transition focus:border-[#A77B73] disabled:opacity-60"
                  />
                </div>

                {passwordMessage && (
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    {passwordMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-full border border-[#A77B73] px-7 py-3 text-[10px] tracking-[0.25em] text-[#6F514B] transition hover:bg-[#EAD8D3] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </section>

            {/* LOG OUT */}
            <section className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-9">
              <p className="text-[10px] tracking-[0.3em] text-[#8F655E]">
                SESSION
              </p>

              <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-serif text-3xl">
                    Done for now?
                  </h2>

                  <p className="mt-2 text-sm text-[#806E68]">
                    Your progress will be here when you come back. ♡
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="shrink-0 rounded-full bg-[#211C19] px-7 py-3 text-[10px] tracking-[0.25em] text-[#F7F1ED] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggingOut ? "LOGGING OUT..." : "LOG OUT →"}
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}