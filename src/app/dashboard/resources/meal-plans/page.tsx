
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
type Sex = "female" | "male";
type Unit = "imperial" | "metric";
type Goal = "lose" | "maintain" | "gain";
type HelperTab = "targets" | "plan" | null;

type Recipe = {
  id: string;
  title: string;
  category: MealSlot;
};

type PlannerMeal = {
  id?: string;
  user_id?: string;
  day: string;
  plan_date: string;
  meal_slot: MealSlot;
  recipe_id?: string | null;
  custom_meal_name?: string | null;
  updated_at?: string;
};

type CustomMeal = {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
};

const mealSlots: MealSlot[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const recipes: Recipe[] = [
  { id: "protein-pancakes", title: "Protein Pancakes", category: "BREAKFAST" },
  { id: "breakfast-wrap", title: "High-Protein Breakfast Wrap", category: "BREAKFAST" },
  { id: "greek-yogurt-crunch-bowl", title: "Greek Yogurt Crunch Bowl", category: "BREAKFAST" },
  { id: "strawberry-protein-smoothie", title: "Strawberry Protein Smoothie", category: "SNACK" },
  { id: "protein-snack-box", title: "Protein Snack Box", category: "SNACK" },
  { id: "chicken-taco-bowl", title: "Chicken Taco Bowl", category: "LUNCH" },
  { id: "ground-turkey-sweet-potato-bowl", title: "Ground Turkey Sweet Potato Bowl", category: "LUNCH" },
  { id: "turkey-burger-bowl", title: "Turkey Burger Bowl", category: "LUNCH" },
  { id: "turkey-quesadillas", title: "Ground Turkey Quesadillas", category: "LUNCH" },
  { id: "black-bean-corn-tacos", title: "Black Bean + Corn Tacos", category: "LUNCH" },
  { id: "black-bean-taquitos", title: "Crispy Black Bean Taquitos", category: "LUNCH" },
  { id: "creamy-chicken-protein-pasta", title: "Creamy Chicken Protein Pasta", category: "DINNER" },
  { id: "salmon-roasted-veggies", title: "Salmon + Roasted Veggies", category: "DINNER" },
  { id: "lemon-garlic-shrimp", title: "Lemon Garlic Shrimp + Zucchini", category: "DINNER" },
  { id: "loaded-chicken-potato", title: "Loaded Chicken Potato", category: "DINNER" },
  { id: "honey-soy-chicken-bowl", title: "Honey Soy Chicken Veggie Bowl", category: "DINNER" },
  { id: "salmon-power-bowl", title: "Salmon Power Bowl", category: "DINNER" },
  { id: "turkey-stuffed-peppers", title: "Turkey Stuffed Bell Peppers", category: "DINNER" },
];

const plans = [
  {
    title: "LIGHTER WEEK",
    subtitle: "keep it light, not restrictive.",
    href: "/dashboard/resources/meal-plans/lighter-week",
  },
  {
    title: "BALANCED WEEK",
    subtitle: "simple. balanced. repeatable.",
    href: "/dashboard/resources/meal-plans/balanced-week",
  },
  {
    title: "TRAINING WEEK",
    subtitle: "fuel the work.",
    href: "/dashboard/resources/meal-plans/training-week",
  },
];

const activityLevels = [
  { value: "1.2", label: "Sedentary" },
  { value: "1.375", label: "Light — 1–3 days/week" },
  { value: "1.55", label: "Moderate — 3–5 days/week" },
  { value: "1.725", label: "Very active — 6–7 days/week" },
];

const goals: { value: Goal; label: string }[] = [
  { value: "lose", label: "Lose fat" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Build / gain" },
];

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#DED0CB] bg-[#FBF8F6] px-3 py-3 text-[16px] text-[#211C19] outline-none transition placeholder:text-[#B3A09A] focus:border-[#A77B73]";

const labelClass =
  "mb-2 block text-[8px] tracking-[0.16em] text-[#92776F]";

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function shiftDate(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function displayDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString(
    "en-CA",
    options ?? { month: "short", day: "numeric" }
  );
}

function mealKey(date: string, slot: MealSlot) {
  return `${date}-${slot}`;
}

function recipeById(id?: string | null) {
  return recipes.find((recipe) => recipe.id === id) ?? null;
}

export default function MealPlansPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Always start on the current date instead of restoring
  // an older date from localStorage.
  const [weekStart, setWeekStart] = useState(() => dateKey(new Date()));
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [plannerMeals, setPlannerMeals] = useState<Record<string, PlannerMeal>>({});
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [isLoadingPlanner, setIsLoadingPlanner] = useState(true);
  const [plannerError, setPlannerError] = useState("");

  const [activeHelperTab, setActiveHelperTab] = useState<HelperTab>(null);
  const planSectionRef = useRef<HTMLDivElement | null>(null);

  const [unit, setUnit] = useState<Unit>("imperial");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<Goal>("maintain");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState("");
  const [pickerSlot, setPickerSlot] = useState<MealSlot>("BREAKFAST");
  const [pickerCategory, setPickerCategory] = useState<MealSlot>("BREAKFAST");
  const [pickerTab, setPickerTab] = useState<"recipes" | "custom">("recipes");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [customMealName, setCustomMealName] = useState("");
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isSavingCustomMeal, setIsSavingCustomMeal] = useState(false);
  const [deletingCustomMealId, setDeletingCustomMealId] = useState<string | null>(null);

  const plannerWeek = useMemo(() => {
    if (!weekStart) return [];

    const start = parseDate(weekStart);

    return Array.from({ length: 7 }, (_, index) => {
      const date = shiftDate(start, index);

      return {
        date: dateKey(date),
        weekday: displayDate(date, { weekday: "short" }).toUpperCase(),
        fullWeekday: displayDate(date, { weekday: "long" }),
        shortDate: displayDate(date),
        dayNumber: date.getDate(),
        month: displayDate(date, { month: "short" }).toUpperCase(),
      };
    });
  }, [weekStart]);

  const activeDay = plannerWeek[activeDayIndex] ?? plannerWeek[0];
  const today = dateKey(new Date());

  const weekRange = useMemo(() => {
    if (plannerWeek.length === 0) return "";

    const first = parseDate(plannerWeek[0].date);
    const last = parseDate(plannerWeek[6].date);

    return `${displayDate(first)} — ${displayDate(last, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }, [plannerWeek]);

  const filledMeals = useMemo(
    () =>
      plannerWeek.reduce(
        (count, day) =>
          count +
          mealSlots.filter((slot) => plannerMeals[mealKey(day.date, slot)]).length,
        0
      ),
    [plannerWeek, plannerMeals]
  );

  const macroResult = useMemo(() => {
    const a = Number(age);
    const w = Number(weight);
    const activityValue = Number(activity);

    if (!a || !w || a < 18 || w <= 0) return null;

    const kg = unit === "imperial" ? w / 2.20462 : w;

    let cm = 0;

    if (unit === "imperial") {
      const ft = Number(feet);
      const inch = Number(inches || 0);

      if (!ft || ft <= 0 || inch < 0 || inch >= 12) return null;

      cm = (ft * 12 + inch) * 2.54;
    } else {
      cm = Number(heightCm);
      if (!cm || cm <= 0) return null;
    }

    const bmr = 10 * kg + 6.25 * cm - 5 * a + (sex === "male" ? 5 : -161);
    const maintenance = bmr * activityValue;
    const multiplier = goal === "lose" ? 0.85 : goal === "gain" ? 1.1 : 1;

    const calories = Math.round(maintenance * multiplier);
    const protein = Math.round(kg * (goal === "maintain" ? 1.6 : 1.8));
    const fat = Math.round((calories * 0.3) / 9);
    const carbs = Math.round(
      Math.max(calories - protein * 4 - fat * 9, 0) / 4
    );

    return {
      calories,
      protein,
      fat,
      carbs,
      maintenance: Math.round(maintenance),
    };
  }, [age, weight, feet, inches, heightCm, unit, sex, activity, goal]);

  const recommendedPlan = useMemo(() => {
    const level = Number(activity);

    if (level <= 1.2) {
      return goal === "gain" ? plans[1] : plans[0];
    }

    if (level <= 1.375) {
      return goal === "lose" ? plans[0] : plans[1];
    }

    if (level <= 1.55) {
      return goal === "gain" ? plans[2] : plans[1];
    }

    return plans[2];
  }, [activity, goal]);

  const filteredRecipes = useMemo(() => {
    const search = recipeSearch.trim().toLowerCase();

    return recipes
      .filter((recipe) => recipe.category === pickerCategory)
      .filter((recipe) => recipe.title.toLowerCase().includes(search))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [pickerCategory, recipeSearch]);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (user) {
        setUserId(user.id);

        const name = user.user_metadata?.name;
        setFirstName(name || user.email?.split("@")[0] || "there");
      } else {
        setIsLoadingPlanner(false);
      }

      setIsLoadingUser(false);
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userId || plannerWeek.length === 0) return;

    let active = true;

    async function loadPlanner() {
      setIsLoadingPlanner(true);
      setPlannerError("");

      const { data, error } = await supabase
        .from("meal_plan_selections")
        .select("*")
        .eq("user_id", userId)
        .gte("plan_date", plannerWeek[0].date)
        .lte("plan_date", plannerWeek[6].date)
        .order("plan_date", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Could not load meal planner:", error);
        setPlannerError("We couldn't load your saved meals.");
      } else {
        const next: Record<string, PlannerMeal> = {};

        ((data ?? []) as PlannerMeal[]).forEach((meal) => {
          next[mealKey(meal.plan_date, meal.meal_slot)] = meal;
        });

        setPlannerMeals(next);
      }

      setIsLoadingPlanner(false);
    }

    loadPlanner();

    return () => {
      active = false;
    };
  }, [userId, plannerWeek]);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadCustomMeals() {
      const { data, error } = await supabase
        .from("custom_meals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (active && !error) {
        setCustomMeals((data ?? []) as CustomMeal[]);
      }
    }

    loadCustomMeals();

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!pickerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pickerOpen]);

  function changeWeek(value: string) {
    if (!value) return;

    setWeekStart(value);
    setActiveDayIndex(0);
  }

  function moveWeek(days: number) {
    changeWeek(dateKey(shiftDate(parseDate(weekStart), days)));
  }

  function toggleHelperTab(tab: Exclude<HelperTab, null>) {
    setActiveHelperTab((current) => (current === tab ? null : tab));
  }

  function openMealPicker(date: string, slot: MealSlot) {
    setPickerDate(date);
    setPickerSlot(slot);
    setPickerCategory(slot);
    setPickerTab("recipes");
    setRecipeSearch("");
    setCustomMealName("");
    setPlannerError("");
    setPickerOpen(true);
  }

  function closeMealPicker() {
    if (isSavingMeal || isSavingCustomMeal) return;

    setPickerOpen(false);
    setRecipeSearch("");
    setCustomMealName("");
  }

  async function saveMeal(recipeId: string | null, customName: string | null) {
    if (!userId || !pickerDate || isSavingMeal) return false;

    setIsSavingMeal(true);
    setPlannerError("");

    const row = {
      user_id: userId,
      day: displayDate(parseDate(pickerDate), {
        weekday: "long",
      }).toUpperCase(),
      plan_date: pickerDate,
      meal_slot: pickerSlot,
      recipe_id: recipeId,
      custom_meal_name: customName,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("meal_plan_selections")
      .upsert(row, {
        onConflict: "user_id,plan_date,meal_slot",
      })
      .select()
      .single();

    setIsSavingMeal(false);

    if (error || !data) {
      console.error("Could not save meal:", error);
      setPlannerError("We couldn't save that meal. Please try again.");
      return false;
    }

    setPlannerMeals((current) => ({
      ...current,
      [mealKey(pickerDate, pickerSlot)]: data as PlannerMeal,
    }));

    setPickerOpen(false);
    setRecipeSearch("");
    setCustomMealName("");

    return true;
  }

  async function createAndUseCustomMeal() {
    const name = customMealName.trim();

    if (!userId || !name || isSavingCustomMeal || isSavingMeal) return;

    setIsSavingCustomMeal(true);
    setPlannerError("");

    const existing = customMeals.find(
      (meal) => meal.name.trim().toLowerCase() === name.toLowerCase()
    );

    let savedName = existing?.name ?? name;

    if (!existing) {
      const { data, error } = await supabase
        .from("custom_meals")
        .insert({ user_id: userId, name })
        .select()
        .single();

      if (error || !data) {
        console.error("Could not create custom meal:", error);
        setPlannerError("We couldn't save your custom meal.");
        setIsSavingCustomMeal(false);
        return;
      }

      const newMeal = data as CustomMeal;
      savedName = newMeal.name;

      setCustomMeals((current) => [newMeal, ...current]);
    }

    const success = await saveMeal(null, savedName);

    if (!success) {
      setPlannerError(
        "Your custom meal was saved, but we couldn't add it to this day."
      );
    }

    setIsSavingCustomMeal(false);
  }

  async function deleteCustomMeal(meal: CustomMeal) {
    if (!userId || deletingCustomMealId) return;

    setDeletingCustomMealId(meal.id);
    setPlannerError("");

    const { error } = await supabase
      .from("custom_meals")
      .delete()
      .eq("id", meal.id)
      .eq("user_id", userId);

    if (error) {
      setPlannerError("We couldn't remove that saved meal.");
    } else {
      setCustomMeals((current) =>
        current.filter((item) => item.id !== meal.id)
      );
    }

    setDeletingCustomMealId(null);
  }

  async function removeMeal(date: string, slot: MealSlot) {
    if (!userId) return;

    const key = mealKey(date, slot);
    const previous = plannerMeals[key];

    setPlannerMeals((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    const { error } = await supabase
      .from("meal_plan_selections")
      .delete()
      .eq("user_id", userId)
      .eq("plan_date", date)
      .eq("meal_slot", slot);

    if (error) {
      if (previous) {
        setPlannerMeals((current) => ({
          ...current,
          [key]: previous,
        }));
      }

      setPlannerError("We couldn't remove that meal.");
    }
  }

  function renderMealRow(date: string, slot: MealSlot) {
    const meal = plannerMeals[mealKey(date, slot)];
    const recipe = recipeById(meal?.recipe_id);
    const mealName =
      recipe?.title ??
      meal?.custom_meal_name ??
      (meal?.recipe_id ? "Saved recipe" : "");

    return (
      <div
        key={`${date}-${slot}`}
        className="flex min-h-[72px] items-center gap-3 border-b border-[#E9DEDA] px-4 py-3 last:border-b-0 sm:px-5"
      >
        <div className="w-[76px] shrink-0 sm:w-[95px]">
          <p className="text-[8px] tracking-[0.14em] text-[#9D6F67]">
            {slot}
          </p>
        </div>

        {isLoadingPlanner ? (
          <div className="h-5 flex-1 animate-pulse rounded bg-[#EDE2DE]" />
        ) : meal ? (
          <>
            <div className="min-w-0 flex-1">
              {recipe ? (
                <Link
                  href={`/dashboard/resources/recipes/${recipe.id}`}
                  className="font-serif text-[15px] leading-snug text-[#211C19] transition hover:text-[#A77B73]"
                >
                  {mealName}
                </Link>
              ) : (
                <p className="font-serif text-[15px] leading-snug text-[#211C19]">
                  {mealName}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => openMealPicker(date, slot)}
                className="text-[8px] tracking-[0.1em] text-[#9D6F67] hover:text-[#211C19]"
                aria-label={`Change ${slot.toLowerCase()}`}
              >
                EDIT
              </button>

              <button
                type="button"
                onClick={() => removeMeal(date, slot)}
                className="text-base text-[#B48B83] hover:text-[#211C19]"
                aria-label={`Remove ${slot.toLowerCase()}`}
              >
                ×
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => openMealPicker(date, slot)}
            className="group flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          >
            <span className="font-serif text-[15px] italic text-[#B69A92] transition group-hover:text-[#8F655E]">
              add a meal
            </span>
            <span className="text-lg text-[#B48B83]">+</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-9 lg:px-14">
          

          <div className="mx-auto max-w-6xl pb-12 pt-0 md:pt-16">
            {/* INTRO */}
            <section className="border-b border-[#DED0CB] pb-6">
              <p className="text-[8px] tracking-[0.26em] text-[#9D6F67]">
                NOURISH / MEAL PLANS
              </p>

              <h1 className="mt-3 font-serif text-4xl font-normal leading-tight sm:text-5xl">
                The Nourish{" "}
                <span className="italic text-[#A77B73]">Method.</span>
              </h1>

              <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                a little structure for the week ahead. ♡
              </p>
            </section>

            {/* GUIDANCE */}
            <section className="pt-3">
              <div className="mb-2">
                <p className="text-[8px] tracking-[0.24em] text-[#9D6F67]">
                  A LITTLE GUIDANCE
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.35rem] border border-[#DED0CB] bg-[#FBF8F6]">
                {/* TARGETS */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleHelperTab("targets")}
                    aria-expanded={activeHelperTab === "targets"}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#F4ECE8] ${
                      activeHelperTab === "targets" ? "bg-[#F4ECE8]" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="font-serif text-xl italic text-[#C39A92]">
                        01
                      </span>

                      <div>
                        <p className="text-[9px] tracking-[0.16em]">
                          FIND YOUR TARGETS
                        </p>
                        <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                          calories + macros, made simple.
                        </p>
                      </div>
                    </div>

                    <span className="text-xl text-[#A77B73]">
                      {activeHelperTab === "targets" ? "−" : "+"}
                    </span>
                  </button>

                  {activeHelperTab === "targets" && (
                    <div className="border-t border-[#DED0CB] px-5 pb-7 pt-6">
                      <p className="mb-6 max-w-lg text-[11px] leading-5 text-[#806E68]">
                        A starting estimate based on your details,
                        activity and goals.
                      </p>

                      <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr]">
                        <div>
                          <div className="mb-5 flex items-center justify-between gap-3">
                            <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                              YOUR DETAILS
                            </p>

                            <select
                              value={unit}
                              onChange={(e) =>
                                setUnit(e.target.value as Unit)
                              }
                              className="rounded-lg border border-[#DED0CB] bg-[#F7F1ED] px-3 py-2 text-[11px] outline-none"
                            >
                              <option value="imperial">LB / FT</option>
                              <option value="metric">KG / CM</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <label>
                              <span className={labelClass}>AGE</span>
                              <input
                                type="number"
                                min="18"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Age"
                                className={inputClass}
                              />
                            </label>

                            <label>
                              <span className={labelClass}>SEX</span>
                              <select
                                value={sex}
                                onChange={(e) =>
                                  setSex(e.target.value as Sex)
                                }
                                className={inputClass}
                              >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                              </select>
                            </label>

                            <label>
                              <span className={labelClass}>
                                WEIGHT ({unit === "imperial" ? "LB" : "KG"})
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Weight"
                                className={inputClass}
                              />
                            </label>

                            {unit === "imperial" ? (
                              <div>
                                <span className={labelClass}>HEIGHT</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={feet}
                                    onChange={(e) => setFeet(e.target.value)}
                                    placeholder="Ft"
                                    className={inputClass}
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={inches}
                                    onChange={(e) => setInches(e.target.value)}
                                    placeholder="In"
                                    className={inputClass}
                                  />
                                </div>
                              </div>
                            ) : (
                              <label>
                                <span className={labelClass}>HEIGHT (CM)</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={heightCm}
                                  onChange={(e) => setHeightCm(e.target.value)}
                                  placeholder="Height"
                                  className={inputClass}
                                />
                              </label>
                            )}

                            <label>
                              <span className={labelClass}>ACTIVITY LEVEL</span>
                              <select
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                className={inputClass}
                              >
                                {activityLevels.map((level) => (
                                  <option key={level.value} value={level.value}>
                                    {level.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label>
                              <span className={labelClass}>YOUR GOAL</span>
                              <select
                                value={goal}
                                onChange={(e) =>
                                  setGoal(e.target.value as Goal)
                                }
                                className={inputClass}
                              >
                                {goals.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>

                        <div className="rounded-[1.2rem] bg-[#EAD8D3]/40 p-5">
                          <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                            YOUR STARTING TARGETS
                          </p>

                          {macroResult ? (
                            <>
                              <div className="border-b border-[#D8C4BE] py-5">
                                <p className="font-serif text-4xl">
                                  {macroResult.calories.toLocaleString()}
                                </p>
                                <p className="mt-1 text-[8px] tracking-[0.13em] text-[#92776F]">
                                  ESTIMATED CALORIES / DAY
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-2 border-b border-[#D8C4BE] py-5">
                                {[
                                  {
                                    label: "PROTEIN",
                                    value: macroResult.protein,
                                  },
                                  {
                                    label: "CARBS",
                                    value: macroResult.carbs,
                                  },
                                  {
                                    label: "FAT",
                                    value: macroResult.fat,
                                  },
                                ].map((item) => (
                                  <div key={item.label}>
                                    <p className="font-serif text-2xl">
                                      {item.value}
                                      <span className="text-xs italic text-[#A77B73]">
                                        g
                                      </span>
                                    </p>
                                    <p className="mt-1 text-[7px] tracking-[0.1em] text-[#92776F]">
                                      {item.label}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <p className="mt-4 text-[10px] text-[#806E68]">
                                Maintenance estimate:{" "}
                                {macroResult.maintenance.toLocaleString()} cal
                              </p>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveHelperTab("plan");
                                  window.setTimeout(() => {
                                    planSectionRef.current?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                  }, 100);
                                }}
                                className="mt-5 w-full rounded-full bg-[#211C19] px-4 py-3 text-[8px] tracking-[0.12em] text-[#F7F1ED]"
                              >
                                SEE MY PLAN →
                              </button>
                            </>
                          ) : (
                            <div className="py-8">
                              <p className="font-serif text-xl italic text-[#A77B73]">
                                your numbers will appear here. ♡
                              </p>
                              <p className="mt-3 text-[11px] leading-5 text-[#806E68]">
                                Add your details to get started.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="mt-5 text-[9px] leading-5 text-[#927D76]">
                        General estimates only, not individualized nutrition
                        advice. Adjust for your needs and how you feel.
                      </p>
                    </div>
                  )}
                </div>

                {/* PLAN */}
                <div className="border-t border-[#DED0CB]">
                  <button
                    type="button"
                    onClick={() => toggleHelperTab("plan")}
                    aria-expanded={activeHelperTab === "plan"}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#F4ECE8] ${
                      activeHelperTab === "plan" ? "bg-[#F4ECE8]" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="font-serif text-xl italic text-[#C39A92]">
                        02
                      </span>

                      <div>
                        <p className="text-[9px] tracking-[0.16em]">
                          FIND YOUR PLAN
                        </p>
                        <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                          a little structure for your week.
                        </p>
                      </div>
                    </div>

                    <span className="text-xl text-[#A77B73]">
                      {activeHelperTab === "plan" ? "−" : "+"}
                    </span>
                  </button>

                  {activeHelperTab === "plan" && (
                    <div
                      ref={planSectionRef}
                      className="scroll-mt-6 border-t border-[#DED0CB] px-5 pb-7 pt-6"
                    >
                      {macroResult && (
                        <div className="mb-6 rounded-xl bg-[#EAD8D3]/45 p-5">
                          <p className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                            YOUR SUGGESTED STARTING POINT
                          </p>

                          <h3 className="mt-3 font-serif text-2xl">
                            {recommendedPlan.title}
                          </h3>

                          <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                            {recommendedPlan.subtitle}
                          </p>

                          <p className="mt-3 text-[11px] leading-5 text-[#806E68]">
                            Suggested based on your activity level and goal.
                            You can choose any plan that suits your routine.
                          </p>

                          <Link
                            href={recommendedPlan.href}
                            className="mt-4 inline-block text-[8px] tracking-[0.15em] underline decoration-[#A77B73] underline-offset-4"
                          >
                            VIEW RECOMMENDATION →
                          </Link>
                        </div>
                      )}

                      <p className="mb-3 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                        {macroResult ? "EXPLORE ALL PLANS" : "CHOOSE A STARTING PLAN"}
                      </p>

                      <div className="divide-y divide-[#DED0CB] border-y border-[#DED0CB]">
                        {plans.map((plan, index) => (
                          <Link
                            key={plan.title}
                            href={plan.href}
                            className="group flex items-center justify-between gap-4 py-4"
                          >
                            <div className="flex items-center gap-4">
                              <span className="font-serif text-lg italic text-[#C39A92]">
                                0{index + 1}
                              </span>

                              <div>
                                <p className="text-[9px] tracking-[0.14em]">
                                  {plan.title}
                                </p>
                                <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                                  {plan.subtitle}
                                </p>
                              </div>
                            </div>

                            <span className="text-lg text-[#A77B73] transition group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* WEEKLY PLANNER */}
            <section className="pt-12">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                    THE WEEKLY PLANNER
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">
                    Your{" "}
                    <span className="italic text-[#A77B73]">Week.</span>
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                    Plan what works. Change what doesn&apos;t.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeWeek(today)}
                    className="rounded-full border border-[#D6C3BD] px-4 py-2.5 text-[8px] tracking-[0.12em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                  >
                    TODAY
                  </button>

                  <label className="sr-only" htmlFor="week-start">
                    Choose planner start date
                  </label>

                  <input
                    id="week-start"
                    type="date"
                    value={weekStart}
                    onChange={(e) => changeWeek(e.target.value)}
                    className="rounded-xl border border-[#D6C3BD] bg-[#FBF8F6] px-3 py-2 text-[14px] outline-none focus:border-[#A77B73]"
                  />
                </div>
              </div>

              {plannerError && !pickerOpen && (
                <p className="mb-4 rounded-xl border border-[#D9B7B0] bg-[#F3E3DF] px-4 py-3 text-[11px] text-[#8F5F57]">
                  {plannerError}
                </p>
              )}

              <div className="overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="flex items-center justify-between gap-3 border-b border-[#DED0CB] bg-[#EAD8D3]/35 px-4 py-4 sm:px-5">
                  <button
                    type="button"
                    onClick={() => moveWeek(-7)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3BD] text-[#8F655E]"
                    aria-label="Previous seven days"
                  >
                    ←
                  </button>

                  <div className="text-center">
                    <p className="font-serif text-lg italic text-[#A77B73]">
                      {weekRange}
                    </p>
                    <p className="mt-1 text-[7px] tracking-[0.16em] text-[#92776F]">
                      {filledMeals} OF 28 MEALS PLANNED
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => moveWeek(7)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D6C3BD] text-[#8F655E]"
                    aria-label="Next seven days"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 border-b border-[#DED0CB]">
                  {plannerWeek.map((day, index) => {
                    const selected = index === activeDayIndex;
                    const isToday = day.date === today;
                    const count = mealSlots.filter(
                      (slot) => plannerMeals[mealKey(day.date, slot)]
                    ).length;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setActiveDayIndex(index)}
                        className={`relative min-w-0 border-r border-[#E9DEDA] px-1 py-4 text-center transition last:border-r-0 sm:px-2 ${
                          selected
                            ? "bg-[#EAD8D3]/55"
                            : "hover:bg-[#F4ECE8]"
                        }`}
                      >
                        <span
                          className={`block text-[7px] tracking-[0.1em] ${
                            selected ? "text-[#8F655E]" : "text-[#9D8A83]"
                          }`}
                        >
                          {day.weekday}
                        </span>

                        <span
                          className={`mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full font-serif text-lg ${
                            selected
                              ? "bg-[#211C19] text-[#FBF8F6]"
                              : "text-[#211C19]"
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        <span className="mt-2 flex h-2 justify-center gap-[3px]">
                          {count > 0 && (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                count === 4 ? "bg-[#A77B73]" : "bg-[#D4B5AE]"
                              }`}
                            />
                          )}
                          {isToday && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#211C19]" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeDay && (
                  <>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E9DEDA] px-4 py-4 sm:px-5">
                      <div>
                        <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                          {activeDay.fullWeekday.toUpperCase()}
                        </p>
                        <h3 className="mt-1 font-serif text-xl italic text-[#A77B73]">
                          {displayDate(parseDate(activeDay.date), {
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                      </div>

                      <span className="text-[8px] tracking-[0.1em] text-[#9D6F67]">
                        {mealSlots.filter(
                          (slot) => plannerMeals[mealKey(activeDay.date, slot)]
                        ).length}
                        /4 PLANNED
                      </span>
                    </div>

                    <div>
                      {mealSlots.map((slot) =>
                        renderMealRow(activeDay.date, slot)
                      )}
                    </div>
                  </>
                )}
              </div>

              <p className="mt-4 text-[10px] leading-5 text-[#927D76]">
                Tap a day to view or edit its meals. Use the arrows to
                explore other weeks.
              </p>
            </section>

            {/* SMALL NUTRITION NOTE */}
            <section className="mt-12 border-t border-[#DED0CB] pt-6">
              <p className="max-w-3xl text-[9px] leading-5 text-[#927D76]">
                Nutrition note: Meal plans and macro estimates are general
                planning tools, not individualized medical or nutrition
                prescriptions. Needs vary by person, activity and health
                goals.
              </p>
            </section>
          </div>
        </section>
      </div>

      {/* MEAL PICKER */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211C19]/45 backdrop-blur-[2px] sm:items-center sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeMealPicker();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose a meal"
            className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-[#DED0CB] bg-[#F7F1ED] shadow-2xl sm:max-w-xl sm:rounded-[1.75rem]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#DED0CB] px-5 py-5">
              <div>
                <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                  {pickerSlot} /{" "}
                  {pickerDate
                    ? displayDate(parseDate(pickerDate), {
                        month: "short",
                        day: "numeric",
                      }).toUpperCase()
                    : ""}
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Choose a{" "}
                  <span className="italic text-[#A77B73]">meal. ♡</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMealPicker}
                disabled={isSavingMeal || isSavingCustomMeal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6C3BD] text-lg text-[#A77B73] disabled:opacity-40"
                aria-label="Close meal picker"
              >
                ×
              </button>
            </div>

            <div className="flex shrink-0 border-b border-[#DED0CB]">
              <button
                type="button"
                onClick={() => setPickerTab("recipes")}
                className={`flex-1 border-b-2 px-4 py-4 text-[8px] tracking-[0.15em] ${
                  pickerTab === "recipes"
                    ? "border-[#A77B73] text-[#211C19]"
                    : "border-transparent text-[#9D6F67]"
                }`}
              >
                RECIPE LIBRARY
              </button>

              <button
                type="button"
                onClick={() => setPickerTab("custom")}
                className={`flex-1 border-b-2 px-4 py-4 text-[8px] tracking-[0.15em] ${
                  pickerTab === "custom"
                    ? "border-[#A77B73] text-[#211C19]"
                    : "border-transparent text-[#9D6F67]"
                }`}
              >
                MY OWN MEALS
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {plannerError && (
                <p className="mb-4 rounded-xl bg-[#F3E3DF] px-4 py-3 text-[11px] text-[#8F5F57]">
                  {plannerError}
                </p>
              )}

              {pickerTab === "recipes" ? (
                <>
                  <input
                    type="search"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search recipes..."
                    className={inputClass}
                  />

                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {mealSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPickerCategory(slot)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-[8px] tracking-[0.1em] transition ${
                          pickerCategory === slot
                            ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                            : "border-[#D6C3BD] bg-[#FBF8F6] text-[#8F655E]"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <p className="mb-3 mt-5 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                    {filteredRecipes.length} RECIPES
                  </p>

                  <div className="divide-y divide-[#E9DEDA] border-y border-[#DED0CB]">
                    {filteredRecipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        disabled={isSavingMeal || isSavingCustomMeal}
                        onClick={() => saveMeal(recipe.id, null)}
                        className="group flex w-full items-center justify-between gap-4 py-4 text-left disabled:opacity-40"
                      >
                        <div className="min-w-0">
                          <p className="font-serif text-base">
                            {recipe.title}
                          </p>
                          <p className="mt-1 text-[7px] tracking-[0.14em] text-[#9D6F67]">
                            {recipe.category}
                          </p>
                        </div>

                        <span className="text-xl text-[#A77B73]">+</span>
                      </button>
                    ))}

                    {filteredRecipes.length === 0 && (
                      <p className="py-8 text-center font-serif italic text-[#A77B73]">
                        no recipes found. ♡
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    add something of your own. ♡
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                    Add a meal that isn&apos;t in the recipe library,
                    or reuse one you&apos;ve saved before.
                  </p>

                  <div className="mt-5">
                    <label
                      htmlFor="custom-meal-name"
                      className={labelClass}
                    >
                      MEAL NAME
                    </label>

                    <input
                      id="custom-meal-name"
                      type="text"
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          createAndUseCustomMeal();
                        }
                      }}
                      placeholder="e.g. chicken + rice bowl"
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={createAndUseCustomMeal}
                      disabled={
                        !customMealName.trim() ||
                        isSavingCustomMeal ||
                        isSavingMeal
                      }
                      className="mt-3 w-full rounded-full bg-[#211C19] px-5 py-3.5 text-[8px] tracking-[0.15em] text-[#F7F1ED] disabled:opacity-40"
                    >
                      {isSavingCustomMeal ? "ADDING..." : "ADD TO DAY →"}
                    </button>
                  </div>

                  {customMeals.length > 0 && (
                    <div className="mt-8">
                      <p className="mb-3 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                        YOUR SAVED MEALS
                      </p>

                      <div className="divide-y divide-[#E9DEDA] border-y border-[#DED0CB]">
                        {customMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center gap-3 py-3"
                          >
                            <button
                              type="button"
                              onClick={() => saveMeal(null, meal.name)}
                              disabled={
                                isSavingMeal ||
                                isSavingCustomMeal ||
                                deletingCustomMealId === meal.id
                              }
                              className="min-w-0 flex-1 text-left font-serif text-base disabled:opacity-40"
                            >
                              {meal.name}
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteCustomMeal(meal)}
                              disabled={
                                isSavingMeal ||
                                isSavingCustomMeal ||
                                deletingCustomMealId === meal.id
                              }
                              className="px-2 text-lg text-[#A77B73] disabled:opacity-40"
                              aria-label={`Remove ${meal.name} from saved meals`}
                            >
                              {deletingCustomMealId === meal.id ? "…" : "×"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <p className="mt-3 text-[9px] leading-5 text-[#927D76]">
                        Removing a saved meal from this list won&apos;t
                        remove it from days you&apos;ve already planned.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 border-t border-[#DED0CB] bg-[#F7F1ED] px-5 py-4">
              <button
                type="button"
                onClick={closeMealPicker}
                disabled={isSavingMeal || isSavingCustomMeal}
                className="w-full rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.15em] text-[#8F655E] disabled:opacity-40"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
