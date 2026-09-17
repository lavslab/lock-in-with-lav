"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const resources = [
  {
    number: "01",
    title: "WORKOUTS",
    subtitle: "let's move. ♡",
    items: "Foundation • Build • Locked In",
    tag: "TRAIN",
  },
  {
    number: "02",
    title: "CORE",
    subtitle: "build from the inside.",
    items: "Foundations • Stability • Progressions",
    tag: "CORE",
  },
  {
    number: "03",
    title: "EXERCISES",
    subtitle: "not sure how? start here.",
    items: "Form • Modifications • Level Up",
    tag: "LEARN",
  },
  {
    number: "04",
    title: "RECOVERY",
    subtitle: "take care of your body.",
    items: "Mobility • Stretching • Recovery",
    tag: "RESET",
  },
  {
    number: "05",
    title: "NUTRITION",
    subtitle: "fuel your body.",
    items: "Protein • Balanced Meals • Tips",
    tag: "NOURISH",
  },
  {
    number: "06",
    title: "RECIPES",
    subtitle: "okay, what are we eating?",
    items: "Breakfast • Lunch • Dinner • Snacks",
    tag: "EAT",
  },
];

const phases = [
  {
    number: "01",
    name: "FOUNDATION",
    days: "DAYS 01 — 25",
    description: "learn it.",
  },
  {
    number: "02",
    name: "BUILD",
    days: "DAYS 26 — 50",
    description: "build it.",
  },
  {
    number: "03",
    name: "LOCKED IN",
    days: "DAYS 51 — 75",
    description: "own it.",
  },
];

export default function ResourcesPage() {
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
        {/* SIDEBAR */}
        <aside className="hidden w-[250px] flex-col border-r border-[#E1D3CE] bg-[#FBF8F6] px-7 py-8 md:flex">
          <div>
            <p className="font-serif text-2xl tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1 text-[8px] tracking-[0.5em]">
              WITH LAV
            </p>
          </div>

          <nav className="mt-16 space-y-3">
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">♡</span>

              <span className="text-[9px] tracking-[0.25em]">
                TODAY
              </span>
            </Link>

            <Link
              href="/dashboard/journey"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">○</span>

              <span className="text-[9px] tracking-[0.25em]">
                JOURNEY
              </span>
            </Link>

            <Link
              href="/dashboard/guide"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">□</span>

              <span className="text-[9px] tracking-[0.25em]">
                THE GUIDE
              </span>
            </Link>

            <Link
              href="/dashboard/resources"
              className="flex w-full items-center gap-4 rounded-2xl bg-[#EAD8D3] px-4 py-4 text-left"
            >
              <span className="font-serif text-lg">⌁</span>

              <span className="text-[9px] tracking-[0.25em]">
                RESOURCES
              </span>
            </Link>

            <Link
              href="/dashboard/progress"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">◇</span>

              <span className="text-[9px] tracking-[0.25em]">
                PROGRESS
              </span>
            </Link>
          </nav>

          {/* ACCOUNT */}
          <div className="mt-auto border-t border-[#E1D3CE] pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDB5AE] font-serif">
                {initial}
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase">
                  {isLoadingUser ? "..." : firstName}
                </p>

                <p className="mt-1 text-[8px] text-[#9A8780]">
                  MY ACCOUNT
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                your library. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* HERO */}
          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-9 text-[#F7F1ED] md:px-10 md:py-10">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
                  RESOURCES
                </p>

                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Everything you need.
                </h1>

                <p className="mt-2 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  all in one place. ♡
                </p>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#BFAEAA]">
                WORKOUTS • CORE • FOOD • RECOVERY
              </p>
            </div>
          </section>

          {/* LIBRARY */}
          <section className="py-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
                  YOUR LIBRARY
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  What do you need
                  <span className="italic text-[#A77B73]">
                    {" "}today?
                  </span>
                </h2>
              </div>

              <p className="hidden font-serif text-lg italic text-[#A77B73] md:block">
                pick a section. ♡
              </p>
            </div>

            {/* RESOURCE CARDS */}
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {resources.map((resource) => (
                <div
                  key={resource.number}
                  className="group cursor-pointer rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2]"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      {resource.number}
                    </span>

                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[6px] tracking-[0.22em] text-[#8F655E]">
                      {resource.tag}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-[8px] tracking-[0.25em]">
                      {resource.title}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                      {resource.subtitle}
                    </h3>

                    <p className="mt-4 text-[7px] tracking-[0.13em] text-[#8C7770]">
                      {resource.items.toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                    <span className="text-[6px] tracking-[0.25em] text-[#9D6F67]">
                      EXPLORE
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PHASES */}
          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.35em] text-[#8F655E]">
                  YOUR 75 DAYS
                </p>

                <h2 className="mt-3 font-serif text-3xl">
                  Three phases.
                  <span className="italic text-[#9D6F67]">
                    {" "}One goal.
                  </span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#8F655E]">
                keep showing up. ♡
              </p>
            </div>

            <div className="mt-7 grid gap-3 lg:grid-cols-3">
              {phases.map((phase) => (
                <div
                  key={phase.number}
                  className="rounded-2xl border border-[#D0B5AF] bg-[#F1E2DE]/40 p-5"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-2xl text-[#9D6F67]">
                      {phase.number}
                    </span>

                    <span className="text-[6px] tracking-[0.17em] text-[#806E68]">
                      {phase.days}
                    </span>
                  </div>

                  <p className="mt-5 text-[7px] tracking-[0.23em]">
                    {phase.name}
                  </p>

                  <p className="mt-1 font-serif text-xl italic text-[#8F655E]">
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SIMPLE END */}
          <section className="py-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              take what you need. keep going. ♡
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[7px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO TODAY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}