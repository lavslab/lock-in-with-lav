
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    name: "Cat-Cow",
    time: "60 SEC",
    cue: "From hands and knees, slowly alternate between gently rounding your spine and opening your chest. Let your breathing guide the movement.",
    easier:
      "Make the spinal movement smaller or perform it seated with your hands on your thighs.",
  },
  {
    name: "Child's Pose + Side Reach",
    time: "45 SEC / SIDE",
    cue: "Sit your hips back toward your heels, then walk both hands toward one side and breathe into your upper back and side body.",
    easier:
      "Keep your hips higher or place your hands on an elevated surface.",
  },
  {
    name: "90/90 Hip Switches",
    time: "60 SEC",
    cue: "Sit with both knees bent and slowly rotate them from side to side, moving through a comfortable range at your hips.",
    easier:
      "Place your hands behind you for support and make the movement smaller.",
  },
  {
    name: "Half-Kneeling Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "Gently tuck your pelvis and shift forward until you feel a comfortable stretch through the front of the hip.",
    easier:
      "Use padding under your knee and reduce the forward shift.",
  },
  {
    name: "Figure-Four Glute Stretch",
    time: "45 SEC / SIDE",
    cue: "Lie on your back, cross one ankle over the opposite thigh and gently draw the legs toward you until you feel the outer hip and glute.",
    easier:
      "Keep the supporting foot on the floor instead of drawing the legs toward you.",
  },
  {
    name: "Open Book Rotations",
    time: "45 SEC / SIDE",
    cue: "Lie on your side with your knees bent and slowly open the top arm across your body, allowing your upper back to rotate comfortably.",
    easier:
      "Use a smaller rotation and keep the top hand closer to your body.",
  },
  {
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
                MOVEMENT ESSENTIALS · RECOVERY
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                Rest-Day{" "}
                <span className="italic text-[#A77B73]">
                  Reset. ♡
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                Gentle movement for the days your body needs less, not
                more. Move a little, breathe a little and leave feeling
                better than you started.
              </p>

              <p className="mt-4 text-[9px] tracking-[0.15em] text-[#9D6F67]">
                10–15 MIN · 7 MOVES · NO EQUIPMENT
              </p>
            </header>

            <section className="border-b border-[#DED0CB] py-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    01 · YOUR RESET
                  </p>

                  <h2 className="mt-2 font-serif text-xl sm:text-2xl">
                    Easy movement.{" "}
                    <span className="italic text-[#A77B73]">
                      no pressure. ♡
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
                                Make it easier:{" "}
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
                Rest counts too. Recovery movement should feel easy and
                comfortable. You do not need to push your range or turn
                this into another workout. Stop if a movement causes
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
