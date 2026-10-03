"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import DashboardSidebar from "@/components/DashboardSidebar";

type SwapOption = {
  name: string;
  location: "HOME" | "BOTH";
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
};

// ---------------------------------

/* EXERCISE SWAPS */

// ---------------------------------

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Dumbbell Goblet Squat": [
    {
      name: "Bodyweight Squat",
      location: "HOME",
      note: "A simple lower-body option when you want to reduce resistance.",
    },
    {
      name: "Dumbbell Sumo Squat",
      location: "HOME",
      note: "A wider stance variation that keeps the focus on your glutes and legs.",
    },
    {
      name: "Chair Squat",
      location: "HOME",
      note: "Use a chair as a target to control your squat depth.",
    },
  ],

  "Dumbbell Romanian Deadlift": [
    {
      name: "Dumbbell RDL",
      location: "HOME",
      note: "Keeps the same controlled hip-hinge pattern.",
    },
    {
      name: "Good Morning",
      location: "BOTH",
      note: "A lighter hinge variation for your hamstrings and glutes.",
    },
    {
      name: "Single-Leg RDL",
      location: "BOTH",
      note: "Adds unilateral work and balance while keeping the hinge pattern.",
    },
  ],

  "Reverse Lunge": [
    {
      name: "Split Squat",
      location: "HOME",
      note: "Keeps the single-leg focus without requiring a step backward.",
    },
    {
      name: "Step-Up",
      location: "HOME",
      note: "Use a stable step or low platform for a controlled single-leg movement.",
    },
    {
      name: "Bodyweight Reverse Lunge",
      location: "HOME",
      note: "Removes the dumbbells while keeping the same movement pattern.",
    },
  ],

  "Dumbbell Glute Bridge": [
    {
      name: "Glute Bridge",
      location: "HOME",
      note: "A bodyweight version that keeps the focus on hip extension.",
    },
    {
      name: "Frog Pump",
      location: "HOME",
      note: "A high-rep floor movement that gives the glutes a strong burn.",
    },
    {
      name: "Dumbbell Hip Thrust",
      location: "HOME",
      note: "A larger-range hip extension option using a stable couch or bench.",
    },
  ],

  "Banded Lateral Walk": [
    {
      name: "Standing Band Abduction",
      location: "HOME",
      note: "Work one side at a time while keeping tension through the band.",
    },
    {
      name: "Side-Lying Leg Raise",
      location: "HOME",
      note: "A simple bodyweight option for the outer glutes.",
    },
    {
      name: "Bodyweight Lateral Walk",
      location: "HOME",
      note: "Keep the same side-to-side movement without the band.",
    },
  ],

  "Dumbbell Sumo Squat": [
    {
      name: "Goblet Squat",
      location: "HOME",
      note: "A more compact squat stance that still trains your quads and glutes.",
    },
    {
      name: "Sumo Bodyweight Squat",
      location: "HOME",
      note: "Keeps the wide stance without added resistance.",
    },
    {
      name: "Chair Squat",
      location: "HOME",
      note: "Use a chair to control depth and make the movement more accessible.",
    },
  ],

  "Banded Glute Kickback": [
    {
      name: "Donkey Kick",
      location: "HOME",
      note: "A bodyweight alternative that still emphasizes the glutes.",
    },
    {
      name: "Quadruped Leg Extension",
      location: "HOME",
      note: "Controlled bodyweight option without a band.",
    },
    {
      name: "Standing Glute Kickback",
      location: "HOME",
      note: "Perform the kickback standing while holding a stable surface.",
    },
  ],

  "Frog Pump": [
    {
      name: "Glute Bridge",
      location: "HOME",
      note: "Simple floor-based glute exercise with a similar focus.",
    },
    {
      name: "Dumbbell Glute Bridge",
      location: "HOME",
      note: "Adds resistance while keeping the movement simple.",
    },
    {
      name: "Bodyweight Hip Thrust",
      location: "HOME",
      note: "A larger-range hip extension movement using a stable surface.",
    },
  ],
};

// ---------------------------------

/* EXPANDED SWAP PATHS */

// ---------------------------------

const expandedExerciseSwaps: Record<string, SwapOption[]> = {
  ...exerciseSwaps,
};

Object.entries(exerciseSwaps).forEach(
  ([originalExercise, options]) => {
    options.forEach((option) => {
      const existingOptions =
        expandedExerciseSwaps[option.name] ?? [];

      const alreadyHasOriginal = existingOptions.some(
        (item) => item.name === originalExercise,
      );

      expandedExerciseSwaps[option.name] = alreadyHasOriginal
        ? existingOptions
        : [
            {
              name: originalExercise,
              location: "HOME",
              note: `Return to ${originalExercise}.`,
            },
            ...existingOptions,
          ];
    });
  },
);

// ---------------------------------

/* WORKOUT */

// ---------------------------------

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Dumbbell Goblet Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Hold one dumbbell close to your chest, sit your hips down and back, then drive through your feet to stand tall.",
    modification:
      "Use a lighter dumbbell or perform bodyweight squats.",
    home: "Dumbbell Goblet Squat — 3 sets × 10–12 reps",
  },

  {
    number: "02",
    name: "Dumbbell Romanian Deadlift",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Push your hips back with soft knees and keep the dumbbells close to your legs. Stop when you feel a strong hamstring stretch.",
    modification:
      "Use lighter dumbbells or shorten your range of motion.",
    home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Reverse Lunge",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "60 SEC REST",
    cue: "Step one foot back with control, lower straight down, then drive through your front foot to return to standing.",
    modification:
      "Hold onto a stable surface or perform the movement without dumbbells.",
    home: "Dumbbell Reverse Lunge — 3 sets × 8–10 / side",
  },

  {
    number: "04",
    name: "Dumbbell Glute Bridge",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Keep your ribs down, drive through your heels, and squeeze your glutes at the top without arching your lower back.",
    modification:
      "Remove the dumbbell and perform bodyweight glute bridges.",
    home: "Dumbbell Glute Bridge — 3 sets × 12–15 reps",
  },

  {
    number: "05",
    name: "Banded Lateral Walk",
    prescription: "3 SETS × 10–12 / SIDE",
    rest: "45 SEC REST",
    cue: "Stay slightly bent through your knees and take controlled steps while keeping constant tension on the band.",
    modification:
      "Use a lighter band or reduce the number of steps.",
    home: "Banded Lateral Walk — 3 sets × 10–12 / side",
  },

  {
    number: "06",
    name: "Dumbbell Sumo Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Take a comfortable wide stance, keep your chest lifted, and drive through your feet as you stand.",
    modification:
      "Use one lighter dumbbell or perform the movement with bodyweight.",
    home: "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
  },

  {
    number: "07",
    name: "Banded Glute Kickback",
    prescription: "2 SETS × 12–15 / SIDE",
    rest: "45 SEC REST",
    cue: "Brace your core and extend your leg behind you without twisting your hips or arching your lower back.",
    modification:
      "Remove the band and perform controlled bodyweight kickbacks.",
    home: "Banded Glute Kickback — 2 sets × 12–15 / side",
  },
];

// ---------------------------------

/* SWAP EXERCISE DETAILS */

// ---------------------------------

const swapExerciseDetails: Record<
  string,
  Omit<
    WorkoutExercise,
    "number" | "prescription" | "rest" | "home"
  >
> = {
  "Bodyweight Squat": {
    name: "Bodyweight Squat",
    cue: "Stand with your feet about shoulder-width apart, sit your hips down and back, then drive through your feet to stand tall.",
    modification:
      "Use a chair behind you as a target or reduce your squat depth.",
  },

  "Dumbbell RDL": {
    name: "Dumbbell RDL",
    cue: "Keep the dumbbells close to your legs, push your hips back with soft knees, then squeeze your glutes to stand tall.",
    modification:
      "Use lighter dumbbells or shorten your range of motion.",
  },

  "Good Morning": {
    name: "Good Morning",
    cue: "Place your hands across your chest, soften your knees, push your hips back, then squeeze your glutes to return to standing.",
    modification:
      "Reduce your range of motion or perform the movement without added resistance.",
  },

  "Single-Leg RDL": {
    name: "Single-Leg RDL",
    cue: "Balance on one leg, hinge your hips back while reaching the other leg behind you, then drive through your standing foot to return.",
    modification:
      "Keep the back toes lightly on the floor or hold a stable surface for balance.",
  },

  "Split Squat": {
    name: "Split Squat",
    cue: "Take a staggered stance, lower your back knee toward the floor with control, then drive through your front foot to stand.",
    modification:
      "Hold onto a stable surface or reduce your range of motion.",
  },

  "Step-Up": {
    name: "Step-Up",
    cue: "Place one foot on a stable low step, drive through that foot to stand, then lower back down with control.",
    modification:
      "Use a lower step or hold onto a stable surface for balance.",
  },

  "Bodyweight Reverse Lunge": {
    name: "Bodyweight Reverse Lunge",
    cue: "Step one foot back with control, lower straight down, then drive through your front foot to return to standing.",
    modification:
      "Hold onto a stable surface or reduce your range of motion.",
  },

  "Glute Bridge": {
    name: "Glute Bridge",
    cue: "Lie on your back with your knees bent, drive through your heels, and squeeze your glutes at the top without arching your lower back.",
    modification:
      "Reduce your range of motion or pause before reaching the top.",
  },

  "Frog Pump": {
    name: "Frog Pump",
    cue: "Bring the soles of your feet together, keep your knees open, then drive your hips upward and squeeze your glutes at the top.",
    modification:
      "Use a smaller range of motion or slow the movement down.",
  },

  "Dumbbell Hip Thrust": {
    name: "Dumbbell Hip Thrust",
    cue: "Rest your upper back against a stable couch or bench, drive through your heels, and squeeze your glutes as you lift your hips.",
    modification:
      "Use bodyweight only or reduce the range of motion.",
  },

  "Standing Band Abduction": {
    name: "Standing Band Abduction",
    cue: "Stand tall with the band secured around your legs, move one leg out to the side without leaning, then return with control.",
    modification:
      "Use a lighter band or hold a stable surface for balance.",
  },

  "Side-Lying Leg Raise": {
    name: "Side-Lying Leg Raise",
    cue: "Lie on your side with your legs long, lift the top leg without rolling your hips back, then lower slowly.",
    modification:
      "Reduce the height of the leg raise or bend the bottom knee for support.",
  },

  "Bodyweight Lateral Walk": {
    name: "Bodyweight Lateral Walk",
    cue: "Stay slightly bent through your knees and hips, then take small controlled steps side to side while keeping your chest lifted.",
    modification:
      "Take smaller steps or reduce the depth of your squat position.",
  },

  "Goblet Squat": {
    name: "Goblet Squat",
    cue: "Hold one weight close to your chest, sit your hips down and back, then drive through your feet to stand tall.",
    modification:
      "Use a lighter weight or perform the squat with bodyweight.",
  },

  "Sumo Bodyweight Squat": {
    name: "Sumo Bodyweight Squat",
    cue: "Take a comfortable wide stance with your toes slightly turned out, lower your hips with control, then drive through your feet to stand.",
    modification:
      "Reduce your squat depth or use a chair as a target.",
  },

  "Chair Squat": {
    name: "Chair Squat",
    cue: "Stand in front of a sturdy chair, sit your hips back until you lightly touch the seat, then drive through your feet to stand.",
    modification:
      "Use a higher seat or reduce how far you lower toward the chair.",
  },

  "Donkey Kick": {
    name: "Donkey Kick",
    cue: "Start on all fours, brace your core, then drive one heel upward without twisting your hips or arching your lower back.",
    modification:
      "Use a smaller range of motion or slow each repetition down.",
  },

  "Quadruped Leg Extension": {
    name: "Quadruped Leg Extension",
    cue: "Start on all fours, extend one leg straight behind you while keeping your hips square, then return with control.",
    modification:
      "Keep the moving leg lower or perform fewer repetitions per side.",
  },

  "Standing Glute Kickback": {
    name: "Standing Glute Kickback",
    cue: "Hold a stable surface, brace your core, and extend one leg behind you without rotating your hips.",
    modification:
      "Reduce the range of motion or perform the movement without a band.",
  },

  "Bodyweight Hip Thrust": {
    name: "Bodyweight Hip Thrust",
    cue: "Rest your upper back against a stable surface, drive through your heels, and squeeze your glutes as you lift your hips.",
    modification:
      "Use a smaller range of motion or perform the movement from the floor as a glute bridge.",
  },
};

const getSwapExercise = (
  name: string,
  current: WorkoutExercise,
): WorkoutExercise => {
  const originalExercise = exercises.find(
    (item) => item.name === name,
  );

  if (originalExercise) {
    return {
      ...originalExercise,
      number: current.number,
      prescription: current.prescription,
      rest: current.rest,
    };
  }

  const swapDetails = swapExerciseDetails[name];

  if (swapDetails) {
    return {
      ...current,
      ...swapDetails,
      number: current.number,
      prescription: current.prescription,
      rest: current.rest,
      home: `${name} — ${current.prescription.toLowerCase()}`,
    };
  }

  return {
    ...current,
    name,
  };
};

// ---------------------------------

/* WARM UP */

// ---------------------------------

const warmup = [
  "Bodyweight glute bridges — 12 reps",
  "Bodyweight squats — 10 reps",
  "Hip hinges — 10 reps",
  "Alternating reverse lunges — 6 / side",
];

// ---------------------------------

/* COOL DOWN */

// ---------------------------------

const cooldown = [
  "Figure-four stretch — 30 sec / side",
  "Half-kneeling hip flexor stretch — 30 sec / side",
  "Hamstring stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

// ---------------------------------

/* PAGE */

// ---------------------------------

export default function HomeGluteLegsPage() {
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
        setFirstName(
          user.email.split("@")[0],
        );
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
                  LOWER BODY • BEGINNER / INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Home Glute{" "}
                  <span className="italic text-[#A77B73]">
                    & Legs.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  A home-focused lower-body session built
                  around glutes, quads, and hamstrings.
                  No gym machines needed. Use dumbbells,
                  a resistance band, water bottles, a sealed
                  detergent bottle, a bag filled with books,
                  or other sturdy household items to add
                  resistance.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                home. strong. locked in. ♡
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
                  07
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
                  Dumbbells + band + household items
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
                  Wake up your lower body, warm your hips,
                  and prepare your legs before adding resistance.
                </p>
              </div>

              <div className="grid gap-x-7 sm:grid-cols-2">
                {warmup.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-t border-[#D5BBB5] py-3"
                  >
                    <span className="font-serif text-xs italic text-[#9D6F67]">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
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
                Move with control and choose the easier
                option whenever you need it.
              </p>
            </div>

            {/* WORKOUT CARD */}

            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {workoutExercises.map(
                (exercise, index) => (
                  <article
                    key={exercise.number}
                    className={`px-4 py-6 sm:px-6 ${
                      index !==
                      workoutExercises.length - 1
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

                    {/* HOME OPTION */}

                    <div className="mt-5 md:ml-[58px]">
                      <div className="border-t border-[#E7DAD6] pt-4">
                        <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          HOME
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                          {exercise.home}
                        </p>
                      </div>

                      {/* EASIER OPTION */}

                      <div className="mt-4 border-t border-[#E7DAD6] pt-4">
                        <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          EASIER OPTION
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#5F504B]">
                          {exercise.modification}
                        </p>
                      </div>
                    </div>

                    {/* SWAP */}

                    {expandedExerciseSwaps[
                      exercise.name
                    ] && (
                      <div className="mt-4 md:ml-[58px]">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSwapFor(
                              (current) =>
                                current ===
                                exercise.number
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
                            {openSwapFor ===
                            exercise.number
                              ? "−"
                              : "+"}
                          </span>
                        </button>

                        {openSwapFor ===
                          exercise.number && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-[#DED0CB] bg-[#EAD8D3]/40">
                            <div className="divide-y divide-[#D8C3BD]">
                              {expandedExerciseSwaps[
                                exercise.name
                              ].map((swap) => (
                                <button
                                  key={`${exercise.number}-${swap.name}`}
                                  type="button"
                                  onClick={() => {
                                    setWorkoutExercises(
                                      (current) =>
                                        current.map(
                                          (item) =>
                                            item.number ===
                                            exercise.number
                                              ? getSwapExercise(
                                                  swap.name,
                                                  item,
                                                )
                                              : item,
                                        ),
                                    );

                                    setOpenSwapFor(
                                      null,
                                    );
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
                ),
              )}
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
                  Give your lower body a few quiet minutes
                  to recover before moving on with your day.
                </p>
              </div>

              <div className="grid gap-x-7 sm:grid-cols-2">
                {cooldown.map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-t border-[#E1D3CE] py-3"
                    >
                      <span className="font-serif text-xs italic text-[#A77B73]">
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <p className="text-xs leading-5 text-[#5F504B]">
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* FINISH */}

          <section className="py-10 text-center">
            <p className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
              HOME GLUTE & LEGS
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