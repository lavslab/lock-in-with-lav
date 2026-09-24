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

export default function GuidePage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null);

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
    const elapsed = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
    return Math.min(75, Math.max(1, elapsed));
  })();

  const currentPhaseNumber = currentDay <= 25 ? "01" : currentDay <= 50 ? "02" : "03";
  const currentPhase = phases.find((phase) => phase.number === currentPhaseNumber) ?? phases[0];

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
        {/* SIDEBAR */}
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        {/* MAIN */}
        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* TOP */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                your guide to the next 75 days. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[12px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* SMALLER HERO */}
          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-11 lg:px-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[12px] tracking-[0.4em] text-[#DDB5AE]">
                  THE GUIDE
                </p>

                <h1 className="mt-5 font-serif text-5xl leading-[0.9] md:text-6xl lg:text-7xl">
                  The Lock In
                  <span className="block italic text-[#DDB5AE]">
                    Method.
                  </span>
                </h1>
              </div>

              <p className="max-w-sm font-serif text-xl italic leading-relaxed text-[#E8D8D3] md:text-2xl">
                75 days of showing up for you. ♡
              </p>
            </div>
          </section>

          {/* START HERE */}
          <section className="grid gap-8 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
                START HERE
              </p>

              <p className="mt-3 font-serif text-3xl italic text-[#A77B73]">
                75 days.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-4xl leading-none md:text-5xl">
                Not perfection.
                <span className="italic text-[#A77B73]">
                  {" "}Practice.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#6F5F59]">
                Start where you are. Build your routine, get stronger
                and keep showing up — one day at a time.
              </p>
            </div>
          </section>

          {/* THREE PHASES */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
                  THE METHOD
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Three phases.
                  <span className="italic text-[#A77B73]">
                    {" "}One journey.
                  </span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                build as you go. ♡
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-[#D6BDB6] bg-[#EAD8D3] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#8F655E]">YOU ARE HERE</p>
                <p className="mt-2 font-serif text-2xl italic text-[#8F655E]">
                  Phase {currentPhase.number} · {currentPhase.name.toLowerCase()}. ♡
                </p>
              </div>
              <span className="rounded-full bg-[#211C19] px-5 py-2.5 text-[12px] tracking-[0.22em] text-[#F7F1ED]">
                DAY {String(currentDay).padStart(2, "0")} / 75
              </span>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {phases.map((phase) => (
                <article
                  key={phase.number}
                  className={`rounded-[1.75rem] p-6 ${
                    phase.number === currentPhaseNumber
                      ? "bg-[#211C19] text-[#F7F1ED]"
                      : "border border-[#DED0CB] bg-[#FBF8F6]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`font-serif text-4xl ${
                        phase.number === currentPhaseNumber
                          ? "text-[#DDB5AE]"
                          : "text-[#D2B0A9]"
                      }`}
                    >
                      {phase.number}
                    </span>

                    <span
                      className={`text-[9px] tracking-[0.2em] ${
                        phase.number === currentPhaseNumber
                          ? "text-[#C8B5AF]"
                          : "text-[#9D6F67]"
                      }`}
                    >
                      {phase.days}
                    </span>
                  </div>

                  <p className="mt-6 text-[12px] tracking-[0.3em]">
                    {phase.name}
                  </p>

                  <h3
                    className={`mt-2 font-serif text-2xl italic ${
                      phase.number === currentPhaseNumber
                        ? "text-[#DDB5AE]"
                        : "text-[#A77B73]"
                    }`}
                  >
                    {phase.tagline}
                  </h3>

                  <div
                    className={`mt-6 border-t pt-4 ${
                      phase.number === currentPhaseNumber
                        ? "border-[#493D39]"
                        : "border-[#E1D3CE]"
                    }`}
                  >
                    {phase.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <span
                          className={
                            phase.number === currentPhaseNumber
                              ? "text-[#DDB5AE]"
                              : "text-[#A77B73]"
                          }
                        >
                          ♡
                        </span>

                        <p className="text-[12px] tracking-[0.1em]">
                          {point.toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* HOW WE TRAIN + WEEK */}
          <section className="grid gap-8 border-t border-[#DED0CB] py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div>
              <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
                HOW WE TRAIN
              </p>

              <h2 className="mt-3 font-serif text-4xl leading-none md:text-5xl">
                Strong starts
                <span className="block italic text-[#A77B73]">
                  from the inside.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#806E68]">
                Core, glutes, back and full-body strength — with
                control before intensity.
              </p>

              <div className="mt-7 rounded-[1.75rem] bg-[#EAD8D3] p-6">
                <p className="text-[12px] tracking-[0.3em] text-[#8F655E]">
                  THE GOAL
                </p>

                <p className="mt-3 font-serif text-2xl italic leading-snug">
                  Strong core. Strong glutes.
                  <br />
                  Strong back. Stronger you.
                </p>
              </div>
            </div>

            {/* WEEK */}
            <div className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                    YOUR RHYTHM
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
                    className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t border-[#E1D3CE] py-3.5"
                  >
                    <span className="font-serif text-lg text-[#B48A82]">
                      {day}
                    </span>

                    <span className="text-[12px] tracking-[0.16em]">
                      {title}
                    </span>

                    <span className="text-right text-[12px] text-[#927D76]">
                      {focus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* LEVELS */}
          <section className="rounded-[2rem] bg-[#211C19] px-8 py-9 text-[#F7F1ED] md:px-10">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <p className="text-[12px] tracking-[0.4em] text-[#DDB5AE]">
                  START WHERE YOU ARE
                </p>

                <h2 className="mt-4 font-serif text-4xl leading-none md:text-5xl">
                  Your level.
                  <span className="block italic text-[#DDB5AE]">
                    Your progress.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-[15px] leading-7 text-[#C8B9B4]">
                Pick the version that feels controlled. Progress when
                you&apos;re ready.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#4B403C] p-5">
                <p className="text-[12px] tracking-[0.25em] text-[#DDB5AE]">
                  START HERE
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#C8B9B4]">
                  learn it.
                </p>
              </div>

              <div className="rounded-2xl border border-[#4B403C] p-5">
                <p className="text-[12px] tracking-[0.25em] text-[#DDB5AE]">
                  LOCKED IN
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#C8B9B4]">
                  build it.
                </p>
              </div>

              <div className="rounded-2xl border border-[#4B403C] p-5">
                <p className="text-[12px] tracking-[0.25em] text-[#DDB5AE]">
                  LEVEL UP
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#C8B9B4]">
                  challenge it.
                </p>
              </div>
            </div>
          </section>

          {/* HOW TO USE THE METHOD */}
          <section className="py-12">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                  HOW IT COMES TOGETHER
                </p>

                <h2 className="mt-3 font-serif text-4xl leading-none md:text-5xl">
                  Your daily rhythm.
                  <span className="block italic text-[#A77B73]">
                    Your bigger picture.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#6F5F59]">
                  Today keeps you focused on the six promises in front of you.
                  The Guide helps you understand how your training, nutrition,
                  recovery and progression fit together across the full 75 days.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
                <p className="text-[12px] tracking-[0.26em] text-[#9D6F67]">
                  WHEN YOU NEED MORE
                </p>

                <p className="mt-3 font-serif text-2xl italic leading-snug text-[#A77B73]">
                  Need a workout, meal idea or something to help you show up?
                </p>

                <p className="mt-4 text-[16px] leading-7 text-[#806E68]">
                  Your Resources library is where you&apos;ll find practical tools
                  to help you complete the work — from training ideas to nourishment
                  and recovery support.
                </p>

                <Link
                  href="/dashboard/resources"
                  className="mt-6 inline-flex items-center rounded-full bg-[#211C19] px-7 py-3.5 text-[12px] tracking-[0.20em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  EXPLORE RESOURCES →
                </Link>
              </div>
            </div>
          </section>

          {/* NUTRITION */}
          <section className="grid overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] lg:grid-cols-[0.8fr_1.2fr]">
            <div className="p-7 md:p-9">
              <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
                NOURISH
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-none">
                Keep it
                <span className="block italic text-[#A77B73]">
                  simple.
                </span>
              </h2>
            </div>

            <div className="bg-[#EAD8D3] p-7 md:p-9">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Prioritize protein",
                  "Add plants + fiber",
                  "Stay hydrated",
                  "Build balanced meals",
                  "Consistency over restriction",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-b border-[#D3BBB5] pb-3"
                  >
                    <span className="text-[#9D6F67]">♡</span>

                    <p className="text-[14px] tracking-[0.10em]">
                      {item.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* MISSED A DAY */}
          <section className="py-14 text-center">
            <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
              REAL LIFE HAPPENS
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Missed a day?
            </h2>

            <p className="mt-1 font-serif text-2xl italic text-[#A77B73]">
              come back tomorrow. ♡
            </p>

            <div className="mx-auto mt-7 max-w-xl rounded-full border border-[#CBA9A2] px-6 py-3">
              <p className="text-[12px] tracking-[0.2em] text-[#8F655E]">
                NO PUNISHMENT • NO PRESSURE • JUST RETURN
              </p>
            </div>
          </section>

          {/* SAFETY */}
          <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                  A NOTE ABOUT YOUR BODY
                </p>

                <h2 className="mt-3 font-serif text-3xl italic text-[#A77B73]">
                  Listen before you push.
                </h2>
              </div>

              <div className="text-[15px] leading-7 text-[#806E68]">
                <p>
                  Lock In With Lav provides general fitness and wellness
                  education, not individualized medical care or rehabilitation.
                  If you&apos;re postpartum, returning after injury,
                  experiencing pain, pelvic floor symptoms, abdominal doming
                  or coning, or think you may have diastasis recti, consider
                  speaking with a qualified healthcare professional or pelvic
                  floor physiotherapist before progressing.
                </p>
              </div>
            </div>
          </section>

          {/* END */}
          <section className="py-14 text-center">
            <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
              YOUR NEXT 75 DAYS
            </p>

            <h2 className="mx-auto mt-4 font-serif text-4xl leading-none md:text-5xl">
              Just keep
              <span className="italic text-[#A77B73]">
                {" "}showing up. ♡
              </span>
            </h2>

            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-full bg-[#211C19] px-9 py-3.5 text-[12px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO TODAY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}