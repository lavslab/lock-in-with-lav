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

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                get ready to move. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recovery"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RECOVERY
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
              RECOVERY • DESK + SITTING
            </p>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Desk + Sitting Reset
              <span className="block italic text-[#DDB5AE]">Warm-Up. ♡</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-2">
              {["5–8 MIN", "7 MOVES", "NO EQUIPMENT", "ANYWHERE"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#6E5A55] px-4 py-2 text-[7px] tracking-[0.18em] text-[#DDB5AE]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="py-10">
            <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  THE ROUTINE
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Take your time.{" "}
                  <span className="italic text-[#A77B73]">move. breathe. reset. ♡</span>
                </h2>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#8C7770]">
                GENTLE MOVEMENT • EASY PACE
              </p>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise) => (
                <article
                  key={exercise.number}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7"
                >
                  <div className="grid gap-5 md:grid-cols-[70px_1fr_auto] md:items-start">
                    <span className="font-serif text-4xl text-[#D2B0A9]">
                      {exercise.number}
                    </span>

                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl">
                        {exercise.name}
                      </h3>

                      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6F5F59]">
                        {exercise.cue}
                      </p>

                      <p className="mt-3 text-xs leading-5 text-[#9D6F67]">
                        <span className="tracking-[0.12em]">MAKE IT EASIER:</span>{" "}
                        {exercise.easier}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-[#EAD8D3] px-4 py-2 text-[8px] tracking-[0.18em] text-[#8F655E]">
                      {exercise.time}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-xs leading-5 text-[#8C7770]">
              Recovery movement should feel easy and comfortable. You do not need to
              push your range or turn this into another workout. Stop if a
              movement causes sharp pain, numbness, dizziness or worsening symptoms.
            </p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              get up. move around. feel better. ♡
            </p>

            <Link
              href="/dashboard/resources/recovery"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.25em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO MOBILITY + RECOVERY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
