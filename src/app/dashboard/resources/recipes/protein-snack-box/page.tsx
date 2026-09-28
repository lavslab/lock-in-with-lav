"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const ingredients = [
  "1 cup low-fat cottage cheese",
  "1/2 cup cucumber slices",
  "1/2 cup bell pepper strips",
  "1/2 cup cherry tomatoes",
  "1 hard-boiled egg",
  "1 tbsp everything bagel seasoning or fresh herbs",
  "Black pepper, to taste",
  "Lemon wedge or hot sauce, optional",
];

const instructions = [
  "Spoon the cottage cheese into one section of a meal-prep container or snack plate.",
  "Season it with everything bagel seasoning, fresh herbs or black pepper.",
  "Wash and slice the cucumber and bell pepper, then add them with the cherry tomatoes.",
  "Peel and halve the hard-boiled egg and add it to the box.",
  "Finish with a squeeze of lemon or hot sauce if desired.",
  "Serve immediately or refrigerate in a sealed container until snack time.",
];

const swaps = [
  {
    label: "LOWER CARB",
    text: "Keep the cottage cheese, egg and non-starchy veggies exactly as written — this box is already one of the lower-carb choices in the library.",
  },
  {
    label: "FUEL YOUR WORKOUT",
    text: "Add fruit, whole-grain crackers or a rice cake when you want a little more carbohydrate before or after training.",
  },
  {
    label: "MAKE IT YOURS",
    text: "Swap in carrots, snap peas or celery, add turkey slices, or make the cottage cheese savoury with dill, chili flakes or ranch-style seasoning.",
  },
];

export default function ProteinSnackBoxPage() {
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
                recipe 09. ♡
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
                {["SNACKS", "HIGH PROTEIN", "LOWER CARB", "QUICK"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#D6C3BD] bg-[#FBF8F6] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              {/* TITLE */}
              <h1 className="mt-6 font-serif text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                Protein{" "}
                <span className="italic text-[#A77B73]">
                  Snack Box
                </span>
              </h1>

              <p className="mt-4 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                snacky, but make it useful. ♡
              </p>

              <p className="mt-5 max-w-xl text-[9px] leading-5 tracking-[0.13em] text-[#806E68]">
                A QUICK PROTEIN-PACKED SNACK BOX FOR WHEN YOU WANT SOMETHING
                EASY, FRESH AND ACTUALLY FILLING.
              </p>
            </div>
          </section>

          {/* MACROS */}
          <section className="pb-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {[
                ["260", "CALORIES"],
                ["28G", "PROTEIN"],
                ["18G", "CARBS"],
                ["9G", "FAT"],
                ["5 MIN", "TOTAL TIME"],
                ["1", "SERVING"],
              ].map(([value, label]) => (
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
                <span className="italic text-[#A77B73]">
                  need.
                </span>
              </h2>

              <div className="mt-7 space-y-3">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="flex gap-3 border-b border-[#E8DDD9] pb-3 text-sm leading-6 text-[#5F504B]"
                  >
                    <span className="font-serif text-[#A77B73]">
                      ♡
                    </span>

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
                Build your{" "}
                <span className="italic text-[#A77B73]">
                  snack box.
                </span>
              </h2>

              <div className="mt-7 space-y-5">
                {instructions.map((instruction, index) => (
                  <div key={instruction} className="flex gap-4">
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
                Same snack box.{" "}
                <span className="italic text-[#9D6F67]">
                  make it yours.
                </span>
              </h2>
            </div>

            <div className="mt-7 grid gap-3 lg:grid-cols-3">
              {swaps.map((swap) => (
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
                cottage cheese, egg, vegetables, seasonings and any extras you
                add. Adjust portions to match your individual needs.
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