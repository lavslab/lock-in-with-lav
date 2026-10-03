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
  "Barbell Hip Thrust": [
    {
      name: "Smith Machine Hip Thrust",
      location: "GYM",
      note: "Stable gym variation that makes it easier to focus on driving through the glutes.",
    },
    {
      name: "Glute Drive Machine",
      location: "GYM",
      note: "Machine-based hip extension with direct glute emphasis.",
    },
    {
      name: "Dumbbell Hip Thrust",
      location: "HOME",
      note: "Home-friendly loaded hip thrust option.",
    },
  ],

  "Leg Press": [
    {
      name: "Hack Squat",
      location: "GYM",
      note: "Machine-based lower-body movement with strong quad and glute involvement.",
    },
    {
      name: "Smith Machine Squat",
      location: "GYM",
      note: "Supported squat variation that allows controlled loading.",
    },
    {
      name: "Dumbbell Squat",
      location: "HOME",
      note: "Simple home alternative when a leg press isn't available.",
    },
  ],

  "Romanian Deadlift": [
    {
      name: "Smith Machine Romanian Deadlift",
      location: "GYM",
      note: "Guided-bar variation that keeps the movement controlled.",
    },
    {
      name: "Dumbbell Romanian Deadlift",
      location: "BOTH",
      note: "Dumbbell variation that targets the hamstrings and glutes.",
    },
    {
      name: "Cable Pull-Through",
      location: "GYM",
      note: "Cable-based hip hinge with strong glute emphasis.",
    },
  ],

  "Bulgarian Split Squat": [
    {
      name: "Reverse Lunge",
      location: "BOTH",
      note: "Single-leg option with less balance demand.",
    },
    {
      name: "Smith Machine Split Squat",
      location: "GYM",
      note: "Supported split-squat variation for controlled loading.",
    },
    {
      name: "Dumbbell Step-Up",
      location: "BOTH",
      note: "Single-leg movement using a stable elevated surface.",
    },
  ],

  "Seated Leg Curl": [
    {
      name: "Lying Leg Curl",
      location: "GYM",
      note: "Machine-based hamstring curl performed lying down.",
    },
    {
      name: "Stability Ball Leg Curl",
      location: "HOME",
      note: "Home hamstring option using a stability ball.",
    },
    {
      name: "Slider Hamstring Curl",
      location: "HOME",
      note: "Bodyweight hamstring curl using sliders or towels.",
    },
  ],

  "Hip Abduction Machine": [
    {
      name: "Cable Hip Abduction",
      location: "GYM",
      note: "Cable-based option for targeting the side glutes.",
    },
    {
      name: "Banded Seated Abduction",
      location: "HOME",
      note: "Simple resistance-band option for the glute medius.",
    },
    {
      name: "Standing Band Abduction",
      location: "HOME",
      note: "Standing variation that trains the outer glutes.",
    },
  ],
};

/*
 * Replacement exercises can also be swapped.
 * This allows:
 *
 * Hip Thrust
 * → Smith Hip Thrust
 * → Hip Thrust
 *
 * while restoring the correct exercise instructions.
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
  "Barbell Hip Thrust": {
    cue: "Set your upper back against a bench with the bar resting across your hips. Drive through your feet and squeeze your glutes to lift your hips until your body forms a straight line from shoulders to knees.",
    modification:
      "Use a lighter load or reduce the range of motion.",
  },

  "Smith Machine Hip Thrust": {
    cue: "Position your upper back against a bench and the Smith bar across your hips. Drive through your feet and squeeze your glutes at the top before lowering with control.",
    modification:
      "Use a lighter load or shorten the range of motion.",
  },

  "Glute Drive Machine": {
    cue: "Set yourself into the machine with the pad across your hips. Drive through your feet and extend your hips while squeezing your glutes, then lower slowly.",
    modification:
      "Use lighter resistance and focus on a controlled squeeze.",
  },

  "Dumbbell Hip Thrust": {
    cue: "Rest your upper back against a stable bench or couch with a dumbbell across your hips. Drive through your feet and squeeze your glutes to lift your hips.",
    modification:
      "Use a lighter dumbbell or perform bodyweight hip thrusts.",
  },

  "Leg Press": {
    cue: "Place your feet comfortably on the platform. Lower the sled with control while keeping your knees tracking in line with your toes, then press through your feet without locking your knees.",
    modification:
      "Use a lighter load and reduce the depth.",
  },

  "Hack Squat": {
    cue: "Set your shoulders firmly under the pads and place your feet comfortably on the platform. Lower with control, then drive through your feet to stand.",
    modification:
      "Use a lighter load or reduce the depth.",
  },

  "Smith Machine Squat": {
    cue: "Position the bar comfortably across your upper back. Brace your core, sit your hips down and back, then drive through your feet to stand.",
    modification:
      "Use a lighter load or squat to a comfortable depth.",
  },

  "Dumbbell Squat": {
    cue: "Hold a dumbbell at your chest or at your sides. Sit your hips down and back while keeping your chest lifted, then drive through your feet to stand.",
    modification:
      "Use a lighter dumbbell or reduce the depth.",
  },

  "Romanian Deadlift": {
    cue: "Hold the weight close to your legs. Push your hips backward while keeping a soft bend in your knees and a neutral spine, then drive your hips forward to stand.",
    modification:
      "Use lighter weights or reduce the range of motion.",
  },

  "Smith Machine Romanian Deadlift": {
    cue: "Hold the Smith bar with your hands just outside your legs. Push your hips backward while keeping your back neutral, then drive your hips forward to stand.",
    modification:
      "Use a lighter load or reduce the range of motion.",
  },

  "Dumbbell Romanian Deadlift": {
    cue: "Hold dumbbells close to your thighs. Hinge your hips backward while keeping your spine neutral, then squeeze your glutes to return to standing.",
    modification:
      "Use lighter dumbbells or shorten the range.",
  },

  "Cable Pull-Through": {
    cue: "Face away from the low cable and hold the rope between your legs. Hinge your hips backward, then drive your hips forward and squeeze your glutes.",
    modification:
      "Use lighter resistance and reduce the range.",
  },

  "Bulgarian Split Squat": {
    cue: "Place your rear foot on a stable bench. Lower your back knee toward the floor while keeping your front foot planted, then drive through your front foot to stand.",
    modification:
      "Hold onto a stable surface or use bodyweight only.",
  },

  "Reverse Lunge": {
    cue: "Step one foot backward and lower your body with control. Keep your front foot planted and drive through it to return to standing.",
    modification:
      "Use bodyweight only or hold onto a stable surface.",
  },

  "Smith Machine Split Squat": {
    cue: "Set your stance with one foot forward and the other behind. Lower your back knee toward the floor while keeping your front foot planted, then drive upward through the front leg.",
    modification:
      "Use a lighter load or reduce the depth.",
  },

  "Dumbbell Step-Up": {
    cue: "Place one foot firmly on a stable platform. Drive through that foot to stand tall, then step down with control and switch sides.",
    modification:
      "Use a lower platform or bodyweight only.",
  },

  "Seated Leg Curl": {
    cue: "Set the machine so the pad sits comfortably above your ankles. Curl your heels down and back while keeping your hips against the pad, then return slowly.",
    modification:
      "Use lighter resistance and reduce the range.",
  },

  "Lying Leg Curl": {
    cue: "Lie face down on the machine with your ankles under the pads. Curl your heels toward your glutes without lifting your hips, then lower slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Stability Ball Leg Curl": {
    cue: "Lie on your back with your heels on the ball. Lift your hips, pull the ball toward your glutes, then extend your legs while keeping your hips elevated.",
    modification:
      "Keep your hips lower or perform fewer reps.",
  },

  "Slider Hamstring Curl": {
    cue: "Lie on your back with your heels on sliders. Lift your hips and slowly extend your legs away from you, then pull your heels back toward your body.",
    modification:
      "Keep your hips on the floor for an easier version.",
  },

  "Hip Abduction Machine": {
    cue: "Sit tall with your back supported and your knees against the pads. Press your legs outward while keeping your torso still, then return slowly.",
    modification:
      "Use lighter resistance and reduce the range.",
  },

  "Cable Hip Abduction": {
    cue: "Attach the ankle strap and stand tall while holding a stable support. Move your working leg outward without rotating your torso, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Banded Seated Abduction": {
    cue: "Place a resistance band above your knees and sit tall. Press your knees outward against the band while keeping your feet planted.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Standing Band Abduction": {
    cue: "Anchor or step into the band and stand tall. Move one leg outward while keeping your hips level, then return slowly.",
    modification:
      "Use a lighter band or hold onto a stable surface.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Barbell Hip Thrust",
    prescription: "4 SETS × 8–10 REPS",
    rest: "75 SEC REST",
    cue: "Drive through your feet and fully extend your hips while squeezing your glutes hard at the top.",
    modification:
      "Use a lighter load or reduce the range of motion.",
    home: "Dumbbell Hip Thrust — 4 sets × 8–10 reps",
    gym: "Barbell Hip Thrust — 4 sets × 8–10 reps",
  },

  {
    number: "02",
    name: "Leg Press",
    prescription: "3 SETS × 10–12 REPS",
    rest: "75 SEC REST",
    cue: "Lower the sled under control while keeping your knees tracking over your toes, then press through your feet.",
    modification:
      "Use a lighter load and reduce the depth.",
    home: "Dumbbell Squat — 3 sets × 10–12 reps",
    gym: "Leg Press — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Romanian Deadlift",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Push your hips backward and keep the weight close to your legs until you feel your hamstrings load, then drive your hips forward.",
    modification:
      "Use lighter weights or shorten the range.",
    home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
    gym: "Romanian Deadlift — 3 sets × 10–12 reps",
  },

  {
    number: "04",
    name: "Bulgarian Split Squat",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "60 SEC REST",
    cue: "Keep your front foot planted and lower with control before driving through the front leg to stand.",
    modification:
      "Hold onto a stable surface or use bodyweight only.",
    home: "Dumbbell Bulgarian Split Squat — 3 sets × 8–10 / side",
    gym: "Bulgarian Split Squat — 3 sets × 8–10 / side",
  },

  {
    number: "05",
    name: "Seated Leg Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Curl your heels down and back while keeping your hips firmly against the pad, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Slider Hamstring Curl — 3 sets × 10–12 reps",
    gym: "Seated Leg Curl — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Hip Abduction Machine",
    prescription: "3 SETS × 15–20 REPS",
    rest: "45 SEC REST",
    cue: "Press your legs outward while keeping your torso still, pause briefly, then return slowly.",
    modification:
      "Use lighter resistance and keep the movement controlled.",
    home: "Banded Seated Abduction — 3 sets × 15–20 reps",
    gym: "Hip Abduction Machine — 3 sets × 15–20 reps",
  },
];

const warmup = [
  "Easy treadmill walk — 3 min",
  "Bodyweight squats — 10 reps",
  "Glute bridges — 12 reps",
  "Bodyweight reverse lunges — 6 / side",
];

const cooldown = [
  "Figure-four glute stretch — 30 sec / side",
  "Standing hamstring stretch — 30 sec / side",
  "Hip flexor stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function GymGluteLegsPage() {
  const [firstName, setFirstName] = useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

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
                  LOWER BODY • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Gym Glute{" "}
                  <span className="italic text-[#A77B73]">
                    & Legs.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A gym-focused lower-body session built around
                  glutes, hamstrings, and quads with machines and
                  progressive resistance.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                load. squeeze. grow. ♡
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
                  Glutes + legs
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Machines + weights
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
                    to lift.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Get your hips, knees, and glutes moving before
                  your working sets.
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
                Prioritize controlled reps, full comfortable
                ranges, and progressive resistance over rushing.
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
                  Give your glutes, hamstrings, and hips a few
                  minutes to cool down and recover.
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
              GYM GLUTE & LEGS
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