"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentChallengeDay } from "@/lib/challenge";
import DashboardSidebar from "@/components/DashboardSidebar";

const commitments = [
  {
    number: "01",
    title: "WORKOUT #1",
    description: "45 min movement",
    column: "move",
  },
  {
    number: "02",
    title: "WORKOUT #2",
    description: "Get outside",
    column: "get_outside",
  },
  {
    number: "03",
    title: "HYDRATE",
    description: "Hit your water goal",
    column: "hydrate",
  },
  {
    number: "04",
    title: "READ",
    description: "10 pages",
    column: "read",
  },
  {
    number: "05",
    title: "NUTRITION",
    description: "Stay on plan",
    column: "nourish",
  },
  {
    number: "06",
    title: "PROGRESS PHOTO",
    description: "Document the journey",
    column: "document",
  },
  {
    number: "07",
    title: "NO ALCOHOL",
    description: "Stay alcohol-free",
    column: "no_alcohol",
  },
] as const;

type CommitmentColumn = (typeof commitments)[number]["column"];

type DailyProgress = {
  move: boolean;
  get_outside: boolean;
  hydrate: boolean;
  read: boolean;
  nourish: boolean;
  document: boolean;
  no_alcohol: boolean;
};

const emptyProgress: DailyProgress = {
  move: false,
  get_outside: false,
  hydrate: false,
  read: false,
  nourish: false,
  document: false,
  no_alcohol: false,
};

function formatDateForDatabase(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<DailyProgress>(emptyProgress);
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [waterBottles, setWaterBottles] = useState(0);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

  const currentDay = challengeStartDate
    ? getCurrentChallengeDay(challengeStartDate, today)
    : 1;

  const dayNumber = String(currentDay).padStart(2, "0");

  const currentHour = today.getHours();

  let greeting = "good morning";

  if (currentHour >= 12 && currentHour < 17) {
    greeting = "good afternoon";
  } else if (currentHour >= 17) {
    greeting = "good evening";
  }

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoadingUser(true);
      setIsLoadingProgress(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load user:", userError);
      }

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
        return;
      }

      setUserId(user.id);

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Could not load profile:", profileError);
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
        return;
      }

      if (!profile?.challenge_start_date) {
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
        return;
      }

      setChallengeStartDate(profile.challenge_start_date);

      const calculatedDay = getCurrentChallengeDay(
        profile.challenge_start_date
      );

      const savedWaterBottles = Number(
        localStorage.getItem(`water-bottles-${user.id}-${calculatedDay}`) || "0"
      );
      setWaterBottles(Math.min(Math.max(savedWaterBottles, 0), 8));

      const { data: savedProgress, error: progressError } = await supabase
        .from("daily_progress")
        .select(
          "move, get_outside, hydrate, read, nourish, document, no_alcohol"
        )
        .eq("user_id", user.id)
        .eq("challenge_day", calculatedDay)
        .maybeSingle();

      if (progressError) {
        console.error("Could not load daily progress:", progressError);
      } else if (savedProgress) {
        if (
          savedProgress.hydrate &&
          !localStorage.getItem(`water-bottles-${user.id}-${calculatedDay}`)
        ) {
          setWaterBottles(8);
          localStorage.setItem(
            `water-bottles-${user.id}-${calculatedDay}`,
            "8"
          );
        }

        setProgress({
          move: savedProgress.move,
          get_outside: savedProgress.get_outside,
          hydrate: savedProgress.hydrate,
          read: savedProgress.read,
          nourish: savedProgress.nourish,
          document: savedProgress.document,
          no_alcohol: savedProgress.no_alcohol ?? false,
        });
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadDashboard();
  }, []);

  const toggleCommitment = async (
    column: CommitmentColumn
  ) => {
    if (!userId || !challengeStartDate || isLoadingProgress) {
      return;
    }

    const newValue = !progress[column];

    const updatedProgress = {
      ...progress,
      [column]: newValue,
    };

    // Update the UI immediately.
    setProgress(updatedProgress);

    const progressDate = formatDateForDatabase(today);

    const { error } = await supabase.from("daily_progress").upsert(
      {
        user_id: userId,
        challenge_day: currentDay,
        progress_date: progressDate,
        move: updatedProgress.move,
        get_outside: updatedProgress.get_outside,
        hydrate: updatedProgress.hydrate,
        read: updatedProgress.read,
        nourish: updatedProgress.nourish,
        document: updatedProgress.document,
        no_alcohol: updatedProgress.no_alcohol,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,challenge_day",
      }
    );

    if (error) {
      console.error("Could not save daily progress:", error);

      // Put the UI back if Supabase could not save it.
      setProgress(progress);
    }
  };

  const updateWaterBottles = async (nextCount: number) => {
    if (!userId || !challengeStartDate || isLoadingProgress) return;

    const clampedCount = Math.min(Math.max(nextCount, 0), 8);
    const hydrateComplete = clampedCount === 8;

    setWaterBottles(clampedCount);
    localStorage.setItem(
      `water-bottles-${userId}-${currentDay}`,
      String(clampedCount)
    );

    const updatedProgress = {
      ...progress,
      hydrate: hydrateComplete,
    };

    setProgress(updatedProgress);

    const progressDate = formatDateForDatabase(today);

    const { error } = await supabase.from("daily_progress").upsert(
      {
        user_id: userId,
        challenge_day: currentDay,
        progress_date: progressDate,
        move: updatedProgress.move,
        get_outside: updatedProgress.get_outside,
        hydrate: updatedProgress.hydrate,
        read: updatedProgress.read,
        nourish: updatedProgress.nourish,
        document: updatedProgress.document,
        no_alcohol: updatedProgress.no_alcohol,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,challenge_day",
      }
    );

    if (error) {
      console.error("Could not save water progress:", error);
    }
  };

  const completedCount = commitments.filter(
    (item) => progress[item.column]
  ).length;

  const percentage = Math.round(
    (completedCount / commitments.length) * 100
  );

  const dayComplete = completedCount === commitments.length;

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        {/* DASHBOARD */}
        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* TOP BAR */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                {formattedDate}
              </p>

              <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                {isLoadingUser
                  ? `${greeting}. ♡`
                  : `${greeting}, ${firstName}. ♡`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAD8D3] font-serif md:hidden">
              {initial}
            </div>
          </header>

          {/* DAY HERO */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            {/* CHALLENGE CARD */}
            <div className="rounded-[2rem] bg-[#211C19] p-8 text-[#F7F1ED] md:p-10">
              <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                YOUR CHALLENGE
              </p>

              <div className="mt-7 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div>
                  <h1 className="font-serif text-6xl leading-none md:text-8xl">
                    Day {dayNumber}
                  </h1>

                  <p className="mt-4 text-[9px] tracking-[0.35em] text-[#BFAEAA]">
                    OF 75
                  </p>
                </div>

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[7px] border-[#DDB5AE]">
                  <div className="text-center">
                    <p className="font-serif text-3xl">
                      {percentage}%
                    </p>

                    <p className="mt-1 text-[6px] tracking-[0.25em] text-[#D5C8C3]">
                      TODAY
                    </p>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-10 h-[5px] overflow-hidden rounded-full bg-[#413735]">
                <div
                  className="h-full rounded-full bg-[#DDB5AE] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="mt-5 font-serif text-xl italic text-[#DDB5AE]">
                {dayComplete
                  ? `Day ${dayNumber} complete. You showed up. ♡`
                  : currentDay === 1
                    ? "day one. show up for yourself. ♡"
                    : `day ${currentDay}. keep showing up. ♡`}
              </p>
            </div>

            {/* JOURNEY CARD */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR JOURNEY
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-none">
                75 days of
                <span className="block italic text-[#A77B73]">
                  choosing you.
                </span>
              </h2>

              <div className="mt-9 grid grid-cols-3 text-center">
                <div>
                  <p className="font-serif text-3xl">
                    {dayNumber}
                  </p>

                  <p className="mt-2 text-[6px] tracking-[0.2em] text-[#8C7770]">
                    CURRENT
                  </p>
                </div>

                <div className="border-x border-[#DED0CB]">
                  <p className="font-serif text-3xl">
                    {dayComplete ? "1" : "0"}
                  </p>

                  <p className="mt-2 text-[6px] tracking-[0.2em] text-[#8C7770]">
                    COMPLETE
                  </p>
                </div>

                <div>
                  <p className="font-serif text-3xl">
                    {dayComplete ? "1" : "0"}
                  </p>

                  <p className="mt-2 text-[6px] tracking-[0.2em] text-[#8C7770]">
                    STREAK
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/journey"
                className="mt-9 block w-full rounded-full border border-[#CBA9A2] py-3 text-center text-[7px] tracking-[0.3em] transition hover:bg-[#EAD8D3]"
              >
                VIEW JOURNEY
              </Link>
            </div>
          </div>

          {/* COMMITMENTS */}
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  DAY {dayNumber}
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Today&apos;s commitments
                </h2>
              </div>

              <p className="hidden font-serif text-xl italic text-[#A77B73] sm:block">
                {isLoadingProgress
                  ? "loading... ♡"
                  : `${completedCount}/${commitments.length} complete ♡`}
              </p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {commitments.map((item) => {
                const isComplete = progress[item.column];

                if (item.column === "hydrate") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-2xl border p-5 transition duration-300 lg:col-span-2 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#DDB5AE] text-[#211C19]"
                              : "border-[#CBA9A2] text-[#A77B73]"
                          }`}
                        >
                          {item.number}
                        </div>

                        <div className="flex-1">
                          <p className="text-[11px] tracking-[0.18em] text-[#211C19]">
                            HYDRATE
                          </p>
                          <p className="mt-2 text-sm leading-5 text-[#8C7770]">
                            {waterBottles}/8 bottles • 1 gallon
                          </p>
                        </div>

                        <span className="font-serif text-xl italic text-[#A77B73]">
                          {isComplete ? "done ♡" : `${waterBottles}/8`}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-8 gap-2">
                        {Array.from({ length: 8 }).map((_, index) => {
                          const filled = index < waterBottles;

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={isLoadingProgress}
                              onClick={() =>
                                updateWaterBottles(
                                  filled && index === waterBottles - 1
                                    ? index
                                    : index + 1
                                )
                              }
                              aria-label={`Bottle ${index + 1} ${
                                filled ? "complete" : "incomplete"
                              }`}
                              className={`flex h-12 items-center justify-center rounded-xl border text-lg transition hover:-translate-y-0.5 ${
                                filled
                                  ? "border-[#A77B73] bg-[#DDB5AE]"
                                  : "border-[#D6C3BD] bg-[#F7F1ED]"
                              }`}
                            >
                              <span
                                className={
                                  filled ? "opacity-100" : "opacity-35"
                                }
                              >
                                ♡
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 text-[10px] tracking-[0.14em] text-[#9D6F67]">
                        TAP AS YOU GO • EACH = 16 OZ
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.number}
                    onClick={() => toggleCommitment(item.column)}
                    className={`group flex items-center gap-5 rounded-2xl border p-5 transition duration-300 ${
                      isLoadingProgress
                        ? "cursor-wait opacity-70"
                        : "cursor-pointer"
                    } ${
                      isComplete
                        ? "border-[#CBA9A2] bg-[#EAD8D3]"
                        : "border-[#DED0CB] bg-[#FBF8F6] hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#DDB5AE] text-[#211C19]"
                          : "border-[#CBA9A2] text-[#A77B73]"
                      }`}
                    >
                      {item.number}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-[11px] tracking-[0.18em] ${
                          isComplete ? "text-[#6F514B]" : "text-[#211C19]"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-2 text-sm leading-5 text-[#8C7770]">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLoadingProgress}
                      aria-label={`Mark ${item.title} ${
                        isComplete ? "incomplete" : "complete"
                      }`}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : "border-[#BFA39D] group-hover:bg-[#F1E6E2]"
                      }`}
                    >
                      {isComplete ? "✓" : ""}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* COMPLETION MESSAGE */}
          {dayComplete && (
            <section className="mt-8 rounded-[2rem] border border-[#D4B0A8] bg-[#FBF8F6] px-8 py-10 text-center">
              <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                DAY {dayNumber} COMPLETE
              </p>

              <p className="mt-5 font-serif text-4xl italic text-[#A77B73] md:text-5xl">
                You kept your promise to yourself. ♡
              </p>

              <p className="mx-auto mt-5 max-w-lg text-xs leading-6 text-[#806E68]">
                One day down. Keep choosing yourself, one day at a time.
              </p>
            </section>
          )}

          {/* DAILY NOTE */}
          <section className="mt-12 rounded-[2rem] bg-[#EAD8D3] px-8 py-10 md:px-10">
            <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
              A NOTE FOR TODAY
            </p>

            <p className="mt-5 max-w-3xl font-serif text-3xl italic leading-snug md:text-4xl">
              You don&apos;t have to have the next 75 days figured out.
              You just have to show up for today.
            </p>

            <p className="mt-6 text-[8px] tracking-[0.3em] text-[#8F655E]">
              ONE DAY AT A TIME ♡
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}