"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const categories = [
  {
    number: "01",
    title: "WARM-UPS",
    subtitle: "get ready to move. ♡",
    href: "#warm-ups",
  },
  {
    number: "02",
    title: "MOBILITY",
    subtitle: "move a little better.",
    href: "#mobility",
  },
  {
    number: "03",
    title: "STRETCHING",
    subtitle: "slow it down.",
    href: "#stretching",
  },
  {
    number: "04",
    title: "RECOVERY",
    subtitle: "rest counts too. ♡",
    href: "#recovery",
  },
];

const sections = [
  {
    id: "warm-ups",
    number: "01",
    label: "WARM-UPS",
    title: "Before you train.",
    subtitle: "wake everything up. ♡",
    description:
      "Quick routines to prepare your body for strength training, cardio or whatever movement you have planned.",
    routines: [
      {
        title: "5-Min Full-Body Warm-Up",
        meta: "5 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/full-body-warm-up",
      },
      {
        title: "Lower-Body Warm-Up",
        meta: "6–8 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-warm-up",
      },
      {
        title: "Upper-Body Warm-Up",
        meta: "5–7 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-warm-up",
      },
    ],
  },
  {
    id: "mobility",
    number: "02",
    label: "MOBILITY",
    title: "Move with more freedom.",
    subtitle: "small work. big difference.",
    description:
      "Focused mobility work for your hips, lower body and upper body when you want a little more room to move.",
    routines: [
      {
        title: "Lower-Body Mobility",
        meta: "8–10 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-mobility",
      },
      {
        title: "Hip Mobility",
        meta: "8 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/hip-mobility",
      },
      {
        title: "Upper-Body Mobility",
        meta: "8–10 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-mobility",
      },
    ],
  },
  {
    id: "stretching",
    number: "03",
    label: "STRETCHING",
    title: "After the work.",
    subtitle: "slow down + reset. ♡",
    description:
      "Simple stretches for after training or whenever your body could use a slower, quieter few minutes.",
    routines: [
      {
        title: "Post-Workout Full-Body Stretch",
        meta: "10 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/full-body-stretch",
      },
      {
        title: "Lower-Body Stretch",
        meta: "8–10 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/lower-body-stretch",
      },
      {
        title: "Upper-Body Stretch",
        meta: "8 MIN • HOME + GYM",
        href: "/dashboard/resources/recovery/upper-body-stretch",
      },
    ],
  },
  {
    id: "recovery",
    number: "04",
    label: "RECOVERY",
    title: "Take the pressure off.",
    subtitle: "recovery is part of training.",
    description:
      "Gentle routines for rest days, lower-intensity days or moments when your body needs less instead of more.",
    routines: [
      {
        title: "Rest-Day Reset",
        meta: "10–15 MIN • AT HOME",
        href: "/dashboard/resources/recovery/rest-day-reset",
      },
      {
        title: "Gentle Full-Body Reset",
        meta: "10 MIN • AT HOME",
        href: "/dashboard/resources/recovery/gentle-full-body-reset",
      },
      {
        title: "Desk + Sitting Reset",
        meta: "5–8 MIN • ANYWHERE",
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
                take care of your body. ♡
              </p>
            </div>

            </header>

          {/* INTRO */}

          <section className="mx-auto max-w-6xl pb-10 pt-14 md:pb-14 md:pt-20">
            <div className="grid gap-8 border-b border-[#DED0CB] pb-10 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-12">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                    MOBILITY + RECOVERY
                  </p>

                  <span className="h-px w-8 bg-[#CBA9A2]" />
                </div>

                <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
                  Move well.
                  <span className="block italic text-[#A77B73]">
                    recover well. ♡
                  </span>
                </h1>
              </div>

              <div className="md:pb-1">
                <p className="max-w-md text-xs leading-6 text-[#75635D]">
                  Warm up before the work, move through the
                  ranges your body needs and give recovery the
                  same attention you give training.
                </p>

                <p className="mt-5 text-[7px] tracking-[0.22em] text-[#9D6F67]">
                  WARM UP • MOVE • STRETCH • RESET
                </p>
              </div>
            </div>
          </section>

          {/* QUICK NAV */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  FIND WHAT YOU NEED
                </p>

                <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                  Where are we{" "}
                  <span className="italic text-[#A77B73]">
                    starting? ♡
                  </span>
                </h2>
              </div>

              <p className="hidden font-serif text-sm italic text-[#A77B73] sm:block">
                pick a section.
              </p>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <a
                  key={category.number}
                  href={category.href}
                  className={`group flex items-center gap-4 px-5 py-5 transition hover:bg-[#F1E5E1] ${
                    index !== categories.length - 1
                      ? "border-b border-[#E8DDD9] lg:border-b-0 lg:border-r"
                      : ""
                  } ${
                    index === 1
                      ? "sm:border-b sm:border-l lg:border-b-0 lg:border-l-0"
                      : ""
                  } ${
                    index === 2
                      ? "sm:border-r lg:border-r"
                      : ""
                  }`}
                >
                  <span className="font-serif text-2xl italic text-[#C39A92]">
                    {category.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[7px] tracking-[0.2em] text-[#8F655E]">
                      {category.title}
                    </p>

                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      {category.subtitle}
                    </p>
                  </div>

                  <span className="font-serif text-lg text-[#A77B73] transition group-hover:translate-y-1">
                    ↓
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* ROUTINE SECTIONS */}

          <div className="mx-auto max-w-6xl">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 border-t border-[#DED0CB] py-12 md:py-14"
              >
                <div className="grid gap-7 md:grid-cols-[0.85fr_2fr] md:gap-12">
                  {/* SECTION INTRO */}

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-3xl italic text-[#C39A92]">
                        {section.number}
                      </span>

                      <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                        {section.label}
                      </p>
                    </div>

                    <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                      {section.title}
                    </h2>

                    <p className="mt-2 font-serif text-base italic text-[#A77B73] md:text-lg">
                      {section.subtitle}
                    </p>

                    <p className="mt-4 max-w-sm text-[10px] leading-5 text-[#806E68] sm:text-xs sm:leading-6">
                      {section.description}
                    </p>
                  </div>

                  {/* ROUTINES */}

                  <div className="divide-y divide-[#E1D3CE] border-y border-[#DED0CB]">
                    {section.routines.map((routine) => (
                      <Link
                        key={routine.title}
                        href={routine.href}
                        className="group flex items-center justify-between gap-5 py-5"
                      >
                        <div className="min-w-0">
                          <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                            {routine.meta}
                          </p>

                          <h3 className="mt-2 font-serif text-xl leading-snug transition group-hover:text-[#A77B73] sm:text-2xl">
                            {routine.title}
                          </h3>
                        </div>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition group-hover:bg-[#EAD8D3] group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* SAFETY NOTE */}

          <section className="mx-auto max-w-6xl border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Movement note: Move within a comfortable range.
              Stop if a movement causes sharp pain, numbness,
              dizziness or worsening symptoms, and get
              appropriate medical guidance when needed.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 pt-5 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              recovery is part of the work. ♡
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              BACK TO RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}