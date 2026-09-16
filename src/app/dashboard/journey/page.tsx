"use client";

import Link from "next/link";

const januaryDays = Array.from({ length: 31 }, (_, i) => i + 1);
const februaryDays = Array.from({ length: 28 }, (_, i) => i + 32);
const marchDays = Array.from({ length: 16 }, (_, i) => i + 60);

const months = [
  {
    name: "JANUARY",
    subtitle: "Days 01 — 31",
    days: januaryDays,
  },
  {
    name: "FEBRUARY",
    subtitle: "Days 32 — 59",
    days: februaryDays,
  },
  {
    name: "MARCH",
    subtitle: "Days 60 — 75",
    days: marchDays,
  },
];

function getDateForDay(day: number) {
  const date = new Date(2027, 0, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function JourneyPage() {
  const currentDay = 1;
  const completedDays = 0;
  const streak = 0;
  const challengeProgress = Math.round((completedDays / 75) * 100);

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[250px] flex-col border-r border-[#E1D3CE] bg-[#FBF8F6] px-7 py-8 md:flex">
          <div>
            <p className="font-serif text-2xl tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1 text-[8px] tracking-[0.5em]">
              WITH LAV
            </p>
          </div>

          <nav className="mt-16 space-y-3">

            <Link
              href="/dashboard"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">♡</span>

              <span className="text-[9px] tracking-[0.25em]">
                TODAY
              </span>
            </Link>

            <Link
              href="/dashboard/journey"
              className="flex w-full items-center gap-4 rounded-2xl bg-[#EAD8D3] px-4 py-4 text-left"
            >
              <span className="font-serif text-lg">○</span>

              <span className="text-[9px] tracking-[0.25em]">
                JOURNEY
              </span>
            </Link>

            <button className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]">
              <span className="font-serif text-lg">□</span>

              <span className="text-[9px] tracking-[0.25em]">
                THE GUIDE
              </span>
            </button>

            <button className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]">
              <span className="font-serif text-lg">⌁</span>

              <span className="text-[9px] tracking-[0.25em]">
                RESOURCES
              </span>
            </button>

            <button className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]">
              <span className="font-serif text-lg">◇</span>

              <span className="text-[9px] tracking-[0.25em]">
                PROGRESS
              </span>
            </button>
          </nav>

          <div className="mt-auto border-t border-[#E1D3CE] pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDB5AE] font-serif">
                L
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em]">
                  LAV
                </p>

                <p className="mt-1 text-[8px] text-[#9A8780]">
                  MY ACCOUNT
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">

          {/* HEADER */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR 75 DAYS
              </p>

              <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                one day at a time. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* HERO */}
          <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

            <div className="rounded-[2rem] bg-[#211C19] p-8 text-[#F7F1ED] md:p-10">
              <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                YOUR JOURNEY
              </p>

              <h1 className="mt-7 max-w-2xl font-serif text-5xl leading-[0.9] md:text-7xl">
                75 days of
                <span className="block italic text-[#DDB5AE]">
                  choosing you.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-xs leading-6 text-[#C9BBB6]">
                Every completed day is proof that you showed up.
                Keep building the routine, discipline and confidence
                you came here for.
              </p>

              <div className="mt-10 h-[5px] overflow-hidden rounded-full bg-[#413735]">
                <div
                  className="h-full rounded-full bg-[#DDB5AE] transition-all duration-500"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between text-[7px] tracking-[0.2em] text-[#BFAEAA]">
                <span>DAY 01</span>
                <span>{challengeProgress}% COMPLETE</span>
                <span>DAY 75</span>
              </div>
            </div>

            {/* STATS */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-8">
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                YOUR PROGRESS
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-end justify-between border-b border-[#E1D3CE] pb-6">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    CURRENT DAY
                  </p>

                  <p className="font-serif text-4xl">
                    01
                  </p>
                </div>

                <div className="flex items-end justify-between border-b border-[#E1D3CE] pb-6">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    DAYS COMPLETE
                  </p>

                  <p className="font-serif text-4xl">
                    {completedDays}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <p className="text-[8px] tracking-[0.2em] text-[#8C7770]">
                    CURRENT STREAK
                  </p>

                  <p className="font-serif text-4xl">
                    {streak}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* LEGEND */}
          <div className="mt-12 flex flex-wrap gap-6 border-b border-[#DED0CB] pb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#A77B73]" />
              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                COMPLETE
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#DDB5AE]" />
              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                CURRENT
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-[#C9B7B1]" />
              <p className="text-[7px] tracking-[0.2em] text-[#806E68]">
                UPCOMING
              </p>
            </div>
          </div>

          {/* 75 DAY CALENDAR */}
          <section className="mt-12 space-y-12">
            {months.map((month) => (
              <div
                key={month.name}
                className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-9"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                      {month.subtitle}
                    </p>

                    <h2 className="mt-3 font-serif text-4xl">
                      {month.name}
                    </h2>
                  </div>

                  <p className="hidden font-serif text-lg italic text-[#A77B73] sm:block">
                    keep going. ♡
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-10">
                  {month.days.map((day) => {
                    const isCurrent = day === currentDay;
                    const isComplete = day < currentDay;

                    return (
                      <div
                        key={day}
                        className={`relative flex aspect-square min-h-[74px] flex-col items-center justify-center rounded-2xl border transition ${
                          isComplete
                            ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                            : isCurrent
                              ? "border-[#C79D95] bg-[#EAD8D3] text-[#211C19] shadow-sm"
                              : "border-[#E1D3CE] bg-[#F8F3F0] text-[#806E68]"
                        }`}
                      >
                        <p className="font-serif text-xl">
                          {String(day).padStart(2, "0")}
                        </p>

                        <p
                          className={`mt-1 text-[6px] tracking-[0.12em] ${
                            isComplete
                              ? "text-[#EEDDD8]"
                              : "text-[#9A8780]"
                          }`}
                        >
                          {getDateForDay(day)}
                        </p>

                        {isComplete && (
                          <span className="absolute right-2 top-2 text-[8px]">
                            ✓
                          </span>
                        )}

                        {isCurrent && (
                          <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#A77B73]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* WEEKLY CHECK-IN */}
          <section className="mt-12 rounded-[2rem] bg-[#EAD8D3] px-8 py-10 md:flex md:items-center md:justify-between md:px-10">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                WEEKLY CHECK-IN
              </p>

              <h2 className="mt-4 font-serif text-3xl italic md:text-4xl">
                Pause. Reflect. Keep going. ♡
              </h2>

              <p className="mt-4 max-w-xl text-xs leading-6 text-[#806E68]">
                At the end of each week, take a moment to celebrate
                what went well and decide what you want to carry
                into the next one.
              </p>
            </div>

            <button className="mt-7 rounded-full bg-[#211C19] px-8 py-4 text-[7px] tracking-[0.3em] text-[#F7F1ED] transition hover:-translate-y-0.5 md:mt-0">
              START CHECK-IN
            </button>
          </section>

          {/* BOTTOM QUOTE */}
          <div className="py-16 text-center">
            <p className="font-serif text-3xl italic text-[#A77B73]">
              imagine what 75 days of choosing yourself can do. ♡
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}