"use client";

import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type DailyProgressRow,
  calculateStreak,
  getChallengePercentage,
  getCompletedDayNumbers,
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

type ChallengeMonth = {
  key: string;
  name: string;
  subtitle: string;
  days: {
    challengeDay: number;
    date: Date;
  }[];
};

function formatCalendarDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildChallengeMonths(startDate: Date): ChallengeMonth[] {
  const grouped = new Map<
    string,
    {
      name: string;
      days: {
        challengeDay: number;
        date: Date;
      }[];
    }
  >();

  for (let challengeDay = 1; challengeDay <= 75; challengeDay++) {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + challengeDay - 1);

    const key = `${date.getFullYear()}-${date.getMonth()}`;

    const monthName = date
      .toLocaleDateString("en-US", {
        month: "long",
      })
      .toUpperCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: monthName,
        days: [],
      });
    }

    grouped.get(key)!.days.push({
      challengeDay,
      date,
    });
  }

  return Array.from(grouped.entries()).map(([key, month]) => {
    const firstDay = month.days[0].challengeDay;
    const lastDay = month.days[month.days.length - 1].challengeDay;

    return {
      key,
      name: month.name,
      subtitle: `Days ${String(firstDay).padStart(2, "0")} — ${String(
        lastDay
      ).padStart(2, "0")}`,
      days: month.days,
    };
  });
}

export default function JourneyPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const [challengeStartDate, setChallengeStartDate] = useState<
    string | null
  >(null);

  const [dailyProgress, setDailyProgress] = useState<
    DailyProgressRow[]
  >([]);

  useEffect(() => {
    const loadJourney = async () => {
      setIsLoadingUser(true);
      setIsLoadingProgress(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load user:", userError);
      }

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
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
      } else if (profile) {
        setChallengeStartDate(profile.challenge_start_date);
      }

      const { data: progressRows, error: progressError } =
        await supabase
          .from("daily_progress")
          .select(
            "challenge_day, move, get_outside, hydrate, read, nourish, document"
          )
          .eq("user_id", user.id)
          .order("challenge_day", { ascending: true });

      if (progressError) {
        console.error(
          "Could not load daily progress:",
          progressError
        );
      } else {
        setDailyProgress(progressRows ?? []);
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadJourney();
  }, []);

  let currentDay = 1;
  let startDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);
    currentDay = getCurrentChallengeDay(challengeStartDate);
  }

  const dayNumber = String(currentDay).padStart(2, "0");

  const completedDayNumbers =
    getCompletedDayNumbers(dailyProgress);

  const completedDays = completedDayNumbers.length;

  const streak = calculateStreak(
    completedDayNumbers,
    currentDay
  );

  const challengeProgress =
    getChallengePercentage(completedDays);

  const months = startDate
    ? buildChallengeMonths(startDate)
    : [];

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        {/* MAIN CONTENT */}
        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR 75 DAYS
              </p>

              <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                one day at a time. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* HERO */}
          <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] bg-[#211C19] p-8 text-[#F7F1ED] md:p-10">
              <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                YOUR JOURNEY
              </p>

              <h1 className="mt-7 max-w-2xl font-serif text-5xl leading-[0.9] md:text-7xl">
                75 days of
                <span className="block italic text-[#DDB5AE]">
                  choosing you.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-xs leading-6 text-[#C9BBB6]">
                Every completed day is proof that you showed up.
                Keep building the routine, discipline and confidence
                you came here for.
              </p>

              <div className="mt-10 h-[5px] overflow-hidden rounded-full bg-[#413735]">
                <div
                  className="h-full rounded-full bg-[#DDB5AE] transition-all duration-500"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between text-[7px] tracking-[0.2em] text-[#BFAEAA]">
                <span>DAY 01</span>

                <span>
                  {isLoadingProgress
                    ? "LOADING..."
                    : `${challengeProgress}% COMPLETE`}
                </span>

                <span>DAY 75</span>
              </div>
            </div>

            {/* STATS */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR PROGRESS
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-end justify-between border-b border-[#E1D3CE] pb-6">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    CURRENT DAY
                  </p>

                  <p className="font-serif text-4xl">
                    {dayNumber}
                  </p>
                </div>

                <div className="flex items-end justify-between border-b border-[#E1D3CE] pb-6">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    DAYS COMPLETE
                  </p>

                  <p className="font-serif text-4xl">
                    {isLoadingProgress ? "—" : completedDays}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    CURRENT STREAK
                  </p>

                  <p className="font-serif text-4xl">
                    {isLoadingProgress ? "—" : streak}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* LEGEND */}
          <div className="mt-12 flex flex-wrap gap-6 border-b border-[#DED0CB] pb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#A77B73]" />

              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                COMPLETE
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#DDB5AE]" />

              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                CURRENT
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-[#C9B7B1]" />

              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                UPCOMING
              </p>
            </div>
          </div>

          {/* 75 DAY CALENDAR */}
          <section className="mt-12 space-y-12">
            {months.map((month) => (
              <div
                key={month.key}
                className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-9"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                      {month.subtitle}
                    </p>

                    <h2 className="mt-3 font-serif text-4xl">
                      {month.name}
                    </h2>
                  </div>

                  <p className="hidden font-serif text-lg italic text-[#A77B73] sm:block">
                    keep going. ♡
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-10">
                  {month.days.map(
                    ({ challengeDay, date }) => {
                      const isCurrent =
                        challengeDay === currentDay;

                      const isComplete =
                        completedDayNumbers.includes(
                          challengeDay
                        );

                      return (
                        <div
                          key={challengeDay}
                          className={`relative flex aspect-square min-h-[74px] flex-col items-center justify-center rounded-2xl border transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : isCurrent
                                ? "border-[#C79D95] bg-[#EAD8D3] text-[#211C19] shadow-sm"
                                : "border-[#E1D3CE] bg-[#F8F3F0] text-[#806E68]"
                          }`}
                        >
                          <p className="font-serif text-xl">
                            {String(challengeDay).padStart(
                              2,
                              "0"
                            )}
                          </p>

                          <p
                            className={`mt-1 text-[6px] tracking-[0.12em] ${
                              isComplete
                                ? "text-[#EEDDD8]"
                                : "text-[#9A8780]"
                            }`}
                          >
                            {formatCalendarDate(date)}
                          </p>

                          {isComplete && (
                            <span className="absolute right-2 top-2 text-[8px]">
                              ✓
                            </span>
                          )}

                          {isCurrent && !isComplete && (
                            <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#A77B73]" />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* WEEKLY CHECK-IN */}
          <section className="mt-12 rounded-[2rem] bg-[#EAD8D3] px-8 py-10 md:flex md:items-center md:justify-between md:px-10">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                WEEKLY CHECK-IN
              </p>

              <h2 className="mt-4 font-serif text-3xl italic md:text-4xl">
                Pause. Reflect. Keep going. ♡
              </h2>

              <p className="mt-4 max-w-xl text-xs leading-6 text-[#806E68]">
                At the end of each week, take a moment to celebrate
                what went well and decide what you want to carry
                into the next one.
              </p>
            </div>

            <button className="mt-7 rounded-full bg-[#211C19] px-8 py-4 text-[7px] tracking-[0.3em] text-[#F7F1ED] transition hover:-translate-y-0.5 md:mt-0">
              {currentDay >= 7
                ? "START CHECK-IN"
                : "UNLOCKS DAY 07"}
            </button>
          </section>

          {/* BOTTOM QUOTE */}
          <div className="py-16 text-center">
            <p className="font-serif text-3xl italic text-[#A77B73]">
              imagine what 75 days of choosing yourself can do. ♡
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}