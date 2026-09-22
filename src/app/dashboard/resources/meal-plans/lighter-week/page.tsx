"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const days = [
  {
    day: "01",
    title: "Monday",
    focus: "LOWER BODY / GLUTES",
    note: "hard session = give your body fuel. ♡",
    meals: [
      { type: "BREAKFAST", name: "Protein Pancakes", href: "/dashboard/resources/recipes/protein-pancakes" },
      { type: "LUNCH", name: "Ground Turkey Sweet Potato Bowl", href: "/dashboard/resources/recipes/ground-turkey-sweet-potato-bowl" },
      { type: "DINNER", name: "Creamy Chicken Protein Pasta", href: "/dashboard/resources/recipes/creamy-chicken-protein-pasta" },
      { type: "POST-WORKOUT / SNACK", name: "Strawberry Protein Smoothie", href: "/dashboard/resources/recipes/strawberry-protein-smoothie" },
    ],
  },
  {
    day: "02",
    title: "Tuesday",
    focus: "UPPER BODY",
    note: "protein stays high. meals stay balanced.",
    meals: [
      { type: "BREAKFAST", name: "High-Protein Breakfast Wrap", href: "/dashboard/resources/recipes/breakfast-wrap" },
      { type: "LUNCH", name: "Chicken Taco Bowl", href: "/dashboard/resources/recipes/chicken-taco-bowl" },
      { type: "DINNER", name: "Salmon + Roasted Veggies", href: "/dashboard/resources/recipes/salmon-roasted-veggies" },
      { type: "SNACK", name: "Protein Snack Box", href: "/dashboard/resources/recipes/protein-snack-box" },
    ],
  },
  {
    day: "03",
    title: "Wednesday",
    focus: "RECOVERY / LIGHT CARDIO",
    note: "recover well. you do not have to earn your food.",
    meals: [
      { type: "BREAKFAST", name: "Greek Yogurt Crunch Bowl", href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl" },
      { type: "LUNCH", name: "Turkey Burger Bowl", href: "/dashboard/resources/recipes/turkey-burger-bowl" },
      { type: "DINNER", name: "Lemon Garlic Shrimp + Zucchini", href: "/dashboard/resources/recipes/lemon-garlic-shrimp" },
      { type: "SNACK", name: "Protein Snack Box", href: "/dashboard/resources/recipes/protein-snack-box" },
    ],
  },
  {
    day: "04",
    title: "Thursday",
    focus: "LOWER BODY / GLUTES",
    note: "another hard day. bring the carbs back up. ♡",
    meals: [
      { type: "BREAKFAST", name: "Protein Pancakes", href: "/dashboard/resources/recipes/protein-pancakes" },
      { type: "LUNCH", name: "Loaded Chicken Potato", href: "/dashboard/resources/recipes/loaded-chicken-potato" },
      { type: "DINNER", name: "Honey Soy Chicken Veggie Bowl", href: "/dashboard/resources/recipes/honey-soy-chicken-bowl" },
      { type: "POST-WORKOUT / SNACK", name: "Strawberry Protein Smoothie", href: "/dashboard/resources/recipes/strawberry-protein-smoothie" },
    ],
  },
  {
    day: "05",
    title: "Friday",
    focus: "UPPER BODY / FULL BODY",
    note: "balanced fuel for another strength day.",
    meals: [
      { type: "BREAKFAST", name: "High-Protein Breakfast Wrap", href: "/dashboard/resources/recipes/breakfast-wrap" },
      { type: "LUNCH", name: "Ground Turkey Quesadillas", href: "/dashboard/resources/recipes/turkey-quesadillas" },
      { type: "DINNER", name: "Salmon Power Bowl", href: "/dashboard/resources/recipes/salmon-power-bowl" },
      { type: "SNACK", name: "Greek Yogurt Crunch Bowl", href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl" },
    ],
  },
  {
    day: "06",
    title: "Saturday",
    focus: "CONDITIONING / ACTIVE DAY",
    note: "stay fueled without making it complicated.",
    meals: [
      { type: "BREAKFAST", name: "Protein Pancakes", href: "/dashboard/resources/recipes/protein-pancakes" },
      { type: "LUNCH", name: "Black Bean + Corn Tacos", href: "/dashboard/resources/recipes/black-bean-corn-tacos" },
      { type: "DINNER", name: "Turkey Stuffed Bell Peppers", href: "/dashboard/resources/recipes/turkey-stuffed-peppers" },
      { type: "SNACK / SHAKE", name: "Strawberry Protein Smoothie", href: "/dashboard/resources/recipes/strawberry-protein-smoothie" },
    ],
  },
  {
    day: "07",
    title: "Sunday",
    focus: "REST + RESET",
    note: "rest is part of the plan too. ♡",
    meals: [
      { type: "BREAKFAST", name: "Greek Yogurt Crunch Bowl", href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl" },
      { type: "LUNCH", name: "Protein Snack Box", href: "/dashboard/resources/recipes/protein-snack-box" },
      { type: "DINNER", name: "Salmon + Roasted Veggies", href: "/dashboard/resources/recipes/salmon-roasted-veggies" },
      { type: "SNACK", name: "Crispy Black Bean Taquitos", href: "/dashboard/resources/recipes/black-bean-taquitos" },
    ],
  },
]

export default function LighterWeekPage() {
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
      if (savedName) setFirstName(savedName);
      else if (user.email) setFirstName(user.email.split("@")[0]);

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
                your week, already planned. ♡
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
            <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
              7-DAY PLAN • LIGHTER ACTIVITY
            </p>

            <h1 className="mt-5 font-serif text-5xl leading-none md:text-6xl">
              Lighter Week
            </h1>

            <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
              lighter days. still well fed. ♡
            </p>

            <p className="mt-7 max-w-3xl text-sm leading-7 text-[#D5C8C3]">
              A protein-forward week for recovery periods, lighter activity or weeks with fewer demanding workouts. Meals lean lighter while still including carbohydrates, satisfying portions and plenty of flexibility.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["7 DAYS", "PROTEIN FORWARD", "LIGHTER MEALS", "FLEXIBLE"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#6E5A55] px-4 py-2 text-[7px] tracking-[0.18em] text-[#DDB5AE]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                BEFORE YOU START
              </p>
              <h2 className="mt-3 font-serif text-3xl">
                Use the plan as a{" "}
                <span className="italic text-[#A77B73]">framework.</span>
              </h2>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  ["01", "FOLLOW OR SWAP", "Tap any meal for the recipe. Swap similar meals based on what you have, what you enjoy and how active the day is."],
                  ["02", "ADJUST PORTIONS", "Your energy needs are individual. Add or reduce portions based on your needs, hunger and goals."],
                  ["03", "MOVE THE DAYS", "Have a harder workout than expected? Choose one of the higher-fuel meals or add a carbohydrate side. The plan should flex with your week."],
                ].map(([number, title, copy]) => (
                  <div
                    key={number}
                    className="rounded-2xl bg-[#F7F1ED] p-5"
                  >
                    <p className="font-serif text-2xl text-[#D2B0A9]">{number}</p>
                    <p className="mt-3 text-[8px] tracking-[0.2em]">{title}</p>
                    <p className="mt-3 text-xs leading-5 text-[#806E68]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pb-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR WEEK
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Seven days of{" "}
                <span className="italic text-[#A77B73]">lighter structure.</span>
              </h2>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <article
                  key={day.day}
                  className="overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6]"
                >
                  <div className="flex flex-col gap-4 border-b border-[#E1D3CE] bg-[#EAD8D3]/55 px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
                    <div className="flex items-center gap-5">
                      <span className="font-serif text-4xl text-[#A77B73]">
                        {day.day}
                      </span>
                      <div>
                        <p className="text-[7px] tracking-[0.22em] text-[#8F655E]">
                          {day.focus}
                        </p>
                        <h3 className="mt-1 font-serif text-3xl">{day.title}</h3>
                      </div>
                    </div>

                    <p className="font-serif text-lg italic text-[#A77B73]">
                      {day.note}
                    </p>
                  </div>

                  <div className="grid gap-px bg-[#E8DDD9] sm:grid-cols-2 xl:grid-cols-4">
                    {day.meals.map((meal) => (
                      <Link
                        key={`${day.day}-${meal.type}`}
                        href={meal.href}
                        className="group bg-[#FBF8F6] p-6 transition hover:bg-[#F7F1ED]"
                      >
                        <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                          {meal.type}
                        </p>
                        <p className="mt-3 font-serif text-xl leading-snug">
                          {meal.name}
                        </p>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-[7px] tracking-[0.2em] text-[#8C7770]">
                            VIEW RECIPE
                          </span>
                          <span className="font-serif text-lg text-[#A77B73] transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#8F655E]">
                  MAKE IT EASIER
                </p>
                <h2 className="mt-3 font-serif text-3xl">
                  Repetition is{" "}
                  <span className="italic text-[#9D6F67]">the strategy. ♡</span>
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F5F59]">
                  Prep a few proteins, vegetables and easy sides ahead of time. Repeating breakfasts, snacks and simple dinners keeps a lighter week practical without turning it into restriction.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/resources/meal-plans/grocery-list"
                  className="rounded-full border border-[#B98F87] px-6 py-3 text-[8px] tracking-[0.2em] text-[#6F514B] transition hover:bg-[#F1E2DE]"
                >
                  GROCERY LIST →
                </Link>
                <Link
                  href="/dashboard/resources/meal-plans/meal-prep"
                  className="rounded-full bg-[#211C19] px-6 py-3 text-[8px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  MEAL PREP GUIDE →
                </Link>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                NUTRITION NOTE
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-[#806E68]">
                This is a general meal-planning framework, not an individualized
                calorie or nutrition prescription. “Lighter” refers to activity
                level and meal style — it does not mean no-carb, very-low-calorie
                or automatically better for fat loss. Nutrition needs vary by
                person, and portions can be adjusted.
              </p>
            </div>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73]">
              lighter week. same commitment to yourself. ♡
            </p>

            <Link
              href="/dashboard/resources/meal-plans"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.25em] text-[#F7F1ED]"
            >
              BACK TO MEAL PLANS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
