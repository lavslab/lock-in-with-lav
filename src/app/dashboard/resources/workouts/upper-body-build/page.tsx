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
  home: string;
  gym: string;
};

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Lat Pulldown": [
    {
      name: "Dumbbell Pullover",
      location: "HOME",
      note: "Targets the lats through a controlled overhead pulling motion.",
    },
    {
      name: "Resistance Band Pulldown",
      location: "HOME",
      note: "Keeps the vertical pulling pattern with a band.",
    },
    {
      name: "Assisted Pull-Up",
      location: "GYM",
      note: "Another vertical pulling option for the back and lats.",
    },
  ],

  "Seated Cable Row": [
    {
      name: "Dumbbell Bent-Over Row",
      location: "BOTH",
      note: "Keeps the horizontal pulling pattern with free weights.",
    },
    {
      name: "Chest-Supported Dumbbell Row",
      location: "BOTH",
      note: "Provides extra support while training the upper back.",
    },
    {
      name: "Machine Row",
      location: "GYM",
      note: "Stable machine-based alternative for the same pulling pattern.",
    },
  ],

  "Dumbbell Shoulder Press": [
    {
      name: "Arnold Press",
      location: "BOTH",
      note: "Another dumbbell pressing variation for the shoulders.",
    },
    {
      name: "Single-Arm Shoulder Press",
      location: "BOTH",
      note: "Allows you to focus on one side at a time.",
    },
    {
      name: "Machine Shoulder Press",
      location: "GYM",
      note: "Supported pressing option with a stable setup.",
    },
  ],

  "Chest Press Machine": [
    {
      name: "Dumbbell Floor Press",
      location: "HOME",
      note: "Chest press variation that limits the range of motion.",
    },
    {
      name: "Dumbbell Bench Press",
      location: "BOTH",
      note: "Classic horizontal pressing movement for the chest.",
    },
    {
      name: "Push-Up",
      location: "BOTH",
      note: "Bodyweight pressing option for the chest and triceps.",
    },
  ],

  "Dumbbell Lateral Raise": [
    {
      name: "Cable Lateral Raise",
      location: "GYM",
      note: "Keeps constant tension through the shoulder raise.",
    },
    {
      name: "Band Lateral Raise",
      location: "HOME",
      note: "Resistance-band option for the side delts.",
    },
    {
      name: "Lean-Away Lateral Raise",
      location: "BOTH",
      note: "Creates a slightly different resistance curve for the side delts.",
    },
  ],

  "Cable Triceps Pressdown": [
    {
      name: "Overhead Dumbbell Triceps Extension",
      location: "BOTH",
      note: "Trains the triceps through an overhead position.",
    },
    {
      name: "Close-Grip Push-Up",
      location: "BOTH",
      note: "Bodyweight pressing option with more emphasis on the triceps.",
    },
    {
      name: "Bench Dip",
      location: "HOME",
      note: "Bodyweight triceps-focused option using a stable surface.",
    },
  ],

  "Dumbbell Biceps Curl": [
    {
      name: "Hammer Curl",
      location: "BOTH",
      note: "Neutral-grip curl that also trains the brachialis and forearms.",
    },
    {
      name: "Resistance Band Curl",
      location: "HOME",
      note: "Band-based option for the same elbow-flexion pattern.",
    },
    {
      name: "Cable Curl",
      location: "GYM",
      note: "Provides consistent cable resistance through the curl.",
    },
  ],
};

/*
 * This expands the swap system so every exercise that can be selected
 * can also be swapped again.
 *
 * Example:
 * Lat Pulldown
 *   → Dumbbell Pullover
 *      → Lat Pulldown / Resistance Band Pulldown / Assisted Pull-Up
 *
 * This means users can keep swapping as many times as they want.
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
    name: "Lat Pulldown",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep your chest tall and pull your elbows down toward your ribs without swinging or leaning far back.",
    modification:
      "Use a lighter weight and focus on a smooth, controlled pull.",
    home: "Dumbbell Pullover — 3 sets × 10–12 reps",
    gym: "Lat Pulldown — 3 sets × 10–12 reps",
  },
  {
    number: "02",
    name: "Seated Cable Row",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Brace your core, keep your shoulders down, and pull the handle toward your torso while squeezing your shoulder blades together.",
    modification:
      "Reduce the weight and shorten the range slightly if needed.",
    home: "Dumbbell Bent-Over Row — 3 sets × 10–12 reps",
    gym: "Seated Cable Row — 3 sets × 10–12 reps",
  },
  {
    number: "03",
    name: "Dumbbell Shoulder Press",
    prescription: "3 SETS × 8–10 REPS",
    rest: "60 SEC REST",
    cue: "Keep your ribs stacked over your hips and press the dumbbells overhead without arching your lower back.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
    home: "Dumbbell Shoulder Press — 3 sets × 8–10 reps",
    gym: "Dumbbell Shoulder Press — 3 sets × 8–10 reps",
  },
  {
    number: "04",
    name: "Chest Press Machine",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Set the seat so the handles line up around mid-chest, keep your shoulders supported, and press without locking your elbows.",
    modification:
      "Lower the resistance and stop just before your elbows travel too far behind your body.",
    home: "Dumbbell Floor Press — 3 sets × 10–12 reps",
    gym: "Chest Press Machine — 3 sets × 10–12 reps",
  },
  {
    number: "05",
    name: "Dumbbell Lateral Raise",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Keep a soft bend in your elbows and raise the dumbbells with control to about shoulder height.",
    modification:
      "Use lighter dumbbells or alternate one arm at a time.",
    home: "Dumbbell Lateral Raise — 3 sets × 12–15 reps",
    gym: "Dumbbell Lateral Raise — 3 sets × 12–15 reps",
  },
  {
    number: "06",
    name: "Cable Triceps Pressdown",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows close to your sides and straighten your arms without letting your shoulders roll forward.",
    modification:
      "Use a lighter weight and reduce the range if your elbows feel uncomfortable.",
    home: "Overhead Dumbbell Triceps Extension — 3 sets × 10–12 reps",
    gym: "Cable Triceps Pressdown — 3 sets × 10–12 reps",
  },
  {
    number: "07",
    name: "Dumbbell Biceps Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows near your sides and curl without swinging your torso or letting your shoulders take over.",
    modification: "Use lighter dumbbells or alternate arms.",
    home: "Dumbbell Biceps Curl — 3 sets × 10–12 reps",
    gym: "Dumbbell Biceps Curl — 3 sets × 10–12 reps",
  },
];

const warmup = [
  "Easy cardio — 2 min",
  "Arm circles — 10 each direction",
  "Band pull-aparts — 12 reps",
  "Light cable or machine rows — 10 reps",
];

const cooldown = [
  "Chest stretch — 30 sec / side",
  "Cross-body shoulder stretch — 30 sec / side",
  "Overhead triceps stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function UpperBodyBuildPage() {
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
                  UPPER BODY • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Upper Body{" "}
                  <span className="italic text-[#A77B73]">
                    Build.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build strength through your back, shoulders, chest,
                  and arms with controlled, steady working sets.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                strong looks good on you. ♡
              </p>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  45 min
                </p>
              </div>

              <div className="border-b border-[#E1D3CE] py-4 pl-4 sm:border-b-0 sm:border-r">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EXERCISES
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  07
                </p>
              </div>

              <div className="border-r border-[#E1D3CE] py-4 pr-3 sm:pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  FOCUS
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Back + shoulders + arms
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
                  Warm up your shoulders, upper back, and arms before
                  moving into your working sets.
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
                    seven movements.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-5 text-[#806E68]">
                Work through each movement in order. Choose the setup
                that fits where you&apos;re training today.
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
                          {openSwapFor === exercise.number ? "−" : "+"}
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
                  Give your upper body a few quiet minutes before
                  moving on with your day.
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
              UPPER BODY BUILD
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