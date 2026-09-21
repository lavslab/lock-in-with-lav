"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Bodyweight Squat",
    prescription: "3 SETS × 12 REPS",
    rest: "45 SEC REST",
    cue: "Brace your core, sit down between your hips, and keep your knees tracking in the same direction as your toes.",
    modification: "Squat to a chair or reduce your range of motion.",
  },
  {
    number: "02",
    name: "Incline Push-Up",
    prescription: "3 SETS × 8–10 REPS",
    rest: "45 SEC REST",
    cue: "Keep your body in one straight line and lower your chest toward the surface with your elbows angled slightly back.",
    modification: "Use a higher surface, such as a counter or sturdy table.",
  },
  {
    number: "03",
    name: "Alternating Reverse Lunge",
    prescription: "3 SETS × 8 / SIDE",
    rest: "45 SEC REST",
    cue: "Step back softly, lower with control, and drive through your front foot to return to standing.",
    modification: "Hold a wall or chair for balance, or use a smaller range of motion.",
  },
  {
    number: "04",
    name: "Glute Bridge",
    prescription: "3 SETS × 15 REPS",
    rest: "45 SEC REST",
    cue: "Press through your heels, keep your ribs down, and squeeze your glutes at the top without arching your lower back.",
    modification: "Reduce your range of motion or pause briefly between reps.",
  },
  {
    number: "05",
    name: "Bird Dog",
    prescription: "3 SETS × 8 / SIDE",
    rest: "30 SEC REST",
    cue: "Brace your core and reach the opposite arm and leg away from you while keeping your hips square to the floor.",
    modification: "Move only your arm or only your leg until you feel stable.",
  },
  {
    number: "06",
    name: "Low-Impact Mountain Climber",
    prescription: "3 SETS × 30 SEC",
    rest: "45 SEC REST",
    cue: "Keep your hands under your shoulders and step one knee forward at a time while keeping your core engaged.",
    modification: "Perform the movement with your hands elevated on a sturdy surface.",
  },
];

const warmup = [
  "March in place — 60 sec",
  "Arm circles — 10 each direction",
  "Bodyweight good mornings — 10 reps",
  "Alternating step-back lunges — 6 / side",
];

const cooldown = [
  "Standing quad stretch — 30 sec / side",
  "Chest + shoulder stretch — 30 sec / side",
  "Figure-four stretch — 30 sec / side",
  "Slow breathing — 60 sec",
];

export default function FullBodyResetPage() {
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
                  FULL BODY • HOME OR GYM • BEGINNER
                </p>

                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Full Body Reset
                </h1>

                <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  move everything. ♡
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["25", "MIN"],
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
                No equipment needed.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                FOCUS
              </p>
              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                Full body.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                INTENTION
              </p>
              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                Move with control.
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
                  Take a few minutes to raise your heart rate and prepare your
                  whole body to move.
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
                <span className="italic text-[#A77B73]">move everything. ♡</span>
              </h2>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#D6C3BD] bg-[#EAD8D3]/55 p-5 md:p-6">
              <p className="text-[10px] tracking-[0.22em] text-[#8F655E]">
                HOME OR GYM — YOUR CHOICE.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6F5F59]">
                This workout is intentionally equipment-free, so you can do the exact same session at home or at the gym.
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
