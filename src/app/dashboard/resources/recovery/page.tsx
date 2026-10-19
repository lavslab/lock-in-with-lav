
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const sections = [
  {
    id: "warm-ups",
    number: "01",
    title: "Warm-Ups",
    subtitle: "Before you move.",
    description:
      "Prepare your body for the workout ahead.",
    routines: [
      {
        title: "5-Min Full-Body Warm-Up",
        meta: "5 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/full-body-warm-up",
      },
      {
        title: "Lower-Body Warm-Up",
        meta: "6–8 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-warm-up",
      },
      {
        title: "Upper-Body Warm-Up",
        meta: "5–7 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-warm-up",
      },
    ],
  },
  {
    id: "mobility",
    number: "02",
    title: "Mobility",
    subtitle: "Move with ease.",
    description:
      "Create space for more comfortable, controlled movement.",
    routines: [
      {
        title: "Lower-Body Mobility",
        meta: "8–10 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-mobility",
      },
      {
        title: "Hip Mobility",
        meta: "8 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/hip-mobility",
      },
      {
        title: "Upper-Body Mobility",
        meta: "8–10 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-mobility",
      },
    ],
  },
  {
    id: "stretching",
    number: "03",
    title: "Stretching",
    subtitle: "Slow it down.",
    description:
      "Gentle stretches for after training or whenever you need them.",
    routines: [
      {
        title: "Post-Workout Full-Body Stretch",
        meta: "10 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/full-body-stretch",
      },
      {
        title: "Lower-Body Stretch",
        meta: "8–10 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-stretch",
      },
      {
        title: "Upper-Body Stretch",
        meta: "8 MIN · HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-stretch",
      },
    ],
  },
  {
    id: "recovery",
    number: "04",
    title: "Recovery",
    subtitle: "A little reset.",
    description:
      "Lower-intensity movement for rest days and slower moments.",
    routines: [
      {
        title: "Rest-Day Reset",
        meta: "10–15 MIN · AT HOME",
        href: "/dashboard/resources/recovery/rest-day-reset",
      },
      {
        title: "Gentle Full-Body Reset",
        meta: "10 MIN · AT HOME",
        href: "/dashboard/resources/recovery/gentle-full-body-reset",
      },
      {
        title: "Desk + Sitting Reset",
        meta: "5–8 MIN · ANYWHERE",
        href: "/dashboard/resources/recovery/desk-reset",
      },
    ],
  },
];

export default function RecoveryPage() {
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

      if (savedName && typeof savedName === "string") {
        setFirstName(savedName.split(" ")[0]);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
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

            {/* HEADER */}
            <header className="border-b border-[#DED0CB] pb-7">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                MOVEMENT ESSENTIALS
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight text-[#211C19] sm:text-4xl">
                Mobility{" "}
                <span className="italic text-[#A77B73]">
                  & Recovery.
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#806E68]">
                A little care goes a long way. Warm up, move
                comfortably, stretch, and give your body time
                to recover.
              </p>
            </header>

            {/* ROUTINE LIBRARY */}
            <div className="divide-y divide-[#DED0CB]">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 py-8"
                >
                  <div className="mb-5 flex items-start gap-3">
                    <span className="pt-0.5 font-serif text-lg italic text-[#C39A92]">
                      {section.number}
                    </span>

                    <div>
                      <h2 className="font-serif text-xl text-[#211C19] sm:text-2xl">
                        {section.title}
                        <span className="ml-2 italic text-[#A77B73]">
                          {section.subtitle}
                        </span>
                      </h2>

                      <p className="mt-1.5 text-[10px] leading-5 text-[#806E68]">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6] px-4 sm:px-5">
                    {section.routines.map((routine, index) => (
                      <Link
                        key={routine.href}
                        href={routine.href}
                        className={`group flex items-center justify-between gap-4 py-4 transition ${
                          index !== section.routines.length - 1
                            ? "border-b border-[#E1D3CE]"
                            : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <h3 className="font-serif text-base leading-snug text-[#211C19] transition group-hover:text-[#A77B73] sm:text-lg">
                            {routine.title}
                          </h3>

                          <p className="mt-1.5 text-[8px] tracking-[0.14em] text-[#927D76]">
                            {routine.meta}
                          </p>
                        </div>

                        <span className="shrink-0 text-lg text-[#A77B73] transition group-hover:translate-x-1">
                          ↗
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* FOOTER */}
            <footer className="border-t border-[#DED0CB] pb-10 pt-6">
              <p className="max-w-xl text-[10px] leading-5 text-[#927D76]">
                Move within a comfortable range. Stop if a
                movement causes sharp pain, numbness,
                dizziness, or worsening symptoms, and seek
                medical guidance when needed.
              </p>

              <Link
                href="/dashboard/guide"
                className="mt-5 inline-block text-[9px] tracking-[0.15em] text-[#8F655E] transition hover:text-[#211C19]"
              >
                ← BACK TO TRAIN
              </Link>
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}
