"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type SwapOption = {
  name: string;
  location: "GYM" | "HOME" | "BOTH";
  note: string;
};

type WorkoutExercise = {
  number: string;
  name: string;
  prescription: string;
  rest: string;
  cue: string;
  modification: string;
};

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Bodyweight Squat": [
    {
      name: "Goblet Squat",
      location: "HOME",
      note: "Adds light resistance while keeping the same squat pattern.",
    },
    {
      name: "Chair Squat",
      location: "HOME",
      note: "Provides a stable target and keeps the movement beginner-friendly.",
    },
    {
      name: "Leg Press",
      location: "GYM",
      note: "Stable machine-based option for training the lower body.",
    },
  ],

  "Incline Push-Up": [
    {
      name: "Wall Push-Up",
      location: "HOME",
      note: "A higher surface makes the pushing movement easier.",
    },
    {
      name: "Knee Push-Up",
      location: "HOME",
      note: "Keeps the push-up pattern with less bodyweight to control.",
    },
    {
      name: "Chest Press",
      location: "GYM",
      note: "Machine-based pressing option for the same general movement pattern.",
    },
  ],

  "Alternating Reverse Lunge": [
    {
      name: "Split Squat",
      location: "BOTH",
      note: "Keeps the single-leg pattern without requiring a step.",
    },
    {
      name: "Step-Up",
      location: "BOTH",
      note: "Single-leg option using a stable step or bench.",
    },
    {
      name: "Goblet Squat",
      location: "BOTH",
      note: "Bilateral option when single-leg work is not comfortable.",
    },
  ],

  "Glute Bridge": [
    {
      name: "Hip Thrust",
      location: "BOTH",
      note: "A larger-range hip extension movement for the glutes.",
    },
    {
      name: "Frog Pump",
      location: "HOME",
      note: "Simple floor-based option with a strong glute focus.",
    },
    {
      name: "Cable Pull-Through",
      location: "GYM",
      note: "Standing hip-extension option with cable resistance.",
    },
  ],

  "Bird Dog": [
    {
      name: "Dead Bug",
      location: "HOME",
      note: "Core-focused option that trains controlled opposite-side movement.",
    },
    {
      name: "Quadruped Leg Extension",
      location: "HOME",
      note: "Simplifies the movement by focusing on the lower body.",
    },
    {
      name: "Pallof Press",
      location: "GYM",
      note: "Anti-rotation core exercise using cable resistance.",
    },
  ],

  "Low-Impact Mountain Climber": [
    {
      name: "Marching Plank",
      location: "HOME",
      note: "Keeps the plank position while slowing down the movement.",
    },
    {
      name: "Standing Knee Drive",
      location: "HOME",
      note: "Low-impact standing option that still gets the body moving.",
    },
    {
      name: "Bike",
      location: "GYM",
      note: "Low-impact cardio option that can be performed at a controlled pace.",
    },
  ],
};

/*
 * Expand the swap system so that replacement exercises can also
 * be swapped again.
 *
 * Example:
 * Bodyweight Squat
 * → Goblet Squat
 * → Chair Squat
 * → Leg Press
 * → back to another available option
 *
 * This means the swap button stays available after every replacement.
 */
const expandedExerciseSwaps: Record<string, SwapOption[]> = {
  ...exerciseSwaps,
};

Object.entries(exerciseSwaps).forEach(([originalExercise, options]) => {
  options.forEach((option) => {
    if (!expandedExerciseSwaps[option.name]) {
      expandedExerciseSwaps[option.name] = [
        {
          name: originalExercise,
          location: "BOTH",
          note: `Swap back to ${originalExercise}.`,
        },
        ...options.filter((item) => item.name !== option.name),
      ];
    }
  });
});

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Bodyweight Squat",
    prescription: "3 SETS × 12 REPS",
    rest: "45 SEC REST",
    cue: "Brace your core, sit down between your hips, and keep your knees tracking in the same direction as your toes.",
    modification: "Squat to a chair or reduce your range of motion.",
  },

  {
    number: "02",
    name: "Incline Push-Up",
    prescription: "3 SETS × 8–10 REPS",
    rest: "45 SEC REST",
    cue: "Keep your body in one straight line and lower your chest toward the surface with your elbows angled slightly back.",
    modification: "Use a higher surface, such as a counter or sturdy table.",
  },

  {
    number: "03",
    name: "Alternating Reverse Lunge",
    prescription: "3 SETS × 8 / SIDE",
    rest: "45 SEC REST",
    cue: "Step back softly, lower with control, and drive through your front foot to return to standing.",
    modification:
      "Hold a wall or chair for balance, or use a smaller range of motion.",
  },

  {
    number: "04",
    name: "Glute Bridge",
    prescription: "3 SETS × 15 REPS",
    rest: "45 SEC REST",
    cue: "Press through your heels, keep your ribs down, and squeeze your glutes at the top without arching your lower back.",
    modification: "Reduce your range of motion or pause briefly between reps.",
  },

  {
    number: "05",
    name: "Bird Dog",
    prescription: "3 SETS × 8 / SIDE",
    rest: "30 SEC REST",
    cue: "Brace your core and reach the opposite arm and leg away from you while keeping your hips square to the floor.",
    modification:
      "Move only your arm or only your leg until you feel stable.",
  },

  {
    number: "06",
    name: "Low-Impact Mountain Climber",
    prescription: "3 SETS × 30 SEC",
    rest: "45 SEC REST",
    cue: "Keep your hands under your shoulders and step one knee forward at a time while keeping your core engaged.",
    modification:
      "Perform the movement with your hands elevated on a sturdy surface.",
  },
];

const warmup = [
  "March in place — 60 sec",
  "Arm circles — 10 each direction",
  "Bodyweight good mornings — 10 reps",
  "Alternating step-back lunges — 6 / side",
];

const cooldown = [
  "Standing quad stretch — 30 sec / side",
  "Chest + shoulder stretch — 30 sec / side",
  "Figure-four stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function FullBodyResetPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [workoutExercises, setWorkoutExercises] =
    useState<WorkoutExercise[]>(exercises);

  const [openSwapFor, setOpenSwapFor] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-6 md:px-10 md:py-8 lg:px-14">
          {/* TOP NAV */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.34em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-1.5 font-serif text-lg italic text-[#A77B73]">
                workout library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/workouts"
              className="rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:text-[8px]"
            >
              ← WORKOUTS
            </Link>
          </header>

          {/* WORKOUT HEADER */}
          <section className="mt-9 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  FULL BODY • BEGINNER
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Full Body{" "}
                  <span className="italic text-[#A77B73]">
                    Reset.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A simple equipment-free session to move your whole body,
                  build control, and get back into your rhythm.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                move everything. ♡
              </p>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  25 min
                </p>
              </div>

              <div className="border-b border-[#E1D3CE] py-4 pl-4 sm:border-b-0 sm:border-r">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EXERCISES
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  06
                </p>
              </div>

              <div className="border-r border-[#E1D3CE] py-4 pr-3 sm:pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  FOCUS
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Full body
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  None
                </p>
              </div>
            </div>
          </section>

          {/* WARM UP */}
          <section className="mt-5 rounded-[1.5rem] bg-[#EAD8D3] px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
              <div>
                <p className="text-[7px] tracking-[0.24em] text-[#8F655E]">
                  01 • WARM UP
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Get ready{" "}
                  <span className="italic text-[#9D6F67]">
                    to move.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Raise your heart rate and prepare your whole body
                  for the session.
                </p>
              </div>

              <div className="grid gap-x-7 sm:grid-cols-2">
                {warmup.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-t border-[#D5BBB5] py-3"
                  >
                    <span className="font-serif text-xs italic text-[#9D6F67]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-xs leading-5 text-[#5F504B]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* WORKOUT */}
          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[7px] tracking-[0.26em] text-[#9D6F67]">
                  02 • THE WORKOUT
                </p>

                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                  Your{" "}
                  <span className="italic text-[#A77B73]">
                    six movements.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-5 text-[#806E68]">
                Work through each movement in order. No equipment
                needed — just focus on steady, controlled reps.
              </p>
            </div>

            {/* ONE WORKOUT CARD */}
            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {workoutExercises.map((exercise, index) => (
                <article
                  key={exercise.number}
                  className={`px-4 py-6 sm:px-6 ${
                    index !== workoutExercises.length - 1
                      ? "border-b border-[#DED0CB]"
                      : ""
                  }`}
                >
                  {/* MAIN ROW */}
                  <div className="grid gap-4 md:grid-cols-[42px_minmax(0,1fr)_auto] md:items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-[11px] text-[#A77B73]">
                      {exercise.number}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-serif text-xl leading-tight sm:text-2xl">
                        {exercise.name}
                      </h3>

                      <p className="mt-2 max-w-2xl text-xs leading-5 text-[#806E68]">
                        {exercise.cue}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-[240px] md:justify-end">
                      <span className="rounded-full bg-[#EAD8D3] px-3 py-2 text-[8px] tracking-[0.11em] text-[#6F514B]">
                        {exercise.prescription}
                      </span>

                      <span className="rounded-full border border-[#D6C3BD] px-3 py-2 text-[8px] tracking-[0.11em] text-[#806E68]">
                        {exercise.rest}
                      </span>
                    </div>
                  </div>

                  {/* EASIER OPTION */}
                  <div className="mt-5 md:ml-[58px]">
                    <div className="border-t border-[#E7DAD6] pt-4">
                      <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                        EASIER OPTION
                      </p>

                      <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                        {exercise.modification}
                      </p>
                    </div>
                  </div>

                  {/* SWAP */}
                  {expandedExerciseSwaps[exercise.name] && (
                    <div className="mt-4 md:ml-[58px]">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSwapFor((current) =>
                            current === exercise.number
                              ? null
                              : exercise.number,
                          )
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3 text-left transition hover:bg-[#EAD8D3]"
                      >
                        <span className="text-[8px] tracking-[0.18em] text-[#8F655E]">
                          ↔ SWAP EXERCISE
                        </span>

                        <span className="text-sm text-[#A77B73]">
                          {openSwapFor === exercise.number
                            ? "−"
                            : "+"}
                        </span>
                      </button>

                      {openSwapFor === exercise.number && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-[#DED0CB] bg-[#EAD8D3]/40">
                          <div className="divide-y divide-[#D8C3BD]">
                            {expandedExerciseSwaps[exercise.name].map(
                              (swap) => (
                                <button
                                  key={`${exercise.number}-${swap.name}`}
                                  type="button"
                                  onClick={() => {
                                    setWorkoutExercises((current) =>
                                      current.map((item) =>
                                        item.number === exercise.number
                                          ? {
                                              ...item,
                                              name: swap.name,
                                              cue: swap.note,
                                            }
                                          : item,
                                      ),
                                    );

                                    setOpenSwapFor(null);
                                  }}
                                  className="group flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#F7F1ED]"
                                >
                                  <span className="min-w-0">
                                    <span className="block font-serif text-base text-[#211C19]">
                                      {swap.name}
                                    </span>

                                    <span className="mt-1 block text-[10px] leading-4 text-[#806E68]">
                                      {swap.note}
                                    </span>

                                    <span className="mt-2 inline-block text-[7px] tracking-[0.16em] text-[#9D6F67]">
                                      {swap.location}
                                    </span>
                                  </span>

                                  <span className="shrink-0 text-sm text-[#C3AAA4] transition group-hover:translate-x-1 group-hover:text-[#A77B73]">
                                    →
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* COOL DOWN */}
          <section className="mt-8 rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
              <div>
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  03 • COOL DOWN
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Finish{" "}
                  <span className="italic text-[#A77B73]">
                    slowly. ♡
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Give your body a few quiet minutes before moving
                  on with your day.
                </p>
              </div>

              <div className="grid gap-x-7 sm:grid-cols-2">
                {cooldown.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-t border-[#E1D3CE] py-3"
                  >
                    <span className="font-serif text-xs italic text-[#A77B73]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-xs leading-5 text-[#5F504B]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINISH */}
          <section className="py-10 text-center">
            <p className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
              FULL BODY RESET
            </p>

            <p className="mt-3 font-serif text-xl italic text-[#A77B73] sm:text-2xl">
              workout complete. keep showing up. ♡
            </p>

            <Link
              href="/dashboard/resources/workouts"
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.2em] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO WORKOUT LIBRARY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}