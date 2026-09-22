"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const proteinFoods = [
  { food: "Chicken breast", serving: "100 g cooked", protein: "31 g" },
  { food: "Lean ground turkey", serving: "100 g cooked", protein: "27 g" },
  { food: "Greek yogurt", serving: "1 cup", protein: "20–23 g" },
  { food: "Cottage cheese", serving: "1 cup", protein: "24–28 g" },
  { food: "Eggs", serving: "2 large", protein: "12–13 g" },
  { food: "Egg whites", serving: "1 cup", protein: "25–27 g" },
  { food: "Tuna", serving: "1 can", protein: "25–30 g" },
  { food: "Salmon", serving: "100 g cooked", protein: "22–25 g" },
  { food: "Protein powder", serving: "1 scoop", protein: "20–30 g" },
  { food: "Edamame", serving: "1 cup cooked", protein: "17–18 g" },
];

export default function ProteinGuidePage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");

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

  const target = useMemo(() => {
    const value = Number(weight);
    if (!value || value <= 0) return null;

    const kg = unit === "lb" ? value / 2.20462 : value;

    return {
      low: Math.round(kg * 1.6),
      high: Math.round(kg * 2.0),
    };
  }, [weight, unit]);

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
              <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                fuel the work. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/tools"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[9px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← TOOLS
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <p className="text-[9px] tracking-[0.4em] text-[#DDB5AE]">
              TOOLS • NUTRITION
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Protein Guide
              <span className="block italic text-[#DDB5AE]">
                hit your protein. ♡
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-6 text-[#CFC1BC]">
              Get a simple daily protein range, then use the food guide below
              to make that number easier to reach.
            </p>
          </section>

          <section className="py-10">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
                <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                  PROTEIN CALCULATOR
                </p>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Find your{" "}
                  <span className="italic text-[#A77B73]">starting range.</span>
                </h2>

                <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#6F5F59]">
                  Enter your body weight for a practical daily range based on
                  1.6–2.0 grams of protein per kilogram of body weight.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight"
                    className="min-w-0 flex-1 rounded-full border border-[#D6C3BD] bg-[#F7F1ED] px-5 py-3.5 text-sm outline-none placeholder:text-[#AA9690] focus:border-[#A77B73]"
                  />

                  <div className="flex rounded-full border border-[#D6C3BD] bg-[#F7F1ED] p-1">
                    {(["lb", "kg"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setUnit(option)}
                        className={`rounded-full px-5 py-2.5 text-[10px] tracking-[0.2em] transition ${
                          unit === option
                            ? "bg-[#211C19] text-[#F7F1ED]"
                            : "text-[#8F655E]"
                        }`}
                      >
                        {option.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex min-h-[260px] flex-col justify-between rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
                <div>
                  <p className="text-[9px] tracking-[0.35em] text-[#8F655E]">
                    YOUR DAILY RANGE
                  </p>

                  {target ? (
                    <>
                      <p className="mt-5 font-serif text-5xl text-[#211C19] md:text-6xl">
                        {target.low}–{target.high}
                        <span className="ml-2 text-2xl italic text-[#A77B73]">
                          g
                        </span>
                      </p>
                      <p className="mt-4 text-[15px] leading-6 text-[#6F5F59]">
                        You do not need to hit the exact same number every day.
                        Use this as a practical range.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-5 font-serif text-4xl italic text-[#A77B73]">
                        your range will show here. ♡
                      </p>
                      <p className="mt-4 text-[15px] leading-6 text-[#6F5F59]">
                        Add your weight to calculate your starting target.
                      </p>
                    </>
                  )}
                </div>

                <p className="mt-8 text-[11px] leading-5 text-[#806E68]">
                  This calculator is a general fitness reference, not an
                  individualized medical or nutrition prescription.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                  MAKE IT EASY
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Build around{" "}
                  <span className="italic text-[#A77B73]">protein first.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                simple &gt; perfect. ♡
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "PICK A SOURCE",
                  text: "Start each main meal with a protein source you actually enjoy eating.",
                },
                {
                  number: "02",
                  title: "SPREAD IT OUT",
                  text: "Divide your target across meals and snacks instead of trying to catch up at night.",
                },
                {
                  number: "03",
                  title: "KEEP BACKUPS",
                  text: "Greek yogurt, cottage cheese, eggs, tuna and protein shakes make easy backup options.",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6"
                >
                  <span className="font-serif text-3xl text-[#D2B0A9]">
                    {item.number}
                  </span>
                  <p className="mt-5 text-[9px] tracking-[0.22em] text-[#8F655E]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-[15px] leading-6 text-[#6F5F59]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div>
              <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                QUICK REFERENCE
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Easy protein{" "}
                <span className="italic text-[#A77B73]">options.</span>
              </h2>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
              <div className="grid grid-cols-[1.2fr_1fr_.6fr] gap-3 bg-[#EAD8D3] px-6 py-4 text-[9px] tracking-[0.2em] text-[#8F655E]">
                <span>FOOD</span>
                <span>SERVING</span>
                <span>PROTEIN</span>
              </div>

              {proteinFoods.map((item, index) => (
                <div
                  key={item.food}
                  className={`grid grid-cols-[1.2fr_1fr_.6fr] gap-3 px-6 py-4 text-[14px] leading-5 text-[#6F5F59] ${
                    index !== proteinFoods.length - 1
                      ? "border-b border-[#E1D3CE]"
                      : ""
                  }`}
                >
                  <span className="font-medium text-[#342C28]">{item.food}</span>
                  <span>{item.serving}</span>
                  <span>{item.protein}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] leading-5 text-[#8C7770]">
              Protein amounts are approximate and can vary by brand, cut,
              preparation and serving size. Check the nutrition label when you
              need an exact amount.
            </p>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              protein handled. keep going. ♡
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/resources/recipes"
                className="rounded-full bg-[#211C19] px-8 py-3.5 text-[9px] tracking-[0.25em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                BROWSE RECIPES →
              </Link>

              <Link
                href="/dashboard/resources/tools"
                className="rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[9px] tracking-[0.25em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
              >
                BACK TO TOOLS
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
