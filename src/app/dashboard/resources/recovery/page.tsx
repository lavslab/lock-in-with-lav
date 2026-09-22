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
    description: "Quick routines to use before strength training or cardio.",
    href: "#warm-ups",
  },
  {
    number: "02",
    title: "MOBILITY",
    subtitle: "move a little better.",
    description: "Focused routines for hips, lower body and upper body.",
    href: "#mobility",
  },
  {
    number: "03",
    title: "STRETCHING",
    subtitle: "slow it down.",
    description: "Simple post-workout and full-body stretching routines.",
    href: "#stretching",
  },
  {
    number: "04",
    title: "RECOVERY",
    subtitle: "rest counts too. ♡",
    description: "Easy reset routines for recovery and lower-intensity days.",
    href: "#recovery",
  },
];

const sections = [
  {
    id: "warm-ups",
    label: "WARM-UPS",
    title: "Before you train.",
    subtitle: "wake everything up. ♡",
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
    label: "MOBILITY",
    title: "Move with more freedom.",
    subtitle: "small work. big difference.",
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
    label: "STRETCHING",
    title: "After the work.",
    subtitle: "slow down + reset. ♡",
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
    label: "RECOVERY",
    title: "Take the pressure off.",
    subtitle: "recovery is part of training.",
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

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                take care of your body. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  MOBILITY + RECOVERY
                </p>

                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Move well.
                  <span className="block italic text-[#DDB5AE]">
                    recover well. ♡
                  </span>
                </h1>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#BFAEAA]">
                WARM UP • MOVE • STRETCH • RESET
              </p>
            </div>
          </section>

          <section className="py-10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {categories.map((category) => (
                <a
                  key={category.number}
                  href={category.href}
                  className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2]"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      {category.number}
                    </span>
                    <span className="font-serif text-lg text-[#A77B73] transition group-hover:translate-y-1">
                      ↓
                    </span>
                  </div>

                  <p className="mt-6 text-[8px] tracking-[0.22em]">
                    {category.title}
                  </p>

                  <h2 className="mt-2 font-serif text-xl italic text-[#A77B73]">
                    {category.subtitle}
                  </h2>

                  <p className="mt-4 text-xs leading-5 text-[#806E68]">
                    {category.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-8 border-t border-[#DED0CB] py-10"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                    {section.label}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                    {section.title}
                  </h2>
                </div>

                <p className="font-serif text-lg italic text-[#A77B73]">
                  {section.subtitle}
                </p>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                {section.routines.map((routine) => (
                  <Link
                    key={routine.title}
                    href={routine.href}
                    className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm"
                  >
                    <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                      {routine.meta}
                    </p>

                    <h3 className="mt-4 font-serif text-2xl">
                      {routine.title}
                    </h3>

                    <div className="mt-7 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                      <span className="text-[7px] tracking-[0.23em] text-[#9D6F67]">
                        OPEN ROUTINE
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-xs leading-5 text-[#8C7770]">
              Move within a comfortable range. Stop if a movement causes sharp
              pain, numbness, dizziness or worsening symptoms, and get
              appropriate medical guidance when needed.
            </p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              recovery is part of the work. ♡
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.25em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
