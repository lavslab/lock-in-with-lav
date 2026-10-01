"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  meal: string;
  goals: string[];
  calories: number;
  protein: number;
  carbs: number;
  time: string;
};

type PlannerSelections = Record<string, Recipe>;

type ActiveSlot = {
  day: string;
  slot: MealSlot;
} | null;

type SavedMealRow = {
  day: string;
  meal_slot: MealSlot;
  recipe_id: string;
};

const quickStarts = [
  {
    title: "BALANCED WEEK",
    subtitle: "simple. balanced. repeatable.",
    tag: "START HERE",
    href: "/dashboard/resources/meal-plans/balanced-week",
  },
  {
    title: "TRAINING WEEK",
    subtitle: "fuel the work.",
    tag: "TRAIN",
    href: "/dashboard/resources/meal-plans/training-week",
  },
  {
    title: "LIGHTER WEEK",
    subtitle: "keep it light, not restrictive.",
    tag: "LIGHT",
    href: "/dashboard/resources/meal-plans/lighter-week",
  },
];

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const mealSlots: MealSlot[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const recipes: Recipe[] = [
  {
    id: "protein-pancakes",
    title: "Protein Pancakes",
    subtitle: "soft, sweet + actually filling.",
    meal: "Breakfast",
    goals: ["High Protein", "Post-Workout"],
    calories: 360,
    protein: 34,
    carbs: 39,
    time: "15 MIN",
  },
  {
    id: "breakfast-wrap",
    title: "High-Protein Breakfast Wrap",
    subtitle: "the breakfast that keeps up.",
    meal: "Breakfast",
    goals: ["High Protein", "Quick"],
    calories: 390,
    protein: 36,
    carbs: 30,
    time: "10 MIN",
  },
  {
    id: "greek-yogurt-crunch-bowl",
    title: "Greek Yogurt Crunch Bowl",
    subtitle: "sweet, cold + protein packed.",
    meal: "Breakfast",
    goals: ["High Protein", "Quick"],
    calories: 330,
    protein: 32,
    carbs: 35,
    time: "5 MIN",
  },
  {
    id: "chicken-taco-bowl",
    title: "Chicken Taco Bowl",
    subtitle: "big bowl. balanced macros.",
    meal: "Lunch",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],
    calories: 480,
    protein: 46,
    carbs: 48,
    time: "25 MIN",
  },
  {
    id: "turkey-burger-bowl",
    title: "Turkey Burger Bowl",
    subtitle: "burger night, locked-in edition.",
    meal: "Lunch",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],
    calories: 420,
    protein: 43,
    carbs: 25,
    time: "20 MIN",
  },
  {
    id: "creamy-chicken-protein-pasta",
    title: "Creamy Chicken Protein Pasta",
    subtitle: "yes, pasta still fits. ♡",
    meal: "Dinner",
    goals: ["High Protein", "Post-Workout"],
    calories: 520,
    protein: 48,
    carbs: 55,
    time: "30 MIN",
  },
  {
    id: "salmon-power-bowl",
    title: "Salmon Power Bowl",
    subtitle: "colourful, balanced + satisfying.",
    meal: "Dinner",
    goals: ["High Protein", "Meal Prep"],
    calories: 510,
    protein: 39,
    carbs: 43,
    time: "25 MIN",
  },
  {
    id: "loaded-chicken-potato",
    title: "Loaded Chicken Potato",
    subtitle: "comfort food with a protein goal.",
    meal: "Dinner",
    goals: ["High Protein", "Post-Workout"],
    calories: 490,
    protein: 45,
    carbs: 52,
    time: "30 MIN",
  },
  {
    id: "protein-snack-box",
    title: "Protein Snack Box",
    subtitle: "snacky, but make it useful.",
    meal: "Snacks",
    goals: ["High Protein", "Lower Carb", "Quick"],
    calories: 260,
    protein: 28,
    carbs: 18,
    time: "5 MIN",
  },
  {
    id: "strawberry-protein-smoothie",
    title: "Strawberry Protein Smoothie",
    subtitle: "cold, creamy + done in five.",
    meal: "Shakes",
    goals: ["High Protein", "Quick", "Post-Workout"],
    calories: 300,
    protein: 35,
    carbs: 32,
    time: "5 MIN",
  },
  {
    id: "ground-turkey-sweet-potato-bowl",
    title: "Ground Turkey Sweet Potato Bowl",
    subtitle: "protein-packed comfort. ♡",
    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],
    calories: 450,
    protein: 40,
    carbs: 42,
    time: "25 MIN",
  },
  {
    id: "turkey-stuffed-peppers",
    title: "Turkey Stuffed Bell Peppers",
    subtitle: "simple, filling + balanced.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],
    calories: 410,
    protein: 38,
    carbs: 28,
    time: "35 MIN",
  },
  {
    id: "turkey-quesadillas",
    title: "Ground Turkey Quesadillas",
    subtitle: "healthy-ish never has to be boring.",
    meal: "Lunch",
    goals: ["High Protein", "Quick"],
    calories: 440,
    protein: 38,
    carbs: 36,
    time: "20 MIN",
  },
  {
    id: "lemon-garlic-shrimp",
    title: "Lemon Garlic Shrimp + Zucchini",
    subtitle: "light, fresh + full of flavour.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Quick"],
    calories: 330,
    protein: 34,
    carbs: 16,
    time: "20 MIN",
  },
  {
    id: "salmon-roasted-veggies",
    title: "Salmon + Roasted Veggies",
    subtitle: "good fats. good fuel.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],
    calories: 470,
    protein: 38,
    carbs: 24,
    time: "30 MIN",
  },
  {
    id: "honey-soy-chicken-bowl",
    title: "Honey Soy Chicken Veggie Bowl",
    subtitle: "your bowl, your way. ♡",
    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],
    calories: 490,
    protein: 44,
    carbs: 50,
    time: "30 MIN",
  },
  {
    id: "black-bean-corn-tacos",
    title: "Black Bean + Corn Tacos",
    subtitle: "meatless but still satisfying.",
    meal: "Lunch",
    goals: ["Meal Prep", "Quick"],
    calories: 390,
    protein: 20,
    carbs: 55,
    time: "20 MIN",
  },
  {
    id: "black-bean-taquitos",
    title: "Crispy Black Bean Taquitos",
    subtitle: "crispy. easy. so good.",
    meal: "Dinner",
    goals: ["Meal Prep"],
    calories: 410,
    protein: 21,
    carbs: 52,
    time: "30 MIN",
  },
];

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M3.5 5h2l1.8 9.2h9.8l2-6.2H7" />
      <circle cx="9" cy="18.5" r="1.2" />
      <circle cx="17" cy="18.5" r="1.2" />
    </svg>
  );
}

function PrepIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="5" y="4" width="14" height="16" rx="2.5" />
      <path d="M9 4V2.8h6V4" />
      <path d="m8.5 10 1.5 1.5 3-3" />
      <path d="M8.5 15h7" />
    </svg>
  );
}

function getSlotKey(day: string, slot: MealSlot) {
  return `${day}-${slot}`;
}

function createCustomMealId(title: string) {
  return `custom-meal:${encodeURIComponent(title.trim())}`;
}

function recipeFromSavedId(
  recipeId: string,
  slot: MealSlot
): Recipe | null {
  if (!recipeId.startsWith("custom-meal:")) {
    return recipes.find((item) => item.id === recipeId) ?? null;
  }

  try {
    const title = decodeURIComponent(
      recipeId.slice("custom-meal:".length)
    );

    if (!title) {
      return null;
    }

    const meal =
      slot === "BREAKFAST"
        ? "Breakfast"
        : slot === "LUNCH"
          ? "Lunch"
          : slot === "DINNER"
            ? "Dinner"
            : "Snacks";

    return {
      id: recipeId,
      title,
      subtitle: "your own meal. ♡",
      meal,
      goals: ["Custom"],
      calories: 0,
      protein: 0,
      carbs: 0,
      time: "CUSTOM",
    };
  } catch {
    return null;
  }
}

function recipeMatchesSlot(
  recipe: Recipe,
  slot: MealSlot
) {
  if (slot === "BREAKFAST") {
    return recipe.meal === "Breakfast";
  }

  if (slot === "LUNCH") {
    return recipe.meal === "Lunch";
  }

  if (slot === "DINNER") {
    return recipe.meal === "Dinner";
  }

  return (
    recipe.meal === "Snacks" ||
    recipe.meal === "Shakes"
  );
}

export default function MealPlansPage() {
  const [firstName, setFirstName] =
    useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [plannerSelections, setPlannerSelections] =
    useState<PlannerSelections>({});

  const [activeSlot, setActiveSlot] =
    useState<ActiveSlot>(null);

  const [recipeSearch, setRecipeSearch] =
    useState("");

  const [showAllRecipes, setShowAllRecipes] =
    useState(false);

  const [showCustomMealForm, setShowCustomMealForm] =
    useState(false);

  const [customMealName, setCustomMealName] =
    useState("");

  const [isSavingCustomMeal, setIsSavingCustomMeal] =
    useState(false);

  useEffect(() => {
    const getUserAndMeals = async () => {
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

      const { data: savedMeals, error } =
        await supabase
          .from("meal_plan_selections")
          .select("day, meal_slot, recipe_id")
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "Error loading meal plan:",
          error
        );
      } else if (savedMeals) {
        const restoredSelections: PlannerSelections =
          {};

        (
          savedMeals as SavedMealRow[]
        ).forEach((savedMeal) => {
          const recipe = recipeFromSavedId(
            savedMeal.recipe_id,
            savedMeal.meal_slot
          );

          if (!recipe) {
            return;
          }

          const key = getSlotKey(
            savedMeal.day,
            savedMeal.meal_slot
          );

          restoredSelections[key] = recipe;
        });

        setPlannerSelections(
          restoredSelections
        );
      }

      setIsLoadingUser(false);
    };

    getUserAndMeals();
  }, []);

  useEffect(() => {
    if (!activeSlot) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeSlot]);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const filteredRecipes = useMemo(() => {
    if (!activeSlot) {
      return [];
    }

    const searchTerm =
      recipeSearch.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesSlot =
        showAllRecipes ||
        recipeMatchesSlot(
          recipe,
          activeSlot.slot
        );

      const searchableText = [
        recipe.title,
        recipe.subtitle,
        recipe.meal,
        ...recipe.goals,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        searchableText.includes(searchTerm);

      return matchesSlot && matchesSearch;
    });
  }, [
    activeSlot,
    recipeSearch,
    showAllRecipes,
  ]);

  const openMealPicker = (
    day: string,
    slot: MealSlot
  ) => {
    setActiveSlot({ day, slot });
    setRecipeSearch("");
    setShowAllRecipes(false);
    setShowCustomMealForm(false);
    setCustomMealName("");
  };

  const closeMealPicker = () => {
    setActiveSlot(null);
    setRecipeSearch("");
    setShowAllRecipes(false);
    setShowCustomMealForm(false);
    setCustomMealName("");
  };

  const openCustomMealForm = () => {
    setRecipeSearch("");
    setShowAllRecipes(false);
    setShowCustomMealForm(true);
    setCustomMealName("");
  };

  const cancelCustomMeal = () => {
    setShowCustomMealForm(false);
    setCustomMealName("");
  };

  const chooseRecipe = async (
    recipe: Recipe
  ) => {
    if (!activeSlot) {
      return;
    }

    const slotToSave = activeSlot;

    const key = getSlotKey(
      slotToSave.day,
      slotToSave.slot
    );

    const previousRecipe =
      plannerSelections[key];

    setPlannerSelections((current) => ({
      ...current,
      [key]: recipe,
    }));

    closeMealPicker();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(
        "No signed-in user found."
      );

      setPlannerSelections((current) => {
        const next = { ...current };

        if (previousRecipe) {
          next[key] = previousRecipe;
        } else {
          delete next[key];
        }

        return next;
      });

      return;
    }

    const { error } = await supabase
      .from("meal_plan_selections")
      .upsert(
        {
          user_id: user.id,
          day: slotToSave.day,
          meal_slot: slotToSave.slot,
          recipe_id: recipe.id,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,day,meal_slot",
        }
      );

    if (error) {
      console.error(
        "Error saving meal:",
        error
      );

      setPlannerSelections((current) => {
        const next = { ...current };

        if (previousRecipe) {
          next[key] = previousRecipe;
        } else {
          delete next[key];
        }

        return next;
      });
    }
  };

  const saveCustomMeal = async () => {
    if (
      !activeSlot ||
      !customMealName.trim() ||
      isSavingCustomMeal
    ) {
      return;
    }

    setIsSavingCustomMeal(true);

    const slotToSave = activeSlot;
    const title = customMealName.trim();

    const customRecipe: Recipe = {
      id: createCustomMealId(title),
      title,
      subtitle: "your own meal. ♡",
      meal:
        slotToSave.slot === "BREAKFAST"
          ? "Breakfast"
          : slotToSave.slot === "LUNCH"
            ? "Lunch"
            : slotToSave.slot === "DINNER"
              ? "Dinner"
              : "Snacks",
      goals: ["Custom"],
      calories: 0,
      protein: 0,
      carbs: 0,
      time: "CUSTOM",
    };

    const key = getSlotKey(
      slotToSave.day,
      slotToSave.slot
    );

    const previousRecipe =
      plannerSelections[key];

    setPlannerSelections((current) => ({
      ...current,
      [key]: customRecipe,
    }));

    closeMealPicker();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(
        "No signed-in user found."
      );

      setPlannerSelections((current) => {
        const next = { ...current };

        if (previousRecipe) {
          next[key] = previousRecipe;
        } else {
          delete next[key];
        }

        return next;
      });

      setIsSavingCustomMeal(false);
      return;
    }

    const { error } = await supabase
      .from("meal_plan_selections")
      .upsert(
        {
          user_id: user.id,
          day: slotToSave.day,
          meal_slot: slotToSave.slot,
          recipe_id: customRecipe.id,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,day,meal_slot",
        }
      );

    if (error) {
      console.error(
        "Error saving custom meal:",
        error
      );

      setPlannerSelections((current) => {
        const next = { ...current };

        if (previousRecipe) {
          next[key] = previousRecipe;
        } else {
          delete next[key];
        }

        return next;
      });
    }

    setIsSavingCustomMeal(false);
  };

  const removeRecipe = async (
    day: string,
    slot: MealSlot
  ) => {
    const key = getSlotKey(day, slot);

    const previousRecipe =
      plannerSelections[key];

    if (!previousRecipe) {
      return;
    }

    setPlannerSelections((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(
        "No signed-in user found."
      );

      setPlannerSelections((current) => ({
        ...current,
        [key]: previousRecipe,
      }));

      return;
    }

    const { error } = await supabase
      .from("meal_plan_selections")
      .delete()
      .eq("user_id", user.id)
      .eq("day", day)
      .eq("meal_slot", slot);

    if (error) {
      console.error(
        "Error removing meal:",
        error
      );

      setPlannerSelections((current) => ({
        ...current,
        [key]: previousRecipe,
      }));
    }
  };

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
                plan it once. make the week easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          {/* INTRO */}

          <section className="pb-8 pt-12 md:pt-14">
            <div className="max-w-4xl">
              <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                MEAL PLANNER
              </p>

              <h1 className="mt-4 font-serif text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                Build your{" "}
                <span className="italic text-[#A77B73]">
                  week.
                </span>
              </h1>

              <p className="mt-4 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                what are we eating? ♡
              </p>

              <p className="mt-5 max-w-xl text-sm leading-6 text-[#806E68]">
                Pick your meals, organize your
                week and turn the plan into one
                simple shopping list.
              </p>
            </div>
          </section>

          {/* QUICK START */}

          <section className="pb-10">
            <div className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-5 md:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    QUICK START
                  </p>

                  <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                    pick a plan. ♡
                  </p>
                </div>

                <Link
                  href="/dashboard/resources/recipes"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-[#211C19] px-5 py-3 text-[7px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  BROWSE ALL RECIPES
                  <span>→</span>
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {quickStarts.map((plan) => (
                  <Link
                    key={plan.title}
                    href={plan.href}
                    className="group rounded-2xl border border-[#DED0CB] bg-[#F7F1ED] p-4 transition hover:border-[#CBA9A2] hover:bg-[#F3E9E5]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[8px] tracking-[0.2em] text-[#211C19]">
                        {plan.title}
                      </p>

                      <span className="rounded-full border border-[#D6C3BD] px-2.5 py-1 text-[6px] tracking-[0.14em] text-[#8F655E]">
                        {plan.tag}
                      </span>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="font-serif text-lg italic text-[#A77B73]">
                        {plan.subtitle}
                      </p>

                      <span className="font-serif text-lg text-[#A77B73] transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* WEEKLY PLANNER */}

          <section className="pb-12">
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
            </div>

            <div className="mt-7 space-y-3">
              {days.map((day, dayIndex) => (
                <div
                  key={day}
                  className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]"
                >
                  <div className="flex items-center gap-4 border-b border-[#E1D3CE] px-5 py-4 md:px-6">
                    <span className="font-serif text-xl text-[#C6A29A]">
                      {String(dayIndex + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                      {day}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                    {mealSlots.map(
                      (slot, slotIndex) => {
                        const key = getSlotKey(
                          day,
                          slot
                        );

                        const selectedRecipe =
                          plannerSelections[key];

                        return (
                          <div
                            key={slot}
                            className={`p-5 ${
                              slotIndex > 0
                                ? "border-t border-[#E1D3CE] sm:border-l sm:border-t-0"
                                : ""
                            } ${
                              slotIndex === 2
                                ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0"
                                : ""
                            } ${
                              slotIndex === 3
                                ? "sm:border-t xl:border-t-0"
                                : ""
                            }`}
                          >
                            <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                              {slot}
                            </p>

                            {selectedRecipe ? (
                              <div className="mt-4 min-h-[112px] rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] p-4">
                                <p className="font-serif text-lg leading-tight text-[#211C19]">
                                  {selectedRecipe.title}
                                </p>

                                {selectedRecipe.id.startsWith(
                                  "custom-meal:"
                                ) ? (
                                  <p className="mt-2 text-[7px] tracking-[0.12em] text-[#806E68]">
                                    PERSONAL MEAL •
                                    ADDED BY YOU
                                  </p>
                                ) : (
                                  <p className="mt-2 text-[7px] tracking-[0.12em] text-[#806E68]">
                                    {
                                      selectedRecipe.calories
                                    }{" "}
                                    CAL •{" "}
                                    {
                                      selectedRecipe.protein
                                    }
                                    G PROTEIN
                                  </p>
                                )}

                                <div className="mt-4 flex items-center gap-4 border-t border-[#E1D3CE] pt-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openMealPicker(
                                        day,
                                        slot
                                      )
                                    }
                                    className="text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                                  >
                                    CHANGE
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeRecipe(
                                        day,
                                        slot
                                      )
                                    }
                                    className="text-[7px] tracking-[0.18em] text-[#A18A83] transition hover:text-[#211C19]"
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
                                    day,
                                    slot
                                  )
                                }
                                className="group mt-4 flex min-h-[74px] w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3 text-left transition hover:border-[#A77B73] hover:bg-[#F3E9E5]"
                              >
                                <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                                  ADD MEAL
                                </span>

                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAD8D3] text-[#8F655E] transition group-hover:bg-[#DFC4BD]">
                                  <PlusIcon />
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-[8px] leading-5 tracking-[0.12em] text-[#A18A83]">
              PICK FROM THE RECIPE LIBRARY •
              MIX + MATCH • REPEAT MEALS IF YOU
              WANT
            </p>
          </section>

          {/* SHOPPING LIST */}

          <section className="border-t border-[#DED0CB] py-12">
            <div>
              <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                YOUR SHOPPING LIST
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Everything for the week,{" "}
                <span className="italic text-[#A77B73]">
                  in one place. ♡
                </span>
              </h2>
            </div>

            <Link
              href="/dashboard/resources/meal-plans/grocery-list"
              className="group mt-7 block rounded-[1.75rem] bg-[#E9D2CC] p-6 transition duration-300 hover:-translate-y-1 md:p-7"
            >
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F1ED]/65 text-[#8F655E]">
                    <CartIcon />
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl">
                      Build your{" "}
                      <span className="italic text-[#A77B73]">
                        list. ♡
                      </span>
                    </h3>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#725F5A]">
                      Add what you need and check
                      things off as you shop.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#211C19] px-6 py-3.5 text-[8px] tracking-[0.18em] text-[#F7F1ED] transition group-hover:gap-5">
                  OPEN SHOPPING LIST

                  <span className="font-serif text-base">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </section>

          {/* MEAL PREP */}

          <section className="pb-10">
            <Link
              href="/dashboard/resources/meal-plans/meal-prep"
              className="group flex flex-col justify-between gap-6 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition hover:border-[#CBA9A2] md:flex-row md:items-center md:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAD8D3] text-[#9D6F67]">
                  <PrepIcon />
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    MEAL PREP GUIDE
                  </p>

                  <h3 className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                    prep a little. stress less. ♡
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#725F5A]">
                    A simple approach to getting
                    ahead without spending your
                    entire Sunday in the kitchen.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit shrink-0 items-center gap-3 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                OPEN GUIDE

                <span className="font-serif text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </section>

          {/* NOTE */}

          <section className="border-t border-[#DED0CB] py-7">
            <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
              A QUICK NOTE
            </p>

            <p className="mt-3 max-w-4xl text-xs leading-6 text-[#806E68]">
              Meal plans are examples, not
              individualized nutrition
              prescriptions. Energy and nutrition
              needs vary by person, activity, health
              needs and goals. Use the plans as a
              flexible framework and adjust portions
              or ingredients as needed.
            </p>
          </section>

          {/* END */}

          <section className="border-t border-[#DED0CB] py-12 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              plan it. shop it. make the week
              easier. ♡
            </p>
          </section>
        </section>
      </div>

      {/* RECIPE PICKER */}

      {activeSlot && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211C19]/45 p-0 backdrop-blur-[2px] md:items-center md:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeMealPicker();
            }
          }}
        >
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-[#F7F1ED] shadow-2xl md:rounded-[2rem]">
            {/* PICKER HEADER */}

            <div className="flex items-start justify-between gap-5 border-b border-[#DED0CB] px-6 py-6 md:px-8">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  {activeSlot.day} •{" "}
                  {activeSlot.slot}
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Pick your{" "}
                  <span className="italic text-[#A77B73]">
                    meal. ♡
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMealPicker}
                aria-label="Close recipe picker"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] text-[#9D6F67] transition hover:bg-[#EAD8D3]"
              >
                <CloseIcon />
              </button>
            </div>

            {showCustomMealForm ? (
              <div className="overflow-y-auto px-6 py-8 md:px-8">
                <div className="mx-auto max-w-xl rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
                  <button
                    type="button"
                    onClick={cancelCustomMeal}
                    className="text-[7px] tracking-[0.2em] text-[#9D6F67] transition hover:text-[#211C19]"
                  >
                    ← BACK TO RECIPES
                  </button>

                  <p className="mt-6 text-[8px] tracking-[0.35em] text-[#9D6F67]">
                    ADD YOUR OWN
                  </p>

                  <h3 className="mt-3 font-serif text-3xl">
                    Make it{" "}
                    <span className="italic text-[#A77B73]">
                      yours. ♡
                    </span>
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#806E68]">
                    Add a meal that is not in the
                    recipe library. It will be saved
                    to this spot in your meal plan.
                  </p>

                  <label className="mt-7 block">
                    <span className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                      MEAL NAME
                    </span>

                    <input
                      type="text"
                      value={customMealName}
                      onChange={(event) =>
                        setCustomMealName(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          event.preventDefault();
                          void saveCustomMeal();
                        }
                      }}
                      placeholder="e.g. Chicken Caesar Wrap"
                      autoFocus
                      maxLength={80}
                      className="mt-2 w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3.5 text-sm text-[#211C19] outline-none transition placeholder:text-[#A18A83] focus:border-[#A77B73]"
                    />
                  </label>

                  <p className="mt-3 text-[7px] tracking-[0.08em] text-[#A18A83]">
                    {activeSlot.day} •{" "}
                    {activeSlot.slot}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void saveCustomMeal()
                    }
                    disabled={
                      !customMealName.trim() ||
                      isSavingCustomMeal
                    }
                    className="mt-7 flex w-full items-center justify-center rounded-full bg-[#211C19] px-6 py-4 text-[8px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSavingCustomMeal
                      ? "SAVING..."
                      : "ADD TO MEAL PLAN"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-[#DED0CB] px-6 py-5 md:px-8">
                  <button
                    type="button"
                    onClick={openCustomMealForm}
                    className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[#CBA9A2] bg-[#EAD8D3] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-[#DFC4BD]"
                  >
                    <span>
                      <span className="block text-[7px] tracking-[0.2em] text-[#9D6F67]">
                        WANT SOMETHING ELSE?
                      </span>

                      <span className="mt-1 block font-serif text-xl text-[#211C19]">
                        Add your own meal
                      </span>

                      <span className="mt-1 block text-xs text-[#806E68]">
                        Create a meal that is not in
                        the recipe library.
                      </span>
                    </span>

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F1ED] text-[#8F655E]">
                      <PlusIcon />
                    </span>
                  </button>
                </div>

                {/* SEARCH + FILTER */}

                <div className="border-b border-[#DED0CB] px-6 py-5 md:px-8">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A77B73]">
                      <SearchIcon />
                    </span>

                    <input
                      type="search"
                      value={recipeSearch}
                      onChange={(event) =>
                        setRecipeSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search recipes..."
                      autoFocus
                      className="w-full rounded-2xl border border-[#D6C3BD] bg-[#FBF8F6] py-3.5 pl-11 pr-4 text-sm text-[#211C19] outline-none transition placeholder:text-[#A18A83] focus:border-[#A77B73]"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAllRecipes(false)
                      }
                      className={`rounded-full border px-4 py-2 text-[7px] tracking-[0.16em] transition ${
                        !showAllRecipes
                          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68]"
                      }`}
                    >
                      {activeSlot.slot ===
                      "SNACK"
                        ? "SNACKS + SHAKES"
                        : `${activeSlot.slot} IDEAS`}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAllRecipes(true)
                      }
                      className={`rounded-full border px-4 py-2 text-[7px] tracking-[0.16em] transition ${
                        showAllRecipes
                          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68]"
                      }`}
                    >
                      ALL RECIPES
                    </button>
                  </div>
                </div>

                {/* RECIPE RESULTS */}

                <div className="overflow-y-auto px-6 py-6 md:px-8">
                  {filteredRecipes.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {filteredRecipes.map(
                        (recipe) => {
                          const currentKey =
                            getSlotKey(
                              activeSlot.day,
                              activeSlot.slot
                            );

                          const isSelected =
                            plannerSelections[
                              currentKey
                            ]?.id === recipe.id;

                          return (
                            <button
                              key={recipe.id}
                              type="button"
                              onClick={() =>
                                chooseRecipe(
                                  recipe
                                )
                              }
                              className={`group rounded-[1.5rem] border p-5 text-left transition ${
                                isSelected
                                  ? "border-[#A77B73] bg-[#EAD8D3]"
                                  : "border-[#DED0CB] bg-[#FBF8F6] hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-[7px] tracking-[0.2em] text-[#9D6F67]">
                                    {recipe.meal.toUpperCase()}
                                  </p>

                                  <h3 className="mt-2 font-serif text-xl leading-tight text-[#211C19]">
                                    {recipe.title}
                                  </h3>

                                  <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                                    {recipe.subtitle}
                                  </p>
                                </div>

                                {isSelected && (
                                  <span className="rounded-full bg-[#211C19] px-3 py-1.5 text-[6px] tracking-[0.14em] text-[#F7F1ED]">
                                    SELECTED
                                  </span>
                                )}
                              </div>

                              <div className="mt-5 flex flex-wrap gap-2">
                                {recipe.goals.map(
                                  (goal) => (
                                    <span
                                      key={goal}
                                      className="rounded-full bg-[#EAD8D3]/65 px-2.5 py-1.5 text-[6px] tracking-[0.12em] text-[#806E68]"
                                    >
                                      {goal.toUpperCase()}
                                    </span>
                                  )
                                )}
                              </div>

                              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#E1D3CE] pt-4 text-[7px] tracking-[0.12em] text-[#806E68]">
                                <span>
                                  {recipe.calories} CAL
                                </span>

                                <span>
                                  {recipe.protein}G
                                  PROTEIN
                                </span>

                                <span>
                                  {recipe.carbs}G
                                  CARBS
                                </span>

                                <span>
                                  {recipe.time}
                                </span>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="py-14 text-center">
                      <p className="font-serif text-2xl italic text-[#A77B73]">
                        no recipes found. ♡
                      </p>

                      <p className="mt-3 text-sm text-[#806E68]">
                        Try another search or
                        view all recipes.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setRecipeSearch("");
                          setShowAllRecipes(
                            true
                          );
                        }}
                        className="mt-5 rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.18em] text-[#806E68] transition hover:bg-[#EAD8D3]"
                      >
                        SHOW ALL RECIPES
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}