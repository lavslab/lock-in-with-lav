"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Cross-Body Shoulder Stretch",
    time: "45 SEC / SIDE",
    cue: "Bring one arm across your chest and gently draw it closer with the opposite arm while keeping your shoulder relaxed.",
    easier: "Use less pressure and keep the arm slightly lower.",
  },
  {
    number: "02",
    name: "Overhead Triceps Stretch",
    time: "45 SEC / SIDE",
    cue: "Reach one arm overhead, bend the elbow and let your hand fall behind your head. Use the opposite hand for a gentle assist.",
    easier: "Skip the assist and keep the elbow in the most comfortable position.",
  },
  {
    number: "03",
    name: "Doorway Chest Stretch",
    time: "45 SEC / SIDE",
    cue: "Place your forearm against a doorway or stable upright surface and gently turn your body away until you feel the front of your chest and shoulder.",
    easier: "Keep your arm lower and use a smaller turn.",
  },
  {
    number: "04",
    name: "Upper-Back Stretch",
    time: "45 SEC",
    cue: "Reach both arms forward, gently round through your upper back and let your shoulder blades spread apart as you breathe.",
    easier: "Keep your elbows bent and use a smaller reach.",
  },
  {
    number: "05",
    name: "Child's Pose Side Reach",
    time: "45 SEC / SIDE",
    cue: "From child's pose, walk both hands toward one side and breathe into the stretch along your upper back and side body.",
    easier: "Keep your hips higher or place your hands on an elevated surface.",
  },
  {
    number: "06",
    name: "Gentle Neck Stretch",
    time: "30 SEC / SIDE",
    cue: "Sit or stand tall and gently tilt one ear toward the same-side shoulder while keeping both shoulders relaxed.",
    easier: "Use a very small tilt and do not pull on your head.",
  },
];

export default function UpperBodyStretchPage() {
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
                    STRETCHING • UPPER BODY
                  </p>

                  <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[0.95] md:text-5xl lg:text-[3.5rem]">
                    Upper-Body{" "}
                    <span className="italic text-[#A77B73]">
                      Stretch. ♡
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-[11px] leading-5 text-[#75635D]">
                    A gentle sequence for your shoulders, chest,
                    upper back and neck after training or whenever
                    your upper body needs a little release.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      "8 MIN",
                      "6 MOVES",
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
              Drop your shoulders. Unclench your jaw.
              Let your upper body soften. ♡
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
                  let it go.
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
              shoulders down. breathe. reset. ♡
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