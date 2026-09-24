"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const plans = [
  {
    number: "01",
    title: "BALANCED WEEK",
    subtitle: "simple. balanced. repeatable. ♡",
    description:
      "The best starting point for most people. A straightforward protein-forward week with balanced meals and no need to think about carb timing.",
    details: "7 DAYS • HIGH PROTEIN • BALANCED",
    tag: "START HERE",
    href: "/dashboard/resources/meal-plans/balanced-week",
  },
  {
    number: "02",
    title: "TRAINING WEEK",
    subtitle: "fuel the work.",
    description:
      "For weeks with regular strength training or several demanding sessions. Protein stays consistent, with more carbohydrate available around harder training days.",
    details: "7 DAYS • TRAINING FUEL • HIGH PROTEIN",
    tag: "TRAIN",
    href: "/dashboard/resources/meal-plans/training-week",
  },
  {
    number: "03",
    title: "LIGHTER WEEK",
    subtitle: "keep it light, not restrictive.",
    description:
      "For recovery weeks or lower-activity weeks. Uses more of the library's lighter meals while still including protein, produce and carbohydrates.",
    details: "7 DAYS • LIGHTER MEALS • HIGH PROTEIN",
    tag: "LIGHT",
    href: "/dashboard/resources/meal-plans/lighter-week",
  },
];

export default function MealPlansPage() {
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
              <p className="text-[10px] tracking-[0.32em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                plan it once. make the week easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[10px] tracking-[0.18em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] tracking-[0.35em] text-[#DDB5AE]">
                  MEAL PLANS
                </p>

                <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Take the guesswork
                  <span className="block italic text-[#DDB5AE]">
                    out of eating. ♡
                  </span>
                </h1>
              </div>

              <p className="max-w-sm text-[10px] leading-5 tracking-[0.12em] text-[#BFAEAA]">
                PROTEIN-FIRST • REAL FOOD • FLEXIBLE OPTIONS • BUILT TO WORK
                WITH YOUR TRAINING
              </p>
            </div>
          </section>

          {/* CHOOSE A MEAL PLAN */}
          <section className="py-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                  01 • CHOOSE A MEAL PLAN
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Start with the plan that{" "}
                  <span className="italic text-[#A77B73]">
                    fits your week.
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#806E68]">
                  Pick the week that best matches your training, schedule and
                  energy needs. You can adjust portions and meals as you go.
                </p>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                no perfection required. ♡
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {plans.map((plan) => (
                <Link
                  key={plan.number}
                  href={plan.href}
                  className="group flex min-h-[340px] flex-col rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-serif text-4xl text-[#D2B0A9]">
                      {plan.number}
                    </span>

                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[9px] tracking-[0.15em] text-[#8F655E]">
                      {plan.tag}
                    </span>
                  </div>

                  <div className="mt-8">
                    <p className="text-[11px] font-medium tracking-[0.2em]">
                      {plan.title}
                    </p>

                    <h3 className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                      {plan.subtitle}
                    </h3>

                    <p className="mt-5 text-[15px] leading-7 text-[#725F5A]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <p className="text-[9px] tracking-[0.14em] text-[#9D6F67]">
                      {plan.details}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                      <span className="text-[9px] font-medium tracking-[0.2em] text-[#9D6F67]">
                        VIEW PLAN
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* PLANNING TOOLS */}
          <section className="border-t border-[#DED0CB] py-12">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                02 • PLAN YOUR WEEK
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Make the plan{" "}
                <span className="italic text-[#A77B73]">
                  work in real life. ♡
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#806E68]">
                Once you know what you&apos;re eating, turn the plan into something
                you can actually use throughout the week.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              {/* FEATURED SHOPPING LIST */}
              <Link
                href="/dashboard/resources/meal-plans/grocery-list"
                className="group relative overflow-hidden rounded-[2rem] bg-[#E9D2CC] p-7 transition duration-300 hover:-translate-y-1 md:p-9"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[10px] font-medium tracking-[0.25em] text-[#8F655E]">
                        INTERACTIVE SHOPPING LIST
                      </p>

                      <span className="rounded-full bg-[#211C19] px-3 py-1.5 text-[8px] font-medium tracking-[0.16em] text-[#F7F1ED]">
                        INTERACTIVE
                      </span>
                    </div>

                    <h3 className="mt-6 max-w-lg font-serif text-3xl leading-tight md:text-4xl">
                      Build your list.
                      <span className="block italic text-[#A77B73]">
                        shop without the chaos. ♡
                      </span>
                    </h3>

                    <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#725F5A]">
                      Create your grocery list as you plan your week. Add what
                      you need, check items off while you shop and keep
                      everything together in one place.
                    </p>
                  </div>

                  <span className="font-serif text-5xl text-[#C49B93]">
                    01
                  </span>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-[#D2B1AA] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-medium tracking-[0.15em] text-[#8F655E]">
                    <span>ADD ITEMS</span>
                    <span>CHECK THEM OFF</span>
                    <span>STAYS SAVED</span>
                  </div>

                  <span className="inline-flex w-fit items-center gap-3 rounded-full bg-[#211C19] px-6 py-3 text-[9px] font-medium tracking-[0.18em] text-[#F7F1ED] transition group-hover:gap-5">
                    OPEN SHOPPING LIST
                    <span className="font-serif text-base">→</span>
                  </span>
                </div>
              </Link>

              {/* MEAL PREP */}
              <Link
                href="/dashboard/resources/meal-plans/meal-prep"
                className="group flex flex-col rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2]"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-medium tracking-[0.25em] text-[#9D6F67]">
                    MEAL PREP GUIDE
                  </p>

                  <span className="font-serif text-3xl text-[#D2B0A9]">
                    02
                  </span>
                </div>

                <h3 className="mt-6 font-serif text-2xl italic text-[#A77B73]">
                  prep a little. stress less.
                </h3>

                <p className="mt-4 text-[15px] leading-7 text-[#725F5A]">
                  A simple approach to prepping your week without spending your
                  entire Sunday in the kitchen.
                </p>

                <div className="mt-auto pt-10">
                  <div className="flex items-center justify-between border-t border-[#E1D3CE] pt-5">
                    <span className="text-[9px] font-medium tracking-[0.2em] text-[#9D6F67]">
                      OPEN GUIDE
                    </span>

                    <span className="font-serif text-xl text-[#A77B73] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* QUICK NOTE */}
          <section className="border-t border-[#DED0CB] py-7">
            <p className="text-[10px] tracking-[0.25em] text-[#9D6F67]">
              A QUICK NOTE
            </p>

            <p className="mt-3 max-w-4xl text-[14px] leading-6 text-[#806E68]">
              Meal plans are examples, not individualized nutrition
              prescriptions. Energy and nutrition needs vary by person,
              activity, health needs and goals. Use the plans as a flexible
              framework and adjust portions or ingredients as needed.
            </p>
          </section>

          <section className="py-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              plan enough to make showing up easier. ♡
            </p>

            <Link
              href="/dashboard/resources/recipes"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[10px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BROWSE RECIPES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}