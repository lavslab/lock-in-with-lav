

"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

import DashboardSidebar from "@/components/DashboardSidebar";
import { recipes } from "@/lib/recipes";

type GrocerySection = {

  number: string;

  title: string;

  items: string[];

};

type GroceryView = "planned" | "essentials";

const grocerySections: GrocerySection[] = [

  {

    number: "01",

    title: "PROTEIN",

    items: [

      "Chicken breast",

      "Extra-lean ground turkey",

      "Salmon fillets",

      "Shrimp",

      "Eggs",

      "Protein powder",

      "Black beans",

      "Edamame",

    ],

  },

  {

    number: "02",

    title: "PRODUCE",

    items: [

      "Sweet potatoes",

      "Russet potatoes",

      "Broccoli",

      "Bell peppers",

      "Zucchini",

      "Asparagus",

      "Cucumber",

      "Cherry tomatoes",

      "Carrots",

      "Spinach",

      "Lettuce or greens",

      "Onion + green onion",

      "Garlic",

      "Lemons + limes",

      "Strawberries",

      "Bananas",

      "Fresh herbs",

    ],

  },

  {

    number: "03",

    title: "CARBS + FUEL",

    items: [

      "Rice",

      "High-protein pasta",

      "Whole wheat or high-fibre tortillas",

      "Oats",

      "Whole-grain crackers or rice cakes",

      "Corn",

      "Quinoa — optional swap",

    ],

  },

  {

    number: "04",

    title: "DAIRY + FRIDGE",

    items: [

      "Plain Greek yogurt",

      "Low-fat cottage cheese",

      "Reduced-fat shredded cheese",

      "Parmesan",

      "Unsweetened milk of choice",

    ],

  },

  {

    number: "05",

    title: "PANTRY + FLAVOUR",

    items: [

      "Olive oil",

      "Low-sodium soy sauce",

      "Honey",

      "Salsa or pico de gallo",

      "Sriracha or hot sauce",

      "Rice vinegar",

      "Chia seeds",

      "Sesame seeds — optional",

      "Everything bagel seasoning",

    ],

  },

  {

    number: "06",

    title: "SEASONINGS",

    items: [

      "Salt + black pepper",

      "Garlic powder",

      "Onion powder",

      "Paprika",

      "Chili powder",

      "Cumin",

      "Italian seasoning",

      "Chili flakes",

      "Cajun seasoning — optional",

    ],

  },

];

function getIngredientCategory(ingredient: string): string {

  const name = ingredient.toLowerCase();

  const categories: Record<string, string[]> = {

    PROTEIN: [

      "chicken", "turkey", "salmon", "shrimp", "tuna",

      "egg", "black beans", "edamame",

    ],

    PRODUCE: [

      "spinach", "lettuce", "romaine", "broccoli",

      "zucchini", "asparagus", "cucumber", "tomato",

      "carrot", "bell pepper", "onion", "garlic clove",

      "mushroom", "strawberr", "berr", "banana",

      "apple", "pineapple", "lemon", "lime",

      "cilantro", "parsley", "dill", "avocado",

      "ginger", "fresh herbs",

    ],

    "CARBS + FUEL": [

      "rice", "oats", "granola", "tortilla", "bread", "corn",

      "toast", "pasta", "potato", "quinoa",

      "crackers", "rice cake",

    ],

    "DAIRY + FRIDGE": [

      "yogurt", "cottage cheese", "cream cheese",

      "shredded cheese", "parmesan", "milk",

    ],

    "PANTRY + FLAVOUR": [

      "olive oil", "soy sauce", "honey", "maple syrup",

      "salsa", "pico de gallo", "sriracha", "hot sauce",

      "vinegar", "chia seeds", "sesame seeds",

      "peanut butter", "sunflower seed butter",

      "walnuts", "chocolate chips", "cocoa powder",

      "protein powder", "mustard", "ketchup",

      "vanilla extract", "tomato sauce",

      "caesar dressing", "cooking spray", "baking powder",

    ],

    SEASONINGS: [

      "salt", "pepper", "paprika", "cumin",

      "chili powder", "chilli powder", "chili flakes",

      "chilli flakes", "cinnamon", "nutmeg",

      "italian seasoning", "taco seasoning",

      "garlic powder", "onion powder",

      "everything bagel seasoning", "everything seasoning",

      "dried herbs", "ground ginger", "garlic powder",

    ],

  };

  for (const [category, keywords] of Object.entries(categories)) {

    if (keywords.some((keyword) => name.includes(keyword))) {

      return category;

    }

  }

  return "PANTRY + FLAVOUR";

}

const essentials = grocerySections.flatMap((section) =>

  section.items.map((item) => ({

    name: item,

    section: section.title,

    key: `${section.title}-${item}`,

  }))

);

function CheckIcon({ checked }: { checked: boolean }) {

  return (

    <span

      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition ${

        checked

          ? "border-[#A77B73] bg-[#A77B73] text-white"

          : "border-[#CDB8B1] bg-transparent text-transparent"

      }`}

    >

      <svg

        viewBox="0 0 20 20"

        fill="none"

        className="h-3 w-3"

        aria-hidden="true"

      >

        <path

          d="m4.5 10 3.5 3.5 7.5-7.5"

          stroke="currentColor"

          strokeWidth="2"

          strokeLinecap="round"

          strokeLinejoin="round"

        />

      </svg>

    </span>

  );

}

export default function GroceryListPage() {

  const [firstName, setFirstName] = useState("there");

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  const [isLoadingChecks, setIsLoadingChecks] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  const [checkedItems, setCheckedItems] = useState<

    Record<string, boolean>

  >({});

  const [activeView, setActiveView] =

    useState<GroceryView>("essentials");

  const [search, setSearch] = useState("");

  const [hideChecked, setHideChecked] = useState(false);

  const [openCategories, setOpenCategories] = useState<string[]>([

    "PROTEIN",

  ]);

  const [saveStatus, setSaveStatus] = useState<

    "idle" | "saving" | "saved" | "error"

  >("idle");

  useEffect(() => {

    let cancelled = false;

    async function loadData() {

      const {

        data: { user },

      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {

        setIsLoadingUser(false);

        setIsLoadingMeals(false);

        setIsLoadingChecks(false);

        return;

      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      setFirstName(

        typeof savedName === "string" && savedName.trim()

          ? savedName

          : user.email?.split("@")[0] || "there"

      );

      setIsLoadingUser(false);

      const [checklistResult, mealsResult] = await Promise.all([

        supabase

          .from("grocery_checklist_state")

          .select("checked_items")

          .eq("user_id", user.id)

          .maybeSingle(),

        supabase

          .from("meal_plan_selections")

          .select("recipe_id")

          .eq("user_id", user.id),

      ]);

      if (cancelled) return;

      if (checklistResult.error) {

        console.error(

          "Error loading grocery checklist:",

          checklistResult.error

        );

      } else {

        setCheckedItems(

          (checklistResult.data?.checked_items as Record<

            string,

            boolean

          >) || {}

        );

      }

      setIsLoadingChecks(false);

      if (mealsResult.error) {

        console.error(

          "Error loading meal plan:",

          mealsResult.error

        );

      } else {

        setSavedRecipeIds(

          Array.from(

            new Set(

              (mealsResult.data || []).map(

                (meal) => meal.recipe_id as string

              )

            )

          )

        );

      }

      setIsLoadingMeals(false);

    }

    void loadData();

    return () => {

      cancelled = true;

    };

  }, []);

  const initial =

    !isLoadingUser && firstName !== "there"

      ? firstName.charAt(0).toUpperCase()

      : "♡";

  const selectedRecipes = useMemo(() => {
    return savedRecipeIds.flatMap((id) => {
      const recipe = recipes.find((item) => item.id === id);
      return recipe ? [{ id: recipe.id, title: recipe.title, items: recipe.ingredients }] : [];
    });
  }, [savedRecipeIds]);

  const plannedItems = useMemo(() => {

    const names = new Set(

      selectedRecipes.flatMap((recipe) => recipe.items)

    );

    return Array.from(names)

      .sort((a, b) => a.localeCompare(b))

      .map((name) => ({

        name,

        key: `planned-${name}`,

      }));

  }, [selectedRecipes]);

  const plannedCategories = useMemo(() => {
    return grocerySections.map((section) => ({
      ...section,
      items: plannedItems.filter((item) => getIngredientCategory(item.name) === section.title),
    })).filter((section) => section.items.length > 0);
  }, [plannedItems]);

  const hasPlannedMeals = selectedRecipes.length > 0;

  const currentItems =

    activeView === "planned" ? plannedItems : essentials;

  const completedCount = currentItems.filter(

    (item) => checkedItems[item.key]

  ).length;

  const totalCount = currentItems.length;

  const progress =

    totalCount > 0

      ? Math.round((completedCount / totalCount) * 100)

      : 0;

  const visibleItems = currentItems.filter((item) => {

    const matchesSearch = item.name

      .toLowerCase()

      .includes(search.trim().toLowerCase());

    const matchesChecked =

      !hideChecked || !checkedItems[item.key];

    return matchesSearch && matchesChecked;

  });

  const filteredCategories = grocerySections

    .map((section) => ({

      ...section,

      items: visibleItems.filter(

        (item) =>

          "section" in item &&

          item.section === section.title

      ),

    }))

    .filter((section) => section.items.length > 0);

  const toggleItem = (key: string) => {

    setCheckedItems((current) => ({

      ...current,

      [key]: !current[key],

    }));

    setSaveStatus("saving");

  };

  // Save checklist changes after a short pause.

  useEffect(() => {

    if (!userId || isLoadingChecks || saveStatus !== "saving") {

      return;

    }

    const timer = window.setTimeout(async () => {

      const { error } = await supabase

        .from("grocery_checklist_state")

        .upsert(

          {

            user_id: userId,

            checked_items: checkedItems,

            updated_at: new Date().toISOString(),

          },

          { onConflict: "user_id" }

        );

      if (error) {

        console.error("Error saving grocery checklist:", error);

        setSaveStatus("error");

      } else {

        setSaveStatus("saved");

      }

    }, 450);

    return () => window.clearTimeout(timer);

  }, [checkedItems, userId, isLoadingChecks, saveStatus]);

  const clearCurrentChecks = () => {

    setCheckedItems((current) => {

      const next = { ...current };

      currentItems.forEach((item) => {

        delete next[item.key];

      });

      return next;

    });

    setSaveStatus("saving");

  };

  const toggleCategory = (title: string) => {

    setOpenCategories((current) =>

      current.includes(title)

        ? current.filter((item) => item !== title)

        : [...current, title]

    );

  };

  const showPlannedView = () => {

    setActiveView("planned");

    setSearch("");

  };

  const showEssentialsView = () => {

    setActiveView("essentials");

    setSearch("");

  };

  const itemButton = (

    name: string,

    key: string

  ) => {

    const checked = !!checkedItems[key];

    return (

      <button

        key={key}

        type="button"

        onClick={() => toggleItem(key)}

        aria-pressed={checked}

        className={`flex min-h-[43px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${

          checked

            ? "bg-[#EAD8D3]/45"

            : "bg-[#F7F1ED]/75 hover:bg-[#EAD8D3]/30"

        }`}

      >

        <CheckIcon checked={checked} />

        <span

          className={`text-[11px] leading-5 ${

            checked

              ? "text-[#A08B83] line-through"

              : "text-[#4D413D]"

          }`}

        >

          {name}

        </span>

      </button>

    );

  };

  return (

    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">

      <div className="flex min-h-screen">

        <DashboardSidebar

          firstName={firstName}

          initial={initial}

          isLoadingUser={isLoadingUser}

        />

        <section className="min-w-0 flex-1 px-5 pb-28 pt-8 md:px-10 lg:px-14">

          <div className="mx-auto max-w-4xl">

            {/* HEADER */}

            <header className="border-b border-[#DED0CB] pb-5">

              <div className="mb-5 flex items-center justify-between gap-3">

                <p className="text-[9px] tracking-[0.27em] text-[#9D6F67]">

                  NOURISH / GROCERY LIST

                </p>

                <Link

                  href="/dashboard/resources/meal-plans"

                  className="text-[9px] tracking-[0.12em] text-[#9D6F67] transition hover:text-[#211C19]"

                >

                  ← MEAL PLANS

                </Link>

              </div>

              <h1 className="font-serif text-3xl leading-tight md:text-4xl">

                The Grocery{" "}

                <span className="italic text-[#A77B73]">

                  Edit.

                </span>

              </h1>

              <p className="mt-2 text-[11px] text-[#8C7770]">

                Everything you need, nothing you don't. ♡

              </p>

            </header>

            {/* VIEW SELECTOR */}

            <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-1.5">

              <button

                type="button"

                onClick={showPlannedView}

                className={`rounded-xl px-3 py-3 text-[9px] tracking-[0.14em] transition ${

                  activeView === "planned"

                    ? "bg-[#EAD8D3] text-[#694D47]"

                    : "text-[#8C7770] hover:bg-[#F7F1ED]"

                }`}

              >

                MY MEAL PLAN

              </button>

              <button

                type="button"

                onClick={showEssentialsView}

                className={`rounded-xl px-3 py-3 text-[9px] tracking-[0.14em] transition ${

                  activeView === "essentials"

                    ? "bg-[#EAD8D3] text-[#694D47]"

                    : "text-[#8C7770] hover:bg-[#F7F1ED]"

                }`}

              >

                THE ESSENTIALS

              </button>

            </div>

            {/* PROGRESS */}

            <section className="mt-5 rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-5 md:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-[8px] tracking-[0.24em] text-[#9D6F67]">

                    YOUR SHOPPING LIST

                  </p>

                  <p className="mt-2 font-serif text-2xl">

                    {completedCount}

                    <span className="text-[#B7A39B]">

                      {" "}/ {totalCount}

                    </span>

                    <span className="ml-2 font-sans text-[10px] text-[#8C7770]">

                      checked

                    </span>

                  </p>

                </div>

                <span className="font-serif text-2xl italic text-[#A77B73]">

                  {progress}%

                </span>

              </div>

              <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-[#E9DFDA]">

                <div

                  className="h-full rounded-full bg-[#B98F87] transition-all duration-300"

                  style={{ width: `${progress}%` }}

                />

              </div>

            </section>

            {/* TOOLBAR */}

            <section className="mt-7">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <div className="relative min-w-0 flex-1">

                  <svg

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.5"

                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A77B73]"

                    aria-hidden="true"

                  >

                    <circle cx="11" cy="11" r="7" />

                    <path d="m16 16 5 5" />

                  </svg>

                  <input

                    type="search"

                    value={search}

                    onChange={(event) =>

                      setSearch(event.target.value)

                    }

                    placeholder="Search groceries..."

                    aria-label="Search groceries"

                    className="w-full rounded-full border border-[#DED0CB] bg-[#FBF8F6] py-3 pl-11 pr-4 text-[11px] text-[#211C19] outline-none placeholder:text-[#A9948B] focus:border-[#A77B73]"

                  />

                </div>

                <label className="flex cursor-pointer items-center gap-2.5 self-start px-1 py-2 sm:self-auto">

                  <input

                    type="checkbox"

                    checked={hideChecked}

                    onChange={(event) =>

                      setHideChecked(event.target.checked)

                    }

                    className="h-4 w-4 accent-[#A77B73]"

                  />

                  <span className="whitespace-nowrap text-[10px] text-[#7C6963]">

                    Hide checked

                  </span>

                </label>

              </div>

              <div className="mt-3 flex items-center justify-between gap-3">

                <p className="text-[10px] text-[#8C7770]">

                  {visibleItems.length} items showing

                </p>

                <button

                  type="button"

                  onClick={clearCurrentChecks}

                  disabled={completedCount === 0}

                  className="text-[9px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4 transition hover:text-[#211C19] disabled:cursor-not-allowed disabled:opacity-40"

                >

                  RESET CHECKS

                </button>

              </div>

            </section>

            {/* MY MEAL PLAN */}

            {activeView === "planned" && (

              <section className="mt-7">

                <div className="mb-4 flex items-end justify-between gap-3">

                  <div>

                    <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">

                      FROM YOUR WEEK

                    </p>

                    <h2 className="mt-2 font-serif text-2xl">

                      Planned{" "}

                      <span className="italic text-[#A77B73]">

                        ingredients.

                      </span>

                    </h2>

                  </div>

                  <Link

                    href="/dashboard/resources/meal-plans"

                    className="shrink-0 text-[9px] tracking-[0.1em] text-[#9D6F67] underline underline-offset-4"

                  >

                    EDIT PLAN →

                  </Link>

                </div>

                {isLoadingMeals ? (

                  <div className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-8 text-center text-[11px] text-[#8C7770]">

                    Loading your meal plan...

                  </div>

                ) : !hasPlannedMeals ? (

                  <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-10 text-center">

                    <p className="font-serif text-2xl italic text-[#A77B73]">

                      Nothing planned yet. ♡

                    </p>

                    <p className="mx-auto mt-3 max-w-sm text-[11px] leading-6 text-[#8C7770]">

                      Add recipes to your weekly meal plan and

                      their ingredients will appear here.

                    </p>

                    <Link

                      href="/dashboard/resources/meal-plans"

                      className="mt-6 inline-block rounded-full bg-[#211C19] px-6 py-3 text-[9px] tracking-[0.15em] text-white"

                    >

                      PLAN MY WEEK →

                    </Link>

                  </div>

                ) : (

                  <>

                    <div className="space-y-3">
                        {plannedCategories.map((section) => {
                          const shownItems = section.items.filter((item) =>
                            item.name.toLowerCase().includes(search.trim().toLowerCase()) &&
                            (!hideChecked || !checkedItems[item.key])
                          );
                          if (shownItems.length === 0) return null;
                          const isOpen = openCategories.includes(section.title) || search.trim().length > 0;
                          const categoryChecked = section.items.filter((item) => checkedItems[item.key]).length;
                          return (
                            <article key={section.number} className="overflow-hidden rounded-[1.35rem] border border-[#DED0CB] bg-[#FBF8F6]">
                              <button type="button" onClick={() => toggleCategory(section.title)} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-[#F3EAE6] sm:px-5">
                                <span className="w-8 shrink-0 font-serif text-2xl text-[#C9A69E]">{section.number}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[10px] font-medium tracking-[0.15em] text-[#4D413D]">{section.title}</span>
                                  <span className="mt-1 block text-[10px] text-[#A08B83]">{categoryChecked} of {section.items.length} checked</span>
                                </span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 shrink-0 text-[#9D6F67] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
                              </button>
                              {isOpen && (
                                <div className="border-t border-[#E9DFDA] px-3 pb-3 pt-3 sm:px-5 sm:pb-5">
                                  <div className="grid gap-2 sm:grid-cols-2">{shownItems.map((item) => itemButton(item.name, item.key))}</div>
                                </div>
                              )}
                            </article>
                          );
                        })}
                        {visibleItems.length === 0 && <p className="py-8 text-center text-[11px] text-[#8C7770]">No ingredients to show. ♡</p>}
                      </div>
                  </>

                )}

              </section>

            )}

            {/* ESSENTIALS */}

            {activeView === "essentials" && (

              <section className="mt-7">

                <div className="mb-5">

                  <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">

                    THE LOCK IN STAPLES

                  </p>

                  <h2 className="mt-2 font-serif text-2xl">

                    Stock your{" "}

                    <span className="italic text-[#A77B73]">

                      kitchen. ♡

                    </span>

                  </h2>

                </div>

                {filteredCategories.length === 0 ? (

                  <div className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-8 text-center text-[11px] text-[#8C7770]">

                    No groceries to show. ♡

                  </div>

                ) : (

                  <div className="space-y-3">

                    {filteredCategories.map((section) => {

                      const isOpen =

                        openCategories.includes(section.title) ||

                        search.trim().length > 0;

                      const categoryTotal = section.items.length;

                      const categoryChecked =

                        section.items.filter(

                          (item) => checkedItems[item.key]

                        ).length;

                      return (

                        <article

                          key={section.number}

                          className="overflow-hidden rounded-[1.35rem] border border-[#DED0CB] bg-[#FBF8F6]"

                        >

                          <button

                            type="button"

                            onClick={() =>

                              toggleCategory(section.title)

                            }

                            aria-expanded={isOpen}

                            className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-[#F3EAE6] sm:px-5"

                          >

                            <span className="w-8 shrink-0 font-serif text-2xl text-[#C9A69E]">

                              {section.number}

                            </span>

                            <span className="min-w-0 flex-1">

                              <span className="block text-[10px] font-medium tracking-[0.15em] text-[#4D413D]">

                                {section.title}

                              </span>

                              <span className="mt-1 block text-[10px] text-[#A08B83]">

                                {categoryChecked} of {categoryTotal} checked

                              </span>

                            </span>

                            <svg

                              viewBox="0 0 24 24"

                              fill="none"

                              stroke="currentColor"

                              strokeWidth="1.5"

                              className={`h-4 w-4 shrink-0 text-[#9D6F67] transition-transform ${

                                isOpen ? "rotate-180" : ""

                              }`}

                              aria-hidden="true"

                            >

                              <path d="m5 9 7 7 7-7" />

                            </svg>

                          </button>

                          {isOpen && (

                            <div className="border-t border-[#E9DFDA] px-3 pb-3 pt-3 sm:px-5 sm:pb-5">

                              <div className="grid gap-2 sm:grid-cols-2">

                                {section.items.map((item) =>

                                  itemButton(item.name, item.key)

                                )}

                              </div>

                            </div>

                          )}

                        </article>

                      );

                    })}

                  </div>

                )}

              </section>

            )}

            {/* FOOTER */}

            <footer className="mt-10 border-t border-[#DED0CB] pt-6">

              <div className="flex flex-wrap items-center justify-between gap-4">

              </div>

              {saveStatus === "saving" && (

                <p className="mt-3 text-[10px] text-[#8C7770]">

                  Saving checklist...

                </p>

              )}

              {saveStatus === "error" && (

                <p className="mt-3 text-[10px] text-red-700">

                  Checklist couldn't be saved. Try checking

                  an item again.

                </p>

              )}

            </footer>

          </div>

        </section>

      </div>

    </main>

  );

}
