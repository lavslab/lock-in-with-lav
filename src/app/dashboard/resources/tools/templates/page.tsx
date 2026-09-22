"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type TemplateKey = "weekly" | "meal" | "grocery" | "habits";

const templates = [
  {
    key: "weekly" as TemplateKey,
    number: "01",
    title: "WEEKLY RESET",
    subtitle: "map out the week.",
    description: "Set your priorities, workouts and focus before the week gets busy.",
    tag: "PLAN",
  },
  {
    key: "meal" as TemplateKey,
    number: "02",
    title: "MEAL PREP",
    subtitle: "make food easier.",
    description: "Plan your meals and prep so you already know what you're eating.",
    tag: "PREP",
  },
  {
    key: "grocery" as TemplateKey,
    number: "03",
    title: "GROCERY LIST",
    subtitle: "grab what you need.",
    description: "Build a simple shopping list organized by food category.",
    tag: "SHOP",
  },
  {
    key: "habits" as TemplateKey,
    number: "04",
    title: "HABIT TRACKER",
    subtitle: "keep showing up.",
    description: "Choose the habits that matter and track seven days of consistency.",
    tag: "TRACK",
  },
];

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function TemplatesPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [active, setActive] = useState<TemplateKey>("weekly");

  const [priorities, setPriorities] = useState(["", "", ""]);
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [workouts, setWorkouts] = useState<Record<string, string>>(
    Object.fromEntries(days.map((day) => [day, ""]))
  );

  const [meals, setMeals] = useState(
    Array.from({ length: 5 }, () => ({ meal: "", prep: "" }))
  );

  const [grocery, setGrocery] = useState<Record<string, string>>({
    Protein: "",
    Produce: "",
    Carbs: "",
    "Fats + Extras": "",
  });

  const [habitNames, setHabitNames] = useState([
    "Workout",
    "Water",
    "Read",
    "Nutrition",
  ]);
  const [habitChecks, setHabitChecks] = useState<boolean[][]>(
    Array.from({ length: 4 }, () => Array(7).fill(false))
  );

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

  const activeTemplate = useMemo(
    () => templates.find((template) => template.key === active) ?? templates[0],
    [active]
  );

  const inputClass =
    "w-full rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-3 text-[15px] outline-none placeholder:text-[#AA9690] focus:border-[#A77B73]";

  const resetActive = () => {
    if (active === "weekly") {
      setPriorities(["", "", ""]);
      setWeeklyFocus("");
      setWorkouts(Object.fromEntries(days.map((day) => [day, ""])));
    }

    if (active === "meal") {
      setMeals(Array.from({ length: 5 }, () => ({ meal: "", prep: "" })));
    }

    if (active === "grocery") {
      setGrocery({
        Protein: "",
        Produce: "",
        Carbs: "",
        "Fats + Extras": "",
      });
    }

    if (active === "habits") {
      setHabitNames(["Workout", "Water", "Read", "Nutrition"]);
      setHabitChecks(Array.from({ length: 4 }, () => Array(7).fill(false)));
    }
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
                put it on paper. ♡
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
              TOOLS • PLAN
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Templates
              <span className="block italic text-[#DDB5AE]">
                plan it. track it. ♡
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-[#CFC1BC]">
              Simple planning spaces for the things you want to keep organized,
              without turning your routine into another full-time job.
            </p>
          </section>

          <section className="py-10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => setActive(template.key)}
                  className={`rounded-[1.75rem] border p-5 text-left transition ${
                    active === template.key
                      ? "border-[#A77B73] bg-[#EAD8D3]"
                      : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#CBA9A2]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      {template.number}
                    </span>
                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#8F655E]">
                      {template.tag}
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] tracking-[0.18em]">
                    {template.title}
                  </p>
                  <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                    {template.subtitle}
                  </p>
                  <p className="mt-3 text-[14px] leading-6 text-[#6F5F59]">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="pb-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[#E1D3CE] pb-6 md:flex-row md:items-end">
                <div>
                  <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">
                    {activeTemplate.number} • {activeTemplate.title}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                    {activeTemplate.subtitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetActive}
                  className="self-start rounded-full border border-[#CBA9A2] px-5 py-3 text-[11px] tracking-[0.16em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                >
                  RESET
                </button>
              </div>

              {active === "weekly" && (
                <div className="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-[#9D6F67]">
                      TOP 3 PRIORITIES
                    </p>
                    <div className="mt-4 space-y-3">
                      {priorities.map((priority, index) => (
                        <input
                          key={index}
                          value={priority}
                          onChange={(e) => {
                            const next = [...priorities];
                            next[index] = e.target.value;
                            setPriorities(next);
                          }}
                          placeholder={`${index + 1}. Priority`}
                          className={inputClass}
                        />
                      ))}
                    </div>

                    <p className="mt-6 text-[11px] tracking-[0.2em] text-[#9D6F67]">
                      THIS WEEK&apos;S FOCUS
                    </p>
                    <textarea
                      value={weeklyFocus}
                      onChange={(e) => setWeeklyFocus(e.target.value)}
                      placeholder="What matters most this week?"
                      rows={4}
                      className={`${inputClass} mt-4 resize-none`}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-[#9D6F67]">
                      TRAINING PLAN
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {days.map((day) => (
                        <label
                          key={day}
                          className="rounded-2xl border border-[#DED0CB] bg-[#F7F1ED] p-4"
                        >
                          <span className="text-[11px] tracking-[0.16em] text-[#9D6F67]">
                            {day}
                          </span>
                          <input
                            value={workouts[day]}
                            onChange={(e) =>
                              setWorkouts({
                                ...workouts,
                                [day]: e.target.value,
                              })
                            }
                            placeholder="Workout / rest"
                            className="mt-2 w-full bg-transparent font-serif text-lg outline-none placeholder:text-[#B7A5A0]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {active === "meal" && (
                <div className="mt-7">
                  <p className="text-[11px] tracking-[0.2em] text-[#9D6F67]">
                    MEALS + PREP
                  </p>
                  <div className="mt-4 space-y-3">
                    {meals.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-2xl border border-[#DED0CB] bg-[#F7F1ED] p-4 md:grid-cols-[60px_1fr_1fr]"
                      >
                        <span className="font-serif text-2xl text-[#D2B0A9]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <input
                          value={item.meal}
                          onChange={(e) => {
                            const next = [...meals];
                            next[index] = { ...next[index], meal: e.target.value };
                            setMeals(next);
                          }}
                          placeholder="Meal"
                          className="bg-transparent text-[15px] outline-none placeholder:text-[#AA9690]"
                        />
                        <input
                          value={item.prep}
                          onChange={(e) => {
                            const next = [...meals];
                            next[index] = { ...next[index], prep: e.target.value };
                            setMeals(next);
                          }}
                          placeholder="Prep / notes"
                          className="bg-transparent text-[15px] outline-none placeholder:text-[#AA9690]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === "grocery" && (
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  {Object.entries(grocery).map(([category, value]) => (
                    <label
                      key={category}
                      className="rounded-[1.5rem] border border-[#DED0CB] bg-[#F7F1ED] p-5"
                    >
                      <span className="text-[11px] tracking-[0.2em] text-[#9D6F67]">
                        {category.toUpperCase()}
                      </span>
                      <textarea
                        value={value}
                        onChange={(e) =>
                          setGrocery({ ...grocery, [category]: e.target.value })
                        }
                        placeholder="Add items..."
                        rows={5}
                        className="mt-3 w-full resize-none bg-transparent text-[15px] leading-7 outline-none placeholder:text-[#AA9690]"
                      />
                    </label>
                  ))}
                </div>
              )}

              {active === "habits" && (
                <div className="mt-7 overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[180px_repeat(7,1fr)] gap-2">
                      <div />
                      {days.map((day) => (
                        <div
                          key={day}
                          className="pb-2 text-center text-[10px] tracking-[0.14em] text-[#9D6F67]"
                        >
                          {day}
                        </div>
                      ))}

                      {habitNames.map((habit, habitIndex) => (
                        <div className="contents" key={habitIndex}>
                          <input
                            value={habit}
                            onChange={(e) => {
                              const next = [...habitNames];
                              next[habitIndex] = e.target.value;
                              setHabitNames(next);
                            }}
                            className="rounded-xl border border-[#DED0CB] bg-[#F7F1ED] px-3 py-3 font-serif text-lg outline-none"
                          />

                          {days.map((day, dayIndex) => (
                            <button
                              key={`${habitIndex}-${day}`}
                              type="button"
                              onClick={() => {
                                const next = habitChecks.map((row) => [...row]);
                                next[habitIndex][dayIndex] =
                                  !next[habitIndex][dayIndex];
                                setHabitChecks(next);
                              }}
                              className={`rounded-xl border py-3 font-serif text-lg transition ${
                                habitChecks[habitIndex][dayIndex]
                                  ? "border-[#A77B73] bg-[#DDB5AE] text-[#6F514B]"
                                  : "border-[#DED0CB] bg-[#F7F1ED] text-[#B79F99]"
                              }`}
                            >
                              {habitChecks[habitIndex][dayIndex] ? "♡" : "○"}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              plan less. follow through more. ♡
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
