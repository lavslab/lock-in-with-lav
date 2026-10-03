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

type CardioBlock = {
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
   MACHINE SWAPS
--------------------------------- */

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Treadmill Incline Walk": [
    {
      name: "Stair Climber",
      location: "GYM",
      note: "Higher-intensity climbing option for your cardio block.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Lower-impact machine option with continuous movement.",
    },
    {
      name: "Outdoor Brisk Walk",
      location: "HOME",
      note: "Simple outdoor alternative when you don't have gym equipment.",
    },
  ],

  "Stair Climber": [
    {
      name: "Treadmill Incline Walk",
      location: "GYM",
      note: "Incline walking option with adjustable speed and incline.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Lower-impact machine alternative.",
    },
    {
      name: "Outdoor Hill Walk",
      location: "HOME",
      note: "Outdoor option using hills or an incline.",
    },
  ],

  "Elliptical": [
    {
      name: "Treadmill Incline Walk",
      location: "GYM",
      note: "Incline walking option with adjustable intensity.",
    },
    {
      name: "Stair Climber",
      location: "GYM",
      note: "Climbing-based cardio alternative.",
    },
    {
      name: "Brisk Outdoor Walk",
      location: "HOME",
      note: "Simple lower-impact cardio option outside.",
    },
  ],

  "Stationary Bike": [
    {
      name: "Elliptical",
      location: "GYM",
      note: "Low-impact machine option using the upper and lower body.",
    },
    {
      name: "Treadmill Power Walk",
      location: "GYM",
      note: "Walking-based cardio alternative.",
    },
    {
      name: "Outdoor Cycling",
      location: "HOME",
      note: "Outdoor bike alternative.",
    },
  ],

  "Treadmill Intervals": [
    {
      name: "Bike Intervals",
      location: "GYM",
      note: "Machine interval option with adjustable resistance.",
    },
    {
      name: "Elliptical Intervals",
      location: "GYM",
      note: "Low-impact interval alternative.",
    },
    {
      name: "Outdoor Walk/Jog Intervals",
      location: "HOME",
      note: "Outdoor interval option without gym equipment.",
    },
  ],

  "Bike Sprint Intervals": [
    {
      name: "Treadmill Intervals",
      location: "GYM",
      note: "Walking or jogging intervals using speed and incline.",
    },
    {
      name: "Stair Climber Intervals",
      location: "GYM",
      note: "Climbing intervals for a higher-intensity option.",
    },
    {
      name: "Outdoor Walk/Jog Intervals",
      location: "HOME",
      note: "Outdoor interval alternative.",
    },
  ],
};

/*
 * Replacement machines can also be swapped again.
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
            location: "GYM",
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
   CARDIO INSTRUCTIONS
--------------------------------- */

const exerciseDetails: Record<
  string,
  ExerciseDetails
> = {
  "Treadmill Incline Walk": {
    cue: "Walk tall with your core lightly braced. Keep your stride controlled and use the incline to increase the challenge rather than holding tightly onto the rails.",
    modification:
      "Lower the incline or slow the walking speed.",
  },

  "Stair Climber": {
    cue: "Stand tall and take controlled steps while keeping your hands light on the rails. Push through each step rather than pulling yourself upward.",
    modification:
      "Lower the step rate or take a short recovery period.",
  },

  Elliptical: {
    cue: "Keep your posture tall and use a smooth continuous stride. Push and pull through the handles while keeping your movement controlled.",
    modification:
      "Lower the resistance or slow your pace.",
  },

  "Stationary Bike": {
    cue: "Adjust the seat so your knee stays slightly bent at the bottom of each pedal stroke. Maintain a steady cadence and keep your upper body relaxed.",
    modification:
      "Lower the resistance or reduce your cadence.",
  },

  "Treadmill Intervals": {
    cue: "Alternate between your work and recovery speeds. Stay tall and controlled during the faster intervals rather than sprinting beyond your ability.",
    modification:
      "Reduce the speed difference between work and recovery.",
  },

  "Bike Sprint Intervals": {
    cue: "Push hard during the work intervals while maintaining control of your pedal stroke, then reduce resistance and cadence for recovery.",
    modification:
      "Use moderate resistance instead of an all-out effort.",
  },

  "Outdoor Brisk Walk": {
    cue: "Walk at a pace that noticeably increases your breathing while still allowing you to maintain control and good posture.",
    modification:
      "Slow your pace or shorten the walking interval.",
  },

  "Outdoor Hill Walk": {
    cue: "Walk up a comfortable incline while keeping your posture tall. Take shorter controlled steps as the hill gets steeper.",
    modification:
      "Choose a gentler incline or slow your pace.",
  },

  "Brisk Outdoor Walk": {
    cue: "Maintain a purposeful walking pace with your arms moving naturally and your posture tall.",
    modification:
      "Reduce your pace or shorten the duration.",
  },

  "Outdoor Cycling": {
    cue: "Maintain a smooth pedal stroke and keep your upper body relaxed. Choose a route that matches your current fitness level.",
    modification:
      "Use an easier gear or shorten the ride.",
  },

  "Outdoor Walk/Jog Intervals": {
    cue: "Alternate comfortable walking with controlled jogging. The jog should challenge your breathing without forcing an all-out sprint.",
    modification:
      "Replace jogging with a faster walk.",
  },

  "Bike Intervals": {
    cue: "Alternate harder and easier cycling periods. Increase resistance or cadence during the work interval while keeping your pedal stroke controlled.",
    modification:
      "Use a smaller resistance increase during the work interval.",
  },

  "Elliptical Intervals": {
    cue: "Alternate faster periods with easier recovery periods while keeping your stride smooth and your posture tall.",
    modification:
      "Lower the resistance or reduce the speed of the work interval.",
  },

  "Stair Climber Intervals": {
    cue: "Increase your step rate during the work interval, then slow down for recovery. Keep your hands light on the rails.",
    modification:
      "Use a slower step rate and longer recovery.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: CardioBlock[] = [
  {
    number: "01",
    name: "Treadmill Incline Walk",
    prescription: "8 MIN",
    rest: "EASY → MODERATE",
    cue: "Build from an easy walk into a purposeful incline walk. Keep your posture tall and avoid hanging onto the rails.",
    modification:
      "Lower the incline or walking speed.",
    home: "Outdoor Brisk Walk — 8 min",
    gym: "Treadmill Incline Walk — 8 min",
  },

  {
    number: "02",
    name: "Stair Climber",
    prescription: "6 MIN",
    rest: "MODERATE",
    cue: "Maintain steady controlled steps and focus on pushing through each step rather than relying on the handrails.",
    modification:
      "Lower the step rate or take a brief recovery period.",
    home: "Outdoor Hill Walk — 6 min",
    gym: "Stair Climber — 6 min",
  },

  {
    number: "03",
    name: "Elliptical",
    prescription: "6 MIN",
    rest: "MODERATE",
    cue: "Keep your stride smooth and continuous while gradually increasing your effort.",
    modification:
      "Lower the resistance or slow your pace.",
    home: "Brisk Outdoor Walk — 6 min",
    gym: "Elliptical — 6 min",
  },

  {
    number: "04",
    name: "Stationary Bike",
    prescription: "5 MIN",
    rest: "MODERATE",
    cue: "Maintain a smooth cadence with relaxed shoulders and gradually increase resistance if you feel ready.",
    modification:
      "Lower the resistance or cadence.",
    home: "Outdoor Cycling — 5 min",
    gym: "Stationary Bike — 5 min",
  },

  {
    number: "05",
    name: "Treadmill Intervals",
    prescription: "8 ROUNDS",
    rest: "30 SEC HARD / 30 SEC EASY",
    cue: "Alternate 30 seconds of faster work with 30 seconds of easy recovery. Stay controlled rather than going all-out.",
    modification:
      "Make the work interval a faster walk instead of a jog.",
    home: "Outdoor Walk/Jog Intervals — 8 rounds",
    gym: "Treadmill Intervals — 8 rounds",
  },

  {
    number: "06",
    name: "Bike Sprint Intervals",
    prescription: "6 ROUNDS",
    rest: "20 SEC HARD / 40 SEC EASY",
    cue: "Push your pace during each 20-second work period, then recover at an easy pace before repeating.",
    modification:
      "Use moderate resistance instead of sprint-level effort.",
    home: "Outdoor Walk/Jog Intervals — 6 rounds",
    gym: "Bike Sprint Intervals — 6 rounds",
  },
];

const warmup = [
  "Easy treadmill walk — 3 min",
  "Easy bike — 2 min",
  "Arm swings — 20 sec",
  "Gradually increase your pace — 1 min",
];

const cooldown = [
  "Easy treadmill or bike — 2 min",
  "Standing quad stretch — 30 sec / side",
  "Standing hamstring stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function GymMachineCardioPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [workoutExercises, setWorkoutExercises] =
    useState<CardioBlock[]>(exercises);

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
                  CARDIO • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Gym Machine{" "}
                  <span className="italic text-[#A77B73]">
                    Cardio.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A structured gym cardio session using machines,
                  intervals, and changing intensity to keep things
                  challenging without making every minute a sprint.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                move. sweat. reset. ♡
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
                  BLOCKS
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
                  Cardio + endurance
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Gym machines
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
                  Ease{" "}
                  <span className="italic text-[#9D6F67]">
                    into it.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Start easy and gradually bring your heart rate
                  up before the harder intervals.
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
                    cardio blocks.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-5 text-[#806E68]">
                Change machines and intensity throughout the
                session so your body keeps working without relying
                on one movement the entire time.
              </p>
            </div>

            {/* CARDIO CARD */}

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
                          ↔ SWAP MACHINE
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
                  Bring it{" "}
                  <span className="italic text-[#A77B73]">
                    down. ♡
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Gradually lower your pace and give your body a
                  chance to settle before you leave.
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
              GYM MACHINE CARDIO
            </p>

            <p className="mt-3 font-serif text-xl italic text-[#A77B73] sm:text-2xl">
              cardio complete. keep showing up. ♡
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