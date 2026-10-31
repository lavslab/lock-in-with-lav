
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";
import { recipes as recipeLibrary } from "@/lib/recipes";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
type Sex = "female" | "male";
type Unit = "imperial" | "metric";
type Goal = "lose" | "maintain" | "gain";
type HelperTab = "targets" | "plan" | null;

type Recipe = {
  id: string;
  title: string;
  category: MealSlot;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
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
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  created_at?: string;
};

const mealSlots: MealSlot[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const recipes: Recipe[] = recipeLibrary.map((recipe) => ({
  id: recipe.id,
  title: recipe.title,
    calories: recipe.calories,
  protein: recipe.protein,
  carbs: recipe.carbs,
  fat: recipe.fat,
  category:
    recipe.meal === "Breakfast"
      ? "BREAKFAST"
      : recipe.meal === "Lunch"
        ? "LUNCH"
        : recipe.meal === "Dinner"
          ? "DINNER"
          : "SNACK",
}));

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
{
  title: "MY OWN PLAN",
  subtitle: "your meals. your routine. ♡",
  href: "/dashboard/resources/meal-plans",
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
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [nourishTab, setNourishTab] = useState<"diary" | "plan">("diary");



  // Always start on the current date instead of restoring
  // an older date from localStorage.
  const [weekStart, setWeekStart] = useState(() => dateKey(new Date()));
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [plannerMeals, setPlannerMeals] = useState<Record<string, PlannerMeal>>({});
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);

  const [diaryEntries, setDiaryEntries] = useState<
  {
    id: string;
    logged_date: string;
    meal_slot: MealSlot;
    food_name: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  }[]
>([]);

const [loggedPlannedMeals, setLoggedPlannedMeals] = useState<
  { logged_date: string; meal_slot: MealSlot; food_name: string }[]
>([]);

const [isLoadingDiary, setIsLoadingDiary] = useState(true);


const [diarySelectedDate, setDiarySelectedDate] = useState(() =>
  new Date().toLocaleDateString("en-CA")
);
const [diaryFormSlot, setDiaryFormSlot] = useState<MealSlot | null>(null);

const [diaryFoodName, setDiaryFoodName] = useState("");
const [diaryCalories, setDiaryCalories] = useState("");
const [diaryProtein, setDiaryProtein] = useState("");
const [diaryCarbs, setDiaryCarbs] = useState("");
const [diaryFat, setDiaryFat] = useState("");

const [isSavingDiary, setIsSavingDiary] = useState(false);
const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);

const diaryTotals = diaryEntries.reduce(
  (totals, entry) => ({
    calories: totals.calories + Number(entry.calories ?? 0),
    protein: totals.protein + Number(entry.protein ?? 0),
    carbs: totals.carbs + Number(entry.carbs ?? 0),
    fat: totals.fat + Number(entry.fat ?? 0),
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 }
);

  const [isLoadingPlanner, setIsLoadingPlanner] = useState(true);
  const [plannerError, setPlannerError] = useState("");

  const [activeHelperTab, setActiveHelperTab] = useState<HelperTab>(null);
  const [targetsCompleted, setTargetsCompleted] = useState(false);
const [planCompleted, setPlanCompleted] = useState(false);

const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
const [isSavingPlan, setIsSavingPlan] = useState(false);
const [planSaveError, setPlanSaveError] = useState("");

const [isSavingTargets, setIsSavingTargets] = useState(false);
const [targetsSaveError, setTargetsSaveError] = useState("");

const [savedTargets, setSavedTargets] = useState<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} | null>(null);

const [isLoadingNourishProgress, setIsLoadingNourishProgress] = useState(true);
const [savingNourishSection, setSavingNourishSection] = useState<
  "targets" | "plan" | null
>(null);
const [nourishProgressError, setNourishProgressError] = useState("");
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

  const [customPlanSlot, setCustomPlanSlot] =
  useState<MealSlot>("BREAKFAST");

  const [isCustomPlanOpen, setIsCustomPlanOpen] = useState(false);
const [customPlanDate, setCustomPlanDate] = useState("");

  const [customMealCalories, setCustomMealCalories] = useState("");
const [customMealProtein, setCustomMealProtein] = useState("");
const [customMealCarbs, setCustomMealCarbs] = useState("");
const [customMealFat, setCustomMealFat] = useState("");

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
  if (!userId) return;

  let active = true;

  async function loadSavedTargets() {
    const { data, error } = await supabase
      .from("nourish_nutrition_targets")
      .select("calories, protein, carbs, fat")
      .eq("user_id", userId)
      .maybeSingle();

    if (!active) return;

    if (error) {
      console.error("Could not load nutrition targets:", error);
      return;
    }

    setSavedTargets(data ?? null);
  }

  loadSavedTargets();

  return () => {
    active = false;
  };
}, [userId]);

  
useEffect(() => {
  if (!userId) return;

  let active = true;

  async function loadNourishProgress() {
    setIsLoadingNourishProgress(true);
    setNourishProgressError("");

    const { data, error } = await supabase
      .from("nourish_method_progress")
      .select("targets_completed, plan_completed, selected_plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (!active) return;

    if (error) {
      console.error("Could not load Nourish progress:", error);
      setNourishProgressError("We couldn't load your Nourish progress.");
    } else {
      setTargetsCompleted(data?.targets_completed ?? false);
      setPlanCompleted(data?.plan_completed ?? false);
      setSelectedPlan(data?.selected_plan ?? null);
    }

    setIsLoadingNourishProgress(false);
  }

  loadNourishProgress();

  return () => {
    active = false;
  };
}, [userId]);

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



  useEffect(() => {
  if (!userId) {
    setIsLoadingDiary(false);
    return;
  }

  let active = true;

  async function loadFoodDiary() {
    setIsLoadingDiary(true);

    const { data, error } = await supabase
      .from("nourish_food_diary")
      .select(
        "id, logged_date, meal_slot, food_name, calories, protein, carbs, fat"
      )
      .eq("user_id", userId)
      .eq("logged_date", diarySelectedDate)
      .order("created_at", { ascending: true });

    if (!active) return;

    if (error) {
      console.error("Could not load food diary:", error);
      
    } else {
      setDiaryEntries(data ?? []);
    }

    setIsLoadingDiary(false);
  }

  loadFoodDiary();

  return () => {
    active = false;
  };
}, [userId, diarySelectedDate]);


useEffect(() => {
  if (!userId || plannerWeek.length !== 7) {
    setLoggedPlannedMeals([]);
    return;
  }

  let active = true;

  async function loadLoggedPlannedMeals() {
    const { data, error } = await supabase
      .from("nourish_food_diary")
      .select("logged_date, meal_slot, food_name")
      .eq("user_id", userId)
      .gte("logged_date", plannerWeek[0].date)
      .lte("logged_date", plannerWeek[6].date);

    if (!active) return;

    if (error) {
      console.error("Could not load logged planned meals:", error);
      return;
    }

    setLoggedPlannedMeals(data ?? []);
  }

  void loadLoggedPlannedMeals();

  return () => {
    active = false;
  };
}, [userId, plannerWeek, diaryEntries]);

function editDiaryFood(entry: (typeof diaryEntries)[number]) {
  setEditingDiaryId(entry.id);
  setDiaryFormSlot(entry.meal_slot);

  setDiaryFoodName(entry.food_name);
  setDiaryCalories(entry.calories?.toString() ?? "");
  setDiaryProtein(entry.protein?.toString() ?? "");
  setDiaryCarbs(entry.carbs?.toString() ?? "");
  setDiaryFat(entry.fat?.toString() ?? "");
}

async function deleteDiaryFood(entryId: string) {
  if (!userId) return;

  const confirmed = window.confirm(
    "Remove this food from your diary?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("nourish_food_diary")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    console.error("Could not delete food:", error);
    alert("Could not remove this food. Please try again.");
    return;
  }

  setDiaryEntries((previous) =>
    previous.filter((entry) => entry.id !== entryId)
  );
}
async function saveDiaryFood() {
  if (!userId || !diaryFormSlot || !diaryFoodName.trim() || isSavingDiary) {
    return;
  }

  setIsSavingDiary(true);

  const nutritionValue = (value: string) =>
    value.trim() === "" ? null : Number(value);

  const foodValues = {
  meal_slot: diaryFormSlot,
  food_name: diaryFoodName.trim(),
  calories: nutritionValue(diaryCalories),
  protein: nutritionValue(diaryProtein),
  carbs: nutritionValue(diaryCarbs),
  fat: nutritionValue(diaryFat),
};

const query = editingDiaryId
  ? supabase
      .from("nourish_food_diary")
      .update(foodValues)
      .eq("id", editingDiaryId)
      .eq("user_id", userId)
  : supabase
      .from("nourish_food_diary")
      .insert({
        ...foodValues,
        user_id: userId,
        logged_date: diarySelectedDate,
      });

const { data, error } = await query
  .select(
    "id, logged_date, meal_slot, food_name, calories, protein, carbs, fat"
  )
  .single();

  if (error) {
    console.error("Could not save food diary entry:", error);
    alert(`Could not save food: ${error.message}`);
  } else {
    setDiaryEntries((previous) =>
  editingDiaryId
    ? previous.map((entry) =>
        entry.id === editingDiaryId ? data : entry
      )
    : [...previous, data]
);

setEditingDiaryId(null);
    setDiaryFormSlot(null);
  }

  setIsSavingDiary(false);
}

  function changeWeek(value: string) {
    if (!value) return;

    setWeekStart(value);
    setActiveDayIndex(0);
  }

  function moveWeek(days: number) {
    changeWeek(dateKey(shiftDate(parseDate(weekStart), days)));
  }

async function saveSelectedPlan(planHref: string) {
  if (!userId || isSavingPlan) return false;

  const planId =
  planHref === "/dashboard/resources/meal-plans"
    ? "my-own-plan"
    : planHref.split("/").pop();

  if (!planId) return false;

  setIsSavingPlan(true);
  setPlanSaveError("");

  const { error } = await supabase
    .from("nourish_method_progress")
    .upsert(
      {
        user_id: userId,
        selected_plan: planId,
        plan_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  setIsSavingPlan(false);

  if (error) {
    console.error("Could not save selected plan:", error);
    setPlanSaveError("Couldn't save your plan. Please try again.");
    return false;
  }

  setSelectedPlan(planId);
  setPlanCompleted(true);
  return true;
}

async function saveNutritionTargets() {
  if (!userId || !macroResult || isSavingTargets) return;

  setIsSavingTargets(true);
  setTargetsSaveError("");

  const targets = {
    user_id: userId,
    calories: macroResult.calories,
    protein: macroResult.protein,
    carbs: macroResult.carbs,
    fat: macroResult.fat,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("nourish_nutrition_targets")
    .upsert(targets, { onConflict: "user_id" });

  if (error) {
    console.error("Could not save nutrition targets:", error);
    setTargetsSaveError(
      "We couldn't save your targets. Please try again."
    );
    setIsSavingTargets(false);
    return;
  }

  // Update the displayed numbers immediately.
  setSavedTargets({
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
  });

  setIsEditingTargets(false);

  // Automatically mark Find Your Targets complete.
  const { error: progressError } = await supabase
    .from("nourish_method_progress")
    .upsert(
      {
        user_id: userId,
        targets_completed: true,
        plan_completed: planCompleted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (progressError) {
    console.error(
      "Could not update targets completion:",
      progressError
    );
    setTargetsSaveError(
      "Your targets were saved, but the completion checkmark couldn't update."
    );
  } else {
    setTargetsCompleted(true);
  }

  setIsSavingTargets(false);
}


async function resetNutritionTargets() {
  if (!userId || isSavingTargets) return;

  const confirmed = window.confirm(
    "Reset your nutrition targets? You can calculate them again anytime."
  );

  if (!confirmed) return;

  setIsSavingTargets(true);
  setTargetsSaveError("");

  const { error } = await supabase
    .from("nourish_nutrition_targets")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Could not reset nutrition targets:", error);
    setTargetsSaveError(
      "We couldn't reset your targets. Please try again."
    );
    setIsSavingTargets(false);
    return;
  }

  setSavedTargets(null);

  setAge("");
  setWeight("");
  setFeet("");
  setInches("");
  setHeightCm("");
  setActivity("1.55");
  setGoal("maintain");
  setUnit("imperial");
  setSex("female");

  const { error: progressError } = await supabase
    .from("nourish_method_progress")
    .upsert(
      {
        user_id: userId,
        targets_completed: false,
        plan_completed: planCompleted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (progressError) {
    console.error("Could not reset targets completion:", progressError);
    setTargetsSaveError(
      "Targets cleared, but we couldn't update the completion checkmark."
    );
  } else {
    setTargetsCompleted(false);
  }

  setIsSavingTargets(false);
}

function toggleHelperTab(tab: Exclude<HelperTab, null>) {
  setActiveHelperTab((current) => (current === tab ? null : tab));
}

async function toggleNourishCompletion(section: "targets" | "plan") {
  if (!userId || isLoadingNourishProgress || savingNourishSection) return;

  const nextTargets =
    section === "targets" ? !targetsCompleted : targetsCompleted;

  const nextPlan =
    section === "plan" ? !planCompleted : planCompleted;

  setSavingNourishSection(section);
  setNourishProgressError("");

  const { error } = await supabase
    .from("nourish_method_progress")
    .upsert(
      {
        user_id: userId,
        targets_completed: nextTargets,
        plan_completed: nextPlan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Could not save Nourish progress:", error);
    setNourishProgressError(
      "We couldn't save your progress. Please try again."
    );
  } else {
    setTargetsCompleted(nextTargets);
    setPlanCompleted(nextPlan);
  }

  setSavingNourishSection(null);
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
  .insert({
    user_id: userId,
    name,
    calories: customMealCalories.trim() === "" ? null : Number(customMealCalories),
    protein: customMealProtein.trim() === "" ? null : Number(customMealProtein),
    carbs: customMealCarbs.trim() === "" ? null : Number(customMealCarbs),
    fat: customMealFat.trim() === "" ? null : Number(customMealFat),
  })
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

      const isMealLogged = loggedPlannedMeals.some(
  (entry) =>
    entry.logged_date === date &&
    entry.meal_slot === slot &&
    entry.food_name.trim().toLowerCase() ===
      mealName.trim().toLowerCase()
);

    

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
<button
  type="button"
  onClick={() => {
    setEditingDiaryId(null);
    setDiarySelectedDate(date);
    setDiaryFormSlot(slot);
    setDiaryFoodName(mealName);
   const matchingCustomMeal = customMeals.find(
  (item) => item.name === meal?.custom_meal_name
);

setDiaryCalories(
  (recipe?.calories ?? matchingCustomMeal?.calories)?.toString() ?? ""
);
setDiaryProtein(
  (recipe?.protein ?? matchingCustomMeal?.protein)?.toString() ?? ""
);
setDiaryCarbs(
  (recipe?.carbs ?? matchingCustomMeal?.carbs)?.toString() ?? ""
);
setDiaryFat(
  (recipe?.fat ?? matchingCustomMeal?.fat)?.toString() ?? ""
);
    setNourishTab("diary");

  }}
  className="text-[8px] tracking-[0.1em] text-[#A77B73] hover:text-[#211C19]"
  aria-label={`Log ${mealName} to food diary`}
>
{isMealLogged ? "LOGGED ♡" : "LOG"}
</button>
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



{/* NOURISH TABS */}
<div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#EAD8D3]/35 p-1.5">
  <button
    type="button"
    onClick={() => setNourishTab("diary")}
    className={`rounded-xl px-4 py-3 text-[9px] tracking-[0.12em] transition ${
      nourishTab === "diary"
        ? "bg-[#211C19] text-[#F7F1ED]"
        : "text-[#8F655E]"
    }`}
  >
    FOOD DIARY
  </button>

  <button
    type="button"
    onClick={() => setNourishTab("plan")}
    className={`rounded-xl px-4 py-3 text-[9px] tracking-[0.12em] transition ${
      nourishTab === "plan"
        ? "bg-[#211C19] text-[#F7F1ED]"
        : "text-[#8F655E]"
    }`}
  >
    MEAL PLAN
  </button>
</div>

{/* FOOD DIARY TAB */}
{nourishTab === "diary" && (
  <section className="pt-8">
    <p className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
      YOUR DAILY NOURISHMENT
    </p>

    <h2 className="mt-2 font-serif text-3xl text-[#211C19]">
      Your <span className="italic text-[#A77B73]">Diary. ♡</span>
    </h2>

    <p className="mt-2 text-[11px] text-[#806E68]">
      A little space to keep track of what you eat.
    </p>

{/* FOOD DIARY DATE NAVIGATION */}
<div className="mt-6 flex items-center justify-between rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] px-4 py-3">
  <button
    type="button"
    onClick={() => {
      const date = new Date(`${diarySelectedDate}T12:00:00`);
      date.setDate(date.getDate() - 1);
      setDiarySelectedDate(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }}
    className="px-2 text-xl text-[#A77B73]"
    aria-label="Previous day"
  >
    ‹
  </button>

  <div className="text-center">
    <p className="text-[8px] tracking-[0.16em] text-[#A77B73]">
      FOOD DIARY
    </p>
    <p className="mt-1 font-serif text-base text-[#211C19]">
      {new Date(`${diarySelectedDate}T12:00:00`).toLocaleDateString(
        "en-CA",
        { month: "long", day: "numeric", year: "numeric" }
      )}
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      const date = new Date(`${diarySelectedDate}T12:00:00`);
      date.setDate(date.getDate() + 1);
      setDiarySelectedDate(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );
    }}
    disabled={diarySelectedDate >= today}
    className="px-2 text-xl text-[#A77B73] disabled:opacity-30"
    aria-label="Next day"
  >
    ›
  </button>
</div>


    {/* DAILY NUTRITION SUMMARY */}
<div className="mt-6 rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-5">
  <div className="flex items-center justify-between">
    <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
      TODAY'S NUTRITION
    </p>
  
  </div>

  <div className="mt-5 flex items-baseline gap-2">
    <span className="font-serif text-4xl text-[#211C19]">
  {Math.round(diaryTotals.calories).toLocaleString()}
</span>
    <span className="text-[10px] text-[#92776F]">
      {savedTargets
        ? `/ ${savedTargets.calories.toLocaleString()} cal`
        : "calories logged"}
    </span>
  </div>

  {/* CALORIE PROGRESS */}
{savedTargets && savedTargets.calories > 0 && (
  <div className="mt-4">
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E9DEDA]">
      <div
        className="h-full rounded-full bg-[#A77B73] transition-all duration-300"
        style={{
          width: `${Math.min(
            (diaryTotals.calories / savedTargets.calories) * 100,
            100
          )}%`,
        }}
      />
    </div>

    <p className="mt-2 text-right text-[9px] text-[#92776F]">
      {Math.round(
        (diaryTotals.calories / savedTargets.calories) * 100
      )}% of daily target
    </p>
  </div>
)}

  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#E9DEDA] pt-4">
   {[
  {
    label: "PROTEIN",
    value: diaryTotals.protein,
    target: savedTargets?.protein,
  },
  {
    label: "CARBS",
    value: diaryTotals.carbs,
    target: savedTargets?.carbs,
  },
  {
    label: "FAT",
    value: diaryTotals.fat,
    target: savedTargets?.fat,
  },
].map((macro) => (


      <div key={macro.label}>
        <p className="font-serif text-xl text-[#211C19]">
          {Math.round(macro.value)}<span className="text-xs text-[#A77B73]">g</span>
        </p>
        <p className="mt-1 text-[8px] tracking-[0.1em] text-[#92776F]">
          {macro.label}
        </p>
        {macro.target != null && (
          <p className="mt-1 text-[9px] text-[#A77B73]">
            of {macro.target}g
          </p>
        )}
      </div>
    ))}
  </div>
</div>

    <div className="mt-6 space-y-3">
      {mealSlots.map((slot) => (
        <div
          key={slot}
          className="rounded-[1.25rem] border border-[#DED0CB] bg-[#FBF8F6] p-5"
        >
          <p className="text-[10px] tracking-[0.12em] text-[#211C19]">
            {slot === "SNACK" ? "SNACKS" : slot}
          </p>

          {isLoadingDiary ? (
  <p className="mt-3 text-xs text-[#B69A92]">
    Loading your foods...
  </p>
) : diaryEntries.filter((entry) => entry.meal_slot === slot).length === 0 ? (
  <p className="mt-3 font-serif text-sm italic text-[#B69A92]">
    Nothing logged yet. ♡
  </p>
) : (
  <div className="mt-4 space-y-3">
    {diaryEntries
      .filter((entry) => entry.meal_slot === slot)
      .map((entry) => (
        <div
          key={entry.id}
          className="flex items-start justify-between gap-3 border-t border-[#E9DEDA] pt-3"
        >
          <div>
            <p className="text-sm text-[#211C19]">
              {entry.food_name}
            </p>
            <p className="mt-1 text-[10px] text-[#92776F]">
              {entry.protein ?? 0}g protein ·{" "}
              {entry.carbs ?? 0}g carbs ·{" "}
              {entry.fat ?? 0}g fat
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
  <p className="text-xs text-[#A77B73]">
    {entry.calories ?? 0} cal
  </p>

<button
  type="button"
  onClick={() => editDiaryFood(entry)}
  className="text-[9px] text-[#A77B73] underline underline-offset-2 transition hover:text-[#211C19]"
  aria-label={`Edit ${entry.food_name}`}
>
  Edit
</button>

  <button
    type="button"
    onClick={() => deleteDiaryFood(entry.id)}
    className="text-[9px] text-[#A77B73] underline underline-offset-2 transition hover:text-[#211C19]"
    aria-label={`Remove ${entry.food_name}`}
  >
    Remove
  </button>
</div>
        </div>
      ))}
  </div>
)}

          <button
  type="button"
  onClick={() => {
    setEditingDiaryId(null);
    setDiaryFormSlot(slot);
    setDiaryFoodName("");
    setDiaryCalories("");
    setDiaryProtein("");
    setDiaryCarbs("");
    setDiaryFat("");
  }}
  className="mt-4 text-[9px] tracking-[0.12em] text-[#A77B73] transition hover:text-[#211C19]"
>
  + ADD FOOD
</button>
        </div>
      ))}
    </div>
  </section>
)}


{/* FOOD DIARY FORM */}
{diaryFormSlot && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/50 px-4">
    <div className="w-full max-w-md rounded-[1.5rem] bg-[#F7F1ED] p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] tracking-[0.18em] text-[#A77B73]">
            YOUR FOOD DIARY
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#211C19]">
            {editingDiaryId
  ? `Edit ${diaryFormSlot === "SNACK" ? "Snacks" : diaryFormSlot.toLowerCase()} ♡`
  : `Add to ${diaryFormSlot === "SNACK" ? "Snacks" : diaryFormSlot.toLowerCase()} ♡`}
          </h2>
        </div>

        <button
          type="button"
onClick={() => {
  setDiaryFormSlot(null);
  setEditingDiaryId(null);
}}          className="text-xl text-[#92776F]"
          aria-label="Close food diary form"
        >
          ×
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-[10px] text-[#806E68]">FOOD NAME</label>
          <input
            type="text"
            value={diaryFoodName}
            onChange={(e) => setDiaryFoodName(e.target.value)}
            placeholder="e.g. Greek yogurt with berries"
            className="mt-2 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "CALORIES", value: diaryCalories, setter: setDiaryCalories },
            { label: "PROTEIN (G)", value: diaryProtein, setter: setDiaryProtein },
            { label: "CARBS (G)", value: diaryCarbs, setter: setDiaryCarbs },
            { label: "FAT (G)", value: diaryFat, setter: setDiaryFat },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[10px] text-[#806E68]">
                {field.label}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-sm outline-none"
              />
            </div>
          ))}
        </div>

        <button
  type="button"
  onClick={saveDiaryFood}
  disabled={isSavingDiary || !diaryFoodName.trim()}
  className="w-full rounded-xl bg-[#211C19] px-5 py-3 text-[10px] tracking-[0.15em] text-[#F7F1ED] transition hover:bg-[#4A3934] disabled:cursor-not-allowed disabled:opacity-50"
>
{isSavingDiary
  ? "SAVING..."
  : editingDiaryId
    ? "SAVE CHANGES ♡"
    : "SAVE FOOD ♡"}</button>
      </div>
    </div>
  </div>
)}

            {/* MEAL PLAN TAB */}
<div className={nourishTab === "plan" ? "block" : "hidden"}>
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
  {savedTargets ? "YOUR TARGETS" : "FIND YOUR TARGETS"}
</p>


{savedTargets ? (
  <div className="mt-2">
    <p className="font-serif text-xl leading-tight text-[#211C19]">
      {savedTargets.calories.toLocaleString()}
      <span className="ml-1 font-sans text-[9px] text-[#92776F]">
        calories / day
      </span>
    </p>

    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#8F655E]">
      <span>P {savedTargets.protein}g</span>
      <span>C {savedTargets.carbs}g</span>
      <span>F {savedTargets.fat}g</span>
    </div>
  </div>
) : (
  <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
    calories + macros, made simple.
  </p>
)}

                      </div>
                    </div>

                    
<div className="flex items-center gap-3">
  {targetsCompleted && (
    <span className="text-lg text-[#A77B73]" aria-label="Completed">
      ✓
    </span>
  )}

  <span className="text-xl text-[#A77B73]">
    {activeHelperTab === "targets" ? "−" : "+"}
  </span>
</div>

                  </button>

                  {activeHelperTab === "targets" && (
                    <div className="border-t border-[#DED0CB] px-5 pb-7 pt-6">
                      <p className="mb-6 max-w-lg text-[11px] leading-5 text-[#806E68]">
                        A starting estimate based on your details,
                        activity and goals.
                      </p>


                      {savedTargets && !isEditingTargets && (
  <div className="rounded-[1.2rem] bg-[#EAD8D3]/40 p-4">
    <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
      YOUR SAVED TARGETS
    </p>

    <div className="mt-3 flex items-baseline gap-2">
      <p className="font-serif text-3xl text-[#211C19]">
        {savedTargets.calories.toLocaleString()}
      </p>
      <span className="text-[9px] text-[#92776F]">
        calories / day
      </span>
    </div>

    <p className="mt-2 text-[10px] text-[#806E68]">
      {savedTargets.protein}g protein · {savedTargets.carbs}g carbs ·{" "}
      {savedTargets.fat}g fat
    </p>

    <button
      type="button"
      onClick={() => setIsEditingTargets(true)}
      className="mt-4 w-full rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[9px] tracking-[0.12em] text-[#8F655E]"
    >
      EDIT TARGETS
    </button>
  </div>
)}


{savedTargets && isEditingTargets && (
  <button
    type="button"
    onClick={() => setIsEditingTargets(false)}
    className="mb-4 text-[9px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4"
  >
    ← CANCEL EDITING
  </button>
)}
                      {(!savedTargets || isEditingTargets) && (
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

                       

<div className="rounded-[1.2rem] bg-[#EAD8D3]/40 p-4">
  <p className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
    {savedTargets ? "YOUR TARGETS" : "YOUR STARTING TARGETS"}
  </p>

  {macroResult || savedTargets ? (
    (() => {
      const targets = macroResult ?? savedTargets!;

      const isCurrentSaved =
        !!macroResult &&
        !!savedTargets &&
        savedTargets.calories === macroResult.calories &&
        savedTargets.protein === macroResult.protein &&
        savedTargets.carbs === macroResult.carbs &&
        savedTargets.fat === macroResult.fat;

      return (
        <>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-serif text-3xl leading-none text-[#211C19]">
              {targets.calories.toLocaleString()}
            </p>
            <p className="text-[9px] text-[#92776F]">
              calories / day
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D8C4BE] pt-3">
            {[
              { label: "PROTEIN", value: targets.protein },
              { label: "CARBS", value: targets.carbs },
              { label: "FAT", value: targets.fat },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-serif text-xl text-[#211C19]">
                  {item.value}
                  <span className="ml-0.5 text-xs text-[#A77B73]">
                    g
                  </span>
                </p>
                <p className="mt-1 text-[7px] tracking-[0.1em] text-[#92776F]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {macroResult && (
            <p className="mt-3 text-[9px] text-[#806E68]">
              Maintenance estimate:{" "}
              {macroResult.maintenance.toLocaleString()} cal
            </p>
          )}

          {macroResult && (
            <button
              type="button"
              onClick={saveNutritionTargets}
              disabled={!userId || isSavingTargets || isCurrentSaved}
              className="mt-4 w-full rounded-full bg-[#A77B73] px-4 py-3 text-[9px] tracking-[0.12em] text-white transition hover:bg-[#956C64] disabled:opacity-60"
            >
              {isSavingTargets
                ? "SAVING..."
                : isCurrentSaved
                  ? "✓ TARGETS SAVED"
                  : "SAVE MY TARGETS ♡"}
            </button>
          )}

          {savedTargets && !macroResult && (
            <p className="mt-3 font-serif text-xs italic text-[#A77B73]">
              your targets are saved. ♡
            </p>
          )}
        </>
      );
    })()
  ) : (
    <div className="py-5">
      <p className="font-serif text-lg italic text-[#A77B73]">
        your numbers will appear here. ♡
      </p>
      <p className="mt-2 text-[10px] leading-5 text-[#806E68]">
        Add your details to get started.
      </p>
    </div>
  )}

  {targetsSaveError && (
    <p className="mt-3 text-center text-[10px] text-[#A44B42]">
      {targetsSaveError}
    </p>
  )}
</div>
</div>
)}

<p className="mt-4 text-[9px] leading-5 text-[#927D76]">
  General estimates only, not individualized nutrition advice.
  Adjust for your needs and how you feel.
</p>

{savedTargets && (
  <button
    type="button"
    onClick={resetNutritionTargets}
    disabled={isSavingTargets}
    className="mt-3 w-full py-2 text-center text-[9px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4 transition hover:text-[#211C19] disabled:opacity-50"
  >
    {isSavingTargets ? "RESETTING..." : "RESET TARGETS"}
  </button>
)}



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
  {selectedPlan ? "YOUR PLAN" : "FIND YOUR PLAN"}
</p>

<p className="mt-1 font-serif text-sm italic text-[#A77B73]">
  {selectedPlan
  ? selectedPlan === "my-own-plan"
    ? "MY OWN PLAN"
    : plans.find((plan) => plan.href.endsWith(selectedPlan))?.title
  : "a little structure for your week."}
</p>
                      </div>
                    </div>

                    
<div className="flex items-center gap-3">
  {planCompleted && (
    <span className="text-lg text-[#A77B73]" aria-label="Completed">
      ✓
    </span>
  )}

  <span className="text-xl text-[#A77B73]">
    {activeHelperTab === "plan" ? "−" : "+"}
  </span>
</div>

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
  <div key={plan.title}>
    <button
    type="button"
    disabled={isSavingPlan}
    onClick={async () => {
  const saved = await saveSelectedPlan(plan.href);
if (saved) {
  if (plan.href === "/dashboard/resources/meal-plans") {
  setActiveHelperTab("plan");
  setCustomPlanDate((current) => current || today);
  setIsCustomPlanOpen((current) => !current);
} else {
  window.location.assign(plan.href);
}
}
}}

className="group flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-[#F4ECE8]/40 disabled:opacity-50"
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

                            {selectedPlan ===
  (plan.href === "/dashboard/resources/meal-plans"
    ? "my-own-plan"
    : plan.href.split("/").pop()) ? (
  <span className="shrink-0 text-[9px] tracking-[0.12em] text-[#9D6F67]">
    ✓ SELECTED
  </span>
) : (
  <span className="text-lg text-[#A77B73] transition group-hover:translate-x-1">
    →
  </span>
)}
                            </button>

{plan.title === "MY OWN PLAN" && isCustomPlanOpen && (
  <div className="border-t border-[#DED0CB] bg-[#FBF8F6] px-4 pb-6 pt-5">
    <h3 className="font-serif text-xl italic text-[#211C19]">
      Build Your Own Week. ♡
    </h3>

    <p className="mt-2 text-[11px] text-[#806E68]">
      Your meals. Your routine. Choose where to start.
    </p>

    <div className="mt-5">
      <label htmlFor="custom-plan-date" className={labelClass}>
        CHOOSE YOUR DAY
      </label>

      <input
        id="custom-plan-date"
        type="date"
        value={customPlanDate}
        onChange={(e) => setCustomPlanDate(e.target.value)}
        className={inputClass}
      />
    </div>

    <div className="mt-5">
      <p className={labelClass}>CHOOSE YOUR MEAL</p>

      <div className="grid grid-cols-2 gap-3">
        {mealSlots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setCustomPlanSlot(slot)}
            className={`rounded-xl border px-3 py-4 text-[9px] tracking-[0.12em] transition ${
              customPlanSlot === slot
                ? "border-[#A77B73] bg-[#EAD8D3]/50 text-[#8F655E]"
                : "border-[#DED0CB] text-[#806E68]"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>

    <button
      type="button"
      disabled={!customPlanDate}
      onClick={() => {
        openMealPicker(customPlanDate, customPlanSlot);
        setPickerTab("custom");
        setIsCustomPlanOpen(false);
      }}
      className="mt-6 w-full rounded-full bg-[#211C19] px-5 py-3.5 text-[9px] tracking-[0.14em] text-[#F7F1ED] disabled:opacity-40"
    >
      ADD MY MEAL →
    </button>
  </div>
)}

  </div>
))}
                      </div>

                      


                    </div>
                  )}
                </div>
              </div>
            </section>


{targetsCompleted && planCompleted && (
  <div className="mt-3 rounded-xl border border-[#DED0CB] bg-[#FBF8F6] px-4 py-3 text-center">
    <p className="font-serif text-[13px] italic text-[#A77B73]">
      ✓ Your Nourish Method is locked in. ♡
    </p>
  </div>
)}





           {/* WEEKLY PLANNER */}
<section id="weekly-planner" className="scroll-mt-6 pt-12">
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

            </div>
            {/* END MEAL PLAN TAB */}

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

                    <div className="mt-5">
  <p className="mb-3 text-[8px] tracking-[0.16em] text-[#9D6F67]">
    NUTRITION DETAILS (OPTIONAL)
  </p>

  <div className="grid grid-cols-2 gap-3">
    {[
      {
        label: "CALORIES (KCAL)",
        value: customMealCalories,
        setter: setCustomMealCalories,
      },
      {
        label: "PROTEIN (G)",
        value: customMealProtein,
        setter: setCustomMealProtein,
      },
      {
        label: "CARBS (G)",
        value: customMealCarbs,
        setter: setCustomMealCarbs,
      },
      {
        label: "FAT (G)",
        value: customMealFat,
        setter: setCustomMealFat,
      },
    ].map((field) => (
      <div key={field.label}>
        <label className={labelClass}>
          {field.label}
        </label>

        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={field.value}
          onChange={(e) => field.setter(e.target.value)}
          placeholder="0"
          className={inputClass}
        />
      </div>
    ))}
  </div>

  <p className="mt-3 text-[10px] italic text-[#927D76]">
    Add what you know. You can leave any field blank. ♡
  </p>
</div>

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
