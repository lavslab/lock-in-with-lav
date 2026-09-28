"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};

/* ---------------------------------
   WORKOUT TYPE ICONS
--------------------------------- */

/* LOWER BODY — KETTLEBELL */
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

/* GLUTES */
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
      <path d="M18 12c-1.7.7-3.7.7-6 0" />
    </svg>
  );
}

/* FULL BODY */
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

/* UPPER BODY — DUMBBELL */
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

/* CORE */
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

/* CARDIO */
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

function EquipmentIcon({ className = "" }: IconProps) {
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

const workouts = [
  {
    id: "lower-body-foundation",
    title: "Lower Body Foundation",
    subtitle: "build the base.",
    locations: ["Home", "Gym"],
    level: "Beginner",
    type: "Lower Body",
    time: "35 MIN",
    equipment: "DUMBBELLS",
    exercises: "6 EXERCISES",
    icon: LowerBodyIcon,
  },
  {
    id: "glute-builder",
    title: "Glute Builder",
    subtitle: "slow reps. strong finish.",
    locations: ["Home", "Gym"],
    level: "Intermediate",
    type: "Glutes",
    time: "40 MIN",
    equipment: "DUMBBELLS + BAND",
    exercises: "7 EXERCISES",
    icon: GlutesIcon,
  },
  {
    id: "full-body-reset",
    title: "Full Body Reset",
    subtitle: "move everything.",
    locations: ["Home", "Gym", "No Equipment"],
    level: "Beginner",
    type: "Full Body",
    time: "25 MIN",
    equipment: "BODYWEIGHT",
    exercises: "6 EXERCISES",
    icon: FullBodyIcon,
  },
  {
    id: "upper-body-build",
    title: "Upper Body Build",
    subtitle: "strong looks good on you.",
    locations: ["Home", "Gym"],
    level: "Intermediate",
    type: "Upper Body",
    time: "45 MIN",
    equipment: "GYM",
    exercises: "7 EXERCISES",
    icon: UpperBodyIcon,
  },
  {
    id: "core-control",
    title: "Core Control",
    subtitle: "strength from the centre.",
    locations: ["Home", "Gym"],
    level: "Beginner",
    type: "Core",
    time: "20 MIN",
    equipment: "MAT",
    exercises: "6 EXERCISES",
    icon: CoreIcon,
  },
  {
    id: "cardio-lock-in",
    title: "Cardio Lock In",
    subtitle: "heart up. head clear.",
    locations: ["Home", "Gym", "No Equipment"],
    level: "Intermediate",
    type: "Cardio",
    time: "30 MIN",
    equipment: "BODYWEIGHT",
    exercises: "8 INTERVALS",
    icon: CardioIcon,
  },
];

const locations = ["All", "Home", "Gym", "No Equipment"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ---------------------------------
   PAGE
--------------------------------- */

export default function WorkoutsPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );

  const [location, setLocation] = useState("All");
  const [level, setLevel] = useState("All");
  const [type, setType] = useState("All");

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

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const todayKey = formatLocalDate(new Date());
      const storageKey = `selected-workout-${user.id}-${todayKey}`;
      const savedWorkout = localStorage.getItem(storageKey);

      if (savedWorkout) {
        try {
          const parsedWorkout = JSON.parse(savedWorkout);

          if (parsedWorkout?.id) {
            setSelectedWorkoutId(parsedWorkout.id);
          }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const locationMatch =
        location === "All" || workout.locations.includes(location);

      const levelMatch =
        level === "All" || workout.level === level;

      const typeMatch =
        type === "All" || workout.type === type;

      return locationMatch && levelMatch && typeMatch;
    });
  }, [location, level, type]);

  const chooseWorkoutForToday = (workout: (typeof workouts)[number]) => {
    if (!userId) {
      return;
    }

    const todayKey = formatLocalDate(new Date());
    const storageKey = `selected-workout-${userId}-${todayKey}`;

    const selectedWorkout = {
      id: workout.id,
      title: workout.title,
      subtitle: workout.subtitle,
      type: workout.type,
      time: workout.time,
      equipment: workout.equipment,
      exercises: workout.exercises,
    };

    localStorage.setItem(storageKey, JSON.stringify(selectedWorkout));
    setSelectedWorkoutId(workout.id);
  };

  const removeWorkoutForToday = () => {
    if (!userId) {
      return;
    }

    const todayKey = formatLocalDate(new Date());
    const storageKey = `selected-workout-${userId}-${todayKey}`;

    localStorage.removeItem(storageKey);
    setSelectedWorkoutId(null);
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
          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
      }`}
    >
      {label.toUpperCase()}
    </button>
  );

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
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                your workout library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          {/* FILTERS */}
          <section className="pb-10 pt-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-3">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHERE ARE YOU TRAINING?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {locations.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={location === option}
                        onClick={() => setLocation(option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    YOUR LEVEL
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {levels.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={level === option}
                        onClick={() => setLevel(option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHAT ARE WE TRAINING?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {types.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={type === option}
                        onClick={() => setType(option)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WORKOUTS */}
          <section className="pb-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  BROWSE WORKOUTS
                </p>

                <h1 className="mt-3 font-serif text-3xl md:text-4xl">
                  Pick your{" "}
                  <span className="italic text-[#A77B73]">
                    session.
                  </span>
                </h1>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                {filteredWorkouts.length}{" "}
                {filteredWorkouts.length === 1
                  ? "workout"
                  : "workouts"}{" "}
                ♡
              </p>
            </div>

            {filteredWorkouts.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredWorkouts.map((workout, index) => {
                  const Icon = workout.icon;
                  const isSelected =
                    selectedWorkoutId === workout.id;

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
                        {/* ICON + LEVEL */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#EAD8D3] text-[#9D6F67] transition duration-300 group-hover:bg-[#E3CCC6]">
                              <Icon className="h-6 w-6" />
                            </div>

                            <span className="font-serif text-sm text-[#C6A29A]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">
                            {workout.level.toUpperCase()}
                          </span>
                        </div>

                        {/* WORKOUT INFO */}
                        <p className="mt-6 text-[8px] tracking-[0.25em] text-[#806E68]">
                          {workout.type.toUpperCase()} •{" "}
                          {workout.locations.includes("No Equipment")
                            ? "HOME + GYM • NO EQUIPMENT"
                            : "HOME + GYM"}
                        </p>

                        <h2 className="mt-3 font-serif text-3xl leading-tight">
                          {workout.title}
                        </h2>

                        <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                          {workout.subtitle}
                        </p>
                      </div>

                      <div className="mt-8">
                        {/* WORKOUT DETAILS */}
                        <div className="grid grid-cols-3 gap-2 border-t border-[#E1D3CE] pt-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <ClockIcon className="h-4 w-4 shrink-0 text-[#B48A82]" />

                            <span className="truncate text-[7px] tracking-[0.1em] text-[#806E68]">
                              {workout.time}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <EquipmentIcon className="h-4 w-4 shrink-0 text-[#B48A82]" />

                            <span className="truncate text-[7px] tracking-[0.08em] text-[#806E68]">
                              {workout.equipment}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <ExerciseIcon className="h-4 w-4 shrink-0 text-[#B48A82]" />

                            <span className="truncate text-[7px] tracking-[0.08em] text-[#806E68]">
                              {workout.exercises}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 grid gap-2">
                          <button
                            type="button"
                            disabled={!userId}
                            onClick={() => {
                              if (isSelected) {
                                removeWorkoutForToday();
                              } else {
                                chooseWorkoutForToday(workout);
                              }
                            }}
                            className={`flex w-full items-center justify-center rounded-full border px-4 py-3 text-[7px] tracking-[0.22em] transition ${
                              isSelected
                                ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
                                : "border-[#CBA9A2] text-[#9D6F67] hover:bg-[#EAD8D3]"
                            } ${
                              !userId
                                ? "cursor-wait opacity-60"
                                : ""
                            }`}
                          >
                            {isSelected
                              ? "CHOSEN FOR TODAY ✓"
                              : "CHOOSE FOR TODAY"}
                          </button>

                          <Link
                            href={`/dashboard/resources/workouts/${workout.id}`}
                            className="flex items-center justify-between border-t border-[#E1D3CE] pt-3 text-[7px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
                          >
                            <span>VIEW WORKOUT</span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition hover:bg-[#EAD8D3]">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center">
                <p className="font-serif text-3xl italic text-[#A77B73]">
                  nothing here yet. ♡
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">
                  Try another combination — we&apos;re still growing the
                  workout library.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLocation("All");
                    setLevel("All");
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
      </div>
    </main>
  );
}