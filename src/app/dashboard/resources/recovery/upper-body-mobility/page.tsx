"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    number: "01",
    name: "Shoulder CARs",
    time: "45 SEC / SIDE",
    cue: "Slowly circle one arm through the largest comfortable range you can control while keeping your ribs and torso mostly still.",
    easier: "Make the circle smaller and bend your elbow slightly if needed.",
  },
  {
    number: "02",
    name: "Thread the Needle",
    time: "45 SEC / SIDE",
    cue: "From hands and knees, slide one arm underneath your body and gently rotate through your upper back, then return.",
    easier: "Use a smaller rotation or perform the movement seated.",
  },
  {
    number: "03",
    name: "Open Book Rotations",
    time: "45 SEC / SIDE",
    cue: "Lie on your side with knees bent and arms together. Slowly open the top arm across your body while letting your upper back rotate.",
    easier: "Reduce the rotation and keep the top hand closer to your body.",
  },
  {
    number: "04",
    name: "Wall Slides",
    time: "60 SEC",
    cue: "Stand against a wall and slowly slide your arms upward and back down while keeping the movement controlled and your ribs relaxed.",
    easier: "Move only as high as your shoulders comfortably allow.",
  },
  {
    number: "05",
    name: "Scapular Push-Ups",
    time: "45 SEC",
    cue: "Keep your elbows straight as you gently let your chest sink between your shoulders, then push the floor away.",
    easier: "Perform the movement against a wall, counter or bench.",
  },
  {
    number: "06",
    name: "Child's Pose Side Reach",
    time: "45 SEC / SIDE",
    cue: "From child's pose, walk both hands toward one side and breathe into the stretch along your upper back and side body.",
    easier: "Keep your hips higher or perform the reach with your hands on an elevated surface.",
  },
];

export default function UpperBodyMobilityPage() {
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
                make space to move. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recovery"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RECOVERY
            </Link>
          </header>

          {/* MOBILITY INTRO */}

          <section className="mx-auto max-w-5xl pb-12 pt-16 text-center md:pb-16 md:pt-24">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-[#CBA9A2]" />

              <p className="text-[8px] tracking-[0.38em] text-[#9D6F67]">
                MOBILITY • UPPER BODY
              </p>

              <span className="h-px w-10 bg-[#CBA9A2]" />
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Upper-Body
              <span className="block italic text-[#A77B73]">
                Mobility. ♡
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-xs leading-6 text-[#75635D]">
              A slow, controlled flow for your shoulders, upper
              back and shoulder blades. Explore comfortable range
              and let each movement create a little more space.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3">
              {[
                "8–10 MIN",
                "6 MOVES",
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
          </section>

          {/* MOBILITY FOCUS */}

          <section className="mx-auto max-w-6xl pb-14">
            <div className="rounded-[2rem] border border-[#DCCAC5] bg-[#EAD8D3]/45 px-6 py-7 sm:px-8 md:px-10 md:py-9">
              <div className="grid gap-7 md:grid-cols-[0.65fr_1.35fr] md:items-center">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#8F655E]">
                    MOBILITY FOCUS
                  </p>

                  <p className="mt-3 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                    open up. move freely. ♡
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-[#D9C2BC] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <div>
                    <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      01
                    </p>
                    <p className="mt-2 font-serif text-base">
                      Shoulders
                    </p>
                  </div>

                  <div>
                    <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      02
                    </p>
                    <p className="mt-2 font-serif text-base">
                      Upper Back
                    </p>
                  </div>

                  <div>
                    <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      03
                    </p>
                    <p className="mt-2 font-serif text-base">
                      Scapula
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROUTINE INTRO */}

          <section className="mx-auto max-w-6xl pb-7">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  YOUR FLOW
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Move slowly.{" "}
                  <span className="italic text-[#A77B73]">
                    find your range. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.2em] text-[#927D76]">
                SLOW + CONTROLLED • NO FORCING
              </p>
            </div>
          </section>

          {/* MOVEMENT FLOW */}

          <section className="mx-auto max-w-6xl">
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <article
                  key={exercise.number}
                  className={`overflow-hidden rounded-[1.75rem] border border-[#DED0CB] ${
                    index % 2 === 0
                      ? "bg-[#FBF8F6]"
                      : "bg-[#F1E5E1]/55"
                  }`}
                >
                  <div className="grid md:grid-cols-[135px_1fr]">
                    {/* NUMBER + TIME */}

                    <div className="flex items-center justify-between border-b border-[#DED0CB] px-6 py-5 md:flex-col md:items-start md:justify-between md:border-b-0 md:border-r md:px-7 md:py-7">
                      <span className="font-serif text-4xl italic text-[#C39A92] md:text-5xl">
                        {exercise.number}
                      </span>

                      <span className="rounded-full border border-[#CBA9A2] px-3.5 py-2 text-[7px] tracking-[0.18em] text-[#8F655E]">
                        {exercise.time}
                      </span>
                    </div>

                    {/* MOVEMENT */}

                    <div className="px-6 py-6 md:px-8 md:py-7">
                      <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                        {exercise.name}
                      </h3>

                      <p className="mt-4 max-w-3xl text-xs leading-6 text-[#6F5F59] sm:text-sm sm:leading-7">
                        {exercise.cue}
                      </p>

                      <div className="mt-6 border-t border-[#DED0CB] pt-4">
                        <p className="text-[10px] leading-5 text-[#927D76] sm:text-xs">
                          <span className="mr-3 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                            MODIFY
                          </span>
                          {exercise.easier}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* REMINDER */}

          <section className="mx-auto max-w-6xl py-12 md:py-16">
            <div className="border-y border-[#DED0CB] py-8 text-center md:py-10">
              <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                REMEMBER
              </p>

              <p className="mx-auto mt-3 max-w-2xl font-serif text-2xl italic leading-relaxed text-[#A77B73] md:text-3xl">
                control matters more than range. move through
                what feels available today. ♡
              </p>
            </div>
          </section>

          {/* SAFETY */}

          <section className="mx-auto max-w-6xl pb-8">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Movement note: Mobility work should feel controlled
              and comfortable, not forced. Move within your
              available range and stop if a movement causes sharp
              pain, numbness, dizziness or worsening symptoms.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 pt-5 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              shoulders open. upper back moving. ♡
            </p>

            <Link
              href="/dashboard/resources/recovery"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO MOBILITY + RECOVERY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}