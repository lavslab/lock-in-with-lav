"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

const plannerDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const plannerSlots: MealSlot[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const days = [
  {
    day: "01",
    title: "Monday",
    focus: "EASY START",
    note: "ease into the week. simple still counts. ♡",
    meals: [
      {
        type: "BREAKFAST",
        name: "Greek Yogurt Crunch Bowl",
        href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl",
      },
      {
        type: "LUNCH",
        name: "Turkey Burger Bowl",
        href: "/dashboard/resources/recipes/turkey-burger-bowl",
      },
      {
        type: "DINNER",
        name: "Lemon Garlic Shrimp + Zucchini",
        href: "/dashboard/resources/recipes/lemon-garlic-shrimp",
      },
      {
        type: "SNACK",
        name: "Protein Snack Box",
        href: "/dashboard/resources/recipes/protein-snack-box",
      },
    ],
  },
  {
    day: "02",
    title: "Tuesday",
    focus: "BALANCED DAY",
    note: "keep it balanced. keep it easy.",
    meals: [
      {
        type: "BREAKFAST",
        name: "High-Protein Breakfast Wrap",
        href: "/dashboard/resources/recipes/breakfast-wrap",
      },
      {
        type: "LUNCH",
        name: "Black Bean + Corn Tacos",
        href: "/dashboard/resources/recipes/black-bean-corn-tacos",
      },
      {
        type: "DINNER",
        name: "Salmon + Roasted Veggies",
        href: "/dashboard/resources/recipes/salmon-roasted-veggies",
      },
      {
        type: "SNACK / SHAKE",
        name: "Strawberry Protein Smoothie",
        href: "/dashboard/resources/recipes/strawberry-protein-smoothie",
      },
    ],
  },
  {
    day: "03",
    title: "Wednesday",
    focus: "LIGHT + SIMPLE",
    note: "less effort. still nourishing. ♡",
    meals: [
      {
        type: "BREAKFAST",
        name: "Greek Yogurt Crunch Bowl",
        href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl",
      },
      {
        type: "LUNCH",
        name: "Ground Turkey Quesadillas",
        href: "/dashboard/resources/recipes/turkey-quesadillas",
      },
      {
        type: "DINNER",
        name: "Turkey Stuffed Bell Peppers",
        href: "/dashboard/resources/recipes/turkey-stuffed-peppers",
      },
      {
        type: "SNACK",
        name: "Protein Snack Box",
        href: "/dashboard/resources/recipes/protein-snack-box",
      },
    ],
  },
  {
    day: "04",
    title: "Thursday",
    focus: "A LITTLE MORE FUEL",
    note: "more active today? give yourself the fuel. ♡",
    meals: [
      {
        type: "BREAKFAST",
        name: "Protein Pancakes",
        href: "/dashboard/resources/recipes/protein-pancakes",
      },
      {
        type: "LUNCH",
        name: "Chicken Taco Bowl",
        href: "/dashboard/resources/recipes/chicken-taco-bowl",
      },
      {
        type: "DINNER",
        name: "Honey Soy Chicken Veggie Bowl",
        href: "/dashboard/resources/recipes/honey-soy-chicken-bowl",
      },
      {
        type: "SNACK / SHAKE",
        name: "Strawberry Protein Smoothie",
        href: "/dashboard/resources/recipes/strawberry-protein-smoothie",
      },
    ],
  },
  {
    day: "05",
    title: "Friday",
    focus: "BALANCED",
    note: "finish the week feeling good, not restricted.",
    meals: [
      {
        type: "BREAKFAST",
        name: "High-Protein Breakfast Wrap",
        href: "/dashboard/resources/recipes/breakfast-wrap",
      },
      {
        type: "LUNCH",
        name: "Turkey Burger Bowl",
        href: "/dashboard/resources/recipes/turkey-burger-bowl",
      },
      {
        type: "DINNER",
        name: "Lemon Garlic Shrimp + Zucchini",
        href: "/dashboard/resources/recipes/lemon-garlic-shrimp",
      },
      {
        type: "SNACK",
        name: "Greek Yogurt Crunch Bowl",
        href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl",
      },
    ],
  },
  {
    day: "06",
    title: "Saturday",
    focus: "FLEXIBLE",
    note: "structure with room to enjoy your weekend. ♡",
    meals: [
      {
        type: "BREAKFAST",
        name: "Greek Yogurt Crunch Bowl",
        href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl",
      },
      {
        type: "LUNCH",
        name: "Black Bean + Corn Tacos",
        href: "/dashboard/resources/recipes/black-bean-corn-tacos",
      },
      {
        type: "DINNER",
        name: "Loaded Chicken Potato",
        href: "/dashboard/resources/recipes/loaded-chicken-potato",
      },
      {
        type: "SNACK",
        name: "Protein Snack Box",
        href: "/dashboard/resources/recipes/protein-snack-box",
      },
    ],
  },
  {
    day: "07",
    title: "Sunday",
    focus: "RESET + PREP",
    note: "eat well. reset. make next week easier.",
    meals: [
      {
        type: "BREAKFAST",
        name: "Protein Pancakes",
        href: "/dashboard/resources/recipes/protein-pancakes",
      },
      {
        type: "LUNCH",
        name: "Crispy Black Bean Taquitos",
        href: "/dashboard/resources/recipes/black-bean-taquitos",
      },
      {
        type: "DINNER",
        name: "Salmon + Roasted Veggies",
        href: "/dashboard/resources/recipes/salmon-roasted-veggies",
      },
      {
        type: "SNACK / SHAKE",
        name: "Strawberry Protein Smoothie",
        href: "/dashboard/resources/recipes/strawberry-protein-smoothie",
      },
    ],
  },
];

function getRecipeId(href: string) {
  return href.split("/").filter(Boolean).pop() ?? "";
}

export default function LighterWeekPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [showPlanConfirmation, setShowPlanConfirmation] =
    useState(false);

  const [isApplyingPlan, setIsApplyingPlan] =
    useState(false);

  const [applyPlanError, setApplyPlanError] =
    useState("");

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

  useEffect(() => {
    if (!showPlanConfirmation) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showPlanConfirmation]);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const openPlanConfirmation = () => {
    setApplyPlanError("");
    setShowPlanConfirmation(true);
  };

  const closePlanConfirmation = () => {
    if (isApplyingPlan) {
      return;
    }

    setApplyPlanError("");
    setShowPlanConfirmation(false);
  };

  const applyLighterPlan = async () => {
    if (isApplyingPlan) {
      return;
    }

    setIsApplyingPlan(true);
    setApplyPlanError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Could not find signed-in user:",
        userError
      );

      setApplyPlanError(
        "We couldn't load your account. Please try again."
      );

      setIsApplyingPlan(false);
      return;
    }

    const updatedAt = new Date().toISOString();

    const rows = days.flatMap((day, dayIndex) =>
      day.meals.map((meal, mealIndex) => ({
        user_id: user.id,
        day: plannerDays[dayIndex],
        meal_slot: plannerSlots[mealIndex],
        recipe_id: getRecipeId(meal.href),
        updated_at: updatedAt,
      }))
    );

    if (
      rows.length !== 28 ||
      rows.some((row) => !row.recipe_id)
    ) {
      console.error(
        "Lighter Week could not be converted into 28 planner meals.",
        rows
      );

      setApplyPlanError(
        "Something went wrong while preparing this plan. Please try again."
      );

      setIsApplyingPlan(false);
      return;
    }

    const { error } = await supabase
      .from("meal_plan_selections")
      .upsert(rows, {
        onConflict: "user_id,day,meal_slot",
      });

    if (error) {
      console.error(
        "Error applying Lighter Week:",
        error
      );

      setApplyPlanError(
        "We couldn't save the plan. Please try again."
      );

      setIsApplyingPlan(false);
      return;
    }

    setShowPlanConfirmation(false);
    setIsApplyingPlan(false);

    router.push("/dashboard/resources/meal-plans");
  };

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73] sm:text-xl">
                your week, already planned. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/meal-plans"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← MEAL PLANS
            </Link>
          </header>

          {/* LIGHT PLAN INTRO */}

          <section className="mx-auto max-w-6xl pb-10 pt-14 md:pb-14 md:pt-20">
            <div className="grid gap-8 border-b border-[#DED0CB] pb-10 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-12">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                    7-DAY PLAN
                  </p>

                  <span className="h-px w-8 bg-[#CBA9A2]" />

                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    LIGHTER ACTIVITY
                  </p>
                </div>

                <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
                  Lighter
                  <span className="block italic text-[#A77B73]">
                    Week. ♡
                  </span>
                </h1>
              </div>

              <div className="md:pb-1">
                <p className="max-w-md text-xs leading-6 text-[#75635D]">
                  A protein-forward week for recovery periods,
                  lighter activity or weeks with fewer demanding
                  workouts. Simple, satisfying meals with plenty
                  of room to adjust.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    "7 DAYS",
                    "PROTEIN FORWARD",
                    "LIGHTER MEALS",
                    "FLEXIBLE",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[7px] tracking-[0.2em] text-[#9D6F67]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={openPlanConfirmation}
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#211C19] px-6 py-3.5 text-[8px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  USE THIS PLAN
                  <span className="font-serif text-base">
                    →
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* SIMPLE NOTE */}

          <section className="mx-auto max-w-6xl pb-10 md:pb-14">
            <div className="flex items-start gap-4 rounded-2xl bg-[#EAD8D3]/45 px-5 py-4 sm:px-6">
              <span className="font-serif text-xl italic text-[#B78981]">
                ♡
              </span>

              <p className="max-w-4xl text-[10px] leading-5 text-[#75635D] sm:text-xs sm:leading-6">
                Use this as a framework, not a restriction. Swap
                similar meals, adjust portions to your needs, and
                add more fuel when your activity, hunger or
                schedule calls for it.
              </p>
            </div>
          </section>

          {/* WEEK */}

          <section className="mx-auto max-w-6xl pb-14">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR WEEK
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Seven days of{" "}
                <span className="italic text-[#A77B73]">
                  lighter structure. ♡
                </span>
              </h2>
            </div>

            <div className="divide-y divide-[#DED0CB] border-y border-[#DED0CB]">
              {days.map((day) => (
                <article
                  key={day.day}
                  className="py-7 md:py-9"
                >
                  {/* DAY HEADING */}

                  <div className="mb-5 flex items-start gap-4 md:mb-6 md:gap-6">
                    <span className="pt-0.5 font-serif text-3xl italic text-[#C39A92] md:text-4xl">
                      {day.day}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <div>
                          <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                            {day.focus}
                          </p>

                          <h3 className="mt-1 font-serif text-2xl md:text-3xl">
                            {day.title}
                          </h3>
                        </div>

                        <p className="mt-1 font-serif text-sm italic text-[#A77B73] sm:mt-0 sm:text-base">
                          {day.note}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MEALS */}

                  <div className="ml-0 overflow-hidden rounded-2xl border border-[#E1D3CE] bg-[#FBF8F6] md:ml-[62px]">
                    {day.meals.map((meal, index) => (
                      <Link
                        key={`${day.day}-${meal.type}`}
                        href={meal.href}
                        className={`group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-[#F4ECE8] sm:px-5 ${
                          index !== day.meals.length - 1
                            ? "border-b border-[#E8DDD9]"
                            : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                            {meal.type}
                          </p>

                          <p className="mt-1.5 font-serif text-lg leading-snug sm:text-xl">
                            {meal.name}
                          </p>
                        </div>

                        <span className="shrink-0 font-serif text-xl text-[#A77B73] transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* QUICK LINKS */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="flex flex-col gap-6 rounded-[1.75rem] bg-[#EAD8D3]/60 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#8F655E]">
                  MAKE THE WEEK EASIER
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#8F655E] md:text-2xl">
                  keep it simple. prep what helps. ♡
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/resources/meal-plans/grocery-list"
                  className="rounded-full bg-[#211C19] px-5 py-3 text-[7px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  GROCERY LIST →
                </Link>

                <Link
                  href="/dashboard/resources/meal-plans/meal-prep"
                  className="rounded-full border border-[#B98F87] px-5 py-3 text-[7px] tracking-[0.2em] text-[#6F514B] transition hover:bg-[#F1E2DE]"
                >
                  MEAL PREP →
                </Link>
              </div>
            </div>
          </section>

          {/* NUTRITION NOTE */}

          <section className="mx-auto max-w-6xl border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Nutrition note: This is a general meal-planning
              framework, not an individualized nutrition
              prescription. “Lighter” refers to activity level
              and meal style — not no-carb, very-low-calorie or
              automatically better for fat loss. Needs vary by
              person and portions can be adjusted.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 pt-5 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              lighter week. same commitment to yourself. ♡
            </p>

            <Link
              href="/dashboard/resources/meal-plans"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-7 py-3.5 text-[8px] tracking-[0.23em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              BACK TO MEAL PLANS
            </Link>
          </section>
        </section>
      </div>

      {/* USE PLAN CONFIRMATION */}

      {showPlanConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211C19]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isApplyingPlan
            ) {
              closePlanConfirmation();
            }
          }}
        >
          <div className="w-full max-w-md rounded-t-[2rem] bg-[#F7F1ED] px-6 pb-7 pt-7 shadow-2xl sm:rounded-[2rem] sm:px-8 sm:pb-8 sm:pt-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  LIGHTER WEEK
                </p>

                <h2 className="mt-3 font-serif text-3xl leading-tight">
                  Use this{" "}
                  <span className="italic text-[#A77B73]">
                    plan? ♡
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={closePlanConfirmation}
                disabled={isApplyingPlan}
                aria-label="Close confirmation"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] text-lg text-[#9D6F67] transition hover:bg-[#EAD8D3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#75635D]">
              This will replace the meals currently saved in
              your weekly planner with the Lighter Week plan.
              You can still change or remove individual meals
              afterward.
            </p>

            <div className="mt-5 rounded-2xl bg-[#EAD8D3]/45 px-5 py-4">
              <p className="font-serif text-lg italic text-[#A77B73]">
                7 days • 28 meals • lighter structure, still flexible.
              </p>
            </div>

            {applyPlanError && (
              <div className="mt-4 rounded-2xl border border-[#D9B7B0] bg-[#F3E3DF] px-4 py-3">
                <p className="text-xs leading-5 text-[#8F5F57]">
                  {applyPlanError}
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePlanConfirmation}
                disabled={isApplyingPlan}
                className="rounded-full border border-[#CBA9A2] px-6 py-3.5 text-[8px] tracking-[0.2em] text-[#806E68] transition hover:bg-[#EAD8D3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={applyLighterPlan}
                disabled={isApplyingPlan}
                className="rounded-full bg-[#211C19] px-6 py-3.5 text-[8px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-70"
              >
                {isApplyingPlan
                  ? "ADDING PLAN..."
                  : "YES, USE THIS PLAN →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}