"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type FoodOption = {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const proteins: FoodOption[] = [
  { name: "Chicken Breast", serving: "100 g cooked", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: "Lean Ground Turkey", serving: "100 g cooked", calories: 170, protein: 27, carbs: 0, fat: 7 },
  { name: "Salmon", serving: "100 g cooked", calories: 208, protein: 22, carbs: 0, fat: 13 },
  { name: "Shrimp", serving: "100 g cooked", calories: 99, protein: 24, carbs: 0, fat: 0 },
  { name: "Tofu", serving: "150 g", calories: 180, protein: 18, carbs: 5, fat: 11 },
];

const carbs: FoodOption[] = [
  { name: "Jasmine Rice", serving: "1 cup cooked", calories: 205, protein: 4, carbs: 45, fat: 0 },
  { name: "Sweet Potato", serving: "200 g", calories: 180, protein: 4, carbs: 41, fat: 0 },
  { name: "Quinoa", serving: "1 cup cooked", calories: 222, protein: 8, carbs: 39, fat: 4 },
  { name: "Baby Potatoes", serving: "200 g", calories: 174, protein: 4, carbs: 40, fat: 0 },
  { name: "Whole-Grain Wrap", serving: "1 wrap", calories: 180, protein: 6, carbs: 30, fat: 4 },
];

const produce: FoodOption[] = [
  { name: "Broccoli", serving: "1 cup", calories: 55, protein: 4, carbs: 11, fat: 1 },
  { name: "Mixed Vegetables", serving: "1 cup", calories: 80, protein: 4, carbs: 16, fat: 1 },
  { name: "Spinach", serving: "2 cups", calories: 14, protein: 2, carbs: 2, fat: 0 },
  { name: "Berries", serving: "1 cup", calories: 70, protein: 1, carbs: 17, fat: 1 },
  { name: "Green Beans", serving: "1 cup", calories: 44, protein: 2, carbs: 10, fat: 0 },
];

const fats: FoodOption[] = [
  { name: "Avocado", serving: "1/2 medium", calories: 120, protein: 2, carbs: 6, fat: 11 },
  { name: "Olive Oil", serving: "1 tbsp", calories: 119, protein: 0, carbs: 0, fat: 14 },
  { name: "Almonds", serving: "1 oz", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Feta", serving: "30 g", calories: 80, protein: 4, carbs: 1, fat: 6 },
  { name: "Peanut Butter", serving: "1 tbsp", calories: 95, protein: 4, carbs: 4, fat: 8 },
];

const categories = [
  { key: "protein", number: "01", title: "PROTEIN", subtitle: "build the base.", options: proteins },
  { key: "carb", number: "02", title: "CARB", subtitle: "fuel the work.", options: carbs },
  { key: "produce", number: "03", title: "PRODUCE", subtitle: "add some colour.", options: produce },
  { key: "fat", number: "04", title: "FAT", subtitle: "finish the plate.", options: fats },
] as const;

export default function MealBuilderPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [protein, setProtein] = useState<FoodOption | null>(null);
  const [carb, setCarb] = useState<FoodOption | null>(null);
  const [produceChoice, setProduceChoice] = useState<FoodOption | null>(null);
  const [fat, setFat] = useState<FoodOption | null>(null);

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
      if (savedName) setFirstName(savedName);
      else if (user.email) setFirstName(user.email.split("@")[0]);

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const selections = useMemo(
    () =>
      [protein, carb, produceChoice, fat].filter(
        (item): item is FoodOption => item !== null
      ),
    [protein, carb, produceChoice, fat]
  );

  const totals = useMemo(
    () =>
      selections.reduce(
        (sum, item) => ({
          calories: sum.calories + item.calories,
          protein: sum.protein + item.protein,
          carbs: sum.carbs + item.carbs,
          fat: sum.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [selections]
  );

  const getSelected = (key: string) => {
    if (key === "protein") return protein;
    if (key === "carb") return carb;
    if (key === "produce") return produceChoice;
    return fat;
  };

  const setSelected = (key: string, option: FoodOption) => {
    if (key === "protein") setProtein(option);
    if (key === "carb") setCarb(option);
    if (key === "produce") setProduceChoice(option);
    if (key === "fat") setFat(option);
  };

  const resetMeal = () => {
    setProtein(null);
    setCarb(null);
    setProduceChoice(null);
    setFat(null);
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
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                make eating easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/tools"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[11px] tracking-[0.18em] transition hover:bg-[#EAD8D3]"
            >
              ← TOOLS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <p className="text-[11px] tracking-[0.32em] text-[#DDB5AE]">
              TOOLS • EAT
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Meal Builder
              <span className="block italic text-[#DDB5AE]">
                build your plate. ♡
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-[#CFC1BC]">
              Pick one option from each section and watch your meal come
              together with estimated calories and macros as you build.
            </p>
          </section>

          <section className="py-10">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-4">
                {categories.map((category) => {
                  const selected = getSelected(category.key);

                  return (
                    <section
                      key={category.key}
                      className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-7"
                    >
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] tracking-[0.22em] text-[#9D6F67]">
                            {category.number} • {category.title}
                          </p>
                          <h2 className="mt-2 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                            {category.subtitle}
                          </h2>
                        </div>

                        {selected && (
                          <span className="hidden rounded-full border border-[#D6C3BD] px-3 py-2 text-[11px] tracking-[0.12em] text-[#8F655E] sm:block">
                            SELECTED
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {category.options.map((option) => {
                          const isSelected = selected?.name === option.name;

                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => setSelected(category.key, option)}
                              className={`rounded-2xl border p-4 text-left transition ${
                                isSelected
                                  ? "border-[#A77B73] bg-[#EAD8D3]"
                                  : "border-[#DED0CB] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                              }`}
                            >
                              <span className="block font-serif text-xl">
                                {option.name}
                              </span>
                              <span className="mt-1 block text-[13px] text-[#806E68]">
                                {option.serving}
                              </span>
                              <span className="mt-3 block text-[11px] tracking-[0.08em] text-[#9D6F67]">
                                {option.calories} CAL • {option.protein}G P
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <aside className="h-fit rounded-[2rem] bg-[#EAD8D3] p-7 xl:sticky xl:top-8 md:p-8">
                <p className="text-[11px] tracking-[0.28em] text-[#8F655E]">
                  YOUR PLATE
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  {selections.length === 4 ? (
                    <>
                      meal <span className="italic text-[#A77B73]">built. ♡</span>
                    </>
                  ) : (
                    <>
                      build it{" "}
                      <span className="italic text-[#A77B73]">your way.</span>
                    </>
                  )}
                </h2>

                <div className="mt-7 space-y-2">
                  {(
                    [
                      ["PROTEIN", protein],
                      ["CARB", carb],
                      ["PRODUCE", produceChoice],
                      ["FAT", fat],
                    ] as [string, FoodOption | null][]
                  ).map(([label, food]) => {

                    return (
                      <div
                        key={String(label)}
                        className="flex items-center justify-between rounded-2xl border border-[#D5BBB5] bg-[#F7F1ED]/60 p-4"
                      >
                        <div>
                          <p className="text-[10px] tracking-[0.16em] text-[#9D6F67]">
                            {label}
                          </p>
                          <p className="mt-1 font-serif text-xl">
                            {food?.name ?? "Choose one"}
                          </p>
                        </div>
                        <span className="font-serif text-xl text-[#A77B73]">
                          {food ? "♡" : "○"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-[#D5BBB5] pt-6">
                  <p className="text-[11px] tracking-[0.22em] text-[#8F655E]">
                    ESTIMATED TOTAL
                  </p>

                  <p className="mt-3 font-serif text-5xl">
                    {totals.calories}
                    <span className="ml-2 text-lg italic text-[#A77B73]">
                      cal
                    </span>
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["PROTEIN", totals.protein],
                      ["CARBS", totals.carbs],
                      ["FAT", totals.fat],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-2xl border border-[#D5BBB5] bg-[#F7F1ED]/60 p-3 text-center"
                      >
                        <p className="font-serif text-2xl">{value}g</p>
                        <p className="mt-1 text-[10px] tracking-[0.1em] text-[#8F655E]">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetMeal}
                  className="mt-6 w-full rounded-full border border-[#B98D84] px-5 py-3.5 text-[11px] tracking-[0.18em] text-[#7D5750] transition hover:bg-[#F7F1ED]"
                >
                  RESET MEAL
                </button>

                <p className="mt-5 text-[13px] leading-6 text-[#806E68]">
                  Nutrition values are estimates and can vary by brand,
                  preparation method and serving size.
                </p>
              </aside>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                THE FORMULA
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Protein + carb + produce + fat.{" "}
                <span className="italic text-[#A77B73]">keep it simple.</span>
              </h2>
              <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#6F5F59]">
                This is a flexible framework, not a rule. Portions and food
                choices can change based on your appetite, preferences and
                nutrition targets.
              </p>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              build it. eat it. keep going. ♡
            </p>

            <Link
              href="/dashboard/resources/tools"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[11px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              BACK TO TOOLS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
