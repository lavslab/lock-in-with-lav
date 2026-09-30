"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [resending, setResending] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const emailChanged = searchParams.get("email_changed");
    const emailChange = searchParams.get("email_change");
    const authError = searchParams.get("error");

    if (emailChanged === "true") {
      setMode("login");
      setError("");
      setMessage(
        "Email updated successfully. Sign in with your new email to continue. ♡"
      );
      return;
    }

    if (emailChange === "continue") {
      setMode("login");
      setError("");
      setMessage(
        "Your email change is almost complete. If you've confirmed both emails, sign in with your new email to continue. ♡"
      );
      return;
    }

    if (authError === "confirmation_failed") {
      setMode("login");
      setMessage("");
      setError(
        "That confirmation link couldn't be completed. Please try again or request a new link."
      );
      return;
    }

    if (authError === "missing_confirmation_code") {
      setMode("login");
      setMessage("");
      setError(
        "That confirmation link is incomplete. Please try the newest email we sent you."
      );
    }
  }, []);

  async function restoreServerSession(
    accessToken: string,
    refreshToken: string
  ) {
    try {
      const response = await fetch("/auth/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        console.error(
          "Could not restore server session:",
          await response.text()
        );
        return false;
      }

      return true;
    } catch (restoreError) {
      console.error("Could not restore server session:", restoreError);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setConfirmationSent(false);

    try {
      // FORGOT PASSWORD
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage(
          "Check your inbox. We sent you a link to reset your password. ♡"
        );

        return;
      }

      // SIGN UP
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
            },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session && data.user) {
          const restored = await restoreServerSession(
            data.session.access_token,
            data.session.refresh_token
          );

          if (!restored) {
            setError("We couldn't keep you signed in. Please try again.");
            return;
          }

          router.replace("/onboarding");
          return;
        }

        setMessage(
          "Account created. Check your email to confirm your account. ♡"
        );

        return;
      }

      // LOG IN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user || !data.session) {
        setError("We couldn't load your account. Please try again.");
        return;
      }

      // Keep the native Capacitor session and the server-side
      // Supabase cookie session in sync before entering the app.
      const restored = await restoreServerSession(
        data.session.access_token,
        data.session.refresh_token
      );

      if (!restored) {
        setError("We couldn't keep you signed in. Please try again.");
        return;
      }

      // The dashboard layout will determine whether this user
      // belongs on the dashboard or needs to finish onboarding.
      window.location.replace("/dashboard");
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email || resending || confirmationSent) return;

    setResending(true);
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setConfirmationSent(true);

      window.setTimeout(() => {
        setConfirmationSent(false);
      }, 30000);
    } catch {
      setError("We couldn't resend the email. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function switchMode(newMode: "login" | "signup" | "forgot") {
    setMode(newMode);
    setMessage("");
    setError("");
    setConfirmationSent(false);
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden bg-[#211C19] px-12 py-10 text-[#F7F1ED] lg:flex lg:flex-col">
          <Link href="/" className="inline-block w-fit">
            <p className="font-serif text-3xl tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1 text-[8px] tracking-[0.55em] text-[#DDB5AE]">
              WITH LAV
            </p>
          </Link>

          <div className="my-auto max-w-xl">
            <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
              YOUR JOURNEY • YOUR TIMELINE
            </p>

            <h1 className="mt-8 font-serif text-7xl leading-[0.88] xl:text-8xl">
              Your journey
              <span className="block italic text-[#DDB5AE]">
                starts here.
              </span>
            </h1>

            <p className="mt-8 max-w-md font-serif text-2xl italic leading-relaxed text-[#D6C8C3]">
              show up. build the routine.
              <br />
              1% better daily. ♡
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#493D39] pt-6">
            <p className="text-[7px] tracking-[0.25em] text-[#9F8D87]">
              SHOW UP • ONE DAY AT A TIME
            </p>

            <span className="font-serif text-xl text-[#DDB5AE]">
              ♡
            </span>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 md:px-12">
          <div className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <Link href="/" className="mb-14 inline-block lg:hidden">
              <p className="font-serif text-2xl tracking-[0.08em]">
                LOCK IN
              </p>

              <p className="mt-1 text-[7px] tracking-[0.5em] text-[#9D6F67]">
                WITH LAV
              </p>
            </Link>

            <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
              {mode === "signup"
                ? "JOIN THE CHALLENGE"
                : mode === "login"
                  ? "WELCOME BACK"
                  : "PASSWORD RESET"}
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-none md:text-6xl">
              {mode === "signup" ? (
                <>
                  Let&apos;s
                  <span className="italic text-[#A77B73]">
                    {" "}lock in.
                  </span>
                </>
              ) : mode === "login" ? (
                <>
                  Welcome
                  <span className="italic text-[#A77B73]">
                    {" "}back. ♡
                  </span>
                </>
              ) : (
                <>
                  Let&apos;s get you
                  <span className="block italic text-[#A77B73]">
                    back in.
                  </span>
                </>
              )}
            </h2>

            <p className="mt-5 font-serif text-xl italic text-[#8F7C76]">
              {mode === "signup"
                ? "your next chapter starts here. ♡"
                : mode === "login"
                  ? "pick up where you left off."
                  : "we'll send a reset link to your inbox. ♡"}
            </p>

            {mode !== "forgot" && (
              <div className="mt-9 grid grid-cols-2 rounded-full bg-[#EEE3DF] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`rounded-full px-5 py-3 text-[7px] tracking-[0.22em] transition ${
                    mode === "signup"
                      ? "bg-[#211C19] text-[#F7F1ED]"
                      : "text-[#8F655E]"
                  }`}
                >
                  CREATE ACCOUNT
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`rounded-full px-5 py-3 text-[7px] tracking-[0.22em] transition ${
                    mode === "login"
                      ? "bg-[#211C19] text-[#F7F1ED]"
                      : "text-[#8F655E]"
                  }`}
                >
                  LOG IN
                </button>
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className={
                mode === "forgot"
                  ? "mt-9 space-y-5"
                  : "mt-8 space-y-5"
              }
            >
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="name"
                    className="text-[7px] tracking-[0.25em] text-[#806E68]"
                  >
                    FIRST NAME
                  </label>

                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="mt-2 w-full rounded-2xl border border-[#D8C7C1] bg-[#FBF8F6] px-5 py-4 font-serif text-lg outline-none transition placeholder:text-[#C1AFAA] focus:border-[#A77B73]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="text-[7px] tracking-[0.25em] text-[#806E68]"
                >
                  EMAIL
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-2xl border border-[#D8C7C1] bg-[#FBF8F6] px-5 py-4 font-serif text-lg outline-none transition placeholder:text-[#C1AFAA] focus:border-[#A77B73]"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <label
                    htmlFor="password"
                    className="text-[7px] tracking-[0.25em] text-[#806E68]"
                  >
                    PASSWORD
                  </label>

                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl border border-[#D8C7C1] bg-[#FBF8F6] px-5 py-4 font-serif text-lg outline-none transition placeholder:text-[#C1AFAA] focus:border-[#A77B73]"
                  />

                  {mode === "signup" && (
                    <p className="mt-2 text-[7px] tracking-[0.1em] text-[#A7938D]">
                      AT LEAST 6 CHARACTERS
                    </p>
                  )}

                  {mode === "login" && (
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="font-serif text-sm italic text-[#A77B73] transition hover:text-[#806E68]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-[#D9B6AF] bg-[#F1E2DE] px-5 py-4">
                  <p className="text-sm text-[#8F5148]">
                    {error}
                  </p>
                </div>
              )}

              {/* SUCCESS */}
              {message && (
                <div className="rounded-2xl border border-[#CDBCB5] bg-[#EEE6E2] px-5 py-4">
                  <p className="font-serif text-lg italic text-[#806E68]">
                    {message}
                  </p>

                  {mode === "signup" &&
                    message.includes("Check your email") && (
                      <div className="mt-3 border-t border-[#D8C7C1] pt-3">
                        <p className="text-[7px] tracking-[0.14em] text-[#927D76]">
                          DIDN&apos;T GET IT?
                        </p>

                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          disabled={resending || confirmationSent}
                          className="mt-2 font-serif text-sm italic text-[#A77B73] underline underline-offset-4 transition hover:text-[#806E68] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {resending
                            ? "Sending..."
                            : confirmationSent
                              ? "Email sent again ♡"
                              : "Resend confirmation email"}
                        </button>
                      </div>
                    )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#211C19] px-8 py-4 text-[8px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? mode === "login"
                    ? "LOGGING IN..."
                    : mode === "signup"
                      ? "CREATING ACCOUNT..."
                      : "SENDING..."
                  : mode === "signup"
                    ? "CREATE MY ACCOUNT →"
                    : mode === "login"
                      ? "LOG IN →"
                      : "SEND RESET LINK →"}
              </button>

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full py-2 text-[7px] tracking-[0.22em] text-[#927D76] transition hover:text-[#211C19]"
                >
                  ← BACK TO LOG IN
                </button>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="font-serif text-lg italic text-[#A77B73]">
                {mode === "forgot"
                  ? "we'll get you back in. ♡"
                  : "one day at a time. ♡"}
              </p>

              <Link
                href="/"
                className="mt-5 inline-block text-[6px] tracking-[0.25em] text-[#927D76]"
              >
                ← BACK HOME
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}