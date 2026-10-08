"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

/* ---------------------------------
 * WEEKLY TRAINING OPTIONS
 * --------------------------------- */

const trainingWeek = [
  {
    day: "01",
    title: "LOWER BODY",
    focus: "Glutes + Quads",
    description: "Choose the lower-body session that fits your day.",
    workouts: [
      {
        id: "lower-body-foundation",
        title: "Lower Body Foundation",
        href: "/dashboard/resources/workouts/lower-body-foundation",
        meta: "BEGINNER • 35 MIN",
      },
      {
        id: "home-glute-legs",
        title: "Home Glute & Legs",
        href: "/dashboard/resources/workouts/home-glute-legs",
        meta: "HOME • 35 MIN",
      },
      {
        id: "gym-glute-legs",
        title: "Gym Glute & Legs",
        href: "/dashboard/resources/workouts/gym-glute-legs",
        meta: "GYM • 45 MIN",
      },
      {
        id: "glute-builder",
        title: "Glute Builder",
        href: "/dashboard/resources/workouts/glute-builder",
        meta: "HOME / GYM • 40 MIN",
      },
    ],
  },
  {
    day: "02",
    title: "UPPER BODY",
    focus: "Back + Arms + Posture",
    description: "Pick the upper-body focus that feels right for you today.",
    workouts: [
      {
        id: "home-back-biceps",
        title: "Home Back & Biceps",
        href: "/dashboard/resources/workouts/home-back-biceps",
        meta: "HOME • 35 MIN",
      },
      {
        id: "home-chest-triceps",
        title: "Home Chest & Triceps",
        href: "/dashboard/resources/workouts/home-chest-triceps",
        meta: "HOME • 35 MIN",
      },
      {
        id: "gym-back-biceps",
        title: "Gym Back & Biceps",
        href: "/dashboard/resources/workouts/gym-back-biceps",
        meta: "GYM • 40 MIN",
      },
      {
        id: "gym-chest-triceps",
        title: "Gym Chest & Triceps",
        href: "/dashboard/resources/workouts/gym-chest-triceps",
        meta: "GYM • 40 MIN",
      },
      {
        id: "upper-body-build",
        title: "Upper Body Build",
        href: "/dashboard/resources/workouts/upper-body-build",
        meta: "HOME / GYM • 45 MIN",
      },
    ],
  },
  {
    day: "03",
    title: "CORE + MOBILITY",
    focus: "Control + Stability",
    description: "Keep the focus controlled and intentional.",
    workouts: [
      {
        id: "core-control",
        title: "Core Control",
        href: "/dashboard/resources/workouts/core-control",
        meta: "HOME / GYM • 20 MIN",
      },
    ],
  },
  {
    day: "04",
    title: "GLUTES",
    focus: "Build + Strength",
    description: "Choose your glute session based on where you're training.",
    workouts: [
      {
        id: "home-glute-legs",
        title: "Home Glute & Legs",
        href: "/dashboard/resources/workouts/home-glute-legs",
        meta: "HOME • 35 MIN",
      },
      {
        id: "glute-builder",
        title: "Glute Builder",
        href: "/dashboard/resources/workouts/glute-builder",
        meta: "HOME / GYM • 40 MIN",
      },
      {
        id: "gym-glute-legs",
        title: "Gym Glute & Legs",
        href: "/dashboard/resources/workouts/gym-glute-legs",
        meta: "GYM • 45 MIN",
      },
    ],
  },
  {
    day: "05",
    title: "FULL BODY",
    focus: "Upper + Core",
    description:
      "A full-body option for the days you want everything working together.",
    workouts: [
      {
        id: "full-body-reset",
        title: "Full Body Reset",
        href: "/dashboard/resources/workouts/full-body-reset",
        meta: "HOME / GYM • 25 MIN",
      },
    ],
  },
  {
    day: "06",
    title: "CONDITIONING",
    focus: "Low Impact + Cardio",
    description: "Choose your conditioning based on your space and equipment.",
    workouts: [
      {
        id: "cardio-lock-in",
        title: "Cardio Lock In",
        href: "/dashboard/resources/workouts/cardio-lock-in",
        meta: "HOME / NO EQUIPMENT • 30 MIN",
      },
      {
        id: "gym-machine-cardio",
        title: "Gym Machine Cardio",
        href: "/dashboard/resources/workouts/gym-machine-cardio",
        meta: "GYM • 40 MIN",
      },
    ],
  },
  {
    day: "07",
    title: "RECOVER",
    focus: "Mobility + Walking",
    description:
      "Recovery is part of the plan. Walk, stretch, move gently, or rest.",
    workouts: [],
  },
];

/* ---------------------------------
 * WORKOUT SELECTION MIGRATION
 * --------------------------------- */

const workoutTitleToId = Object.fromEntries(
  trainingWeek.flatMap((day) =>
    day.workouts.map((workout) => [workout.title, workout.id]),
  ),
) as Record<string, string>;

const validWorkoutIds = new Set(Object.values(workoutTitleToId));

const normalizeWorkoutSelections = (value: unknown) => {
  const normalized: Record<string, string[]> = {};

  if (!value || typeof value !== "object") {
    return normalized;
  }

  Object.entries(value as Record<string, unknown>).forEach(
    ([dayId, rawValue]) => {
      const rawItems = Array.isArray(rawValue) ? rawValue : [rawValue];

      const ids = rawItems
        .filter((item): item is string => typeof item === "string")
        .map((item) => {
          // New format already uses workout IDs.
          if (validWorkoutIds.has(item)) {
            return item;
          }

          // Old format used workout titles.
          // Convert those titles to their matching IDs.
          return workoutTitleToId[item] ?? null;
        })
        .filter((item): item is string => Boolean(item));

      if (ids.length > 0) {
        normalized[dayId] = Array.from(new Set(ids));
      }
    },
  );

  return normalized;
};

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];


/* ---------------------------------
 * TRAINING LEVELS
 * --------------------------------- */

const trainingLevels = [
  {
    number: "01",
    title: "FOUNDATION",
    tagline: "learn it.",
    text: "Learn the movement and focus on control.",
  },
  {
    number: "02",
    title: "BUILD",
    tagline: "build it.",
    text: "Add resistance and build your strength.",
  },
  {
    number: "03",
    title: "LOCKED IN",
    tagline: "challenge it.",
    text: "Progress when your body is ready for more.",
  },
];

/* ---------------------------------
 * BASICS
 * --------------------------------- */

const basics = [
  {
    number: "01",
    title: "CORE + CONTROL",
    tagline: "control before intensity.",
    text: "Slow things down. Connect your breath to your core and learn to control the movement before adding more weight, reps or intensity.",
  },
  {
    number: "02",
    title: "NOURISH",
    tagline: "support the work.",
    text: "Prioritize protein, plants, fiber and hydration. Build balanced meals that support your energy instead of chasing perfection.",
  },
  {
    number: "03",
    title: "RECOVER",
    tagline: "listen before you push.",
    text: "Walking, mobility, stretching and rest all count. Recovery is part of building a routine you can actually keep.",
  },
];

/* ---------------------------------
 * PAGE
 * --------------------------------- */

export default function GuidePage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const [selectedWorkouts, setSelectedWorkouts] = useState<
    Record<string, string[]>
  >({});

  const [selectionStorageKey, setSelectionStorageKey] = useState<
    string | null
  >(null);

const [scheduleView, setScheduleView] = useState<
  "numbers" | "weekdays"
>("weekdays");

useEffect(() => {
  const savedView = localStorage.getItem("lockin-guide-schedule-view");

  if (savedView === "numbers" || savedView === "weekdays") {
    setScheduleView(savedView);
  }
}, []);

  const [weekStart, setWeekStart] = useState("MON");
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null);

  const [scheduleViewStorageKey, setScheduleViewStorageKey] = useState<
    string | null
  >(null);

  const [weekStartStorageKey, setWeekStartStorageKey] = useState<
    string | null
  >(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      setUserId(user.id);
      const { data: challengeProfile, error: challengeProfileError } =
  await supabase
    .from("profiles")
    .select("challenge_start_date")
    .eq("id", user.id)
    .maybeSingle();

if (challengeProfileError) {
  console.error(
    "Could not load challenge start date:",
    challengeProfileError,
  );
}

setChallengeStartDate(
  challengeProfile?.challenge_start_date ?? null,
);

      const storageKey = `lockInGuideWorkoutSelections:${user.id}`;
      const viewStorageKey = `lockInGuideScheduleView:${user.id}`;
      const startStorageKey = `lockInGuideWeekStart:${user.id}`;

      setSelectionStorageKey(storageKey);
      setScheduleViewStorageKey(viewStorageKey);
      setWeekStartStorageKey(startStorageKey);


      /*
       * Supabase is now the main source for the user's
       * weekly workout schedule.
       *
       * Old schedules saved as workout TITLES are automatically
       * converted to the new workout-ID format.
       */
      let loadedSelections: Record<string, string[]> = {};

      const {
        data: templateData,
        error: templateError,
      } = await supabase
        .from("user_templates")
        .select("workouts")
        .eq("user_id", user.id)
        .maybeSingle();

      if (templateError) {
        console.error(
          "Could not load Guide workout schedule:",
          templateError,
        );
      }

      if (templateData?.workouts) {
        loadedSelections = normalizeWorkoutSelections(
          templateData.workouts,
        );
      }

      /*
       * If Supabase doesn't have a schedule yet,
       * fall back to this device's old localStorage schedule.
       */
      if (Object.keys(loadedSelections).length === 0) {
        try {
          const savedSelections =
            window.localStorage.getItem(storageKey);

          if (savedSelections) {
            loadedSelections = normalizeWorkoutSelections(
              JSON.parse(savedSelections),
            );
          }
        } catch {
          // Keep the guide usable if local storage is unavailable.
        }
      }

      setSelectedWorkouts(loadedSelections);

      /*
       * Keep localStorage as a device-level fallback,
       * but save it in the new ID format.
       */
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(loadedSelections),
        );
      } catch {
        // Supabase remains the primary source of truth.
      }

      /*
       * This also migrates old title-based schedules in Supabase
       * to the new workout-ID format.
       */
      if (Object.keys(loadedSelections).length > 0) {
        const { error: migrationError } = await supabase
          .from("user_templates")
          .upsert(
            {
              user_id: user.id,
              workouts: loadedSelections,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            },
          );

        if (migrationError) {
          console.error(
            "Could not migrate Guide workout schedule:",
            migrationError,
          );
        }
      }

      const savedName = user.user_metadata?.name;

      if (savedName && typeof savedName === "string") {
        setFirstName(savedName.split(" ")[0]);
      }

      setIsLoadingUser(false);
    };

    void getUser();
  }, []); 
   


  const handleWorkoutSelect = async (
    dayId: string,
    workoutId: string,
  ) => {
    const currentSelections =
      selectedWorkouts[dayId] ?? [];

    const isCurrentlySelected =
      currentSelections.includes(workoutId);

    const nextDaySelections = isCurrentlySelected
      ? currentSelections.filter(
          (id) => id !== workoutId,
        )
      : [...currentSelections, workoutId];

    const nextSelections = {
      ...selectedWorkouts,
    };

    if (nextDaySelections.length === 0) {
      delete nextSelections[dayId];
    } else {
      nextSelections[dayId] =
        nextDaySelections;
    }

    // Update the UI immediately.
    setSelectedWorkouts(nextSelections);

    // Keep the options open so more than one workout can be selected.
    setExpandedDay(dayId);

    // Keep localStorage as a device-level fallback.
    if (selectionStorageKey) {
      try {
        window.localStorage.setItem(
          selectionStorageKey,
          JSON.stringify(nextSelections),
        );
      } catch {
        // Keep the selection in state if local storage is unavailable.
      }
    }

    // Save the weekly schedule to Supabase.
   if (userId) {
  const { error } = await supabase
    .from("user_templates")
    .upsert(
      {
        user_id: userId,
        workouts: nextSelections,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    console.error(
      "Could not save Guide workout schedule:",
      error,
    );
  }

  /*
   * If the user is ADDING a workout back into today's
   * Guide schedule, clear any previous Today dismissal
   * for that workout so it can appear on Today again.
   */
      if (!isCurrentlySelected) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("challenge_start_date, challenge_length")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.challenge_start_date) {
          const [year, month, day] = profile.challenge_start_date
            .split("-")
            .map(Number);

          const today = new Date();

          const startUTC = Date.UTC(year, month - 1, day);

          const todayUTC = Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );

          const challengeDay =
            Math.round((todayUTC - startUTC) / 86400000) + 1;

          const challengeLength = profile.challenge_length ?? 75;

          if (challengeDay >= 1 && challengeDay <= challengeLength) {
            const todayGuideDay = String(
              ((challengeDay - 1) % 7) + 1,
            ).padStart(2, "0");

            if (dayId === todayGuideDay) {
              const { data: progress } = await supabase
                .from("daily_progress")
                .select("dismissed_guide_workouts")
                .eq("user_id", userId)
                .eq("challenge_day", challengeDay)
                .maybeSingle();

              const dismissed = Array.isArray(
                progress?.dismissed_guide_workouts,
              )
                ? progress.dismissed_guide_workouts
                : [];

              if (dismissed.includes(workoutId)) {
                const updatedDismissed = dismissed.filter(
                  (id: string) => id !== workoutId,
                );

                const { error: dismissalError } = await supabase
                  .from("daily_progress")
                  .update({
                    dismissed_guide_workouts: updatedDismissed,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", userId)
                  .eq("challenge_day", challengeDay);

                                if (dismissalError) {
                  console.error(
                    "Could not restore Guide workout to Today:",
                    dismissalError,
                  );
                }
              }
            }
          }
        }
      }
    }
  }
  };

  const handleChangeWorkout = (dayId: string) => {
    setExpandedDay(dayId);
  };

  const handleDoneSelecting = () => {
    setExpandedDay(null);
  };

  const getDayLabel = (index: number) => {
  if (scheduleView === "numbers") {
    return `DAY ${String(index + 1).padStart(2, "0")}`;
  }

  if (!challengeStartDate) {
    return `DAY ${String(index + 1).padStart(2, "0")}`;
  }

  const [year, month, day] = challengeStartDate.split("-").map(Number);

  const startWeekday = new Date(
    Date.UTC(year, month - 1, day),
  ).getUTCDay();

  const weekdayNames = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ];

  return weekdayNames[(startWeekday + index) % 7];
};

  const initial =
    firstName && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "L";

  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="font-serif text-xl italic text-[#A77B73]">
                loading your guide...
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

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                THE GUIDE
              </p>

              <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-6xl">
                The Lock In
                <span className="block italic text-[#A77B73]">
                  Method.
                </span>
              </h1>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[10px] tracking-[0.22em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* INTRO */}

          <section className="mt-9 border-y border-[#DED0CB] py-6">
            <div className="grid gap-4 md:grid-cols-[0.55fr_1.45fr] md:items-center">
              <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                START WHERE YOU ARE
              </p>

              <div>
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  Not perfection. Practice. ♡
                </p>

                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#806E68]">
                  Build strength, take care of your body and create a routine
                  you can keep coming back to.
                </p>
              </div>
            </div>
          </section>

          {/* 01 — TRAINING SCHEDULE */}

          <section className="py-10">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                  01 · YOUR TRAINING WEEK
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Your weekly
                  <span className="italic text-[#A77B73]">
                    {" "}
                    schedule.
                  </span>
                </h2>
              </div>

              <p className="max-w-md text-[12px] leading-5 text-[#806E68] md:text-right">
                A balanced week of strength, core work, conditioning and
                recovery.
              </p>
            </div>

            

            {/* TRAINING WEEK */}

           <div className="mb-4">
  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9D6F67]">
    View your week as
  </p>

  <div className="inline-flex rounded-full border border-[#DED0CB] bg-[#FBF8F6] p-1">
    {(["weekdays", "numbers"] as const).map((view) => (
      <button
        key={view}
        type="button"
        onClick={() => {
  setScheduleView(view);
  localStorage.setItem("lockin-guide-schedule-view", view);
}}
        className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
          scheduleView === view
            ? "bg-[#211C19] text-white"
            : "text-[#9D6F67] hover:bg-[#F0E5E0]"
        }`}
      >
        {view === "weekdays" ? "Weekdays" : "Day Numbers"}
      </button>
    ))}
  </div>
</div>

<div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {trainingWeek.map((day, index) => {
                const isExpanded =
                  expandedDay === day.day;

                const isRecovery =
                  day.workouts.length === 0;

                /*
                 * IMPORTANT:
                 * selectedWorkouts now contains IDs,
                 * not workout titles.
                 */
                const selectedIds =
                  selectedWorkouts[day.day] ?? [];

                const selectedWorkoutsForDay =
                  day.workouts.filter(
                    (workout) =>
                      selectedIds.includes(
                        workout.id,
                      ),
                  );

                return (
                  <div
                    key={day.day}
                    className={`border-[#E1D3CE] ${
                      index !== 0
                        ? "border-t"
                        : ""
                    } ${
                      day.day === "07"
                        ? "bg-[#EAD8D3]/50"
                        : ""
                    }`}
                  >
                    {/* DAY HEADER */}

                    <div className="grid gap-4 px-5 py-5 sm:grid-cols-[48px_1fr_auto] sm:items-start sm:gap-4 md:px-7">
                      {/* DAY NUMBER / WEEKDAY */}

                      <span className="font-serif text-xl text-[#B48A82]">
                        {getDayLabel(index)}
                      </span>

                      {/* DAY / WORKOUT INFO */}

                      <div className="min-w-0">
                        <p className="text-[10px] tracking-[0.16em]">
                          {day.title}
                        </p>

                        <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                          {day.focus}
                        </p>

                        {/* YOUR PICKS */}

                        {selectedWorkoutsForDay.length >
                          0 && (
                          <div className="mt-4 rounded-[1rem] border border-[#CBA9A2] bg-[#EAD8D3]/75 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[8px] font-medium tracking-[0.22em] text-[#8F655E]">
                                YOUR PICKS
                              </p>

                              <span className="rounded-full border border-[#CBA9A2] bg-[#F7F1ED]/70 px-2.5 py-1 text-[7px] tracking-[0.14em] text-[#8F655E]">
                                {
                                  selectedWorkoutsForDay.length
                                }{" "}
                                SELECTED
                              </span>
                            </div>

                            <div className="mt-2 space-y-1.5">
                              {selectedWorkoutsForDay.map(
                                (workout) => (
                                  <Link
                                    key={
                                      workout.id
                                    }
                                    href={
                                      workout.href
                                    }
                                    className="group flex items-center justify-between gap-3 rounded-[0.7rem] border border-[#D6C1BB] bg-[#FBF8F6]/75 px-3 py-2 transition hover:border-[#B9948B] hover:bg-[#F7F1ED]"
                                  >
                                    <span className="font-serif text-base text-[#211C19]">
                                      {
                                        workout.title
                                      }
                                    </span>

                                    <span className="shrink-0 font-serif text-sm text-[#A77B73] transition group-hover:translate-x-0.5">
                                      →
                                    </span>
                                  </Link>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* RIGHT-SIDE ACTIONS */}

                      <div className="flex flex-col items-start gap-1.5 sm:items-end">
                        {isRecovery ? (
                          <Link
                            href="/dashboard/resources/recovery"
                            className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] px-3 py-1.5 text-[7px] tracking-[0.16em] text-[#8F655E] transition hover:bg-[#EAD8D3] hover:text-[#211C19]"
                          >
                            MOBILITY + RECOVERY

                            <span className="font-serif text-sm">
                              →
                            </span>
                          </Link>
                        ) : selectedWorkoutsForDay.length >
                          0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                isExpanded
                                  ? handleDoneSelecting()
                                  : handleChangeWorkout(
                                      day.day,
                                    )
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] px-3 py-1.5 text-[7px] tracking-[0.16em] text-[#8F655E] transition hover:bg-[#EAD8D3] hover:text-[#211C19]"
                            >
                              {isExpanded
                                ? "DONE SELECTING"
                                : "EDIT PICKS"}

                              <span
                                className={`font-serif text-sm transition ${
                                  isExpanded
                                    ? "rotate-90"
                                    : ""
                                }`}
                              >
                                →
                              </span>
                            </button>

                            <p className="max-w-[180px] text-[8px] leading-4 text-[#A18B84] sm:text-right">
                              Select one or more
                              workouts for this day.
                            </p>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDay(
                                isExpanded
                                  ? null
                                  : day.day,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] px-3 py-1.5 text-[7px] tracking-[0.16em] text-[#8F655E] transition hover:bg-[#EAD8D3] hover:text-[#211C19]"
                          >
                            {isExpanded
                              ? "HIDE OPTIONS"
                              : "CHOOSE WORKOUT"}

                            <span
                              className={`font-serif text-sm transition ${
                                isExpanded
                                  ? "rotate-90"
                                  : ""
                              }`}
                            >
                              →
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* WORKOUT OPTIONS */}

                    {isExpanded &&
                      !isRecovery && (
                        <div className="border-t border-[#E1D3CE] bg-[#F7F1ED] px-5 py-5 md:px-7">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                                  BUILD YOUR DAY
                                </p>

                                {selectedWorkoutsForDay.length >
                                  0 && (
                                  <span className="rounded-full bg-[#EAD8D3] px-2.5 py-1 text-[7px] tracking-[0.14em] text-[#8F655E]">
                                    {
                                      selectedWorkoutsForDay.length
                                    }{" "}
                                    SELECTED
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#806E68]">
                                {
                                  day.description
                                }{" "}
                                You can choose more
                                than one if you want
                                to combine workouts.
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-4">
                              <Link
                                href="/dashboard/resources/workouts"
                                className="text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                              >
                                VIEW ALL WORKOUTS →
                              </Link>

                              <button
                                type="button"
                                onClick={
                                  handleDoneSelecting
                                }
                                className="rounded-full bg-[#211C19] px-4 py-2 text-[7px] tracking-[0.18em] text-[#F7F1ED] transition hover:bg-[#493D39]"
                              >
                                DONE
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-2 md:grid-cols-2">
                            {day.workouts.map(
                              (workout) => {
                                const isSelected =
                                  selectedIds.includes(
                                    workout.id,
                                  );

                                return (
                                  <button
                                    key={
                                      workout.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      handleWorkoutSelect(
                                        day.day,
                                        workout.id,
                                      )
                                    }
                                    className={`group flex items-center justify-between rounded-[1rem] border px-4 py-4 text-left transition ${
                                      isSelected
                                        ? "border-[#A77B73] bg-[#EAD8D3] shadow-[0_0_0_2px_rgba(167,123,115,0.12)]"
                                        : "border-[#D8C7C1] bg-[#FBF8F6] hover:border-[#B9948B] hover:bg-[#EAD8D3]"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-serif text-lg text-[#211C19]">
                                          {
                                            workout.title
                                          }
                                        </p>

                                        {isSelected && (
                                          <span className="rounded-full bg-[#F7F1ED] px-2 py-1 text-[6px] font-medium tracking-[0.14em] text-[#8F655E]">
                                            SELECTED
                                          </span>
                                        )}
                                      </div>

                                      <p className="mt-1 text-[7px] tracking-[0.16em] text-[#9D6F67]">
                                        {
                                          workout.meta
                                        }
                                      </p>
                                    </div>

                                    <span
                                      className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-sm transition ${
                                        isSelected
                                          ? "border-[#A77B73] bg-[#F7F1ED] text-[#A77B73]"
                                          : "border-[#CBA9A2] text-[#A77B73] group-hover:bg-[#F7F1ED]"
                                      }`}
                                    >
                                      {isSelected
                                        ? "✓"
                                        : "+"}
                                    </span>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-3 px-1">
              <span className="font-serif italic text-[#A77B73]">
                ♡
              </span>

              <p className="max-w-2xl text-[11px] leading-5 text-[#927D76]">
                Use this as your rhythm, not a rulebook. Choose the workout
                that fits your space, energy and goals that day.
              </p>
            </div>
          </section>

          {/* 02 — HOW TO TRAIN */}

          <section className="border-t border-[#DED0CB] py-10">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                02 · HOW TO TRAIN
              </p>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Learn it.
                <span className="italic text-[#A77B73]">
                  {" "}
                  Build it. Challenge it.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#806E68]">
                Start with the version you can control. Progress when you feel
                ready — not because you reached a certain day.
              </p>
            </div>

            <div className="mt-7 grid overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] md:grid-cols-3">
              {trainingLevels.map(
                (level, index) => (
                  <div
                    key={level.number}
                    className={`p-6 ${
                      index !== 0
                        ? "border-t border-[#E1D3CE] md:border-l md:border-t-0"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl text-[#D2B0A9]">
                        {level.number}
                      </span>

                      <span className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                        {level.title}
                      </span>
                    </div>

                    <p className="mt-5 font-serif text-xl italic text-[#A77B73]">
                      {level.tagline}
                    </p>

                    <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                      {level.text}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* 03 — THE BASICS */}

          <section className="border-t border-[#DED0CB] py-10">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                03 · THE BASICS
              </p>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Keep it
                <span className="italic text-[#A77B73]">
                  {" "}
                  simple.
                </span>
              </h2>
            </div>

            <div className="mt-7 divide-y divide-[#DED0CB] border-y border-[#DED0CB]">
              {basics.map(
                (item) => (
                  <div
                    key={item.number}
                    className="grid gap-4 py-6 md:grid-cols-[60px_0.7fr_1.3fr] md:items-start md:gap-6"
                  >
                    <span className="font-serif text-2xl text-[#D2B0A9]">
                      {item.number}
                    </span>

                    <div>
                      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                        {item.title}
                      </p>

                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        {item.tagline}
                      </p>
                    </div>

                    <p className="max-w-xl text-[12px] leading-6 text-[#806E68]">
                      {item.text}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* NOW GO USE IT */}

          <section className="border-t border-[#DED0CB] py-12">
            <div className="rounded-[1.75rem] bg-[#211C19] px-7 py-9 text-[#F7F1ED] md:px-10 md:py-10">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <p className="text-[9px] tracking-[0.32em] text-[#C8B5AF]">
                    YOU KNOW THE METHOD
                  </p>

                  <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                    Now go
                    <span className="italic text-[#DDB5AE]">
                      {" "}
                      use it. ♡
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl text-[12px] leading-6 text-[#C8B5AF]">
                    Head to Resources for your workouts, meal ideas, recovery
                    sessions and tools.
                  </p>
                </div>

                <Link
                  href="/dashboard/resources"
                  className="w-fit shrink-0 rounded-full bg-[#EAD8D3] px-7 py-3.5 text-[10px] tracking-[0.2em] text-[#211C19] transition hover:-translate-y-0.5"
                >
                  EXPLORE RESOURCES →
                </Link>
              </div>

              <div className="mt-8 border-t border-[#493D39] pt-5">
                <p className="font-serif text-lg italic text-[#DDB5AE]">
                  Missed a day? Come back tomorrow.
                </p>

                <p className="mt-1 text-[9px] tracking-[0.18em] text-[#AFA09B]">
                  NO PUNISHMENT • NO PRESSURE • JUST RETURN
                </p>
              </div>
            </div>
          </section>

          {/* SAFETY NOTE */}

          <section className="border-t border-[#DED0CB] py-7">
            <div className="grid gap-4 md:grid-cols-[0.45fr_1.55fr] md:gap-10">
              <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                A NOTE ABOUT YOUR BODY
              </p>

              <p className="text-[11px] leading-5 text-[#927D76]">
                Lock In With Lav provides general fitness and wellness
                education, not individualized medical care or rehabilitation.
                If you&apos;re postpartum, returning after injury,
                experiencing pain, pelvic floor symptoms, abdominal doming or
                coning, or think you may have diastasis recti, consider
                speaking with a qualified healthcare professional or pelvic
                floor physiotherapist before progressing.
              </p>
            </div>
          </section>

          <div className="border-t border-[#DED0CB] py-9 text-center">
            <p className="font-serif text-xl italic text-[#A77B73]">
              just keep showing up. ♡
            </p>
          </div>
       </section>
      </div>
    </main>
  );
}
