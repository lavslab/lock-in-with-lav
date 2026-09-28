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

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73] sm:text-xl">
                slow it down. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recovery"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RECOVERY
            </Link>
          </header>

          {/* SOFT OPENING */}

          <section className="mx-auto max-w-6xl pb-10 pt-12 md:pb-12 md:pt-16">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#EAD8D3]/55">
              <div className="grid md:grid-cols-[1.45fr_0.55fr]">
                <div className="px-7 py-8 md:px-10 md:py-10">
                  <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                    STRETCHING • FULL BODY
                  </p>

                  <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[0.95] md:text-5xl lg:text-[3.5rem]">
                    Post-Workout{" "}
                    <span className="italic text-[#A77B73]">
                      Full-Body Stretch. ♡
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-[11px] leading-5 text-[#75635D]">
                    Ten quiet minutes to come down from your workout,
                    release some tension and give your whole body a chance
                    to settle.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      "10 MIN",
                      "7 MOVES",
                      "NO EQUIPMENT",
                      "HOME + GYM",
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

                <div className="flex items-center border-t border-[#D9C2BC] px-7 py-6 md:border-l md:border-t-0 md:px-8">
                  <p className="font-serif text-xl italic leading-8 text-[#A77B73] md:text-2xl">
                    breathe.
                    <br />
                    soften.
                    <br />
                    release. ♡
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SETTLE IN */}

          <section className="mx-auto max-w-3xl pb-14 text-center">
            <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
              SETTLE IN
            </p>

            <p className="mt-4 font-serif text-2xl italic leading-relaxed text-[#A77B73] md:text-3xl">
              Nothing to chase here. Hold gently, breathe slowly
              and let the workout be done. ♡
            </p>

            <p className="mt-5 text-[7px] tracking-[0.2em] text-[#927D76]">
              RELAX INTO IT • BREATHE • NO BOUNCING
            </p>
          </section>

          {/* SEQUENCE */}

          <section className="mx-auto max-w-5xl pb-6">
            <div className="mb-10 text-center">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR STRETCH SEQUENCE
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Take it{" "}
                <span className="italic text-[#A77B73]">
                  one breath at a time. ♡
                </span>
              </h2>
            </div>

            {/* TIMELINE */}

            <div className="relative">
              <div className="absolute bottom-0 left-[22px] top-0 w-px bg-[#D9C2BC] sm:left-[27px] md:left-[31px]" />

              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <article
                    key={exercise.number}
                    className="relative grid grid-cols-[46px_1fr] gap-5 py-8 sm:grid-cols-[56px_1fr] sm:gap-7 md:grid-cols-[64px_1fr] md:gap-9 md:py-10"
                  >
                    {/* TIMELINE NUMBER */}

                    <div className="relative z-10 flex justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CBA9A2] bg-[#F7F1ED] sm:h-14 sm:w-14">
                        <span className="font-serif text-base italic text-[#A77B73] sm:text-lg">
                          {exercise.number}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="border-b border-[#DED0CB] pb-8 md:pb-10">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <h3 className="max-w-2xl font-serif text-2xl leading-tight md:text-3xl">
                          {exercise.name}
                        </h3>

                        <span className="w-fit shrink-0 text-[7px] tracking-[0.2em] text-[#9D6F67]">
                          {exercise.time}
                        </span>
                      </div>

                      <p className="mt-4 max-w-3xl text-xs leading-6 text-[#6F5F59] sm:text-sm sm:leading-7">
                        {exercise.cue}
                      </p>

                      <div className="mt-5 flex items-start gap-3">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#C39A92]" />

                        <p className="text-[10px] leading-5 text-[#927D76] sm:text-xs">
                          <span className="mr-2 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                            GENTLER OPTION
                          </span>
                          {exercise.easier}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* BREATHING REMINDER */}

          <section className="mx-auto max-w-5xl py-10 md:py-14">
            <div className="grid gap-6 border-y border-[#DED0CB] py-9 text-center md:grid-cols-3 md:text-left">
              <div>
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  INHALE
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                  make space.
                </p>
              </div>

              <div className="md:border-x md:border-[#DED0CB] md:px-8">
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  EXHALE
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                  soften into it.
                </p>
              </div>

              <div className="md:pl-8">
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  REPEAT
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                  no rush. ♡
                </p>
              </div>
            </div>
          </section>

          {/* SAFETY NOTE */}

          <section className="mx-auto max-w-5xl pb-9">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Movement note: Stretching should feel gentle and
              comfortable, not painful. Breathe, avoid bouncing
              and stop if a position causes sharp pain, numbness,
              dizziness or worsening symptoms.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-5xl pb-14 pt-5 text-center">
            <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
              SESSION COMPLETE
            </p>

            <p className="mt-3 font-serif text-3xl italic text-[#A77B73] md:text-4xl">
              work done. now recover. ♡
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