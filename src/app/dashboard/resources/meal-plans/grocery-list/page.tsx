"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type GrocerySection = {
  number: string;
  title: string;
  subtitle: string;
  items: string[];
};

type SavedMeal = {
  recipe_id: string;
};

type RecipeGroceryData = {
  title: string;
  items: string[];
};

/* ---------------------------------
   FULL LOCK IN GROCERY LIST
--------------------------------- */

const grocerySections: GrocerySection[] = [
  {
    number: "01",
    title: "PROTEIN",
    subtitle: "build the week around this.",
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
    subtitle: "colour + volume. ♡",
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
    subtitle: "use them where they fit.",
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
    subtitle: "easy protein boosters.",
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
    subtitle: "the little things matter.",
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
    subtitle: "keep the basics stocked.",
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

/* ---------------------------------
   RECIPE → GROCERY ITEMS

   These IDs match the recipe IDs saved
   by the weekly meal planner.
--------------------------------- */

const recipeGroceries: Record<string, RecipeGroceryData> = {
  "protein-pancakes": {
    title: "Protein Pancakes",
    items: [
      "Oats",
      "Eggs",
      "Protein powder",
      "Bananas",
      "Unsweetened milk of choice",
      "Plain Greek yogurt",
    ],
  },

  "breakfast-wrap": {
    title: "High-Protein Breakfast Wrap",
    items: [
      "Eggs",
      "Whole wheat or high-fibre tortillas",
      "Reduced-fat shredded cheese",
      "Spinach",
      "Bell peppers",
      "Salsa or pico de gallo",
    ],
  },

  "greek-yogurt-crunch-bowl": {
    title: "Greek Yogurt Crunch Bowl",
    items: [
      "Plain Greek yogurt",
      "Protein powder",
      "Strawberries",
      "Bananas",
      "Oats",
      "Chia seeds",
    ],
  },

  "chicken-taco-bowl": {
    title: "Chicken Taco Bowl",
    items: [
      "Chicken breast",
      "Rice",
      "Corn",
      "Black beans",
      "Bell peppers",
      "Lettuce or greens",
      "Salsa or pico de gallo",
      "Plain Greek yogurt",
      "Reduced-fat shredded cheese",
      "Lemons + limes",
      "Chili powder",
      "Cumin",
      "Garlic powder",
    ],
  },

  "turkey-burger-bowl": {
    title: "Turkey Burger Bowl",
    items: [
      "Extra-lean ground turkey",
      "Russet potatoes",
      "Lettuce or greens",
      "Cucumber",
      "Cherry tomatoes",
      "Onion + green onion",
      "Reduced-fat shredded cheese",
      "Plain Greek yogurt",
      "Garlic powder",
      "Onion powder",
      "Paprika",
      "Salt + black pepper",
    ],
  },

  "creamy-chicken-protein-pasta": {
    title: "Creamy Chicken Protein Pasta",
    items: [
      "Chicken breast",
      "High-protein pasta",
      "Low-fat cottage cheese",
      "Parmesan",
      "Unsweetened milk of choice",
      "Spinach",
      "Garlic",
      "Olive oil",
      "Italian seasoning",
      "Salt + black pepper",
      "Chili flakes",
    ],
  },

  "salmon-power-bowl": {
    title: "Salmon Power Bowl",
    items: [
      "Salmon fillets",
      "Rice",
      "Zucchini",
      "Asparagus",
      "Cucumber",
      "Carrots",
      "Edamame",
      "Olive oil",
      "Low-sodium soy sauce",
      "Honey",
      "Lemons + limes",
      "Garlic powder",
      "Paprika",
      "Sesame seeds — optional",
      "Onion + green onion",
    ],
  },

  "loaded-chicken-potato": {
    title: "Loaded Chicken Potato",
    items: [
      "Chicken breast",
      "Russet potatoes",
      "Broccoli",
      "Reduced-fat shredded cheese",
      "Plain Greek yogurt",
      "Onion + green onion",
      "Garlic powder",
      "Paprika",
      "Salt + black pepper",
    ],
  },

  "protein-snack-box": {
    title: "Protein Snack Box",
    items: [
      "Eggs",
      "Low-fat cottage cheese",
      "Whole-grain crackers or rice cakes",
      "Cucumber",
      "Carrots",
      "Strawberries",
    ],
  },

  "strawberry-protein-smoothie": {
    title: "Strawberry Protein Smoothie",
    items: [
      "Strawberries",
      "Bananas",
      "Protein powder",
      "Unsweetened milk of choice",
      "Plain Greek yogurt",
      "Chia seeds",
    ],
  },

  "ground-turkey-sweet-potato-bowl": {
    title: "Ground Turkey Sweet Potato Bowl",
    items: [
      "Extra-lean ground turkey",
      "Sweet potatoes",
      "Low-fat cottage cheese",
      "Broccoli",
      "Bell peppers",
      "Cucumber",
      "Olive oil",
      "Paprika",
      "Garlic powder",
      "Onion powder",
      "Salt + black pepper",
      "Sriracha or hot sauce",
      "Fresh herbs",
    ],
  },

  "turkey-stuffed-peppers": {
    title: "Turkey Stuffed Bell Peppers",
    items: [
      "Extra-lean ground turkey",
      "Bell peppers",
      "Rice",
      "Zucchini",
      "Onion + green onion",
      "Reduced-fat shredded cheese",
      "Olive oil",
      "Garlic powder",
      "Italian seasoning",
      "Salt + black pepper",
      "Fresh herbs",
      "Chili flakes",
    ],
  },

  "turkey-quesadillas": {
    title: "Ground Turkey Quesadillas",
    items: [
      "Extra-lean ground turkey",
      "Whole wheat or high-fibre tortillas",
      "Reduced-fat shredded cheese",
      "Bell peppers",
      "Onion + green onion",
      "Salsa or pico de gallo",
      "Plain Greek yogurt",
      "Chili powder",
      "Garlic powder",
      "Cumin",
      "Salt + black pepper",
    ],
  },

  "lemon-garlic-shrimp": {
    title: "Lemon Garlic Shrimp + Zucchini",
    items: [
      "Shrimp",
      "Zucchini",
      "Cherry tomatoes",
      "Garlic",
      "Olive oil",
      "Lemons + limes",
      "Paprika",
      "Salt + black pepper",
      "Fresh herbs",
      "Chili flakes",
    ],
  },

  "salmon-roasted-veggies": {
    title: "Salmon + Roasted Veggies",
    items: [
      "Salmon fillets",
      "Broccoli",
      "Zucchini",
      "Asparagus",
      "Bell peppers",
      "Olive oil",
      "Garlic powder",
      "Paprika",
      "Salt + black pepper",
      "Lemons + limes",
    ],
  },

  "honey-soy-chicken-bowl": {
    title: "Honey Soy Chicken Veggie Bowl",
    items: [
      "Chicken breast",
      "Rice",
      "Broccoli",
      "Bell peppers",
      "Carrots",
      "Olive oil",
      "Low-sodium soy sauce",
      "Honey",
      "Rice vinegar",
      "Garlic",
      "Plain Greek yogurt",
      "Sriracha or hot sauce",
      "Onion + green onion",
      "Sesame seeds — optional",
    ],
  },

  "black-bean-corn-tacos": {
    title: "Black Bean + Corn Tacos",
    items: [
      "Whole wheat or high-fibre tortillas",
      "Black beans",
      "Corn",
      "Cherry tomatoes",
      "Lettuce or greens",
      "Onion + green onion",
      "Reduced-fat shredded cheese",
      "Plain Greek yogurt",
      "Sriracha or hot sauce",
      "Chili powder",
      "Cumin",
      "Lemons + limes",
      "Fresh herbs",
    ],
  },

  "black-bean-taquitos": {
    title: "Crispy Black Bean Taquitos",
    items: [
      "Whole wheat or high-fibre tortillas",
      "Black beans",
      "Bell peppers",
      "Onion + green onion",
      "Reduced-fat shredded cheese",
      "Salsa or pico de gallo",
      "Plain Greek yogurt",
      "Chili powder",
      "Cumin",
      "Garlic powder",
      "Lemons + limes",
      "Fresh herbs",
    ],
  },
};

/* ---------------------------------
   ICON
--------------------------------- */

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H7" />
      <circle cx="10" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}

/* ---------------------------------
   PAGE
--------------------------------- */

export default function GroceryListPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndMeals = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingMeals(false);
        return;
      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setIsLoadingUser(false);

      const { data: checklistData, error: checklistError } = await supabase
        .from("grocery_checklist_state")
        .select("checked_items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checklistError) {
        console.error("Error loading grocery checklist:", checklistError);
      } else if (checklistData?.checked_items) {
        setCheckedItems(
          checklistData.checked_items as Record<string, boolean>
        );
      }

      const { data, error } = await supabase
        .from("meal_plan_selections")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading grocery meal plan:", error);
        setSavedMeals([]);
      } else {
        setSavedMeals(data ?? []);
      }

      setIsLoadingMeals(false);
    };

    getUserAndMeals();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  /* ---------------------------------
     BUILD SMART LIST
  --------------------------------- */

  const selectedRecipes = useMemo(() => {
    const uniqueRecipeIds = Array.from(
      new Set(savedMeals.map((meal) => meal.recipe_id))
    );

    return uniqueRecipeIds
      .map((recipeId) => {
        const recipe = recipeGroceries[recipeId];

        if (!recipe) return null;

        return {
          id: recipeId,
          ...recipe,
        };
      })
      .filter(
        (
          recipe
        ): recipe is {
          id: string;
          title: string;
          items: string[];
        } => recipe !== null
      );
  }, [savedMeals]);

  const plannedItems = useMemo(() => {
    const items = selectedRecipes.flatMap((recipe) => recipe.items);

    return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
  }, [selectedRecipes]);

  const hasPlannedMeals = selectedRecipes.length > 0;

  /* ---------------------------------
     CHECKLIST
  --------------------------------- */

  const saveCheckedItems = async (nextItems: Record<string, boolean>) => {
    if (!userId) return;

    const { error } = await supabase.from("grocery_checklist_state").upsert(
      {
        user_id: userId,
        checked_items: nextItems,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error saving grocery checklist:", error);
    }
  };

  const toggleItem = (key: string) => {
    setCheckedItems((current) => {
      const nextItems = {
        ...current,
        [key]: !current[key],
      };

      void saveCheckedItems(nextItems);

      return nextItems;
    });
  };

  const clearList = () => {
    const nextItems: Record<string, boolean> = {};

    setCheckedItems(nextItems);
    void saveCheckedItems(nextItems);
  };

  const masterTotalItems = grocerySections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const totalItems = hasPlannedMeals
    ? plannedItems.length + masterTotalItems
    : masterTotalItems;

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

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
                shop smart. make the week easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/meal-plans"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← MEAL PLANS
            </Link>
          </header>

          {/* LIGHT INTRO — NO BLACK HERO */}

          <section className="pb-8 pt-12 md:pt-14">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  GROCERY LIST
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-none md:text-5xl">
                  Shop your{" "}
                  <span className="italic text-[#A77B73]">week. ♡</span>
                </h1>

                <p className="mt-4 max-w-xl text-[11px] leading-6 text-[#7C6963]">
                  Start with the meals you planned, check what you already have,
                  then use the full list for anything else you need.
                </p>
              </div>

              <div className="w-fit rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] px-5 py-4">
                <p className="text-[7px] tracking-[0.22em] text-[#9D6F67]">
                  SHOPPING PROGRESS
                </p>

                <p className="mt-2 font-serif text-2xl text-[#211C19]">
                  {checkedCount} / {totalItems}
                </p>
              </div>
            </div>
          </section>

          {/* MEAL PLAN LIST */}

          {!isLoadingMeals && hasPlannedMeals && (
            <section className="pb-10">
              <div className="overflow-hidden rounded-[2rem] border border-[#D7C2BC] bg-[#EAD8D3]/55">
                <div className="border-b border-[#D7C2BC] p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FBF8F6] text-[#9D6F67]">
                        <CartIcon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                          FROM YOUR MEAL PLAN
                        </p>

                        <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                          Your week,{" "}
                          <span className="italic text-[#A77B73]">
                            ready to shop. ♡
                          </span>
                        </h2>

                        <p className="mt-3 max-w-2xl text-[10px] leading-5 text-[#78635D]">
                          We pulled these from the recipes you added to your
                          weekly meal plan.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/resources/meal-plans"
                      className="shrink-0 rounded-full bg-[#211C19] px-5 py-3 text-[7px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                    >
                      EDIT MEALS →
                    </Link>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedRecipes.map((recipe) => (
                      <span
                        key={recipe.id}
                        className="rounded-full border border-[#CBA9A2] bg-[#FBF8F6] px-4 py-2 text-[7px] tracking-[0.16em] text-[#7B5A54]"
                      >
                        {recipe.title.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {plannedItems.map((item) => {
                      const key = `planned-${item}`;
                      const checked = !!checkedItems[key];

                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => toggleItem(key)}
                          className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            checked
                              ? "border-[#CBA9A2] bg-[#DDB5AE]/45"
                              : "border-[#DDCBC6] bg-[#FBF8F6] hover:border-[#CBA9A2]"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                              checked
                                ? "border-[#A77B73] bg-[#A77B73] text-white"
                                : "border-[#CBA9A2] text-transparent"
                            }`}
                          >
                            ✓
                          </span>

                          <span
                            className={`text-xs leading-5 ${
                              checked
                                ? "text-[#8C7770] line-through"
                                : "text-[#5E504B]"
                            }`}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* NO MEALS PLANNED */}

          {!isLoadingMeals && !hasPlannedMeals && (
            <section className="pb-10">
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                      NO MEALS PLANNED YET
                    </p>

                    <p className="mt-3 font-serif text-xl italic text-[#A77B73] md:text-2xl">
                      no plan? no problem. ♡
                    </p>

                    <p className="mt-2 max-w-xl text-[10px] leading-5 text-[#7C6963]">
                      Your full Lock In grocery list is still below, or build
                      your week and we&apos;ll pull your recipe ingredients
                      together for you.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/resources/meal-plans"
                    className="shrink-0 rounded-full bg-[#211C19] px-6 py-3 text-[7px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                  >
                    PLAN MY WEEK →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* BEFORE YOU SHOP */}

          <section className="pb-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    BEFORE YOU SHOP
                  </p>

                  <p className="mt-3 max-w-3xl font-serif text-xl italic text-[#A77B73] md:text-2xl">
                    Check what you already have, then check off what you need. ♡
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearList}
                  className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.22em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                >
                  CLEAR CHECKS
                </button>
              </div>
            </div>
          </section>

          {/* FULL MASTER LIST */}

          <section className="pb-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                THE FULL LIST
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Stock the{" "}
                <span className="italic text-[#A77B73]">kitchen. ♡</span>
              </h2>

              <p className="mt-3 max-w-xl text-[10px] leading-5 text-[#8C7770]">
                Everything stays here whether you build a meal plan or not. Use
                whatever fits your week.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {grocerySections.map((section) => (
                <article
                  key={section.number}
                  className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7"
                >
                  <div className="flex items-start gap-5 border-b border-[#E1D3CE] pb-5">
                    <span className="font-serif text-4xl text-[#D2B0A9]">
                      {section.number}
                    </span>

                    <div>
                      <p className="text-[8px] tracking-[0.24em]">
                        {section.title}
                      </p>

                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {section.items.map((item) => {
                      const key = `${section.title}-${item}`;
                      const checked = !!checkedItems[key];

                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => toggleItem(key)}
                          className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            checked
                              ? "border-[#CBA9A2] bg-[#EAD8D3]/65"
                              : "border-[#E7DCD8] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                              checked
                                ? "border-[#A77B73] bg-[#A77B73] text-white"
                                : "border-[#CBA9A2] text-transparent"
                            }`}
                          >
                            ✓
                          </span>

                          <span
                            className={`text-xs leading-5 ${
                              checked
                                ? "text-[#8C7770] line-through"
                                : "text-[#5E504B]"
                            }`}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* FOOTER */}

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              stocked kitchen. easier week. ♡
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/resources/meal-plans/meal-prep"
                className="inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.24em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                MEAL PREP GUIDE →
              </Link>

              <Link
                href="/dashboard/resources/meal-plans"
                className="inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[8px] tracking-[0.24em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
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