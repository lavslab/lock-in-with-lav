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

type MeasurementRow = {
  id?: string;
  challenge_day: number;
  weight: number | string | null;
  waist: number | string | null;
  hips: number | string | null;
  chest: number | string | null;
  thigh: number | string | null;
  arm: number | string | null;
  created_at?: string;
};

type ProgressPhotoRow = {
  id?: string;
  challenge_day: number;
  storage_path: string;
  created_at?: string;
};

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

function formatMeasurement(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
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

  // Day Details modal
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [dayDetailsLoading, setDayDetailsLoading] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<MeasurementRow | null>(null);

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

  const safeCurrentDay = Math.min(Math.max(currentDay, 1), TOTAL_DAYS);

  const dayNumber = String(safeCurrentDay).padStart(2, "0");

  /**
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

  /**
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

  async function openDayDetails(day: number) {
    if (day > safeCurrentDay) return;

    setSelectedDay(day);
    setDayDetailsOpen(true);
    setDayDetailsLoading(true);
    setSelectedPhotoUrl(null);
    setSelectedMeasurement(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) {
        console.error("Could not load user for day details:", userError);
      }

      setDayDetailsLoading(false);
      return;
    }

    /*
     * PHOTO
     * Grab the newest photo saved for this challenge day.
     */
    const { data: photoRows, error: photoError } = await supabase
      .from("progress_photos")
      .select("id, challenge_day, storage_path, created_at")
      .eq("user_id", user.id)
      .eq("challenge_day", day)
      .order("created_at", { ascending: false })
      .limit(1);

    if (photoError) {
      console.error("Could not load progress photo:", photoError);
    } else {
      const photo = (photoRows?.[0] ?? null) as ProgressPhotoRow | null;

      if (photo?.storage_path) {
        const { data: signedPhoto, error: signedPhotoError } =
          await supabase.storage
            .from("progress-photos")
            .createSignedUrl(photo.storage_path, 60 * 60);

        if (signedPhotoError) {
          console.error(
            "Could not create progress photo URL:",
            signedPhotoError
          );
        } else {
          setSelectedPhotoUrl(signedPhoto?.signedUrl ?? null);
        }
      }
    }

    /*
     * MEASUREMENTS
     * There may be more than one entry on the same day,
     * so use the newest measurement entry for that day.
     */
    const { data: measurementRows, error: measurementError } = await supabase
      .from("measurements")
      .select(
        "id, challenge_day, weight, waist, hips, chest, thigh, arm, created_at"
      )
      .eq("user_id", user.id)
      .eq("challenge_day", day)
      .order("created_at", { ascending: false })
      .limit(1);

    if (measurementError) {
      console.error("Could not load measurements:", measurementError);
    } else {
      setSelectedMeasurement(
        (measurementRows?.[0] as MeasurementRow | undefined) ?? null
      );
    }

    setDayDetailsLoading(false);
  }

  function closeDayDetails() {
    setDayDetailsOpen(false);
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
                      onClick={() => openDayDetails(day)}
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

      {/* DAY DETAILS MODAL */}
      {dayDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/45 px-4 py-6 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDayDetails();
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[#D8C5BF] bg-[#FBF8F6] shadow-2xl">
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeDayDetails}
              aria-label="Close day details"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C5BF] bg-[#FBF8F6] text-lg text-[#806E68] transition hover:bg-[#EAD8D3]"
            >
              ×
            </button>

            {/* MODAL HEADER */}
            <div className="border-b border-[#E5D8D3] px-7 pb-7 pt-8 md:px-10 md:pb-8 md:pt-10">
              <p className="text-[9px] tracking-[0.34em] text-[#9D6F67]">
                YOUR JOURNEY
              </p>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2 pr-12">
                <h2 className="font-serif text-4xl leading-none md:text-5xl">
                  Day {String(activeSelectedDay).padStart(2, "0")}
                </h2>

                {selectedDate && (
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    {formatFullDate(selectedDate)}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-[8px] tracking-[0.20em] ${
                    selectedIsComplete
                      ? "bg-[#A77B73] text-[#FBF8F6]"
                      : "border border-[#D5BBB5] bg-[#F7F1ED] text-[#8F655E]"
                  }`}
                >
                  {selectedIsComplete ? "DAY COMPLETE" : "DAY IN PROGRESS"}
                </span>

                <span className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                  {selectedCommitmentCount} / 7 COMMITMENTS
                </span>
              </div>
            </div>

            {dayDetailsLoading ? (
              <div className="flex min-h-[360px] items-center justify-center px-7 py-14">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D8C5BF] border-t-[#A77B73]" />

                  <p className="mt-5 font-serif text-xl italic text-[#A77B73]">
                    opening your day... ♡
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                {/* PHOTO */}
                <div className="border-b border-[#E5D8D3] p-7 md:border-b-0 md:border-r md:p-10">
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    PROGRESS PHOTO
                  </p>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    this day, captured.
                  </h3>

                  <div className="mt-6">
                    {selectedPhotoUrl ? (
                      <div className="overflow-hidden rounded-[1.6rem] border border-[#D8C5BF] bg-[#F1E7E3]">
                        <img
                          src={selectedPhotoUrl}
                          alt={`Progress photo for day ${activeSelectedDay}`}
                          className="aspect-[4/5] w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[1.6rem] border border-dashed border-[#CBA9A2] bg-[#F7F1ED] px-8 text-center">
                        <div>
                          <p className="font-serif text-3xl italic text-[#A77B73]">
                            no photo yet. ♡
                          </p>

                          <p className="mx-auto mt-3 max-w-xs text-[9px] leading-5 tracking-[0.16em] text-[#8F7C76]">
                            NO PROGRESS PHOTO WAS SAVED FOR THIS DAY.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="p-7 md:p-10">
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    MEASUREMENTS
                  </p>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    a little snapshot of you.
                  </h3>

                  {selectedMeasurement ? (
                    <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-[#E0D2CD]">
                      <div className="border-b border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          WEIGHT
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.weight)}
                        </p>
                      </div>

                      <div className="border-b border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          WAIST
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.waist)}
                        </p>
                      </div>

                      <div className="border-b border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          HIPS
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.hips)}
                        </p>
                      </div>

                      <div className="border-b border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          CHEST
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.chest)}
                        </p>
                      </div>

                      <div className="border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          THIGH
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.thigh)}
                        </p>
                      </div>

                      <div className="p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          ARM
                        </p>
                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(selectedMeasurement.arm)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-7 rounded-[1.5rem] border border-dashed border-[#CBA9A2] bg-[#F7F1ED] px-6 py-9 text-center">
                      <p className="font-serif text-2xl italic text-[#A77B73]">
                        nothing recorded. ♡
                      </p>

                      <p className="mt-3 text-[8px] leading-5 tracking-[0.16em] text-[#8F7C76]">
                        NO MEASUREMENTS WERE SAVED FOR THIS DAY.
                      </p>
                    </div>
                  )}

                  {/* COMMITMENT SUMMARY */}
                  <div className="mt-7 rounded-[1.5rem] bg-[#EAD8D3] p-6">
                    <p className="text-[8px] tracking-[0.25em] text-[#8F655E]">
                      SHOWING UP
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-serif text-4xl">
                          {selectedCommitmentCount}
                          <span className="text-xl text-[#A77B73]"> / 7</span>
                        </p>

                        <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                          {selectedIsComplete
                            ? "you did everything you said you would. ♡"
                            : selectedIsCurrent
                              ? "the day isn't over yet. ♡"
                              : "part of the story, too. ♡"}
                        </p>
                      </div>

                      {selectedIsComplete && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A77B73] text-[#FBF8F6]">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}