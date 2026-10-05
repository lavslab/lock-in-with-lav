"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentChallengeDay } from "@/lib/challenge";
import DashboardSidebar from "@/components/DashboardSidebar";

const commitments = [
  {
    number: "01",
    title: "MOVE",
    description: "45 min movement",
    column: "move",
  },
  {
    number: "02",
    title: "GET OUTSIDE",
    description: "Fresh air + outdoor movement",
    column: "get_outside",
  },
  {
    number: "03",
    title: "HYDRATE",
    description: "Stay hydrated",
    column: "hydrate",
  },
  {
    number: "04",
    title: "READ",
    description: "Read a few pages",
    column: "read",
  },
  {
    number: "05",
    title: "NOURISH",
    description: "Eat with intention",
    column: "nourish",
  },
  {
    number: "06",
    title: "DOCUMENT",
    description: "Progress photo",
    column: "document",
  },
  {
    number: "07",
    title: "NO ALCOHOL",
    description: "Stay alcohol-free",
    column: "no_alcohol",
  },
] as const;

type CommitmentColumn = (typeof commitments)[number]["column"];

type DailyProgress = {
  move: boolean;
  get_outside: boolean;
  hydrate: boolean;
  read: boolean;
  nourish: boolean;
  document: boolean;
  no_alcohol: boolean;
};

type SelectedWorkout = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  time: string;
  equipment: string;
  exercises: string;
};

const emptyProgress: DailyProgress = {
  move: false,
  get_outside: false,
  hydrate: false,
  read: false,
  nourish: false,
  document: false,
  no_alcohol: false,
};

function formatDateForDatabase(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function WaterDrop({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="M12 2.6C12 2.6 5.7 10.05 5.7 15.05C5.7 18.55 8.52 21.35 12 21.35C15.48 21.35 18.3 18.55 18.3 15.05C18.3 10.05 12 2.6 12 2.6Z"
        fill={filled ? "#A77B73" : "#E5CCC6"}
      />
    </svg>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [progress, setProgress] =
    useState<DailyProgress>(emptyProgress);

  const [firstName, setFirstName] = useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [isLoadingProgress, setIsLoadingProgress] =
    useState(true);

  const [userId, setUserId] = useState<string | null>(
    null
  );

  const [waterBottles, setWaterBottles] = useState(0);

  const [selectedWorkout, setSelectedWorkout] =
    useState<SelectedWorkout | null>(null);

  const [selectedWorkouts, setSelectedWorkouts] =
    useState<SelectedWorkout[]>([]);

  const [challengeStartDate, setChallengeStartDate] =
    useState<string | null>(null);

  const [challengeLength, setChallengeLength] =
    useState(75);

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

  const currentDay = challengeStartDate
    ? getCurrentChallengeDay(
        challengeStartDate,
        challengeLength,
        today
      )
    : 1;

  const dayNumber = String(currentDay).padStart(2, "0");

  const currentHour = today.getHours();

  let greeting = "good morning";

  if (currentHour >= 12 && currentHour < 17) {
    greeting = "good afternoon";
  } else if (currentHour >= 17) {
    greeting = "good evening";
  }

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoadingUser(true);
      setIsLoadingProgress(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Could not load user:",
          userError
        );
      }

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
        return;
      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const {
  data: profile,
  error: profileError,
} = await supabase
  .from("profiles")
  .select("challenge_start_date, challenge_length")
  .eq("id", user.id)
  .single();

if (profileError) {
  console.error(
    "Could not load profile:",
    profileError
  );

  setIsLoadingUser(false);
  setIsLoadingProgress(false);
  return;
}

if (!profile?.challenge_start_date) {
  setIsLoadingUser(false);
  setIsLoadingProgress(false);
  return;
}

const profileChallengeLength =
  profile.challenge_length ?? 75;

setChallengeStartDate(
  profile.challenge_start_date
);

setChallengeLength(
  profileChallengeLength
);

const calculatedDay =
  getCurrentChallengeDay(
    profile.challenge_start_date,
    profileChallengeLength
  );

const {
  data: savedProgress,
  error: progressError,
} = await supabase
  .from("daily_progress")
  .select(
    "move, get_outside, hydrate, read, nourish, document, no_alcohol, water_bottles, selected_workouts"
  )
  .eq("user_id", user.id)
  .eq("challenge_day", calculatedDay)
  .maybeSingle();

if (progressError) {
  console.error(
    "Could not load daily progress:",
    progressError
  );
} else if (savedProgress) {
  const savedWaterBottles =
    typeof savedProgress.water_bottles === "number"
      ? savedProgress.water_bottles
      : savedProgress.hydrate
        ? 8
        : 0;

  setWaterBottles(
    Math.min(
      Math.max(savedWaterBottles, 0),
      8
    )
  );

  const savedWorkouts =
    Array.isArray(savedProgress.selected_workouts)
      ? (savedProgress.selected_workouts as SelectedWorkout[])
      : [];

  setSelectedWorkouts(savedWorkouts);
  setSelectedWorkout(
    savedWorkouts.length > 0
      ? savedWorkouts[0]
      : null
  );

  setProgress({
    move: savedProgress.move,
    get_outside: savedProgress.get_outside,
    hydrate: savedProgress.hydrate,
    read: savedProgress.read,
    nourish: savedProgress.nourish,
    document: savedProgress.document,
    no_alcohol:
      savedProgress.no_alcohol ?? false,
  });
} else {
  setWaterBottles(0);
  setSelectedWorkouts([]);
  setSelectedWorkout(null);
}

      /*
       * A progress photo now completes the DOCUMENT
       * commitment automatically.
       *
       * We check the progress_photos table for the
       * current challenge day. This means the dashboard
       * will automatically recognize a saved photo.
       */

      const {
        data: progressPhoto,
        error: progressPhotoError,
      } = await supabase
        .from("progress_photos")
        .select("challenge_day")
        .eq("user_id", user.id)
        .eq(
          "challenge_day",
          calculatedDay
        )
        .eq("photo_type", "progress")
        .maybeSingle();

      if (progressPhotoError) {
        console.error(
          "Could not load today's progress photo:",
          progressPhotoError
        );
      } else if (progressPhoto) {
        setProgress((previous) => ({
          ...previous,
          document: true,
        }));
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadDashboard();
  }, []);

  const toggleCommitment = async (
    column: CommitmentColumn
  ) => {
    if (
      !userId ||
      !challengeStartDate ||
      isLoadingProgress
    ) {
      return;
    }

    const newValue = !progress[column];

    const updatedProgress = {
      ...progress,
      [column]: newValue,
    };

    setProgress(updatedProgress);

    const progressDate =
      formatDateForDatabase(today);

    const { error } = await supabase
      .from("daily_progress")
      .upsert(
        {
          user_id: userId,
          challenge_day: currentDay,
          progress_date: progressDate,
          move: updatedProgress.move,
          get_outside:
            updatedProgress.get_outside,
          hydrate: updatedProgress.hydrate,
          read: updatedProgress.read,
          nourish: updatedProgress.nourish,
          document:
            updatedProgress.document,
          no_alcohol:
            updatedProgress.no_alcohol,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,challenge_day",
        }
      );

    if (error) {
      console.error(
        "Could not save daily progress:",
        error
      );

      setProgress(progress);
    }
  };

  const updateWaterBottles = async (
  nextCount: number
) => {
  if (
    !userId ||
    !challengeStartDate ||
    isLoadingProgress
  ) {
    return;
  }

  const clampedCount = Math.min(
    Math.max(nextCount, 0),
    8
  );

  const hydrateComplete =
    clampedCount === 8;

  const previousWaterBottles =
    waterBottles;

  const previousProgress =
    progress;

  const updatedProgress = {
    ...progress,
    hydrate: hydrateComplete,
  };

  setWaterBottles(clampedCount);
  setProgress(updatedProgress);

  const progressDate =
    formatDateForDatabase(today);

  const { error } = await supabase
    .from("daily_progress")
    .upsert(
      {
        user_id: userId,
        challenge_day: currentDay,
        progress_date: progressDate,
        move: updatedProgress.move,
        get_outside:
          updatedProgress.get_outside,
        hydrate:
          updatedProgress.hydrate,
        read: updatedProgress.read,
        nourish:
          updatedProgress.nourish,
        document:
          updatedProgress.document,
        no_alcohol:
          updatedProgress.no_alcohol,
        water_bottles:
          clampedCount,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "user_id,challenge_day",
      }
    );

  if (error) {
    console.error(
      "Could not save water progress:",
      error
    );

    setWaterBottles(
      previousWaterBottles
    );

    setProgress(previousProgress);
  }
};
  const completedCount =
    commitments.filter(
      (item) => progress[item.column]
    ).length;

  const percentage = Math.round(
    (completedCount /
      commitments.length) *
      100
  );

  const dayComplete =
    completedCount ===
    commitments.length;

  if (
    isLoadingUser ||
    isLoadingProgress
  ) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="flex flex-1 items-center justify-center px-6 py-8 md:px-10 lg:px-14">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D6C3BD] bg-[#FBF8F6] font-serif text-xl text-[#A77B73]">
                ♡
              </div>

              <p className="mt-5 text-[8px] tracking-[0.32em] text-[#9D6F67]">
                LOCKING IN
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                loading your day... ♡
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-6 md:px-10 lg:px-14">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                {formattedDate}
              </p>

              <h1 className="mt-2 font-serif text-3xl leading-none sm:text-4xl">
                {greeting},{" "}
                <span className="italic text-[#A77B73]">
                  {firstName}. ♡
                </span>
              </h1>
            </div>
          </header>

          <section className="mt-7 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-6 sm:px-7 sm:py-7 md:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    TODAY
                  </p>

                  <span className="h-px w-7 bg-[#CBA9A2]" />

                  <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                    DAY {dayNumber} OF{" "}
                    {challengeLength}
                  </p>
                </div>

                <h2 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Day {dayNumber}
                </h2>

                <p className="mt-3 font-serif text-base italic text-[#A77B73]">
                  keep showing up.
                </p>
              </div>

              <div className="flex items-end gap-8 sm:gap-12">
                <div>
                  <p className="font-serif text-2xl text-[#211C19]">
                    {percentage}%
                  </p>

                  <p className="mt-1 text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    TODAY
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl text-[#211C19]">
                    {completedCount}
                    <span className="text-[#B79B95]">
                      /{commitments.length}
                    </span>
                  </p>

                  <p className="mt-1 text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    COMPLETE
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 h-[3px] overflow-hidden rounded-full bg-[#E7DAD6]">
              <div
                className="h-full rounded-full bg-[#A77B73] transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                {dayComplete
                  ? "ALL SEVEN COMPLETE ♡"
                  : `${
                      commitments.length -
                      completedCount
                    } ${
                      commitments.length -
                        completedCount ===
                      1
                        ? "COMMITMENT"
                        : "COMMITMENTS"
                    } LEFT TODAY`}
              </p>

              <Link
                href="/dashboard/journey"
                className="flex shrink-0 items-center gap-2 text-[7px] tracking-[0.18em] text-[#8F655E] transition hover:text-[#211C19]"
              >
                <span>VIEW JOURNEY</span>

                <span className="font-serif text-sm">
                  →
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-10 md:mt-12">
            <div className="flex items-end justify-between gap-5 border-b border-[#DED0CB] pb-4">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  DAILY PRACTICE
                </p>

                <h2 className="mt-2 font-serif text-3xl leading-none sm:text-4xl">
                  Today&apos;s{" "}
                  <span className="italic text-[#A77B73]">
                    commitments.
                  </span>
                </h2>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-serif text-lg italic text-[#A77B73]">
                  {completedCount}/
                  {commitments.length}
                </p>

                <p className="mt-0.5 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                  COMPLETE
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
              {commitments.map((item) => {
                const isComplete =
                  progress[item.column];

                if (item.column === "hydrate") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 lg:col-span-2 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            updateWaterBottles(
                              isComplete ? 0 : 8
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Clear hydration progress"
                              : "Complete hydration goal"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isLoadingProgress
                              ? "cursor-wait opacity-70"
                              : "cursor-pointer hover:-translate-y-0.5"
                          } ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[9px] tracking-[0.18em]">
                                HYDRATE
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Stay hydrated
                              </p>
                            </div>

                            <p className="font-serif text-sm italic text-[#A77B73]">
                              {waterBottles}/8 bottles
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {Array.from({
                          length: 8,
                        }).map((_, index) => {
                          const filled =
                            index <
                            waterBottles;

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={
                                isLoadingProgress
                              }
                              onClick={() =>
                                updateWaterBottles(
                                  filled &&
                                  index ===
                                    waterBottles -
                                      1
                                    ? index
                                    : index + 1
                                )
                              }
                              aria-label={`Bottle ${
                                index + 1
                              } ${
                                filled
                                  ? "complete"
                                  : "incomplete"
                              }`}
                              className={`flex h-9 items-center justify-center rounded-lg border transition hover:-translate-y-0.5 ${
                                filled
                                  ? "border-[#C69C94] bg-[#E6C8C2]"
                                  : "border-[#E1D3CE] bg-[#F7F1ED]"
                              }`}
                            >
                              <WaterDrop
                                filled={filled}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-2.5 text-[7px] tracking-[0.17em] text-[#9D6F67]">
                        TAP AS YOU GO • EACH = 16 OZ
                      </p>
                    </div>
                  );
                }

                if (item.column === "move") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "move"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Move incomplete"
                              : "Mark Move complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73] hover:bg-[#F1E6E2]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                MOVE
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                {selectedWorkouts.length >
                                0
                                  ? selectedWorkouts
                                      .map(
                                        (workout) =>
                                          workout.title
                                      )
                                      .join(" + ")
                                  : "45 min movement"}
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedWorkouts.length >
                      0 ? (
                        <div className="ml-[46px] mt-3 border-t border-[#E1D3CE] pt-3">
                          {selectedWorkouts.map(
                            (workout, index) => (
                              <div
                                key={workout.id}
                                className={
                                  index > 0
                                    ? "mt-3 border-t border-[#E1D3CE] pt-3"
                                    : ""
                                }
                              >
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[7px] tracking-[0.15em] text-[#9D6F67]">
                                  <span>
                                    {workout.type.toUpperCase()}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    {workout.time}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    {
                                      workout.exercises
                                    }
                                  </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-4">
                                  <Link
                                    href={`/dashboard/resources/workouts/${workout.id}`}
                                    className="flex items-center gap-2 text-[7px] tracking-[0.18em] text-[#8F655E] transition hover:text-[#211C19]"
                                  >
                                    <span>
                                      OPEN{" "}
                                      {workout.title.toUpperCase()}
                                    </span>

                                    <span className="font-serif text-sm">
                                      →
                                    </span>
                                  </Link>
                                </div>
                              </div>
                            )
                          )}

                          <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="font-serif text-xs italic text-[#A77B73]">
                              {
                                selectedWorkouts.length
                              }{" "}
                              {selectedWorkouts.length ===
                              1
                                ? "workout"
                                : "workouts"}{" "}
                              selected ♡
                            </span>

                            <Link
                              href="/dashboard/resources/workouts"
                              className="shrink-0 text-[7px] tracking-[0.16em] text-[#9D6F67] transition hover:text-[#211C19]"
                            >
                              CHANGE
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href="/dashboard/resources/workouts"
                          className="ml-[46px] mt-3 flex items-center justify-between border-t border-[#E1D3CE] pt-2.5 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                        >
                          <span>
                            FIND A WORKOUT
                          </span>

                          <span className="font-serif text-sm">
                            →
                          </span>
                        </Link>
                      )}
                    </div>
                  );
                }

                if (item.column === "nourish") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "nourish"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Nourish incomplete"
                              : "Mark Nourish complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73] hover:bg-[#F1E6E2]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                NOURISH
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Eat with intention
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/dashboard/resources/meal-plans"
                        className="ml-[46px] mt-3 flex items-center justify-between border-t border-[#E1D3CE] pt-2.5 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                      >
                        <span>
                          GO TO MEAL PLAN
                        </span>

                        <span className="font-serif text-sm">
                          →
                        </span>
                      </Link>
                    </div>
                  );
                }

                /*
                 * DOCUMENT / PROGRESS PHOTO
                 *
                 * IMPORTANT:
                 * The check circle is now a real button.
                 *
                 * This means the DOCUMENT commitment can be
                 * manually checked/un-checked from TODAY,
                 * while the Progress page can still
                 * automatically set it to complete when
                 * a photo is uploaded.
                 */

                if (item.column === "document") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "document"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Document incomplete"
                              : "Mark Document complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isLoadingProgress
                              ? "cursor-wait opacity-70"
                              : "cursor-pointer hover:-translate-y-0.5 hover:bg-[#F1E6E2]"
                          } ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                DOCUMENT
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Progress photo
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/dashboard/progress"
                        className="ml-[46px] mt-3 flex items-center justify-between border-t border-[#E1D3CE] pt-2.5 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                      >
                        <span>
                          {isComplete
                            ? "UPDATE PROGRESS PHOTO"
                            : "UPLOAD PROGRESS PHOTO"}
                        </span>

                        <span className="font-serif text-sm">
                          →
                        </span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.number}
                    type="button"
                    disabled={isLoadingProgress}
                    onClick={() =>
                      toggleCommitment(
                        item.column
                      )
                    }
                    className={`group flex w-full items-center gap-3.5 rounded-[1.25rem] border px-4 py-4 text-left transition duration-300 ${
                      isLoadingProgress
                        ? "cursor-wait opacity-70"
                        : "cursor-pointer"
                    } ${
                      isComplete
                        ? "border-[#CBA9A2] bg-[#EAD8D3]"
                        : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#CBA9A2]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : "border-[#CBA9A2] text-[#A77B73]"
                      }`}
                    >
                      {isComplete
                        ? "✓"
                        : item.number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[9px] tracking-[0.18em] ${
                          isComplete
                            ? "text-[#6F514B]"
                            : "text-[#211C19]"
                        }`}
                      >
                        {item.title}
                      </span>

                      <span className="mt-1 block text-[12px] leading-4 text-[#8C7770]">
                        {item.description}
                      </span>
                    </span>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : "border-[#C9ADA7] group-hover:bg-[#F1E6E2]"
                      }`}
                    >
                      {isComplete ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {dayComplete && (
            <section className="mt-8 border-y border-[#D4B0A8] py-8 text-center">
              <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                DAY {dayNumber} COMPLETE
              </p>

              <p className="mt-3 font-serif text-2xl italic text-[#A77B73] sm:text-3xl">
                You kept your promise to yourself. ♡
              </p>

              <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-[#806E68]">
                One day down. Keep choosing yourself,
                one day at a time.
              </p>
            </section>
          )}

          <section className="mb-6 mt-10 border-t border-[#DED0CB] pt-7">
            <div className="grid gap-3 md:grid-cols-[130px_1fr] md:gap-8">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  A NOTE FOR TODAY
                </p>
              </div>

              <div>
                <p className="max-w-3xl font-serif text-xl italic leading-snug text-[#A77B73] sm:text-2xl md:text-3xl">
                  just focus on being 1% better today ♡
                </p>

                
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}