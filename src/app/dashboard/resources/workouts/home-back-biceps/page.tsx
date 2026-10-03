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

/* ---------------------------------
   EXERCISE SWAPS
--------------------------------- */

const exerciseSwaps: Record<string, SwapOption[]> = {
  "One-Arm Dumbbell Row": [
    {
      name: "Resistance Band Row",
      location: "HOME",
      note: "Band-based row that keeps the focus on your lats and upper back.",
    },
    {
      name: "Chest-Supported Dumbbell Row",
      location: "HOME",
      note: "Supported option that helps reduce lower-back involvement.",
    },
    {
      name: "Seated Cable Row",
      location: "GYM",
      note: "Stable gym option for controlled back pulling.",
    },
  ],

  "Dumbbell Pullover": [
    {
      name: "Resistance Band Pulldown",
      location: "HOME",
      note: "Home-friendly vertical pulling pattern for your lats.",
    },
    {
      name: "Straight-Arm Cable Pulldown",
      location: "GYM",
      note: "Cable option that keeps the focus on the lats.",
    },
    {
      name: "Dumbbell Row",
      location: "HOME",
      note: "Another dumbbell-based back movement when pullovers aren't comfortable.",
    },
  ],

  "Dumbbell Reverse Fly": [
    {
      name: "Band Reverse Fly",
      location: "HOME",
      note: "Resistance-band option for the rear shoulders and upper back.",
    },
    {
      name: "Chest-Supported Reverse Fly",
      location: "HOME",
      note: "Supported variation that makes it easier to keep the movement strict.",
    },
    {
      name: "Reverse Pec Deck",
      location: "GYM",
      note: "Machine-based rear-delt and upper-back option.",
    },
  ],

  "Dumbbell Hammer Curl": [
    {
      name: "Band Hammer Curl",
      location: "HOME",
      note: "Band variation that keeps your palms facing inward.",
    },
    {
      name: "Alternating Dumbbell Curl",
      location: "HOME",
      note: "Traditional biceps curl with one arm working at a time.",
    },
    {
      name: "Cable Rope Hammer Curl",
      location: "GYM",
      note: "Cable variation with a neutral grip.",
    },
  ],

  "Dumbbell Biceps Curl": [
    {
      name: "Band Biceps Curl",
      location: "HOME",
      note: "Simple home option using a resistance band.",
    },
    {
      name: "Alternating Dumbbell Curl",
      location: "HOME",
      note: "Work one arm at a time for more controlled reps.",
    },
    {
      name: "Cable Curl",
      location: "GYM",
      note: "Constant-tension gym option for the biceps.",
    },
  ],

  "Dumbbell Shrug": [
    {
      name: "Band Shrug",
      location: "HOME",
      note: "Resistance-band option for the upper traps.",
    },
    {
      name: "Farmer Carry",
      location: "BOTH",
      note: "Loaded carry that challenges your traps and grip.",
    },
    {
      name: "Cable Shrug",
      location: "GYM",
      note: "Cable-based option for controlled upper-trap work.",
    },
  ],
};

/*
 * Make replacement exercises swappable too.
 * This also gives us a way to swap back to the
 * original exercise.
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
   SWAP EXERCISE INSTRUCTIONS
--------------------------------- */

const swapExerciseDetails: Record<
  string,
  SwapExerciseDetails
> = {
  "Resistance Band Row": {
    cue: "Anchor the band securely in front of you. Pull your elbows back toward your ribs while keeping your chest lifted, then slowly extend your arms.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Chest-Supported Dumbbell Row": {
    cue: "Lie chest-down on a stable incline surface with a dumbbell in each hand. Pull your elbows toward your hips, squeeze your upper back, then lower slowly.",
    modification:
      "Use lighter dumbbells or reduce the range of motion.",
  },

  "Seated Cable Row": {
    cue: "Sit tall with your chest lifted. Pull the handle toward your lower ribs while keeping your shoulders down, then return the weight with control.",
    modification:
      "Use a lighter weight and keep the range of motion comfortable.",
  },

  "Resistance Band Pulldown": {
    cue: "Anchor the band securely above you. Pull your elbows down toward your sides while keeping your ribs controlled, then slowly return your arms overhead.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Straight-Arm Cable Pulldown": {
    cue: "Stand tall facing the cable with slightly bent arms. Pull the bar down toward your thighs using your lats while keeping your elbows mostly fixed.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },

  "Dumbbell Row": {
    cue: "Brace one hand on a stable surface, hinge slightly at your hips, and pull the dumbbell toward your hip while keeping your back neutral.",
    modification:
      "Use a lighter dumbbell or support more of your bodyweight.",
  },

  "Band Reverse Fly": {
    cue: "Hold the band with your arms in front of you. Pull your hands apart while keeping a soft bend in your elbows and squeezing between your shoulder blades.",
    modification:
      "Use a lighter band or make the movement smaller.",
  },

  "Chest-Supported Reverse Fly": {
    cue: "Lie chest-down on a stable incline surface. With light dumbbells, open your arms out to the sides while keeping your shoulders controlled, then lower slowly.",
    modification:
      "Use very light weights or reduce the range of motion.",
  },

  "Reverse Pec Deck": {
    cue: "Sit facing the rear-delt machine and keep your chest against the pad. Pull your arms outward until they line up with your shoulders, then return slowly.",
    modification:
      "Use lighter resistance and focus on controlled reps.",
  },

  "Band Hammer Curl": {
    cue: "Stand on the middle of the band with your palms facing inward. Curl your hands toward your shoulders while keeping your elbows close to your sides.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Alternating Dumbbell Curl": {
    cue: "Hold a dumbbell in each hand with your palms facing forward. Curl one dumbbell toward your shoulder while keeping your elbow close to your side, then switch.",
    modification:
      "Use lighter dumbbells or slow the movement down.",
  },

  "Cable Rope Hammer Curl": {
    cue: "Hold the rope with your palms facing each other. Keep your elbows close to your sides and curl the rope toward your shoulders without swinging.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },

  "Band Biceps Curl": {
    cue: "Stand on the center of the band with your palms facing forward. Curl your hands toward your shoulders while keeping your elbows tucked.",
    modification:
      "Use a lighter band or shorten the range of motion.",
  },

  "Cable Curl": {
    cue: "Stand tall with the cable handle in your hands and elbows close to your sides. Curl the handle toward your shoulders, squeeze your biceps, then lower slowly.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },

  "Band Shrug": {
    cue: "Stand on the resistance band and hold the handles at your sides. Lift your shoulders straight up toward your ears, pause, then lower slowly.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Farmer Carry": {
    cue: "Hold a weight in each hand, stand tall, brace your core, and walk with controlled steps while keeping your shoulders down and back.",
    modification:
      "Use lighter weights or shorten the walking distance.",
  },

  "Cable Shrug": {
    cue: "Stand tall holding the cable handles at your sides. Lift your shoulders straight upward without rolling them, pause briefly, then lower slowly.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "One-Arm Dumbbell Row",
    swapKey: "One-Arm Dumbbell Row",
    prescription: "3 SETS × 10–12 / SIDE",
    rest: "60 SEC REST",
    cue: "Brace your core, keep your back neutral, and pull the dumbbell toward your hip while keeping your elbow close to your body.",
    modification:
      "Use a lighter dumbbell or support yourself more firmly with your free hand.",
    home: "One-Arm Dumbbell Row — 3 sets × 10–12 / side",
    gym: "Seated Cable Row — 3 sets × 10–12 reps",
  },

  {
    number: "02",
    name: "Dumbbell Pullover",
    swapKey: "Dumbbell Pullover",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Lie on a stable bench or floor and slowly lower the dumbbell behind your head, then pull it back over your chest using your lats.",
    modification:
      "Use a lighter dumbbell and shorten the range behind your head.",
    home: "Dumbbell Pullover — 3 sets × 10–12 reps",
    gym: "Dumbbell Pullover — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Dumbbell Reverse Fly",
    swapKey: "Dumbbell Reverse Fly",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Hinge slightly at your hips, keep a soft bend in your elbows, and open your arms out while squeezing your upper back.",
    modification:
      "Use very light dumbbells and make the range of motion smaller.",
    home: "Dumbbell Reverse Fly — 3 sets × 12–15 reps",
    gym: "Reverse Pec Deck — 3 sets × 12–15 reps",
  },

  {
    number: "04",
    name: "Dumbbell Hammer Curl",
    swapKey: "Dumbbell Hammer Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your palms facing inward, elbows close to your sides, and curl without swinging your body.",
    modification:
      "Use lighter dumbbells or alternate arms.",
    home: "Dumbbell Hammer Curl — 3 sets × 10–12 reps",
    gym: "Cable Rope Hammer Curl — 3 sets × 10–12 reps",
  },

  {
    number: "05",
    name: "Dumbbell Biceps Curl",
    swapKey: "Dumbbell Biceps Curl",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows tucked and curl the dumbbells toward your shoulders while keeping the rest of your body still.",
    modification:
      "Use lighter dumbbells or perform alternating curls.",
    home: "Dumbbell Biceps Curl — 3 sets × 10–12 reps",
    gym: "Cable Curl — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Dumbbell Shrug",
    swapKey: "Dumbbell Shrug",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Hold the dumbbells at your sides and lift your shoulders straight upward, pause, then lower with control.",
    modification:
      "Use lighter dumbbells or reduce the range of motion.",
    home: "Dumbbell Shrug — 3 sets × 12–15 reps",
    gym: "Cable Shrug — 3 sets × 12–15 reps",
  },
];

const warmup = [
  "Arm circles — 20 sec each direction",
  "Band pull-aparts — 12 reps",
  "Light band rows — 12 reps",
  "Standing reach + pull-down — 8 reps",
];

const cooldown = [
  "Cross-body shoulder stretch — 30 sec / side",
  "Child's pose with side reach — 30 sec / side",
  "Standing lat stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function HomeBackBicepsPage() {
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
                  UPPER BODY • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Home Back{" "}
                  <span className="italic text-[#A77B73]">
                    & Biceps.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build and shape your back and arms with
                  dumbbells and simple home equipment — no gym
                  required.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                pull. squeeze. control. ♡
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
                  Back + biceps
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Dumbbells + band
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
                  Wake up your shoulders and upper back before
                  loading your pulling movements.
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
                Focus on controlled pulls, a strong squeeze, and
                keeping momentum out of every rep.
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

                  {expandedExerciseSwaps[
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
                            {expandedExerciseSwaps[
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
                  Release your shoulders, open through your back,
                  and bring your breathing down before moving on.
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
              HOME BACK & BICEPS
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