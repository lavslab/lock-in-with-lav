"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type Sex = "female" | "male";
type Unit = "imperial" | "metric";
type Goal = "lose" | "maintain" | "gain";

const activityLevels = [
  {
    value: "1.2",
    label: "SEDENTARY",
    detail: "Little structured exercise",
  },
  {
    value: "1.375",
    label: "LIGHT",
    detail: "1–3 training days / week",
  },
  {
    value: "1.55",
    label: "MODERATE",
    detail: "3–5 training days / week",
  },
  {
    value: "1.725",
    label: "VERY ACTIVE",
    detail: "6–7 hard training days / week",
  },
];

const goalOptions: {
  value: Goal;
  label: string;
  detail: string;
}[] = [
  {
    value: "lose",
    label: "LOSE FAT",
    detail: "A moderate calorie deficit",
  },
  {
    value: "maintain",
    label: "MAINTAIN",
    detail: "Stay around maintenance",
  },
  {
    value: "gain",
    label: "BUILD / GAIN",
    detail: "A small calorie surplus",
  },
];

function CalculatorIcon({ className = "" }: { className?: string }) {
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
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8.5 11h1" />
      <path d="M11.5 11h1" />
      <path d="M14.5 11h1" />
      <path d="M8.5 14h1" />
      <path d="M11.5 14h1" />
      <path d="M14.5 14h1" />
      <path d="M8.5 17h1" />
      <path d="M11.5 17h1" />
      <path d="M14.5 17h1" />
    </svg>
  );
}

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

      if (!feetValue || feetValue <= 0 || inchesValue < 0) {
        return null;
      }

      cm = (feetValue * 12 + inchesValue) * 2.54;
    } else {
      cm = Number(heightCm);

      if (!cm || cm <= 0) {
        return null;
      }
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
    const carbCalories = Math.max(
      calories - proteinCalories - fatCalories,
      0
    );
    const carbs = Math.round(carbCalories / 4);

    return {
      calories,
      protein,
      carbs,
      fat,
      maintenance: Math.round(maintenance),
    };
  }, [
    age,
    weight,
    feet,
    inches,
    heightCm,
    unit,
    sex,
    activity,
    goal,
  ]);

  const inputClass =
    "w-full rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3.5 text-[16px] text-[#211C19] outline-none transition placeholder:text-[#AA9690] focus:border-[#A77B73]";

  const labelClass =
    "mb-2 block text-[10px] tracking-[0.18em] text-[#806E68]";

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                fuel the work. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/tools"
              className="shrink-0 rounded-full border border-[#CBA9A2] px-5 py-3 text-[9px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← TOOLS
            </Link>
          </header>

          {/* INTRO */}
          <section className="border-b border-[#DED0CB] pb-9 pt-10 md:pb-11 md:pt-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAD8D3] text-[#9D6F67]">
                    <CalculatorIcon className="h-5 w-5" />
                  </div>

                  <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                    NUTRITION TOOL
                  </p>
                </div>

                <h1 className="mt-5 font-serif text-4xl leading-[0.95] md:text-5xl">
                  Macro Calculator.
                  <span className="mt-1 block italic text-[#A77B73]">
                    find your starting point. ♡
                  </span>
                </h1>
              </div>

              <div className="max-w-xl lg:justify-self-end">
                <p className="text-[15px] leading-6 text-[#6F5F59]">
                  Estimate a practical daily starting target for calories,
                  protein, carbohydrates and fats based on your body, activity
                  and goal.
                </p>

                <p className="mt-4 text-[8px] tracking-[0.2em] text-[#9D6F67]">
                  ENTER DETAILS → CHOOSE ACTIVITY → PICK A GOAL
                </p>
              </div>
            </div>
          </section>

          {/* CALCULATOR */}
          <section className="py-9 md:py-11">
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
              {/* FORM */}
              <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                {/* STEP 01 */}
                <section className="p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex gap-4">
                      <span className="font-serif text-3xl text-[#D2B0A9]">
                        01
                      </span>

                      <div>
                        <p className="text-[9px] tracking-[0.24em] text-[#9D6F67]">
                          YOUR BODY
                        </p>

                        <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                          Start with the basics.
                        </h2>
                      </div>
                    </div>

                    <div className="flex w-fit rounded-full border border-[#D6C3BD] bg-[#F7F1ED] p-1">
                      {(["imperial", "metric"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setUnit(option)}
                          className={`rounded-full px-4 py-2 text-[9px] tracking-[0.14em] transition ${
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

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
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
                            className={`rounded-xl border px-3 py-3.5 text-[10px] tracking-[0.14em] transition ${
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
                        placeholder={
                          unit === "imperial" ? "e.g. 135" : "e.g. 61"
                        }
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
                </section>

                {/* STEP 02 */}
                <section className="border-t border-[#E1D3CE] p-6 md:p-8">
                  <div className="flex gap-4">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      02
                    </span>

                    <div>
                      <p className="text-[9px] tracking-[0.24em] text-[#9D6F67]">
                        ACTIVITY
                      </p>

                      <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                        How much are you moving?
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setActivity(level.value)}
                        className={`min-w-0 rounded-xl border p-4 text-left transition ${
                          activity === level.value
                            ? "border-[#A77B73] bg-[#EAD8D3]/75"
                            : "border-[#D6C3BD] bg-[#F7F1ED] hover:border-[#CBA9A2]"
                        }`}
                      >
                        <span className="block text-[10px] tracking-[0.14em] text-[#6F514B]">
                          {level.label}
                        </span>

                        <span className="mt-1.5 block text-[13px] leading-5 text-[#806E68]">
                          {level.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* STEP 03 */}
                <section className="border-t border-[#E1D3CE] p-6 md:p-8">
                  <div className="flex gap-4">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      03
                    </span>

                    <div>
                      <p className="text-[9px] tracking-[0.24em] text-[#9D6F67]">
                        YOUR GOAL
                      </p>

                      <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                        What are we working toward?
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-2 md:grid-cols-3">
                    {goalOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value)}
                        className={`rounded-xl border p-4 text-left transition ${
                          goal === option.value
                            ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
                            : "border-[#D6C3BD] bg-[#F7F1ED] text-[#8F655E] hover:border-[#CBA9A2]"
                        }`}
                      >
                        <span
                          className={`block text-[10px] tracking-[0.14em] ${
                            goal === option.value
                              ? "text-[#F7F1ED]"
                              : "text-[#6F514B]"
                          }`}
                        >
                          {option.label}
                        </span>

                        <span
                          className={`mt-2 block text-[12px] leading-5 ${
                            goal === option.value
                              ? "text-[#D8CAC5]"
                              : "text-[#806E68]"
                          }`}
                        >
                          {option.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* RESULTS */}
              <aside className="xl:sticky xl:top-8">
                <div className="rounded-[1.75rem] bg-[#EAD8D3]/80 p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4 border-b border-[#D5BBB5] pb-5">
                    <div>
                      <p className="text-[9px] tracking-[0.24em] text-[#8F655E]">
                        YOUR ESTIMATE
                      </p>

                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        your starting targets. ♡
                      </p>
                    </div>

                    <CalculatorIcon className="h-6 w-6 text-[#A77B73]" />
                  </div>

                  {result ? (
                    <>
                      <div className="py-7 text-center">
                        <p className="font-serif text-5xl leading-none text-[#211C19] md:text-6xl">
                          {result.calories.toLocaleString()}
                        </p>

                        <p className="mt-3 text-[9px] tracking-[0.2em] text-[#8F655E]">
                          CALORIES / DAY
                        </p>
                      </div>

                      <div className="grid grid-cols-3 border-y border-[#D5BBB5]">
                        <div className="py-5 text-center">
                          <p className="font-serif text-2xl text-[#211C19] md:text-3xl">
                            {result.protein}
                            <span className="ml-0.5 text-sm italic text-[#A77B73]">
                              g
                            </span>
                          </p>

                          <p className="mt-2 text-[8px] tracking-[0.14em] text-[#8F655E]">
                            PROTEIN
                          </p>
                        </div>

                        <div className="border-x border-[#D5BBB5] py-5 text-center">
                          <p className="font-serif text-2xl text-[#211C19] md:text-3xl">
                            {result.carbs}
                            <span className="ml-0.5 text-sm italic text-[#A77B73]">
                              g
                            </span>
                          </p>

                          <p className="mt-2 text-[8px] tracking-[0.14em] text-[#8F655E]">
                            CARBS
                          </p>
                        </div>

                        <div className="py-5 text-center">
                          <p className="font-serif text-2xl text-[#211C19] md:text-3xl">
                            {result.fat}
                            <span className="ml-0.5 text-sm italic text-[#A77B73]">
                              g
                            </span>
                          </p>

                          <p className="mt-2 text-[8px] tracking-[0.14em] text-[#8F655E]">
                            FAT
                          </p>
                        </div>
                      </div>

                      <div className="pt-6">
                        <p className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                          ESTIMATED MAINTENANCE
                        </p>

                        <p className="mt-2 font-serif text-2xl text-[#211C19]">
                          {result.maintenance.toLocaleString()}{" "}
                          <span className="text-base italic text-[#A77B73]">
                            cal / day
                          </span>
                        </p>

                        <p className="mt-3 text-[13px] leading-5 text-[#6F5F59]">
                          Your selected goal adjusts your daily target from this
                          estimated maintenance level.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-9">
                      <p className="font-serif text-3xl italic leading-tight text-[#A77B73]">
                        your numbers will
                        <br />
                        show here. ♡
                      </p>

                      <p className="mt-4 max-w-sm text-[14px] leading-6 text-[#6F5F59]">
                        Add your age, weight and height. Your estimate will
                        update automatically as you choose your activity level
                        and goal.
                      </p>
                    </div>
                  )}

                  <p className="mt-6 border-t border-[#D5BBB5] pt-5 text-[11px] leading-5 text-[#806E68]">
                    These are general estimates, not individualized medical or
                    dietetic advice. Use them as a starting point and adjust
                    based on progress, performance and how you feel.
                  </p>
                </div>
              </aside>
            </div>
          </section>

          {/* QUICK EXPLANATION */}
          <section className="border-y border-[#DED0CB] py-9">
            <div className="grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
              <div>
                <p className="text-[9px] tracking-[0.28em] text-[#9D6F67]">
                  QUICK GUIDE
                </p>

                <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                  What do these
                  <span className="block italic text-[#A77B73]">
                    numbers mean? ♡
                  </span>
                </h2>

                <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#806E68]">
                  You do not need to obsess over every gram. Think of these as
                  useful targets that give your nutrition some structure.
                </p>
              </div>

              <div className="divide-y divide-[#E1D3CE]">
                <div className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <p className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                    PROTEIN
                  </p>

                  <p className="text-[14px] leading-6 text-[#6F5F59]">
                    Supports muscle repair and helps preserve or build lean
                    mass alongside resistance training.
                  </p>
                </div>

                <div className="grid gap-2 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <p className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                    CARBS
                  </p>

                  <p className="text-[14px] leading-6 text-[#6F5F59]">
                    Your body&apos;s main training fuel. Carbohydrates help
                    support energy, performance and recovery.
                  </p>
                </div>

                <div className="grid gap-2 py-4 last:pb-0 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <p className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                    FATS
                  </p>

                  <p className="text-[14px] leading-6 text-[#6F5F59]">
                    An important part of a balanced diet and a source of
                    essential fatty acids.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* END */}
          <section className="mx-auto max-w-2xl pb-14 pt-9 text-center">
            <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
              START WITH THE ESTIMATE • PAY ATTENTION • ADJUST
            </p>

            <p className="mt-4 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              fuel the goal. keep going. ♡
            </p>

            <Link
              href="/dashboard/resources/tools"
              className="mt-7 inline-block rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[9px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
            >
              ← BACK TO TOOLS
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}