const tasks = [
  ["01", "WORKOUT #1", "45 min movement"],
  ["02", "WORKOUT #2", "Get outside"],
  ["03", "HYDRATE", "Hit your water goal"],
  ["04", "READ", "10 pages"],
  ["05", "NUTRITION", "Stay on plan"],
  ["06", "PROGRESS PHOTO", "Document the journey"],
];

const journeyDays = Array.from({ length: 28 }, (_, i) => i + 1);

export default function AppPreview() {
  return (
    <section className="overflow-hidden bg-[#211C19] px-6 py-28 text-[#F7F1ED] md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">

        {/* HEADING */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[9px] tracking-[0.45em] text-[#DDB5AE]">
            YOUR PERSONAL DASHBOARD
          </p>

          <h2 className="mt-7 font-serif text-5xl leading-[0.9] md:text-8xl">
            Your 75 days,
            <span className="block italic text-[#DDB5AE]">
              all in one place.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-[#C9BBB6]">
            Your habits, progress, photos, resources and weekly check-ins —
            organized in one place so all you have to do is show up.
          </p>
        </div>

        {/* PHONES */}
        <div className="relative mx-auto mt-24 flex max-w-4xl items-center justify-center pb-10 md:min-h-[760px]">

          {/* TODAY PHONE */}
          <div className="relative z-20 w-[285px] rounded-[3rem] border-[7px] border-[#120F0E] bg-[#F8F3F0] p-2 shadow-2xl md:w-[330px] md:-translate-x-16 md:-rotate-[4deg]">
            <div className="overflow-hidden rounded-[2.45rem] bg-[#F8F3F0] text-[#211C19]">

              {/* PHONE TOP */}
              <div className="relative px-5 pb-5 pt-7">
                <div className="absolute left-1/2 top-3 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-[#171312]" />

                <div className="mt-5 flex items-start justify-between">
                  <div>
                    <p className="font-serif text-xl">LOCK IN</p>
                    <p className="text-[6px] tracking-[0.4em]">
                      WITH LAV
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAD8D3] text-xs">
                    L
                  </div>
                </div>
              </div>

              {/* DAY */}
              <div className="border-y border-[#E3D5D0] px-5 py-5">
                <p className="text-[7px] tracking-[0.35em] text-[#A77B73]">
                  JANUARY 01, 2027
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-serif text-4xl leading-none">
                      Day 01
                    </p>
                    <p className="mt-2 text-[8px] tracking-[0.25em] text-[#8C7770]">
                      OF 75
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-[#DDB5AE]">
                    <div className="text-center">
                      <p className="font-serif text-lg">0%</p>
                      <p className="text-[5px] tracking-widest">TODAY</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TASKS */}
              <div className="px-5 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] tracking-[0.28em]">
                    TODAY&apos;S COMMITMENTS
                  </p>

                  <p className="font-serif text-sm italic text-[#B98F87]">
                    show up ♡
                  </p>
                </div>

                <div className="mt-4">
                  {tasks.map(([number, title, subtitle]) => (
                    <div
                      key={number}
                      className="flex items-center gap-3 border-b border-[#E7DBD7] py-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9A8A1] text-[7px] text-[#A77B73]">
                        {number}
                      </div>

                      <div className="flex-1">
                        <p className="text-[7px] tracking-[0.17em]">
                          {title}
                        </p>
                        <p className="mt-1 text-[7px] text-[#9A8780]">
                          {subtitle}
                        </p>
                      </div>

                      <div className="h-5 w-5 rounded-full border border-[#BFA39D]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* PHONE NAV */}
              <div className="grid grid-cols-4 border-t border-[#E1D3CE] bg-white/40 py-4 text-center">
                <div>
                  <p className="text-sm">♡</p>
                  <p className="mt-1 text-[5px] tracking-wider">TODAY</p>
                </div>
                <div>
                  <p className="text-sm">○</p>
                  <p className="mt-1 text-[5px] tracking-wider">JOURNEY</p>
                </div>
                <div>
                  <p className="text-sm">□</p>
                  <p className="mt-1 text-[5px] tracking-wider">GUIDE</p>
                </div>
                <div>
                  <p className="text-sm">⌁</p>
                  <p className="mt-1 text-[5px] tracking-wider">YOU</p>
                </div>
              </div>
            </div>
          </div>

          {/* JOURNEY PHONE */}
          <div className="absolute z-10 hidden w-[330px] translate-x-32 translate-y-12 rotate-[5deg] rounded-[3rem] border-[7px] border-[#120F0E] bg-[#F8F3F0] p-2 shadow-2xl md:block">
            <div className="overflow-hidden rounded-[2.45rem] bg-[#F8F3F0] text-[#211C19]">

              <div className="relative px-5 pb-5 pt-7">
                <div className="absolute left-1/2 top-3 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-[#171312]" />

                <div className="mt-5">
                  <p className="text-[7px] tracking-[0.35em] text-[#A77B73]">
                    YOUR JOURNEY
                  </p>

                  <h3 className="mt-3 font-serif text-4xl leading-none">
                    75 days of
                    <span className="block italic text-[#A77B73]">
                      choosing you.
                    </span>
                  </h3>
                </div>
              </div>

              {/* STATS */}
              <div className="mx-5 grid grid-cols-3 rounded-2xl bg-[#EAD8D3] px-3 py-5 text-center">
                <div>
                  <p className="font-serif text-2xl">01</p>
                  <p className="mt-1 text-[5px] tracking-widest">
                    CURRENT DAY
                  </p>
                </div>

                <div className="border-x border-[#CFB5AE]">
                  <p className="font-serif text-2xl">0</p>
                  <p className="mt-1 text-[5px] tracking-widest">
                    COMPLETE
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl">0</p>
                  <p className="mt-1 text-[5px] tracking-widest">
                    STREAK
                  </p>
                </div>
              </div>

              {/* CALENDAR */}
              <div className="px-5 py-6">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] tracking-[0.25em]">
                    JANUARY
                  </p>
                  <p className="font-serif text-sm italic text-[#A77B73]">
                    keep going.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2">
                  {journeyDays.map((day) => (
                    <div
                      key={day}
                      className={`flex aspect-square items-center justify-center rounded-full text-[7px] ${
                        day === 1
                          ? "bg-[#DDB5AE] text-[#211C19]"
                          : "border border-[#DED0CB] text-[#8E7A74]"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECK IN */}
              <div className="mx-5 mb-6 rounded-2xl border border-[#DCCBC5] p-5">
                <p className="text-[7px] tracking-[0.3em] text-[#A77B73]">
                  WEEKLY CHECK-IN
                </p>

                <p className="mt-3 font-serif text-xl italic">
                  How are you feeling?
                </p>

                <p className="mt-2 text-[7px] leading-4 text-[#8E7A74]">
                  Reflect on your week, celebrate what went well and reset for
                  the days ahead.
                </p>

                <button className="mt-4 w-full rounded-full bg-[#211C19] py-3 text-[6px] tracking-[0.3em] text-[#F8F3F0]">
                  CHECK IN
                </button>
              </div>

              <div className="border-t border-[#E1D3CE] py-4 text-center">
                <p className="font-serif text-lg italic text-[#A77B73]">
                  one day at a time. ♡
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COPY */}
        <div className="mx-auto mt-10 max-w-lg text-center md:mt-0">
          <p className="font-serif text-3xl italic text-[#DDB5AE]">
            no spreadsheets. no scattered notes.
          </p>

          <p className="mt-4 text-[9px] tracking-[0.3em] text-[#A99B96]">
            JUST YOU + YOUR 75 DAYS
          </p>
        </div>

      </div>
    </section>
  );
}