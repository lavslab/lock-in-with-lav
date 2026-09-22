"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const grocerySections = [
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

const planTips = [
  {
    plan: "BALANCED WEEK",
    tag: "START HERE",
    text: "Shop the core list, then choose the produce and carb options used in the recipes you plan to repeat. You do not need every ingredient in the library.",
  },
  {
    plan: "TRAINING WEEK",
    tag: "TRAIN",
    text: "Keep extra rice, potatoes, sweet potatoes, pasta, tortillas and fruit available so harder training days are easy to fuel.",
  },
  {
    plan: "LIGHTER WEEK",
    tag: "LIGHT",
    text: "Prioritize plenty of produce and your preferred proteins. Keep carbohydrate staples on hand too — lighter does not mean carb-free.",
  },
];

export default function GroceryListPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

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

  const toggleItem = (key: string) => {
    setCheckedItems((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const clearList = () => setCheckedItems({});

  const totalItems = grocerySections.reduce(
    (total, section) => total + section.items.length,
    0
  );
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
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← MEAL PLANS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  GROCERY LIST
                </p>

                <h1 className="mt-5 font-serif text-5xl leading-none md:text-6xl">
                  Stock the kitchen.
                </h1>

                <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  then make it easy on yourself. ♡
                </p>
              </div>

              <div className="rounded-2xl border border-[#5D4B47] px-5 py-4">
                <p className="text-[7px] tracking-[0.22em] text-[#BFAEAA]">
                  SHOPPING PROGRESS
                </p>
                <p className="mt-2 font-serif text-2xl text-[#F7F1ED]">
                  {checkedCount} / {totalItems}
                </p>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    BEFORE YOU SHOP
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    This is a <span className="italic text-[#A77B73]">master list.</span>
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#806E68]">
                    You do not need to buy every item every week. Pick your meal
                    plan, decide which recipes you are actually making, check
                    what is already in your kitchen, then use this list to fill
                    the gaps.
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

          <section className="pb-12">
            <div className="mb-7">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                THE LIST
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Tap as you{" "}
                <span className="italic text-[#A77B73]">shop. ♡</span>
              </h2>
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

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <p className="text-[8px] tracking-[0.32em] text-[#8F655E]">
              SHOP FOR YOUR PLAN
            </p>
            <h2 className="mt-3 font-serif text-3xl">
              Same foundation.{" "}
              <span className="italic text-[#9D6F67]">different emphasis.</span>
            </h2>

            <div className="mt-7 grid gap-3 lg:grid-cols-3">
              {planTips.map((tip) => (
                <div
                  key={tip.plan}
                  className="rounded-2xl border border-[#D0B5AF] bg-[#F7F1ED]/55 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[8px] tracking-[0.18em]">{tip.plan}</p>
                    <span className="rounded-full border border-[#CBA9A2] px-2.5 py-1 text-[6px] tracking-[0.16em] text-[#8F655E]">
                      {tip.tag}
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[#6F5F59]">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                SAVE MONEY + WASTE LESS
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-serif text-xl italic text-[#A77B73]">
                    repeat ingredients.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#806E68]">
                    Choose recipes that share proteins, vegetables and sides so
                    one grocery trip works across several meals.
                  </p>
                </div>

                <div>
                  <p className="font-serif text-xl italic text-[#A77B73]">
                    use what you have.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#806E68]">
                    Frozen produce, leftover rice and pantry staples absolutely
                    count. The plan does not need to look perfect.
                  </p>
                </div>

                <div>
                  <p className="font-serif text-xl italic text-[#A77B73]">
                    buy for your week.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#806E68]">
                    Shopping for seven dinners you will not cook is not prep.
                    Choose the meals that realistically fit your schedule.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              stocked kitchen. fewer excuses. ♡
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
