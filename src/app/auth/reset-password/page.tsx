"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setIsReady(Boolean(session));
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {
        if (mounted && session) {
          setIsReady(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    if (!password || !confirmPassword) {
      setIsError(true);
      setMessage("Enter your new password in both fields. ♡");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage("Your password needs to be at least 8 characters. ♡");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Those passwords don’t match just yet. ♡");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setMessage("Password updated. You’re back in. ♡");
    setIsLoading(false);

    setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="grid min-h-screen md:grid-cols-2">
        {/* LEFT PANEL */}
        <section className="hidden bg-[#211C19] px-8 py-8 text-[#F7F1ED] md:flex md:flex-col md:justify-between lg:px-12">
          <div>
            <p className="font-serif text-2xl tracking-[0.16em]">LOCK IN</p>
            <p className="mt-1 text-[8px] tracking-[0.5em] text-[#DDB5AE]">
              WITH LAV
            </p>
          </div>

          <div className="max-w-lg">
            <p className="mb-5 text-[8px] tracking-[0.34em] text-[#DDB5AE]">
              PASSWORD RESET
            </p>

            <h1 className="font-serif text-5xl leading-[0.92] lg:text-6xl">
              A fresh password.
              <br />
              <span className="italic text-[#DDB5AE]">Same commitment.</span>
            </h1>

            <p className="mt-7 max-w-sm font-serif text-base italic leading-relaxed text-[#E9DCD7]">
              get back to building the routine you promised yourself. ♡
            </p>
          </div>

          <div className="border-t border-[#4A403B] pt-5">
            <p className="text-[7px] tracking-[0.32em] text-[#A9958D]">
              75 DAYS · ONE DAY AT A TIME
            </p>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 md:px-10">
          <div className="w-full max-w-md">
            <div className="mb-12 md:hidden">
              <p className="font-serif text-2xl tracking-[0.16em]">LOCK IN</p>
              <p className="mt-1 text-[8px] tracking-[0.5em] text-[#A77B73]">
                WITH LAV
              </p>
            </div>

            <p className="mb-5 text-[8px] tracking-[0.34em] text-[#A77B73]">
              ALMOST THERE
            </p>

            <h2 className="font-serif text-5xl leading-[0.95]">
              Choose your
              <br />
              <span className="italic text-[#A77B73]">new password.</span>
            </h2>

            <p className="mt-5 font-serif text-base italic text-[#8D7770]">
              then you&apos;re right back in. ♡
            </p>

            {!isReady ? (
              <div className="mt-10 rounded-2xl border border-[#E1D3CE] bg-[#FBF8F6] px-5 py-5">
                <p className="font-serif text-sm italic text-[#806E68]">
                  Checking your reset link... ♡
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-10 space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[8px] tracking-[0.28em] text-[#806E68]"
                  >
                    NEW PASSWORD
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#DCCBC5] bg-[#FBF8F6] px-4 py-4 text-sm outline-none transition focus:border-[#A77B73]"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-[8px] tracking-[0.28em] text-[#806E68]"
                  >
                    CONFIRM NEW PASSWORD
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#DCCBC5] bg-[#FBF8F6] px-4 py-4 text-sm outline-none transition focus:border-[#A77B73]"
                    placeholder="••••••••"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 font-serif text-sm italic ${
                      isError
                        ? "border-[#D8B5AE] bg-[#F4E7E3] text-[#8C5E56]"
                        : "border-[#D8C9C3] bg-[#F1E6E2] text-[#6F5D57]"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#211C19] px-6 py-4 text-[9px] tracking-[0.3em] text-[#F7F1ED] transition hover:bg-[#3A312D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "UPDATING..." : "RESET MY PASSWORD →"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="mt-7 w-full text-center text-[8px] tracking-[0.25em] text-[#A77B73] transition hover:text-[#211C19]"
            >
              ← BACK TO LOG IN
            </button>

            <p className="mt-12 text-center font-serif text-sm italic text-[#A77B73]">
              back to your routine. ♡
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}