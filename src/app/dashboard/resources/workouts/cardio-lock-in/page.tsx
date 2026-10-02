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
  "Steady Cardio": [
    {
      name: "Walking Pad",
      location: "HOME",
      note: "Low-impact steady cardio that lets you control your pace.",
    },
    {
      name: "Outdoor Walk",
      location: "BOTH",
      note: "Simple steady-state cardio that can be adjusted to your pace.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Low-impact cardio option with continuous movement.",
    },
  ],

  "Squat to Reach": [
    {
      name: "Bodyweight Squat",
      location: "BOTH",
      note: "Keeps the lower-body movement without the overhead reach.",
    },
    {
      name: "Step-Up",
      location: "BOTH",
      note: "A simple lower-body movement that can be performed at a steady pace.",
    },
    {
      name: "March to Reach",
      location: "HOME",
      note: "Keeps the full-body rhythm with less squat depth.",
    },
  ],

  "Low-Impact Cardio Push": [
    {
      name: "Fast March",
      location: "HOME",
      note: "Simple low-impact cardio that can be performed at different speeds.",
    },
    {
      name: "Step Jacks",
      location: "HOME",
      note: "Low-impact jumping-jack alternative that keeps you moving.",
    },
    {
      name: "Bike Push",
      location: "GYM",
      note: "Allows you to increase effort without impact from running or jumping.",
    },
  ],

  "Alternating Reverse Lunge": [
    {
      name: "Step-Up",
      location: "BOTH",
      note: "Single-leg movement that can be performed at a controlled pace.",
    },
    {
      name: "Bodyweight Squat",
      location: "BOTH",
      note: "Bilateral lower-body option when lunges are uncomfortable.",
    },
    {
      name: "Low Step Touch",
      location: "HOME",
      note: "Lower-impact movement that keeps you continuously moving.",
    },
  ],

  "Cardio Interval": [
    {
      name: "Walking Pad Intervals",
      location: "HOME",
      note: "Alternate between an easy walk and a faster controlled pace.",
    },
    {
      name: "Outdoor Walk Intervals",
      location: "BOTH",
      note: "Use changes in pace to create your work and recovery intervals.",
    },
    {
      name: "Bike Intervals",
      location: "GYM",
      note: "Alternate resistance or speed for your work and recovery periods.",
    },
  ],

  "Standing Knee Drive": [
    {
      name: "March in Place",
      location: "HOME",
      note: "A lower-intensity version of alternating knee drives.",
    },
    {
      name: "Step Touch",
      location: "HOME",
      note: "Easy standing cardio option with controlled side-to-side movement.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Continuous low-impact cardio option for the same interval.",
    },
  ],

  "Final Cardio Finish": [
    {
      name: "Brisk Walk",
      location: "BOTH",
      note: "Simple way to finish with a controlled increase in pace.",
    },
    {
      name: "Walking Pad",
      location: "HOME",
      note: "Lets you control your final pace while gradually slowing down.",
    },
    {
      name: "Bike",
      location: "GYM",
      note: "Controlled cardio option that makes it easy to gradually reduce intensity.",
    },
  ],
};

/*
 * Expand the swap system so replacement exercises
 * can also be swapped again.
 *
 * This means users can keep swapping the same exercise
 * as many times as they want.
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
    name: "Steady Cardio",
    prescription: "1 ROUND × 5 MIN",
    rest: "30 SEC RESET",
    cue: "Move at a pace that raises your heart rate while still letting you stay in control of your breathing.",
    modification: "Slow the pace or shorten the interval to 3 minutes.",
    home: "Brisk march, walking pad, stairs, or outdoor walk — 5 min",
    gym: "Treadmill, bike, elliptical, or stair climber — 5 min",
  },

  {
    number: "02",
    name: "Squat to Reach",
    prescription: "3 SETS × 40 SEC",
    rest: "20 SEC REST",
    cue: "Sit into a comfortable squat, stand tall, and reach overhead without rushing the movement.",
    modification: "Use a shallower squat or squat to a chair.",
    home: "Bodyweight Squat to Reach — 40 sec",
    gym: "Bodyweight Squat to Reach — 40 sec",
  },

  {
    number: "03",
    name: "Low-Impact Cardio Push",
    prescription: "3 SETS × 45 SEC",
    rest: "30 SEC REST",
    cue: "Keep a steady rhythm and stay light on your feet while maintaining good posture.",
    modification:
      "Reduce the pace and keep one foot on the floor at all times.",
    home: "Fast March or Step Jacks — 45 sec",
    gym: "Incline Treadmill Walk or Bike Push — 45 sec",
  },

  {
    number: "04",
    name: "Alternating Reverse Lunge",
    prescription: "3 SETS × 8 / SIDE",
    rest: "30 SEC REST",
    cue: "Step back with control, keep your front foot planted, and drive through it to return to standing.",
    modification:
      "Hold a stable surface or use a smaller range of motion.",
    home: "Bodyweight Reverse Lunge — 3 sets × 8 / side",
    gym: "Bodyweight or Light Dumbbell Reverse Lunge — 3 sets × 8 / side",
  },

  {
    number: "05",
    name: "Cardio Interval",
    prescription: "4 ROUNDS × 30 SEC",
    rest: "30 SEC EASY",
    cue: "Increase your effort for the work interval, then deliberately bring the pace down during recovery.",
    modification:
      "Keep both intervals at a moderate pace instead of pushing intensity.",
    home: "Walking Pad, Stairs, Fast March, or Outdoor Pace Pick-Up",
    gym: "Treadmill, Bike, Rower, Elliptical, or Stair Climber",
  },

  {
    number: "06",
    name: "Standing Knee Drive",
    prescription: "3 SETS × 30 SEC",
    rest: "30 SEC REST",
    cue: "Brace your core and drive one knee up at a time while staying tall through your torso.",
    modification:
      "Slow the tempo and hold a wall or rail for balance.",
    home: "Alternating Standing Knee Drives — 30 sec",
    gym: "Alternating Standing Knee Drives — 30 sec",
  },

  {
    number: "07",
    name: "Final Cardio Finish",
    prescription: "1 ROUND × 3 MIN",
    rest: "COOLDOWN NEXT",
    cue: "Finish at a challenging but controlled pace, then gradually slow down during the final 30 seconds.",
    modification:
      "Keep the entire interval at a comfortable steady pace.",
    home: "Brisk Walk, Walking Pad, Stairs, or Fast March — 3 min",
    gym: "Treadmill, Bike, Elliptical, Rower, or Stair Climber — 3 min",
  },
];

const warmup = [
  "Easy march or walk — 60 sec",
  "Arm swings — 30 sec",
  "Bodyweight squats — 10 reps",
  "Alternating step-backs — 6 / side",
];

const cooldown = [
  "Easy walk — 2 min",
  "Standing quad stretch — 30 sec / side",
  "Calf stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function CardioLockInPage() {
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
                  CARDIO • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Cardio{" "}
                  <span className="italic text-[#A77B73]">
                    Lock In.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build your conditioning through controlled cardio
                  intervals, steady movement, and intentional recovery.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                heart up. head clear. ♡
              </p>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  30 min
                </p>
              </div>

              <div className="border-b border-[#E1D3CE] py-4 pl-4 sm:border-b-0 sm:border-r">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  INTERVALS
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
                  Cardio + conditioning
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
                  Start easy, raise your heart rate gradually, and
                  prepare your body for the intervals ahead.
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
                    seven intervals.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-5 text-[#806E68]">
                Work through each interval in order. Choose the
                version that fits where you&apos;re moving today.
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
                  Bring your heart rate down gradually and give your
                  body a few quiet minutes to recover.
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
              CARDIO LOCK IN
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