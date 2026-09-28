"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Cat-Cow",
    time: "60 SEC",
    cue: "From hands and knees, slowly alternate between gently rounding your spine and opening your chest. Let your breathing guide the movement.",
    easier:
      "Make the spinal movement smaller or perform it seated with your hands on your thighs.",
  },
  {
    number: "02",
    name: "Child's Pose + Side Reach",
    time: "45 SEC / SIDE",
    cue: "Sit your hips back toward your heels, then walk both hands toward one side and breathe into your upper back and side body.",
    easier:
      "Keep your hips higher or place your hands on an elevated surface.",
  },
  {
    number: "03",
    name: "90/90 Hip Switches",
    time: "60 SEC",
    cue: "Sit with both knees bent and slowly rotate them from side to side, moving through a comfortable range at your hips.",
    easier:
      "Place your hands behind you for support and make the movement smaller.",
  },
  {
    number: "04",
    name: "Half-Kneeling Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "Gently tuck your pelvis and shift forward until you feel a comfortable stretch through the front of the hip.",
    easier:
      "Use padding under your knee and reduce the forward shift.",
  },
  {
    number: "05",
    name: "Figure-Four Glute Stretch",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, cross one ankle over the opposite thigh and gently draw the legs toward you until you feel the outer hip and glute.",
    easier:
      "Keep the supporting foot on the floor instead of drawing the legs toward you.",
  },
  {
    number: "06",
    name: "Open Book Rotations",
    time: "45 SEC / SIDE",
    cue: "Lie on your side with your knees bent and slowly open the top arm across your body, allowing your upper back to rotate comfortably.",
    easier:
      "Use a smaller rotation and keep the top hand closer to your body.",
  },
  {
    number: "07",
    name: "Legs Up the Wall",
    time: "2–3 MIN",
    cue: "Lie comfortably with your legs supported against a wall and let your breathing slow. Keep your shoulders, jaw and hands relaxed.",
    easier:
      "Rest your lower legs on a couch or chair instead of placing them against a wall.",
  },
];

export default function RestDayResetPage() {
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
                rest counts too. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recovery"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RECOVERY
            </Link>
          </header>

          {/* INTRO */}

          <section className="mx-auto max-w-6xl border-b border-[#DED0CB] pb-10 pt-14 md:pb-12 md:pt-16">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.38em] text-[#9D6F67]">
                  RECOVERY • REST DAY
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-none sm:text-5xl md:text-6xl">
                  Rest-Day{" "}
                  <span className="italic text-[#A77B73]">
                    Reset. ♡
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-[11px] leading-5 text-[#75635D]">
                  Gentle movement for the days your body needs less,
                  not more. Move a little, breathe a little and leave
                  feeling better than you started.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 md:max-w-[260px] md:justify-end">
                {[
                  "10–15 MIN",
                  "7 MOVES",
                  "NO EQUIPMENT",
                  "AT HOME",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-[7px] tracking-[0.18em] text-[#9D6F67]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* TODAY'S INTENTION */}

          <section className="mx-auto max-w-6xl py-8">
            <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] bg-[#EAD8D3]/50 px-6 py-5 sm:flex-row sm:items-center md:px-8">
              <div>
                <p className="text-[7px] tracking-[0.28em] text-[#8F655E]">
                  TODAY&apos;S INTENTION
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73] md:text-2xl">
                  feel better, not worked. ♡
                </p>
              </div>

              <p className="max-w-sm text-[9px] leading-5 text-[#806D67] sm:text-right">
                Keep everything easy. There is no target range,
                intensity or pace to hit today.
              </p>
            </div>
          </section>

          {/* ROUTINE */}

          <section className="mx-auto max-w-6xl pb-8 pt-5">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  YOUR RESET
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Easy movement.{" "}
                  <span className="italic text-[#A77B73]">
                    no pressure. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">
                MOVE • BREATHE • RESET
              </p>
            </div>

            {/* CLEAN MOVEMENT LIST */}

            <div className="border-t border-[#DED0CB]">
              {exercises.map((exercise, index) => {
                const isFinalMove = index === exercises.length - 1;

                return (
                  <article
                    key={exercise.number}
                    className={`border-b border-[#DED0CB] ${
                      isFinalMove
                        ? "my-3 rounded-[1.5rem] border border-[#D9C2BC] bg-[#EAD8D3]/40 px-5 sm:px-7"
                        : ""
                    }`}
                  >
                    <div className="grid gap-4 py-7 md:grid-cols-[70px_1fr_125px] md:gap-7 md:py-8">
                      {/* NUMBER */}

                      <div>
                        <span className="font-serif text-3xl italic text-[#C39A92]">
                          {exercise.number}
                        </span>
                      </div>

                      {/* MOVEMENT */}

                      <div>
                        {isFinalMove && (
                          <p className="mb-2 text-[7px] tracking-[0.25em] text-[#9D6F67]">
                            FINISH HERE
                          </p>
                        )}

                        <h3 className="font-serif text-2xl leading-tight md:text-[1.7rem]">
                          {exercise.name}
                        </h3>

                        <p className="mt-3 max-w-3xl text-xs leading-6 text-[#6F5F59]">
                          {exercise.cue}
                        </p>

                        <p className="mt-4 text-[10px] leading-5 text-[#927D76]">
                          <span className="mr-2 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                            EASIER
                          </span>
                          {exercise.easier}
                        </p>
                      </div>

                      {/* TIME */}

                      <div className="md:text-right">
                        <span className="text-[7px] tracking-[0.2em] text-[#8F655E]">
                          {exercise.time}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* REST REMINDER */}

          <section className="mx-auto max-w-6xl py-10">
            <div className="grid gap-7 border-y border-[#DED0CB] py-8 md:grid-cols-[0.7fr_1.3fr] md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                  REST DAY ≠ DO NOTHING WRONG
                </p>

                <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                  recovery is part of the work. ♡
                </p>
              </div>

              <p className="text-[10px] leading-6 text-[#75635D] md:border-l md:border-[#DED0CB] md:pl-8">
                You do not need to turn recovery into another workout.
                A walk, a few gentle movements, more sleep or simply
                taking it easy can all be part of taking care of your body.
              </p>
            </div>
          </section>

          {/* SAFETY */}

          <section className="mx-auto max-w-6xl pb-8">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Movement note: Recovery movement should feel easy and
              comfortable. You do not need to push your range or turn
              this into another workout. Stop if a movement causes
              sharp pain, numbness, dizziness or worsening symptoms.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 pt-4 text-center">
            <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
              THAT&apos;S ENOUGH FOR TODAY
            </p>

            <p className="mt-3 font-serif text-3xl italic text-[#A77B73] md:text-4xl">
              nothing to prove. just reset. ♡
            </p>

            <Link
              href="/dashboard/resources/recovery"
              className="mt-8 inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO MOBILITY + RECOVERY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
