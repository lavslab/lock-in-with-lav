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
  prescription: string;
  rest: string;
  cue: string;
  modification: string;
  home: string;
  gym: string;
};

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Dumbbell Hip Thrust": [
    {
      name: "Glute Bridge",
      location: "BOTH",
      note: "A floor-based hip extension option that still targets the glutes.",
    },
    {
      name: "Dumbbell Glute Bridge",
      location: "HOME",
      note: "Keeps the same glute-focused movement with less setup.",
    },
    {
      name: "Cable Pull-Through",
      location: "GYM",
      note: "Standing hip-extension option with continuous cable tension.",
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

  "Bulgarian Split Squat": [
    {
      name: "Reverse Lunge",
      location: "BOTH",
      note: "Single-leg option without needing to elevate the back foot.",
    },
    {
      name: "Split Squat",
      location: "BOTH",
      note: "Keeps the unilateral squat pattern without stepping.",
    },
    {
      name: "Step-Up",
      location: "BOTH",
      note: "Single-leg option using a stable step or bench.",
    },
  ],

  "Banded Lateral Walk": [
    {
      name: "Hip Abduction",
      location: "GYM",
      note: "Directly targets the outer glutes and hip abductors.",
    },
    {
      name: "Side-Lying Leg Raise",
      location: "HOME",
      note: "Simple bodyweight option for the same general area.",
    },
    {
      name: "Standing Band Abduction",
      location: "HOME",
      note: "Keeps band tension while working one side at a time.",
    },
  ],

  "Dumbbell Sumo Squat": [
    {
      name: "Goblet Squat",
      location: "BOTH",
      note: "A squat variation that still trains the quads and glutes.",
    },
    {
      name: "Leg Press",
      location: "GYM",
      note: "Stable option for loading the lower body.",
    },
    {
      name: "Sumo Bodyweight Squat",
      location: "HOME",
      note: "Same wide-stance pattern without added resistance.",
    },
  ],

  "Banded Glute Kickback": [
    {
      name: "Cable Glute Kickback",
      location: "GYM",
      note: "Keeps the same hip-extension pattern with adjustable resistance.",
    },
    {
      name: "Donkey Kick",
      location: "HOME",
      note: "Bodyweight alternative that still emphasizes the glutes.",
    },
    {
      name: "Quadruped Leg Extension",
      location: "HOME",
      note: "Controlled bodyweight option without a band.",
    },
  ],

  "Frog Pump": [
    {
      name: "Glute Bridge",
      location: "BOTH",
      note: "Simple floor-based glute exercise with a similar focus.",
    },
    {
      name: "Hip Thrust",
      location: "BOTH",
      note: "A stronger hip-extension option for the glutes.",
    },
    {
      name: "Dumbbell Glute Bridge",
      location: "HOME",
      note: "Adds resistance while keeping the movement simple.",
    },
  ],
};

/*
 * Every replacement can also be swapped again.
 * This builds the additional swap paths automatically from the
 * existing exerciseSwaps list.
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

/* SWAP EXERCISE INSTRUCTIONS */

const swapExerciseDetails: Record<
  string,
  SwapExerciseDetails
> = {
  "Glute Bridge": {
    cue: "Lie on your back with your knees bent and feet planted. Drive through your heels, lift your hips, squeeze your glutes at the top, then lower with control.",
    modification:
      "Use a smaller range of motion or pause between repetitions.",
  },

  "Dumbbell Glute Bridge": {
    cue: "Lie on your back with your knees bent and feet planted. Place a dumbbell securely across your hips, drive through your heels, and squeeze your glutes at the top.",
    modification:
      "Remove the dumbbell and perform a bodyweight glute bridge.",
  },

  "Cable Pull-Through": {
    cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then drive your hips forward and squeeze your glutes to stand tall.",
    modification:
      "Use a lighter cable weight or shorten your range of motion.",
  },

  "Dumbbell RDL": {
    cue: "Hold the dumbbells close to your legs with soft knees. Push your hips back while keeping your spine neutral, then squeeze your glutes to return to standing.",
    modification:
      "Use lighter dumbbells or shorten your range of motion.",
  },

  "Good Morning": {
    cue: "Stand tall with a soft bend in your knees. Push your hips back while keeping your spine neutral, then squeeze your glutes to return to standing.",
    modification:
      "Reduce your range of motion or perform the movement without added resistance.",
  },

  "Single-Leg RDL": {
    cue: "Balance on one leg and push your hips back while reaching the opposite leg behind you. Keep your hips square, then drive through your standing foot to return.",
    modification:
      "Keep the toes of your non-working leg lightly on the floor or hold onto a stable surface.",
  },

  "Reverse Lunge": {
    cue: "Stand tall, step one foot back, and lower your hips straight down with control. Drive through your front foot to return to standing.",
    modification:
      "Hold onto a stable surface or perform the movement without added weight.",
  },

  "Split Squat": {
    cue: "Take a staggered stance and lower your back knee toward the floor while keeping your front foot planted. Drive through your front foot to stand.",
    modification:
      "Hold onto a stable surface or reduce your range of motion.",
  },

  "Step-Up": {
    cue: "Place one foot on a stable step or bench. Drive through that foot to stand tall, then lower yourself back down with control.",
    modification:
      "Use a lower step or hold onto a stable surface for balance.",
  },

  "Hip Abduction": {
    cue: "Sit upright in the hip abduction machine with your back supported. Press your knees outward against the pads, pause briefly, then return with control.",
    modification:
      "Use a lighter resistance or reduce the range of motion.",
  },

  "Side-Lying Leg Raise": {
    cue: "Lie on your side with your legs extended. Keep your hips stacked and lift the top leg without rolling your body backward, then lower slowly.",
    modification:
      "Reduce the height of the leg raise or bend the bottom knee for support.",
  },

  "Standing Band Abduction": {
    cue: "Stand tall with the band around your legs. Move one leg out to the side without leaning your torso, then return slowly while keeping tension on the band.",
    modification:
      "Use a lighter band or hold onto a stable surface.",
  },

  "Goblet Squat": {
    cue: "Hold one dumbbell close to your chest. Sit your hips down and back while keeping your chest lifted, then drive through your feet to stand.",
    modification:
      "Use a lighter dumbbell or perform the squat with bodyweight.",
  },

  "Leg Press": {
    cue: "Sit securely in the leg press machine with your feet planted on the platform. Lower the weight with control, then drive through your whole foot to press the platform away.",
    modification:
      "Use a lighter weight or reduce your range of motion.",
  },

  "Sumo Bodyweight Squat": {
    cue: "Take a comfortable wide stance with your toes slightly turned out. Lower your hips with control, then drive through your feet to stand tall.",
    modification:
      "Reduce your squat depth or use a stable chair as a target.",
  },

  "Cable Glute Kickback": {
    cue: "Attach the ankle strap and face the cable machine. Brace your core, extend one leg behind you without rotating your hips, then return slowly.",
    modification:
      "Use a lighter cable weight or reduce the range of motion.",
  },

  "Donkey Kick": {
    cue: "Start on all fours with your hands under your shoulders. Brace your core and drive one heel upward while keeping your hips square.",
    modification:
      "Use a smaller range of motion or perform fewer repetitions per side.",
  },

  "Quadruped Leg Extension": {
    cue: "Start on all fours and extend one leg straight behind you while keeping your hips square. Pause briefly, then return with control.",
    modification:
      "Keep the moving leg lower or reduce the number of repetitions.",
  },

  "Frog Pump": {
    cue: "Lie on your back with the soles of your feet together and your knees open. Drive your hips upward and squeeze your glutes at the top of every repetition.",
    modification:
      "Reduce the range of motion or perform fewer repetitions.",
  },

  "Hip Thrust": {
    cue: "Rest your upper back against a stable bench or couch. Drive through your heels to lift your hips, squeeze your glutes at the top, then lower with control.",
    modification:
      "Use bodyweight only or reduce your range of motion.",
  },
};

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Dumbbell Hip Thrust",
    prescription: "4 SETS × 10–12 REPS",
    rest: "75 SEC REST",
    cue: "Keep your chin tucked, ribs down, and drive through your heels. Finish by squeezing your glutes without arching your lower back.",
    modification:
      "Use bodyweight or perform a glute bridge from the floor.",
    home: "Dumbbell Hip Thrust — 4 sets × 10–12 reps",
    gym: "Smith Machine Hip Thrust — 4 sets × 10–12 reps",
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
    gym: "Barbell or Smith Machine RDL — 3 sets × 10–12 reps",
  },

  {
    number: "03",
    name: "Bulgarian Split Squat",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "60 SEC REST",
    cue: "Take a long stance and lean slightly forward while keeping your front foot planted. Drive through the front heel to stand.",
    modification:
      "Keep your back foot on the floor and perform a stationary split squat.",
    home:
      "Dumbbell Bulgarian Split Squat — 3 sets × 8–10 / side",
    gym:
      "Smith Machine Bulgarian Split Squat — 3 sets × 8–10 / side",
  },

  {
    number: "04",
    name: "Banded Lateral Walk",
    prescription: "3 SETS × 12 / SIDE",
    rest: "45 SEC REST",
    cue: "Keep tension on the band, stay slightly bent through your knees, and take controlled steps without rocking side to side.",
    modification:
      "Use a lighter band or perform fewer steps each direction.",
    home:
      "Banded Lateral Walk — 3 sets × 12 / side",
    gym:
      "Hip Abduction Machine — 3 sets × 12–15 reps",
  },

  {
    number: "05",
    name: "Dumbbell Sumo Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Use a comfortable wide stance, keep your chest tall, and drive the floor away as you stand and squeeze your glutes.",
    modification:
      "Use one lighter dumbbell or perform the movement with bodyweight.",
    home:
      "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
    gym:
      "Leg Press — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Banded Glute Kickback",
    prescription: "3 SETS × 12–15 / SIDE",
    rest: "45 SEC REST",
    cue: "Brace your core and extend your leg behind you without twisting your hips or arching your lower back.",
    modification:
      "Remove the band and perform controlled bodyweight kickbacks.",
    home:
      "Banded Glute Kickback — 3 sets × 12–15 / side",
    gym:
      "Cable Glute Kickback — 3 sets × 12–15 / side",
  },

  {
    number: "07",
    name: "Frog Pump",
    prescription: "2 SETS × 20 REPS",
    rest: "30 SEC REST",
    cue: "Press the soles of your feet together, keep your ribs down, and squeeze your glutes hard at the top of every rep.",
    modification:
      "Reduce the reps and pause briefly between repetitions as needed.",
    home: "Frog Pump — 2 sets × 20 reps",
    gym:
      "Hip Thrust Machine Burnout — 2 sets × 15–20 reps",
  },
];

const warmup = [
  "Bodyweight glute bridges — 12 reps",
  "Hip hinges — 10 reps",
  "Fire hydrants — 8 / side",
  "Banded lateral steps — 8 / side",
];

const cooldown = [
  "Figure-four stretch — 30 sec / side",
  "Half-kneeling hip flexor stretch — 30 sec / side",
  "Hamstring stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function GluteBuilderPage() {
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
                  GLUTES • INTERMEDIATE
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Glute{" "}
                  <span className="italic text-[#A77B73]">
                    Builder.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build strong glutes and hamstrings through controlled
                  reps, focused tension, and a strong finish.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                slow reps. strong finish. ♡
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
                  07
                </p>
              </div>

              <div className="border-r border-[#E1D3CE] py-4 pr-3 sm:pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  FOCUS
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Glutes + hamstrings
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
                  Wake up your glutes and prepare your hips before adding
                  resistance.
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
                Work through each movement in order. Choose the setup that
                fits where you&apos;re training today.
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
                            {expandedExerciseSwaps[
                              exercise.name
                            ].map((swap) => (
                              <button
                                key={`${exercise.number}-${swap.name}`}
                                type="button"
                                onClick={() => {
                                  const details =
                                    swapExerciseDetails[
                                      swap.name
                                    ];

                                  setWorkoutExercises(
                                    (current) =>
                                      current.map((item) =>
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
                  Give your body a few quiet minutes before moving on with
                  your day.
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
              GLUTE BUILDER
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