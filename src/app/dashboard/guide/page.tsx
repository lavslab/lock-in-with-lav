"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const trainingWeek = [
  [
    "01",
    "LOWER BODY",
    "Glutes + Quads",
    "Lower Body Foundation",
    "/dashboard/resources/workouts/lower-body-foundation",
  ],
  [
    "02",
    "UPPER BODY",
    "Back + Arms + Posture",
    "Upper Body Build",
    "/dashboard/resources/workouts/upper-body-build",
  ],
  [
    "03",
    "CORE + MOBILITY",
    "Control + Stability",
    "Core Control",
    "/dashboard/resources/workouts/core-control",
  ],
  [
    "04",
    "GLUTES",
    "Build + Strength",
    "Glute Builder",
    "/dashboard/resources/workouts/glute-builder",
  ],
  [
    "05",
    "FULL BODY",
    "Upper + Core",
    "Full Body Reset",
    "/dashboard/resources/workouts/full-body-reset",
  ],
  [
    "06",
    "CONDITIONING",
    "Low Impact + Cardio",
    "Cardio Lock In",
    "/dashboard/resources/workouts/cardio-lock-in",
  ],
  [
    "07",
    "RECOVER",
    "Mobility + Walking",
    null,
    null,
  ],
];

const trainingLevels = [
  {
    number: "01",
    title: "FOUNDATION",
    tagline: "learn it.",
    text: "Learn the movement and focus on control.",
  },
  {
    number: "02",
    title: "BUILD",
    tagline: "build it.",
    text: "Add resistance and build your strength.",
  },
  {
    number: "03",
    title: "LOCKED IN",
    tagline: "challenge it.",
    text: "Progress when your body is ready for more.",
  },
];

const basics = [
  {
    number: "01",
    title: "CORE + CONTROL",
    tagline: "control before intensity.",
    text: "Slow things down. Connect your breath to your core and learn to control the movement before adding more weight, reps or intensity.",
  },
  {
    number: "02",
    title: "NOURISH",
    tagline: "support the work.",
    text: "Prioritize protein, plants, fiber and hydration. Build balanced meals that support your energy instead of chasing perfection.",
  },
  {
    number: "03",
    title: "RECOVER",
    tagline: "listen before you push.",
    text: "Walking, mobility, stretching and rest all count. Recovery is part of building a routine you can actually keep.",
  },
];

export default function GuidePage() {
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

  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="flex flex-1 items-center justify-center px-6 py-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#DDB5AE] bg-[#FBF8F6] font-serif text-2xl text-[#A77B73]">
                ♡
              </div>

              <p className="mt-6 text-[10px] tracking-[0.35em] text-[#9D6F67]">
                LOCKING IN
              </p>

              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                loading your guide... ♡
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                THE GUIDE
              </p>

              <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-6xl">
                The Lock In
                <span className="block italic text-[#A77B73]">
                  Method.
                </span>
              </h1>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[10px] tracking-[0.22em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* INTRO */}

          <section className="mt-9 border-y border-[#DED0CB] py-6">
            <div className="grid gap-4 md:grid-cols-[0.55fr_1.45fr] md:items-center">
              <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                START WHERE YOU ARE
              </p>

              <div>
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  Not perfection. Practice. ♡
                </p>

                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#806E68]">
                  Build strength, take care of your body and create a routine
                  you can keep coming back to.
                </p>
              </div>
            </div>
          </section>

          {/* 01 — TRAINING SCHEDULE */}

          <section className="py-10">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                  01 · YOUR TRAINING WEEK
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Your weekly
                  <span className="italic text-[#A77B73]">
                    {" "}
                    schedule.
                  </span>
                </h2>
              </div>

              <p className="max-w-md text-[12px] leading-5 text-[#806E68] md:text-right">
                A balanced week of strength, core work, conditioning and
                recovery.
              </p>
            </div>

            <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {trainingWeek.map(
                (
                  [day, title, focus, workout, workoutHref],
                  index
                ) => (
                  <div
                    key={day}
                    className={`grid gap-3 px-5 py-4 sm:grid-cols-[48px_1fr_auto] sm:items-center sm:gap-4 md:px-7 ${
                      index !== 0
                        ? "border-t border-[#E1D3CE]"
                        : ""
                    } ${
                      day === "07"
                        ? "bg-[#EAD8D3]/50"
                        : ""
                    }`}
                  >
                    <span className="font-serif text-xl text-[#B48A82]">
                      {day}
                    </span>

                    <p className="text-[10px] tracking-[0.16em]">
                      {title}
                    </p>

                    <div className="text-left sm:text-right">
                      <p className="font-serif text-base italic text-[#A77B73]">
                        {focus}
                      </p>

                      {workout && workoutHref ? (
                        <Link
                          href={workoutHref}
                          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] px-3 py-1.5 text-[7px] tracking-[0.16em] text-[#8F655E] transition hover:bg-[#EAD8D3] hover:text-[#211C19]"
                        >
                          {workout.toUpperCase()}
                          <span className="font-serif text-sm">
                            →
                          </span>
                        </Link>
                      ) : (
                        <p className="mt-2 text-[7px] tracking-[0.16em] text-[#9D6F67]">
                          REST • WALK • MOBILITY
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-4 flex items-start gap-3 px-1">
              <span className="font-serif italic text-[#A77B73]">
                ♡
              </span>

              <p className="max-w-2xl text-[11px] leading-5 text-[#927D76]">
                Use this as your rhythm, not a rulebook. Adjust when you need
                to and keep showing up.
              </p>
            </div>
          </section>

          {/* 02 — HOW TO TRAIN */}

          <section className="border-t border-[#DED0CB] py-10">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                02 · HOW TO TRAIN
              </p>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Learn it.
                <span className="italic text-[#A77B73]">
                  {" "}
                  Build it. Challenge it.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#806E68]">
                Start with the version you can control. Progress when you feel
                ready — not because you reached a certain day.
              </p>
            </div>

            <div className="mt-7 grid overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] md:grid-cols-3">
              {trainingLevels.map((level, index) => (
                <div
                  key={level.number}
                  className={`p-6 ${
                    index !== 0
                      ? "border-t border-[#E1D3CE] md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl text-[#D2B0A9]">
                      {level.number}
                    </span>

                    <span className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                      {level.title}
                    </span>
                  </div>

                  <p className="mt-5 font-serif text-xl italic text-[#A77B73]">
                    {level.tagline}
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                    {level.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 03 — THE BASICS */}

          <section className="border-t border-[#DED0CB] py-10">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                03 · THE BASICS
              </p>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Keep it
                <span className="italic text-[#A77B73]">
                  {" "}
                  simple.
                </span>
              </h2>
            </div>

            <div className="mt-7 divide-y divide-[#DED0CB] border-y border-[#DED0CB]">
              {basics.map((item) => (
                <div
                  key={item.number}
                  className="grid gap-4 py-6 md:grid-cols-[60px_0.7fr_1.3fr] md:items-start md:gap-6"
                >
                  <span className="font-serif text-2xl text-[#D2B0A9]">
                    {item.number}
                  </span>

                  <div>
                    <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                      {item.title}
                    </p>

                    <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                      {item.tagline}
                    </p>
                  </div>

                  <p className="max-w-xl text-[12px] leading-6 text-[#806E68]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* NOW GO USE IT */}

          <section className="border-t border-[#DED0CB] py-12">
            <div className="rounded-[1.75rem] bg-[#211C19] px-7 py-9 text-[#F7F1ED] md:px-10 md:py-10">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <p className="text-[9px] tracking-[0.32em] text-[#C8B5AF]">
                    YOU KNOW THE METHOD
                  </p>

                  <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                    Now go
                    <span className="italic text-[#DDB5AE]">
                      {" "}
                      use it. ♡
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl text-[12px] leading-6 text-[#C8B5AF]">
                    Head to Resources for your workouts, meal ideas, recovery
                    sessions and tools.
                  </p>
                </div>

                <Link
                  href="/dashboard/resources"
                  className="w-fit shrink-0 rounded-full bg-[#EAD8D3] px-7 py-3.5 text-[10px] tracking-[0.2em] text-[#211C19] transition hover:-translate-y-0.5"
                >
                  EXPLORE RESOURCES →
                </Link>
              </div>

              <div className="mt-8 border-t border-[#493D39] pt-5">
                <p className="font-serif text-lg italic text-[#DDB5AE]">
                  Missed a day? Come back tomorrow.
                </p>

                <p className="mt-1 text-[9px] tracking-[0.18em] text-[#AFA09B]">
                  NO PUNISHMENT • NO PRESSURE • JUST RETURN
                </p>
              </div>
            </div>
          </section>

          {/* SAFETY NOTE */}

          <section className="border-t border-[#DED0CB] py-7">
            <div className="grid gap-4 md:grid-cols-[0.45fr_1.55fr] md:gap-10">
              <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                A NOTE ABOUT YOUR BODY
              </p>

              <p className="text-[11px] leading-5 text-[#927D76]">
                Lock In With Lav provides general fitness and wellness
                education, not individualized medical care or rehabilitation.
                If you&apos;re postpartum, returning after injury,
                experiencing pain, pelvic floor symptoms, abdominal doming or
                coning, or think you may have diastasis recti, consider
                speaking with a qualified healthcare professional or pelvic
                floor physiotherapist before progressing.
              </p>
            </div>
          </section>

          <div className="border-t border-[#DED0CB] py-9 text-center">
            <p className="font-serif text-xl italic text-[#A77B73]">
              just keep showing up. ♡
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}