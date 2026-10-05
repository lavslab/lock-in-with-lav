"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import { supabase } from "@/lib/supabase";
import { workouts, type Workout } from "@/lib/workouts";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};



/* ---------------------------------
   WORKOUT TYPE ICONS
--------------------------------- */

function LowerBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      <path d="M8.5 8h7c2.5 1.5 4 3.7 4 6.3A7.5 7.5 0 0 1 12 21a7.5 7.5 0 0 1-7.5-6.7c0-2.6 1.5-4.8 4-6.3Z" />
      <path d="M9 8h6" />
    </svg>
  );
}

function GlutesIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5.5c-1.5 1.5-2.25 3.5-2.25 5.75 0 3.25 1.5 5.8 4.25 7.25" />
      <path d="M16 5.5c1.5 1.5 2.25 3.5 2.25 5.75 0 3.25-1.5 5.8-4.25 7.25" />
      <path d="M12 6v12" />
      <path d="M6 12c1.7.7 3.7.7 6 0" />
      <path d="M18 12c-1.7-.7-3.7-.7-6 0" />
    </svg>
  );
}

function FullBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5v6" />
      <path d="M7 9.5 12 8l5 1.5" />
      <path d="m12 12.5-3.5 6" />
      <path d="m12 12.5 3.5 6" />
    </svg>
  );
}

function UpperBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 8.5v7" />
      <path d="M4.5 10v4" />
      <path d="M2.5 11v2" />
      <path d="M16.5 8.5v7" />
      <path d="M19.5 10v4" />
      <path d="M21.5 11v2" />
      <path d="M7.5 12h9" />
    </svg>
  );
}

function CoreIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 5.5c1 1 2.1 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
      <path d="M8.5 5.5 7.5 18" />
      <path d="M15.5 5.5 16.5 18" />
      <path d="M7.5 18c2.8 1 6.2 1 9 0" />
      <path d="M12 7v11" />
      <path d="M9 10.5h6" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

function CardioIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 12h4l1.5-3.5 3 7 2.2-5 1.5 1.5h4.8" />
      <path d="M19 5.75A4.25 4.25 0 0 0 12 8.9a4.25 4.25 0 0 0-7-3.15" />
    </svg>
  );
}
function getWorkoutIcon(
  workout: Workout,
): ComponentType<IconProps> {
  const types = workout.types ?? [workout.type];

  if (types.includes("Glutes")) {
    return GlutesIcon;
  }

  if (types.includes("Lower Body")) {
    return LowerBodyIcon;
  }

  if (types.includes("Upper Body")) {
    return UpperBodyIcon;
  }

  if (types.includes("Core")) {
    return CoreIcon;
  }

  if (types.includes("Cardio")) {
    return CardioIcon;
  }

  return FullBodyIcon;
}
/* ---------------------------------
   EQUIPMENT ICONS
--------------------------------- */

function DumbbellIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 9v6" />
      <path d="M3.5 10.5v3" />
      <path d="M17.5 9v6" />
      <path d="M20.5 10.5v3" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

function HouseholdIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3.5 11 8.5-7 8.5 7" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function MatIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 6h11a3 3 0 0 1 3 3v8H8a3 3 0 0 1-3-3V6Z" />
      <path d="M8 17v2h11" />
      <path d="M8 10h8" />
    </svg>
  );
}

function BodyweightIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5v5" />
      <path d="M7 9.5 12 8l5 1.5" />
      <path d="m12 11.5-3 7" />
      <path d="m12 11.5 3 7" />
      <path d="M7.5 21h3" />
      <path d="M13.5 21h3" />
    </svg>
  );
}

function KettlebellIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2" />
      <path d="M6.5 9.5h11" />
      <path d="M7 9.5c-1 1.2-1.5 2.7-1.5 4.5 0 3.5 2.7 6 6.5 6s6.5-2.5 6.5-6c0-1.8-.5-3.3-1.5-4.5" />
      <path d="M9 7h6" />
    </svg>
  );
}

function BandIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 7c4 2 10 2 14 0" />
      <path d="M5 17c4-2 10-2 14 0" />
      <path d="M5 7c-2 2.5-2 7.5 0 10" />
      <path d="M19 7c2 2.5 2 7.5 0 10" />
    </svg>
  );
}

function MachineIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 19V7h9" />
      <path d="M15 7v5h4" />
      <path d="M9 19h10" />
      <path d="M4 19h2" />
      <path d="M9 7V4h4" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function getEquipmentIcon(
  equipment: string,
): ComponentType<IconProps> {
  const normalized = equipment.toUpperCase();

  if (normalized.includes("HOUSEHOLD")) {
    return HouseholdIcon;
  }

  if (normalized.includes("MAT")) {
    return MatIcon;
  }

  if (normalized.includes("BODYWEIGHT")) {
    return BodyweightIcon;
  }

  if (
    normalized.includes("GYM") ||
    normalized.includes("MACHINE")
  ) {
    return MachineIcon;
  }

  if (normalized.includes("BAND")) {
    return BandIcon;
  }

  if (normalized.includes("KETTLEBELL")) {
    return KettlebellIcon;
  }

  return DumbbellIcon;
}

/* ---------------------------------
   WORKOUT DETAIL ICONS
--------------------------------- */

function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v5l3 2" />
    </svg>
  );
}

function ExerciseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5.5 7 1.5 1.5L9.5 6" />
      <path d="M12 7h6.5" />
      <path d="m5.5 12 1.5 1.5 2.5-2.5" />
      <path d="M12 12h6.5" />
      <path d="m5.5 17 1.5 1.5 2.5-2.5" />
      <path d="M12 17h6.5" />
    </svg>
  );
}

/* ---------------------------------
   WORKOUT DATA
--------------------------------- */




const locations = [
  "All",
  "Home",
  "Gym",
  "No Equipment",
];

const types = [
  "All",
  "Full Body",
  "Lower Body",
  "Glutes",
  "Upper Body",
  "Core",
  "Cardio",
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ---------------------------------
   PAGE
--------------------------------- */

export default function WorkoutsPage() {
  const [firstName, setFirstName] =
    useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [
    currentChallengeDay,
    setCurrentChallengeDay,
  ] = useState<number | null>(null);

  const [
    selectedWorkoutIds,
    setSelectedWorkoutIds,
  ] = useState<string[]>([]);

  const [location, setLocation] =
    useState("All");

  const [type, setType] =
    useState("All");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Could not load user:",
          userError,
        );
      }

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      setUserId(user.id);

      const savedName =
        user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(
          user.email.split("@")[0],
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "challenge_start_date, challenge_length",
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Could not load profile:",
          profileError,
        );

        setIsLoadingUser(false);
        return;
      }

      if (!profile?.challenge_start_date) {
        setIsLoadingUser(false);
        return;
      }

      const challengeLength =
        profile.challenge_length ?? 75;

      const startDate = new Date(
        `${profile.challenge_start_date}T00:00:00`,
      );

      const today = new Date();

      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const differenceInDays =
        Math.floor(
          (today.getTime() -
            startDate.getTime()) /
            86400000,
        ) + 1;

      const calculatedDay = Math.min(
        Math.max(differenceInDays, 1),
        challengeLength,
      );

      setCurrentChallengeDay(
        calculatedDay,
      );

      const {
        data: savedProgress,
        error: progressError,
      } = await supabase
        .from("daily_progress")
        .select("selected_workouts")
        .eq("user_id", user.id)
        .eq(
          "challenge_day",
          calculatedDay,
        )
        .maybeSingle();

      if (progressError) {
        console.error(
          "Could not load today's workouts:",
          progressError,
        );
      } else {
        const savedWorkouts =
          Array.isArray(
            savedProgress?.selected_workouts,
          )
            ? savedProgress.selected_workouts
            : [];

        const savedIds = savedWorkouts
          .map(
            (item: { id?: unknown }) =>
              item?.id,
          )
          .filter(
            (id: unknown): id is string =>
              typeof id === "string",
          );

        setSelectedWorkoutIds(savedIds);
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser &&
    firstName !== "there"
      ? firstName
          .charAt(0)
          .toUpperCase()
      : "♡";

  const filteredWorkouts =
    useMemo(() => {
      return workouts.filter(
        (workout) => {
          const locationMatch =
            location === "All" ||
            workout.locations.includes(
              location,
            );

          const workoutTypes =
            workout.types ?? [
              workout.type,
            ];

          const typeMatch =
            type === "All" ||
            workoutTypes.includes(type);

          return (
            locationMatch &&
            typeMatch
          );
        },
      );
    }, [location, type]);

  const saveSelectedWorkouts = async (
    workoutIds: string[],
  ) => {
    if (
      !userId ||
      currentChallengeDay === null
    ) {
      return false;
    }

    const selectedWorkouts =
      workoutIds
        .map((id) =>
          workouts.find(
            (item) =>
              item.id === id,
          ),
        )
        .filter(
          (
            item,
          ): item is Workout =>
            Boolean(item),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          type: item.type,
          time: item.time,
          equipment: Array.isArray(
            item.equipment,
          )
            ? item.equipment.join(", ")
            : item.equipment,
          exercises: item.exercises,
        }));

    const progressDate =
      formatLocalDate(new Date());

    const { error } = await supabase
      .from("daily_progress")
      .upsert(
        {
          user_id: userId,
          challenge_day:
            currentChallengeDay,
          progress_date:
            progressDate,
          selected_workouts:
            selectedWorkouts,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,challenge_day",
        },
      );

    if (error) {
      console.error(
        "Could not save today's workouts:",
        error,
      );

      return false;
    }

    return true;
  };

  const chooseWorkoutForToday = async (
    workout: Workout,
  ) => {
    if (
      !userId ||
      currentChallengeDay === null
    ) {
      return;
    }

    if (
      selectedWorkoutIds.includes(
        workout.id,
      )
    ) {
      return;
    }

    const previousIds =
      selectedWorkoutIds;

    const nextIds = [
      ...previousIds,
      workout.id,
    ];

    setSelectedWorkoutIds(nextIds);

    const saved =
      await saveSelectedWorkouts(
        nextIds,
      );

    if (!saved) {
      setSelectedWorkoutIds(
        previousIds,
      );
    }
  };

  const removeWorkoutForToday = async (
    workoutId?: string,
  ) => {
    if (
      !userId ||
      currentChallengeDay === null
    ) {
      return;
    }

    const previousIds =
      selectedWorkoutIds;

    const nextIds = workoutId
      ? previousIds.filter(
          (id) => id !== workoutId,
        )
      : [];

    setSelectedWorkoutIds(nextIds);

    const saved =
      await saveSelectedWorkouts(
        nextIds,
      );

    if (!saved) {
      setSelectedWorkoutIds(
        previousIds,
      );
    }
  };
  const FilterButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[8px] tracking-[0.18em] transition ${
        active
          ? "border-[#A77B73] bg-[#EAD8D3] text-[#211C19]"
          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#B9948B] hover:bg-[#F1E6E2]"
      }`}
    >
      {label.toUpperCase()}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* DESKTOP SIDEBAR */}
        <DashboardSidebar
  initial={initial}
  firstName={firstName}
  isLoadingUser={isLoadingUser}
/>

        {/* MAIN */}
        <section className="min-w-0 flex-1">
          {/* DESKTOP TOP BAR */}
          <header className="hidden border-b border-[#E1D3CE] px-8 py-5 md:flex md:items-center md:justify-between lg:px-12">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                RESOURCES
              </p>

              <p className="mt-1 font-serif text-xl">
                Workout Library
              </p>
            </div>

            <Link
              href="/dashboard/account"
              aria-label="My account"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6C3BD] bg-[#EAD8D3] font-serif text-base"
            >
              {initial}
            </Link>
          </header>

          <section className="px-5 pb-28 pt-8 sm:px-7 md:px-8 md:pb-16 md:pt-10 lg:px-12">
            {/* INTRO */}
            <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-8 md:px-9 md:py-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                    WORKOUT LIBRARY
                  </p>

                  <h1 className="mt-4 font-serif text-4xl leading-[0.95] sm:text-5xl md:text-6xl">
                    Pick your
                    <span className="block italic text-[#A77B73]">
                      movement.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-6 text-[#806E68]">
                    Choose what works for your
                    body, your space and your
                    energy today. One workout is
                    enough. A few together works
                    too. ♡
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-[#EAD8D3] px-5 py-4 lg:max-w-xs">
                  <p className="text-[8px] tracking-[0.25em] text-[#8F655E]">
                    LOCK IN REMINDER
                  </p>

                  <p className="mt-2 font-serif text-xl italic text-[#6F514B]">
                    consistency over perfection.
                  </p>
                </div>
              </div>
            </section>

            {/* FILTERS */}
            <section className="py-8">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    WHERE ARE YOU TRAINING?
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {locations.map(
                      (item) => (
                        <FilterButton
                          key={item}
                          label={item}
                          active={
                            location ===
                            item
                          }
                          onClick={() =>
                            setLocation(
                              item,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    WHAT ARE WE WORKING?
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {types.map((item) => (
                      <FilterButton
                        key={item}
                        label={item}
                        active={
                          type === item
                        }
                        onClick={() =>
                          setType(item)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* TODAY'S WORKOUTS */}
            {selectedWorkoutIds.length >
              0 && (
              <section className="mb-10 rounded-[2rem] border border-[#CBA9A2] bg-[#EAD8D3]/45 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                      TODAY&apos;S MOVEMENT
                    </p>

                    <h2 className="mt-3 font-serif text-3xl">
                      You&apos;re locked in.{" "}
                      <span className="italic text-[#A77B73]">
                        ♡
                      </span>
                    </h2>

                    <p className="mt-2 text-sm text-[#725F5A]">
                      {
                        selectedWorkoutIds.length
                      }{" "}
                      {selectedWorkoutIds.length ===
                      1
                        ? "workout"
                        : "workouts"}{" "}
                      selected. ♡
                    </p>

                    <p className="mt-1 text-xs text-[#725F5A]">
                      Mix strength, cardio, core
                      or whatever fits your day.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedWorkoutIds.map(
                        (id) => {
                          const workout =
                            workouts.find(
                              (item) =>
                                item.id ===
                                id,
                            );

                          if (!workout) {
                            return null;
                          }

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() =>
                                removeWorkoutForToday(
                                  id,
                                )
                              }
                              className="rounded-full border border-[#B78F87] bg-[#F7F1ED]/60 px-3 py-2 text-[7px] tracking-[0.12em] text-[#6F514B] transition hover:bg-[#F7F1ED]"
                            >
                              {workout.title.toUpperCase()}{" "}
                              ×
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeWorkoutForToday()
                    }
                    className="w-fit rounded-full border border-[#B78F87] px-5 py-3 text-[7px] tracking-[0.2em] text-[#6F514B] transition hover:bg-[#F7F1ED]"
                  >
                    CLEAR TODAY&apos;S
                    WORKOUTS
                  </button>
                </div>
              </section>
            )}

            {/* WORKOUTS */}
            <section className="pb-12">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                    BROWSE WORKOUTS
                  </p>

                  <h1 className="mt-3 font-serif text-3xl md:text-4xl">
                    Build your{" "}
                    <span className="italic text-[#A77B73]">
                      session.
                    </span>
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                    Choose one workout or add a
                    few together. You can mix
                    strength, cardio, core and
                    more.
                  </p>
                </div>

                <p className="font-serif text-lg italic text-[#A77B73]">
                  {filteredWorkouts.length}{" "}
                  {filteredWorkouts.length ===
                  1
                    ? "workout"
                    : "workouts"}{" "}
                  ♡
                </p>
              </div>

              {filteredWorkouts.length >
              0 ? (
                <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredWorkouts.map(
                    (
                      workout,
                      index,
                    ) => {
                     const Icon = getWorkoutIcon(workout);

                      const isSelected =
                        selectedWorkoutIds.includes(
                          workout.id,
                        );

                      const equipmentItems =
                        Array.isArray(
                          workout.equipment,
                        )
                          ? workout.equipment
                          : [
                              workout.equipment,
                            ];

                      return (
                        <article
                          key={workout.id}
                          className={`group flex min-h-[300px] flex-col justify-between rounded-[1.75rem] border bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-sm ${
                            isSelected
                              ? "border-[#A77B73]"
                              : "border-[#DED0CB] hover:border-[#CBA9A2]"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#EAD8D3] text-[#9D6F67] transition duration-300 group-hover:bg-[#E3CCC6]">
                                  <Icon className="h-6 w-6" />
                                </div>

                                <span className="font-serif text-sm text-[#C6A29A]">
                                  {String(
                                    index +
                                      1,
                                  ).padStart(
                                    2,
                                    "0",
                                  )}
                                </span>
                              </div>

                              <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">
                                {workout.level.toUpperCase()}
                              </span>
                            </div>

                            <p className="mt-6 text-[8px] tracking-[0.25em] text-[#806E68]">
                              {workout.type.toUpperCase()}{" "}
                              •{" "}
                              {workout.locations
                                .filter(
                                  (
                                    location,
                                  ) =>
                                    location !==
                                    "No Equipment",
                                )
                                .join(
                                  " + ",
                                )
                                .toUpperCase()}
                              {workout.locations.includes(
                                "No Equipment",
                              )
                                ? " • NO EQUIPMENT"
                                : ""}
                            </p>

                            <h2 className="mt-3 font-serif text-3xl leading-tight">
                              {
                                workout.title
                              }
                            </h2>

                            <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                              {
                                workout.subtitle
                              }
                            </p>
                          </div>

                          <div className="mt-8">
                            <div className="grid grid-cols-3 gap-2 border-t border-[#E1D3CE] pt-4">
                              {/* TIME */}
                              <div className="flex min-w-0 items-center gap-2">
                                <ClockIcon className="h-4 w-4 shrink-0 text-[#B48A82]" />

                                <span className="block text-[7px] leading-3 tracking-[0.1em] text-[#806E68]">
                                  {
                                    workout.time
                                  }
                                </span>
                              </div>

                              {/* EQUIPMENT */}
                              <div className="flex min-w-0 items-start gap-2">
                                <div className="flex min-w-0 flex-col gap-1">
                                  {equipmentItems.map(
                                    (
                                      item,
                                    ) => {
                                      const EquipmentIcon =
                                        getEquipmentIcon(
                                          item,
                                        );

                                      return (
                                        <div
                                          key={
                                            item
                                          }
                                          className="flex items-center gap-1.5"
                                        >
                                          <EquipmentIcon className="h-3.5 w-3.5 shrink-0 text-[#B48A82]" />

                                          <span className="block text-[7px] leading-3 tracking-[0.08em] text-[#806E68]">
                                            {
                                              item
                                            }
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </div>

                              {/* EXERCISES */}
                              <div className="flex min-w-0 items-center justify-end gap-2">
                                <ExerciseIcon className="h-4 w-4 shrink-0 text-[#B48A82]" />

                                <span className="block text-[7px] leading-3 tracking-[0.08em] text-[#806E68]">
                                  {
                                    workout.exercises
                                  }
                                </span>
                              </div>
                            </div>
                                                        <div className="mt-5 grid gap-2">
                              <button
                                type="button"
                                disabled={
                                  !userId ||
                                  currentChallengeDay ===
                                    null
                                }
                                onClick={() => {
                                  if (
                                    isSelected
                                  ) {
                                    removeWorkoutForToday(
                                      workout.id,
                                    );
                                  } else {
                                    chooseWorkoutForToday(
                                      workout,
                                    );
                                  }
                                }}
                                className={`flex w-full items-center justify-center rounded-full border px-4 py-3 text-[7px] tracking-[0.22em] transition ${
                                  isSelected
                                    ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
                                    : "border-[#CBA9A2] text-[#9D6F67] hover:bg-[#EAD8D3]"
                                } ${
                                  !userId ||
                                  currentChallengeDay ===
                                    null
                                    ? "cursor-wait opacity-60"
                                    : ""
                                }`}
                              >
                                {isSelected
                                  ? "ADDED TO TODAY ✓"
                                  : "ADD TO TODAY"}
                              </button>

                              <Link
                                href={`/dashboard/resources/workouts/${workout.id}`}
                                className="flex items-center justify-between border-t border-[#E1D3CE] pt-3 text-[7px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
                              >
                                <span>
                                  VIEW WORKOUT
                                </span>

                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition hover:bg-[#EAD8D3]">
                                  →
                                </span>
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center">
                  <p className="font-serif text-3xl italic text-[#A77B73]">
                    nothing here yet. ♡
                  </p>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">
                    Try another combination —
                    we&apos;re still growing the
                    workout library.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setLocation("All");
                      setType("All");
                    }}
                    className="mt-6 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              )}
            </section>

            {/* BEGINNER HELP */}
            <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                    YOUR BODY. YOUR PACE.
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Modify when you need to.{" "}
                    <span className="italic text-[#9D6F67]">
                      keep moving. ♡
                    </span>
                  </h2>
                </div>

                <Link
                  href="/dashboard/resources/beginners"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  EXERCISE HELP →
                </Link>
              </div>
            </section>

            {/* BACK TO RESOURCES */}
            <section className="py-14 text-center">
              <Link
                href="/dashboard/resources"
                className="text-[8px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
              >
                ← BACK TO ALL RESOURCES
              </Link>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}