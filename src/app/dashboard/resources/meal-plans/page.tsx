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

const extras = [
  {
    title: "GROCERY LIST",
    subtitle: "shop once. make the week easier.",
    description:
      "A simple shopping guide organized by proteins, produce, carbs, dairy + pantry staples.",
    href: "/dashboard/resources/meal-plans/grocery-list",
  },
  {
    title: "MEAL PREP GUIDE",
    subtitle: "prep a little. stress less.",
    description:
      "A practical prep flow for proteins, carbs, vegetables + grab-and-go options.",
    href: "/dashboard/resources/meal-plans/meal-prep",
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
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                plan it once. make the week easier. ♡
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
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  MEAL PLANS
                </p>

                <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Take the guesswork
                  <span className="block italic text-[#DDB5AE]">
                    out of eating. ♡
                  </span>
                </h1>
              </div>

              <p className="max-w-sm text-[8px] leading-5 tracking-[0.14em] text-[#BFAEAA]">
                PROTEIN-FIRST • REAL FOOD • FLEXIBLE OPTIONS • BUILT TO WORK
                WITH YOUR TRAINING
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  CHOOSE YOUR WEEK
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Start with the plan that{" "}
                  <span className="italic text-[#A77B73]">fits your week.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                no perfection required. ♡
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    WHICH PLAN SHOULD I CHOOSE?
                  </p>
                  <h3 className="mt-3 font-serif text-2xl md:text-3xl">
                    How are you <span className="italic text-[#A77B73]">training this week?</span>
                  </h3>
                </div>

                <p className="font-serif text-base italic text-[#A77B73]">
                  not sure? start balanced. ♡
                </p>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                <Link
                  href="/dashboard/resources/meal-plans/balanced-week"
                  className="group rounded-2xl border border-[#D9C8C2] bg-[#F7F1ED] p-5 transition hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                >
                  <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    KEEPING IT BALANCED
                  </p>
                  <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
                    Balanced Week →
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#806E68]">
                    Everyday training, mixed activity, or you simply want the easiest place to start.
                  </p>
                </Link>

                <Link
                  href="/dashboard/resources/meal-plans/training-week"
                  className="group rounded-2xl border border-[#D9C8C2] bg-[#F7F1ED] p-5 transition hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                >
                  <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    TRAINING HARD / LIFTING REGULARLY
                  </p>
                  <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
                    Training Week →
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#806E68]">
                    Several strength sessions or harder training days where extra fuel can be useful.
                  </p>
                </Link>

                <Link
                  href="/dashboard/resources/meal-plans/lighter-week"
                  className="group rounded-2xl border border-[#D9C8C2] bg-[#F7F1ED] p-5 transition hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                >
                  <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    RECOVERY / LIGHTER ACTIVITY
                  </p>
                  <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
                    Lighter Week →
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#806E68]">
                    A recovery week, fewer demanding sessions, or days when lighter meals fit better.
                  </p>
                </Link>
              </div>

              <div className="mt-6 rounded-2xl bg-[#EAD8D3] px-5 py-4">
                <p className="text-sm leading-6 text-[#6F5F59]">
                  <span className="font-medium text-[#5B4640]">Not sure?</span>{" "}
                  Start with Balanced Week. You can switch plans anytime. The goal
                  is not to follow a perfect menu — it is to make eating well easier.
                </p>
              </div>
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

                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">
                      {plan.tag}
                    </span>
                  </div>

                  <div className="mt-8">
                    <p className="text-[9px] tracking-[0.24em]">
                      {plan.title}
                    </p>

                    <h3 className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                      {plan.subtitle}
                    </h3>

                    <p className="mt-5 text-sm leading-6 text-[#806E68]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <p className="text-[7px] tracking-[0.16em] text-[#9D6F67]">
                      {plan.details}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                      <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
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

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9 md:py-9">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                  HOW IT WORKS
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Protein stays.
                  <span className="block italic text-[#9D6F67]">
                    the rest can flex. ♡
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6F5F59]">
                  These plans are built around protein-forward meals, fruits,
                  vegetables and practical portions. Harder training days can
                  include more carbohydrate for fuel, while lighter days can
                  lean on lower-carb meals if that feels good for you.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["01", "PICK A PLAN", "Choose the week that matches your schedule."],
                  ["02", "FOLLOW OR SWAP", "Use the linked recipes or swap similar meals."],
                  ["03", "KEEP IT REAL", "Adjust portions for your own needs + hunger."],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-[#D0B5AF] bg-[#F7F1ED]/55 p-5"
                  >
                    <p className="font-serif text-2xl text-[#9D6F67]">
                      {number}
                    </p>
                    <p className="mt-4 text-[8px] tracking-[0.2em]">
                      {title}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-[#6F5F59]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                MAKE THE WEEK EASIER
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Plan it. Prep it.{" "}
                <span className="italic text-[#A77B73]">then live your life.</span>
              </h2>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {extras.map((extra) => (
                <Link
                  key={extra.title}
                  href={extra.href}
                  className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2]"
                >
                  <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                    {extra.title}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                    {extra.subtitle}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#806E68]">
                    {extra.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                    <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                      EXPLORE
                    </span>
                    <span className="font-serif text-xl text-[#A77B73] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] px-7 py-7 md:px-9">
            <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
              A QUICK NOTE
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-[#806E68]">
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
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.26em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BROWSE RECIPES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
