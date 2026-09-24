"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "March + Knee Drive",
    time: "45 SEC",
    cue: "March in place and gradually drive each knee a little higher while keeping your torso tall.",
    easier: "Keep the knee lift low and use a wall or bench for balance.",
  },
  {
    number: "02",
    name: "Hip Circles",
    time: "30 SEC",
    cue: "Stand tall with soft knees and slowly circle your hips through a comfortable range in both directions.",
    easier: "Make the circles smaller and hold a stable surface for support.",
  },
  {
    number: "03",
    name: "Bodyweight Good Mornings",
    time: "45 SEC",
    cue: "Soften your knees, push your hips back and hinge forward with a long spine. Squeeze your glutes to stand.",
    easier: "Use a smaller hinge and place your hands on your hips for control.",
  },
  {
    number: "04",
    name: "Alternating Reverse Lunges",
    time: "45 SEC",
    cue: "Step one foot back, lower only as far as feels controlled, then drive through the front foot to return and switch sides.",
    easier: "Use a shorter step and shallow range, or hold a wall or rack for balance.",
  },
  {
    number: "05",
    name: "Bodyweight Squats",
    time: "45 SEC",
    cue: "Sit your hips back and down, keep your feet planted, then stand tall and squeeze your glutes.",
    easier: "Use a shallower squat or sit back toward a bench or chair.",
  },
  {
    number: "06",
    name: "Lateral Lunges",
    time: "45 SEC",
    cue: "Step out to one side, send your hips back over the stepping leg and keep the opposite leg long. Alternate sides.",
    easier: "Take a smaller side step and use a shallow range.",
  },
  {
    number: "07",
    name: "Glute Bridges",
    time: "45 SEC",
    cue: "Lie on your back with knees bent, press through your feet and squeeze your glutes to lift your hips without overextending your lower back.",
    easier: "Lift only as high as you can while keeping the movement comfortable and controlled.",
  },
];

export default function LowerBodyWarmUpPage() {
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
              WARM-UP • LOWER BODY
            </p>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Lower-Body
              <span className="block italic text-[#DDB5AE]">Warm-Up. ♡</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-2">
              {["6–8 MIN", "7 MOVES", "NO EQUIPMENT", "HOME + GYM"].map((tag) => (
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
                  One round.{" "}
                  <span className="italic text-[#A77B73]">keep moving. ♡</span>
                </h2>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#8C7770]">
                MOVE WITH CONTROL • NO RUSH
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
              Warm-ups should feel comfortable and gradually increase movement
              and body temperature. Stop if a movement causes sharp pain,
              numbness, dizziness or worsening symptoms.
            </p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              hips warm. legs ready. let&apos;s work. ♡
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
