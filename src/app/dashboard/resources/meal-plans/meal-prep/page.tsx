"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const prepSteps = [
  {
    number: "01",
    title: "Choose a few meals",
    text: "Look at the next few days and choose what you realistically want to eat. Repeating meals is completely fine.",
  },
  {
    number: "02",
    title: "Prep the things that take time",
    text: "Cook one or two proteins and a simple carb like rice, potatoes or sweet potatoes. You do not need to make every meal in advance.",
  },
  {
    number: "03",
    title: "Make the easy things easier",
    text: "Wash produce, portion snacks or prep smoothie ingredients so there is less work when you are hungry.",
  },
  {
    number: "04",
    title: "Mix + match through the week",
    text: "Keep the components separate when it makes sense. The same chicken, rice and vegetables can become different meals depending on how you put them together.",
  },
];

const worthPrepping = [
  {
    label: "PROTEIN",
    text: "Chicken, ground turkey, boiled eggs or another protein you know you’ll use.",
  },
  {
    label: "CARBS",
    text: "Rice, potatoes, sweet potatoes or quinoa — especially the options that take longer to cook.",
  },
  {
    label: "PRODUCE",
    text: "Wash and chop sturdy vegetables. Keep delicate greens and berries dry until you need them.",
  },
  {
    label: "QUICK GRABS",
    text: "Snack boxes, yogurt toppings, fruit or smoothie ingredients for the moments you need something fast.",
  },
];

function PrepIllustration() {
  return (
    <svg
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      aria-hidden="true"
    >
      <rect
        x="43"
        y="68"
        width="194"
        height="112"
        rx="26"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M43 104H237"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M140 104V180"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M85 47C85 37 93 29 103 29H177C187 29 195 37 195 47V68H85V47Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M111 29V20C111 15 115 11 120 11H160C165 11 169 15 169 20V29"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M77 130C83 121 93 116 104 116C115 116 125 121 131 130"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M161 145C168 134 179 128 191 128C203 128 214 134 221 145"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M101 150C106 143 113 139 121 139"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M207 49C219 43 228 46 232 54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M50 48C39 42 29 45 25 54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M231 84C242 80 251 83 256 90"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M26 84C17 81 9 84 5 90"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M242 164C248 164 253 169 253 175"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M28 164C22 164 17 169 17 175"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
          {/* HEADER */}

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
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← MEAL PLANS
            </Link>
          </header>

          {/* EDITORIAL INTRO */}

          <section className="mx-auto max-w-5xl pb-16 pt-14 md:pb-20 md:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
              <div>
                <div className="flex items-center gap-4">
                  <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                    MEAL PREP GUIDE
                  </p>

                  <span className="h-px w-10 bg-[#CBA9A2]" />
                </div>

                <h1 className="mt-5 font-serif text-5xl leading-[0.96] md:text-6xl lg:text-7xl">
                  Prep smarter,
                  <span className="block italic text-[#A77B73]">
                    not more. ♡
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-[#75635D]">
                  Meal prep does not have to mean spending Sunday making seven
                  identical containers. The goal is simply to make eating well
                  easier when the week gets busy.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[7px] tracking-[0.25em] text-[#9D6F67]">
                  <span>PLAN WHAT YOU NEED</span>
                  <span className="text-[#CBA9A2]">•</span>
                  <span>PREP WHAT HELPS</span>
                  <span className="text-[#CBA9A2]">•</span>
                  <span>LEAVE THE REST</span>
                </div>
              </div>

              <div className="relative mx-auto hidden w-full max-w-[280px] lg:block">
                <div className="absolute -inset-5 rounded-[3rem] bg-[#EAD8D3]/35" />

                <div className="relative rounded-[2.5rem] border border-[#D9C5BF] bg-[#FBF8F6]/70 px-8 py-10 text-[#B88D85]">
                  <PrepIllustration />

                  <p className="mt-4 text-center font-serif text-lg italic text-[#A77B73]">
                    simple works. ♡
                  </p>
                </div>

                <span className="absolute -right-5 -top-5 font-serif text-5xl italic text-[#D7B6AF]">
                  01
                </span>
              </div>
            </div>

            <div className="mt-14 h-px w-full bg-[#DED0CB]" />
          </section>

          {/* SIMPLE METHOD */}

          <section className="mx-auto max-w-5xl pb-16 md:pb-20">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  THE SIMPLE METHOD
                </p>

                <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                  Enough structure
                  <span className="block italic text-[#A77B73]">
                    to make life easier.
                  </span>
                </h2>

                <p className="mt-5 max-w-sm text-xs leading-6 text-[#806E68]">
                  You do not need to prep everything. Focus on whatever will
                  save you the most time later.
                </p>
              </div>

              <div className="border-t border-[#DED0CB]">
                {prepSteps.map((step) => (
                  <article
                    key={step.number}
                    className="grid gap-4 border-b border-[#DED0CB] py-7 sm:grid-cols-[60px_1fr]"
                  >
                    <span className="font-serif text-2xl italic text-[#C39A92]">
                      {step.number}
                    </span>

                    <div>
                      <h3 className="font-serif text-2xl">
                        {step.title}
                      </h3>

                      <p className="mt-3 max-w-2xl text-xs leading-6 text-[#75635D]">
                        {step.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* SMALL EDITORIAL THOUGHT */}

          <section className="mx-auto max-w-5xl pb-16">
            <div className="grid gap-6 border-l-2 border-[#DDB5AE] py-2 pl-6 md:grid-cols-[0.3fr_1.7fr] md:gap-10 md:pl-8">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                QUICK THOUGHT
              </p>

              <p className="max-w-2xl font-serif text-2xl leading-snug italic text-[#7D5C56] md:text-3xl">
                Meal prep should remove decisions from your week — not create
                another job for you. ♡
              </p>
            </div>
          </section>

          {/* WHAT IS WORTH PREPPING */}

          <section className="mx-auto max-w-5xl pb-16 md:pb-20">
            <div className="rounded-[2rem] bg-[#EAD8D3]/55 p-7 md:p-10 lg:p-12">
              <div className="max-w-2xl">
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  WHAT&apos;S ACTUALLY WORTH PREPPING?
                </p>

                <h2 className="mt-4 font-serif text-3xl md:text-4xl">
                  Start with the things
                  <span className="italic text-[#A77B73]">
                    {" "}
                    that save time. ♡
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-xs leading-6 text-[#75635D]">
                  Think ingredients and building blocks first. You can turn
                  them into different meals as the week goes on.
                </p>
              </div>

              <div className="mt-9 grid gap-x-10 gap-y-8 border-t border-[#D5BEB8] pt-8 md:grid-cols-2">
                {worthPrepping.map((item) => (
                  <div key={item.label}>
                    <p className="text-[8px] tracking-[0.25em] text-[#8F655E]">
                      {item.label}
                    </p>

                    <p className="mt-3 text-xs leading-6 text-[#685751]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ONE LAST THING */}

          <section className="mx-auto max-w-5xl pb-14">
            <div className="grid gap-8 border-y border-[#DED0CB] py-10 md:grid-cols-[0.55fr_1.45fr] md:items-start">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                ONE LAST THING
              </p>

              <div>
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  Don&apos;t prep just because you think you&apos;re supposed
                  to.
                </p>

                <p className="mt-4 max-w-2xl text-xs leading-6 text-[#75635D]">
                  If you prefer freshly cooked dinners, prep ingredients
                  instead of full meals. If breakfast is always rushed, focus
                  there. Your prep should solve problems in your actual
                  routine.
                </p>
              </div>
            </div>
          </section>

          {/* FOOD SAFETY */}

          <section className="mx-auto max-w-5xl pb-14">
            <div className="flex max-w-3xl items-start gap-3">
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#CBA9A2]" />

              <p className="text-[10px] leading-5 text-[#927D76]">
                Food safety note: refrigerate perishable foods promptly,
                follow appropriate storage guidance for what you prepare, and
                freeze portions you will not use soon. ♡
              </p>
            </div>
          </section>

          {/* END */}

          <section className="mx-auto max-w-5xl border-t border-[#DED0CB] pb-14 pt-12 text-center">
            <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
              THAT&apos;S IT
            </p>

            <p className="mt-4 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              make the week easier on yourself. ♡
            </p>

            <p className="mx-auto mt-3 max-w-md text-[10px] leading-5 text-[#927D76]">
              Plan what you need. Prep what helps. Leave the rest.
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