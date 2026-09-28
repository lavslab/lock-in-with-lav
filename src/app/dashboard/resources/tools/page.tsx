"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};

function CalculatorIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8 7.5h8" />
      <path d="M8 11.5h2" />
      <path d="M14 11.5h2" />
      <path d="M8 15.5h2" />
      <path d="M14 15.5h2" />
    </svg>
  );
}

function SwapIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
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

function TemplateIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4.5" y="4" width="15" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h3" />
      <path d="M13.5 12H16" />
      <path d="M8 16h5" />
    </svg>
  );
}

export default function ToolsPage() {
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

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73] sm:text-xl">
                make the process easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RESOURCES
            </Link>
          </header>

          {/* PAGE INTRO */}

          <section className="mx-auto max-w-6xl border-b border-[#DED0CB] pb-9 pt-12 md:pb-10 md:pt-14">
            <div className="grid gap-7 md:grid-cols-[1fr_0.7fr] md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.38em] text-[#9D6F67]">
                  TOOLS
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-[0.95] sm:text-5xl md:text-[3.5rem]">
                  Less guessing.
                  <span className="block italic text-[#A77B73]">
                    more doing. ♡
                  </span>
                </h1>
              </div>

              <div className="max-w-md md:justify-self-end">
                <p className="text-[10px] leading-5 text-[#75635D]">
                  Quick tools for figuring out your nutrition,
                  adjusting your training and keeping your routine
                  organized.
                </p>

                <p className="mt-3 text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  CALCULATE • SWAP • PLAN
                </p>
              </div>
            </div>
          </section>

          {/* TOOL STATION */}

          <section className="mx-auto max-w-6xl py-10">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  YOUR TOOL STATION
                </p>

                <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                  What do you need{" "}
                  <span className="italic text-[#A77B73]">
                    help with? ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">
                PICK ONE • GET YOUR ANSWER • KEEP GOING
              </p>
            </div>

            {/* MACRO CALCULATOR */}

            <Link
              href="/dashboard/resources/tools/macro-calculator"
              className="group block rounded-[1.5rem] border border-[#D8C3BD] bg-[#FBF8F6] transition duration-300 hover:border-[#C39A92] hover:shadow-sm"
            >
              <div className="grid md:grid-cols-[1.1fr_0.9fr]">
                {/* LEFT */}

                <div className="p-6 md:p-7 lg:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#EAD8D3] text-[#9D6F67]">
                      <CalculatorIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-serif text-sm italic text-[#C39A92]">
                          01
                        </span>

                        <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          NUTRITION TOOL
                        </span>
                      </div>

                      <h3 className="mt-3 font-serif text-2xl md:text-3xl">
                        Macro Calculator
                      </h3>

                      <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                        calculate your daily targets. ♡
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 max-w-xl text-[11px] leading-5 text-[#6F5F59]">
                    Enter a few details about yourself and your goal to
                    estimate your daily calorie, protein, carbohydrate
                    and fat targets.
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-[7px] tracking-[0.22em] text-[#8F655E]">
                      OPEN CALCULATOR
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#EAD8D3]">
                      →
                    </span>
                  </div>
                </div>

                {/* MACRO PREVIEW */}

                <div className="border-t border-[#E1D3CE] bg-[#EAD8D3]/35 p-6 md:border-l md:border-t-0 md:p-7 lg:p-8">
                  <p className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                    YOUR ESTIMATE
                  </p>

                  <p className="mt-2 text-[9px] leading-4 text-[#806D67]">
                    Your results will break your daily nutrition down
                    into four simple targets.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[1rem] border border-[#D8C3BD] bg-[#D8C3BD]">
                    <div className="bg-[#F7F1ED] p-4">
                      <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                        CALORIES
                      </p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        kcal
                      </p>
                    </div>

                    <div className="bg-[#F7F1ED] p-4">
                      <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                        PROTEIN
                      </p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        grams
                      </p>
                    </div>

                    <div className="bg-[#F7F1ED] p-4">
                      <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                        CARBS
                      </p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        grams
                      </p>
                    </div>

                    <div className="bg-[#F7F1ED] p-4">
                      <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                        FATS
                      </p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        grams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* SECONDARY TOOLS */}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {/* EXERCISE SWAP */}

              <Link
                href="/dashboard/resources/tools/exercise-swap"
                className="group rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:border-[#C39A92] hover:shadow-sm md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-[#EAD8D3]/75 text-[#9D6F67]">
                    <SwapIcon className="h-5 w-5" />
                  </div>

                  <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    TRAINING TOOL
                  </span>
                </div>

                <div className="mt-6">
                  <span className="font-serif text-sm italic text-[#C39A92]">
                    02
                  </span>

                  <h3 className="mt-2 font-serif text-2xl">
                    Exercise Swap
                  </h3>

                  <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                    find another way to train it.
                  </p>

                  <p className="mt-4 text-[11px] leading-5 text-[#6F5F59]">
                    Pick an exercise and find alternatives that train
                    the same muscles and movement pattern.
                  </p>
                </div>

                {/* SWAP VISUAL */}

                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="rounded-[0.9rem] bg-[#F2E7E3] px-4 py-3 text-center">
                    <p className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                      CURRENT
                    </p>
                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      exercise
                    </p>
                  </div>

                  <span className="font-serif text-lg text-[#B98980]">
                    →
                  </span>

                  <div className="rounded-[0.9rem] bg-[#F2E7E3] px-4 py-3 text-center">
                    <p className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                      SWAP
                    </p>
                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      alternative
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                  <span className="text-[7px] tracking-[0.22em] text-[#8F655E]">
                    FIND A SWAP
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#EAD8D3]">
                    →
                  </span>
                </div>
              </Link>

              {/* TEMPLATES */}

              <Link
                href="/dashboard/resources/tools/templates"
                className="group rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:border-[#C39A92] hover:shadow-sm md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-[#EAD8D3]/75 text-[#9D6F67]">
                    <TemplateIcon className="h-5 w-5" />
                  </div>

                  <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    PLANNING TOOL
                  </span>
                </div>

                <div className="mt-6">
                  <span className="font-serif text-sm italic text-[#C39A92]">
                    03
                  </span>

                  <h3 className="mt-2 font-serif text-2xl">
                    Templates
                  </h3>

                  <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                    plan it. track it.
                  </p>

                  <p className="mt-4 text-[11px] leading-5 text-[#6F5F59]">
                    Simple planning and tracking pages to help you
                    organize your habits, routines and progress.
                  </p>
                </div>

                {/* TEMPLATE PREVIEW */}

                <div className="mt-6 rounded-[0.9rem] bg-[#F2E7E3] px-4 py-3">
                  <div className="flex items-center justify-between border-b border-[#DCCAC5] pb-2">
                    <span className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                      PLAN
                    </span>

                    <span className="h-3 w-3 rounded-sm border border-[#C39A92]" />
                  </div>

                  <div className="flex items-center justify-between border-b border-[#DCCAC5] py-2">
                    <span className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                      TRACK
                    </span>

                    <span className="h-3 w-3 rounded-sm border border-[#C39A92]" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                      REVIEW
                    </span>

                    <span className="h-3 w-3 rounded-sm border border-[#C39A92]" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                  <span className="text-[7px] tracking-[0.22em] text-[#8F655E]">
                    VIEW TEMPLATES
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#EAD8D3]">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* HOW TO USE */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="border-y border-[#DED0CB] py-8">
              <div className="grid gap-7 md:grid-cols-[0.55fr_1.45fr] md:items-center">
                <div>
                  <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    KEEP IT USEFUL
                  </p>

                  <p className="mt-2 font-serif text-xl italic text-[#A77B73] md:text-2xl">
                    tools, not rules. ♡
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3 md:border-l md:border-[#DED0CB] md:pl-8">
                  <div>
                    <p className="font-serif text-lg italic text-[#C39A92]">
                      01
                    </p>
                    <p className="mt-1 text-[7px] tracking-[0.18em] text-[#8F655E]">
                      NEED AN ESTIMATE?
                    </p>
                    <p className="mt-2 text-[9px] leading-4 text-[#806D67]">
                      Use the macro calculator.
                    </p>
                  </div>

                  <div>
                    <p className="font-serif text-lg italic text-[#C39A92]">
                      02
                    </p>
                    <p className="mt-1 text-[7px] tracking-[0.18em] text-[#8F655E]">
                      NEED AN ALTERNATIVE?
                    </p>
                    <p className="mt-2 text-[9px] leading-4 text-[#806D67]">
                      Find an exercise swap.
                    </p>
                  </div>

                  <div>
                    <p className="font-serif text-lg italic text-[#C39A92]">
                      03
                    </p>
                    <p className="mt-1 text-[7px] tracking-[0.18em] text-[#8F655E]">
                      NEED STRUCTURE?
                    </p>
                    <p className="mt-2 text-[9px] leading-4 text-[#806D67]">
                      Grab a template.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              get the answer. keep moving. ♡
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}