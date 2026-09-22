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
    easier: "Make the spinal movement smaller or perform it seated with your hands on your thighs.",
  },
  {
    number: "02",
    name: "Child's Pose + Side Reach",
    time: "45 SEC / SIDE",
    cue: "Sit your hips back toward your heels, then walk both hands toward one side and breathe into your upper back and side body.",
    easier: "Keep your hips higher or place your hands on an elevated surface.",
  },
  {
    number: "03",
    name: "90/90 Hip Switches",
    time: "60 SEC",
    cue: "Sit with both knees bent and slowly rotate them from side to side, moving through a comfortable range at your hips.",
    easier: "Place your hands behind you for support and make the movement smaller.",
  },
  {
    number: "04",
    name: "Half-Kneeling Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "Gently tuck your pelvis and shift forward until you feel a comfortable stretch through the front of the hip.",
    easier: "Use padding under your knee and reduce the forward shift.",
  },
  {
    number: "05",
    name: "Figure-Four Glute Stretch",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, cross one ankle over the opposite thigh and gently draw the legs toward you until you feel the outer hip and glute.",
    easier: "Keep the supporting foot on the floor instead of drawing the legs toward you.",
  },
  {
    number: "06",
    name: "Open Book Rotations",
    time: "45 SEC / SIDE",
    cue: "Lie on your side with your knees bent and slowly open the top arm across your body, allowing your upper back to rotate comfortably.",
    easier: "Use a smaller rotation and keep the top hand closer to your body.",
  },
  {
    number: "07",
    name: "Legs Up the Wall",
    time: "2–3 MIN",
    cue: "Lie comfortably with your legs supported against a wall and let your breathing slow. Keep your shoulders, jaw and hands relaxed.",
    easier: "Rest your lower legs on a couch or chair instead of placing them against a wall.",
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
              RECOVERY • REST DAY
            </p>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Rest-Day Reset
              <span className="block italic text-[#DDB5AE]">Warm-Up. ♡</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-2">
              {["10–15 MIN", "7 MOVES", "NO EQUIPMENT", "AT HOME"].map((tag) => (
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
              nothing to prove today. just reset. ♡
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
