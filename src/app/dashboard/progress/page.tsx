import Link from "next/link";

const stats = [
  {
    value: "01",
    label: "CURRENT DAY",
  },
  {
    value: "0",
    label: "DAYS COMPLETE",
  },
  {
    value: "0",
    label: "CURRENT STREAK",
  },
  {
    value: "0",
    label: "CHECK-INS",
  },
];

const measurements = [
  ["WEIGHT", "—"],
  ["WAIST", "—"],
  ["HIPS", "—"],
  ["THIGHS", "—"],
];

const wins = [
  "I feel stronger",
  "My energy is better",
  "I'm more consistent",
  "My clothes fit differently",
];

export default function ProgressPage() {
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
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">○</span>

              <span className="text-[9px] tracking-[0.25em]">
                JOURNEY
              </span>
            </Link>

            <Link
              href="/dashboard/guide"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">□</span>

              <span className="text-[9px] tracking-[0.25em]">
                THE GUIDE
              </span>
            </Link>

            <Link
              href="/dashboard/resources"
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-[#806E68] transition hover:bg-[#F1E6E2]"
            >
              <span className="font-serif text-lg">⌁</span>

              <span className="text-[9px] tracking-[0.25em]">
                RESOURCES
              </span>
            </Link>

            <Link
              href="/dashboard/progress"
              className="flex w-full items-center gap-4 rounded-2xl bg-[#EAD8D3] px-4 py-4 text-left"
            >
              <span className="font-serif text-lg">◇</span>

              <span className="text-[9px] tracking-[0.25em]">
                PROGRESS
              </span>
            </Link>
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

        {/* MAIN */}
        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">

          {/* TOP */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                look how far you&apos;ve come. ♡
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
          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-9 text-[#F7F1ED] md:px-10 md:py-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
                  YOUR PROGRESS
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Day 01
                  <span className="italic text-[#DDB5AE]">
                    {" "}/ 75
                  </span>
                </h1>

                <p className="mt-3 font-serif text-xl italic text-[#DDB5AE]">
                  we&apos;re just getting started. ♡
                </p>
              </div>

              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] tracking-[0.2em] text-[#BFAEAA]">
                    CHALLENGE PROGRESS
                  </span>

                  <span className="font-serif text-lg text-[#DDB5AE]">
                    1%
                  </span>
                </div>

                <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[#493D39]">
                  <div className="h-full w-[1.33%] rounded-full bg-[#DDB5AE]" />
                </div>

                <div className="mt-2 flex justify-between text-[6px] tracking-[0.18em] text-[#8F7C76]">
                  <span>JAN 01</span>
                  <span>MAR 16</span>
                </div>
              </div>

            </div>
          </section>

          {/* STATS */}
          <section className="grid grid-cols-2 gap-3 py-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-6"
              >
                <p className="font-serif text-3xl text-[#A77B73]">
                  {stat.value}
                </p>

                <p className="mt-2 text-[6px] tracking-[0.22em] text-[#806E68]">
                  {stat.label}
                </p>
              </div>
            ))}
          </section>

          {/* PROGRESS PHOTOS */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
                  PROGRESS PHOTOS
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  See the
                  <span className="italic text-[#A77B73]">
                    {" "}difference.
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                <span>♡</span>
                <span>PRIVATE TO YOU</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">

              {/* DAY 1 */}
              <div className="group overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="flex aspect-[4/5] items-center justify-center bg-[#EEE3DF]">
                  <button className="flex flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-2xl text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                      +
                    </span>

                    <span className="mt-3 text-[7px] tracking-[0.2em] text-[#8F655E]">
                      ADD PHOTO
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      DAY 01
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the beginning.
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    JAN 01
                  </span>
                </div>
              </div>

              {/* CURRENT */}
              <div className="group overflow-hidden rounded-[1.75rem] border border-[#CBA9A2] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center bg-[#EAD8D3]">
                  <span className="absolute left-4 top-4 rounded-full bg-[#211C19] px-4 py-2 text-[6px] tracking-[0.2em] text-[#F7F1ED]">
                    CURRENT
                  </span>

                  <button className="flex flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B48A82] font-serif text-2xl text-[#9D6F67] transition group-hover:bg-[#DFC7C1]">
                      +
                    </span>

                    <span className="mt-3 text-[7px] tracking-[0.2em] text-[#8F655E]">
                      ADD PHOTO
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      DAY 01
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      right now.
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    TODAY
                  </span>
                </div>
              </div>

              {/* DAY 75 */}
              <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="flex aspect-[4/5] items-center justify-center bg-[#F1EAE7]">
                  <div className="text-center">
                    <span className="font-serif text-4xl text-[#D0B7B1]">
                      ♡
                    </span>

                    <p className="mt-3 text-[7px] tracking-[0.2em] text-[#A7938D]">
                      SEE YOU ON DAY 75
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      DAY 75
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the finish.
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    MAR 16
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* MEASUREMENTS + WINS */}
          <section className="grid gap-5 border-t border-[#DED0CB] py-12 lg:grid-cols-2">

            {/* MEASUREMENTS */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[7px] tracking-[0.35em] text-[#9D6F67]">
                    MEASUREMENTS
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Your numbers.
                  </h2>
                </div>

                <button className="rounded-full border border-[#CBA9A2] px-4 py-2 text-[6px] tracking-[0.2em] text-[#8F655E]">
                  + UPDATE
                </button>
              </div>

              <div className="mt-7">
                {measurements.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-t border-[#E1D3CE] py-4"
                  >
                    <span className="text-[7px] tracking-[0.2em] text-[#806E68]">
                      {label}
                    </span>

                    <span className="font-serif text-xl text-[#A77B73]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[9px] italic text-[#9A8780]">
                Optional — track what matters to you. ♡
              </p>
            </div>

            {/* WINS */}
            <div className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
              <p className="text-[7px] tracking-[0.35em] text-[#8F655E]">
                LITTLE WINS
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                What&apos;s changing?
              </h2>

              <div className="mt-7 space-y-3">
                {wins.map((win) => (
                  <button
                    key={win}
                    className="flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] bg-[#F1E2DE]/50 px-5 py-4 text-left transition hover:bg-[#F1E2DE]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] text-[#9D6F67]">
                      ♡
                    </span>

                    <span className="font-serif text-lg italic">
                      {win}
                    </span>
                  </button>
                ))}
              </div>

              <button className="mt-5 text-[7px] tracking-[0.2em] text-[#8F655E]">
                + ADD YOUR OWN
              </button>
            </div>
          </section>

          {/* WEEKLY CHECK-INS */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
                  WEEKLY CHECK-INS
                </p>

                <h2 className="mt-3 font-serif text-4xl">
                  Check in with
                  <span className="italic text-[#A77B73]">
                    {" "}yourself. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">
                0 OF 11 COMPLETE
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

              {/* WEEK 1 */}
              <button className="group rounded-[1.5rem] border border-[#CBA9A2] bg-[#FBF8F6] p-5 text-left transition hover:bg-[#F3EAE6]">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-[#A77B73]">
                    01
                  </span>

                  <span className="rounded-full bg-[#EAD8D3] px-3 py-1.5 text-[6px] tracking-[0.18em] text-[#8F655E]">
                    UPCOMING
                  </span>
                </div>

                <p className="mt-5 text-[7px] tracking-[0.22em]">
                  WEEK ONE
                </p>

                <p className="mt-1 font-serif text-xl italic text-[#A77B73]">
                  how are we feeling?
                </p>

                <div className="mt-5 border-t border-[#E1D3CE] pt-4">
                  <span className="text-[6px] tracking-[0.2em] text-[#9D6F67]">
                    DAY 07 →
                  </span>
                </div>
              </button>

              {/* LOCKED FUTURE CHECK-INS */}
              {Array.from({ length: 10 }, (_, index) => index + 2).map(
                (week) => (
                  <div
                    key={week}
                    className="rounded-[1.5rem] border border-[#DED0CB] bg-[#F5EFEC] p-5 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl text-[#BDA6A0]">
                        {String(week).padStart(2, "0")}
                      </span>

                      <span className="text-[10px] text-[#AA9690]">
                        ♡
                      </span>
                    </div>

                    <p className="mt-5 text-[7px] tracking-[0.22em] text-[#806E68]">
                      WEEK {String(week).padStart(2, "0")}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A7938D]">
                      keep going.
                    </p>
                  </div>
                )
              )}

            </div>
          </section>

          {/* PROGRESS REMINDER */}
          <section className="rounded-[2rem] bg-[#211C19] px-8 py-10 text-center text-[#F7F1ED] md:px-12">
            <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
              REMEMBER
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-none md:text-5xl">
              Progress is more than
              <span className="block italic text-[#DDB5AE]">
                a photo.
              </span>
            </h2>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {[
                "STRONGER",
                "MORE CONSISTENT",
                "MORE ENERGY",
                "BETTER HABITS",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#51433F] px-4 py-2 text-[6px] tracking-[0.18em] text-[#C8B9B4]"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* END */}
          <section className="py-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              keep going. you&apos;re becoming her. ♡
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-9 py-3.5 text-[7px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO TODAY
            </Link>
          </section>

        </section>
      </div>
    </main>
  );
}