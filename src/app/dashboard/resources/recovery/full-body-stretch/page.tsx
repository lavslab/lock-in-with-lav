
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    name: "Child's Pose",
    time: "45 SEC",
    cue: "Sit your hips back toward your heels, reach your arms forward and let your upper body relax as you breathe slowly.",
    easier: "Place a cushion under your hips or keep your hips higher.",
  },
  {
    name: "Half-Kneeling Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "From a half-kneeling position, gently tuck your pelvis and shift forward until you feel a comfortable stretch through the front of the hip.",
    easier: "Use padding under your knee and keep the forward shift small.",
  },
  {
    name: "Figure-Four Glute Stretch",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, cross one ankle over the opposite thigh and gently draw the legs toward you until you feel the outer hip and glute.",
    easier: "Keep the supporting foot on the floor instead of pulling the legs toward you.",
  },
  {
    name: "Hamstring Stretch",
    time: "45 SEC / SIDE",
    cue: "Extend one leg and gently hinge forward from your hips while keeping your spine long until you feel the back of the thigh.",
    easier: "Keep a soft bend in the knee and reduce the forward hinge.",
  },
  {
    name: "Chest + Shoulder Stretch",
    time: "45 SEC",
    cue: "Clasp your hands behind you or reach them back gently, open across your chest and keep your shoulders relaxed away from your ears.",
    easier: "Keep your hands apart and simply reach your arms slightly behind your body.",
  },
  {
    name: "Upper-Back Stretch",
    time: "45 SEC",
    cue: "Reach both arms forward, gently round through your upper back and let your shoulder blades spread apart as you breathe.",
    easier: "Keep your elbows bent and use a smaller reach.",
  },
  {
    name: "Supine Spinal Twist",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, bring your knees toward your chest and gently lower them to one side while keeping the movement comfortable.",
    easier: "Place a pillow under your knees or keep the twist smaller.",
  },
];

export default function FullBodyStretchPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [expandedMovement, setExpandedMovement] = useState<number | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const savedName = user.user_metadata?.name;

        if (savedName && typeof savedName === "string") {
          setFirstName(savedName.split(" ")[0]);
        } else if (user.email) {
          setFirstName(user.email.split("@")[0]);
        }
      }

      setIsLoadingUser(false);
    };

    void getUser();
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
          <div className="mx-auto max-w-5xl">
            <header className="border-b border-[#DED0CB] pb-7">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                MOVEMENT ESSENTIALS · STRETCHING
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                Post-Workout{" "}
                <span className="italic text-[#A77B73]">
                  Full-Body Stretch. ♡
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                Ten quiet minutes to come down from your workout,
                release some tension and give your whole body a
                chance to settle.
              </p>

              <p className="mt-4 text-[9px] tracking-[0.15em] text-[#9D6F67]">
                10 MIN · 7 MOVES · NO EQUIPMENT
              </p>
            </header>

            <section className="border-b border-[#DED0CB] py-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    01 · YOUR STRETCH SEQUENCE
                  </p>

                  <h2 className="mt-2 font-serif text-xl sm:text-2xl">
                    Take it{" "}
                    <span className="italic text-[#A77B73]">
                      one breath at a time. ♡
                    </span>
                  </h2>
                </div>

                <p className="text-[10px] italic text-[#927D76]">
                  Tap to explore
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6]">
                {exercises.map((exercise, index) => {
                  const isExpanded = expandedMovement === index;

                  return (
                    <div
                      key={exercise.name}
                      className={
                        index !== exercises.length - 1
                          ? "border-b border-[#E1D3CE]"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMovement(isExpanded ? null : index)
                        }
                        aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-[#F1E6E2] sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-5 shrink-0 font-serif text-sm italic text-[#C39A92]">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div className="min-w-0">
                            <p className="text-[10px] font-medium tracking-[0.08em] text-[#211C19]">
                              {exercise.name}
                            </p>

                            <p className="mt-0.5 font-serif text-sm italic text-[#A77B73]">
                              {exercise.time}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 font-serif text-lg text-[#A77B73]">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#EADDD8] bg-[#F7F1ED]/70 px-4 py-4 sm:px-5">
                          <div className="space-y-3 pl-8">
                            <p className="text-[11px] leading-6 text-[#75635D]">
                              {exercise.cue}
                            </p>

                            <p className="text-[11px] leading-6 text-[#75635D]">
                              <span className="font-medium text-[#9D6F67]">
                                Gentler option:{" "}
                              </span>
                              {exercise.easier}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="pb-10 pt-6">
              <p className="max-w-xl text-[10px] leading-5 text-[#927D76]">
                Stretching should feel gentle and comfortable, not painful.
                Breathe, avoid bouncing and stop if a position causes
                sharp pain, numbness, dizziness or worsening symptoms.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5">
                <Link
                  href="/dashboard/resources/recovery"
                  className="text-[9px] tracking-[0.15em] text-[#8F655E] transition hover:text-[#211C19]"
                >
                  ← BACK TO MOBILITY + RECOVERY
                </Link>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
