
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

const plannerSlots: MealSlot[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const recipeLink = (id: string) =>
  `/dashboard/resources/recipes/${id}`;

const days = [
  {
    day: "01",
    title: "Monday",
    focus: "LOWER BODY / GLUTES",
    note: "hard session = give your body fuel. ♡",
    meals: [
      { type: "BREAKFAST", name: "Protein Pancakes", href: recipeLink("protein-pancakes") },
      { type: "LUNCH", name: "Ground Turkey Sweet Potato Bowl", href: recipeLink("ground-turkey-sweet-potato-bowl") },
      { type: "DINNER", name: "Creamy Chicken Protein Pasta", href: recipeLink("creamy-chicken-protein-pasta") },
      { type: "POST-WORKOUT / SNACK", name: "Strawberry Protein Smoothie", href: recipeLink("strawberry-protein-smoothie") },
    ],
  },
  {
    day: "02",
    title: "Tuesday",
    focus: "UPPER BODY",
    note: "protein stays high. meals stay balanced.",
    meals: [
      { type: "BREAKFAST", name: "High-Protein Breakfast Wrap", href: recipeLink("breakfast-wrap") },
      { type: "LUNCH", name: "Chicken Taco Bowl", href: recipeLink("chicken-taco-bowl") },
      { type: "DINNER", name: "Salmon + Roasted Veggies", href: recipeLink("salmon-roasted-veggies") },
      { type: "SNACK", name: "Apple Cinnamon Cottage Cheese Bowl", href: recipeLink("apple-cinnamon-cottage-cheese-bowl") },
    ],
  },
  {
    day: "03",
    title: "Wednesday",
    focus: "RECOVERY / LIGHT CARDIO",
    note: "recover well. you do not have to earn your food.",
    meals: [
      { type: "BREAKFAST", name: "Greek Yogurt Crunch Bowl", href: recipeLink("greek-yogurt-crunch-bowl") },
      { type: "LUNCH", name: "High-Protein Chicken Caesar Wrap", href: recipeLink("chicken-caesar-wrap") },
      { type: "DINNER", name: "Lemon Garlic Shrimp + Zucchini", href: recipeLink("lemon-garlic-shrimp") },
      { type: "SNACK", name: "Turkey Cucumber Roll-Ups", href: recipeLink("turkey-cucumber-roll-ups") },
    ],
  },
  {
    day: "04",
    title: "Thursday",
    focus: "LOWER BODY / GLUTES",
    note: "another hard day. bring the carbs back up. ♡",
    meals: [
      { type: "BREAKFAST", name: "Strawberry Cheesecake Overnight Oats", href: recipeLink("strawberry-cheesecake-overnight-oats") },
      { type: "LUNCH", name: "Loaded Chicken Potato", href: recipeLink("loaded-chicken-potato") },
      { type: "DINNER", name: "Honey Soy Chicken Veggie Bowl", href: recipeLink("honey-soy-chicken-bowl") },
      { type: "POST-WORKOUT / SNACK", name: "Carrot Cake Protein Smoothie", href: recipeLink("carrot-cake-protein-smoothie") },
    ],
  },
  {
    day: "05",
    title: "Friday",
    focus: "UPPER BODY / FULL BODY",
    note: "balanced fuel for another strength day.",
    meals: [
      { type: "BREAKFAST", name: "Cottage Cheese + Egg Toast", href: recipeLink("cottage-cheese-egg-toast") },
      { type: "LUNCH", name: "Ground Turkey Quesadillas", href: recipeLink("turkey-quesadillas") },
      { type: "DINNER", name: "Salmon Power Bowl", href: recipeLink("salmon-power-bowl") },
      { type: "SNACK", name: "Chocolate PB Protein Yogurt", href: recipeLink("chocolate-pb-protein-yogurt") },
    ],
  },
  {
    day: "06",
    title: "Saturday",
    focus: "CONDITIONING / ACTIVE DAY",
    note: "stay fueled without making it complicated.",
    meals: [
      { type: "BREAKFAST", name: "Protein Pancakes", href: recipeLink("protein-pancakes") },
      { type: "LUNCH", name: "Turkey Burger Bowl", href: recipeLink("turkey-burger-bowl") },
      { type: "DINNER", name: "Ground Turkey Sweet Potato Bowl", href: recipeLink("ground-turkey-sweet-potato-bowl") },
      { type: "SNACK / SHAKE", name: "Green Protein Smoothie", href: recipeLink("green-protein-smoothie") },
    ],
  },
  {
    day: "07",
    title: "Sunday",
    focus: "REST + RESET",
    note: "rest is part of the plan too. ♡",
    meals: [
      { type: "BREAKFAST", name: "Veggie Omelette", href: recipeLink("high-protein-veggie-omelette") },
      { type: "LUNCH", name: "Tuna Power Bowl", href: recipeLink("tuna-power-bowl") },
      { type: "DINNER", name: "Turkey Stuffed Bell Peppers", href: recipeLink("turkey-stuffed-peppers") },
      { type: "SNACK", name: "Greek Yogurt Berry Bark", href: recipeLink("greek-yogurt-berry-bark") },
    ],
  },
];

function getRecipeId(href: string) {
  return href.split("/").filter(Boolean).pop() ?? "";
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayForInput() {
  return formatDateForInput(new Date());
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getWeekdayName(date: Date) {
  return date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
}

export default function TrainingWeekPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showPlanConfirmation, setShowPlanConfirmation] =
    useState(false);
  const [isApplyingPlan, setIsApplyingPlan] = useState(false);
  const [applyPlanError, setApplyPlanError] = useState("");
  const [selectedStartDate, setSelectedStartDate] =
    useState(getTodayForInput);

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

    if (!selectedStartDate) {
      setSelectedStartDate(getTodayForInput());
    }

    setShowPlanConfirmation(true);
  };

  const closePlanConfirmation = () => {
    if (isApplyingPlan) return;

    setApplyPlanError("");
    setShowPlanConfirmation(false);
  };

  const applyTrainingPlan = async () => {
    if (isApplyingPlan) return;

    if (!selectedStartDate) {
      setApplyPlanError(
        "Choose the date you want Day 1 to begin."
      );
      return;
    }

    setIsApplyingPlan(true);
    setApplyPlanError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Could not find signed-in user:", userError);
      setApplyPlanError(
        "We couldn't load your account. Please try again."
      );
      setIsApplyingPlan(false);
      return;
    }

    const weekStartDate = selectedStartDate;
    const startDate = parseDateInput(weekStartDate);
    const updatedAt = new Date().toISOString();

    const rows = days.flatMap((day, dayIndex) => {
      const planDate = addDays(startDate, dayIndex);
      const planDateValue = formatDateForInput(planDate);
      const weekday = getWeekdayName(planDate);

      return day.meals.map((meal, mealIndex) => ({
        user_id: user.id,
        day: weekday,
        plan_date: planDateValue,
        meal_slot: plannerSlots[mealIndex],
        recipe_id: getRecipeId(meal.href),
        updated_at: updatedAt,
      }));
    });

    if (
      rows.length !== 28 ||
      rows.some(
        (row) =>
          !row.recipe_id ||
          !row.day ||
          !row.plan_date ||
          !row.meal_slot
      )
    ) {
      console.error("Invalid Training Week meals:", rows);
      setApplyPlanError(
        "Something went wrong while preparing this plan."
      );
      setIsApplyingPlan(false);
      return;
    }

    const { error } = await supabase
      .from("meal_plan_selections")
      .upsert(rows, {
        onConflict: "user_id,plan_date,meal_slot",
      });

    if (error) {
      console.error("Error applying Training Week:", error);
      setApplyPlanError(
        "We couldn't save the plan. Please try again."
      );
      setIsApplyingPlan(false);
      return;
    }

    try {
      window.localStorage.setItem(
        `lockInMealPlannerWeekStart:${user.id}`,
        weekStartDate
      );
    } catch (storageError) {
      console.warn(
        "Could not save planner week start locally:",
        storageError
      );
    }

    setShowPlanConfirmation(false);
    setIsApplyingPlan(false);

    router.push("/dashboard/resources/meal-plans");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-6 md:px-10 lg:px-14">
          {/* COMPACT INTRO */}
          <section className="mx-auto max-w-6xl border-b border-[#DED0CB] pb-7 pt-4 md:pb-9 md:pt-8">
            <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
              NOURISH / 7-DAY PLAN
            </p>

            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Training{" "}
              <span className="italic text-[#A77B73]">
                Week. ♡
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-6 text-[#75635D] sm:text-sm">
              Protein-forward meals with more fuel around
              strength sessions and balanced recovery days.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={openPlanConfirmation}
                className="inline-flex items-center gap-3 rounded-full bg-[#211C19] px-6 py-3 text-[9px] tracking-[0.18em] text-[#F7F1ED] transition hover:opacity-85"
              >
                USE THIS PLAN
                <span className="text-base">→</span>
              </button>

              <span className="text-[9px] tracking-[0.12em] text-[#927D76]">
                7 DAYS · 28 MEALS
              </span>
            </div>
          </section>

          {/* WEEKLY MENU */}
          <section className="mx-auto max-w-6xl pb-12 pt-8 md:pt-10">
            <div className="mb-6">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                YOUR WEEK
              </p>

              <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                The menu{" "}
                <span className="italic text-[#A77B73]">
                  ♡
                </span>
              </h2>
            </div>

            <div className="divide-y divide-[#DED0CB] border-y border-[#DED0CB]">
              {days.map((day) => (
                <article
                  key={day.day}
                  className="py-6 md:py-8"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <span className="font-serif text-2xl italic text-[#C39A92]">
                      {day.day}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                        {day.focus}
                      </p>

                      <h3 className="mt-1 font-serif text-2xl">
                        {day.title}
                      </h3>

                      <p className="mt-1 text-xs text-[#927D76]">
                        {day.note}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#E1D3CE] bg-[#FBF8F6] md:ml-11">
                    {day.meals.map((meal, index) => (
                      <Link
                        key={`${day.day}-${index}`}
                        href={meal.href}
                        className={`group flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[#F4ECE8] sm:px-5 ${
                          index !== day.meals.length - 1
                            ? "border-b border-[#E8DDD9]"
                            : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                            {meal.type}
                          </p>

                          <p className="mt-1 font-serif text-base leading-snug sm:text-lg">
                            {meal.name}
                          </p>
                        </div>

                        <span className="shrink-0 text-lg text-[#A77B73] transition group-hover:translate-x-1">
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
          <section className="mx-auto max-w-6xl pb-10">
            <div className="rounded-2xl bg-[#EAD8D3]/50 p-5 sm:p-6">
              <p className="font-serif text-xl italic text-[#8F655E]">
                fuel it. prep it. keep moving. ♡
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/resources/meal-plans/grocery-list"
                  className="rounded-full bg-[#211C19] px-5 py-3 text-[8px] tracking-[0.15em] text-[#F7F1ED]"
                >
                  GROCERY LIST →
                </Link>

                <Link
                  href="/dashboard/resources/meal-plans/meal-prep"
                  className="rounded-full border border-[#B98F87] px-5 py-3 text-[8px] tracking-[0.15em] text-[#6F514B]"
                >
                  MEAL PREP →
                </Link>
              </div>
            </div>
          </section>

          <p className="mx-auto max-w-6xl border-t border-[#DED0CB] py-6 text-[10px] leading-5 text-[#927D76]">
            This is a flexible meal-planning framework, not an
            individualized nutrition prescription. Adjust portions
            and meals to your needs.
          </p>
        </section>
      </div>

      {/* PLAN CONFIRMATION */}
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
                <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                  TRAINING WEEK
                </p>

                <h2 className="mt-3 font-serif text-3xl">
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] text-lg text-[#9D6F67] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#75635D]">
              Choose your start date. The plan will fill seven
              consecutive days in your meal planner.
            </p>

            <div className="mt-5">
              <label
                htmlFor="training-plan-start-date"
                className="text-[8px] tracking-[0.2em] text-[#9D6F67]"
              >
                START THIS PLAN ON
              </label>

              <input
                id="training-plan-start-date"
                type="date"
                value={selectedStartDate}
                onChange={(event) => {
                  setSelectedStartDate(event.target.value);
                  setApplyPlanError("");
                }}
                disabled={isApplyingPlan}
                className="mt-2 w-full rounded-xl border border-[#D9C6C0] bg-[#FBF8F6] px-4 py-3 text-sm text-[#211C19] outline-none focus:border-[#B78981] disabled:opacity-60"
              />
            </div>

            <p className="mt-4 font-serif text-base italic text-[#A77B73]">
              7 days · 28 meals · your pace. ♡
            </p>

            <p className="mt-2 text-xs leading-5 text-[#927D76]">
              Existing meals on those dates will be replaced.
            </p>

            {applyPlanError && (
              <div className="mt-4 rounded-xl border border-[#D9B7B0] bg-[#F3E3DF] p-4">
                <p className="text-xs text-[#8F5F57]">
                  {applyPlanError}
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePlanConfirmation}
                disabled={isApplyingPlan}
                className="rounded-full border border-[#CBA9A2] px-6 py-3.5 text-[8px] tracking-[0.2em] text-[#806E68] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={applyTrainingPlan}
                disabled={
                  isApplyingPlan || !selectedStartDate
                }
                className="rounded-full bg-[#211C19] px-6 py-3.5 text-[8px] tracking-[0.2em] text-[#F7F1ED] disabled:opacity-70"
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
