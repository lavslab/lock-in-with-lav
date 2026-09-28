"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};

/* ---------------------------------
   RESOURCE ICONS
--------------------------------- */

function WorkoutIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 9v6" />
      <path d="M3.5 10.5v3" />
      <path d="M17.5 9v6" />
      <path d="M20.5 10.5v3" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

function RecipeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 3.5v6" />
      <path d="M4.5 3.5v3.25A2.5 2.5 0 0 0 7 9.25a2.5 2.5 0 0 0 2.5-2.5V3.5" />
      <path d="M7 9.25V20.5" />
      <path d="M16.5 3.5c-1.75 1.4-2.5 3.4-2.5 5.6 0 2.05.8 3.4 2.5 3.4" />
      <path d="M16.5 3.5v17" />
    </svg>
  );
}

function MealPlanIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="m8.5 10 1.25 1.25L12 9" />
      <path d="M14 10h2" />
      <path d="m8.5 15 1.25 1.25L12 14" />
      <path d="M14 15h2" />
    </svg>
  );
}

function RecoveryIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.25s-7-4.2-7-10.05A4.2 4.2 0 0 1 12 7.1a4.2 4.2 0 0 1 7 3.1c0 5.85-7 10.05-7 10.05Z" />
      <path d="M8.5 12h2l1.1-2.1 1.7 4.2 1.2-2.1h1.5" />
    </svg>
  );
}

function BeginnerIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3.5l1.25 4.25L17.5 9l-4.25 1.25L12 14.5l-1.25-4.25L6.5 9l4.25-1.25L12 3.5Z" />
      <path d="M18.5 14.5l.65 2.1 2.1.65-2.1.65-.65 2.1-.65-2.1-2.1-.65 2.1-.65.65-2.1Z" />
      <path d="M5.5 14l.55 1.7 1.7.55-1.7.55-.55 1.7-.55-1.7-1.7-.55 1.7-.55L5.5 14Z" />
    </svg>
  );
}

function ToolsIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />

      <path d="M4 12h3" />
      <path d="M11 12h9" />
      <circle cx="9" cy="12" r="2" />

      <path d="M4 17h8" />
      <path d="M16 17h4" />
      <circle cx="14" cy="17" r="2" />
    </svg>
  );
}

/* ---------------------------------
   RESOURCE DATA
--------------------------------- */

const resources = [
  {
    number: "01",
    title: "WORKOUTS",
    subtitle: "let's move. ♡",
    items: "Home • Gym • Strength • Cardio",
    tag: "TRAIN",
    href: "/dashboard/resources/workouts",
    icon: WorkoutIcon,
  },
  {
    number: "02",
    title: "RECIPES",
    subtitle: "okay, what are we eating?",
    items: "Breakfast • Lunch • Dinner • Snacks",
    tag: "EAT",
    href: "/dashboard/resources/recipes",
    icon: RecipeIcon,
  },
  {
    number: "03",
    title: "MEAL PLANS",
    subtitle: "make eating easier.",
    items: "Weekly Plans • Grocery Lists • Meal Prep",
    tag: "PLAN",
    href: "/dashboard/resources/meal-plans",
    icon: MealPlanIcon,
  },
  {
    number: "04",
    title: "MOBILITY + RECOVERY",
    subtitle: "take care of your body.",
    items: "Warm-Ups • Mobility • Stretching • Recovery",
    tag: "RESET",
    href: "/dashboard/resources/recovery",
    icon: RecoveryIcon,
  },
  {
    number: "05",
    title: "BEGINNER'S CORNER",
    subtitle: "start exactly where you are.",
    items: "Form • Modifications • Exercise Basics • Gym Terms",
    tag: "LEARN",
    href: "/dashboard/resources/beginners",
    icon: BeginnerIcon,
  },
  {
    number: "06",
    title: "TOOLS",
    subtitle: "make the process easier.",
    items: "Protein • Water • Planning • Templates",
    tag: "TOOLS",
    href: "/dashboard/resources/tools",
    icon: ToolsIcon,
  },
];

/* ---------------------------------
   PAGE
--------------------------------- */

export default function ResourcesPage() {
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
          {/* HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                your library. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* LIBRARY INTRO */}
          <section className="pb-9 pt-12 md:pb-11 md:pt-14">
            <div className="flex flex-col justify-between gap-6 border-b border-[#DED0CB] pb-9 md:flex-row md:items-end md:pb-11">
              <div className="max-w-3xl">
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  YOUR LIBRARY
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
                  What do you need{" "}
                  <span className="italic text-[#A77B73]">
                    today?
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-[11px] leading-6 text-[#806E68] md:text-xs">
                  Workouts, meals, recovery and the tools to make your
                  routine feel a little easier.
                </p>
              </div>

              <div className="shrink-0">
                <p className="font-serif text-lg italic text-[#A77B73]">
                  pick a section. ♡
                </p>

                <p className="mt-2 text-[7px] tracking-[0.22em] text-[#A18A83]">
                  TRAIN • EAT • LEARN • RECOVER
                </p>
              </div>
            </div>
          </section>

          {/* RESOURCE CARDS */}
          <section className="pb-12">
            <div className="grid gap-4 lg:grid-cols-2">
              {resources.map((resource) => {
                const Icon = resource.icon;

                return (
                  <Link
                    href={resource.href}
                    key={resource.number}
                    className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm md:p-7"
                  >
                    {/* ICON + TAG */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#EAD8D3] text-[#9D6F67] transition duration-300 group-hover:bg-[#E3CCC6]">
                          <Icon className="h-6 w-6" />
                        </div>

                        <span className="font-serif text-sm text-[#C6A29A]">
                          {resource.number}
                        </span>
                      </div>

                      <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.22em] text-[#8F655E]">
                        {resource.tag}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="mt-6">
                      <p className="text-[9px] tracking-[0.25em]">
                        {resource.title}
                      </p>

                      <h2 className="mt-2 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                        {resource.subtitle}
                      </h2>

                      <p className="mt-4 text-[11px] leading-6 tracking-[0.08em] text-[#8C7770]">
                        {resource.items.toUpperCase()}
                      </p>
                    </div>

                    {/* EXPLORE */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                      <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                        EXPLORE
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition duration-300 group-hover:bg-[#EAD8D3]">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* SIMPLE ENDING */}
          <section className="border-t border-[#DED0CB] py-12 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              take what you need. keep going. ♡
            </p>

            <p className="mx-auto mt-3 max-w-lg text-[11px] leading-5 text-[#927D76]">
              Your library is here whenever you need a workout, a meal idea,
              a little guidance or a reset.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}