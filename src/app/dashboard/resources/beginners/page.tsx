"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const basics = [
  {
    number: "01",
    title: "SQUAT",
    cue: "Sit down + back",
    text: "Keep your feet planted, brace your core and lower through a comfortable range before driving back up.",
  },
  {
    number: "02",
    title: "HINGE",
    cue: "Push your hips back",
    text: "Keep a long spine and send your hips behind you. Think less 'squat down' and more 'close a car door with your hips.'",
  },
  {
    number: "03",
    title: "LUNGE",
    cue: "Control the step",
    text: "Stay tall, keep your front foot grounded and lower only as far as you can control.",
  },
  {
    number: "04",
    title: "PUSH",
    cue: "Press away",
    text: "Brace first, keep the movement controlled and press without letting your shoulders shrug toward your ears.",
  },
  {
    number: "05",
    title: "PULL",
    cue: "Lead with the elbows",
    text: "Keep your shoulders relaxed and think about drawing your elbows back rather than just moving the weight.",
  },
  {
    number: "06",
    title: "BRACE",
    cue: "Create tension",
    text: "Gently tighten around your midsection before a lift while continuing to breathe instead of sucking your stomach in.",
  },
];

const modifications = [
  {
    number: "01",
    title: "NEED LESS IMPACT?",
    text: "Remove jumping. Step instead of hop, march instead of run, and choose controlled versions of the same movement.",
  },
  {
    number: "02",
    title: "NEED MORE SUPPORT?",
    text: "Use a wall, bench, chair or rack for balance and shorten the range until the movement feels controlled.",
  },
  {
    number: "03",
    title: "TRAINING AT HOME?",
    text: "Use dumbbells, bands or bodyweight. When equipment is limited, slow the tempo, add reps or use single-side variations.",
  },
  {
    number: "04",
    title: "TRAINING AT THE GYM?",
    text: "Use the dumbbell, cable or machine version that matches the same movement pattern and feels best for you.",
  },
];

const terms = [
  {
    term: "REP",
    meaning: "One complete repetition of an exercise.",
  },
  {
    term: "SET",
    meaning: "A group of repetitions performed together.",
  },
  {
    term: "REST",
    meaning: "The recovery time between sets or exercises.",
  },
  {
    term: "RPE",
    meaning:
      "Rate of perceived exertion — a 1–10 scale for how hard a set feels.",
  },
  {
    term: "TEMPO",
    meaning: "The speed you use during each part of a repetition.",
  },
  {
    term: "SUPERSET",
    meaning:
      "Two exercises performed back-to-back before taking a longer rest.",
  },
  {
    term: "PROGRESSIVE OVERLOAD",
    meaning:
      "Gradually increasing the challenge over time through load, reps, range, control or another training variable.",
  },
  {
    term: "AMRAP",
    meaning:
      "As many reps or rounds as possible within the instructions given while maintaining good form.",
  },
];

export default function BeginnersPage() {
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
                start exactly where you are. ♡
              </p>
            </div>
</header>
            

          {/* INTRO */}

          <section className="mx-auto max-w-6xl border-b border-[#DED0CB] pb-12 pt-14 md:pb-14 md:pt-16">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="text-[8px] tracking-[0.38em] text-[#9D6F67]">
                  BEGINNER&apos;S CORNER
                </p>

                <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[0.95] sm:text-5xl md:text-6xl">
                  Learn the basics.
                  <span className="block italic text-[#A77B73]">
                    then build from there. ♡
                  </span>
                </h1>
              </div>

              <div className="max-w-md lg:justify-self-end">
                <p className="text-[11px] leading-5 text-[#75635D]">
                  You do not need to know everything before you start.
                  Learn a few movement patterns, understand the language
                  and build confidence as you go.
                </p>

                <p className="mt-4 text-[7px] tracking-[0.2em] text-[#9D6F67]">
                  LEARN • PRACTICE • BUILD
                </p>
              </div>
            </div>
          </section>

          {/* START HERE */}

          <section className="mx-auto max-w-6xl py-8">
            <div className="grid gap-5 rounded-[1.5rem] bg-[#EAD8D3]/50 px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7 md:px-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBA9A2] bg-[#F7F1ED]">
                <span className="font-serif text-xl italic text-[#A77B73]">
                  01
                </span>
              </div>

              <div>
                <p className="text-[7px] tracking-[0.28em] text-[#8F655E]">
                  START HERE
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73] md:text-2xl">
                  control first. intensity later. ♡
                </p>

                <p className="mt-2 max-w-2xl text-[9px] leading-5 text-[#806D67]">
                  Give yourself time to learn how a movement feels.
                  You can always add weight, reps or difficulty later.
                </p>
              </div>
            </div>
          </section>

          {/* LESSON 01 — MOVEMENT BASICS */}

          <section className="mx-auto max-w-6xl pb-14 pt-6">
            <div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  LESSON 01
                </p>

                <h2 className="mt-3 font-serif text-3xl leading-tight">
                  Movement
                  <span className="block italic text-[#A77B73]">
                    basics. ♡
                  </span>
                </h2>

                <p className="mt-4 max-w-xs text-[10px] leading-5 text-[#806D67]">
                  Most strength exercises are variations of a few
                  basic movement patterns.
                </p>
              </div>

              <div className="border-t border-[#DED0CB]">
                {basics.map((item) => (
                  <article
                    key={item.number}
                    className="grid gap-3 border-b border-[#DED0CB] py-7 sm:grid-cols-[50px_110px_1fr] sm:gap-6 md:py-8"
                  >
                    <span className="font-serif text-2xl italic text-[#C39A92]">
                      {item.number}
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.2em] text-[#211C19]">
                        {item.title}
                      </p>

                      <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                        {item.cue}
                      </p>
                    </div>

                    <p className="text-xs leading-6 text-[#6F5F59]">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* LITTLE CHECKPOINT */}

          <section className="mx-auto max-w-4xl pb-16 text-center">
            <p className="font-serif text-2xl italic leading-relaxed text-[#A77B73] md:text-3xl">
              You don&apos;t have to master the movement before
              you&apos;re allowed to practice it. ♡
            </p>

            <p className="mt-4 text-[7px] tracking-[0.2em] text-[#927D76]">
              START LIGHT • MOVE WITH CONTROL • KEEP LEARNING
            </p>
          </section>

          {/* LESSON 02 — MODIFY */}

          <section className="mx-auto max-w-6xl border-t border-[#DED0CB] py-14">
            <div className="mb-9">
              <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                LESSON 02
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Make the movement{" "}
                <span className="italic text-[#A77B73]">
                  work for you. ♡
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-[10px] leading-5 text-[#806D67]">
                Modifying an exercise is not doing it wrong. Change
                the impact, support, equipment or range so you can
                move with control.
              </p>
            </div>

            <div className="grid border-y border-[#DED0CB] md:grid-cols-2">
              {modifications.map((item, index) => (
                <article
                  key={item.title}
                  className={`py-7 md:p-7 ${
                    index < modifications.length - 2
                      ? "border-b border-[#DED0CB]"
                      : ""
                  } ${
                    index % 2 === 0
                      ? "md:border-r md:border-[#DED0CB]"
                      : ""
                  } ${
                    index === 1
                      ? "border-b border-[#DED0CB]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="font-serif text-xl italic text-[#C39A92]">
                      {item.number}
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.18em] text-[#8F655E]">
                        {item.title}
                      </p>

                      <p className="mt-3 text-xs leading-6 text-[#6F5F59]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* LESSON 03 — GYM LANGUAGE */}

          <section className="mx-auto max-w-6xl py-14">
            <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  LESSON 03
                </p>

                <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                  Speak a little
                  <span className="block italic text-[#A77B73]">
                    gym. ♡
                  </span>
                </h2>

                <p className="mt-4 max-w-sm text-[10px] leading-5 text-[#806D67]">
                  These are the words you&apos;ll see in workouts and
                  training plans. No memorizing required — come back
                  whenever you need a reminder.
                </p>
              </div>

              <div className="border-t border-[#DED0CB]">
                {terms.map((item, index) => (
                  <div
                    key={item.term}
                    className={`grid gap-2 py-5 sm:grid-cols-[180px_1fr] sm:gap-7 ${
                      index !== terms.length - 1
                        ? "border-b border-[#DED0CB]"
                        : "border-b border-[#DED0CB]"
                    }`}
                  >
                    <p className="text-[8px] tracking-[0.16em] text-[#8F655E]">
                      {item.term}
                    </p>

                    <p className="text-xs leading-6 text-[#6F5F59]">
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REMEMBER */}

          <section className="mx-auto max-w-6xl py-10">
            <div className="border-y border-[#DED0CB] py-9 text-center">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                REMEMBER
              </p>

              <p className="mx-auto mt-3 max-w-3xl font-serif text-2xl italic leading-relaxed text-[#A77B73] md:text-3xl">
                good form is controlled movement — not making every
                body look exactly the same. ♡
              </p>

              <p className="mx-auto mt-5 max-w-2xl text-[9px] leading-5 text-[#927D76]">
                Use a range and variation you can control. Stop if an
                exercise causes sharp pain, numbness, dizziness or
                worsening symptoms.
              </p>
            </div>
          </section>

          {/* NEXT STEP */}

          <section className="mx-auto max-w-6xl pb-14 pt-6 text-center">
            <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
              READY TO PRACTICE?
            </p>

            <p className="mt-3 font-serif text-3xl italic text-[#A77B73] md:text-4xl">
              learn it. practice it. build on it. ♡
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/resources/workouts"
                className="rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                FIND A WORKOUT →
              </Link>

              <Link
                href="/dashboard/resources"
                className="rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
              >
                ← BACK TO RESOURCES
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}