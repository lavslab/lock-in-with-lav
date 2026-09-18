"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function getEndDate(startDateString: string) {
  const startDate = parseLocalDate(startDateString);
  const endDate = new Date(startDate);

  endDate.setDate(endDate.getDate() + 74);

  return getLocalDateString(endDate);
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const today = useMemo(() => getLocalDateString(new Date()), []);

  const [firstName, setFirstName] = useState("there");
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
          "We couldn't load your challenge profile. Please try again."
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

  const endDate = getEndDate(selectedDate);

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
      })
      .eq("id", user.id);

    if (error) {
      console.error("Could not start challenge:", error);

      setErrorMessage(
        "We couldn't start your challenge just yet. Please try again."
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
            <p className="font-serif text-2xl tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1 text-[8px] tracking-[0.5em]">
              WITH LAV
            </p>
          </div>

          <p className="hidden text-[7px] tracking-[0.3em] text-[#9D6F67] sm:block">
            YOUR 75 DAYS
          </p>
        </header>

        {/* MAIN CONTENT */}
        <section className="flex flex-1 items-center py-14 lg:py-16">
          <div className="grid w-full overflow-hidden rounded-[2.25rem] border border-[#DED0CB] bg-[#FBF8F6] lg:grid-cols-[1.05fr_0.95fr]">
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
                Your 75 days begin when you say they do.
              </p>

              <p className="mt-4 max-w-md text-[9px] leading-6 tracking-[0.08em] text-[#927D76]">
                THIS IS YOUR CHALLENGE. YOUR START DATE BECOMES DAY 01,
                AND WE&apos;LL TAKE IT ONE DAY AT A TIME FROM THERE.
              </p>

              <div className="mt-9 flex items-center gap-3">
                <span className="h-px w-12 bg-[#CBA9A2]" />

                <span className="text-[7px] tracking-[0.3em] text-[#9D6F67]">
                  75 DAYS • 6 COMMITMENTS • ONE YOU
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-[#211C19] px-7 py-12 text-[#F7F1ED] sm:px-10 md:px-12 lg:px-14 lg:py-16">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
                    CHOOSE YOUR DAY 01
                  </p>

                  <h2 className="mt-4 font-serif text-4xl leading-none sm:text-5xl">
                    One decision.
                    <span className="block italic text-[#DDB5AE]">
                      Then show up.
                    </span>
                  </h2>

                  {/* DATE SUMMARY */}
                  <div className="mt-10 rounded-[1.75rem] border border-[#51433F] bg-[#2A2421] p-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-[6px] tracking-[0.3em] text-[#A99791]">
                          DAY 01
                        </p>

                        <p className="mt-2 font-serif text-xl text-[#F7F1ED]">
                          {formatLongDate(selectedDate)}
                        </p>
                      </div>

                      <div className="border-l border-[#51433F] pl-5">
                        <p className="text-[6px] tracking-[0.3em] text-[#A99791]">
                          DAY 75
                        </p>

                        <p className="mt-2 font-serif text-xl text-[#DDB5AE]">
                          {formatLongDate(endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIFFERENT DATE */}
                  {showDatePicker && (
                    <div className="mt-5 rounded-[1.5rem] border border-[#51433F] p-5">
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
                        className="mt-4 w-full rounded-xl border border-[#665650] bg-[#F7F1ED] px-4 py-3 text-sm text-[#211C19] outline-none"
                      />
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-5 rounded-2xl border border-[#8C5D56] px-5 py-4">
                      <p className="text-[8px] leading-5 tracking-[0.08em] text-[#E3BBB4]">
                        {errorMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mt-10">
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
                          : "START TODAY →"}
                      </button>

                      <button
                        type="button"
                        disabled={isStarting}
                        onClick={() => setShowDatePicker(true)}
                        className="mt-4 w-full py-3 text-[7px] tracking-[0.28em] text-[#BFAEAA] transition hover:text-[#F7F1ED]"
                      >
                        CHOOSE A DIFFERENT DATE
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
                          : "BEGIN MY 75 DAYS →"}
                      </button>

                      <button
                        type="button"
                        disabled={isStarting}
                        onClick={() => {
                          setSelectedDate(today);
                          setShowDatePicker(false);
                        }}
                        className="mt-4 w-full py-3 text-[7px] tracking-[0.28em] text-[#BFAEAA] transition hover:text-[#F7F1ED]"
                      >
                        USE TODAY INSTEAD
                      </button>
                    </>
                  )}

                  <p className="mt-6 text-center font-serif text-base italic text-[#A99791]">
                    one day at a time. ♡
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