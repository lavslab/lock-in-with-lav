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

type SwapExerciseDetails = {
  cue: string;
  modification: string;
};

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Goblet Squat": [
    {
      name: "Leg Press",
      location: "GYM",
      note: "Stable option for loading the quads and glutes.",
    },
    {
      name: "Dumbbell Squat",
      location: "BOTH",
      note: "Easy swap when a barbell is not available.",
    },
    {
      name: "Split Squat",
      location: "BOTH",
      note: "Single-leg option that still trains quads and glutes.",
    },
  ],

  "Dumbbell Romanian Deadlift": [
    {
      name: "Dumbbell RDL",
      location: "BOTH",
      note: "Keeps the same hip-hinge pattern.",
    },
    {
      name: "Cable Pull-Through",
      location: "GYM",
      note: "Hip-dominant option with less loading in the hands.",
    },
    {
      name: "Good Morning",
      location: "BOTH",
      note: "Another hinge pattern for hamstrings and glutes.",
    },
    {
      name: "Single-Leg RDL",
      location: "BOTH",
      note: "Adds unilateral work and balance.",
    },
  ],

  "Reverse Lunge": [
    {
      name: "Split Squat",
      location: "BOTH",
      note: "Removes the stepping component.",
    },
    {
      name: "Step-Up",
      location: "BOTH",
      note: "Single-leg option using a box, step or bench.",
    },
    {
      name: "Leg Press",
      location: "GYM",
      note: "Stable bilateral alternative for lower-body loading.",
    },
  ],

  "Glute Bridge": [
    {
      name: "Hip Thrust",
      location: "BOTH",
      note: "A stronger hip-extension option for the glutes.",
    },
    {
      name: "Dumbbell Hip Thrust",
      location: "BOTH",
      note: "Same pattern with easier equipment.",
    },
    {
      name: "Cable Pull-Through",
      location: "GYM",
      note: "Trains hip extension from a standing position.",
    },
    {
      name: "Frog Pump",
      location: "HOME",
      note: "Low-equipment glute-focused option.",
    },
  ],
};

/* SWAP EXERCISE INSTRUCTIONS */

const swapExerciseDetails: Record<
  string,
  SwapExerciseDetails
> = {
  "Leg Press": {
    cue: "Sit back into the machine with your feet about shoulder-width apart. Lower the platform with control, then drive through your whole foot to press it away without locking your knees.",
    modification:
      "Use a lighter weight or reduce your range of motion.",
  },

  "Dumbbell Squat": {
    cue: "Hold a dumbbell at your sides or at your shoulders, brace your core, sit your hips down and back, then drive through your feet to stand tall.",
    modification:
      "Use lighter dumbbells or perform the movement with bodyweight.",
  },

  "Split Squat": {
    cue: "Stand in a staggered stance, lower your back knee toward the floor while keeping your front foot planted, then drive through your front foot to return to standing.",
    modification:
      "Hold onto a stable surface or reduce your range of motion.",
  },

  "Dumbbell RDL": {
    cue: "Hold the dumbbells close to your legs, soften your knees, push your hips back, then squeeze your glutes to return to standing while keeping your back neutral.",
    modification:
      "Use lighter dumbbells or shorten your range of motion.",
  },

  "Cable Pull-Through": {
    cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then drive your hips forward and squeeze your glutes to stand tall.",
    modification:
      "Use a lighter cable weight or shorten your range of motion.",
  },

  "Good Morning": {
    cue: "Stand tall with a soft bend in your knees. Push your hips back while keeping your spine neutral, then squeeze your glutes to return to standing.",
    modification:
      "Reduce your range of motion or perform the movement without added resistance.",
  },

  "Single-Leg RDL": {
    cue: "Balance on one leg, push your hips back while reaching the opposite leg behind you, then drive through your standing foot to return to the starting position.",
    modification:
      "Keep the toes of your non-working leg lightly on the floor or hold onto a stable surface.",
  },

  "Step-Up": {
    cue: "Place one foot on a stable box, step, or bench. Drive through that foot to stand tall, then lower yourself back down with control.",
    modification:
      "Use a lower step or hold onto a stable surface for balance.",
  },

  "Hip Thrust": {
    cue: "Rest your upper back against a stable bench or couch. Drive through your heels to lift your hips, squeeze your glutes at the top, then lower with control.",
    modification:
      "Use bodyweight only or reduce the range of motion.",
  },

  "Dumbbell Hip Thrust": {
    cue: "Rest your upper back against a stable bench or couch with a dumbbell across your hips. Drive through your heels, squeeze your glutes at the top, then lower with control.",
    modification:
      "Use a lighter dumbbell or perform the movement with bodyweight.",
  },

  "Frog Pump": {
    cue: "Lie on your back with the soles of your feet together and knees open. Drive your hips upward, squeeze your glutes at the top, then lower with control.",
    modification:
      "Use a smaller range of motion or slow the movement down.",
  },
};

type WorkoutExercise = {
  number: string;
  name: string;
  swapKey?: string;
  prescription: string;
  rest: string;
  cue: string;
  modification: string;
  home: string;
  gym: string;
};

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Goblet Squat",
    swapKey: "Goblet Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep the weight close to your chest, brace your core, and sit down between your hips.",
    modification: "Use bodyweight or squat to a chair.",
    home: "Goblet Squat — 3 sets × 10–12 reps",
    gym: "Leg Press — 3 sets × 10–12 reps",
  },

  {
    number: "02",
    name: "Dumbbell Romanian Deadlift",
    swapKey: "Dumbbell Romanian Deadlift",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Push your hips back with soft knees and keep the dumbbells close to your legs.",
    modification: "Use lighter weights and shorten your range of motion.",
    home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
    gym: "Smith Machine Romanian Deadlift — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Reverse Lunge",
    swapKey: "Reverse Lunge",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "60 SEC REST",
    cue: "Step back with control and keep your front foot planted as you lower.",
    modification:
      "Hold onto a stable surface or perform stationary split squats.",
    home: "Dumbbell Reverse Lunge — 3 sets × 8–10 / side",
    gym: "Smith Machine Reverse Lunge — 3 sets × 8–10 / side",
  },

  {
    number: "04",
    name: "Glute Bridge",
    swapKey: "Glute Bridge",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Drive through your heels and squeeze your glutes at the top without overextending your back.",
    modification: "Use bodyweight and reduce the range if needed.",
    home: "Dumbbell Glute Bridge — 3 sets × 12–15 reps",
    gym: "Hip Thrust Machine — 3 sets × 12–15 reps",
  },

  {
    number: "05",
    name: "Dumbbell Sumo Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Take a comfortable wide stance, track your knees with your toes, and stay tall through your chest.",
    modification: "Perform the movement without weight.",
    home: "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
    gym: "Hack Squat or Leg Press — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Standing Calf Raise",
    prescription: "3 SETS × 15 REPS",
    rest: "45 SEC REST",
    cue: "Rise slowly onto the balls of your feet, pause at the top, and lower with control.",
    modification: "Hold a wall or chair for balance.",
    home: "Standing Calf Raise — 3 sets × 15 reps",
    gym: "Calf Raise Machine — 3 sets × 15 reps",
  },
];

const warmup = [
  "Bodyweight squats — 10 reps",
  "Hip hinges — 10 reps",
  "Alternating reverse lunges — 6 / side",
  "Glute bridges — 10 reps",
];

const cooldown = [
  "Quad stretch — 30 sec / side",
  "Hamstring stretch — 30 sec / side",
  "Figure-four stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function LowerBodyFoundationPage() {
  const [firstName, setFirstName] = useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [workoutExercises, setWorkoutExercises] =
    useState(exercises);

  const [openSwapFor, setOpenSwapFor] =
    useState<string | null>(null);

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
                  LOWER BODY • BEGINNER
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Lower Body{" "}
                  <span className="italic text-[#A77B73]">
                    Foundation.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build strength through your legs and glutes with
                  controlled, beginner-friendly movement.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                build the base. ♡
              </p>
            </div>

            {/* STATS */}

            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  35 min
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
                  Legs + glutes
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Home or gym
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
                  Move through each once before starting.
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
                Work through each movement in order. Choose the
                setup that fits where you&apos;re training today.
              </p>
            </div>

            {/* ONE WORKOUT CARD */}

            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {workoutExercises.map((exercise, index) => (
                <article
                  key={exercise.number}
                  className={`px-4 py-6 sm:px-6 ${
                    index !== exercises.length - 1
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

                  {/* OPTIONS */}

                  <div className="mt-5 md:ml-[58px]">
                    <div className="grid gap-3 border-t border-[#E7DAD6] pt-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#E1D3CE]">
                      <div className="sm:pr-5">
                        <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          HOME
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                          {exercise.home}
                        </p>
                      </div>

                      <div className="sm:px-5">
                        <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          GYM
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                          {exercise.gym}
                        </p>
                      </div>

                      <div className="sm:pl-5">
                        <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          EASIER OPTION
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                          {exercise.modification}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SWAP */}

                  {exerciseSwaps[
                    exercise.swapKey ?? exercise.name
                  ] && (
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
                            {exerciseSwaps[
                              exercise.swapKey ??
                                exercise.name
                            ].map((swap) => (
                              <button
                                key={`${exercise.number}-${swap.name}`}
                                type="button"
                                onClick={() => {
                                  const swapDetails =
                                    swapExerciseDetails[
                                      swap.name
                                    ];

                                  setWorkoutExercises(
                                    (current) =>
                                      current.map(
                                        (item) =>
                                          item.number ===
                                          exercise.number
                                            ? {
                                                ...item,
                                                name: swap.name,
                                                cue:
                                                  swapDetails?.cue ??
                                                  swap.note,
                                                modification:
                                                  swapDetails?.modification ??
                                                  item.modification,
                                                home: `${swap.name} — ${item.prescription.toLowerCase()}`,
                                                gym: `${swap.name} — ${item.prescription.toLowerCase()}`,
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
                            ))}
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
                  Take a few minutes before moving on.
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
              LOWER BODY FOUNDATION
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