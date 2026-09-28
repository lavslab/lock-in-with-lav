"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type Location = "all" | "gym" | "home";

type Exercise = {
  name: string;
  muscle: string;
  movement: string;
  location: "gym" | "home" | "both";
  swaps: {
    name: string;
    location: "GYM" | "HOME" | "BOTH";
    note: string;
  }[];
};

const exercises: Exercise[] = [
  {
    name: "Barbell Back Squat",
    muscle: "Quads + Glutes",
    movement: "Squat",
    location: "gym",
    swaps: [
      {
        name: "Goblet Squat",
        location: "BOTH",
        note: "Same squat pattern with a simpler setup.",
      },
      {
        name: "Leg Press",
        location: "GYM",
        note: "Stable option for loading the quads and glutes.",
      },
      {
        name: "Dumbbell Squat",
        location: "BOTH",
        note: "Easy swap when a barbell is not available.",
      },
      {
        name: "Split Squat",
        location: "BOTH",
        note: "Single-leg option that still trains quads and glutes.",
      },
    ],
  },
  {
    name: "Romanian Deadlift",
    muscle: "Hamstrings + Glutes",
    movement: "Hinge",
    location: "both",
    swaps: [
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
  },
  {
    name: "Hip Thrust",
    muscle: "Glutes",
    movement: "Hip Extension",
    location: "both",
    swaps: [
      {
        name: "Glute Bridge",
        location: "BOTH",
        note: "Simple floor-based hip-extension swap.",
      },
      {
        name: "Dumbbell Hip Thrust",
        location: "BOTH",
        note: "Same pattern with easier equipment.",
      },
      {
        name: "Cable Pull-Through",
        location: "GYM",
        note: "Trains hip extension from a standing position.",
      },
      {
        name: "Frog Pump",
        location: "HOME",
        note: "Low-equipment glute-focused option.",
      },
    ],
  },
  {
    name: "Lat Pulldown",
    muscle: "Back + Biceps",
    movement: "Vertical Pull",
    location: "gym",
    swaps: [
      {
        name: "Assisted Pull-Up",
        location: "GYM",
        note: "Same vertical pulling pattern.",
      },
      {
        name: "Band Pulldown",
        location: "HOME",
        note: "Home-friendly vertical pull with a resistance band.",
      },
      {
        name: "Pull-Up",
        location: "BOTH",
        note: "Bodyweight vertical pull when appropriate.",
      },
      {
        name: "Single-Arm Cable Pulldown",
        location: "GYM",
        note: "Lets you train each side independently.",
      },
    ],
  },
  {
    name: "Seated Cable Row",
    muscle: "Back + Biceps",
    movement: "Horizontal Pull",
    location: "gym",
    swaps: [
      {
        name: "One-Arm Dumbbell Row",
        location: "BOTH",
        note: "Simple horizontal pull with minimal equipment.",
      },
      {
        name: "Chest-Supported Row",
        location: "GYM",
        note: "Stable row option with torso support.",
      },
      {
        name: "Band Row",
        location: "HOME",
        note: "Home-friendly horizontal pulling option.",
      },
      {
        name: "Machine Row",
        location: "GYM",
        note: "Guided alternative with a similar movement pattern.",
      },
    ],
  },
  {
    name: "Bench Press",
    muscle: "Chest + Triceps",
    movement: "Horizontal Push",
    location: "gym",
    swaps: [
      {
        name: "Dumbbell Bench Press",
        location: "BOTH",
        note: "Same pressing pattern with independent arms.",
      },
      {
        name: "Push-Up",
        location: "BOTH",
        note: "Bodyweight horizontal push that is easy to scale.",
      },
      {
        name: "Machine Chest Press",
        location: "GYM",
        note: "Stable guided pressing option.",
      },
      {
        name: "Floor Press",
        location: "HOME",
        note: "Dumbbell press that does not require a bench.",
      },
    ],
  },
  {
    name: "Shoulder Press",
    muscle: "Shoulders + Triceps",
    movement: "Vertical Push",
    location: "both",
    swaps: [
      {
        name: "Dumbbell Shoulder Press",
        location: "BOTH",
        note: "Straightforward overhead pressing alternative.",
      },
      {
        name: "Machine Shoulder Press",
        location: "GYM",
        note: "More supported vertical pressing option.",
      },
      {
        name: "Arnold Press",
        location: "BOTH",
        note: "Dumbbell variation with a longer movement path.",
      },
      {
        name: "Landmine Press",
        location: "GYM",
        note: "Angled pressing option if overhead work feels awkward.",
      },
    ],
  },
  {
    name: "Walking Lunge",
    muscle: "Quads + Glutes",
    movement: "Lunge",
    location: "both",
    swaps: [
      {
        name: "Reverse Lunge",
        location: "BOTH",
        note: "Stationary alternative with the same major muscle groups.",
      },
      {
        name: "Split Squat",
        location: "BOTH",
        note: "Removes the stepping component.",
      },
      {
        name: "Step-Up",
        location: "BOTH",
        note: "Single-leg option using a box, step or bench.",
      },
      {
        name: "Leg Press",
        location: "GYM",
        note: "Stable bilateral alternative for lower-body loading.",
      },
    ],
  },
];

function SwapIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 8h12" />
      <path d="m14 5 3 3-3 3" />
      <path d="M19 16H7" />
      <path d="m10 13-3 3 3 3" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default function ExerciseSwapPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<Location>("all");
  const [selectedName, setSelectedName] = useState(exercises[0].name);

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

  const filteredExercises = useMemo(() => {
    const term = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesSearch =
        !term ||
        exercise.name.toLowerCase().includes(term) ||
        exercise.muscle.toLowerCase().includes(term) ||
        exercise.movement.toLowerCase().includes(term);

      const matchesLocation =
        location === "all" ||
        exercise.location === "both" ||
        exercise.location === location;

      return matchesSearch && matchesLocation;
    });
  }, [search, location]);

  const selected =
    exercises.find((exercise) => exercise.name === selectedName) ??
    exercises[0];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                there&apos;s always another way. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/tools"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[9px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← TOOLS
            </Link>
          </header>

          {/* INTRO */}
          <section className="border-b border-[#DED0CB] pb-9 pt-10 md:pb-11 md:pt-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAD8D3] text-[#9D6F67]">
                    <SwapIcon className="h-5 w-5" />
                  </div>

                  <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                    TRAINING TOOL
                  </p>
                </div>

                <h1 className="mt-5 font-serif text-4xl leading-[0.95] md:text-5xl">
                  Exercise Swap.
                  <span className="mt-1 block italic text-[#A77B73]">
                    keep the purpose. change the move. ♡
                  </span>
                </h1>
              </div>

              <div className="max-w-xl lg:justify-self-end">
                <p className="text-[15px] leading-6 text-[#6F5F59]">
                  Find an alternative that trains a similar movement
                  pattern and muscle group when an exercise doesn&apos;t
                  work for you.
                </p>

                <p className="mt-4 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                  FIND YOUR EXERCISE → CHOOSE A SWAP
                </p>
              </div>
            </div>
          </section>

          {/* SWAP FINDER */}
          <section className="py-9 md:py-11">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[9px] tracking-[0.28em] text-[#9D6F67]">
                  SWAP FINDER
                </p>

                <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                  What are we{" "}
                  <span className="italic text-[#A77B73]">
                    replacing? ♡
                  </span>
                </h2>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#927D76]">
                01 FIND • 02 SELECT • 03 SWAP
              </p>
            </div>

            <div className="grid overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] xl:grid-cols-[0.8fr_1.2fr]">
              {/* LEFT — FIND */}
              <div className="border-b border-[#DED0CB] p-6 md:p-7 xl:border-b-0 xl:border-r">
                <div className="flex items-start gap-4">
                  <span className="font-serif text-3xl text-[#D2B0A9]">
                    01
                  </span>

                  <div>
                    <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                      FIND
                    </p>

                    <h3 className="mt-1 font-serif text-2xl">
                      Choose your exercise.
                    </h3>
                  </div>
                </div>

                {/* SEARCH */}
                <div className="relative mt-6">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A77B73]" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search exercise, muscle or movement..."
                    className="w-full rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] py-3.5 pl-11 pr-4 text-[15px] outline-none transition placeholder:text-[#AA9690] focus:border-[#A77B73]"
                  />
                </div>

                {/* LOCATION */}
                <div className="mt-4">
                  <p className="mb-2 text-[8px] tracking-[0.18em] text-[#927D76]">
                    WHERE ARE YOU TRAINING?
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {(["all", "gym", "home"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLocation(option)}
                        className={`rounded-xl border px-3 py-3 text-[9px] tracking-[0.14em] transition ${
                          location === option
                            ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                            : "border-[#D6C3BD] bg-[#F7F1ED] text-[#8F655E] hover:border-[#CBA9A2]"
                        }`}
                      >
                        {option.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXERCISES */}
                <div className="mt-6 border-t border-[#E1D3CE]">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => {
                      const isSelected =
                        selected.name === exercise.name;

                      return (
                        <button
                          key={exercise.name}
                          type="button"
                          onClick={() =>
                            setSelectedName(exercise.name)
                          }
                          className={`group w-full border-b border-[#E1D3CE] py-4 text-left transition ${
                            isSelected
                              ? "text-[#211C19]"
                              : "text-[#6F5F59]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full transition ${
                                    isSelected
                                      ? "bg-[#A77B73]"
                                      : "border border-[#CBA9A2]"
                                  }`}
                                />

                                <p
                                  className={`font-serif text-lg ${
                                    isSelected
                                      ? "italic text-[#A77B73]"
                                      : ""
                                  }`}
                                >
                                  {exercise.name}
                                </p>
                              </div>

                              <p className="ml-4 mt-1 text-[9px] tracking-[0.1em] text-[#927D76]">
                                {exercise.muscle} •{" "}
                                {exercise.movement}
                              </p>
                            </div>

                            <span
                              className={`text-sm transition ${
                                isSelected
                                  ? "translate-x-0 text-[#A77B73]"
                                  : "text-[#C3AAA4] group-hover:translate-x-1"
                              }`}
                            >
                              →
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-7">
                      <p className="font-serif text-xl italic text-[#A77B73]">
                        no match yet. ♡
                      </p>

                      <p className="mt-2 text-[13px] leading-5 text-[#806E68]">
                        Try another exercise, muscle group or movement.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT — RESULTS */}
              <div className="bg-[#EAD8D3]/35 p-6 md:p-7 lg:p-8">
                <div className="flex flex-col justify-between gap-5 border-b border-[#D8C3BD] pb-6 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-3xl text-[#D2B0A9]">
                        02
                      </span>

                      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                        SWAP
                      </p>
                    </div>

                    <p className="mt-4 text-[8px] tracking-[0.2em] text-[#8F655E]">
                      REPLACING
                    </p>

                    <h3 className="mt-1 font-serif text-3xl md:text-4xl">
                      {selected.name}
                    </h3>

                    <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                      same intention. different option. ♡
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-[220px] sm:justify-end">
                    <span className="rounded-full border border-[#CBA9A2] px-3 py-2 text-[8px] tracking-[0.12em] text-[#8F655E]">
                      {selected.muscle.toUpperCase()}
                    </span>

                    <span className="rounded-full border border-[#CBA9A2] px-3 py-2 text-[8px] tracking-[0.12em] text-[#8F655E]">
                      {selected.movement.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* SWAP LIST */}
                <div className="mt-2">
                  {selected.swaps.map((swap, index) => (
                    <article
                      key={swap.name}
                      className="grid gap-4 border-b border-[#D8C3BD] py-6 sm:grid-cols-[45px_1fr_auto] sm:items-start sm:gap-5"
                    >
                      <span className="font-serif text-xl italic text-[#C39A92]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h4 className="font-serif text-xl md:text-2xl">
                          {swap.name}
                        </h4>

                        <p className="mt-2 max-w-xl text-[13px] leading-5 text-[#6F5F59]">
                          {swap.note}
                        </p>
                      </div>

                      <span className="w-fit text-[8px] tracking-[0.16em] text-[#8F655E]">
                        {swap.location}
                      </span>
                    </article>
                  ))}
                </div>

                <div className="pt-6">
                  <p className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                    WHAT STAYS THE SAME?
                  </p>

                  <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#806E68]">
                    These options keep a similar training purpose while
                    giving you another setup, equipment choice or way to
                    perform the movement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK RULE */}
          <section className="border-y border-[#DED0CB] py-8 md:py-9">
            <div className="grid gap-6 md:grid-cols-[0.55fr_1.45fr] md:items-center">
              <div>
                <p className="text-[9px] tracking-[0.28em] text-[#9D6F67]">
                  QUICK RULE
                </p>

                <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                  keep the purpose. ♡
                </p>
              </div>

              <div className="md:border-l md:border-[#DED0CB] md:pl-8">
                <p className="max-w-3xl text-[14px] leading-6 text-[#6F5F59]">
                  A useful swap usually keeps the same general movement
                  pattern and target muscles. Choose the version that
                  fits your equipment, experience and comfort.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
                  <span className="text-[8px] tracking-[0.16em] text-[#927D76]">
                    SAME MUSCLES
                  </span>

                  <span className="text-[8px] tracking-[0.16em] text-[#927D76]">
                    SIMILAR MOVEMENT
                  </span>

                  <span className="text-[8px] tracking-[0.16em] text-[#927D76]">
                    BETTER FIT
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SAFETY */}
          <section className="py-7">
            <p className="max-w-4xl text-[11px] leading-5 text-[#8C7770]">
              Exercise swaps are general alternatives, not individualized
              medical advice. If a movement causes sharp pain, numbness,
              dizziness or worsening symptoms, stop and choose an
              appropriate alternative or seek professional guidance.
            </p>
          </section>

          {/* END */}
          <section className="pb-14 pt-3 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              different exercise. same intention. ♡
            </p>

            <Link
              href="/dashboard/resources/tools"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[9px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO TOOLS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}