"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Shoulder Rolls",
    time: "30 SEC",
    cue: "Sit or stand tall and slowly roll your shoulders up, back and down. Keep your neck relaxed.",
    easier: "Make the circles smaller and move one shoulder at a time.",
  },
  {
    number: "02",
    name: "Gentle Neck Stretch",
    time: "30 SEC / SIDE",
    cue: "Keep your shoulders relaxed and gently tilt one ear toward the same-side shoulder without pulling on your head.",
    easier: "Use a very small tilt and keep your gaze forward.",
  },
  {
    number: "03",
    name: "Seated Chest Opener",
    time: "45 SEC",
    cue: "Sit tall, gently reach your arms behind you and open across your chest while keeping your ribs relaxed.",
    easier: "Keep your hands apart and reach only slightly behind your body.",
  },
  {
    number: "04",
    name: "Seated T-Spine Rotation",
    time: "45 SEC / SIDE",
    cue: "Sit tall with your feet grounded and gently rotate your upper body toward one side, then return to centre.",
    easier: "Use a smaller rotation and keep your hands resting on your thighs.",
  },
  {
    number: "05",
    name: "Standing Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "Step one foot back, gently tuck your pelvis and shift your weight forward until you feel the front of the hip open.",
    easier: "Shorten your stance and hold your desk or chair for support.",
  },
  {
    number: "06",
    name: "Standing Hamstring Hinge",
    time: "45 SEC / SIDE",
    cue: "Place one heel slightly forward, soften the opposite knee and gently hinge from your hips with a long spine.",
    easier: "Keep both knees softly bent and make the hinge smaller.",
  },
  {
    number: "07",
    name: "Standing Reach + Side Bend",
    time: "30 SEC / SIDE",
    cue: "Reach one arm overhead and gently lean to the opposite side, creating length through your side body.",
    easier: "Keep the reaching arm lower and use a smaller side bend.",
  },
];

export default function DeskResetPage() {
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
                  RECOVERY • DESK + SITTING
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-none sm:text-5xl md:text-6xl">
                  Desk + Sitting{" "}
                  <span className="italic text-[#A77B73]">
                    Reset. ♡
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-[11px] leading-5 text-[#75635D]">
                  A quick movement break for your neck, shoulders,
                  upper back and hips after sitting for a while.
                  No workout clothes required.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 md:max-w-[260px] md:justify-end">
                {[
                  "5–8 MIN",
                  "7 MOVES",
                  "NO EQUIPMENT",
                  "ANYWHERE",
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

          {/* QUICK BREAK */}

          <section className="mx-auto max-w-6xl py-8">
            <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] bg-[#EAD8D3]/50 px-6 py-5 sm:flex-row sm:items-center md:px-8">
              <div>
                <p className="text-[7px] tracking-[0.28em] text-[#8F655E]">
                  QUICK BREAK
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73] md:text-2xl">
                  get out of the chair for a minute. ♡
                </p>
              </div>

              <p className="max-w-sm text-[9px] leading-5 text-[#806D67] sm:text-right">
                You can do the first few movements seated, then stand
                when you&apos;re ready to open up your hips and legs.
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
                  Unfold a little.{" "}
                  <span className="italic text-[#A77B73]">
                    feel better. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">
                EASY MOVEMENT • NO RUSH
              </p>
            </div>

            {/* CLEAN MOVEMENT LIST */}

            <div className="border-t border-[#DED0CB]">
              {exercises.map((exercise, index) => {
                const startsStanding = index === 4;

                return (
                  <div key={exercise.number}>
                    {startsStanding && (
                      <div className="border-b border-[#DED0CB] bg-[#EAD8D3]/35 px-5 py-4 sm:px-7">
                        <p className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                          NOW STAND UP ♡
                        </p>
                      </div>
                    )}

                    <article className="border-b border-[#DED0CB]">
                      <div className="grid gap-4 py-7 md:grid-cols-[70px_1fr_125px] md:gap-7 md:py-8">
                        {/* NUMBER */}

                        <div>
                          <span className="font-serif text-3xl italic text-[#C39A92]">
                            {exercise.number}
                          </span>
                        </div>

                        {/* MOVEMENT */}

                        <div>
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
                  </div>
                );
              })}
            </div>
          </section>

          {/* LITTLE REMINDER */}

          <section className="mx-auto max-w-6xl py-10">
            <div className="grid gap-7 border-y border-[#DED0CB] py-8 md:grid-cols-[0.7fr_1.3fr] md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                  BEEN SITTING A WHILE?
                </p>

                <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                  a little movement counts. ♡
                </p>
              </div>

              <p className="text-[10px] leading-6 text-[#75635D] md:border-l md:border-[#DED0CB] md:pl-8">
                You do not need a full workout every time your body
                feels stiff. Stand up, change positions, walk around
                for a few minutes or use this reset whenever you need it.
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
              BREAK COMPLETE
            </p>

            <p className="mt-3 font-serif text-3xl italic text-[#A77B73] md:text-4xl">
              get up. move around. feel better. ♡
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