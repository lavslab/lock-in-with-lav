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
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateObject(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/auth");
        return;
      }

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

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
  }, [router, supabase]);

  const endDate = useMemo(() => {
    return getChallengeEndDate(selectedDate, selectedLength);
  }, [selectedDate, selectedLength]);

  const startChallenge = async (startDate: string) => {
    setErrorMessage("");
    setIsStarting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        challenge_start_date: startDate,
        challenge_length: selectedLength,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Could not start Lock In:", error);

      setErrorMessage(
        "We couldn't start your Lock In just yet. Please try again."
      );

      setIsStarting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  if (isCheckingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1ED] text-[#211C19]">
        <div className="text-center">
          <p className="font-serif text-4xl italic text-[#A77B73]">♡</p>

          <p className="mt-4 text-[8px] tracking-[0.35em] text-[#9D6F67]">
            GETTING THINGS READY
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-6 py-8 md:px-10 lg:px-14">
        {/* BRAND */}
        <header className="flex items-start justify-between">
          <div>
            <p className="font-serif text-2xl tracking-[0.08em]">LOCK IN</p>

            <p className="mt-1 text-[8px] tracking-[0.5em]">WITH LAV</p>
          </div>

          <p className="hidden text-[7px] tracking-[0.3em] text-[#9D6F67] sm:block">
            YOUR JOURNEY • YOUR TIMELINE
          </p>
        </header>

        {/* MAIN CONTENT */}
        <section className="flex flex-1 items-center py-10 lg:py-12">
          <div className="grid w-full overflow-hidden rounded-[2.25rem] border border-[#DED0CB] bg-[#FBF8F6] lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div className="flex flex-col justify-center px-7 py-12 sm:px-10 md:px-14 lg:px-16 lg:py-16">
              <p className="text-[7px] tracking-[0.42em] text-[#9D6F67]">
                WELCOME, {firstName.toUpperCase()}
              </p>

              <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">
                Ready to
                <span className="block italic text-[#A77B73]">
                  lock in? ♡
                </span>
              </h1>

              <p className="mt-7 max-w-md font-serif text-xl leading-relaxed italic text-[#806E68]">
                Your journey. Your timeline. Your commitment.
              </p>

              <p className="mt-4 max-w-md text-[9px] leading-6 tracking-[0.08em] text-[#927D76]">
                CHOOSE HOW LONG YOU WANT TO LOCK IN. YOUR START DATE BECOMES
                DAY 01, AND WE&apos;LL TAKE IT ONE DAY AT A TIME FROM THERE.
              </p>

              <div className="mt-9 flex items-center gap-3">
                <span className="h-px w-12 bg-[#CBA9A2]" />

                <span className="text-[7px] tracking-[0.3em] text-[#9D6F67]">
                  7 COMMITMENTS • ONE DAY AT A TIME • JUST SHOW UP
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-[#211C19] px-7 py-10 text-[#F7F1ED] sm:px-10 md:px-12 lg:px-14 lg:py-12">
              <div className="flex h-full flex-col">
                <div>
                  <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
                    CHOOSE YOUR LOCK IN
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-4">
                    <h2 className="font-serif text-4xl leading-none sm:text-5xl">
                      How long are
                      <span className="block italic text-[#DDB5AE]">
                        you showing up? ♡
                      </span>
                    </h2>

                    <p className="hidden pb-1 font-serif text-base italic text-[#A99791] xl:block">
                      make it yours.
                    </p>
                  </div>

                  {/* DURATION OPTIONS */}
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {challengeOptions.map((option) => {
                      const isSelected = selectedLength === option.days;

                      return (
                        <button
                          key={option.days}
                          type="button"
                          disabled={isStarting}
                          onClick={() => setSelectedLength(option.days)}
                          className={`group rounded-[1.4rem] border p-4 text-left transition duration-200 ${
                            isSelected
                              ? "border-[#DDB5AE] bg-[#DDB5AE] text-[#211C19]"
                              : "border-[#51433F] bg-[#2A2421] text-[#F7F1ED] hover:border-[#8E736C]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span
                                className={`font-serif text-4xl leading-none ${
                                  isSelected
                                    ? "text-[#211C19]"
                                    : "text-[#DDB5AE]"
                                }`}
                              >
                                {option.days}
                              </span>

                              <span
                                className={`ml-1.5 text-[6px] tracking-[0.22em] ${
                                  isSelected
                                    ? "text-[#6F5751]"
                                    : "text-[#A99791]"
                                }`}
                              >
                                DAYS
                              </span>
                            </div>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                                isSelected
                                  ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                                  : "border-[#665650] text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                          </div>

                          <p
                            className={`mt-4 text-[7px] tracking-[0.25em] ${
                              isSelected
                                ? "text-[#5F4944]"
                                : "text-[#D8C8C3]"
                            }`}
                          >
                            {option.label}
                          </p>

                          <p
                            className={`mt-1.5 font-serif text-sm italic leading-5 ${
                              isSelected
                                ? "text-[#6F5751]"
                                : "text-[#A99791]"
                            }`}
                          >
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* JOURNEY SUMMARY */}
                  <div className="mt-6 rounded-[1.5rem] border border-[#51433F] bg-[#2A2421] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[6px] tracking-[0.3em] text-[#A99791]">
                          YOUR LOCK IN
                        </p>

                        <p className="mt-1.5 font-serif text-xl italic text-[#DDB5AE]">
                          {selectedLength} days. ♡
                        </p>
                      </div>

                      <span className="rounded-full border border-[#665650] px-3 py-1.5 text-[6px] tracking-[0.22em] text-[#BFAEAA]">
                        DAY 01 → DAY {selectedLength}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 border-t border-[#51433F] pt-4">
                      <div className="pr-4">
                        <p className="text-[6px] tracking-[0.3em] text-[#A99791]">
                          DAY 01
                        </p>

                        <p className="mt-2 font-serif text-base text-[#F7F1ED]">
                          {formatLongDate(selectedDate)}
                        </p>
                      </div>

                      <div className="border-l border-[#51433F] pl-4">
                        <p className="text-[6px] tracking-[0.3em] text-[#A99791]">
                          FINAL DAY
                        </p>

                        <p className="mt-2 font-serif text-base text-[#DDB5AE]">
                          {formatDateObject(endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIFFERENT DATE */}
                  {showDatePicker && (
                    <div className="mt-4 rounded-[1.25rem] border border-[#51433F] p-4">
                      <label
                        htmlFor="challenge-start-date"
                        className="text-[7px] tracking-[0.3em] text-[#DDB5AE]"
                      >
                        SELECT YOUR START DATE
                      </label>

                      <input
                        id="challenge-start-date"
                        type="date"
                        value={selectedDate}
                        onChange={(event) =>
                          setSelectedDate(event.target.value)
                        }
                        className="mt-3 w-full rounded-xl border border-[#665650] bg-[#F7F1ED] px-4 py-3 text-sm text-[#211C19] outline-none"
                      />
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-4 rounded-2xl border border-[#8C5D56] px-5 py-4">
                      <p className="text-[8px] leading-5 tracking-[0.08em] text-[#E3BBB4]">
                        {errorMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mt-6">
                  {!showDatePicker ? (
                    <>
                      <button
                        type="button"
                        disabled={isStarting}
                        onClick={() => startChallenge(today)}
                        className="w-full rounded-full bg-[#DDB5AE] px-8 py-4 text-[8px] tracking-[0.3em] text-[#211C19] transition hover:-translate-y-0.5 hover:bg-[#E5C5BF] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isStarting
                          ? "STARTING..."
                          : `START MY ${selectedLength} DAY LOCK IN →`}
                      </button>

                      <button
                        type="button"
                        disabled={isStarting}
                        onClick={() => setShowDatePicker(true)}
                        className="mt-2 w-full py-2 text-[7px] tracking-[0.28em] text-[#BFAEAA] transition hover:text-[#F7F1ED]"
                      >
                        CHOOSE A DIFFERENT START DATE
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isStarting || !selectedDate}
                        onClick={() => startChallenge(selectedDate)}
                        className="w-full rounded-full bg-[#DDB5AE] px-8 py-4 text-[8px] tracking-[0.3em] text-[#211C19] transition hover:-translate-y-0.5 hover:bg-[#E5C5BF] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isStarting
                          ? "STARTING..."
                          : `BEGIN MY ${selectedLength} DAY LOCK IN →`}
                      </button>

                      <button
                        type="button"
                        disabled={isStarting}
                        onClick={() => {
                          setSelectedDate(today);
                          setShowDatePicker(false);
                        }}
                        className="mt-2 w-full py-2 text-[7px] tracking-[0.28em] text-[#BFAEAA] transition hover:text-[#F7F1ED]"
                      >
                        USE TODAY INSTEAD
                      </button>
                    </>
                  )}

                  <p className="mt-3 text-center font-serif text-sm italic text-[#A99791]">
                    choose your journey. show up for it. ♡
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex items-center justify-between border-t border-[#DED0CB] pt-6">
          <p className="text-[6px] tracking-[0.28em] text-[#9A8780]">
            LOCK IN WITH LAV
          </p>

          <p className="font-serif text-sm italic text-[#A77B73]">
            just documenting discipline. ♡
          </p>
        </footer>
      </div>
    </main>
  );
}