"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};

/* ---------------------------------
   RECIPE ICONS
--------------------------------- */

function PancakeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="9" rx="7" ry="2.5" />
      <path d="M5 9v3c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V9" />
      <path d="M5 12v3c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-3" />
      <path d="M10 7.8 12 6l2 1.8" />
    </svg>
  );
}

function BreakfastIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 7.5 8 9" />
      <path d="M17.5 7.5 16 9" />
      <path d="M6 17.5h12" />
    </svg>
  );
}

function BowlIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 10.5h15c-.4 5-3.2 8-7.5 8s-7.1-3-7.5-8Z" />
      <path d="M6 10.5c1.4-2.1 3.4-3.2 6-3.2s4.6 1.1 6 3.2" />
      <path d="M9 7.8c.4-1.3 1.4-2.3 3-3" />
      <path d="M12 7.3c1-1 2.1-1.5 3.5-1.5" />
    </svg>
  );
}

/* CHICKEN — PLATED CHICKEN BREAST */
function ChickenIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="15.5" rx="8" ry="3.5" />
      <path d="M7.5 14.2c.3-3.5 2.5-6.4 5.5-7.2 2.2-.6 4.2.5 4.5 2.5.4 2.4-1.8 4.6-4.8 5.2-2 .4-3.8.2-5.2-.5Z" />
      <path d="m11 9.5 1.5 1.5" />
      <path d="m13.5 8.7 1.5 1.5" />
      <path d="M6.5 13c-.8-1.2-1.8-1.7-3-1.6" />
      <path d="M5.2 12c-.2-1 .1-1.8.8-2.5" />
    </svg>
  );
}

/* TURKEY — SIMPLE PROTEIN MEAL */
function TurkeyMealIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12h16" />
      <path d="M5.5 12c.7 4.1 3 6.2 6.5 6.2s5.8-2.1 6.5-6.2" />
      <path d="M7.2 10.8c.6-2 2.3-3.2 4.8-3.2 2.4 0 4.2 1.2 4.8 3.2" />
      <path d="M9.5 7.9c.4-1.2 1.3-2.1 2.5-2.8" />
      <path d="M13.5 7.8c.7-.9 1.6-1.4 2.8-1.6" />
      <path d="M8.5 14.5h7" />
    </svg>
  );
}

/* PASTA — BOWL + NOODLES + FORK */
function PastaIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12.5h13c-.4 4-2.7 6.3-6.5 6.3S5.4 16.5 5 12.5Z" />
      <path d="M7 11c.8-1.5 2-2 3.2-1.1 1 .8 1.9.7 2.8-.2.9-.9 2-.8 3 .2" />
      <path d="M8.5 8.2c.8-.8 1.7-.8 2.5 0 .8.8 1.7.8 2.5 0 .8-.8 1.7-.8 2.5 0" />
      <path d="M18.5 4v8.5" />
      <path d="M17 4v3" />
      <path d="M20 4v3" />
      <path d="M17 7h3" />
    </svg>
  );
}

function FishIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.5 12c2.2-3.2 5-4.8 8.2-4.8 2.5 0 4.6 1.1 6.3 3.2-1.7 2.1-3.8 3.2-6.3 3.2-3.2 0-6-1.6-8.2-4.8" />
      <path d="m5.5 12-3-3v6l3-3Z" />
      <circle
        cx="16.5"
        cy="10.4"
        r=".65"
        fill="currentColor"
        stroke="none"
      />
      <path d="M11 8c.8 1.2.8 2.5 0 4" />
    </svg>
  );
}

function PotatoIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 6.5c2.5-2.1 6.8-2 9.3.4 2.8 2.6 2.7 7.2-.1 9.9-2.6 2.5-7.2 2.5-9.8-.1-2.8-2.8-2.5-7.7.6-10.2Z" />
      <circle cx="9" cy="9" r=".6" fill="currentColor" stroke="none" />
      <circle
        cx="14.5"
        cy="8.5"
        r=".6"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="12"
        cy="14.5"
        r=".6"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function SnackBoxIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M12 5v14" />
      <path d="M4 12h8" />
      <circle cx="8" cy="8.5" r="1.2" />
      <path d="M15 9h2.5" />
      <path d="M15 14.5h2.5" />
    </svg>
  );
}

function SmoothieIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 7h10l-1 13H8L7 7Z" />
      <path d="M6.5 7h11" />
      <path d="M14 7 16.5 3.5" />
      <path d="M10 11c1.2-.8 2.8-.8 4 0" />
      <path d="M9.5 14.5c1.5-.9 3.5-.9 5 0" />
    </svg>
  );
}

function PepperIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 6c-1.7-1.8-4.2-1.5-5.6.2-1.6 2-1.2 5.1-.4 7.7.8 2.8 2.3 5.1 4.1 5.1 1 0 1.5-.6 1.9-1.2.4.6.9 1.2 1.9 1.2 1.8 0 3.3-2.3 4.1-5.1.8-2.6 1.2-5.7-.4-7.7C16.2 4.5 13.7 4.2 12 6Z" />
      <path d="M12 6c-.2-1.6.5-2.8 2-3.5" />
      <path d="M12 8v8" />
    </svg>
  );
}

function TacoIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 17.5c.7-5.7 4-9 8.5-9s7.8 3.3 8.5 9h-17Z" />
      <path d="M6.5 14.5c1.1-1 2.1-1.1 3-.2.8.8 1.7.8 2.5 0 .9-.9 1.8-.9 2.7 0 .8.8 1.7.8 2.8-.1" />
      <path d="M8.5 11.5h.01" />
      <path d="M12 10.8h.01" />
      <path d="M15.5 11.5h.01" />
    </svg>
  );
}

function ShrimpIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.5 7.5c-1.8-2.2-5.2-3.1-8-1.8-3.4 1.5-5.1 5.4-3.7 8.6 1.1 2.6 4 4 6.7 3.4 2.3-.5 4-2.4 4.1-4.6.1-1.8-1.1-3.3-2.8-3.6-1.5-.3-3 .5-3.6 1.8" />
      <path d="m18.5 7.5 2-1.5" />
      <path d="m18.5 7.5 2.2.7" />
      <path d="M8 9.5c1.2.8 2.5 1.2 4 1.2" />
      <path d="M7 13c1.4.7 2.9 1 4.5.9" />
    </svg>
  );
}

function PlantMealIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 11h15c-.4 4.8-3.1 7.5-7.5 7.5S4.9 15.8 4.5 11Z" />
      <path d="M8 10c0-2.2 1.5-4 3.8-4.5.1 2.3-1.2 4.1-3.8 4.5Z" />
      <path d="M12 10c.2-2 1.7-3.5 4-3.7-.2 2.2-1.5 3.5-4 3.7Z" />
      <path d="M9.5 7.5c1.4.4 2.4 1.2 3 2.5" />
    </svg>
  );
}

function SearchIcon({ className = "" }: IconProps) {
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
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

/* ---------------------------------
   RECIPE DATA
--------------------------------- */

const recipes = [
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
    icon: PancakeIcon,
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
    icon: BreakfastIcon,
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
    icon: BowlIcon,
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
    icon: ChickenIcon,
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
    icon: TurkeyMealIcon,
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
    icon: PastaIcon,
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
    icon: FishIcon,
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
    icon: ChickenIcon,
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
    icon: SnackBoxIcon,
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
    icon: SmoothieIcon,
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
    icon: TurkeyMealIcon,
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
    icon: PepperIcon,
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
    icon: TurkeyMealIcon,
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
    icon: ShrimpIcon,
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
    icon: FishIcon,
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
    icon: ChickenIcon,
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
    icon: TacoIcon,
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
    icon: PlantMealIcon,
  },
];

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

/* ---------------------------------
   PAGE
--------------------------------- */

export default function RecipesPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [meal, setMeal] = useState("All");
  const [goal, setGoal] = useState("All");
  const [search, setSearch] = useState("");

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

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const filteredRecipes = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const mealMatch =
        meal === "All" || recipe.meal === meal;

      const goalMatch =
        goal === "All" || recipe.goals.includes(goal);

      const searchableText = [
        recipe.title,
        recipe.subtitle,
        recipe.meal,
        ...recipe.goals,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        searchTerm === "" || searchableText.includes(searchTerm);

      return mealMatch && goalMatch && searchMatch;
    });
  }, [meal, goal, search]);

  const FilterButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[8px] tracking-[0.16em] transition ${
        active
          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
      }`}
    >
      {label.toUpperCase()}
    </button>
  );

  const hasActiveFilters =
    search.trim() !== "" || meal !== "All" || goal !== "All";

  const clearFilters = () => {
    setSearch("");
    setMeal("All");
    setGoal("All");
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
                your recipe library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          {/* SEARCH + FILTERS */}
          <section className="pb-10 pt-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              {/* SEARCH */}
              <div>
                <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                  LOOKING FOR SOMETHING?
                </p>

                <div className="relative mt-4">
                  <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A77B73]" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search recipes..."
                    aria-label="Search recipes"
                    className="w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] py-4 pl-14 pr-12 text-sm text-[#211C19] outline-none transition placeholder:text-[#A18A83] focus:border-[#A77B73]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-5 top-1/2 -translate-y-1/2 font-serif text-lg text-[#A77B73] transition hover:text-[#211C19]"
                    >
                      ×
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[8px] leading-4 tracking-[0.12em] text-[#A18A83]">
                  TRY “SALMON”, “TURKEY”, “QUICK” OR “HIGH PROTEIN”
                </p>
              </div>

              <div className="my-7 border-t border-[#E1D3CE]" />

              {/* FILTERS */}
              <div className="grid gap-8 xl:grid-cols-2">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHAT ARE WE EATING?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mealTypes.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={meal === option}
                        onClick={() => setMeal(option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHAT DO YOU NEED?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {goalTypes.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={goal === option}
                        onClick={() => setGoal(option)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-7 flex justify-end border-t border-[#E1D3CE] pt-5">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[7px] tracking-[0.22em] text-[#9D6F67] transition hover:text-[#211C19]"
                  >
                    CLEAR SEARCH + FILTERS
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RECIPE LIBRARY */}
          <section className="pb-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  BROWSE RECIPES
                </p>

                <h1 className="mt-3 font-serif text-3xl md:text-4xl">
                  Find your{" "}
                  <span className="italic text-[#A77B73]">
                    next meal.
                  </span>
                </h1>

                {/* MEAL PLAN QUICK ACTION */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="font-serif text-sm italic text-[#A18A83]">
                    or
                  </span>

                  <Link
                    href="/dashboard/resources/meal-plans"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#211C19] px-5 py-2.5 text-[7px] tracking-[0.2em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                  >
                    MAKE A MEAL PLAN

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                {filteredRecipes.length}{" "}
                {filteredRecipes.length === 1
                  ? "recipe"
                  : "recipes"}{" "}
                ♡
              </p>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredRecipes.map((recipe) => {
                  const Icon = recipe.icon;
                  const originalIndex = recipes.findIndex(
                    (item) => item.id === recipe.id
                  );

                  return (
                    <Link
                      key={recipe.id}
                      href={`/dashboard/resources/recipes/${recipe.id}`}
                      className="group flex min-h-[330px] flex-col justify-between rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm"
                    >
                      <div>
                        {/* ICON + NUMBER + MEAL */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#EAD8D3] text-[#9D6F67] transition duration-300 group-hover:bg-[#E3CCC6]">
                              <Icon className="h-6 w-6" />
                            </div>

                            <span className="font-serif text-sm text-[#C6A29A]">
                              {String(originalIndex + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">
                            {recipe.meal.toUpperCase()}
                          </span>
                        </div>

                        {/* TITLE */}
                        <h2 className="mt-7 font-serif text-3xl leading-tight">
                          {recipe.title}
                        </h2>

                        <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                          {recipe.subtitle}
                        </p>

                        {/* GOALS */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {recipe.goals.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#EAD8D3]/65 px-3 py-1.5 text-[7px] tracking-[0.12em] text-[#806E68]"
                            >
                              {tag.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8">
                        {/* MACROS */}
                        <div className="grid grid-cols-4 gap-2 border-t border-[#E1D3CE] pt-4 text-center">
                          <div>
                            <p className="font-serif text-lg">
                              {recipe.calories}
                            </p>

                            <p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">
                              CAL
                            </p>
                          </div>

                          <div className="border-l border-[#E1D3CE]">
                            <p className="font-serif text-lg">
                              {recipe.protein}g
                            </p>

                            <p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">
                              PROTEIN
                            </p>
                          </div>

                          <div className="border-l border-[#E1D3CE]">
                            <p className="font-serif text-lg">
                              {recipe.carbs}g
                            </p>

                            <p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">
                              CARBS
                            </p>
                          </div>

                          <div className="border-l border-[#E1D3CE]">
                            <p className="font-serif text-lg">
                              {recipe.time}
                            </p>

                            <p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">
                              PREP
                            </p>
                          </div>
                        </div>

                        {/* VIEW RECIPE */}
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                            VIEW RECIPE
                          </span>

                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center">
                <p className="font-serif text-3xl italic text-[#A77B73]">
                  no recipes found. ♡
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">
                  Try another search or clear your filters to see the full
                  recipe library.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
                >
                  CLEAR SEARCH + FILTERS
                </button>
              </div>
            )}
          </section>

          {/* BACK */}
          <section className="border-t border-[#DED0CB] py-14 text-center">
            <Link
              href="/dashboard/resources"
              className="text-[8px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
            >
              ← BACK TO ALL RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}