"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Child's Pose",
    time: "45 SEC",
    cue: "Sit your hips back toward your heels, reach your arms forward and let your upper body relax as you breathe slowly.",
    easier: "Place a cushion under your hips or keep your hips higher.",
  },
  {
    number: "02",
    name: "Half-Kneeling Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "From a half-kneeling position, gently tuck your pelvis and shift forward until you feel a comfortable stretch through the front of the hip.",
    easier: "Use padding under your knee and keep the forward shift small.",
  },
  {
    number: "03",
    name: "Figure-Four Glute Stretch",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, cross one ankle over the opposite thigh and gently draw the legs toward you until you feel the outer hip and glute.",
    easier: "Keep the supporting foot on the floor instead of pulling the legs toward you.",
  },
  {
    number: "04",
    name: "Hamstring Stretch",
    time: "45 SEC / SIDE",
    cue: "Extend one leg and gently hinge forward from your hips while keeping your spine long until you feel the back of the thigh.",
    easier: "Keep a soft bend in the knee and reduce the forward hinge.",
  },
  {
    number: "05",
    name: "Chest + Shoulder Stretch",
    time: "45 SEC",
    cue: "Clasp your hands behind you or reach them back gently, open across your chest and keep your shoulders relaxed away from your ears.",
    easier: "Keep your hands apart and simply reach your arms slightly behind your body.",
  },
  {
    number: "06",
    name: "Upper-Back Stretch",
    time: "45 SEC",
    cue: "Reach both arms forward, gently round through your upper back and let your shoulder blades spread apart as you breathe.",
    easier: "Keep your elbows bent and use a smaller reach.",
  },
  {
    number: "07",
    name: "Supine Spinal Twist",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, bring your knees toward your chest and gently lower them to one side while keeping the movement comfortable.",
    easier: "Place a pillow under your knees or keep the twist smaller.",
  },
];

export default function FullBodyStretchPage() {
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
              STRETCHING • FULL BODY
            </p>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Post-Workout Full-Body Stretch
              <span className="block italic text-[#DDB5AE]">Warm-Up. ♡</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-2">
              {["10 MIN", "7 MOVES", "NO EQUIPMENT", "HOME + GYM"].map((tag) => (
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
                  Slow it down.{" "}
                  <span className="italic text-[#A77B73]">breathe + release. ♡</span>
                </h2>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#8C7770]">
                RELAX INTO IT • NO BOUNCING
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
              Stretching should feel gentle and comfortable, not painful. Breathe,
              avoid bouncing and stop if a position causes sharp pain,
              numbness, dizziness or worsening symptoms.
            </p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              work done. now recover. ♡
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
