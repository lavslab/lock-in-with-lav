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
      { name: "Goblet Squat", location: "BOTH", note: "Same squat pattern with a simpler setup." },
      { name: "Leg Press", location: "GYM", note: "Stable option for loading the quads and glutes." },
      { name: "Dumbbell Squat", location: "BOTH", note: "Easy swap when a barbell is not available." },
      { name: "Split Squat", location: "BOTH", note: "Single-leg option that still trains quads and glutes." },
    ],
  },
  {
    name: "Romanian Deadlift",
    muscle: "Hamstrings + Glutes",
    movement: "Hinge",
    location: "both",
    swaps: [
      { name: "Dumbbell RDL", location: "BOTH", note: "Keeps the same hip-hinge pattern." },
      { name: "Cable Pull-Through", location: "GYM", note: "Hip-dominant option with less loading in the hands." },
      { name: "Good Morning", location: "BOTH", note: "Another hinge pattern for hamstrings and glutes." },
      { name: "Single-Leg RDL", location: "BOTH", note: "Adds unilateral work and balance." },
    ],
  },
  {
    name: "Hip Thrust",
    muscle: "Glutes",
    movement: "Hip Extension",
    location: "both",
    swaps: [
      { name: "Glute Bridge", location: "BOTH", note: "Simple floor-based hip-extension swap." },
      { name: "Dumbbell Hip Thrust", location: "BOTH", note: "Same pattern with easier equipment." },
      { name: "Cable Pull-Through", location: "GYM", note: "Trains hip extension from a standing position." },
      { name: "Frog Pump", location: "HOME", note: "Low-equipment glute-focused option." },
    ],
  },
  {
    name: "Lat Pulldown",
    muscle: "Back + Biceps",
    movement: "Vertical Pull",
    location: "gym",
    swaps: [
      { name: "Assisted Pull-Up", location: "GYM", note: "Same vertical pulling pattern." },
      { name: "Band Pulldown", location: "HOME", note: "Home-friendly vertical pull with a resistance band." },
      { name: "Pull-Up", location: "BOTH", note: "Bodyweight vertical pull when appropriate." },
      { name: "Single-Arm Cable Pulldown", location: "GYM", note: "Lets you train each side independently." },
    ],
  },
  {
    name: "Seated Cable Row",
    muscle: "Back + Biceps",
    movement: "Horizontal Pull",
    location: "gym",
    swaps: [
      { name: "One-Arm Dumbbell Row", location: "BOTH", note: "Simple horizontal pull with minimal equipment." },
      { name: "Chest-Supported Row", location: "GYM", note: "Stable row option with torso support." },
      { name: "Band Row", location: "HOME", note: "Home-friendly horizontal pulling option." },
      { name: "Machine Row", location: "GYM", note: "Guided alternative with a similar movement pattern." },
    ],
  },
  {
    name: "Bench Press",
    muscle: "Chest + Triceps",
    movement: "Horizontal Push",
    location: "gym",
    swaps: [
      { name: "Dumbbell Bench Press", location: "BOTH", note: "Same pressing pattern with independent arms." },
      { name: "Push-Up", location: "BOTH", note: "Bodyweight horizontal push that is easy to scale." },
      { name: "Machine Chest Press", location: "GYM", note: "Stable guided pressing option." },
      { name: "Floor Press", location: "HOME", note: "Dumbbell press that does not require a bench." },
    ],
  },
  {
    name: "Shoulder Press",
    muscle: "Shoulders + Triceps",
    movement: "Vertical Push",
    location: "both",
    swaps: [
      { name: "Dumbbell Shoulder Press", location: "BOTH", note: "Straightforward overhead pressing alternative." },
      { name: "Machine Shoulder Press", location: "GYM", note: "More supported vertical pressing option." },
      { name: "Arnold Press", location: "BOTH", note: "Dumbbell variation with a longer movement path." },
      { name: "Landmine Press", location: "GYM", note: "Angled pressing option if overhead work feels awkward." },
    ],
  },
  {
    name: "Walking Lunge",
    muscle: "Quads + Glutes",
    movement: "Lunge",
    location: "both",
    swaps: [
      { name: "Reverse Lunge", location: "BOTH", note: "Stationary alternative with the same major muscle groups." },
      { name: "Split Squat", location: "BOTH", note: "Removes the stepping component." },
      { name: "Step-Up", location: "BOTH", note: "Single-leg option using a box, step or bench." },
      { name: "Leg Press", location: "GYM", note: "Stable bilateral alternative for lower-body loading." },
    ],
  },
];

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
      if (savedName) setFirstName(savedName);
      else if (user.email) setFirstName(user.email.split("@")[0]);

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
    exercises.find((exercise) => exercise.name === selectedName) ?? exercises[0];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                there&apos;s always another way. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/tools"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[11px] tracking-[0.18em] transition hover:bg-[#EAD8D3]"
            >
              ← TOOLS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <p className="text-[11px] tracking-[0.32em] text-[#DDB5AE]">
              TOOLS • TRAIN
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Exercise Swap
              <span className="block italic text-[#DDB5AE]">
                switch it up. ♡
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-[#CFC1BC]">
              Pick the exercise you want to replace and find alternatives that
              train a similar movement pattern and muscle group.
            </p>
          </section>

          <section className="py-10">
            <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
                <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                  FIND AN EXERCISE
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  What are we{" "}
                  <span className="italic text-[#A77B73]">swapping?</span>
                </h2>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exercise or muscle..."
                  className="mt-6 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3.5 text-[16px] outline-none placeholder:text-[#AA9690] focus:border-[#A77B73]"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {(["all", "gym", "home"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLocation(option)}
                      className={`rounded-full border px-4 py-2.5 text-[11px] tracking-[0.16em] transition ${
                        location === option
                          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                          : "border-[#D6C3BD] text-[#8F655E]"
                      }`}
                    >
                      {option.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="mt-6 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => (
                      <button
                        key={exercise.name}
                        type="button"
                        onClick={() => setSelectedName(exercise.name)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected.name === exercise.name
                            ? "border-[#A77B73] bg-[#EAD8D3]"
                            : "border-[#DED0CB] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                        }`}
                      >
                        <span className="block font-serif text-xl">
                          {exercise.name}
                        </span>
                        <span className="mt-1 block text-[13px] tracking-[0.08em] text-[#806E68]">
                          {exercise.muscle} • {exercise.movement}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[#DED0CB] p-5">
                      <p className="font-serif text-xl italic text-[#A77B73]">
                        no match yet. ♡
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-[#806E68]">
                        Try searching by movement or muscle group.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
                <p className="text-[11px] tracking-[0.28em] text-[#8F655E]">
                  SWAP {selected.name.toUpperCase()}
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Try one of{" "}
                  <span className="italic text-[#A77B73]">these instead.</span>
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#CBA9A2] px-3 py-2 text-[11px] tracking-[0.12em] text-[#8F655E]">
                    {selected.muscle.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-[#CBA9A2] px-3 py-2 text-[11px] tracking-[0.12em] text-[#8F655E]">
                    {selected.movement.toUpperCase()}
                  </span>
                </div>

                <div className="mt-7 space-y-3">
                  {selected.swaps.map((swap, index) => (
                    <article
                      key={swap.name}
                      className="rounded-[1.5rem] border border-[#D5BBB5] bg-[#FBF8F6] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] tracking-[0.18em] text-[#9D6F67]">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-2 font-serif text-2xl">
                            {swap.name}
                          </h3>
                        </div>

                        <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#8F655E]">
                          {swap.location}
                        </span>
                      </div>

                      <p className="mt-3 text-[15px] leading-6 text-[#6F5F59]">
                        {swap.note}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                QUICK RULE
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Swap the exercise,{" "}
                <span className="italic text-[#A77B73]">keep the purpose.</span>
              </h2>
              <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#6F5F59]">
                A good swap usually keeps the same general movement pattern and
                target muscles. Choose the version that fits your equipment,
                experience and comfort.
              </p>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              different exercise. same intention. ♡
            </p>

            <Link
              href="/dashboard/resources/tools"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[11px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              BACK TO TOOLS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
