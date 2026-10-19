
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const movementBasics = [
  {
    title: "SQUAT",
    cue: "Sit down + back",
    description:
      "Keep your feet planted, brace your core, and lower through a comfortable range before driving back up.",
  },
  {
    title: "HINGE",
    cue: "Push your hips back",
    description:
      "Keep a long spine and send your hips behind you. Think less 'squat down' and more 'close a car door with your hips.'",
  },
  {
    title: "LUNGE",
    cue: "Control the step",
    description:
      "Stay tall, keep your front foot grounded, and lower only as far as you can control.",
  },
  {
    title: "PUSH",
    cue: "Press away",
    description:
      "Brace first, keep the movement controlled, and press without letting your shoulders shrug toward your ears.",
  },
  {
    title: "PULL",
    cue: "Lead with the elbows",
    description:
      "Keep your shoulders relaxed and think about drawing your elbows back rather than just moving the weight.",
  },
  {
    title: "BRACE",
    cue: "Create tension",
    description:
      "Gently tighten around your midsection before a lift while continuing to breathe instead of sucking your stomach in.",
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
  const [expandedMovement, setExpandedMovement] = useState<string | null>(
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

      if (savedName && typeof savedName === "string") {
        setFirstName(savedName.split(" ")[0]);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setIsLoadingUser(false);
    };

    void getUser();
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
          <div className="mx-auto max-w-5xl">

            {/* HEADER */}
            <header className="border-b border-[#DED0CB] pb-7">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                YOUR TRAINING REFERENCE
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight text-[#211C19] sm:text-4xl">
                The{" "}
                <span className="italic text-[#A77B73]">
                  Fundamentals.
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                A little knowledge goes a long way. Your quick
                reference for movement, training terms, and
                everything in between.
              </p>
            </header>

            {/* MOVEMENT BASICS */}
            <section className="border-b border-[#DED0CB] py-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    01 · MOVEMENT
                  </p>

                  <h2 className="mt-2 font-serif text-xl text-[#211C19] sm:text-2xl">
                    The movement{" "}
                    <span className="italic text-[#A77B73]">
                      basics.
                    </span>
                  </h2>
                </div>

                <p className="text-[10px] italic text-[#927D76]">
                  Tap to explore
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6]">
                {movementBasics.map((movement, index) => {
                  const isExpanded =
                    expandedMovement === movement.title;

                  return (
                    <div
                      key={movement.title}
                      className={
                        index !== movementBasics.length - 1
                          ? "border-b border-[#E1D3CE]"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMovement(
                            isExpanded ? null : movement.title
                          )
                        }
                        aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-[#F1E6E2] sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-5 shrink-0 font-serif text-sm italic text-[#C39A92]">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div className="min-w-0">
                            <p className="text-[10px] font-medium tracking-[0.13em] text-[#211C19]">
                              {movement.title}
                            </p>

                            <p className="mt-0.5 font-serif text-sm italic text-[#A77B73]">
                              {movement.cue}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 font-serif text-lg text-[#A77B73]">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#EADDD8] bg-[#F7F1ED]/70 px-4 py-4 sm:px-5">
                          <p className="pl-8 text-[11px] leading-6 text-[#75635D]">
                            {movement.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* GYM TERMINOLOGY */}
            <section className="py-8">
              <div className="mb-6">
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  02 · THE LANGUAGE
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#211C19] sm:text-3xl">
                  Speak a little{" "}
                  <span className="italic text-[#A77B73]">
                    gym. ♡
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                  The words you&apos;ll see in workouts and training
                  plans. No memorizing required — just come back
                  whenever you need a refresher.
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6] px-4 sm:px-5">
                {terms.map((item, index) => (
                  <div
                    key={item.term}
                    className={`grid gap-1.5 py-4 sm:grid-cols-[170px_1fr] sm:items-start sm:gap-5 ${
                      index !== terms.length - 1
                        ? "border-b border-[#E1D3CE]"
                        : ""
                    }`}
                  >
                    <p className="text-[9px] font-medium tracking-[0.12em] text-[#8F655E]">
                      {item.term}
                    </p>

                    <p className="text-[11px] leading-5 text-[#6F5F59]">
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-2 border-t border-[#DED0CB] pb-10 pt-6">
              <p className="max-w-xl text-[10px] leading-5 text-[#927D76]">
                Move with control and choose a range that feels
                comfortable. Stop if an exercise causes sharp pain,
                dizziness, numbness, or worsening symptoms.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                <Link
                  href="/dashboard/guide"
                  className="text-[9px] tracking-[0.15em] text-[#8F655E] transition hover:text-[#211C19]"
                >
                  ← BACK TO TRAIN
                </Link>

                <Link
                  href="/dashboard/resources/workouts"
                  className="text-[9px] tracking-[0.15em] text-[#8F655E] transition hover:text-[#211C19]"
                >
                  EXPLORE WORKOUTS →
                </Link>
              </div>
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}
