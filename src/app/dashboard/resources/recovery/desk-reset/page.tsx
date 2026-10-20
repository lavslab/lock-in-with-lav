
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const exercises = [
  {
    name: "Shoulder Rolls",
    time: "30 SEC",
    cue: "Sit or stand tall and slowly roll your shoulders up, back and down. Keep your neck relaxed.",
    easier: "Make the circles smaller and move one shoulder at a time.",
  },
  {
    name: "Gentle Neck Stretch",
    time: "30 SEC / SIDE",
    cue: "Keep your shoulders relaxed and gently tilt one ear toward the same-side shoulder without pulling on your head.",
    easier: "Use a very small tilt and keep your gaze forward.",
  },
  {
    name: "Seated Chest Opener",
    time: "45 SEC",
    cue: "Sit tall, gently reach your arms behind you and open across your chest while keeping your ribs relaxed.",
    easier: "Keep your hands apart and reach only slightly behind your body.",
  },
  {
    name: "Seated T-Spine Rotation",
    time: "45 SEC / SIDE",
    cue: "Sit tall with your feet grounded and gently rotate your upper body toward one side, then return to centre.",
    easier: "Use a smaller rotation and keep your hands resting on your thighs.",
  },
  {
    name: "Standing Hip Flexor Stretch",
    time: "45 SEC / SIDE",
    cue: "Step one foot back, gently tuck your pelvis and shift your weight forward until you feel the front of the hip open.",
    easier: "Shorten your stance and hold your desk or chair for support.",
  },
  {
    name: "Standing Hamstring Hinge",
    time: "45 SEC / SIDE",
    cue: "Place one heel slightly forward, soften the opposite knee and gently hinge from your hips with a long spine.",
    easier: "Keep both knees softly bent and make the hinge smaller.",
  },
  {
    name: "Standing Reach + Side Bend",
    time: "30 SEC / SIDE",
    cue: "Reach one arm overhead and gently lean to the opposite side, creating length through your side body.",
    easier: "Keep the reaching arm lower and use a smaller side bend.",
  },
];

export default function DeskResetPage() {
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
                Desk + Sitting{" "}
                <span className="italic text-[#A77B73]">
                  Reset. ♡
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                A quick movement break for your neck, shoulders,
                upper back and hips after sitting for a while.
                No workout clothes required.
              </p>

              <p className="mt-4 text-[9px] tracking-[0.15em] text-[#9D6F67]">
                5–8 MIN · 7 MOVES · NO EQUIPMENT
              </p>
            </header>

            <section className="border-b border-[#DED0CB] py-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    01 · YOUR RESET
                  </p>

                  <h2 className="mt-2 font-serif text-xl sm:text-2xl">
                    Unfold a little.{" "}
                    <span className="italic text-[#A77B73]">
                      feel better. ♡
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
                    <div key={exercise.name}>
                      {index === 4 && (
                        <div className="border-b border-[#E1D3CE] bg-[#F1E6E2]/60 px-5 py-2.5">
                          <p className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                            NOW STAND UP ♡
                          </p>
                        </div>
                      )}

                      <div
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
                    </div>
                  );
                })}
              </div>
            </section>

            <footer className="pb-10 pt-6">
              <p className="max-w-xl text-[10px] leading-5 text-[#927D76]">
                A little movement counts. Recovery movement should feel
                easy and comfortable. You do not need to push your range
                or turn this into another workout. Stop if a movement
                causes sharp pain, numbness, dizziness or worsening symptoms.
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
