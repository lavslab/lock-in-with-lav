"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
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

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                workout library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/workouts"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.2em] transition hover:bg-[#EAD8D3]"
            >
              ← WORKOUTS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  CORE • HOME OR GYM • BEGINNER
                </p>

                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Core Control
                </h1>

                <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  strength from the centre. ♡
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["20", "MIN"],
                  ["06", "EXERCISES"],
                  ["03", "SETS"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="min-w-[82px] rounded-2xl border border-[#4A403B] px-4 py-4 text-center"
                  >
                    <p className="font-serif text-2xl text-[#F7F1ED]">{value}</p>
                    <p className="mt-1 text-[6px] tracking-[0.2em] text-[#BFAEAA]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 py-8 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                EQUIPMENT
              </p>
              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                Mat + optional band or cable.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                FOCUS
              </p>
              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                Core + stability.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                INTENTION
              </p>
              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                Control + brace.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                  BEFORE YOU START
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Warm up{" "}
                  <span className="italic text-[#9D6F67]">with intention.</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#806E68]">
                  Take a few minutes to connect with your core and prepare your
                  trunk to move with control.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {warmup.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#D0B5AF] bg-[#F1E2DE]/50 p-4"
                  >
                    <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 text-sm text-[#5F504B]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12">
            <div>
              <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                THE WORKOUT
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Six movements.{" "}
                <span className="italic text-[#A77B73]">strength from the centre. ♡</span>
              </h2>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#D6C3BD] bg-[#EAD8D3]/55 p-5 md:p-6">
              <p className="text-[10px] tracking-[0.22em] text-[#8F655E]">
                TRAINING AT HOME OR THE GYM?
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6F5F59]">
                Choose the version that matches where you&apos;re training today. Both options target the same movement pattern and workout goal.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {exercises.map((exercise) => (
                <article
                  key={exercise.number}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7"
                >
                  <div className="grid gap-6 lg:grid-cols-[80px_1fr_1fr] lg:items-start">
                    <span className="font-serif text-4xl text-[#D2B0A9]">
                      {exercise.number}
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                        EXERCISE
                      </p>
                      <h3 className="mt-2 font-serif text-2xl md:text-3xl">
                        {exercise.name}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#211C19] px-4 py-2 text-[10px] tracking-[0.12em] text-[#F7F1ED]">
                          {exercise.prescription}
                        </span>
                        <span className="rounded-full border border-[#D6C3BD] px-4 py-2 text-[10px] tracking-[0.12em] text-[#806E68]">
                          {exercise.rest}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#E1D3CE] bg-[#F7F1ED] p-3">
                          <p className="text-[9px] tracking-[0.2em] text-[#9D6F67]">HOME</p>
                          <p className="mt-1 text-sm leading-5 text-[#5F504B]">{exercise.home}</p>
                        </div>
                        <div className="rounded-xl border border-[#E1D3CE] bg-[#F7F1ED] p-3">
                          <p className="text-[9px] tracking-[0.2em] text-[#9D6F67]">GYM</p>
                          <p className="mt-1 text-sm leading-5 text-[#5F504B]">{exercise.gym}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-[#E1D3CE] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] text-[#9D6F67]">
                          FORM CUE
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6F5F59]">
                          {exercise.cue}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] tracking-[0.2em] text-[#9D6F67]">
                          MAKE IT EASIER
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6F5F59]">
                          {exercise.modification}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] px-7 py-8 md:px-9">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  FINISH HERE
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Cool down.{" "}
                  <span className="italic text-[#A77B73]">you did it. ♡</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#806E68]">
                  Give your body a few quiet minutes before moving on with your
                  day.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {cooldown.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#E1D3CE] p-4"
                  >
                    <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 text-sm text-[#5F504B]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-[2rem] bg-[#211C19] px-7 py-8 text-[#F7F1ED] md:px-9">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-[8px] tracking-[0.35em] text-[#DDB5AE]">
                    READY WHEN YOU ARE
                  </p>
                  <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                    One workout.{" "}
                    <span className="italic text-[#DDB5AE]">one promise kept.</span>
                  </h2>
                  <p className="mt-3 text-sm text-[#BFAEAA]">
                    Interactive workout mode is coming next.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-full border border-[#655650] px-7 py-3.5 text-[8px] tracking-[0.22em] text-[#9D8E88]"
                >
                  START WORKOUT — SOON
                </button>
              </div>
            </div>
          </section>

          <section className="pb-14 text-center">
            <Link
              href="/dashboard/resources/workouts"
              className="text-[8px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
            >
              ← BACK TO WORKOUT LIBRARY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
