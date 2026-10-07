"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { recipes } from "@/lib/recipes";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DynamicRecipePage() {
  const params = useParams();

  const recipeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const recipe = recipes.find((item) => item.id === recipeId);

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

  if (!recipe) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
            <Link
              href="/dashboard/resources/recipes"
              className="text-[8px] tracking-[0.22em] text-[#8F655E]"
            >
              ← BACK TO RECIPES
            </Link>

            <h1 className="mt-10 font-serif text-4xl">
              Recipe not found ♡
            </h1>
          </section>
        </div>
      </main>
    );
  }

  const macroCards = [
    [String(recipe.calories), "CALORIES"],
    [`${recipe.protein}G`, "PROTEIN"],
    [`${recipe.carbs}G`, "CARBS"],
    [`${recipe.fat}G`, "FAT"],
    [recipe.time, "TOTAL TIME"],
    [
      String(recipe.servings),
      recipe.servings === 1 ? "SERVING" : "SERVINGS",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* TOP HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                recipe. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recipes"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RECIPES
            </Link>
          </header>

          {/* RECIPE INTRO */}
          <section className="pb-8 pt-12 md:pt-14">
            <div className="max-w-4xl">
              {/* TAGS */}
              <div className="flex flex-wrap gap-2">
                {[recipe.meal, ...recipe.goals].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#D6C3BD] bg-[#FBF8F6] px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#8F655E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* TITLE */}
              <h1 className="mt-6 font-serif text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                {recipe.title}
              </h1>

              <p className="mt-4 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                {recipe.subtitle} ♡
              </p>

              <p className="mt-5 max-w-xl text-[9px] uppercase leading-5 tracking-[0.13em] text-[#806E68]">
                {recipe.description}
              </p>
            </div>
          </section>

          {/* MACROS */}
          <section className="pb-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {macroCards.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] px-4 py-5 text-center"
                >
                  <p className="font-serif text-2xl text-[#A77B73]">
                    {value}
                  </p>

                  <p className="mt-2 text-[7px] tracking-[0.18em] text-[#806E68]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* INGREDIENTS + METHOD */}
          <section className="grid gap-6 pb-10 xl:grid-cols-[0.9fr_1.1fr]">
            {/* INGREDIENTS */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                INGREDIENTS
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                What you&apos;ll{" "}
                <span className="italic text-[#A77B73]">need.</span>
              </h2>

              <div className="mt-7 space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={`${recipe.id}-ingredient-${index}`}
                    className="flex gap-3 border-b border-[#E8DDD9] pb-3 text-sm leading-6 text-[#5F504B]"
                  >
                    <span className="font-serif text-[#A77B73]">♡</span>

                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* METHOD */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                METHOD
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Let&apos;s make{" "}
                <span className="italic text-[#A77B73]">your meal.</span>
              </h2>

              <div className="mt-7 space-y-5">
                {recipe.instructions.map((instruction, index) => (
                  <div
                    key={`${recipe.id}-step-${index}`}
                    className="flex gap-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAD8D3] font-serif text-[#8F655E]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="pt-1 text-sm leading-6 text-[#5F504B]">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SWAPS */}
          <section className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-9">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                MAKE IT WORK FOR YOU
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Same meal.{" "}
                <span className="italic text-[#9D6F67]">
                  make it yours.
                </span>
              </h2>
            </div>

            <div className="mt-7 grid gap-3 lg:grid-cols-3">
              {recipe.swaps.map((swap) => (
                <div
                  key={swap.label}
                  className="rounded-2xl border border-[#D0B5AF] bg-[#F7F1ED]/55 p-5"
                >
                  <p className="text-[8px] tracking-[0.22em] text-[#8F655E]">
                    {swap.label}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#6F5F59]">
                    {swap.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* NUTRITION NOTE */}
          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                NUTRITION NOTE
              </p>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#806E68]">
                Nutrition values are approximate and can change based on the
                ingredients, portions and brands you use. Adjust portions to
                match your individual needs.
              </p>
            </div>
          </section>

          {/* BACK */}
          <section className="pb-14 text-center">
            <Link
              href="/dashboard/resources/recipes"
              className="inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[8px] tracking-[0.26em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO RECIPES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}