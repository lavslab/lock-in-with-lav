
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChallengeLength,
  DEFAULT_CHALLENGE_LENGTH,
  getChallengeEndDate,
} from "@/lib/challenge";

const challengeOptions: {
  days: ChallengeLength;
  label: string;
  description: string;
}[] = [
  {
    days: 21,
    label: "RESET",
    description: "get back into your rhythm.",
  },
  {
    days: 30,
    label: "CONSISTENCY",
    description: "build the habit of showing up.",
  },
  {
    days: 60,
    label: "DEEPER",
    description: "give yourself time to really change.",
  },
  {
    days: 75,
    label: "FULL LOCK IN",
    description: "the complete Lock In experience.",
  },
];

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatLongDate(dateString: string) {
  if (!dateString) return "Choose a date";

  return parseLocalDate(dateString).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateObject(date: Date) {
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const today = useMemo(() => getLocalDateString(new Date()), []);

  const [firstName, setFirstName] = useState("there");

  const [selectedLength, setSelectedLength] =
    useState<ChallengeLength>(DEFAULT_CHALLENGE_LENGTH);

  const [selectedDate, setSelectedDate] = useState(today);

  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      const savedName = user.user_metadata?.name;

      if (typeof savedName === "string" && savedName.trim()) {
        setFirstName(savedName.trim());
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (profileError) {
        console.error("Could not load profile:", profileError);

        setErrorMessage(
          "We couldn't load your Lock In profile. Please try again."
        );

        setIsCheckingUser(false);
        return;
      }

      if (profile?.challenge_start_date) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingUser(false);
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const endDate = useMemo(() => {
    if (!selectedDate) return null;

    return getChallengeEndDate(selectedDate, selectedLength);
  }, [selectedDate, selectedLength]);

  const startChallenge = async () => {
    if (isStarting || !selectedDate) return;

    setErrorMessage("");
    setIsStarting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      const { error } = await supabase.rpc("start_my_challenge", {
        p_start_date: selectedDate,
        p_challenge_length: selectedLength,
      });

      if (error) {
        console.error("Could not start Lock In:", error);

        setErrorMessage(
          "We couldn't start your Lock In just yet. Please try again."
        );

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Unexpected onboarding error:", error);

      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (isCheckingUser) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F7F1ED] text-[#211C19]">
        <div className="text-center">
          <p className="font-serif text-4xl italic text-[#A77B73]">
            ♡
          </p>

          <p className="mt-4 text-[10px] tracking-[0.25em] text-[#9D6F67]">
            GETTING THINGS READY
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] flex-col px-4 pb-8 pt-6 sm:px-8 sm:pt-8 lg:px-12">
        {/* BRAND */}
        <header className="mx-auto flex w-full max-w-[680px] items-center justify-between pb-5">
          <div>
            <p className="font-serif text-[22px] leading-none tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1.5 text-[9px] tracking-[0.43em] text-[#9D6F67]">
              WITH LAV
            </p>
          </div>

          <span
            aria-hidden="true"
            className="font-serif text-2xl text-[#A77B73]"
          >
            ♡
          </span>
        </header>

        {/* MAIN ONBOARDING CARD */}
        <section className="mx-auto w-full max-w-[680px] flex-1">
          <div className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 pb-7 pt-6 shadow-[0_12px_40px_rgba(33,28,25,0.035)] sm:rounded-[2.25rem] sm:px-10 sm:pb-10 sm:pt-9">
            {/* WELCOME */}
            <div className="border-b border-[#DED0CB] pb-7 text-center sm:pb-9">
              <p className="text-[10px] font-medium tracking-[0.22em] text-[#9D6F67]">
                WELCOME TO YOUR NEXT CHAPTER
              </p>

              <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-[-0.035em] sm:text-[58px]">
                Ready to{" "}
                <span className="italic text-[#A77B73]">
                  lock in? ♡
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-[370px] text-[13px] leading-6 text-[#806E68] sm:text-sm">
                Hey {firstName}! Choose your journey.
                We'll take it one day at a time.
              </p>
            </div>

            {/* CHALLENGE LENGTH */}
            <div className="pt-7 sm:pt-9">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-medium tracking-[0.16em] text-[#9D6F67]">
                  01 / CHOOSE YOUR CHALLENGE
                </p>

                <span className="font-serif text-lg italic text-[#A77B73]">
                  make it yours.
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                {challengeOptions.map((option) => {
                  const isSelected = selectedLength === option.days;

                  return (
                    <button
                      key={option.days}
                      type="button"
                      disabled={isStarting}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedLength(option.days)}
                      className={`relative min-h-[135px] rounded-[1.35rem] border p-4 text-left transition duration-200 sm:min-h-[150px] sm:p-5 ${
                        isSelected
                          ? "border-[#C99C93] bg-[#EEDAD5]"
                          : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#C99C93] hover:bg-[#F7F1ED]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-serif text-[42px] leading-none tracking-[-0.04em] text-[#211C19] sm:text-5xl">
                            {option.days}
                          </span>

                          <span className="ml-1.5 text-[9px] tracking-[0.12em] text-[#806E68]">
                            DAYS
                          </span>
                        </div>

                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                            isSelected
                              ? "border-[#9D6F67] bg-[#9D6F67] text-white"
                              : "border-[#D5C3BC] text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </div>

                      <p className="mt-4 text-[10px] font-medium tracking-[0.14em] text-[#9D6F67]">
                        {option.label}
                      </p>

                      <p className="mt-1.5 font-serif text-[13px] italic leading-5 text-[#806E68] sm:text-sm">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* START DATE */}
            <div className="mt-8 border-t border-[#DED0CB] pt-7 sm:mt-9 sm:pt-9">
              <p className="text-[10px] font-medium tracking-[0.16em] text-[#9D6F67]">
                02 / CHOOSE YOUR START DATE
              </p>

              <p className="mt-2 font-serif text-[15px] italic text-[#806E68]">
                Every journey has a day one. ♡
              </p>

              <label
                htmlFor="challenge-start-date"
                className="mt-5 block text-[11px] font-medium text-[#806E68]"
              >
                Your Day 01
              </label>

              <input
                id="challenge-start-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                disabled={isStarting}
                className="mt-2 block min-h-[52px] w-full min-w-0 rounded-[1rem] border border-[#DED0CB] bg-white px-4 py-3 text-base text-[#211C19] outline-none transition focus:border-[#A77B73] focus:ring-2 focus:ring-[#EEDAD5] disabled:opacity-60"
              />

              <p className="mt-2 text-[11px] leading-5 text-[#927D76]">
                Pick the date that feels right for you.
              </p>
            </div>

            {/* JOURNEY SUMMARY */}
            <div className="mt-7 rounded-[1.35rem] border border-[#E8DAD4] bg-[#F7F1ED] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-medium tracking-[0.16em] text-[#9D6F67]">
                  YOUR JOURNEY AT A GLANCE
                </p>

                <span className="font-serif text-lg italic text-[#A77B73]">
                  {selectedLength} days. ♡
                </span>
              </div>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-[#DED0CB] pt-5">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.14em] text-[#927D76]">
                    DAY 01
                  </p>

                  <p className="mt-2 font-serif text-[14px] leading-5 text-[#211C19] sm:text-base">
                    {formatLongDate(selectedDate)}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="font-serif text-xl text-[#A77B73]"
                >
                  →
                </span>

                <div className="min-w-0 text-right">
                  <p className="text-[10px] tracking-[0.14em] text-[#927D76]">
                    FINAL DAY
                  </p>

                  <p className="mt-2 font-serif text-[14px] leading-5 text-[#211C19] sm:text-base">
                    {endDate ? formatDateObject(endDate) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-[1rem] border border-[#C99C93] bg-[#F8EBE7] px-4 py-3"
              >
                <p className="text-[12px] leading-5 text-[#8F5149]">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* ACTION */}
            <div className="mt-7">
              <button
                type="button"
                disabled={isStarting || !selectedDate}
                onClick={startChallenge}
                className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#211C19] px-6 py-4 text-[11px] font-medium tracking-[0.17em] text-[#F7F1ED] transition hover:bg-[#3A302C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? "STARTING YOUR JOURNEY..." : "BEGIN MY LOCK IN →"}
              </button>

              <p className="mt-4 text-center font-serif text-[16px] italic text-[#A77B73]">
                show up for yourself. ♡
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mx-auto mt-7 flex w-full max-w-[680px] items-center justify-between gap-4 border-t border-[#DED0CB] pt-5">
          <p className="text-[9px] tracking-[0.18em] text-[#9A8780]">
            LOCK IN WITH LAV
          </p>

          <p className="font-serif text-[13px] italic text-[#A77B73]">
            just documenting discipline. ♡
          </p>
        </footer>
      </div>
    </main>
  );
}
