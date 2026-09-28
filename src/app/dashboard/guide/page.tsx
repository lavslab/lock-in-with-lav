"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const phases = [
  {
    number: "01",
    days: "DAYS 01 — 25",
    name: "FOUNDATION",
    tagline: "learn your body.",
    points: [
      "Core + breathing",
      "Movement control",
      "Strength basics",
      "Mobility + stability",
    ],
  },
  {
    number: "02",
    days: "DAYS 26 — 50",
    name: "BUILD",
    tagline: "build your strength.",
    points: [
      "Progressive strength",
      "Core stability",
      "Glutes",
      "Back + upper body",
    ],
  },
  {
    number: "03",
    days: "DAYS 51 — 75",
    name: "LOCKED IN",
    tagline: "trust what you built.",
    points: [
      "Stronger variations",
      "Progression",
      "Full-body strength",
      "Core control",
    ],
  },
];

const trainingWeek = [
  ["01", "LOWER BODY", "Glutes + Quads"],
  ["02", "UPPER BODY", "Back + Arms + Posture"],
  ["03", "CORE + MOBILITY", "Control + Stability"],
  ["04", "LOWER BODY", "Glutes + Hamstrings"],
  ["05", "FULL BODY", "Upper + Core"],
  ["06", "CONDITIONING", "Low Impact + Core"],
  ["07", "RECOVER", "Mobility + Walking"],
];

const nourishment = [
  "Prioritize protein",
  "Add plants + fiber",
  "Stay hydrated",
  "Build balanced meals",
  "Consistency over restriction",
];

export default function GuidePage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Could not load challenge start date:", profileError);
      } else {
        setChallengeStartDate(profile?.challenge_start_date ?? null);
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const currentDay = (() => {
    if (!challengeStartDate) return 1;

    const [year, month, day] = challengeStartDate.split("-").map(Number);
    const start = new Date(year, month - 1, day);
    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const elapsed =
      Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;

    return Math.min(75, Math.max(1, elapsed));
  })();

  const currentPhaseNumber =
    currentDay <= 25 ? "01" : currentDay <= 50 ? "02" : "03";

  const currentPhase =
    phases.find((phase) => phase.number === currentPhaseNumber) ?? phases[0];

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
                <span className="block italic text-[#A77B73]">Method.</span>
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
          <section className="mt-10 grid gap-6 border-y border-[#DED0CB] py-7 md:grid-cols-[0.65fr_1.35fr] md:items-center">
            <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
              START WHERE YOU ARE
            </p>

            <div>
              <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                Not perfection. Practice. ♡
              </p>

              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#806E68]">
                Build your routine, get stronger and keep showing up — one day
                at a time.
              </p>
            </div>
          </section>

          {/* 01 — THE METHOD */}
          <section className="py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                  01 · THE METHOD
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Three phases.
                  <span className="italic text-[#A77B73]"> One journey.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                build as you go. ♡
              </p>
            </div>

            {/* CURRENT POSITION */}
            <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-[#D6BDB6] bg-[#EAD8D3] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] tracking-[0.30em] text-[#8F655E]">
                  YOU ARE HERE
                </p>

                <p className="mt-2 font-serif text-2xl italic text-[#8F655E]">
                  Phase {currentPhase.number} ·{" "}
                  {currentPhase.name.toLowerCase()}. ♡
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#211C19] px-5 py-2.5 text-[10px] tracking-[0.20em] text-[#F7F1ED]">
                DAY {String(currentDay).padStart(2, "0")} / 75
              </span>
            </div>

            {/* PHASES */}
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {phases.map((phase) => {
                const isCurrent = phase.number === currentPhaseNumber;

                return (
                  <article
                    key={phase.number}
                    className={`rounded-[1.75rem] p-6 ${
                      isCurrent
                        ? "bg-[#211C19] text-[#F7F1ED]"
                        : "border border-[#DED0CB] bg-[#FBF8F6]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`font-serif text-4xl ${
                          isCurrent ? "text-[#DDB5AE]" : "text-[#D2B0A9]"
                        }`}
                      >
                        {phase.number}
                      </span>

                      <span
                        className={`text-[8px] tracking-[0.18em] ${
                          isCurrent ? "text-[#C8B5AF]" : "text-[#9D6F67]"
                        }`}
                      >
                        {phase.days}
                      </span>
                    </div>

                    <p className="mt-6 text-[10px] tracking-[0.28em]">
                      {phase.name}
                    </p>

                    <h3
                      className={`mt-2 font-serif text-2xl italic ${
                        isCurrent ? "text-[#DDB5AE]" : "text-[#A77B73]"
                      }`}
                    >
                      {phase.tagline}
                    </h3>

                    <div
                      className={`mt-6 border-t pt-4 ${
                        isCurrent ? "border-[#493D39]" : "border-[#E1D3CE]"
                      }`}
                    >
                      {phase.points.map((point) => (
                        <div
                          key={point}
                          className="flex items-center gap-3 py-1.5"
                        >
                          <span
                            className={
                              isCurrent ? "text-[#DDB5AE]" : "text-[#A77B73]"
                            }
                          >
                            ♡
                          </span>

                          <p className="text-[10px] tracking-[0.10em]">
                            {point.toUpperCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 02 — TRAINING RHYTHM */}
          <section className="grid gap-8 border-t border-[#DED0CB] py-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                02 · YOUR TRAINING RHYTHM
              </p>

              <h2 className="mt-3 font-serif text-4xl leading-none md:text-5xl">
                Strong starts
                <span className="block italic text-[#A77B73]">
                  from the inside.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-[14px] leading-7 text-[#806E68]">
                Core, glutes, back and full-body strength — with control before
                intensity.
              </p>

              <div className="mt-7 rounded-[1.5rem] bg-[#EAD8D3] p-6">
                <p className="text-[9px] tracking-[0.28em] text-[#8F655E]">
                  THE GOAL
                </p>

                <p className="mt-3 font-serif text-2xl italic leading-snug">
                  Strong core. Strong glutes.
                  <br />
                  Strong back. Stronger you.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.30em] text-[#9D6F67]">
                    YOUR WEEK
                  </p>

                  <h3 className="mt-2 font-serif text-3xl">
                    A week of movement.
                  </h3>
                </div>

                <span className="font-serif text-xl italic text-[#A77B73]">
                  ♡
                </span>
              </div>

              <div className="mt-6">
                {trainingWeek.map(([day, title, focus]) => (
                  <div
                    key={day}
                    className="grid grid-cols-[38px_1fr] gap-x-3 gap-y-1 border-t border-[#E1D3CE] py-3.5 sm:grid-cols-[40px_1fr_auto] sm:items-center"
                  >
                    <span className="row-span-2 font-serif text-lg text-[#B48A82] sm:row-span-1">
                      {day}
                    </span>

                    <span className="text-[10px] tracking-[0.14em]">
                      {title}
                    </span>

                    <span className="text-[11px] text-[#927D76] sm:text-right">
                      {focus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 03 — PROGRESSION */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-12">
              <div>
                <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                  03 · HOW TO PROGRESS
                </p>

                <h2 className="mt-3 font-serif text-4xl leading-none md:text-5xl">
                  Your level.
                  <span className="block italic text-[#A77B73]">
                    Your progress.
                  </span>
                </h2>
              </div>

              <p className="max-w-xl text-[14px] leading-7 text-[#806E68]">
                Pick the version that feels controlled. Build from there and
                progress when you&apos;re ready.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
                <span className="font-serif text-3xl text-[#D2B0A9]">01</span>

                <p className="mt-5 text-[9px] tracking-[0.25em] text-[#9D6F67]">
                  START HERE
                </p>

                <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                  learn it.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#D6BDB6] bg-[#EAD8D3] p-6">
                <span className="font-serif text-3xl text-[#A77B73]">02</span>

                <p className="mt-5 text-[9px] tracking-[0.25em] text-[#8F655E]">
                  LOCKED IN
                </p>

                <p className="mt-2 font-serif text-2xl italic text-[#8F655E]">
                  build it.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
                <span className="font-serif text-3xl text-[#D2B0A9]">03</span>

                <p className="mt-5 text-[9px] tracking-[0.25em] text-[#9D6F67]">
                  LEVEL UP
                </p>

                <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                  challenge it.
                </p>
              </div>
            </div>
          </section>

          {/* 04 — NOURISH + RECOVER */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="mb-8">
              <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
                04 · NOURISH + RECOVER
              </p>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Support the
                <span className="italic text-[#A77B73]"> work.</span>
              </h2>
            </div>

            <div className="grid overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] lg:grid-cols-2">
              <div className="p-7 md:p-8">
                <p className="text-[9px] tracking-[0.30em] text-[#9D6F67]">
                  NOURISH
                </p>

                <h3 className="mt-3 font-serif text-3xl">
                  Keep it
                  <span className="italic text-[#A77B73]"> simple.</span>
                </h3>

                <div className="mt-6">
                  {nourishment.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-t border-[#E1D3CE] py-3"
                    >
                      <span className="text-[#9D6F67]">♡</span>

                      <p className="text-[10px] tracking-[0.10em]">
                        {item.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#EAD8D3] p-7 md:p-8">
                <p className="text-[9px] tracking-[0.30em] text-[#8F655E]">
                  RECOVER
                </p>

                <h3 className="mt-3 font-serif text-3xl italic text-[#8F655E]">
                  Listen before you push.
                </h3>

                <p className="mt-5 text-[14px] leading-7 text-[#6F5F59]">
                  Control comes before intensity. Recovery, mobility and rest
                  are part of the work too. Choose the version that feels
                  controlled and respect what your body is telling you.
                </p>

                <p className="mt-6 font-serif text-xl italic text-[#A77B73]">
                  stronger doesn&apos;t always mean harder. ♡
                </p>
              </div>
            </div>
          </section>

          {/* RESOURCES CTA */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-7 rounded-[1.75rem] border border-[#D6BDB6] bg-[#EAD8D3] p-7 md:flex-row md:items-center md:p-8">
              <div>
                <p className="text-[9px] tracking-[0.30em] text-[#8F655E]">
                  WHEN YOU NEED MORE
                </p>

                <p className="mt-3 max-w-xl font-serif text-2xl italic text-[#8F655E] md:text-3xl">
                  Need a workout, meal idea or a little support?
                </p>

                <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#806E68]">
                  Your Resources library is where the practical tools live.
                </p>
              </div>

              <Link
                href="/dashboard/resources"
                className="w-fit shrink-0 rounded-full bg-[#211C19] px-7 py-3.5 text-[10px] tracking-[0.20em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                EXPLORE RESOURCES →
              </Link>
            </div>
          </section>

          {/* 05 — REMEMBER THIS */}
          <section className="border-t border-[#DED0CB] py-14 text-center">
            <p className="text-[9px] tracking-[0.36em] text-[#9D6F67]">
              05 · REMEMBER THIS
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Missed a day?
            </h2>

            <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
              come back tomorrow. ♡
            </p>

            <div className="mx-auto mt-7 w-fit max-w-full rounded-full border border-[#CBA9A2] px-6 py-3">
              <p className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                NO PUNISHMENT • NO PRESSURE • JUST RETURN
              </p>
            </div>
          </section>

          {/* SAFETY NOTE */}
          <section className="border-t border-[#DED0CB] py-8">
            <div className="grid gap-4 md:grid-cols-[0.45fr_1.55fr] md:gap-10">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  A NOTE ABOUT YOUR BODY
                </p>
              </div>

              <p className="text-[11px] leading-5 text-[#927D76]">
                Lock In With Lav provides general fitness and wellness
                education, not individualized medical care or rehabilitation.
                If you&apos;re postpartum, returning after injury, experiencing
                pain, pelvic floor symptoms, abdominal doming or coning, or
                think you may have diastasis recti, consider speaking with a
                qualified healthcare professional or pelvic floor
                physiotherapist before progressing.
              </p>
            </div>
          </section>

          {/* END */}
          <div className="border-t border-[#DED0CB] py-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73]">
              just keep showing up. ♡
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}