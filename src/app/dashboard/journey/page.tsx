"use client";

import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type DailyProgressRow,
  getChallengePercentage,
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

const TOTAL_DAYS = 75;

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getChallengeDate(startDate: Date, challengeDay: number) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + challengeDay - 1);
  return date;
}

function getCompletedCommitmentCount(row?: DailyProgressRow) {
  if (!row) return 0;

  const commitments = [
    row.move,
    row.get_outside,
    row.hydrate,
    row.read,
    row.nourish,
    row.document,
    row.no_alcohol,
  ];

  return commitments.filter(Boolean).length;
}

export default function JourneyPage() {
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );

  const [dailyProgress, setDailyProgress] = useState<DailyProgressRow[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

      const { data: progressRows, error: progressError } = await supabase
        .from("daily_progress")
        .select(
          "challenge_day, move, get_outside, hydrate, read, nourish, document, no_alcohol"
        )
        .eq("user_id", user.id)
        .order("challenge_day", { ascending: true });

      if (progressError) {
        console.error("Could not load daily progress:", progressError);
      } else {
        setDailyProgress(progressRows ?? []);
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadJourney();
  }, [supabase]);

  let currentDay = 1;
  let startDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);
    currentDay = getCurrentChallengeDay(challengeStartDate);
  }

  const safeCurrentDay = Math.min(
    Math.max(currentDay, 1),
    TOTAL_DAYS
  );

  const dayNumber = String(safeCurrentDay).padStart(2, "0");

  /*
   * A day only counts as complete when all 7
   * commitments for that day are complete.
   */
  const completedDayNumbers = dailyProgress
    .filter((row) => getCompletedCommitmentCount(row) === 7)
    .map((row) => row.challenge_day);

  const completedDays = completedDayNumbers.length;

  const challengeProgress = getChallengePercentage(completedDays);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  /*
   * Journey defaults to today.
   * Clicking an available calendar day changes the summary card.
   */
  const activeSelectedDay = selectedDay ?? safeCurrentDay;

  const selectedDate = startDate
    ? getChallengeDate(startDate, activeSelectedDay)
    : null;

  const selectedProgress = dailyProgress.find(
    (row) => row.challenge_day === activeSelectedDay
  );

  const selectedCommitmentCount =
    getCompletedCommitmentCount(selectedProgress);

  const selectedIsComplete = selectedCommitmentCount === 7;
  const selectedIsCurrent = activeSelectedDay === safeCurrentDay;
  const selectedIsPast = activeSelectedDay < safeCurrentDay;
  const selectedIsUpcoming = activeSelectedDay > safeCurrentDay;

  const challengeDays = Array.from(
    { length: TOTAL_DAYS },
    (_, index) => index + 1
  );

  function selectDay(day: number) {
    if (day > safeCurrentDay) return;
    setSelectedDay(day);
  }

  function getSelectedStatus() {
    if (selectedIsComplete) return "complete ♡";
    if (selectedIsCurrent) return "in progress";
    if (selectedIsPast) return "incomplete";
    return "upcoming";
  }

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
          {/* MOBILE TODAY BUTTON */}
          <div className="flex justify-end md:hidden">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[10px] tracking-[0.20em] transition hover:bg-[#EAD8D3]"
            >
              TODAY
            </Link>
          </div>

          {/* JOURNEY SUMMARY */}
          <section className="mt-4 overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6]">
            {/* TOP */}
            <div className="px-7 pb-8 pt-7 md:px-10 md:pb-9 md:pt-9">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.34em] text-[#9D6F67]">
                    {selectedIsCurrent ? "YOU ARE HERE" : "YOUR JOURNEY"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h1 className="font-serif text-5xl leading-none md:text-6xl">
                      Day {String(activeSelectedDay).padStart(2, "0")}
                    </h1>

                    {selectedDate && (
                      <p className="font-serif text-lg italic text-[#A77B73] md:text-xl">
                        {formatFullDate(selectedDate)}
                      </p>
                    )}
                  </div>
                </div>

                <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                  {selectedIsComplete
                    ? "you showed up. ♡"
                    : selectedIsCurrent
                      ? "keep showing up. ♡"
                      : selectedIsPast
                        ? "another day in your story. ♡"
                        : "one day at a time. ♡"}
                </p>
              </div>
            </div>

            {/* STATS */}
            <div className="grid border-t border-[#E7DCD7] sm:grid-cols-3">
              <div className="px-7 py-5 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  STATUS
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {getSelectedStatus()}
                </p>
              </div>

              <div className="border-t border-[#E7DCD7] px-7 py-5 sm:border-l sm:border-t-0 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  PROGRESS
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {isLoadingProgress ? "—" : `${challengeProgress}%`}
                </p>
              </div>

              <div className="border-t border-[#E7DCD7] px-7 py-5 sm:border-l sm:border-t-0 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  DAYS COMPLETE
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {isLoadingProgress ? "—" : completedDays}
                </p>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="border-t border-[#E7DCD7] px-7 pb-7 pt-6 md:px-10 md:pb-8">
              <div className="relative h-[4px] overflow-hidden rounded-full bg-[#E7DCD7]">
                <div
                  className="h-full rounded-full bg-[#A77B73] transition-all duration-500"
                  style={{
                    width: `${challengeProgress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[8px] tracking-[0.20em] text-[#9A8780]">
                <span>DAY 01</span>
                <span>DAY 75</span>
              </div>
            </div>
          </section>

          {/* JOURNEY CALENDAR */}
          <section className="mt-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#D5BBB5] bg-[#EAD8D3] px-5 pb-8 pt-10 sm:px-8 md:px-10 md:pb-10 md:pt-12">
              {/* CALENDAR BINDING */}
              <div className="absolute -top-3 left-0 right-0 flex justify-center gap-12">
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
              </div>

              {/* CALENDAR HEADER */}
              <div className="flex flex-col gap-6 border-b border-[#CFB5AE] pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.38em] text-[#8F655E]">
                    YOUR
                  </p>

                  <h2 className="mt-2 font-serif text-4xl italic text-[#A77B73] md:text-5xl">
                    75 days.
                  </h2>
                </div>

                <div className="sm:text-right">
                  <p className="text-[9px] tracking-[0.30em] text-[#8F655E]">
                    LOCK IN WITH LAV
                  </p>

                  <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                    you are here — day {dayNumber}. ♡
                  </p>
                </div>
              </div>

              {/* LEGEND */}
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
                {/* COMPLETE */}
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#A77B73] text-[9px] text-[#F7F1ED]">
                    ✓
                  </span>

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    COMPLETE
                  </span>
                </div>

                {/* TODAY */}
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md border-2 border-[#8F655E] bg-[#F7F1ED]" />

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    TODAY
                  </span>
                </div>

                {/* UPCOMING */}
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md border border-[#D7C2BC] bg-[#F7F1ED]/30" />

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    UPCOMING
                  </span>
                </div>
              </div>

              {/* ALL 75 DAYS */}
              <div className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3 lg:grid-cols-[repeat(15,minmax(0,1fr))]">
                {challengeDays.map((day) => {
                  const progressForDay = dailyProgress.find(
                    (row) => row.challenge_day === day
                  );

                  const completedForDay =
                    getCompletedCommitmentCount(progressForDay);

                  const isComplete = completedForDay === 7;
                  const isCurrent = day === safeCurrentDay;
                  const isUpcoming = day > safeCurrentDay;
                  const isSelected = day === activeSelectedDay;

                  const dayDate = startDate
                    ? getChallengeDate(startDate, day)
                    : null;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      disabled={isUpcoming}
                      aria-label={
                        dayDate
                          ? `Day ${day}, ${formatFullDate(dayDate)}`
                          : `Day ${day}`
                      }
                      className={`group relative flex aspect-square min-h-[52px] flex-col items-center justify-center rounded-xl border transition duration-200 sm:min-h-[58px] ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : isCurrent
                            ? "border-2 border-[#8F655E] bg-[#F7F1ED] text-[#211C19]"
                            : isUpcoming
                              ? "cursor-default border-[#D7C2BC] bg-[#F7F1ED]/30 text-[#AA9690]"
                              : "border-[#CBA9A2] bg-[#F7F1ED]/65 text-[#806E68] hover:-translate-y-0.5 hover:bg-[#F7F1ED]"
                      } ${
                        isSelected && !isCurrent
                          ? "ring-2 ring-[#8F655E] ring-offset-2 ring-offset-[#EAD8D3]"
                          : ""
                      }`}
                    >
                      <span className="font-serif text-base sm:text-lg">
                        {String(day).padStart(2, "0")}
                      </span>

                      {isComplete && (
                        <span className="absolute right-1.5 top-1 text-[8px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CALENDAR FOOTER */}
              <div className="mt-8 flex flex-col gap-2 border-t border-[#CFB5AE] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[8px] tracking-[0.28em] text-[#8F655E]">
                  {completedDays} DAYS COMPLETE
                </p>

                <p className="font-serif text-lg italic text-[#A77B73]">
                  {completedDays === TOTAL_DAYS
                    ? "75 days. you did it. ♡"
                    : "keep going. one day at a time. ♡"}
                </p>
              </div>
            </div>
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