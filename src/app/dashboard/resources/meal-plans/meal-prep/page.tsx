"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const prepSteps = [
  {
    number: "01",
    title: "PICK YOUR MEALS",
    subtitle: "keep the week realistic.",
    text: "Choose the meals you actually want for the next few days. Repeating favourites is completely fine.",
  },
  {
    number: "02",
    title: "COOK THE BASICS",
    subtitle: "protein + fuel first.",
    text: "Prep one or two proteins plus an easy carbohydrate such as rice, potatoes or sweet potatoes.",
  },
  {
    number: "03",
    title: "PREP PRODUCE + SNACKS",
    subtitle: "make grabbing food easy. ♡",
    text: "Wash and chop produce, portion fruit, and prep any snack boxes, yogurt toppings or smoothie ingredients.",
  },
  {
    number: "04",
    title: "STORE + GO",
    subtitle: "future you is ready.",
    text: "Store your components so you can mix and match them into meals throughout the week.",
  },
];

const prepBlocks = [
  {
    title: "PROTEIN",
    time: "20–30 MIN",
    items: [
      "Bake or pan-cook chicken breast",
      "Brown extra-lean ground turkey",
      "Boil eggs if using them this week",
      "Portion cottage cheese or Greek yogurt as needed",
    ],
  },
  {
    title: "CARBS + SIDES",
    time: "20–35 MIN",
    items: [
      "Cook rice or quinoa",
      "Roast sweet potatoes or potatoes",
      "Portion tortillas, crackers or other easy sides",
      "Keep quick-cooking options available for later in the week",
    ],
  },
  {
    title: "PRODUCE",
    time: "10–20 MIN",
    items: [
      "Wash and chop sturdy vegetables",
      "Roast a tray of mixed vegetables",
      "Wash fruit",
      "Keep delicate greens and berries as dry as possible",
    ],
  },
  {
    title: "GRAB + GO",
    time: "10 MIN",
    items: [
      "Build protein snack boxes",
      "Portion smoothie ingredients",
      "Pre-portion yogurt toppings",
      "Put frequently used sauces together in one fridge area",
    ],
  },
];


export default function MealPrepPage() {
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
                prep a little. stress less. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/meal-plans"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← MEAL PLANS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  MEAL PREP GUIDE
                </p>

                <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-none md:text-6xl">
                  Make healthy choices
                  <span className="block italic text-[#DDB5AE]">
                    the easy choice. ♡
                  </span>
                </h1>
              </div>

              <p className="max-w-sm text-[8px] leading-5 tracking-[0.15em] text-[#BFAEAA]">
                PLAN • PREP • PORTION • STORE • REPEAT
              </p>
            </div>
          </section>

          <section className="pb-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR PREP FLOW
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Four steps.{" "}
                <span className="italic text-[#A77B73]">keep it simple. ♡</span>
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {prepSteps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6"
                >
                  <div className="flex items-start gap-5">
                    <span className="font-serif text-4xl text-[#D2B0A9]">
                      {step.number}
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.23em]">
                        {step.title}
                      </p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 border-t border-[#E1D3CE] pt-5 text-sm leading-6 text-[#806E68]">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="py-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                WHAT TO PREP
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Build your{" "}
                <span className="italic text-[#A77B73]">week in pieces.</span>
              </h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {prepBlocks.map((block) => (
                <article
                  key={block.title}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#E1D3CE] pb-4">
                    <p className="text-[8px] tracking-[0.24em]">
                      {block.title}
                    </p>

                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.16em] text-[#8F655E]">
                      {block.time}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {block.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CBA9A2]" />
                        <p className="text-sm leading-5 text-[#6F5F59]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-xs leading-5 text-[#8C7770]">
              Food safety note: refrigerate perishable foods promptly, follow
              storage guidance for what you cooked, and freeze portions you
              will not use soon. ♡
            </p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              a little prep goes a long way. ♡
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/resources/meal-plans/grocery-list"
                className="rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.24em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                GROCERY LIST →
              </Link>

              <Link
                href="/dashboard/resources/meal-plans"
                className="rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[8px] tracking-[0.24em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
              >
                BACK TO PLANS
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
