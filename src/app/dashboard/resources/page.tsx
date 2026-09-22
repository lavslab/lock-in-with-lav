"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const resources = [
  {
    number: "01",
    title: "WORKOUTS",
    subtitle: "let's move. ♡",
    items: "Home • Gym • Strength • Cardio",
    tag: "TRAIN",
    href: "/dashboard/resources/workouts",
  },
  {
    number: "02",
    title: "RECIPES",
    subtitle: "okay, what are we eating?",
    items: "Breakfast • Lunch • Dinner • Snacks",
    tag: "EAT",
    href: "/dashboard/resources/recipes",
  },
  {
    number: "03",
    title: "MEAL PLANS",
    subtitle: "make eating easier.",
    items: "Weekly Plans • Grocery Lists • Meal Prep",
    tag: "PLAN",
    href: "/dashboard/resources/meal-plans",
  },
  {
    number: "04",
    title: "MOBILITY + RECOVERY",
    subtitle: "take care of your body.",
    items: "Warm-Ups • Mobility • Stretching • Recovery",
    tag: "RESET",
    href: "/dashboard/resources/recovery",
  },
  {
    number: "05",
    title: "BEGINNER'S CORNER",
    subtitle: "start exactly where you are.",
    items: "Form • Modifications • Exercise Basics • Gym Terms",
    tag: "LEARN",
    href: "/dashboard/resources/beginners",
  },
  {
    number: "06",
    title: "TOOLS",
    subtitle: "make the process easier.",
    items: "Protein • Water • Planning • Templates",
    tag: "TOOLS",
    href: "/dashboard/resources/tools",
  },
];

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
          <header className="flex items-center justify-between">
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
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-9 text-[#F7F1ED] md:px-10 md:py-10">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  RESOURCES
                </p>
                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Everything you need.
                </h1>
                <p className="mt-2 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  all in one place. ♡
                </p>
              </div>

              <p className="text-[8px] tracking-[0.18em] text-[#BFAEAA]">
                TRAIN • EAT • LEARN • RECOVER
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  YOUR LIBRARY
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  What do you need{" "}
                  <span className="italic text-[#A77B73]">today?</span>
                </h2>
              </div>

              <p className="hidden font-serif text-lg italic text-[#A77B73] md:block">
                pick a section. ♡
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {resources.map((resource) => (
                <Link
                  href={resource.href}
                  key={resource.number}
                  className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      {resource.number}
                    </span>
                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.22em] text-[#8F655E]">
                      {resource.tag}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-[9px] tracking-[0.25em]">
                      {resource.title}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                      {resource.subtitle}
                    </h3>
                    <p className="mt-4 text-[13px] leading-6 tracking-[0.08em] text-[#8C7770]">
                      {resource.items.toUpperCase()}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                    <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                      EXPLORE
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#DED0CB] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                  NOT SURE WHERE TO START?
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Start with what you{" "}
                  <span className="italic text-[#9D6F67]">need today.</span>
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806E68]">
                  Find a workout, plan your meals, learn an exercise, or give
                  your body a recovery day. This library is here to make
                  showing up simpler.
                </p>
              </div>

              <Link
                href="/dashboard/resources/workouts"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.24em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                FIND A WORKOUT →
              </Link>
            </div>
          </section>

          <section className="py-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              take what you need. keep going. ♡
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO TODAY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
