"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const prepSteps = [
  {
    number: "01",
    title: "PICK YOUR MEALS",
    subtitle: "do not prep everything.",
    text: "Choose the meals you realistically want for the next few days. Repeating two breakfasts, two lunches and a few dinners is completely fine.",
  },
  {
    number: "02",
    title: "PREP YOUR PROTEIN",
    subtitle: "start with the anchor.",
    text: "Cook one or two versatile proteins such as chicken or ground turkey. Keep salmon and shrimp for quick fresh meals if you prefer.",
  },
  {
    number: "03",
    title: "PREP YOUR FUEL",
    subtitle: "make carbs grab-and-go.",
    text: "Cook a batch of rice, roast potatoes or sweet potatoes, or portion another carbohydrate you use often during the week.",
  },
  {
    number: "04",
    title: "WASH + CHOP",
    subtitle: "future you will be grateful. ♡",
    text: "Wash and chop sturdy vegetables, prep salad toppings and portion fruit so building a meal takes less effort later.",
  },
  {
    number: "05",
    title: "BUILD THE EASY STUFF",
    subtitle: "remove tiny decisions.",
    text: "Portion snack boxes, smoothie ingredients or yogurt toppings. Keep sauces and toppings separate until you are ready to eat.",
  },
  {
    number: "06",
    title: "STORE + LABEL",
    subtitle: "know what needs eating first.",
    text: "Use clean containers, refrigerate promptly and label prepared foods with what they are and when you made them.",
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

const schedule = [
  {
    time: "0–10 MIN",
    task: "SET UP",
    text: "Preheat the oven, start water or rice, pull out containers and chop the ingredients that take longest.",
  },
  {
    time: "10–30 MIN",
    task: "COOK",
    text: "Get proteins and sheet-pan vegetables cooking while your rice, potatoes or other sides finish.",
  },
  {
    time: "30–45 MIN",
    task: "ASSEMBLE",
    text: "Portion snacks, wash fruit and divide cooked components once they have cooled enough to handle safely.",
  },
  {
    time: "45–60 MIN",
    task: "RESET",
    text: "Store everything, label containers, wipe down the kitchen and put tomorrow's easiest meal where you can see it.",
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

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                THE GOAL
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Prep components,{" "}
                <span className="italic text-[#A77B73]">not your whole life.</span>
              </h2>

              <p className="mt-4 max-w-4xl text-sm leading-6 text-[#806E68]">
                Meal prep does not have to mean seven identical containers.
                Preparing a few proteins, vegetables, carbohydrate sources and
                grab-and-go options gives you building blocks you can mix,
                match and turn into the recipes in your library.
              </p>
            </div>
          </section>

          <section className="pb-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR PREP FLOW
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Six steps.{" "}
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

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#8F655E]">
                  THE 60-MINUTE RESET
                </p>
                <h2 className="mt-3 font-serif text-3xl">
                  One hour can change{" "}
                  <span className="italic text-[#9D6F67]">your whole week.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#8F655E]">
                done is better than perfect. ♡
              </p>
            </div>

            <div className="mt-7 grid gap-3 lg:grid-cols-4">
              {schedule.map((block) => (
                <div
                  key={block.time}
                  className="rounded-2xl border border-[#D0B5AF] bg-[#F7F1ED]/55 p-5"
                >
                  <p className="text-[7px] tracking-[0.2em] text-[#8F655E]">
                    {block.time}
                  </p>
                  <p className="mt-3 text-[8px] tracking-[0.2em]">
                    {block.task}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#6F5F59]">
                    {block.text}
                  </p>
                </div>
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

          <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
            <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
              FOOD SAFETY MATTERS
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              Prep it.{" "}
              <span className="italic text-[#A77B73]">store it safely.</span>
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7F1ED] p-5">
                <p className="text-[8px] tracking-[0.2em]">COOL + REFRIGERATE</p>
                <p className="mt-3 text-xs leading-5 text-[#806E68]">
                  Refrigerate perishable cooked foods promptly rather than
                  leaving them sitting at room temperature. Use shallow
                  containers when helpful so food cools efficiently.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F7F1ED] p-5">
                <p className="text-[8px] tracking-[0.2em]">WHEN IN DOUBT</p>
                <p className="mt-3 text-xs leading-5 text-[#806E68]">
                  Follow the storage guidance for the specific food you cooked.
                  Freeze portions you will not use soon, and discard food if
                  you are unsure whether it has been stored safely.
                </p>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] bg-[#211C19] px-7 py-8 text-[#F7F1ED] md:px-9">
              <p className="text-[8px] tracking-[0.32em] text-[#DDB5AE]">
                THE REAL-LIFE VERSION
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                No Sunday prep?
                <span className="block italic text-[#DDB5AE]">
                  you can still make this work. ♡
                </span>
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#D5C8C3]">
                Cook double at dinner and save a portion for lunch. Use frozen
                vegetables. Buy pre-cut produce when it helps. Keep Greek
                yogurt, cottage cheese, eggs and easy proteins around. Meal prep
                is simply doing something now that makes eating later easier.
              </p>
            </div>
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
