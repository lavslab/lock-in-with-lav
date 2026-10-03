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

const exerciseSwaps: Record<string, SwapOption[]> = {
  "Dumbbell Floor Press": [
    {
      name: "Dumbbell Bench Press",
      location: "HOME",
      note: "A fuller-range chest press if you have a stable bench.",
    },
    {
      name: "Resistance Band Chest Press",
      location: "HOME",
      note: "Band-based chest press that works without a bench.",
    },
    {
      name: "Chest Press Machine",
      location: "GYM",
      note: "Stable machine-based option for the chest.",
    },
  ],

  "Dumbbell Shoulder Press": [
    {
      name: "Arnold Press",
      location: "HOME",
      note: "A dumbbell shoulder press variation with a rotation.",
    },
    {
      name: "Single-Arm Shoulder Press",
      location: "HOME",
      note: "Lets you work one shoulder at a time while bracing your core.",
    },
    {
      name: "Machine Shoulder Press",
      location: "GYM",
      note: "Supported gym option for pressing the shoulders.",
    },
  ],

  "Dumbbell Chest Fly": [
    {
      name: "Resistance Band Chest Fly",
      location: "HOME",
      note: "Band variation that keeps tension through the chest.",
    },
    {
      name: "Single-Arm Floor Fly",
      location: "HOME",
      note: "Controlled floor-based chest fly variation.",
    },
    {
      name: "Cable Chest Fly",
      location: "GYM",
      note: "Cable option that keeps consistent resistance through the movement.",
    },
  ],

  "Dumbbell Overhead Triceps Extension": [
    {
      name: "Band Overhead Triceps Extension",
      location: "HOME",
      note: "Resistance-band option for the triceps.",
    },
    {
      name: "Close-Grip Push-Up",
      location: "BOTH",
      note: "Bodyweight pressing option with more triceps emphasis.",
    },
    {
      name: "Cable Overhead Triceps Extension",
      location: "GYM",
      note: "Cable-based triceps movement with constant tension.",
    },
  ],

  "Dumbbell Triceps Kickback": [
    {
      name: "Band Triceps Kickback",
      location: "HOME",
      note: "Band-based isolation option for the triceps.",
    },
    {
      name: "Close-Grip Dumbbell Press",
      location: "HOME",
      note: "Compound pressing option with extra triceps emphasis.",
    },
    {
      name: "Cable Triceps Kickback",
      location: "GYM",
      note: "Cable variation for controlled triceps isolation.",
    },
  ],

  "Dumbbell Lateral Raise": [
    {
      name: "Band Lateral Raise",
      location: "HOME",
      note: "Resistance-band option for the side delts.",
    },
    {
      name: "Lean-Away Lateral Raise",
      location: "BOTH",
      note: "A controlled variation that changes the resistance curve.",
    },
    {
      name: "Cable Lateral Raise",
      location: "GYM",
      note: "Cable-based option for constant shoulder tension.",
    },
  ],
};

/*
 * Give every replacement exercise its own swap menu too.
 *
 * This allows:
 *
 * Floor Press
 * → Band Chest Press
 * → Floor Press
 *
 * without losing the actual instructions.
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
  "Dumbbell Floor Press": {
    cue: "Lie on your back with your knees bent and a dumbbell in each hand. Lower your upper arms toward the floor with control, then press the dumbbells back over your chest.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
  },

  "Dumbbell Bench Press": {
    cue: "Lie on a stable bench with a dumbbell in each hand. Lower the weights toward the sides of your chest, then press them back up without locking your elbows.",
    modification:
      "Use lighter dumbbells or reduce the range of motion.",
  },

  "Resistance Band Chest Press": {
    cue: "Anchor the band securely behind you at chest height. Step forward, brace your core, and press your hands forward until your arms are almost straight.",
    modification:
      "Use a lighter band or reduce the pressing range.",
  },

  "Chest Press Machine": {
    cue: "Adjust the seat so the handles line up around mid-chest. Keep your shoulders supported and press the handles forward with control.",
    modification:
      "Use lighter resistance and avoid locking your elbows.",
  },

  "Dumbbell Shoulder Press": {
    cue: "Hold the dumbbells at shoulder height with your core braced. Press overhead while keeping your ribs stacked over your hips, then lower slowly.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
  },

  "Arnold Press": {
    cue: "Start with the dumbbells in front of your shoulders, palms facing you. Rotate your palms outward as you press overhead, then reverse the movement as you lower.",
    modification:
      "Use lighter dumbbells or perform the movement seated.",
  },

  "Single-Arm Shoulder Press": {
    cue: "Hold one dumbbell at shoulder height and brace your core. Press overhead without leaning to the side, then lower with control.",
    modification:
      "Use a lighter dumbbell or perform the movement seated.",
  },

  "Machine Shoulder Press": {
    cue: "Adjust the seat so the handles begin around shoulder height. Press overhead without locking your elbows, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range of motion.",
  },

  "Dumbbell Chest Fly": {
    cue: "Lie on your back with dumbbells above your chest and a soft bend in your elbows. Open your arms slowly until you feel a comfortable chest stretch, then bring the weights back together.",
    modification:
      "Use very light dumbbells and shorten the range of motion.",
  },

  "Resistance Band Chest Fly": {
    cue: "Anchor the band behind you at chest height. With a soft bend in your elbows, bring your hands together in front of your chest while squeezing your chest.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Single-Arm Floor Fly": {
    cue: "Lie on your back with one dumbbell above your chest. Slowly open that arm toward the floor while keeping a soft elbow bend, then bring it back over your chest.",
    modification:
      "Use a very light dumbbell and keep the range small.",
  },

  "Cable Chest Fly": {
    cue: "Stand between the cable handles with a soft bend in your elbows. Bring your hands together in front of your chest while keeping your torso stable.",
    modification:
      "Use lighter resistance and reduce the range.",
  },

  "Dumbbell Overhead Triceps Extension": {
    cue: "Hold one dumbbell overhead with both hands. Bend your elbows to lower the weight behind your head, then extend your arms back overhead.",
    modification:
      "Use a lighter dumbbell or perform the movement seated.",
  },

  "Band Overhead Triceps Extension": {
    cue: "Anchor the band securely behind you. Hold the band overhead with your elbows bent, then extend your arms while keeping your elbows pointing forward.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Close-Grip Push-Up": {
    cue: "Place your hands slightly narrower than shoulder-width. Keep your elbows close to your sides as you lower your chest, then press the floor away.",
    modification:
      "Perform the push-up from your knees or against an elevated surface.",
  },

  "Cable Overhead Triceps Extension": {
    cue: "Face away from the cable with the rope overhead. Keep your elbows pointed forward and extend your arms without letting your elbows flare.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Dumbbell Triceps Kickback": {
    cue: "Hinge forward with a neutral spine and keep your upper arms close to your torso. Extend your elbows to straighten your arms, then slowly bend them again.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
  },

  "Band Triceps Kickback": {
    cue: "Anchor the band low and hinge slightly forward. Keep your upper arm close to your body as you straighten your elbow against the band.",
    modification:
      "Use a lighter band or reduce the range of motion.",
  },

  "Close-Grip Dumbbell Press": {
    cue: "Lie on your back holding dumbbells close together above your chest. Lower them with your elbows tucked, then press them back up.",
    modification:
      "Use lighter dumbbells or reduce the range of motion.",
  },

  "Cable Triceps Kickback": {
    cue: "Hinge slightly forward while holding the cable. Keep your upper arm still and extend your elbow until your arm is straight, then return slowly.",
    modification:
      "Use lighter resistance or reduce the range.",
  },

  "Dumbbell Lateral Raise": {
    cue: "Hold the dumbbells at your sides with a soft bend in your elbows. Raise your arms out toward shoulder height without shrugging.",
    modification:
      "Use lighter dumbbells or alternate arms.",
  },

  "Band Lateral Raise": {
    cue: "Stand on the band and hold the ends at your sides. Raise your arms outward toward shoulder height while keeping your shoulders relaxed.",
    modification:
      "Use a lighter band or raise one arm at a time.",
  },

  "Lean-Away Lateral Raise": {
    cue: "Hold onto a stable support and lean slightly away. Raise the dumbbell out to the side with control, then lower slowly.",
    modification:
      "Use a lighter dumbbell or reduce the range.",
  },

  "Cable Lateral Raise": {
    cue: "Stand beside the cable and raise the arm away from your body toward shoulder height while keeping your torso still.",
    modification:
      "Use lighter resistance or reduce the range.",
  },
};

/* ---------------------------------
   WORKOUT
--------------------------------- */

const exercises: WorkoutExercise[] = [
  {
    number: "01",
    name: "Dumbbell Floor Press",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep your elbows slightly tucked as you lower the dumbbells with control, then press them back over your chest.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
    home: "Dumbbell Floor Press — 3 sets × 10–12 reps",
    gym: "Chest Press Machine — 3 sets × 10–12 reps",
  },

  {
    number: "02",
    name: "Dumbbell Shoulder Press",
    prescription: "3 SETS × 8–10 REPS",
    rest: "60 SEC REST",
    cue: "Brace your core and press the dumbbells overhead without arching your lower back.",
    modification:
      "Use lighter dumbbells or perform one arm at a time.",
    home: "Dumbbell Shoulder Press — 3 sets × 8–10 reps",
    gym: "Machine Shoulder Press — 3 sets × 8–10 reps",
  },

  {
    number: "03",
    name: "Dumbbell Chest Fly",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep a soft bend in your elbows and open your arms slowly before bringing the dumbbells back together over your chest.",
    modification:
      "Use very light dumbbells and shorten the range.",
    home: "Dumbbell Chest Fly — 3 sets × 10–12 reps",
    gym: "Cable Chest Fly — 3 sets × 10–12 reps",
  },

  {
    number: "04",
    name: "Dumbbell Overhead Triceps Extension",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Keep your elbows pointing forward as you lower the dumbbell behind your head, then extend your arms overhead.",
    modification:
      "Use a lighter dumbbell or perform the movement seated.",
    home: "Dumbbell Overhead Triceps Extension — 3 sets × 10–12 reps",
    gym: "Cable Overhead Triceps Extension — 3 sets × 10–12 reps",
  },

  {
    number: "05",
    name: "Dumbbell Triceps Kickback",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Keep your upper arms still beside your torso and straighten your elbows without swinging the weights.",
    modification:
      "Use lighter dumbbells or work one arm at a time.",
    home: "Dumbbell Triceps Kickback — 3 sets × 12–15 reps",
    gym: "Cable Triceps Kickback — 3 sets × 12–15 reps",
  },

  {
    number: "06",
    name: "Dumbbell Lateral Raise",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Raise the dumbbells toward shoulder height with a soft bend in your elbows while keeping your shoulders relaxed.",
    modification:
      "Use lighter dumbbells or alternate arms.",
    home: "Dumbbell Lateral Raise — 3 sets × 12–15 reps",
    gym: "Cable Lateral Raise — 3 sets × 12–15 reps",
  },
];

const warmup = [
  "Arm circles — 20 sec each direction",
  "Band pull-aparts — 12 reps",
  "Wall push-ups — 10 reps",
  "Light shoulder presses — 8 reps",
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

export default function HomeChestTricepsPage() {
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
                  Home Chest{" "}
                  <span className="italic text-[#A77B73]">
                    & Triceps.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build and shape your chest, shoulders, and
                  triceps with simple home-friendly resistance
                  training.
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
                  Chest + triceps
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
                    to press.
                  </span>
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#806E68]">
                  Warm up your shoulders, chest, and triceps before
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
                    six movements.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-5 text-[#806E68]">
                Keep your reps controlled and focus on feeling the
                target muscle do the work.
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
                  Give your chest, shoulders, and arms a few quiet
                  minutes to release tension.
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
              HOME CHEST & TRICEPS
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