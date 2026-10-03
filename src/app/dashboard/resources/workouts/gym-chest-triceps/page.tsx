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

type ExerciseDetails = {
  cue: string;
  modification: string;
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

/* ---------------------------------
   EXERCISE SWAPS
--------------------------------- */

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Chest Press Machine": [
    {
      name: "Barbell Bench Press",
      location: "GYM",
      note: "Free-weight pressing option for the chest.",
    },
    {
      name: "Dumbbell Bench Press",
      location: "BOTH",
      note: "Dumbbell pressing option with independent arm movement.",
    },
    {
      name: "Resistance Band Chest Press",
      location: "HOME",
      note: "Home-friendly chest press using a resistance band.",
    },
  ],

  "Incline Dumbbell Press": [
    {
      name: "Incline Chest Press Machine",
      location: "GYM",
      note: "Supported machine variation targeting the upper chest.",
    },
    {
      name: "Incline Smith Machine Press",
      location: "GYM",
      note: "Guided-bar option for controlled incline pressing.",
    },
    {
      name: "Dumbbell Floor Press",
      location: "HOME",
      note: "Home-friendly pressing alternative.",
    },
  ],

  "Cable Chest Fly": [
    {
      name: "Pec Deck",
      location: "GYM",
      note: "Machine-based chest isolation movement.",
    },
    {
      name: "Dumbbell Chest Fly",
      location: "BOTH",
      note: "Free-weight chest fly variation.",
    },
    {
      name: "Resistance Band Chest Fly",
      location: "HOME",
      note: "Band-based chest isolation option.",
    },
  ],

  "Machine Shoulder Press": [
    {
      name: "Dumbbell Shoulder Press",
      location: "BOTH",
      note: "Free-weight overhead press for the shoulders.",
    },
    {
      name: "Smith Machine Shoulder Press",
      location: "GYM",
      note: "Guided-bar shoulder pressing variation.",
    },
    {
      name: "Band Shoulder Press",
      location: "HOME",
      note: "Home resistance-band shoulder press.",
    },
  ],

  "Cable Triceps Pressdown": [
    {
      name: "Rope Triceps Pressdown",
      location: "GYM",
      note: "Rope variation that allows a natural hand position.",
    },
    {
      name: "Single-Arm Cable Pressdown",
      location: "GYM",
      note: "Unilateral cable option for controlled triceps work.",
    },
    {
      name: "Band Triceps Pressdown",
      location: "HOME",
      note: "Resistance-band alternative for the triceps.",
    },
  ],

  "Overhead Cable Triceps Extension": [
    {
      name: "Dumbbell Overhead Triceps Extension",
      location: "BOTH",
      note: "Free-weight overhead triceps movement.",
    },
    {
      name: "Rope Overhead Triceps Extension",
      location: "GYM",
      note: "Cable-rope variation with a comfortable hand position.",
    },
    {
      name: "Band Overhead Triceps Extension",
      location: "HOME",
      note: "Home resistance-band alternative.",
    },
  ],
};

/*
 * Replacement exercises can also be swapped.
 * This lets the user swap away from a replacement
 * and return to the original exercise with its
 * actual instructions.
 */

const expandedExerciseSwaps: Record<string, SwapOption[]> = {
  ...exerciseSwaps,
};

Object.entries(exerciseSwaps).forEach(
  ([originalExercise, options]) => {
    options.forEach((option) => {
      if (!expandedExerciseSwaps[option.name]) {
        expandedExerciseSwaps[option.name] = [
          {
            name: originalExercise,
            location: "BOTH",
            note: `Swap back to ${originalExercise}.`,
          },
          ...options.filter(
            (item) => item.name !== option.name,
          ),
        ];
      }
    });
  },
);

/* ---------------------------------
   EXERCISE INSTRUCTIONS
--------------------------------- */

const exerciseDetails: Record<
  string,
  ExerciseDetails
> = {
  "Chest Press Machine": {
    cue: "Set the seat so the handles line up around mid-chest. Keep your shoulders supported and press the handles forward without locking your elbows.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },

  "Barbell Bench Press": {
    cue: "Set your upper back firmly against the bench and grip the bar slightly wider than shoulder-width. Lower it toward your mid-chest with control, then press it upward.",
    modification:
      "Use a lighter load or ask for a spotter when appropriate.",
  },

  "Dumbbell Bench Press": {
    cue: "Lie on a stable bench with the dumbbells above your chest. Lower them toward the sides of your chest with control, then press them back up.",
    modification:
      "Use lighter dumbbells or reduce the range.",
  },

  "Resistance Band Chest Press": {
    cue: "Anchor the band securely behind you at chest height. Step forward, brace your core, and press your hands forward until your arms are almost straight.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Incline Dumbbell Press": {
    cue: "Set the bench at a comfortable incline. Hold the dumbbells above your upper chest, lower them with control, then press upward without letting your shoulders shrug.",
    modification:
      "Use lighter dumbbells or a lower incline.",
  },

  "Incline Chest Press Machine": {
    cue: "Adjust the seat so the handles align with your upper chest. Press forward while keeping your back against the pad, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Incline Smith Machine Press": {
    cue: "Set the bench at a moderate incline beneath the Smith bar. Lower the bar toward your upper chest with control, then press it upward.",
    modification:
      "Use a lighter load or reduce the range.",
  },

  "Dumbbell Floor Press": {
    cue: "Lie on your back with your knees bent and a dumbbell in each hand. Lower your upper arms toward the floor, then press the dumbbells back over your chest.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
  },

  "Cable Chest Fly": {
    cue: "Stand between the cables with a soft bend in your elbows. Bring your hands together in front of your chest while keeping your torso stable.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Pec Deck": {
    cue: "Sit with your back supported and your elbows or hands against the machine pads. Bring your arms together while squeezing your chest, then return slowly.",
    modification:
      "Use lighter resistance and avoid forcing the stretch.",
  },

  "Dumbbell Chest Fly": {
    cue: "Lie on a stable bench with dumbbells above your chest. Open your arms slowly with a soft bend in your elbows, then bring the weights back together.",
    modification:
      "Use very light dumbbells and shorten the range.",
  },

  "Resistance Band Chest Fly": {
    cue: "Anchor the band behind you at chest height. With a soft bend in your elbows, bring your hands together in front of your chest.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Machine Shoulder Press": {
    cue: "Adjust the seat so the handles begin around shoulder height. Press overhead while keeping your back supported, then lower with control.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Dumbbell Shoulder Press": {
    cue: "Hold the dumbbells at shoulder height and brace your core. Press overhead without arching your lower back, then lower slowly.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
  },

  "Smith Machine Shoulder Press": {
    cue: "Set the bench beneath the Smith bar at a comfortable angle. Press the bar overhead while keeping your back supported and core braced.",
    modification:
      "Use a lighter load or reduce the range.",
  },

  "Band Shoulder Press": {
    cue: "Stand on the middle of the band and bring your hands to shoulder height. Press upward while keeping your core braced.",
    modification:
      "Use a lighter band or press one arm at a time.",
  },

  "Cable Triceps Pressdown": {
    cue: "Stand tall facing the cable with your elbows tucked close to your sides. Press the handle down until your arms are straight, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Rope Triceps Pressdown": {
    cue: "Hold the rope with your elbows close to your sides. Press the rope downward and slightly apart at the bottom while keeping your upper arms still.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Single-Arm Cable Pressdown": {
    cue: "Hold the cable handle with one hand and keep your elbow close to your side. Press the handle down until your arm is straight, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Band Triceps Pressdown": {
    cue: "Anchor the band securely overhead. Keep your elbows tucked and press your hands downward until your arms are straight.",
    modification:
      "Use a lighter band or shorten the range.",
  },

  "Overhead Cable Triceps Extension": {
    cue: "Hold the cable behind your head with your elbows pointing forward. Extend your arms overhead while keeping your upper arms controlled.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Dumbbell Overhead Triceps Extension": {
    cue: "Hold one dumbbell overhead with both hands. Bend your elbows to lower it behind your head, then extend your arms overhead.",
    modification:
      "Use a lighter dumbbell or perform the movement seated.",
  },

  "Rope Overhead Triceps Extension": {
    cue: "Face away from the cable and hold the rope behind your head. Keep your elbows pointed forward and extend your arms overhead.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Band Overhead Triceps Extension": {
    cue: "Anchor the band securely behind you. Hold the band overhead with bent elbows, then extend your arms while keeping your elbows pointed forward.",
    modification:
      "Use a lighter band or reduce the range.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Chest Press Machine",
    prescription: "3 SETS × 8–10 REPS",
    rest: "75 SEC REST",
    cue: "Keep your shoulders supported and press the handles forward while keeping your elbows slightly below shoulder height.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Dumbbell Bench Press — 3 sets × 8–10 reps",
    gym: "Chest Press Machine — 3 sets × 8–10 reps",
  },

  {
    number: "02",
    name: "Incline Dumbbell Press",
    prescription: "3 SETS × 8–10 REPS",
    rest: "60 SEC REST",
    cue: "Lower the dumbbells toward your upper chest with control, then press them upward while keeping your shoulders stable.",
    modification:
      "Use lighter dumbbells or lower the bench incline.",
    home: "Dumbbell Floor Press — 3 sets × 8–10 reps",
    gym: "Incline Dumbbell Press — 3 sets × 8–10 reps",
  },

  {
    number: "03",
    name: "Cable Chest Fly",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep a soft bend in your elbows and bring your hands together while squeezing your chest without swinging.",
    modification:
      "Use lighter resistance and shorten the range.",
    home: "Resistance Band Chest Fly — 3 sets × 10–12 reps",
    gym: "Cable Chest Fly — 3 sets × 10–12 reps",
  },

  {
    number: "04",
    name: "Machine Shoulder Press",
    prescription: "3 SETS × 8–10 REPS",
    rest: "60 SEC REST",
    cue: "Press the handles overhead while keeping your back supported and your core braced.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Dumbbell Shoulder Press — 3 sets × 8–10 reps",
    gym: "Machine Shoulder Press — 3 sets × 8–10 reps",
  },

  {
    number: "05",
    name: "Cable Triceps Pressdown",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows pinned close to your sides and press the handle down without swinging your shoulders.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Band Triceps Pressdown — 3 sets × 10–12 reps",
    gym: "Cable Triceps Pressdown — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Overhead Cable Triceps Extension",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows pointed forward as you extend your arms overhead, then return the cable slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Dumbbell Overhead Triceps Extension — 3 sets × 10–12 reps",
    gym: "Overhead Cable Triceps Extension — 3 sets × 10–12 reps",
  },
];

const warmup = [
  "Easy treadmill walk — 3 min",
  "Arm circles — 20 sec each direction",
  "Band pull-aparts — 12 reps",
  "Light chest press — 10 reps",
];

const cooldown = [
  "Chest doorway stretch — 30 sec / side",
  "Overhead triceps stretch — 30 sec / side",
  "Cross-body shoulder stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function GymChestTricepsPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [workoutExercises, setWorkoutExercises] =
    useState<WorkoutExercise[]>(exercises);

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
                  UPPER BODY • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Gym Chest{" "}
                  <span className="italic text-[#A77B73]">
                    & Triceps.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A gym-focused push session built around
                  machines, cables, and free weights for your
                  chest, shoulders, and triceps.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                press. squeeze. lock in. ♡
              </p>
            </div>

            {/* STATS */}

            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  40 min
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
                  Chest + triceps
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Machines + cables
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
                    to press.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Warm up your shoulders, chest, and triceps before
                  loading your working sets.
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
                Keep every press controlled and focus on the
                muscle doing the work rather than chasing momentum.
              </p>
            </div>

            {/* WORKOUT CARD */}

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
                          {openSwapFor === exercise.number
                            ? "−"
                            : "+"}
                        </span>
                      </button>

                      {openSwapFor === exercise.number && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-[#DED0CB] bg-[#EAD8D3]/40">
                          <div className="divide-y divide-[#D8C3BD]">
                            {expandedExerciseSwaps[
                              exercise.name
                            ].map((swap) => (
                              <button
                                key={`${exercise.number}-${swap.name}`}
                                type="button"
                                onClick={() => {
                                  const details =
                                    exerciseDetails[
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
                                                  details?.cue ??
                                                  swap.note,
                                                modification:
                                                  details?.modification ??
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
                  Give your chest, shoulders, and arms a few
                  minutes to release tension before you finish.
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
              GYM CHEST & TRICEPS
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