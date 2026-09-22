"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const ingredients = [
  "1 large high-fibre or whole wheat tortilla",
  "1 large egg",
  "1/2 cup liquid egg whites",
  "2 slices lean turkey breast",
  "1/4 cup reduced-fat shredded cheese",
  "1/4 cup diced bell pepper",
  "2 tbsp diced onion",
  "Handful of baby spinach",
  "Salt, pepper + garlic powder, to taste",
  "Hot sauce or salsa, optional",
  "Non-stick cooking spray",
];

const instructions = [
  "Lightly spray a non-stick skillet and cook the bell pepper and onion over medium heat for 2–3 minutes.",
  "Add the spinach and cook just until wilted.",
  "Whisk the egg and egg whites with salt, pepper and garlic powder, then pour them into the skillet.",
  "Gently scramble until almost set, then stir in the turkey and remove from the heat.",
  "Warm the tortilla briefly so it folds easily. Add the egg mixture and sprinkle with cheese.",
  "Fold into a wrap and return it to the skillet seam-side down for 1–2 minutes per side, until lightly golden. Serve with salsa or hot sauce if you like.",
];

const swaps = [
  {
    label: "LOWER CARB",
    text: "Use a lower-carb tortilla or turn the filling into a breakfast bowl over extra spinach and veggies.",
  },
  {
    label: "FUEL YOUR WORKOUT",
    text: "Keep the full tortilla and add fruit or a small serving of potatoes on the side when you want more carbohydrate around training.",
  },
  {
    label: "MAKE IT YOURS",
    text: "Swap turkey for chicken sausage, add mushrooms or jalapeños, or change the cheese and salsa to keep it interesting.",
  },
];

export default function BreakfastWrapPage() {
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
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                recipe 02. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/recipes"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RECIPES
            </Link>
          </header>

          <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <div className="flex flex-wrap gap-2">
                  {["BREAKFAST", "HIGH PROTEIN", "QUICK"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#6E5A55] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#DDB5AE]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="mt-6 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  High-Protein Breakfast Wrap
                </h1>
                <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  the breakfast that keeps up. ♡
                </p>
              </div>

              <p className="max-w-xs text-[8px] leading-5 tracking-[0.15em] text-[#BFAEAA]">
                A SIMPLE PROTEIN-FIRST BREAKFAST FOR MORNINGS THAT NEED A LITTLE
                MORE THAN COFFEE.
              </p>
            </div>
          </section>

          <section className="py-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {[
                ["390", "CALORIES"],
                ["36G", "PROTEIN"],
                ["30G", "CARBS"],
                ["14G", "FAT"],
                ["10 MIN", "TOTAL TIME"],
                ["1", "SERVING"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] px-4 py-5 text-center"
                >
                  <p className="font-serif text-2xl text-[#A77B73]">{value}</p>
                  <p className="mt-2 text-[7px] tracking-[0.18em] text-[#806E68]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 pb-10 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                INGREDIENTS
              </p>
              <h2 className="mt-3 font-serif text-3xl">
                What you&apos;ll <span className="italic text-[#A77B73]">need.</span>
              </h2>

              <div className="mt-7 space-y-3">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="flex gap-3 border-b border-[#E8DDD9] pb-3 text-sm leading-6 text-[#5F504B]"
                  >
                    <span className="font-serif text-[#A77B73]">♡</span>
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                METHOD
              </p>
              <h2 className="mt-3 font-serif text-3xl">
                Let&apos;s make <span className="italic text-[#A77B73]">your wrap.</span>
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

          <section className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-9">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                MAKE IT WORK FOR YOU
              </p>
              <h2 className="mt-3 font-serif text-3xl">
                Same breakfast.{" "}
                <span className="italic text-[#9D6F67]">different day.</span>
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

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                NUTRITION NOTE
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#806E68]">
                Nutrition values are approximate and can change based on the
                protein powder, cottage cheese, toppings and other brands you
                use. Adjust portions to match your individual needs.
              </p>
            </div>
          </section>

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
