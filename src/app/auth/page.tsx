"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function sendUserToNextStep(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("challenge_start_date")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Could not load profile:", profileError);
      setError("We couldn't load your challenge profile. Please try again.");
      return false;
    }

    if (profile?.challenge_start_date) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }

    router.refresh();
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
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
          router.push("/onboarding");
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm your account. ♡"
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (!data.user) {
          setError("We couldn't load your account. Please try again.");
          return;
        }

        await sendUserToNextStep(data.user.id);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode);
    setMessage("");
    setError("");
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
              JANUARY 01 — MARCH 16, 2027
            </p>

            <h1 className="mt-8 font-serif text-7xl leading-[0.88] xl:text-8xl">
              Your 75 days
              <span className="block italic text-[#DDB5AE]">
                start here.
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
              75 DAYS • ONE DAY AT A TIME
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
              {mode === "signup" ? "JOIN THE CHALLENGE" : "WELCOME BACK"}
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-none md:text-6xl">
              {mode === "signup" ? (
                <>
                  Let&apos;s
                  <span className="italic text-[#A77B73]">
                    {" "}lock in.
                  </span>
                </>
              ) : (
                <>
                  Welcome
                  <span className="italic text-[#A77B73]">
                    {" "}back. ♡
                  </span>
                </>
              )}
            </h2>

            <p className="mt-5 font-serif text-xl italic text-[#8F7C76]">
              {mode === "signup"
                ? "your 75 days are waiting. ♡"
                : "pick up where you left off."}
            </p>

            {/* MODE TOGGLE */}
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

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              </div>

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
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#211C19] px-8 py-4 text-[8px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "ONE SEC..."
                  : mode === "signup"
                  ? "CREATE MY ACCOUNT →"
                  : "LOG IN →"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="font-serif text-lg italic text-[#A77B73]">
                one day at a time. ♡
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