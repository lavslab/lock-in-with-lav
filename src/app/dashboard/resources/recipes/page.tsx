
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";
import { recipes as sharedRecipes } from "@/lib/recipes";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

type PlannerDay = {
  date: string;
  weekday: string;
  monthDay: string;
};

type Recipe = (typeof sharedRecipes)[number];

const mealTypes = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Shakes",
];

const goalTypes = [
  "All",
  "High Protein",
  "Lower Carb",
  "Quick",
  "Meal Prep",
  "Post-Workout",
];

function formatDateForStorage(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseStorageDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value: string, amount: number) {
  const date = parseStorageDate(value);
  date.setDate(date.getDate() + amount);
  return formatDateForStorage(date);
}

function buildPlannerWeek(startDate: string): PlannerDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDate, index);
    const parsed = parseStorageDate(date);

    return {
      date,
      weekday: parsed
        .toLocaleDateString("en-CA", { weekday: "short" })
        .toUpperCase(),
      monthDay: parsed
        .toLocaleDateString("en-CA", {
          month: "short",
          day: "numeric",
        })
        .toUpperCase(),
    };
  });
}

function getDefaultMealSlot(recipe: Recipe): MealSlot {
  if (recipe.meal === "Breakfast") return "BREAKFAST";
  if (recipe.meal === "Lunch") return "LUNCH";

  if (recipe.meal === "Snacks" || recipe.meal === "Shakes") {
    return "SNACK";
  }

  return "DINNER";
}

function formatSavedMealLabel(date: string, slot: MealSlot) {
  const dayName = parseStorageDate(date).toLocaleDateString(
    "en-CA",
    { weekday: "long" }
  );

  return `${dayName}'s ${slot.toLowerCase()}`;
}

function SearchIcon() {
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
      <circle cx="10.8" cy="10.8" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function RecipesPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // SEARCH + FILTERS
  const [search, setSearch] = useState("");
  const [meal, setMeal] = useState("All");
  const [goal, setGoal] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

  // FAVORITES
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<
    string[]
  >([]);
  const [savingFavoriteId, setSavingFavoriteId] = useState<
    string | null
  >(null);

  // EXPANDED RECIPE
  const [expandedRecipeId, setExpandedRecipeId] = useState<
    string | null
  >(null);

  // MEAL PLANNER
  const [weekStartDate, setWeekStartDate] = useState(
    formatDateForStorage(new Date())
  );

  const [plannerRecipe, setPlannerRecipe] =
    useState<Recipe | null>(null);

  const [selectedPlanDate, setSelectedPlanDate] = useState("");
  const [selectedMealSlot, setSelectedMealSlot] =
    useState<MealSlot>("DINNER");

  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [plannerMessage, setPlannerMessage] = useState("");
  const [plannerError, setPlannerError] = useState("");

  const [lastAddedRecipeId, setLastAddedRecipeId] = useState<
    string | null
  >(null);

  const plannerWeek = useMemo(
    () => buildPlannerWeek(weekStartDate),
    [weekStartDate]
  );

  // USER + SAVED FAVORITES
  useEffect(() => {
    let active = true;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      try {
        const savedWeekStart = window.localStorage.getItem(
          `lockInMealPlannerWeekStart:${user.id}`
        );

        if (
          savedWeekStart &&
          /^\d{4}-\d{2}-\d{2}$/.test(savedWeekStart)
        ) {
          setWeekStartDate(savedWeekStart);
        }
      } catch {
        // Keep today's date if storage is unavailable.
      }

      const { data, error } = await supabase
        .from("recipe_favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        console.error("Could not load recipe favorites:", error);
      } else {
        setFavoriteRecipeIds(
          (data ?? []).map((item) => item.recipe_id)
        );
      }

      setIsLoadingUser(false);
    };

    getUser();

    return () => {
      active = false;
    };
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  // FILTERED RECIPES
  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sharedRecipes.filter((recipe) => {
      const mealMatch =
        meal === "All" || recipe.meal === meal;

      const goalMatch =
        goal === "All" || recipe.goals.includes(goal);

      const favoriteMatch =
        !showFavoritesOnly ||
        favoriteRecipeIds.includes(recipe.id);

      const searchableText = [
        recipe.title,
        recipe.subtitle,
        recipe.meal,
        ...recipe.goals,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        term === "" || searchableText.includes(term);

      return (
        mealMatch &&
        goalMatch &&
        favoriteMatch &&
        searchMatch
      );
    });
  }, [
    search,
    meal,
    goal,
    showFavoritesOnly,
    favoriteRecipeIds,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    meal !== "All" ||
    goal !== "All" ||
    showFavoritesOnly;

  const clearFilters = () => {
    setSearch("");
    setMeal("All");
    setGoal("All");
    setShowFavoritesOnly(false);
    setExpandedRecipeId(null);
  };

  // SAVE / REMOVE FAVORITES
  const toggleFavorite = async (recipeId: string) => {
    if (!userId || savingFavoriteId) return;

    const isFavorite = favoriteRecipeIds.includes(recipeId);
    setSavingFavoriteId(recipeId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("recipe_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId);

        if (error) throw error;

        setFavoriteRecipeIds((current) =>
          current.filter((id) => id !== recipeId)
        );
      } else {
        const { error } = await supabase
          .from("recipe_favorites")
          .insert({
            user_id: userId,
            recipe_id: recipeId,
          });

        if (error) throw error;

        setFavoriteRecipeIds((current) =>
          current.includes(recipeId)
            ? current
            : [...current, recipeId]
        );
      }
    } catch (error) {
      console.error("Could not update favorite:", error);
      alert("Couldn't update this favorite. Please try again. ♡");
    } finally {
      setSavingFavoriteId(null);
    }
  };

  // OPEN MEAL PLANNER
  const openMealPlanner = (recipe: Recipe) => {
    let startDate = weekStartDate;

    if (userId) {
      try {
        const savedWeekStart = window.localStorage.getItem(
          `lockInMealPlannerWeekStart:${userId}`
        );

        if (
          savedWeekStart &&
          /^\d{4}-\d{2}-\d{2}$/.test(savedWeekStart)
        ) {
          startDate = savedWeekStart;
          setWeekStartDate(savedWeekStart);
        }
      } catch {
        // Use the currently loaded week.
      }
    }

    setPlannerRecipe(recipe);
    setSelectedPlanDate(startDate);
    setSelectedMealSlot(getDefaultMealSlot(recipe));
    setPlannerMessage("");
    setPlannerError("");
  };

  const closeMealPlanner = () => {
    if (isSavingMeal) return;

    setPlannerRecipe(null);
    setPlannerMessage("");
    setPlannerError("");
  };

  // SAVE RECIPE TO MEAL PLAN
  const saveMealToPlanner = async () => {
    if (
      !userId ||
      !plannerRecipe ||
      !selectedPlanDate ||
      !selectedMealSlot
    ) {
      return;
    }

    setIsSavingMeal(true);
    setPlannerMessage("");
    setPlannerError("");

    try {
      const { error } = await supabase
        .from("meal_plan_selections")
        .upsert(
          {
            user_id: userId,
            day: parseStorageDate(selectedPlanDate)
  .toLocaleDateString("en-US", { weekday: "long" })
  .toUpperCase(),
            plan_date: selectedPlanDate,
            meal_slot: selectedMealSlot,
            recipe_id: plannerRecipe.id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,plan_date,meal_slot",
          }
        );

      if (error) throw error;

      setLastAddedRecipeId(plannerRecipe.id);

      setPlannerMessage(
        `Added to ${formatSavedMealLabel(
          selectedPlanDate,
          selectedMealSlot
        )}. ♡`
      );
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);

      setPlannerError(
        "That meal could not be added just yet. Please try again. ♡"
      );
    } finally {
      setIsSavingMeal(false);
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

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-5xl">

            {/* HEADER */}
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  LOCK IN WITH LAV
                </p>

                <h1 className="mt-3 font-serif text-3xl text-[#211C19] sm:text-4xl">
                  Recipe{" "}
                  <span className="italic text-[#A77B73]">
                    Library. ♡
                  </span>
                </h1>

                <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                  A little inspiration for whatever sounds good.
                </p>
              </div>

        
            </header>

            {/* SEARCH + FILTERS */}
            <section className="mt-9 border-y border-[#DED0CB] py-6">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A77B73]">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search recipes..."
                  aria-label="Search recipes"
                  className="w-full rounded-xl border border-[#DED0CB] bg-[#FBF8F6] py-3.5 pl-11 pr-10 text-xs text-[#211C19] outline-none transition placeholder:text-[#A18A83] focus:border-[#A77B73]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-[#A77B73]"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
                <label className="block min-w-0 sm:w-44">
                  <span className="mb-2 block text-[8px] tracking-[0.2em] text-[#9D6F67]">
                    MEAL TYPE
                  </span>

                  <select
                    value={meal}
                    onChange={(event) =>
                      setMeal(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#DED0CB] bg-[#FBF8F6] px-3 py-3 text-[11px] text-[#6F5D57] outline-none focus:border-[#A77B73]"
                  >
                    {mealTypes.map((option) => (
                      <option key={option} value={option}>
                        {option === "All" ? "All meals" : option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block min-w-0 sm:w-44">
                  <span className="mb-2 block text-[8px] tracking-[0.2em] text-[#9D6F67]">
                    YOUR GOAL
                  </span>

                  <select
                    value={goal}
                    onChange={(event) =>
                      setGoal(event.target.value)
                    }
                    className="w-full rounded-lg border border-[#DED0CB] bg-[#FBF8F6] px-3 py-3 text-[11px] text-[#6F5D57] outline-none focus:border-[#A77B73]"
                  >
                    {goalTypes.map((option) => (
                      <option key={option} value={option}>
                        {option === "All" ? "All goals" : option}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowFavoritesOnly((current) => !current)
                  }
                  aria-pressed={showFavoritesOnly}
                  className={`col-span-2 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[10px] transition sm:col-span-1 ${
                    showFavoritesOnly
                      ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
                      : "border-[#DED0CB] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
                  }`}
                >
                  <span className="text-sm">
                    {showFavoritesOnly ? "♥" : "♡"}
                  </span>
                  My Favorites
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="col-span-2 text-[9px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4 sm:ml-auto sm:self-end sm:pb-3"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            </section>

            {/* RECIPE LIST HEADER */}
            <section className="pb-12 pt-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                    BROWSE RECIPES
                  </p>

                  <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                    Find your{" "}
                    <span className="italic text-[#A77B73]">
                      next meal.
                    </span>
                  </h2>
                </div>

                <p className="font-serif text-sm italic text-[#A77B73]">
                  {filteredRecipes.length}{" "}
                  {filteredRecipes.length === 1
                    ? "recipe"
                    : "recipes"}{" "}
                  ♡
                </p>
              </div>

             
             
{/* EDITORIAL RECIPE GRID */}
{filteredRecipes.length > 0 ? (
  <div className="mt-5 grid grid-cols-2 items-stretch gap-2.5 sm:gap-3 lg:grid-cols-3">
    {filteredRecipes.map((recipe) => {
      const isFavorite = favoriteRecipeIds.includes(recipe.id);

      return (
        <article
          key={recipe.id}
          className="flex min-w-0 flex-col overflow-hidden rounded-[1.1rem] border border-[#E3D5CF] bg-[#FFFCFA] p-3 transition-colors hover:border-[#CBA9A2] sm:p-4"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="min-w-0 text-[7px] uppercase tracking-[0.12em] text-[#9D6F67] sm:text-[8px]">
              {recipe.meal}
            </span>

            <button
              type="button"
              onClick={() => toggleFavorite(recipe.id)}
              disabled={!userId || savingFavoriteId !== null}
              aria-label={
                isFavorite
                  ? `Remove ${recipe.title} from favorites`
                  : `Add ${recipe.title} to favorites`
              }
              aria-pressed={isFavorite}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E8DCD7] text-sm text-[#A77B73] transition hover:bg-[#F1E4DF] disabled:opacity-50"
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>

          <Link
            href={`/dashboard/resources/recipes/${recipe.id}`}
            className="mt-2.5 block min-w-0"
          >
            <h3 className="font-serif text-[16px] leading-[1.18] text-[#211C19] transition-colors hover:text-[#9D6F67] sm:text-[20px]">
              {recipe.title}
            </h3>
          </Link>

          <p className="mt-1.5 line-clamp-2 text-[9px] leading-[1.45] text-[#947D75] sm:text-[10px]">
            {recipe.subtitle}
          </p>

          <div className="mt-auto pt-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#E9DED9] pt-2.5">
              <span className="text-[10px] text-[#806E68]">
                <span className="font-serif text-sm text-[#A77B73]">
                  {recipe.calories}
                </span>{" "}
                cal
              </span>

              <span className="text-[10px] text-[#806E68]">
                <span className="font-serif text-sm text-[#A77B73]">
                  {recipe.protein}g
                </span>{" "}
                protein
              </span>
            </div>

            <p className="mt-2 text-[9px] text-[#806E68]">
              ◷ {recipe.time}
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              <Link
                href={`/dashboard/resources/recipes/${recipe.id}`}
                className="flex min-h-9 items-center justify-center rounded-full bg-[#211C19] px-2 py-2 text-center text-[8px] uppercase tracking-[0.07em] text-[#FFFCFA] transition hover:bg-[#453630]"
              >
                View recipe →
              </Link>

              <button
                type="button"
                disabled={!userId}
                onClick={() => openMealPlanner(recipe)}
                className="flex min-h-9 items-center justify-center rounded-full border border-[#D6BDB5] px-2 py-2 text-center text-[8px] uppercase tracking-[0.05em] text-[#8F655E] transition hover:bg-[#F3E7E2] disabled:opacity-50"
              >
                {lastAddedRecipeId === recipe.id
                  ? "Added ✓"
                  : "+ Use this meal"}
              </button>
            </div>
          </div>
        </article>
      );
    })}
  </div>
) : (
  <div className="mt-6 rounded-[1.5rem] border border-[#DED0CB] bg-[#FFFCFA] px-6 py-12 text-center">
    <p className="font-serif text-2xl italic text-[#A77B73]">
      no recipes found. ♡
    </p>

    <p className="mt-3 text-xs leading-6 text-[#806E68]">
      Try another search or clear your filters.
    </p>

    <button
      type="button"
      onClick={clearFilters}
      className="mt-5 text-[9px] uppercase tracking-[0.15em] text-[#9D6F67] underline underline-offset-4"
    >
      Clear filters
    </button>
  </div>
)}




              {/* MEAL PLAN LINK */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#DED0CB] pt-6">
                <div>
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    Found something you love? ♡
                  </p>
                  <p className="mt-1 text-[10px] text-[#927D76]">
                    Add it to your week or build your meal plan.
                  </p>
                </div>

                <Link
                  href="/dashboard/resources/meal-plans"
                  className="inline-flex items-center gap-2 text-[9px] tracking-[0.12em] text-[#8F655E] transition hover:text-[#211C19]"
                >
                  MAKE A MEAL PLAN
                  <span>→</span>
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* ADD TO MEAL PLAN MODAL */}
      {plannerRecipe && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211C19]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMealPlanner();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meal-planner-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] border border-[#D8C6C0] bg-[#F7F1ED] px-5 pb-7 pt-5 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-8"
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  ADD TO YOUR WEEK
                </p>

                <h2
                  id="meal-planner-title"
                  className="mt-3 font-serif text-3xl leading-tight sm:text-4xl"
                >
                  {plannerRecipe.title}
                </h2>

                <p className="mt-2 font-serif text-base italic text-[#A77B73]">
                  pick the day + where it belongs. ♡
                </p>
              </div>

              <button
                type="button"
                onClick={closeMealPlanner}
                disabled={isSavingMeal}
                aria-label="Close meal planner"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D6C3BD] font-serif text-xl text-[#8F655E] transition hover:bg-[#EAD8D3] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* CHOOSE A DAY */}
            <div className="mt-7 border-t border-[#DED0CB] pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[8px] tracking-[0.28em] text-[#806E68]">
                    1 · CHOOSE A DAY
                  </p>

                  <p className="mt-2 font-serif text-sm italic text-[#A18A83]">
                    your current Build Your Week dates
                  </p>
                </div>

                <Link
                  href="/dashboard/resources/meal-plans"
                  className="text-[8px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4"
                >
                  CHANGE WEEK
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {plannerWeek.map((day) => {
                  const isSelected =
                    selectedPlanDate === day.date;

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => {
                        setSelectedPlanDate(day.date);
                        setPlannerMessage("");
                        setPlannerError("");
                      }}
                      aria-pressed={isSelected}
                      className={`rounded-xl border px-2 py-3 text-center transition ${
                        isSelected
                          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
                      }`}
                    >
                      <span className="block text-[8px] tracking-[0.12em]">
                        {day.weekday}
                      </span>

                      <span
                        className={`mt-1 block font-serif text-sm ${
                          isSelected
                            ? "text-[#EAD8D3]"
                            : "text-[#A77B73]"
                        }`}
                      >
                        {day.monthDay}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHOOSE A MEAL */}
            <div className="mt-7 border-t border-[#DED0CB] pt-6">
              <p className="text-[8px] tracking-[0.28em] text-[#806E68]">
                2 · CHOOSE A MEAL
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    "BREAKFAST",
                    "LUNCH",
                    "DINNER",
                    "SNACK",
                  ] as MealSlot[]
                ).map((slot) => {
                  const isSelected =
                    selectedMealSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedMealSlot(slot);
                        setPlannerMessage("");
                        setPlannerError("");
                      }}
                      aria-pressed={isSelected}
                      className={`rounded-full border px-3 py-3 text-[9px] tracking-[0.1em] transition ${
                        isSelected
                          ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
                          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ERROR */}
            {plannerError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-[#D8B5AE] bg-[#F4E7E3] px-4 py-3 font-serif text-sm italic text-[#8C5E56]"
              >
                {plannerError}
              </div>
            )}

            {/* SUCCESS */}
            {plannerMessage && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-[#D8C9C3] bg-[#F1E6E2] px-4 py-4"
              >
                <p className="font-serif text-base italic text-[#6F5D57]">
                  {plannerMessage}
                </p>

                <Link
                  href="/dashboard/resources/meal-plans"
                  className="mt-3 inline-flex text-[9px] tracking-[0.12em] text-[#8F655E] underline underline-offset-4"
                >
                  VIEW MY MEAL PLAN →
                </Link>
              </div>
            )}

            {/* SAVE */}
            <button
              type="button"
              onClick={saveMealToPlanner}
              disabled={
                isSavingMeal ||
                !selectedPlanDate ||
                !selectedMealSlot
              }
              className="mt-7 w-full rounded-full bg-[#211C19] px-6 py-4 text-[9px] tracking-[0.2em] text-[#F7F1ED] transition hover:bg-[#3A312D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingMeal
                ? "ADDING..."
                : plannerMessage
                ? "ADD AGAIN →"
                : "ADD TO MEAL PLAN →"}
            </button>

            <p className="mt-3 text-center font-serif text-xs italic text-[#A18A83]">
              If that slot already has a meal, this one will
              replace it. ♡
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
