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
      "Your interactive shopping list.",
    href: "/dashboard/resources/meal-plans/grocery-list",
  },
  {
    title: "MEAL PREP GUIDE",
    subtitle: "prep a little. stress less.",
    description:
      "A simple guide to prep the week.",
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

          <section className="border-t border-[#DED0CB] py-7">
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
