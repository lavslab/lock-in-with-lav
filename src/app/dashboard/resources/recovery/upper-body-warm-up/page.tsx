"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Arm Circles",
    time: "30 SEC",
    cue: "Reach your arms out to the sides and make controlled circles. Start small, then gradually make them larger.",
    easier: "Keep the circles small and stay within a comfortable range.",
  },
  {
    number: "02",
    name: "Shoulder Rolls",
    time: "30 SEC",
    cue: "Slowly roll your shoulders up, back and down. Keep your neck relaxed and make each circle smooth.",
    easier: "Use smaller circles and move one shoulder at a time.",
  },
  {
    number: "03",
    name: "Open + Close Arms",
    time: "45 SEC",
    cue: "Open your arms wide across your chest, then bring them together in front of you. Alternate which arm crosses on top.",
    easier: "Keep your arms slightly bent and use a smaller range.",
  },
  {
    number: "04",
    name: "Standing T-Spine Rotations",
    time: "45 SEC",
    cue: "Stand tall with your arms in front of you and gently rotate your upper body from side to side while keeping your hips mostly forward.",
    easier: "Make the rotation smaller and move slowly.",
  },
  {
    number: "05",
    name: "Wall Slides",
    time: "45 SEC",
    cue: "Stand against a wall and slide your arms upward and back down while keeping the movement controlled and your ribs relaxed.",
    easier: "Move only as high as your shoulders comfortably allow.",
  },
  {
    number: "06",
    name: "Scapular Push-Ups",
    time: "45 SEC",
    cue: "From a high plank, keep your elbows straight as you gently let your chest sink between your shoulders, then push the floor away.",
    easier: "Perform the movement against a wall or bench.",
  },
  {
    number: "07",
    name: "Walkout to High Plank",
    time: "45 SEC",
    cue: "Hinge forward, place your hands down and walk them out to a strong high plank. Pause briefly, then walk back and stand tall.",
    easier: "Walk your hands out on a bench, couch or other elevated surface.",
  },
];

export default function UpperBodyWarmUpPage() {
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
                get ready to move. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recovery"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RECOVERY
            </Link>
          </header>

          {/* EDITORIAL INTRO */}

          <section className="mx-auto max-w-6xl pb-10 pt-14 md:pb-14 md:pt-20">
            <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                    WARM-UP
                  </p>

                  <span className="h-px w-8 bg-[#CBA9A2]" />

                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    UPPER BODY
                  </p>
                </div>

                <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.92] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                  Upper-Body
                  <span className="block italic text-[#A77B73]">
                    Warm-Up. ♡
                  </span>
                </h1>
              </div>

              <div className="md:pb-2">
                <p className="max-w-sm text-xs leading-6 text-[#75635D]">
                  Seven movements to wake up your shoulders,
                  upper back and arms before pressing, pulling
                  or full-body strength work.
                </p>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                  {[
                    "5–7 MIN",
                    "7 MOVES",
                    "NO EQUIPMENT",
                    "HOME + GYM",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[7px] tracking-[0.2em] text-[#9D6F67]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 h-px bg-[#DED0CB]" />
          </section>

          {/* BEFORE YOU BEGIN */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="grid overflow-hidden rounded-[1.5rem] bg-[#EAD8D3]/55 md:grid-cols-[0.3fr_1.7fr]">
              <div className="flex items-center border-b border-[#D9C2BC] px-6 py-5 md:border-b-0 md:border-r md:px-7">
                <p className="text-[8px] tracking-[0.3em] text-[#8F655E]">
                  BEFORE YOU BEGIN
                </p>
              </div>

              <div className="px-6 py-5 md:px-8">
                <p className="font-serif text-lg italic leading-7 text-[#8F655E] md:text-xl">
                  Start small. Let your shoulders and upper body
                  open up gradually before you add load. ♡
                </p>
              </div>
            </div>
          </section>

          {/* ROUTINE INTRO */}

          <section className="mx-auto max-w-6xl pb-7">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  THE ROUTINE
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  One round.{" "}
                  <span className="italic text-[#A77B73]">
                    keep moving. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.2em] text-[#927D76]">
                MOVE WITH CONTROL • NO RUSH
              </p>
            </div>
          </section>

          {/* EXERCISES */}

          <section className="mx-auto max-w-6xl">
            <div className="border-y border-[#DED0CB]">
              {exercises.map((exercise, index) => (
                <article
                  key={exercise.number}
                  className={`grid gap-5 py-8 md:grid-cols-[90px_1fr_110px] md:gap-8 md:py-10 ${
                    index !== exercises.length - 1
                      ? "border-b border-[#DED0CB]"
                      : ""
                  }`}
                >
                  <div>
                    <span className="font-serif text-4xl italic text-[#C39A92] md:text-5xl">
                      {exercise.number}
                    </span>
                  </div>

                  <div className="max-w-3xl">
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                      {exercise.name}
                    </h3>

                    <p className="mt-4 text-xs leading-6 text-[#6F5F59] sm:text-sm sm:leading-7">
                      {exercise.cue}
                    </p>

                    <div className="mt-5 flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#C39A92]" />

                      <p className="text-[10px] leading-5 text-[#927D76] sm:text-xs">
                        <span className="mr-2 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                          MAKE IT EASIER
                        </span>
                        {exercise.easier}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:justify-end">
                    <span className="h-fit rounded-full border border-[#CBA9A2] px-4 py-2 text-[7px] tracking-[0.2em] text-[#8F655E]">
                      {exercise.time}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* FINISH */}

          <section className="mx-auto max-w-6xl py-12 md:py-16">
            <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  DONE ♡
                </p>

                <p className="mt-3 font-serif text-3xl italic text-[#A77B73] md:text-4xl">
                  shoulders warm. upper body ready.
                </p>
              </div>

              <Link
                href="/dashboard/resources/workouts"
                className="w-fit rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                FIND A WORKOUT →
              </Link>
            </div>
          </section>

          {/* SAFETY NOTE */}

          <section className="mx-auto max-w-6xl border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Movement note: Warm-ups should feel comfortable and
              gradually increase movement and body temperature.
              Stop if a movement causes sharp pain, numbness,
              dizziness or worsening symptoms.
            </p>
          </section>

          {/* BACK */}

          <section className="mx-auto max-w-6xl pb-14 pt-4 text-center">
            <Link
              href="/dashboard/resources/recovery"
              className="inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO MOBILITY + RECOVERY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}