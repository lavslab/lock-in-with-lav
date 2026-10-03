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
  "Lat Pulldown": [
    {
      name: "Assisted Pull-Up",
      location: "GYM",
      note: "Supported vertical pull that targets the lats and upper back.",
    },
    {
      name: "Single-Arm Cable Pulldown",
      location: "GYM",
      note: "Single-arm variation for controlled lat engagement.",
    },
    {
      name: "Resistance Band Pulldown",
      location: "HOME",
      note: "Home-friendly vertical pulling alternative.",
    },
  ],

  "Seated Cable Row": [
    {
      name: "Chest-Supported Row",
      location: "GYM",
      note: "Supported horizontal pull that reduces momentum.",
    },
    {
      name: "Single-Arm Dumbbell Row",
      location: "BOTH",
      note: "Dumbbell option for targeting each side independently.",
    },
    {
      name: "Resistance Band Row",
      location: "HOME",
      note: "Band-based horizontal pulling movement.",
    },
  ],

  "Chest-Supported Row": [
    {
      name: "Machine Row",
      location: "GYM",
      note: "Stable machine option for the upper and mid back.",
    },
    {
      name: "Seated Cable Row",
      location: "GYM",
      note: "Cable-based horizontal pull with adjustable resistance.",
    },
    {
      name: "One-Arm Dumbbell Row",
      location: "BOTH",
      note: "Unilateral dumbbell back movement.",
    },
  ],

  "Cable Face Pull": [
    {
      name: "Reverse Pec Deck",
      location: "GYM",
      note: "Machine-based rear-delt and upper-back movement.",
    },
    {
      name: "Band Face Pull",
      location: "HOME",
      note: "Resistance-band alternative for rear delts and upper back.",
    },
    {
      name: "Dumbbell Reverse Fly",
      location: "BOTH",
      note: "Free-weight option for the rear shoulders and upper back.",
    },
  ],

  "Preacher Curl": [
    {
      name: "Cable Curl",
      location: "GYM",
      note: "Constant-tension biceps movement using a cable.",
    },
    {
      name: "Alternating Dumbbell Curl",
      location: "BOTH",
      note: "Simple unilateral biceps variation.",
    },
    {
      name: "Band Biceps Curl",
      location: "HOME",
      note: "Resistance-band biceps option.",
    },
  ],

  "Rope Hammer Curl": [
    {
      name: "Dumbbell Hammer Curl",
      location: "BOTH",
      note: "Neutral-grip dumbbell curl targeting the biceps and brachialis.",
    },
    {
      name: "Cross-Body Hammer Curl",
      location: "BOTH",
      note: "Hammer curl variation performed toward the opposite shoulder.",
    },
    {
      name: "Band Hammer Curl",
      location: "HOME",
      note: "Resistance-band neutral-grip curl.",
    },
  ],
};

/*
 * Allow replacement exercises to be swapped again.
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
  "Lat Pulldown": {
    cue: "Sit tall with your thighs secured under the pads. Pull the bar toward your upper chest by driving your elbows down, then return the bar slowly.",
    modification:
      "Use lighter resistance and reduce the range of motion.",
  },

  "Assisted Pull-Up": {
    cue: "Place your knees or feet on the assistance pad and grip the handles. Pull your body upward by driving your elbows down, then lower with control.",
    modification:
      "Increase the assistance or reduce the range of motion.",
  },

  "Single-Arm Cable Pulldown": {
    cue: "Sit or kneel tall facing the cable. Pull the handle down toward your ribs while keeping your torso stable, then slowly extend your arm.",
    modification:
      "Use lighter resistance or shorten the range.",
  },

  "Resistance Band Pulldown": {
    cue: "Anchor the band securely overhead. Pull your elbows down toward your sides while keeping your ribs controlled, then return slowly.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Seated Cable Row": {
    cue: "Sit tall with your chest lifted. Pull the handle toward your lower ribs while keeping your shoulders down, then extend your arms slowly.",
    modification:
      "Use lighter resistance and keep the range comfortable.",
  },

  "Chest-Supported Row": {
    cue: "Set your chest against the support and pull the handles toward your body by driving your elbows back. Squeeze your upper back before lowering.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Single-Arm Dumbbell Row": {
    cue: "Support one hand on a stable surface and hinge slightly at your hips. Pull the dumbbell toward your hip while keeping your back neutral.",
    modification:
      "Use a lighter dumbbell or increase your support.",
  },

  "Resistance Band Row": {
    cue: "Anchor the band securely in front of you. Pull your elbows toward your ribs while keeping your chest lifted, then extend your arms slowly.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Machine Row": {
    cue: "Sit tall with your chest supported or your back against the pad. Pull the handles toward your body while keeping your shoulders controlled.",
    modification:
      "Use lighter resistance and slow the return.",
  },

  "One-Arm Dumbbell Row": {
    cue: "Brace one hand on a stable surface and pull the dumbbell toward your hip. Keep your torso stable and lower the weight with control.",
    modification:
      "Use a lighter dumbbell or increase your support.",
  },

  "Cable Face Pull": {
    cue: "Set the rope around upper-chest to face height. Pull the rope toward your face while driving your elbows outward, then return slowly.",
    modification:
      "Use lighter resistance and keep the range smaller.",
  },

  "Reverse Pec Deck": {
    cue: "Sit facing the machine pad and hold the handles. Open your arms outward while keeping your chest supported, then return slowly.",
    modification:
      "Use lighter resistance and focus on controlled reps.",
  },

  "Band Face Pull": {
    cue: "Anchor the band around face height. Pull the band toward your face with your elbows high while squeezing your rear shoulders and upper back.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Dumbbell Reverse Fly": {
    cue: "Hinge slightly at your hips with a neutral spine. Open the dumbbells outward while keeping a soft bend in your elbows, then lower slowly.",
    modification:
      "Use very light dumbbells or reduce the range.",
  },

  "Preacher Curl": {
    cue: "Position your upper arms against the preacher pad. Curl the weight toward your shoulder without lifting your elbows from the pad, then lower slowly.",
    modification:
      "Use lighter resistance and avoid fully locking the elbow at the bottom.",
  },

  "Cable Curl": {
    cue: "Stand tall with your elbows close to your sides. Curl the cable handle toward your shoulders while keeping your torso still.",
    modification:
      "Use lighter resistance or shorten the range.",
  },

  "Alternating Dumbbell Curl": {
    cue: "Hold a dumbbell in each hand with your palms facing forward. Curl one arm toward your shoulder while keeping your elbow close to your side, then switch.",
    modification:
      "Use lighter dumbbells or slow the movement.",
  },

  "Band Biceps Curl": {
    cue: "Stand on the band with your palms facing forward. Curl your hands toward your shoulders while keeping your elbows close to your sides.",
    modification:
      "Use a lighter band or reduce the range.",
  },

  "Rope Hammer Curl": {
    cue: "Hold the rope with your palms facing each other. Keep your elbows close to your body and curl the rope toward your shoulders without swinging.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Dumbbell Hammer Curl": {
    cue: "Hold the dumbbells with your palms facing inward. Curl toward your shoulders while keeping your elbows close to your sides.",
    modification:
      "Use lighter dumbbells or alternate arms.",
  },

  "Cross-Body Hammer Curl": {
    cue: "Hold a dumbbell with your palm facing inward and curl it toward the opposite shoulder while keeping your elbow close to your side.",
    modification:
      "Use a lighter dumbbell or reduce the range.",
  },

  "Band Hammer Curl": {
    cue: "Stand on the band with your palms facing inward. Curl your hands toward your shoulders while keeping your elbows tucked.",
    modification:
      "Use a lighter band or shorten the range.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Lat Pulldown",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Drive your elbows down toward your sides and pull the bar toward your upper chest without leaning excessively.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "Resistance Band Pulldown — 3 sets × 10–12 reps",
    gym: "Lat Pulldown — 3 sets × 10–12 reps",
  },

  {
    number: "02",
    name: "Seated Cable Row",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep your chest lifted and pull the handle toward your lower ribs while squeezing your upper back.",
    modification:
      "Use lighter resistance and shorten the range.",
    home: "Resistance Band Row — 3 sets × 10–12 reps",
    gym: "Seated Cable Row — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Chest-Supported Row",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep your chest supported and drive your elbows back while squeezing through your upper and mid back.",
    modification:
      "Use lighter resistance or reduce the range.",
    home: "One-Arm Dumbbell Row — 3 sets × 10–12 / side",
    gym: "Chest-Supported Row — 3 sets × 10–12 reps",
  },

  {
    number: "04",
    name: "Cable Face Pull",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Pull the rope toward your face with your elbows high and squeeze through your rear shoulders and upper back.",
    modification:
      "Use lighter resistance and keep the movement controlled.",
    home: "Band Face Pull — 3 sets × 12–15 reps",
    gym: "Cable Face Pull — 3 sets × 12–15 reps",
  },

  {
    number: "05",
    name: "Preacher Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your upper arms supported against the pad and curl without swinging or lifting your elbows.",
    modification:
      "Use lighter resistance and avoid locking out aggressively.",
    home: "Alternating Dumbbell Curl — 3 sets × 10–12 / side",
    gym: "Preacher Curl — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Rope Hammer Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your palms facing each other and your elbows tucked while curling the rope toward your shoulders.",
    modification:
      "Use lighter resistance or alternate arms.",
    home: "Dumbbell Hammer Curl — 3 sets × 10–12 reps",
    gym: "Rope Hammer Curl — 3 sets × 10–12 reps",
  },
];

const warmup = [
  "Easy rower or treadmill walk — 3 min",
  "Arm circles — 20 sec each direction",
  "Band pull-aparts — 12 reps",
  "Light cable rows — 10 reps",
];

const cooldown = [
  "Standing lat stretch — 30 sec / side",
  "Cross-body shoulder stretch — 30 sec / side",
  "Biceps wall stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function GymBackBicepsPage() {
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
                  Gym Back{" "}
                  <span className="italic text-[#A77B73]">
                    & Biceps.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A dedicated pull-focused session built around
                  gym machines, cables, and controlled resistance
                  for your back and arms.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                pull. squeeze. grow. ♡
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
                  Back + biceps
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
                    to pull.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Warm up your shoulders and upper back before
                  getting into your working sets.
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
                Control every pull, keep your shoulders out of your
                ears, and focus on the target muscle.
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
                  Release your back, shoulders, and arms and bring
                  your breathing down before you leave.
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
              GYM BACK & BICEPS
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