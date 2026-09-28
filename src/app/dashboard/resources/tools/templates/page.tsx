"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type TemplateKey = "weekly" | "meal" | "grocery" | "habits";

const templates = [
  {
    key: "weekly" as TemplateKey,
    number: "01",
    title: "WEEKLY RESET",
    subtitle: "map out the week.",
    description:
      "Set your priorities, workouts and focus before the week gets busy.",
    tag: "PLAN",
  },
  {
    key: "meal" as TemplateKey,
    number: "02",
    title: "MEAL PREP",
    subtitle: "make food easier.",
    description:
      "Jot down what you want to prep so meals take less thought later.",
    tag: "PREP",
  },
  {
    key: "grocery" as TemplateKey,
    number: "03",
    title: "GROCERY LIST",
    subtitle: "grab what you need.",
    description:
      "Keep a quick shopping list organized by food category.",
    tag: "SHOP",
  },
  {
    key: "habits" as TemplateKey,
    number: "04",
    title: "HABIT TRACKER",
    subtitle: "keep showing up.",
    description:
      "Choose the habits that matter and track seven days of consistency.",
    tag: "TRACK",
  },
];

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const emptyWorkouts = () =>
  Object.fromEntries(days.map((day) => [day, ""]));

const emptyMeals = () =>
  Array.from({ length: 5 }, () => ({ meal: "", prep: "" }));

const emptyGrocery = () => ({
  Protein: "",
  Produce: "",
  Carbs: "",
  "Fats + Extras": "",
});

const defaultHabits = () => [
  "Workout",
  "Water",
  "Read",
  "Nutrition",
];

const emptyHabitChecks = () =>
  Array.from({ length: 4 }, () => Array(7).fill(false));

function PlannerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h3M8 17h5" />
    </svg>
  );
}

export default function TemplatesPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [active, setActive] = useState<TemplateKey>("weekly");

  const [priorities, setPriorities] = useState(["", "", ""]);
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [workouts, setWorkouts] =
    useState<Record<string, string>>(emptyWorkouts());

  const [meals, setMeals] = useState(emptyMeals());

  const [grocery, setGrocery] =
    useState<Record<string, string>>(emptyGrocery());

  const [habitNames, setHabitNames] =
    useState(defaultHabits());

  const [habitChecks, setHabitChecks] =
    useState<boolean[][]>(emptyHabitChecks());

  const saveTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const getUserAndTemplates = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const { data, error } = await supabase
        .from("user_templates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Could not load templates:", error);
      }

      if (data) {
        if (Array.isArray(data.priorities)) {
          setPriorities(data.priorities);
        }

        setWeeklyFocus(data.weekly_focus ?? "");

        if (
          data.workouts &&
          typeof data.workouts === "object" &&
          !Array.isArray(data.workouts)
        ) {
          setWorkouts({
            ...emptyWorkouts(),
            ...data.workouts,
          });
        }

        if (Array.isArray(data.meals)) {
          setMeals(data.meals);
        }

        setGrocery({
          Protein: data.grocery_proteins ?? "",
          Produce: data.grocery_produce ?? "",
          Carbs: data.grocery_carbs ?? "",
          "Fats + Extras": data.grocery_extras ?? "",
        });

        if (Array.isArray(data.habits)) {
          setHabitNames(data.habits);
        }

        if (Array.isArray(data.habit_checks)) {
          setHabitChecks(data.habit_checks);
        }
      }

      setDataLoaded(true);
      setIsLoadingUser(false);
    };

    getUserAndTemplates();
  }, []);

  useEffect(() => {
    if (!userId || !dataLoaded) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("user_templates")
        .upsert(
          {
            user_id: userId,
            priorities,
            weekly_focus: weeklyFocus,
            workouts,
            meals,
            grocery_proteins: grocery.Protein ?? "",
            grocery_produce: grocery.Produce ?? "",
            grocery_carbs: grocery.Carbs ?? "",
            grocery_extras: grocery["Fats + Extras"] ?? "",
            habits: habitNames,
            habit_checks: habitChecks,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error("Could not save templates:", error);
      }
    }, 600);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [
    userId,
    dataLoaded,
    priorities,
    weeklyFocus,
    workouts,
    meals,
    grocery,
    habitNames,
    habitChecks,
  ]);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const activeTemplate = useMemo(
    () =>
      templates.find((template) => template.key === active) ??
      templates[0],
    [active]
  );

  const inputClass =
    "w-full border-b border-[#D8C7C1] bg-transparent px-1 py-3 text-[14px] outline-none transition placeholder:text-[#B4A09A] focus:border-[#A77B73]";

  const resetActive = () => {
    if (active === "weekly") {
      setPriorities(["", "", ""]);
      setWeeklyFocus("");
      setWorkouts(emptyWorkouts());
    }

    if (active === "meal") {
      setMeals(emptyMeals());
    }

    if (active === "grocery") {
      setGrocery(emptyGrocery());
    }

    if (active === "habits") {
      setHabitNames(defaultHabits());
      setHabitChecks(emptyHabitChecks());
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

        <section className="min-w-0 flex-1 px-5 py-8 md:px-10 lg:px-14">
          {/* HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.32em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                put it on paper. ♡
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
            <div className="grid gap-7 md:grid-cols-[1fr_0.7fr] md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAD8D3] text-[#9D6F67]">
                    <PlannerIcon className="h-5 w-5" />
                  </div>

                  <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                    PLANNING TOOLS
                  </p>
                </div>

                <h1 className="mt-5 font-serif text-4xl leading-[0.95] md:text-5xl">
                  Your little
                  <span className="block italic text-[#A77B73]">
                    planning desk. ♡
                  </span>
                </h1>
              </div>

              <div>
                <p className="max-w-lg text-[14px] leading-6 text-[#6F5F59]">
                  Simple spaces for the things you want to organize,
                  remember and follow through on.
                </p>

                <p className="mt-4 text-[8px] tracking-[0.18em] text-[#9D6F67]">
                  TYPE IT • LEAVE IT • COME BACK LATER
                </p>
              </div>
            </div>
          </section>

          {/* TEMPLATE NAV */}
          <section className="py-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] tracking-[0.28em] text-[#9D6F67]">
                  YOUR PAGES
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  What are we{" "}
                  <span className="italic text-[#A77B73]">
                    working on?
                  </span>
                </h2>
              </div>

              <p className="hidden text-[8px] tracking-[0.18em] text-[#927D76] sm:block">
                SAVES AUTOMATICALLY ♡
              </p>
            </div>

            <div className="grid overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] sm:grid-cols-2 xl:grid-cols-4">
              {templates.map((template, index) => {
                const isActive = active === template.key;

                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setActive(template.key)}
                    className={`relative p-5 text-left transition ${
                      index !== templates.length - 1
                        ? "border-b border-[#DED0CB] sm:border-b-0 sm:border-r"
                        : ""
                    } ${
                      index === 1
                        ? "sm:border-r-0 xl:border-r"
                        : ""
                    } ${
                      index === 2
                        ? "sm:border-b-0 sm:border-r"
                        : ""
                    } ${
                      isActive
                        ? "bg-[#EAD8D3]/65"
                        : "hover:bg-[#F3E8E4]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xl italic text-[#C39A92]">
                        {template.number}
                      </span>

                      <span className="text-[7px] tracking-[0.18em] text-[#927D76]">
                        {template.tag}
                      </span>
                    </div>

                    <p className="mt-5 text-[9px] tracking-[0.18em] text-[#6F5F59]">
                      {template.title}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      {template.subtitle}
                    </p>

                    {isActive && (
                      <div className="absolute bottom-0 left-5 right-5 h-px bg-[#A77B73]" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* WORKSPACE */}
          <section className="pb-10">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {/* WORKSPACE HEADER */}
              <div className="flex flex-col justify-between gap-5 border-b border-[#DED0CB] bg-[#EAD8D3]/25 px-6 py-6 md:flex-row md:items-center md:px-8">
                <div className="flex items-start gap-4">
                  <span className="font-serif text-3xl italic text-[#C39A92]">
                    {activeTemplate.number}
                  </span>

                  <div>
                    <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                      {activeTemplate.title}
                    </p>

                    <h2 className="mt-1 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                      {activeTemplate.subtitle}
                    </h2>

                    <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#806E68]">
                      {activeTemplate.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetActive}
                  className="w-fit text-[8px] tracking-[0.18em] text-[#9D6F67] underline decoration-[#CBA9A2] underline-offset-4 transition hover:text-[#211C19]"
                >
                  CLEAR THIS PAGE
                </button>
              </div>

              {/* WEEKLY RESET */}
              {active === "weekly" && (
                <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="border-b border-[#DED0CB] p-6 md:p-8 lg:border-b-0 lg:border-r">
                    <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                      TOP 3 PRIORITIES
                    </p>

                    <div className="mt-5">
                      {priorities.map((priority, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 border-b border-[#E1D3CE]"
                        >
                          <span className="font-serif text-xl italic text-[#C39A92]">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <input
                            value={priority}
                            onChange={(e) => {
                              const next = [...priorities];
                              next[index] = e.target.value;
                              setPriorities(next);
                            }}
                            placeholder="What needs your attention?"
                            className="w-full bg-transparent py-4 text-[14px] outline-none placeholder:text-[#B4A09A]"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                        THIS WEEK&apos;S FOCUS
                      </p>

                      <textarea
                        value={weeklyFocus}
                        onChange={(e) =>
                          setWeeklyFocus(e.target.value)
                        }
                        placeholder="What matters most this week?"
                        rows={5}
                        className="mt-4 w-full resize-none border-b border-[#D8C7C1] bg-transparent py-3 font-serif text-xl leading-8 outline-none placeholder:italic placeholder:text-[#B4A09A] focus:border-[#A77B73]"
                      />
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                          TRAINING PLAN
                        </p>

                        <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                          seven days at a glance. ♡
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 divide-y divide-[#E1D3CE] border-y border-[#E1D3CE]">
                      {days.map((day) => (
                        <label
                          key={day}
                          className="grid grid-cols-[55px_1fr] items-center gap-4 py-3.5"
                        >
                          <span className="text-[8px] tracking-[0.16em] text-[#9D6F67]">
                            {day}
                          </span>

                          <input
                            value={workouts[day] ?? ""}
                            onChange={(e) =>
                              setWorkouts({
                                ...workouts,
                                [day]: e.target.value,
                              })
                            }
                            placeholder="Workout / rest"
                            className="w-full bg-transparent font-serif text-lg outline-none placeholder:italic placeholder:text-[#B7A5A0]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MEAL PREP */}
              {active === "meal" && (
                <div className="p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-[0.45fr_1.55fr]">
                    <div>
                      <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                        PREP NOTES
                      </p>

                      <h3 className="mt-3 font-serif text-2xl">
                        Make food take{" "}
                        <span className="italic text-[#A77B73]">
                          less thought.
                        </span>
                      </h3>

                      <p className="mt-3 max-w-xs text-[12px] leading-5 text-[#806E68]">
                        This isn&apos;t another meal planner. Use it as a
                        quick prep sheet for meals you want ready or partly
                        ready ahead of time.
                      </p>
                    </div>

                    <div className="border-y border-[#E1D3CE]">
                      <div className="hidden grid-cols-[45px_1fr_1fr] gap-4 border-b border-[#E1D3CE] py-3 md:grid">
                        <span />
                        <span className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                          MEAL / FOOD
                        </span>
                        <span className="text-[8px] tracking-[0.18em] text-[#9D6F67]">
                          PREP / NOTES
                        </span>
                      </div>

                      {meals.map((item, index) => (
                        <div
                          key={index}
                          className="grid gap-2 border-b border-[#E1D3CE] py-4 last:border-b-0 md:grid-cols-[45px_1fr_1fr] md:gap-4"
                        >
                          <span className="font-serif text-lg italic text-[#C39A92]">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <input
                            value={item.meal}
                            onChange={(e) => {
                              const next = [...meals];
                              next[index] = {
                                ...next[index],
                                meal: e.target.value,
                              };
                              setMeals(next);
                            }}
                            placeholder="Meal / food"
                            className={inputClass}
                          />

                          <input
                            value={item.prep}
                            onChange={(e) => {
                              const next = [...meals];
                              next[index] = {
                                ...next[index],
                                prep: e.target.value,
                              };
                              setMeals(next);
                            }}
                            placeholder="Prep / notes"
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GROCERY */}
              {active === "grocery" && (
                <div className="p-6 md:p-8">
                  <div className="mb-7">
                    <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                      SHOPPING NOTES
                    </p>

                    <h3 className="mt-2 font-serif text-2xl">
                      Write it down.{" "}
                      <span className="italic text-[#A77B73]">
                        grab it. go. ♡
                      </span>
                    </h3>
                  </div>

                  <div className="grid border-y border-[#E1D3CE] md:grid-cols-2">
                    {Object.entries(grocery).map(
                      ([category, value], index) => (
                        <label
                          key={category}
                          className={`p-5 md:p-6 ${
                            index % 2 === 0
                              ? "md:border-r md:border-[#E1D3CE]"
                              : ""
                          } ${
                            index < 2
                              ? "border-b border-[#E1D3CE]"
                              : index === 2
                              ? "border-b border-[#E1D3CE] md:border-b-0"
                              : ""
                          }`}
                        >
                          <span className="text-[8px] tracking-[0.2em] text-[#9D6F67]">
                            {category.toUpperCase()}
                          </span>

                          <textarea
                            value={value}
                            onChange={(e) =>
                              setGrocery({
                                ...grocery,
                                [category]: e.target.value,
                              })
                            }
                            placeholder="Add items..."
                            rows={5}
                            className="mt-3 w-full resize-none bg-transparent font-serif text-lg leading-7 outline-none placeholder:italic placeholder:text-[#B4A09A]"
                          />
                        </label>
                      )
                    )}
                  </div>

                  <p className="mt-5 text-[10px] leading-5 text-[#927D76]">
                    Need the grocery list connected to your actual meal
                    plan? Use the{" "}
                    <Link
                      href="/dashboard/resources/meal-plans/grocery-list"
                      className="text-[#9D6F67] underline underline-offset-4"
                    >
                      Smart Grocery List
                    </Link>
                    .
                  </p>
                </div>
              )}

              {/* HABITS */}
              {active === "habits" && (
                <div className="p-6 md:p-8">
                  <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                        SEVEN DAY CHECK-IN
                      </p>

                      <h3 className="mt-2 font-serif text-2xl">
                        Track what you want to{" "}
                        <span className="italic text-[#A77B73]">
                          repeat. ♡
                        </span>
                      </h3>
                    </div>

                    <p className="text-[8px] tracking-[0.16em] text-[#927D76]">
                      TAP A CIRCLE TO CHECK IT OFF
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[680px]">
                      <div className="grid grid-cols-[170px_repeat(7,1fr)]">
                        <div className="border-b border-[#E1D3CE]" />

                        {days.map((day) => (
                          <div
                            key={day}
                            className="border-b border-[#E1D3CE] pb-3 text-center text-[8px] tracking-[0.14em] text-[#9D6F67]"
                          >
                            {day}
                          </div>
                        ))}

                        {habitNames.map(
                          (habit, habitIndex) => (
                            <div
                              className="contents"
                              key={habitIndex}
                            >
                              <div className="border-b border-[#E1D3CE] py-3 pr-4">
                                <input
                                  value={habit}
                                  onChange={(e) => {
                                    const next = [...habitNames];
                                    next[habitIndex] =
                                      e.target.value;
                                    setHabitNames(next);
                                  }}
                                  className="w-full bg-transparent font-serif text-lg outline-none"
                                />
                              </div>

                              {days.map((day, dayIndex) => {
                                const checked =
                                  habitChecks[habitIndex]?.[
                                    dayIndex
                                  ];

                                return (
                                  <div
                                    key={`${habitIndex}-${day}`}
                                    className="flex items-center justify-center border-b border-[#E1D3CE] py-3"
                                  >
                                    <button
                                      type="button"
                                      aria-label={`${habit} ${day}`}
                                      onClick={() => {
                                        const next =
                                          habitChecks.map(
                                            (row) => [...row]
                                          );

                                        next[habitIndex][
                                          dayIndex
                                        ] = !next[habitIndex][
                                          dayIndex
                                        ];

                                        setHabitChecks(next);
                                      }}
                                      className={`flex h-8 w-8 items-center justify-center rounded-full border font-serif text-sm transition ${
                                        checked
                                          ? "border-[#A77B73] bg-[#DDB5AE] text-[#6F514B]"
                                          : "border-[#D6C3BD] text-[#B79F99] hover:border-[#A77B73]"
                                      }`}
                                    >
                                      {checked ? "♡" : ""}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* LITTLE NOTE */}
          <section className="border-y border-[#DED0CB] py-7">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.22em] text-[#9D6F67]">
                  NO SAVE BUTTON NEEDED
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                  leave it here. come back when you need it. ♡
                </p>
              </div>

              <p className="max-w-md text-[11px] leading-5 text-[#806E68]">
                Your template entries save automatically while you use
                them.
              </p>
            </div>
          </section>

          {/* END */}
          <section className="pb-14 pt-9 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              plan less. follow through more. ♡
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