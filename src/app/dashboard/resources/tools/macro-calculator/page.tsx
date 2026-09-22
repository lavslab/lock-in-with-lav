"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type Sex = "female" | "male";
type Unit = "imperial" | "metric";
type Goal = "lose" | "maintain" | "gain";

const activityLevels = [
  { value: "1.2", label: "SEDENTARY", detail: "Little structured exercise" },
  { value: "1.375", label: "LIGHT", detail: "1–3 training days / week" },
  { value: "1.55", label: "MODERATE", detail: "3–5 training days / week" },
  { value: "1.725", label: "VERY ACTIVE", detail: "6–7 hard training days / week" },
];

export default function MacroCalculatorPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [unit, setUnit] = useState<Unit>("imperial");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<Goal>("maintain");

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

  const result = useMemo(() => {
    const ageValue = Number(age);
    const weightValue = Number(weight);
    const activityValue = Number(activity);

    if (!ageValue || !weightValue || ageValue <= 0 || weightValue <= 0) {
      return null;
    }

    const kg =
      unit === "imperial" ? weightValue / 2.20462 : weightValue;

    let cm = 0;

    if (unit === "imperial") {
      const feetValue = Number(feet);
      const inchesValue = Number(inches || 0);

      if (!feetValue || feetValue <= 0 || inchesValue < 0) return null;
      cm = (feetValue * 12 + inchesValue) * 2.54;
    } else {
      cm = Number(heightCm);
      if (!cm || cm <= 0) return null;
    }

    const bmr =
      10 * kg +
      6.25 * cm -
      5 * ageValue +
      (sex === "male" ? 5 : -161);

    const maintenance = bmr * activityValue;

    const calorieMultiplier =
      goal === "lose" ? 0.85 : goal === "gain" ? 1.1 : 1;

    const calories = Math.round(maintenance * calorieMultiplier);

    const proteinPerKg =
      goal === "lose" ? 1.8 : goal === "gain" ? 1.8 : 1.6;

    const protein = Math.round(kg * proteinPerKg);

    const fatPercent = 0.3;
    const fat = Math.round((calories * fatPercent) / 9);

    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbCalories = Math.max(calories - proteinCalories - fatCalories, 0);
    const carbs = Math.round(carbCalories / 4);

    return {
      calories,
      protein,
      carbs,
      fat,
      maintenance: Math.round(maintenance),
    };
  }, [age, weight, feet, inches, heightCm, unit, sex, activity, goal]);

  const inputClass =
    "w-full rounded-2xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3.5 text-[16px] outline-none placeholder:text-[#AA9690] focus:border-[#A77B73]";

  const labelClass =
    "mb-2 block text-[12px] tracking-[0.15em] text-[#806E68]";

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
                fuel the work. ♡
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
              TOOLS • NUTRITION
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Macro Calculator
              <span className="block italic text-[#DDB5AE]">
                fuel your goals. ♡
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-[#CFC1BC]">
              Get a practical starting estimate for daily calories, protein,
              carbohydrates and fats based on your body and goal.
            </p>
          </section>

          <section className="py-10">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                      YOUR DETAILS
                    </p>
                    <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                      Let&apos;s find your{" "}
                      <span className="italic text-[#A77B73]">starting point.</span>
                    </h2>
                  </div>

                  <div className="flex self-start rounded-full border border-[#D6C3BD] bg-[#F7F1ED] p-1">
                    {(["imperial", "metric"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setUnit(option)}
                        className={`rounded-full px-4 py-2.5 text-[11px] tracking-[0.14em] transition ${
                          unit === option
                            ? "bg-[#211C19] text-[#F7F1ED]"
                            : "text-[#8F655E]"
                        }`}
                      >
                        {option === "imperial" ? "LB / FT" : "KG / CM"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>AGE</span>
                    <input
                      type="number"
                      min="18"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 30"
                      className={inputClass}
                    />
                  </label>

                  <div>
                    <span className={labelClass}>SEX</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["female", "male"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSex(option)}
                          className={`rounded-2xl border px-4 py-3.5 text-[12px] tracking-[0.14em] transition ${
                            sex === option
                              ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                              : "border-[#D6C3BD] bg-[#F7F1ED] text-[#8F655E]"
                          }`}
                        >
                          {option.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label>
                    <span className={labelClass}>
                      WEIGHT ({unit === "imperial" ? "LB" : "KG"})
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={unit === "imperial" ? "e.g. 135" : "e.g. 61"}
                      className={inputClass}
                    />
                  </label>

                  {unit === "imperial" ? (
                    <div>
                      <span className={labelClass}>HEIGHT</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="1"
                          value={feet}
                          onChange={(e) => setFeet(e.target.value)}
                          placeholder="Feet"
                          className={inputClass}
                        />
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={inches}
                          onChange={(e) => setInches(e.target.value)}
                          placeholder="Inches"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <label>
                      <span className={labelClass}>HEIGHT (CM)</span>
                      <input
                        type="number"
                        min="1"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        placeholder="e.g. 165"
                        className={inputClass}
                      />
                    </label>
                  )}
                </div>

                <div className="mt-5">
                  <span className={labelClass}>ACTIVITY LEVEL</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setActivity(level.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          activity === level.value
                            ? "border-[#A77B73] bg-[#EAD8D3]"
                            : "border-[#D6C3BD] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                        }`}
                      >
                        <span className="block text-[12px] tracking-[0.14em] text-[#6F514B]">
                          {level.label}
                        </span>
                        <span className="mt-1 block text-[15px] text-[#806E68]">
                          {level.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className={labelClass}>GOAL</span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { value: "lose", label: "LOSE FAT" },
                      { value: "maintain", label: "MAINTAIN" },
                      { value: "gain", label: "BUILD / GAIN" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value as Goal)}
                        className={`rounded-2xl border px-3 py-4 text-[12px] tracking-[0.12em] transition ${
                          goal === option.value
                            ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                            : "border-[#D6C3BD] bg-[#F7F1ED] text-[#8F655E]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
                <p className="text-[11px] tracking-[0.28em] text-[#8F655E]">
                  YOUR DAILY STARTING TARGETS
                </p>

                {result ? (
                  <>
                    <div className="mt-6 border-b border-[#D5BBB5] pb-6">
                      <p className="font-serif text-5xl text-[#211C19] md:text-6xl">
                        {result.calories.toLocaleString()}
                      </p>
                      <p className="mt-2 text-[12px] tracking-[0.16em] text-[#8F655E]">
                        CALORIES / DAY
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        ["PROTEIN", result.protein, "g"],
                        ["CARBS", result.carbs, "g"],
                        ["FAT", result.fat, "g"],
                      ].map(([label, value, suffix]) => (
                        <div
                          key={String(label)}
                          className="rounded-2xl border border-[#D5BBB5] bg-[#F7F1ED]/60 p-4 text-center"
                        >
                          <p className="font-serif text-3xl text-[#211C19]">
                            {value}
                            <span className="ml-1 text-base italic text-[#A77B73]">
                              {suffix}
                            </span>
                          </p>
                          <p className="mt-2 text-[11px] tracking-[0.13em] text-[#8F655E]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-6 text-[16px] leading-7 text-[#6F5F59]">
                      Estimated maintenance: about{" "}
                      <strong>{result.maintenance.toLocaleString()} calories</strong>{" "}
                      per day. Your selected goal adjusts from that estimate.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-6 font-serif text-4xl italic text-[#A77B73]">
                      your macros will show here. ♡
                    </p>
                    <p className="mt-4 text-[16px] leading-7 text-[#6F5F59]">
                      Fill in your details to calculate your starting targets.
                    </p>
                  </>
                )}

                <p className="mt-8 text-[13px] leading-6 text-[#806E68]">
                  These numbers are general estimates, not individualized
                  medical or dietetic advice. Real energy needs vary, so use
                  your results as a starting point and adjust based on progress,
                  performance and how you feel.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                  WHAT THE NUMBERS MEAN
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Keep it{" "}
                  <span className="italic text-[#A77B73]">simple.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                targets, not perfection. ♡
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "PROTEIN",
                  text: "Supports muscle repair and helps preserve or build lean mass alongside resistance training.",
                },
                {
                  number: "02",
                  title: "CARBS",
                  text: "Your body's main training fuel. Carbs help support energy, performance and recovery.",
                },
                {
                  number: "03",
                  title: "FATS",
                  text: "An important part of a balanced diet and a source of essential fatty acids.",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6"
                >
                  <span className="font-serif text-3xl text-[#D2B0A9]">
                    {item.number}
                  </span>
                  <p className="mt-5 text-[12px] tracking-[0.16em] text-[#8F655E]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-[16px] leading-7 text-[#6F5F59]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                PUT IT INTO PRACTICE
              </p>

              <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h2 className="font-serif text-3xl md:text-4xl">
                    Know the numbers.{" "}
                    <span className="italic text-[#A77B73]">build the meal.</span>
                  </h2>
                  <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#6F5F59]">
                    Once you have a starting target, use Meal Builder to turn
                    those numbers into something you can actually eat.
                  </p>
                </div>

                <Link
                  href="/dashboard/resources/tools/meal-builder"
                  className="shrink-0 rounded-full bg-[#211C19] px-7 py-3.5 text-[11px] tracking-[0.18em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                >
                  OPEN MEAL BUILDER →
                </Link>
              </div>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              fuel the goal. keep going. ♡
            </p>

            <Link
              href="/dashboard/resources/tools"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[11px] tracking-[0.20em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              BACK TO TOOLS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
