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
  "Dead Bug": [
    {
      name: "Heel Taps",
      location: "HOME",
      note: "A simple core-control option that keeps your lower back supported.",
    },
    {
      name: "Bird Dog",
      location: "BOTH",
      note: "Trains opposite-side coordination while maintaining a braced core.",
    },
    {
      name: "Marching Dead Bug",
      location: "HOME",
      note: "A slower variation that reduces the range of motion.",
    },
  ],

  Plank: [
    {
      name: "Incline Plank",
      location: "HOME",
      note: "Elevating your hands reduces the amount of bodyweight you need to control.",
    },
    {
      name: "Dead Bug",
      location: "BOTH",
      note: "Floor-based core control option without holding a plank.",
    },
    {
      name: "Pallof Press",
      location: "GYM",
      note: "Anti-rotation option that challenges your core without a plank hold.",
    },
  ],

  "Bird Dog": [
    {
      name: "Dead Bug",
      location: "HOME",
      note: "Another controlled opposite-side core movement performed on the floor.",
    },
    {
      name: "Quadruped Leg Extension",
      location: "HOME",
      note: "Simplifies the movement by focusing on one limb at a time.",
    },
    {
      name: "Pallof Press",
      location: "GYM",
      note: "Standing anti-rotation exercise that trains core stability.",
    },
  ],

  "Core Press": [
    {
      name: "Banded Pallof Press",
      location: "HOME",
      note: "The same anti-rotation pattern using a resistance band.",
    },
    {
      name: "Cable Pallof Press",
      location: "GYM",
      note: "Cable-based anti-rotation movement with adjustable resistance.",
    },
    {
      name: "Dead Bug",
      location: "HOME",
      note: "Floor-based alternative focused on bracing and resisting movement.",
    },
  ],

  "Reverse Crunch": [
    {
      name: "Heel Taps",
      location: "HOME",
      note: "A controlled lower-abdominal movement with a smaller range of motion.",
    },
    {
      name: "Bent-Knee Leg Raise",
      location: "HOME",
      note: "Keeps the knees bent to make the movement more manageable.",
    },
    {
      name: "Captain's Chair Knee Raise",
      location: "GYM",
      note: "Supported knee-raise variation that targets the abdominal muscles.",
    },
  ],

  "Side Plank": [
    {
      name: "Knee Side Plank",
      location: "HOME",
      note: "Keeps the side-plank position while reducing the load.",
    },
    {
      name: "Side-Lying Leg Raise",
      location: "HOME",
      note: "Targets the side body and hip while removing the plank hold.",
    },
    {
      name: "Pallof Press",
      location: "GYM",
      note: "Anti-rotation movement that challenges the obliques and core.",
    },
  ],
};

/*
 * Expand the swap system so replacement exercises can also
 * be swapped again.
 *
 * Example:
 *
 * Dead Bug
 * → Heel Taps
 * → Bird Dog
 * → Marching Dead Bug
 * → Dead Bug
 *
 * This keeps the swap button available after every replacement.
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
    name: "Dead Bug",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "30 SEC REST",
    cue: "Keep your lower back gently pressed into the floor and move slowly as you extend the opposite arm and leg.",
    modification: "Move only your legs or shorten the range of motion.",
    home: "Dead Bug — 3 sets × 8–10 / side",
    gym: "Dead Bug — 3 sets × 8–10 / side",
  },

  {
    number: "02",
    name: "Plank",
    prescription: "3 SETS × 30–45 SEC",
    rest: "45 SEC REST",
    cue: "Stack your shoulders over your elbows, squeeze your glutes, and keep your body in one strong line.",
    modification: "Drop your knees to the floor or shorten the hold.",
    home: "Forearm Plank — 3 sets × 30–45 sec",
    gym: "Forearm Plank — 3 sets × 30–45 sec",
  },

  {
    number: "03",
    name: "Bird Dog",
    prescription: "3 SETS × 8 / SIDE",
    rest: "30 SEC REST",
    cue: "Reach long through the opposite arm and leg while keeping your hips square and your core braced.",
    modification: "Move only one limb at a time until you feel stable.",
    home: "Bird Dog — 3 sets × 8 / side",
    gym: "Bird Dog — 3 sets × 8 / side",
  },

  {
    number: "04",
    name: "Core Press",
    prescription: "3 SETS × 10 / SIDE",
    rest: "45 SEC REST",
    cue: "Keep your ribs stacked over your hips and resist rotation as you press your hands straight away from your chest.",
    modification: "Use lighter resistance or hold the press for less time.",
    home: "Banded Pallof Press — 3 sets × 10 / side",
    gym: "Cable Pallof Press — 3 sets × 10 / side",
  },

  {
    number: "05",
    name: "Reverse Crunch",
    prescription: "3 SETS × 10–12 REPS",
    rest: "45 SEC REST",
    cue: "Use your abs to gently curl your hips off the floor instead of swinging your legs for momentum.",
    modification: "Keep your knees bent and use a smaller range of motion.",
    home: "Reverse Crunch — 3 sets × 10–12 reps",
    gym: "Bench Reverse Crunch — 3 sets × 10–12 reps",
  },

  {
    number: "06",
    name: "Side Plank",
    prescription: "3 SETS × 20–30 SEC / SIDE",
    rest: "30 SEC REST",
    cue: "Keep your shoulder stacked, lift through your bottom waist, and keep your hips from rotating forward.",
    modification: "Keep your bottom knee on the floor for support.",
    home: "Side Plank — 3 sets × 20–30 sec / side",
    gym: "Side Plank — 3 sets × 20–30 sec / side",
  },
];

const warmup = [
  "Cat-cow — 6 slow reps",
  "Pelvic tilts — 10 reps",
  "Bird dog reach — 6 / side",
  "Bodyweight march — 30 sec",
];

const cooldown = [
  "Child's pose — 30 sec",
  "Cobra or gentle abdominal stretch — 20–30 sec",
  "Supine spinal twist — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function CoreControlPage() {
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
                  CORE • BEGINNER
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Core{" "}
                  <span className="italic text-[#A77B73]">
                    Control.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build core strength and stability through slow,
                  controlled movement and intentional bracing.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                strength from the centre. ♡
              </p>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-2 border-t border-[#E1D3CE] sm:grid-cols-4">
              <div className="border-b border-r border-[#E1D3CE] py-4 pr-3 sm:border-b-0">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  TIME
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  20 min
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
                  Core + stability
                </p>
              </div>

              <div className="py-4 pl-4">
                <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  EQUIPMENT
                </p>

                <p className="mt-1.5 font-serif text-lg">
                  Mat + optional band
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
                  Connect with your core and prepare your trunk to
                  move with control.
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
                Move slowly and focus on control. Choose the setup
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
                  Release the tension and give your body a few quiet
                  minutes before moving on.
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
              CORE CONTROL
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