"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

type Sex = "female" | "male";
type Unit = "imperial" | "metric";
type Goal = "lose" | "maintain" | "gain";

type MacroResult = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  maintenance: number;
};

type RecommendedPlan = {
  title: string;
  subtitle: string;
  href: string;
  reason: string;
};

type HelperTab = "targets" | "plan" | null;

type PlannerDay = {
  key: string;
  date: string;
  shortDate: string;
  weekday: string;
  dayLabel: string;
};

type Recipe = {
  id: string;
  title: string;
  description?: string;
  href: string;
  category?: string;
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

const quickStarts = [
  {
    title: "LIGHTER WEEK",
    subtitle: "keep it light, not restrictive.",
    tag: "LIGHTER ACTIVITY",
    href: "/dashboard/resources/meal-plans/lighter-week",
  },
  {
    title: "BALANCED WEEK",
    subtitle: "simple. balanced. repeatable.",
    tag: "EVERYDAY",
    href: "/dashboard/resources/meal-plans/balanced-week",
  },
  {
    title: "TRAINING WEEK",
    subtitle: "fuel the work.",
    tag: "TRAINING",
    href: "/dashboard/resources/meal-plans/training-week",
  },
];

const activityLevels = [
  {
    value: "1.2",
    label: "SEDENTARY",
    detail: "Little structured exercise",
  },
  {
    value: "1.375",
    label: "LIGHT",
    detail: "1–3 training days / week",
  },
  {
    value: "1.55",
    label: "MODERATE",
    detail: "3–5 training days / week",
  },
  {
    value: "1.725",
    label: "VERY ACTIVE",
    detail: "6–7 hard training days / week",
  },
];

const goalOptions: {
  value: Goal;
  label: string;
  detail: string;
}[] = [
  {
    value: "lose",
    label: "LOSE FAT",
    detail: "A moderate calorie deficit",
  },
  {
    value: "maintain",
    label: "MAINTAIN",
    detail: "Stay around maintenance",
  },
  {
    value: "gain",
    label: "BUILD / GAIN",
    detail: "A small calorie surplus",
  },
];

const recipeLibrary: Recipe[] = [
  {
    id: "protein-pancakes",
    title: "Protein Pancakes",
    href: "/dashboard/resources/recipes/protein-pancakes",
    category: "BREAKFAST",
  },
  {
    id: "breakfast-wrap",
    title: "High-Protein Breakfast Wrap",
    href: "/dashboard/resources/recipes/breakfast-wrap",
    category: "BREAKFAST",
  },
  {
    id: "greek-yogurt-crunch-bowl",
    title: "Greek Yogurt Crunch Bowl",
    href: "/dashboard/resources/recipes/greek-yogurt-crunch-bowl",
    category: "BREAKFAST",
  },
  {
    id: "strawberry-protein-smoothie",
    title: "Strawberry Protein Smoothie",
    href: "/dashboard/resources/recipes/strawberry-protein-smoothie",
    category: "SNACK",
  },
  {
    id: "protein-snack-box",
    title: "Protein Snack Box",
    href: "/dashboard/resources/recipes/protein-snack-box",
    category: "SNACK",
  },
  {
    id: "chicken-taco-bowl",
    title: "Chicken Taco Bowl",
    href: "/dashboard/resources/recipes/chicken-taco-bowl",
    category: "LUNCH",
  },
  {
    id: "ground-turkey-sweet-potato-bowl",
    title: "Ground Turkey Sweet Potato Bowl",
    href: "/dashboard/resources/recipes/ground-turkey-sweet-potato-bowl",
    category: "LUNCH",
  },
  {
    id: "turkey-burger-bowl",
    title: "Turkey Burger Bowl",
    href: "/dashboard/resources/recipes/turkey-burger-bowl",
    category: "LUNCH",
  },
  {
    id: "turkey-quesadillas",
    title: "Ground Turkey Quesadillas",
    href: "/dashboard/resources/recipes/turkey-quesadillas",
    category: "LUNCH",
  },
  {
    id: "black-bean-corn-tacos",
    title: "Black Bean + Corn Tacos",
    href: "/dashboard/resources/recipes/black-bean-corn-tacos",
    category: "LUNCH",
  },
  {
    id: "black-bean-taquitos",
    title: "Crispy Black Bean Taquitos",
    href: "/dashboard/resources/recipes/black-bean-taquitos",
    category: "LUNCH",
  },
  {
    id: "creamy-chicken-protein-pasta",
    title: "Creamy Chicken Protein Pasta",
    href: "/dashboard/resources/recipes/creamy-chicken-protein-pasta",
    category: "DINNER",
  },
  {
    id: "salmon-roasted-veggies",
    title: "Salmon + Roasted Veggies",
    href: "/dashboard/resources/recipes/salmon-roasted-veggies",
    category: "DINNER",
  },
  {
    id: "lemon-garlic-shrimp",
    title: "Lemon Garlic Shrimp + Zucchini",
    href: "/dashboard/resources/recipes/lemon-garlic-shrimp",
    category: "DINNER",
  },
  {
    id: "loaded-chicken-potato",
    title: "Loaded Chicken Potato",
    href: "/dashboard/resources/recipes/loaded-chicken-potato",
    category: "DINNER",
  },
  {
    id: "honey-soy-chicken-bowl",
    title: "Honey Soy Chicken Veggie Bowl",
    href: "/dashboard/resources/recipes/honey-soy-chicken-bowl",
    category: "DINNER",
  },
  {
    id: "salmon-power-bowl",
    title: "Salmon Power Bowl",
    href: "/dashboard/resources/recipes/salmon-power-bowl",
    category: "DINNER",
  },
  {
    id: "turkey-stuffed-peppers",
    title: "Turkey Stuffed Bell Peppers",
    href: "/dashboard/resources/recipes/turkey-stuffed-peppers",
    category: "DINNER",
  },
];

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
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();
}

function getShortWeekday(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
    })
    .toUpperCase();
}

function getShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function getRecipeById(id?: string | null) {
  if (!id) {
    return null;
  }

  return recipeLibrary.find((recipe) => recipe.id === id) ?? null;
}

function getMealKey(planDate: string, mealSlot: MealSlot) {
  return `${planDate}-${mealSlot}`;
}

export default function MealPlansPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [weekStart, setWeekStart] =
    useState(getTodayForInput);

  const [plannerMeals, setPlannerMeals] =
    useState<Record<string, PlannerMeal>>({});

  const [customMeals, setCustomMeals] =
    useState<CustomMeal[]>([]);

  const [isLoadingPlanner, setIsLoadingPlanner] =
    useState(true);

  const [plannerError, setPlannerError] =
    useState("");

  const [activeDayIndex, setActiveDayIndex] =
    useState(0);

  const [pickerOpen, setPickerOpen] =
    useState(false);

  const [pickerDate, setPickerDate] =
    useState("");

  const [pickerSlot, setPickerSlot] =
    useState<MealSlot>("BREAKFAST");

  const [recipeSearch, setRecipeSearch] =
    useState("");

  const [customMealName, setCustomMealName] =
    useState("");

  const [isSavingMeal, setIsSavingMeal] =
    useState(false);

  const [isSavingCustomMeal, setIsSavingCustomMeal] =
    useState(false);

  // -------------------------------------------------------
  // OPTIONAL HELPER TABS
  // -------------------------------------------------------

  const [activeHelperTab, setActiveHelperTab] =
    useState<HelperTab>(null);

  // -------------------------------------------------------
  // MACRO CALCULATOR
  // -------------------------------------------------------

  const [unit, setUnit] =
    useState<Unit>("imperial");

  const [sex, setSex] =
    useState<Sex>("female");

  const [age, setAge] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [feet, setFeet] =
    useState("");

  const [inches, setInches] =
    useState("");

  const [heightCm, setHeightCm] =
    useState("");

  const [activity, setActivity] =
    useState("1.55");

  const [goal, setGoal] =
    useState<Goal>("maintain");

  const macroResult = useMemo<MacroResult | null>(() => {
    const ageValue = Number(age);
    const weightValue = Number(weight);
    const activityValue = Number(activity);

    if (
      !ageValue ||
      !weightValue ||
      ageValue <= 0 ||
      weightValue <= 0
    ) {
      return null;
    }

    const kg =
      unit === "imperial"
        ? weightValue / 2.20462
        : weightValue;

    let cm = 0;

    if (unit === "imperial") {
      const feetValue = Number(feet);
      const inchesValue = Number(inches || 0);

      if (
        !feetValue ||
        feetValue <= 0 ||
        inchesValue < 0
      ) {
        return null;
      }

      cm =
        (feetValue * 12 + inchesValue) *
        2.54;
    } else {
      cm = Number(heightCm);

      if (!cm || cm <= 0) {
        return null;
      }
    }

    const bmr =
      10 * kg +
      6.25 * cm -
      5 * ageValue +
      (sex === "male" ? 5 : -161);

    const maintenance =
      bmr * activityValue;

    const calorieMultiplier =
      goal === "lose"
        ? 0.85
        : goal === "gain"
          ? 1.1
          : 1;

    const calories = Math.round(
      maintenance * calorieMultiplier
    );

    const proteinPerKg =
      goal === "lose"
        ? 1.8
        : goal === "gain"
          ? 1.8
          : 1.6;

    const protein = Math.round(
      kg * proteinPerKg
    );

    const fatPercent = 0.3;

    const fat = Math.round(
      (calories * fatPercent) / 9
    );

    const proteinCalories =
      protein * 4;

    const fatCalories =
      fat * 9;

    const carbCalories = Math.max(
      calories -
        proteinCalories -
        fatCalories,
      0
    );

    const carbs = Math.round(
      carbCalories / 4
    );

    return {
      calories,
      protein,
      carbs,
      fat,
      maintenance:
        Math.round(maintenance),
    };
  }, [
    age,
    weight,
    feet,
    inches,
    heightCm,
    unit,
    sex,
    activity,
    goal,
  ]);

  const recommendedPlan =
    useMemo<RecommendedPlan>(() => {
      const activityValue =
        Number(activity);

      if (activityValue <= 1.2) {
        if (goal === "gain") {
          return {
            title: "BALANCED WEEK",
            subtitle:
              "simple. balanced. repeatable.",
            href: "/dashboard/resources/meal-plans/balanced-week",
            reason:
              "Your activity is currently lighter, but your build / gain goal may benefit from a little more consistent fuel.",
          };
        }

        return {
          title: "LIGHTER WEEK",
          subtitle:
            "keep it light, not restrictive.",
          href: "/dashboard/resources/meal-plans/lighter-week",
          reason:
            "Your current activity level makes Lighter Week a simple starting framework without overcomplicating your meals.",
        };
      }

      if (activityValue <= 1.375) {
        if (goal === "gain") {
          return {
            title: "BALANCED WEEK",
            subtitle:
              "simple. balanced. repeatable.",
            href: "/dashboard/resources/meal-plans/balanced-week",
            reason:
              "Your lighter training schedule paired with a build / gain goal makes Balanced Week a practical place to start.",
          };
        }

        if (goal === "lose") {
          return {
            title: "LIGHTER WEEK",
            subtitle:
              "keep it light, not restrictive.",
            href: "/dashboard/resources/meal-plans/lighter-week",
            reason:
              "Your activity and goal point toward a lighter, protein-forward framework while still leaving room to adjust portions.",
          };
        }

        return {
          title: "BALANCED WEEK",
          subtitle:
            "simple. balanced. repeatable.",
          href: "/dashboard/resources/meal-plans/balanced-week",
          reason:
            "Your activity level fits well with a balanced, flexible week that gives you structure without overdoing it.",
        };
      }

      if (activityValue <= 1.55) {
        if (goal === "gain") {
          return {
            title: "TRAINING WEEK",
            subtitle:
              "fuel the work.",
            href: "/dashboard/resources/meal-plans/training-week",
            reason:
              "With regular training and a build / gain goal, Training Week gives you a stronger fueling framework.",
          };
        }

        return {
          title: "BALANCED WEEK",
          subtitle:
            "simple. balanced. repeatable.",
          href: "/dashboard/resources/meal-plans/balanced-week",
          reason:
            "With regular weekly training, Balanced Week gives you enough structure and fuel while staying flexible.",
        };
      }

      return {
        title: "TRAINING WEEK",
        subtitle:
          "fuel the work.",
        href: "/dashboard/resources/meal-plans/training-week",
        reason:
          goal === "lose"
            ? "You train frequently, so even with a fat-loss goal, your plan should still support performance and recovery."
            : "Your high activity level makes Training Week the strongest starting framework for fueling performance and recovery.",
      };
    }, [activity, goal]);

  const calculatorInputClass =
    "w-full rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3.5 text-[16px] text-[#211C19] outline-none transition placeholder:text-[#AA9690] focus:border-[#A77B73]";

  const calculatorLabelClass =
    "mb-2 block text-[8px] tracking-[0.18em] text-[#806E68]";

  const plannerWeek = useMemo<PlannerDay[]>(() => {
    if (!weekStart) {
      return [];
    }

    const startDate =
      parseDateInput(weekStart);

    return Array.from(
      { length: 7 },
      (_, index) => {
        const date =
          addDays(startDate, index);

        return {
          key: formatDateForInput(date),
          date: formatDateForInput(date),
          shortDate: getShortDate(date),
          weekday: getShortWeekday(date),
          dayLabel: getLongDate(date),
        };
      }
    );
  }, [weekStart]);

  const weekEnd =
    plannerWeek.length > 0
      ? plannerWeek[
          plannerWeek.length - 1
        ]
      : null;

  const activeDay =
    plannerWeek[activeDayIndex] ??
    plannerWeek[0];

  const initial =
    !isLoadingUser &&
    firstName !== "there"
      ? firstName
          .charAt(0)
          .toUpperCase()
      : "♡";

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingPlanner(false);
        return;
      }

      setUserId(user.id);

      const savedName =
        user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(
          user.email.split("@")[0]
        );
      }

      try {
        const savedWeekStart =
          window.localStorage.getItem(
            `lockInMealPlannerWeekStart:${user.id}`
          );

        if (savedWeekStart) {
          setWeekStart(savedWeekStart);
        }
      } catch (error) {
        console.warn(
          "Could not read saved planner week:",
          error
        );
      }

      setIsLoadingUser(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!userId || !weekStart) {
      return;
    }

    try {
      window.localStorage.setItem(
        `lockInMealPlannerWeekStart:${userId}`,
        weekStart
      );
    } catch (error) {
      console.warn(
        "Could not save planner week:",
        error
      );
    }
  }, [userId, weekStart]);

  useEffect(() => {
    if (!userId || plannerWeek.length === 0) {
      return;
    }

    const loadPlanner = async () => {
      setIsLoadingPlanner(true);
      setPlannerError("");

      const startDate =
        plannerWeek[0].date;

      const endDate =
        plannerWeek[
          plannerWeek.length - 1
        ].date;

      const { data, error } =
        await supabase
          .from("meal_plan_selections")
          .select("*")
          .eq("user_id", userId)
          .gte("plan_date", startDate)
          .lte("plan_date", endDate)
          .order("plan_date", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Could not load meal planner:",
          error
        );

        setPlannerError(
          "We couldn't load your saved meals."
        );

        setIsLoadingPlanner(false);
        return;
      }

      const nextMeals: Record<
        string,
        PlannerMeal
      > = {};

      (data ?? []).forEach(
        (meal: PlannerMeal) => {
          nextMeals[
            getMealKey(
              meal.plan_date,
              meal.meal_slot
            )
          ] = meal;
        }
      );

      setPlannerMeals(nextMeals);
      setIsLoadingPlanner(false);
    };

    loadPlanner();
  }, [userId, plannerWeek]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadCustomMeals = async () => {
      const { data, error } =
        await supabase
          .from("custom_meals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.warn(
          "Could not load custom meals:",
          error
        );

        return;
      }

      setCustomMeals(
        (data ?? []) as CustomMeal[]
      );
    };

    loadCustomMeals();
  }, [userId]);

  useEffect(() => {
    if (!pickerOpen) {
      document.body.style.overflow =
        "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [pickerOpen]);

  useEffect(() => {
    setActiveDayIndex(0);
  }, [weekStart]);

  const handleWeekStartChange = (
    value: string
  ) => {
    setWeekStart(value);
    setActiveDayIndex(0);
  };

  const openMealPicker = (
    planDate: string,
    slot: MealSlot
  ) => {
    setPickerDate(planDate);
    setPickerSlot(slot);
    setRecipeSearch("");
    setCustomMealName("");
    setPickerOpen(true);
  };

  const closeMealPicker = () => {
    if (
      isSavingMeal ||
      isSavingCustomMeal
    ) {
      return;
    }

    setPickerOpen(false);
    setRecipeSearch("");
    setCustomMealName("");
  };

  const saveRecipeToPlanner =
    async (recipe: Recipe) => {
      if (
        !userId ||
        !pickerDate ||
        isSavingMeal
      ) {
        return;
      }

      setIsSavingMeal(true);
      setPlannerError("");

      const planDate =
        parseDateInput(pickerDate);

      const row = {
        user_id: userId,
        day: getWeekdayName(planDate),
        plan_date: pickerDate,
        meal_slot: pickerSlot,
        recipe_id: recipe.id,
        custom_meal_name: null,
        updated_at:
          new Date().toISOString(),
      };

      const { data, error } =
        await supabase
          .from("meal_plan_selections")
          .upsert(row, {
            onConflict:
              "user_id,plan_date,meal_slot",
          })
          .select()
          .single();

      if (error) {
        console.error(
          "Could not save recipe:",
          error
        );

        setPlannerError(
          "We couldn't save that meal."
        );

        setIsSavingMeal(false);
        return;
      }

      setPlannerMeals((current) => ({
        ...current,
        [getMealKey(
          pickerDate,
          pickerSlot
        )]: data as PlannerMeal,
      }));

      setIsSavingMeal(false);
      closeMealPicker();
    };

  const saveExistingCustomMeal =
    async (meal: CustomMeal) => {
      if (
        !userId ||
        !pickerDate ||
        isSavingMeal
      ) {
        return;
      }

      setIsSavingMeal(true);
      setPlannerError("");

      const planDate =
        parseDateInput(pickerDate);

      const row = {
        user_id: userId,
        day: getWeekdayName(planDate),
        plan_date: pickerDate,
        meal_slot: pickerSlot,
        recipe_id: null,
        custom_meal_name: meal.name,
        updated_at:
          new Date().toISOString(),
      };

      const { data, error } =
        await supabase
          .from("meal_plan_selections")
          .upsert(row, {
            onConflict:
              "user_id,plan_date,meal_slot",
          })
          .select()
          .single();

      if (error) {
        console.error(
          "Could not save custom meal:",
          error
        );

        setPlannerError(
          "We couldn't save that meal."
        );

        setIsSavingMeal(false);
        return;
      }

      setPlannerMeals((current) => ({
        ...current,
        [getMealKey(
          pickerDate,
          pickerSlot
        )]: data as PlannerMeal,
      }));

      setIsSavingMeal(false);
      closeMealPicker();
    };

  const createAndUseCustomMeal =
    async () => {
      const trimmedName =
        customMealName.trim();

      if (
        !userId ||
        !pickerDate ||
        !trimmedName ||
        isSavingCustomMeal
      ) {
        return;
      }

      setIsSavingCustomMeal(true);
      setPlannerError("");

      let customMeal: CustomMeal | null =
        null;

      const existing =
        customMeals.find(
          (meal) =>
            meal.name
              .trim()
              .toLowerCase() ===
            trimmedName.toLowerCase()
        );

      if (existing) {
        customMeal = existing;
      } else {
        const { data, error } =
          await supabase
            .from("custom_meals")
            .insert({
              user_id: userId,
              name: trimmedName,
            })
            .select()
            .single();

        if (error) {
          console.error(
            "Could not create custom meal:",
            error
          );

          setPlannerError(
            "We couldn't save your custom meal."
          );

          setIsSavingCustomMeal(false);
          return;
        }

        customMeal =
          data as CustomMeal;

        setCustomMeals((current) => [
          customMeal as CustomMeal,
          ...current,
        ]);
      }

      const planDate =
        parseDateInput(pickerDate);

      const row = {
        user_id: userId,
        day: getWeekdayName(planDate),
        plan_date: pickerDate,
        meal_slot: pickerSlot,
        recipe_id: null,
        custom_meal_name:
          customMeal.name,
        updated_at:
          new Date().toISOString(),
      };

      const { data, error } =
        await supabase
          .from("meal_plan_selections")
          .upsert(row, {
            onConflict:
              "user_id,plan_date,meal_slot",
          })
          .select()
          .single();

      if (error) {
        console.error(
          "Could not add custom meal to planner:",
          error
        );

        setPlannerError(
          "We saved the custom meal, but couldn't add it to this day."
        );

        setIsSavingCustomMeal(false);
        return;
      }

      setPlannerMeals((current) => ({
        ...current,
        [getMealKey(
          pickerDate,
          pickerSlot
        )]: data as PlannerMeal,
      }));

      setIsSavingCustomMeal(false);
      closeMealPicker();
    };

  const removeMeal =
    async (
      planDate: string,
      slot: MealSlot
    ) => {
      if (!userId) {
        return;
      }

      const key =
        getMealKey(planDate, slot);

      const previous =
        plannerMeals[key];

      setPlannerMeals((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });

      const { error } =
        await supabase
          .from("meal_plan_selections")
          .delete()
          .eq("user_id", userId)
          .eq("plan_date", planDate)
          .eq("meal_slot", slot);

      if (error) {
        console.error(
          "Could not remove meal:",
          error
        );

        if (previous) {
          setPlannerMeals(
            (current) => ({
              ...current,
              [key]: previous,
            })
          );
        }

        setPlannerError(
          "We couldn't remove that meal."
        );
      }
    };

  const filteredRecipes =
    useMemo(() => {
      const search =
        recipeSearch
          .trim()
          .toLowerCase();

      const sorted =
        [...recipeLibrary].sort(
          (a, b) => {
            const aMatches =
              a.category === pickerSlot
                ? 0
                : 1;

            const bMatches =
              b.category === pickerSlot
                ? 0
                : 1;

            if (aMatches !== bMatches) {
              return (
                aMatches - bMatches
              );
            }

            return a.title.localeCompare(
              b.title
            );
          }
        );

      if (!search) {
        return sorted;
      }

      return sorted.filter((recipe) =>
        recipe.title
          .toLowerCase()
          .includes(search)
      );
    }, [recipeSearch, pickerSlot]);

  const selectedPickerDay =
    plannerWeek.find(
      (day) =>
        day.date === pickerDate
    );

  const toggleHelperTab = (
    tab: Exclude<HelperTab, null>
  ) => {
    setActiveHelperTab((current) =>
      current === tab ? null : tab
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={
            isLoadingUser
          }
        />

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          {/* HEADER */}

          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73] sm:text-xl">
                plan it once. make the
                week easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[7px] tracking-[0.2em] transition hover:bg-[#EAD8D3] sm:px-5 sm:py-3 sm:text-[8px]"
            >
              ← RESOURCES
            </Link>
          </header>

          {/* INTRO */}

          <section className="mx-auto max-w-6xl pb-10 pt-14 md:pb-12 md:pt-20">
            <div className="grid gap-8 border-b border-[#DED0CB] pb-10 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-12">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  MEAL PLANS
                </p>

                <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
                  Build your
                  <span className="block italic text-[#A77B73]">
                    week. ♡
                  </span>
                </h1>
              </div>

              <div className="md:pb-1">
                <p className="max-w-md text-xs leading-6 text-[#75635D]">
                  Start with a plan,
                  build your own, or use
                  the optional tools below
                  when you want a little
                  more guidance. Your week
                  is still yours.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    "7-DAY PLANNER",
                    "FLEXIBLE",
                    "CUSTOM MEALS",
                    "OPTIONAL GUIDANCE",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[7px] tracking-[0.2em] text-[#9D6F67]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* OPTIONAL HELPERS */}

          <section className="mx-auto max-w-6xl pb-10">
            <div className="mb-4">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                NEED A LITTLE HELP
                GETTING STARTED?
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                use what helps. skip what
                doesn&apos;t. ♡
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {/* TABS */}

              <div className="grid sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    toggleHelperTab(
                      "targets"
                    )
                  }
                  className={`group flex items-center justify-between gap-4 p-5 text-left transition md:p-6 ${
                    activeHelperTab ===
                    "targets"
                      ? "bg-[#EAD8D3]/65"
                      : "hover:bg-[#F4ECE8]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-3xl italic text-[#C39A92]">
                      01
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                        FIND YOUR TARGETS
                      </p>

                      <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                        calorie + macro
                        starting point. ♡
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-serif text-2xl text-[#A77B73] transition-transform duration-200 ${
                      activeHelperTab ===
                      "targets"
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleHelperTab(
                      "plan"
                    )
                  }
                  className={`group flex items-center justify-between gap-4 border-t border-[#DED0CB] p-5 text-left transition sm:border-l sm:border-t-0 md:p-6 ${
                    activeHelperTab ===
                    "plan"
                      ? "bg-[#EAD8D3]/65"
                      : "hover:bg-[#F4ECE8]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-3xl italic text-[#C39A92]">
                      02
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                        FIND YOUR PLAN
                      </p>

                      <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                        get a suggested
                        place to start. ♡
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-serif text-2xl text-[#A77B73] transition-transform duration-200 ${
                      activeHelperTab ===
                      "plan"
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>
              </div>

              {/* TAB 01 */}

              {activeHelperTab ===
                "targets" && (
                <div className="border-t border-[#DED0CB] p-5 md:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                        01 — FIND YOUR
                        TARGETS
                      </p>

                      <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                        Start with{" "}
                        <span className="italic text-[#A77B73]">
                          you. ♡
                        </span>
                      </h2>

                      <p className="mt-3 max-w-xl text-[11px] leading-5 text-[#806E68]">
                        Get a practical
                        starting estimate
                        for calories and
                        macros. These are
                        general estimates,
                        not rigid rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveHelperTab(
                          null
                        )
                      }
                      className="shrink-0 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                    >
                      CLOSE ×
                    </button>
                  </div>

                  <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    {/* FORM */}

                    <div className="rounded-[1.5rem] border border-[#E1D3CE] bg-[#F7F1ED] p-5 md:p-6">
                      <div className="flex flex-col gap-4 border-b border-[#E1D3CE] pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[8px] tracking-[0.24em] text-[#9D6F67]">
                            YOUR DETAILS
                          </p>

                          <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                            the basics first.
                            ♡
                          </p>
                        </div>

                        <div className="flex w-fit rounded-full border border-[#D6C3BD] bg-[#FBF8F6] p-1">
                          {(
                            [
                              "imperial",
                              "metric",
                            ] as const
                          ).map(
                            (option) => (
                              <button
                                key={
                                  option
                                }
                                type="button"
                                onClick={() =>
                                  setUnit(
                                    option
                                  )
                                }
                                className={`rounded-full px-4 py-2 text-[8px] tracking-[0.14em] transition ${
                                  unit ===
                                  option
                                    ? "bg-[#211C19] text-[#F7F1ED]"
                                    : "text-[#8F655E]"
                                }`}
                              >
                                {option ===
                                "imperial"
                                  ? "LB / FT"
                                  : "KG / CM"}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label>
                          <span
                            className={
                              calculatorLabelClass
                            }
                          >
                            AGE
                          </span>

                          <input
                            type="number"
                            min="18"
                            value={age}
                            onChange={(
                              event
                            ) =>
                              setAge(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="e.g. 30"
                            className={
                              calculatorInputClass
                            }
                          />
                        </label>

                        <div>
                          <span
                            className={
                              calculatorLabelClass
                            }
                          >
                            SEX
                          </span>

                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                "female",
                                "male",
                              ] as const
                            ).map(
                              (
                                option
                              ) => (
                                <button
                                  key={
                                    option
                                  }
                                  type="button"
                                  onClick={() =>
                                    setSex(
                                      option
                                    )
                                  }
                                  className={`rounded-xl border px-3 py-3.5 text-[9px] tracking-[0.14em] transition ${
                                    sex ===
                                    option
                                      ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                                      : "border-[#D6C3BD] bg-[#FBF8F6] text-[#8F655E]"
                                  }`}
                                >
                                  {option.toUpperCase()}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <label>
                          <span
                            className={
                              calculatorLabelClass
                            }
                          >
                            WEIGHT{" "}
                            {unit ===
                            "imperial"
                              ? "(LB)"
                              : "(KG)"}
                          </span>

                          <input
                            type="number"
                            min="1"
                            value={weight}
                            onChange={(
                              event
                            ) =>
                              setWeight(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder={
                              unit ===
                              "imperial"
                                ? "e.g. 135"
                                : "e.g. 61"
                            }
                            className={
                              calculatorInputClass
                            }
                          />
                        </label>

                        {unit ===
                        "imperial" ? (
                          <div>
                            <span
                              className={
                                calculatorLabelClass
                              }
                            >
                              HEIGHT
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                min="1"
                                value={
                                  feet
                                }
                                onChange={(
                                  event
                                ) =>
                                  setFeet(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Feet"
                                className={
                                  calculatorInputClass
                                }
                              />

                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={
                                  inches
                                }
                                onChange={(
                                  event
                                ) =>
                                  setInches(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Inches"
                                className={
                                  calculatorInputClass
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <label>
                            <span
                              className={
                                calculatorLabelClass
                              }
                            >
                              HEIGHT (CM)
                            </span>

                            <input
                              type="number"
                              min="1"
                              value={
                                heightCm
                              }
                              onChange={(
                                event
                              ) =>
                                setHeightCm(
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="e.g. 165"
                              className={
                                calculatorInputClass
                              }
                            />
                          </label>
                        )}
                      </div>

                      <div className="mt-6 border-t border-[#E1D3CE] pt-5">
                        <p className="text-[8px] tracking-[0.24em] text-[#9D6F67]">
                          ACTIVITY
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {activityLevels.map(
                            (level) => (
                              <button
                                key={
                                  level.value
                                }
                                type="button"
                                onClick={() =>
                                  setActivity(
                                    level.value
                                  )
                                }
                                className={`rounded-xl border p-3.5 text-left transition ${
                                  activity ===
                                  level.value
                                    ? "border-[#A77B73] bg-[#EAD8D3]/75"
                                    : "border-[#D6C3BD] bg-[#FBF8F6] hover:border-[#CBA9A2]"
                                }`}
                              >
                                <span className="block text-[8px] tracking-[0.14em] text-[#6F514B]">
                                  {
                                    level.label
                                  }
                                </span>

                                <span className="mt-1 block text-[11px] leading-4 text-[#806E68]">
                                  {
                                    level.detail
                                  }
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="mt-6 border-t border-[#E1D3CE] pt-5">
                        <p className="text-[8px] tracking-[0.24em] text-[#9D6F67]">
                          YOUR GOAL
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {goalOptions.map(
                            (option) => (
                              <button
                                key={
                                  option.value
                                }
                                type="button"
                                onClick={() =>
                                  setGoal(
                                    option.value
                                  )
                                }
                                className={`rounded-xl border p-3.5 text-left transition ${
                                  goal ===
                                  option.value
                                    ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                                    : "border-[#D6C3BD] bg-[#FBF8F6] text-[#8F655E]"
                                }`}
                              >
                                <span className="block text-[8px] tracking-[0.12em]">
                                  {
                                    option.label
                                  }
                                </span>

                                <span
                                  className={`mt-1.5 block text-[10px] leading-4 ${
                                    goal ===
                                    option.value
                                      ? "text-[#D8CAC5]"
                                      : "text-[#806E68]"
                                  }`}
                                >
                                  {
                                    option.detail
                                  }
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RESULT */}

                    <div className="rounded-[1.5rem] bg-[#EAD8D3]/75 p-5 md:p-6">
                      <p className="text-[8px] tracking-[0.24em] text-[#8F655E]">
                        YOUR STARTING
                        TARGET
                      </p>

                      {macroResult ? (
                        <>
                          <div className="border-b border-[#D5BBB5] py-6 text-center">
                            <p className="font-serif text-5xl leading-none text-[#211C19]">
                              {macroResult.calories.toLocaleString()}
                            </p>

                            <p className="mt-2 text-[8px] tracking-[0.2em] text-[#8F655E]">
                              CALORIES /
                              DAY
                            </p>
                          </div>

                          <div className="grid grid-cols-3 border-b border-[#D5BBB5]">
                            <div className="py-4 text-center">
                              <p className="font-serif text-2xl text-[#211C19]">
                                {
                                  macroResult.protein
                                }
                                <span className="text-xs italic text-[#A77B73]">
                                  g
                                </span>
                              </p>

                              <p className="mt-1 text-[7px] tracking-[0.12em] text-[#8F655E]">
                                PROTEIN
                              </p>
                            </div>

                            <div className="border-x border-[#D5BBB5] py-4 text-center">
                              <p className="font-serif text-2xl text-[#211C19]">
                                {
                                  macroResult.carbs
                                }
                                <span className="text-xs italic text-[#A77B73]">
                                  g
                                </span>
                              </p>

                              <p className="mt-1 text-[7px] tracking-[0.12em] text-[#8F655E]">
                                CARBS
                              </p>
                            </div>

                            <div className="py-4 text-center">
                              <p className="font-serif text-2xl text-[#211C19]">
                                {
                                  macroResult.fat
                                }
                                <span className="text-xs italic text-[#A77B73]">
                                  g
                                </span>
                              </p>

                              <p className="mt-1 text-[7px] tracking-[0.12em] text-[#8F655E]">
                                FAT
                              </p>
                            </div>
                          </div>

                          <div className="pt-5">
                            <p className="text-[7px] tracking-[0.18em] text-[#8F655E]">
                              ESTIMATED
                              MAINTENANCE
                            </p>

                            <p className="mt-1 font-serif text-xl">
                              {macroResult.maintenance.toLocaleString()}
                              <span className="ml-1 text-sm italic text-[#A77B73]">
                                cal /
                                day
                              </span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="py-8">
                          <p className="font-serif text-3xl italic leading-tight text-[#A77B73]">
                            your numbers
                            will
                            <br />
                            show here. ♡
                          </p>

                          <p className="mt-4 text-[12px] leading-5 text-[#6F5F59]">
                            Add your age,
                            weight and
                            height. Your
                            targets update
                            automatically.
                          </p>
                        </div>
                      )}

                      <p className="mt-5 border-t border-[#D5BBB5] pt-4 text-[9px] leading-4 text-[#806E68]">
                        General estimates
                        only. Use these as
                        a starting point
                        and adjust based on
                        progress,
                        performance and
                        how you feel.
                      </p>

                      {macroResult && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveHelperTab(
                              "plan"
                            )
                          }
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#211C19] px-5 py-3.5 text-[7px] tracking-[0.18em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                        >
                          SEE MY PLAN
                          RECOMMENDATION
                          →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 02 */}

              {activeHelperTab ===
                "plan" && (
                <div className="border-t border-[#DED0CB] p-5 md:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                        02 — FIND YOUR PLAN
                      </p>

                      <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                        A place to{" "}
                        <span className="italic text-[#A77B73]">
                          begin. ♡
                        </span>
                      </h2>

                      <p className="mt-3 max-w-xl text-[11px] leading-5 text-[#806E68]">
                        If you completed
                        your targets, we&apos;ll
                        use your activity
                        and goal to suggest
                        a starting plan.
                        You can always pick
                        something else.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveHelperTab(
                          null
                        )
                      }
                      className="shrink-0 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                    >
                      CLOSE ×
                    </button>
                  </div>

                  {macroResult ? (
                    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="rounded-[1.5rem] border border-[#D6C3BD] bg-[#F7F1ED] p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[#211C19] px-3 py-1.5 text-[6px] tracking-[0.18em] text-[#F7F1ED]">
                            RECOMMENDED
                          </span>

                          <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                            BASED ON YOUR
                            ACTIVITY + GOAL
                          </p>
                        </div>

                        <h3 className="mt-4 font-serif text-3xl text-[#211C19]">
                          {
                            recommendedPlan.title
                          }
                        </h3>

                        <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                          {
                            recommendedPlan.subtitle
                          }
                        </p>

                        <p className="mt-4 max-w-2xl text-[11px] leading-5 text-[#806E68]">
                          {
                            recommendedPlan.reason
                          }
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <Link
                            href={
                              recommendedPlan.href
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-[#211C19] px-5 py-3 text-[7px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                          >
                            VIEW + USE PLAN
                            <span>
                              →
                            </span>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveHelperTab(
                                "targets"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                          >
                            EDIT TARGETS
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:w-[210px]">
                        <div className="rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] p-4 text-center">
                          <p className="font-serif text-2xl">
                            {macroResult.calories.toLocaleString()}
                          </p>

                          <p className="mt-1 text-[6px] tracking-[0.14em] text-[#8F655E]">
                            CALORIES
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] p-4 text-center">
                          <p className="font-serif text-2xl">
                            {
                              macroResult.protein
                            }
                            <span className="text-xs italic text-[#A77B73]">
                              g
                            </span>
                          </p>

                          <p className="mt-1 text-[6px] tracking-[0.14em] text-[#8F655E]">
                            PROTEIN
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#D6C3BD] bg-[#F7F1ED] p-5 md:p-6">
                      <p className="font-serif text-xl italic text-[#A77B73]">
                        want a personalized
                        starting point? ♡
                      </p>

                      <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#806E68]">
                        Complete the macro
                        calculator first
                        and we&apos;ll suggest
                        a plan based on
                        your activity and
                        goal — or skip it
                        and choose any plan
                        below.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveHelperTab(
                            "targets"
                          )
                        }
                        className="mt-4 rounded-full bg-[#211C19] px-5 py-3 text-[7px] tracking-[0.18em] text-[#F7F1ED]"
                      >
                        FIND MY TARGETS →
                      </button>
                    </div>
                  )}

                  <div className="mt-7 border-t border-[#DED0CB] pt-6">
                    <div>
                      <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                        OR CHOOSE FOR
                        YOURSELF
                      </p>

                      <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                        recommendations are
                        a starting point,
                        not a rule. ♡
                      </p>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      {quickStarts.map(
                        (plan) => {
                          const isRecommended =
                            Boolean(
                              macroResult
                            ) &&
                            recommendedPlan.title ===
                              plan.title;

                          return (
                            <Link
                              key={
                                plan.title
                              }
                              href={
                                plan.href
                              }
                              className={`group rounded-2xl border p-4 transition ${
                                isRecommended
                                  ? "border-[#A77B73] bg-[#EAD8D3]/60"
                                  : "border-[#DED0CB] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[7px] tracking-[0.18em] text-[#211C19]">
                                  {
                                    plan.title
                                  }
                                </p>

                                <span className="text-[6px] tracking-[0.12em] text-[#9D6F67]">
                                  {isRecommended
                                    ? "YOUR PICK"
                                    : plan.tag}
                                </span>
                              </div>

                              <div className="mt-3 flex items-end justify-between gap-3">
                                <p className="font-serif text-sm italic text-[#A77B73]">
                                  {
                                    plan.subtitle
                                  }
                                </p>

                                <span className="font-serif text-lg text-[#A77B73] transition group-hover:translate-x-1">
                                  →
                                </span>
                              </div>
                            </Link>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* WEEKLY PLANNER */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  YOUR WEEK
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Build your{" "}
                  <span className="italic text-[#A77B73]">
                    own. ♡
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-[11px] leading-5 text-[#806E68]">
                  Pick any start date.
                  Plan seven days from
                  there, then add,
                  change or remove meals
                  whenever you need.
                </p>
              </div>

              <div className="w-full max-w-[260px]">
                <label
                  htmlFor="week-start"
                  className="text-[7px] tracking-[0.22em] text-[#9D6F67]"
                >
                  START THIS WEEK ON
                </label>

                <input
                  id="week-start"
                  type="date"
                  value={weekStart}
                  onChange={(event) =>
                    handleWeekStartChange(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#D6C3BD] bg-[#FBF8F6] px-4 py-3 text-[16px] text-[#211C19] outline-none transition focus:border-[#A77B73]"
                />
              </div>
            </div>

            {plannerWeek.length > 0 &&
              weekEnd && (
                <div className="mb-5 rounded-2xl bg-[#EAD8D3]/45 px-5 py-4">
                  <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                    PLANNING
                  </p>

                  <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                    {plannerWeek[0].dayLabel}{" "}
                    — {weekEnd.dayLabel}
                  </p>
                </div>
              )}

            {plannerError && (
              <div className="mb-5 rounded-2xl border border-[#D9B7B0] bg-[#F3E3DF] px-4 py-3">
                <p className="text-xs leading-5 text-[#8F5F57]">
                  {plannerError}
                </p>
              </div>
            )}

            {/* MOBILE DAY TABS */}

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {plannerWeek.map(
                (day, index) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      setActiveDayIndex(
                        index
                      )
                    }
                    className={`min-w-[76px] rounded-2xl border px-3 py-3 text-center transition ${
                      activeDayIndex ===
                      index
                        ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                        : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68]"
                    }`}
                  >
                    <span className="block text-[7px] tracking-[0.15em]">
                      {day.weekday}
                    </span>

                    <span className="mt-1 block font-serif text-sm italic">
                      {day.shortDate}
                    </span>
                  </button>
                )
              )}
            </div>

            {/* MOBILE ACTIVE DAY */}

            {activeDay && (
              <div className="md:hidden">
                <div className="overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">
                  <div className="border-b border-[#DED0CB] bg-[#EAD8D3]/45 px-5 py-4">
                    <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      {activeDay.weekday}
                    </p>

                    <p className="mt-1 font-serif text-xl italic text-[#A77B73]">
                      {activeDay.dayLabel}
                    </p>
                  </div>

                  <div className="divide-y divide-[#E8DDD9]">
                    {mealSlots.map(
                      (slot) => {
                        const key =
                          getMealKey(
                            activeDay.date,
                            slot
                          );

                        const meal =
                          plannerMeals[
                            key
                          ];

                        const recipe =
                          getRecipeById(
                            meal?.recipe_id
                          );

                        const mealName =
                          recipe?.title ??
                          meal?.custom_meal_name ??
                          "";

                        return (
                          <div
                            key={slot}
                            className="p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                                {slot}
                              </p>

                              {meal && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMeal(
                                      activeDay.date,
                                      slot
                                    )
                                  }
                                  className="text-[6px] tracking-[0.14em] text-[#A77B73]"
                                >
                                  REMOVE
                                </button>
                              )}
                            </div>

                            {isLoadingPlanner ? (
                              <div className="mt-3 h-12 animate-pulse rounded-xl bg-[#EFE5E1]" />
                            ) : meal ? (
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  {recipe ? (
                                    <Link
                                      href={
                                        recipe.href
                                      }
                                      className="font-serif text-lg leading-snug transition hover:text-[#A77B73]"
                                    >
                                      {
                                        mealName
                                      }
                                    </Link>
                                  ) : (
                                    <p className="font-serif text-lg leading-snug">
                                      {
                                        mealName
                                      }
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openMealPicker(
                                      activeDay.date,
                                      slot
                                    )
                                  }
                                  className="shrink-0 rounded-full border border-[#CBA9A2] px-3 py-2 text-[6px] tracking-[0.14em] text-[#8F655E]"
                                >
                                  CHANGE
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openMealPicker(
                                    activeDay.date,
                                    slot
                                  )
                                }
                                className="mt-2 flex w-full items-center justify-between rounded-xl border border-dashed border-[#D6C3BD] px-4 py-3 text-left transition hover:bg-[#F4ECE8]"
                              >
                                <span className="font-serif text-base italic text-[#A77B73]">
                                  add a meal.
                                  ♡
                                </span>

                                <span className="text-lg text-[#A77B73]">
                                  +
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DESKTOP WEEK */}

            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[980px] overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="grid grid-cols-7 border-b border-[#DED0CB]">
                  {plannerWeek.map(
                    (day) => (
                      <div
                        key={day.key}
                        className="border-r border-[#DED0CB] px-3 py-4 text-center last:border-r-0"
                      >
                        <p className="text-[7px] tracking-[0.18em] text-[#9D6F67]">
                          {
                            day.weekday
                          }
                        </p>

                        <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                          {
                            day.shortDate
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>

                {mealSlots.map(
                  (slot) => (
                    <div
                      key={slot}
                      className="grid grid-cols-7 border-b border-[#E8DDD9] last:border-b-0"
                    >
                      {plannerWeek.map(
                        (day) => {
                          const key =
                            getMealKey(
                              day.date,
                              slot
                            );

                          const meal =
                            plannerMeals[
                              key
                            ];

                          const recipe =
                            getRecipeById(
                              meal?.recipe_id
                            );

                          const mealName =
                            recipe?.title ??
                            meal?.custom_meal_name ??
                            "";

                          return (
                            <div
                              key={
                                day.key
                              }
                              className="min-h-[150px] border-r border-[#E8DDD9] p-3 last:border-r-0"
                            >
                              <p className="text-[6px] tracking-[0.16em] text-[#9D6F67]">
                                {slot}
                              </p>

                              {isLoadingPlanner ? (
                                <div className="mt-3 h-16 animate-pulse rounded-xl bg-[#EFE5E1]" />
                              ) : meal ? (
                                <div className="mt-3">
                                  {recipe ? (
                                    <Link
                                      href={
                                        recipe.href
                                      }
                                      className="font-serif text-sm leading-snug transition hover:text-[#A77B73]"
                                    >
                                      {
                                        mealName
                                      }
                                    </Link>
                                  ) : (
                                    <p className="font-serif text-sm leading-snug">
                                      {
                                        mealName
                                      }
                                    </p>
                                  )}

                                  <div className="mt-4 flex flex-wrap gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openMealPicker(
                                          day.date,
                                          slot
                                        )
                                      }
                                      className="rounded-full border border-[#CBA9A2] px-2.5 py-1.5 text-[5px] tracking-[0.12em] text-[#8F655E]"
                                    >
                                      CHANGE
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeMeal(
                                          day.date,
                                          slot
                                        )
                                      }
                                      className="px-2 py-1.5 text-[5px] tracking-[0.12em] text-[#A77B73]"
                                    >
                                      REMOVE
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openMealPicker(
                                      day.date,
                                      slot
                                    )
                                  }
                                  className="mt-3 flex min-h-[86px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D6C3BD] px-2 text-center transition hover:bg-[#F4ECE8]"
                                >
                                  <span className="font-serif text-lg text-[#C39A92]">
                                    +
                                  </span>

                                  <span className="mt-1 text-[6px] tracking-[0.12em] text-[#9D6F67]">
                                    ADD MEAL
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* WEEK TOOLS */}

          <section className="mx-auto max-w-6xl pb-12">
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/dashboard/resources/meal-plans/grocery-list"
                className="group rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-5 transition hover:border-[#CBA9A2]"
              >
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  NEXT STEP
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">
                      Grocery List
                    </h3>

                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      shop once. make the
                      week easier. ♡
                    </p>
                  </div>

                  <span className="font-serif text-2xl text-[#A77B73] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/dashboard/resources/meal-plans/meal-prep"
                className="group rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-5 transition hover:border-[#CBA9A2]"
              >
                <p className="text-[7px] tracking-[0.24em] text-[#9D6F67]">
                  MAKE IT EASIER
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">
                      Meal Prep
                    </h3>

                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      prep what helps.
                      leave room for life.
                      ♡
                    </p>
                  </div>

                  <span className="font-serif text-2xl text-[#A77B73] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* NUTRITION NOTE */}

          <section className="mx-auto max-w-6xl border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-[9px] leading-5 text-[#927D76]">
              Nutrition note: Meal
              plans, calorie targets and
              macro estimates are general
              planning tools, not
              individualized medical or
              nutrition prescriptions.
              Needs vary by person,
              activity, health needs and
              goals. Adjust portions and
              food choices based on your
              own needs.
            </p>
          </section>

          {/* END */}

          <section className="mx-auto max-w-6xl pb-14 pt-5 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              make the plan fit your
              life. ♡
            </p>
          </section>
        </section>
      </div>

      {/* MEAL PICKER */}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211C19]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isSavingMeal &&
              !isSavingCustomMeal
            ) {
              closeMealPicker();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-[#F7F1ED] px-5 pb-7 pt-7 shadow-2xl sm:rounded-[2rem] sm:px-7 sm:pb-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                  {pickerSlot}
                </p>

                <h2 className="mt-2 font-serif text-3xl leading-tight">
                  {selectedPickerDay
                    ? selectedPickerDay.dayLabel
                    : "Choose a meal"}
                  <span className="italic text-[#A77B73]">
                    . ♡
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeMealPicker
                }
                disabled={
                  isSavingMeal ||
                  isSavingCustomMeal
                }
                aria-label="Close meal picker"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] text-lg text-[#9D6F67] transition hover:bg-[#EAD8D3] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* SEARCH */}

            <div className="mt-6">
              <label
                htmlFor="recipe-search"
                className="text-[7px] tracking-[0.2em] text-[#9D6F67]"
              >
                FIND A RECIPE
              </label>

              <input
                id="recipe-search"
                type="text"
                value={recipeSearch}
                onChange={(event) =>
                  setRecipeSearch(
                    event.target.value
                  )
                }
                placeholder="Search recipes..."
                className="mt-2 w-full rounded-xl border border-[#D6C3BD] bg-[#FBF8F6] px-4 py-3.5 text-[16px] outline-none transition placeholder:text-[#AA9690] focus:border-[#A77B73]"
              />
            </div>

            {/* RECIPES */}

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                  RECIPE LIBRARY
                </p>

                <Link
                  href="/dashboard/resources/recipes"
                  className="text-[6px] tracking-[0.14em] text-[#A77B73]"
                >
                  VIEW ALL →
                </Link>
              </div>

              <div className="mt-3 max-h-[300px] divide-y divide-[#E8DDD9] overflow-y-auto rounded-2xl border border-[#DED0CB] bg-[#FBF8F6]">
                {filteredRecipes.length >
                0 ? (
                  filteredRecipes.map(
                    (recipe) => (
                      <button
                        key={
                          recipe.id
                        }
                        type="button"
                        onClick={() =>
                          saveRecipeToPlanner(
                            recipe
                          )
                        }
                        disabled={
                          isSavingMeal ||
                          isSavingCustomMeal
                        }
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#F4ECE8] disabled:opacity-50"
                      >
                        <div>
                          <p className="text-[6px] tracking-[0.15em] text-[#9D6F67]">
                            {
                              recipe.category
                            }
                          </p>

                          <p className="mt-1 font-serif text-lg">
                            {
                              recipe.title
                            }
                          </p>
                        </div>

                        <span className="font-serif text-xl text-[#A77B73]">
                          +
                        </span>
                      </button>
                    )
                  )
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="font-serif text-lg italic text-[#A77B73]">
                      no recipes found.
                      ♡
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SAVED CUSTOM MEALS */}

            {customMeals.length >
              0 && (
              <div className="mt-6">
                <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                  YOUR SAVED MEALS
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {customMeals
                    .slice(0, 8)
                    .map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() =>
                          saveExistingCustomMeal(
                            meal
                          )
                        }
                        disabled={
                          isSavingMeal ||
                          isSavingCustomMeal
                        }
                        className="rounded-full border border-[#CBA9A2] bg-[#FBF8F6] px-4 py-2.5 text-[7px] tracking-[0.1em] text-[#806E68] transition hover:bg-[#EAD8D3] disabled:opacity-50"
                      >
                        {meal.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* CUSTOM MEAL */}

            <div className="mt-7 border-t border-[#DED0CB] pt-6">
              <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                OR ADD YOUR OWN
              </p>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                not everything needs a
                recipe. ♡
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={
                    customMealName
                  }
                  onChange={(event) =>
                    setCustomMealName(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      createAndUseCustomMeal();
                    }
                  }}
                  placeholder="e.g. Mom's chicken + rice"
                  className="min-w-0 flex-1 rounded-xl border border-[#D6C3BD] bg-[#FBF8F6] px-4 py-3.5 text-[16px] outline-none transition placeholder:text-[#AA9690] focus:border-[#A77B73]"
                />

                <button
                  type="button"
                  onClick={
                    createAndUseCustomMeal
                  }
                  disabled={
                    !customMealName.trim() ||
                    isSavingMeal ||
                    isSavingCustomMeal
                  }
                  className="rounded-xl bg-[#211C19] px-5 py-3.5 text-[7px] tracking-[0.18em] text-[#F7F1ED] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                >
                  {isSavingCustomMeal
                    ? "ADDING..."
                    : "ADD TO DAY →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}