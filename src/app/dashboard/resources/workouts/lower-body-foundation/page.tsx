"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Goblet Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Keep the weight close to your chest, brace your core, and sit down between your hips.",
    modification: "Use bodyweight or squat to a chair.",
    home: "Goblet Squat — 3 sets × 10–12 reps",
    gym: "Leg Press — 3 sets × 10–12 reps",
  },
  {
    number: "02",
    name: "Dumbbell Romanian Deadlift",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Push your hips back with soft knees and keep the dumbbells close to your legs.",
    modification: "Use lighter weights and shorten your range of motion.",
    home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
    gym: "Smith Machine Romanian Deadlift — 3 sets × 10–12 reps",
  },
  {
    number: "03",
    name: "Reverse Lunge",
    prescription: "3 SETS × 8–10 / SIDE",
    rest: "60 SEC REST",
    cue: "Step back with control and keep your front foot planted as you lower.",
    modification:
      "Hold onto a stable surface or perform stationary split squats.",
    home: "Dumbbell Reverse Lunge — 3 sets × 8–10 / side",
    gym: "Smith Machine Reverse Lunge — 3 sets × 8–10 / side",
  },
  {
    number: "04",
    name: "Glute Bridge",
    prescription: "3 SETS × 12–15 REPS",
    rest: "45 SEC REST",
    cue: "Drive through your heels and squeeze your glutes at the top without overextending your back.",
    modification: "Use bodyweight and reduce the range if needed.",
    home: "Dumbbell Glute Bridge — 3 sets × 12–15 reps",
    gym: "Hip Thrust Machine — 3 sets × 12–15 reps",
  },
  {
    number: "05",
    name: "Dumbbell Sumo Squat",
    prescription: "3 SETS × 10–12 REPS",
    rest: "60 SEC REST",
    cue: "Take a comfortable wide stance, track your knees with your toes, and stay tall through your chest.",
    modification: "Perform the movement without weight.",
    home: "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
    gym: "Hack Squat or Leg Press — 3 sets × 10–12 reps",
  },
  {
    number: "06",
    name: "Standing Calf Raise",
    prescription: "3 SETS × 15 REPS",
    rest: "45 SEC REST",
    cue: "Rise slowly onto the balls of your feet, pause at the top, and lower with control.",
    modification: "Hold a wall or chair for balance.",
    home: "Standing Calf Raise — 3 sets × 15 reps",
    gym: "Calf Raise Machine — 3 sets × 15 reps",
  },
];

const warmup = [
  "Bodyweight squats — 10 reps",
  "Hip hinges — 10 reps",
  "Alternating reverse lunges — 6 / side",
  "Glute bridges — 10 reps",
];

const cooldown = [
  "Quad stretch — 30 sec / side",
  "Hamstring stretch — 30 sec / side",
  "Figure-four stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function LowerBodyFoundationPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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
                  LOWER BODY • BEGINNER
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                  Lower Body{" "}
                  <span className="italic text-[#A77B73]">
                    Foundation.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                  Build strength through your legs and glutes with
                  controlled, beginner-friendly movement.
                </p>
              </div>

              <p className="font-serif text-xl italic text-[#A77B73]">
                build the base. ♡
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
                  Legs + glutes
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
                  Move through each once before starting.
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
                Work through each movement in order. Choose the
                setup that fits where you&apos;re training today.
              </p>
            </div>

            {/* ONE WORKOUT CARD */}
            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {exercises.map((exercise, index) => (
                <article
                  key={exercise.number}
                  className={`px-4 py-6 sm:px-6 ${
                    index !== exercises.length - 1
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
                  Take a few minutes before moving on.
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
              LOWER BODY FOUNDATION
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