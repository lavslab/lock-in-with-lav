"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          "https://www.lockinwithlav.com/auth/callback?next=/auth/reset-password",
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        "Check your inbox. We sent you a link to reset your password. ♡"
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="grid min-h-screen lg:grid-cols-2">
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
              PASSWORD RESET
            </p>

            <h1 className="mt-8 font-serif text-7xl leading-[0.88] xl:text-8xl">
              Let&apos;s get you
              <span className="block italic text-[#DDB5AE]">
                back in.
              </span>
            </h1>

            <p className="mt-8 max-w-md font-serif text-2xl italic leading-relaxed text-[#D6C8C3]">
              reset your password.
              <br />
              pick up where you left off. ♡
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

        <section className="flex min-h-screen items-center justify-center px-6 py-12 md:px-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-14 inline-block lg:hidden">
              <p className="font-serif text-2xl tracking-[0.08em]">
                LOCK IN
              </p>

              <p className="mt-1 text-[7px] tracking-[0.5em] text-[#9D6F67]">
                WITH LAV
              </p>
            </Link>

            <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
              PASSWORD RESET
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-none md:text-6xl">
              Let&apos;s get you
              <span className="block italic text-[#A77B73]">
                back in.
              </span>
            </h2>

            <p className="mt-5 font-serif text-xl italic text-[#8F7C76]">
              we&apos;ll send a reset link to your inbox. ♡
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
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
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="mt-2 w-full rounded-2xl border border-[#D8C7C1] bg-[#FBF8F6] px-5 py-4 font-serif text-lg outline-none transition placeholder:text-[#C1AFAA] focus:border-[#A77B73]"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-[#D9B6AF] bg-[#F1E2DE] px-5 py-4">
                  <p className="text-sm text-[#8F5148]">
                    {error}
                  </p>
                </div>
              )}

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
                {loading ? "ONE SEC..." : "SEND RESET LINK →"}
              </button>
            </form>

            <Link
              href="/auth"
              className="mt-7 block w-full text-center text-[7px] tracking-[0.22em] text-[#927D76] transition hover:text-[#211C19]"
            >
              ← BACK TO LOG IN
            </Link>

            <p className="mt-12 text-center font-serif text-lg italic text-[#A77B73]">
              we&apos;ll get you back in. ♡
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}