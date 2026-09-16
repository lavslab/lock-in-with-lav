"use client";

import { useState } from "react";

const commitments = [
  {
    number: "01",
    title: "WORKOUT #1",
    description: "45 min movement",
  },
  {
    number: "02",
    title: "WORKOUT #2",
    description: "Get outside",
  },
  {
    number: "03",
    title: "HYDRATE",
    description: "Hit your water goal",
  },
  {
    number: "04",
    title: "READ",
    description: "10 pages",
  },
  {
    number: "05",
    title: "NUTRITION",
    description: "Stay on plan",
  },
  {
    number: "06",
    title: "PROGRESS PHOTO",
    description: "Document the journey",
  },
];

export default function DashboardPage() {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleCommitment = (index: number) => {
    setCompleted((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  const percentage = Math.round(
    (completed.length / commitments.length) * 100
  );

  const dayComplete = completed.length === commitments.length;

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
            <button className="flex w-full items-center gap-4 rounded-2xl bg-[#EAD8D3] px-4 py-4 text-left">
              <span className="font-serif text-lg">♡</span>

              <span className="text-[9px] tracking-[0.25em]">
                TODAY
              </span>
            </button>

            <button className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]">
              <span className="font-serif text-lg">○</span>

              <span className="text-[9px] tracking-[0.25em]">
                JOURNEY
              </span>
            </button>

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

        {/* DASHBOARD */}
        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">

          {/* TOP BAR */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                THURSDAY • JANUARY 01, 2027
              </p>

              <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                good morning, Lav. ♡
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAD8D3] font-serif md:hidden">
              L
            </div>
          </header>

          {/* DAY HERO */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">

            <div className="rounded-[2rem] bg-[#211C19] p-8 text-[#F7F1ED] md:p-10">
              <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                YOUR CHALLENGE
              </p>

              <div className="mt-7 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div>
                  <h1 className="font-serif text-6xl leading-none md:text-8xl">
                    Day 01
                  </h1>

                  <p className="mt-4 text-[9px] tracking-[0.35em] text-[#BFAEAA]">
                    OF 75
                  </p>
                </div>

                {/* PERCENTAGE */}
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
                  ? "Day 01 complete. You showed up. ♡"
                  : "day one. show up for yourself. ♡"}
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
                  <p className="font-serif text-3xl">01</p>

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

              <button className="mt-9 w-full rounded-full border border-[#CBA9A2] py-3 text-[7px] tracking-[0.3em] transition hover:bg-[#EAD8D3]">
                VIEW JOURNEY
              </button>
            </div>
          </div>

          {/* COMMITMENTS */}
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                  DAY 01
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Today&apos;s commitments
                </h2>
              </div>

              <p className="hidden font-serif text-xl italic text-[#A77B73] sm:block">
                {completed.length}/{commitments.length} complete ♡
              </p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {commitments.map((item, index) => {
                const isComplete = completed.includes(index);

                return (
                  <div
                    key={item.number}
                    onClick={() => toggleCommitment(index)}
                    className={`group flex cursor-pointer items-center gap-5 rounded-2xl border p-5 transition duration-300 ${
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
                        className={`text-[9px] tracking-[0.2em] ${
                          isComplete
                            ? "text-[#6F514B]"
                            : "text-[#211C19]"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-2 text-xs text-[#8C7770]">
                        {item.description}
                      </p>
                    </div>

                    {/* CHECK BUTTON */}
                    <button
                      type="button"
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
                DAY 01 COMPLETE
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