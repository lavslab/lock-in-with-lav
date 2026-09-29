export default function Home() {
  const included = [
    {
      number: "01",
      title: "DAILY TRACKER",
      description:
        "Check off your daily commitments and watch your Lock In journey build.",
    },
    {
      number: "02",
      title: "THE GUIDE",
      description:
        "Your Lock In method, expectations and everything you need to get started.",
    },
    {
      number: "03",
      title: "PROGRESS",
      description:
        "Track your consistency, reflections, milestones and transformation.",
    },
    {
      number: "04",
      title: "PRIVATE PHOTOS",
      description:
        "Keep your progress photos safely stored inside your own account.",
    },
    {
      number: "05",
      title: "CHECK-INS",
      description:
        "Pause each week to reflect on what's working and where you want to improve.",
    },
    {
      number: "06",
      title: "RESOURCES",
      description:
        "Workouts, wellness resources and extra support throughout your journey.",
    },
  ];

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  /**
   * January 1, 2027 falls on a Friday.
   * Five blank cells place Day 01 in the correct calendar position.
   */
  const januaryCalendar = [
    null,
    null,
    null,
    null,
    null,
    ...Array.from({ length: 31 }, (_, index) => index + 1),
  ];

  return (
    <main className="overflow-hidden bg-[#F7F1ED] text-[#211C19]">
      {/* NAVIGATION */}
      <nav className="mx-auto max-w-7xl px-6 pb-7 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-7">
        <div className="flex items-center justify-between">
          <div className="leading-none">
            <p className="font-serif text-2xl tracking-[0.08em]">
              LOCK IN
            </p>

            <p className="mt-1 text-[9px] tracking-[0.5em]">
              WITH LAV
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="#challenge"
              className="hidden text-[10px] tracking-[0.2em] transition hover:text-[#A77B73] md:block"
            >
              DISCOVER THE CHALLENGE
            </a>

            <a
              href="#join"
              className="hidden text-[10px] tracking-[0.2em] transition hover:text-[#A77B73] md:block"
            >
              READY TO LOCK IN?
            </a>

            <a
              href="/auth"
              className="rounded-full border border-[#B98F87] px-5 py-2 text-[10px] tracking-[0.2em] transition hover:bg-[#E8C5BF]"
            >
              LOG IN
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-20 text-center md:min-h-[82vh] md:justify-center md:pt-10">
        <p className="mb-7 text-[10px] tracking-[0.45em] text-[#9D6F67] md:text-xs">
          YOUR JOURNEY • YOUR TIMELINE
        </p>

        {/* LOCK ICON */}
        <div className="mb-5 flex items-center justify-center text-[#211C19]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              d="M7.5 10V7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5V10"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <rect
              x="5"
              y="10"
              width="14"
              height="11"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.35"
            />
            <path
              d="M12 14V17"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="font-serif text-[clamp(5rem,14vw,11rem)] leading-[0.72] tracking-[-0.065em]">
          LOCK IN
        </h1>

        <p className="mt-8 text-sm tracking-[0.7em] md:text-lg">
          WITH LAV
        </p>

        {/* CURRENT CHALLENGE TEASER */}
        <div className="mt-8">
          <p className="text-[9px] tracking-[0.4em] text-[#9D6F67]">
            CURRENT 75 DAY CHALLENGE
          </p>

          <p className="mt-4 font-serif text-2xl text-[#6E5953] md:text-3xl">
            January 01
            <span className="mx-3 text-[#B98F87]">—</span>
            March 16
          </p>

          <p className="mt-3 text-[9px] tracking-[0.3em] text-[#9D8881]">
            2027
          </p>
        </div>

        <a
          href="#challenge"
          className="mt-10 rounded-full bg-[#DDB5AE] px-14 py-4 text-[10px] tracking-[0.35em] shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-[#D3A49C]"
        >
          DISCOVER THE CHALLENGE
        </a>
      </section>

      {/* DISCOVER / WHAT'S INCLUDED */}
      <section
        id="challenge"
        className="bg-[#EAD8D3] px-6 pb-0 pt-24 md:px-12 md:pt-32"
      >
        <div className="mx-auto max-w-7xl">
          {/* CHALLENGE INTRO */}
          <div className="grid items-center gap-14 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
            {/* REAL MONTH CALENDAR VISUAL */}
            <div className="mx-auto w-full max-w-[430px] md:mx-0">
              <p className="mb-7 text-[9px] tracking-[0.45em] text-[#8F655E]">
                DISCOVER YOUR LOCK IN
              </p>

              <div className="relative rounded-[2rem] border border-[#B98F87] bg-[#F7F1ED]/40 px-6 pb-7 pt-8 sm:px-8">
                {/* CALENDAR BINDING */}
                <div className="absolute -top-3 left-0 right-0 flex justify-center gap-10">
                  <span className="h-6 w-[2px] rounded-full bg-[#B98F87]" />
                  <span className="h-6 w-[2px] rounded-full bg-[#B98F87]" />
                  <span className="h-6 w-[2px] rounded-full bg-[#B98F87]" />
                </div>

                {/* CALENDAR HEADER */}
                <div className="flex items-end justify-between border-b border-[#CDAFA8] pb-5">
                  <div>
                    <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                      YOUR
                    </p>

                    <p className="mt-1 font-serif text-3xl italic text-[#A77B73]">
                      lock in.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] tracking-[0.3em] text-[#9D7770]">
                    </p>

                    <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
                      2027
                    </p>
                  </div>
                </div>

                {/* WEEKDAYS */}
                <div className="mt-6 grid grid-cols-7 gap-x-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[7px] tracking-[0.12em] text-[#8F655E]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* CALENDAR DAYS */}
                <div className="mt-4 grid grid-cols-7 gap-x-2 gap-y-4">
                  {januaryCalendar.map((day, index) => {
                    if (day === null) {
                      return (
                        <div
                          key={`blank-${index}`}
                          className="h-8"
                          aria-hidden="true"
                        />
                      );
                    }

                    const isCurrentDay = day === 1;

                    return (
                      <div
                        key={day}
                        className="flex h-8 items-center justify-center"
                      >
                        {isCurrentDay ? (
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#A77B73]">
                            <span className="font-serif text-sm text-[#F7F1ED]">
                              {String(day).padStart(2, "0")}
                            </span>

                            {/* LOCATION PIN */}
                            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                              <span className="block h-3 w-3 rotate-45 rounded-br-full bg-[#A77B73]" />
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif text-sm text-[#9D7770]">
                            {String(day).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CALENDAR FOOTER */}
                <div className="mt-8 flex items-center justify-between border-t border-[#CDAFA8] pt-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#A77B73]" />

                    <p className="text-[8px] tracking-[0.3em] text-[#8F655E]">
                      YOU ARE HERE
                    </p>
                  </div>

                  <p className="font-serif text-lg italic text-[#A77B73]">
                    day 01. ♡
                  </p>
                </div>
              </div>
            </div>

            {/* CHALLENGE MESSAGE */}
            <div>
              <h2 className="font-serif text-5xl leading-[0.95] md:text-7xl">
                Choose your timeline.
                <span className="block italic text-[#A77B73]">
                  Then take it
                </span>
                <span className="block italic text-[#A77B73]">
                  one day at a time.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-sm leading-8 text-[#76645E]">
                Lock In With Lav is your space to build discipline, create
                routines and keep showing up for yourself. Choose 21, 30, 60
                or 75 days, commit to the journey, and LOCK IN.
              </p>
            </div>
          </div>

          {/* INCLUDED */}
          <div className="mt-24 border-t border-[#CFB5AE] pt-16">
            <p className="text-[9px] tracking-[0.45em] text-[#8F655E]">
              INSIDE YOUR LOCK IN
            </p>

            <h2 className="mt-7 font-serif text-5xl leading-none md:text-7xl">
              Everything you need
              <span className="block italic">
                to stay locked in.
              </span>
            </h2>

            <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-[#CFB5AE] md:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <div
                  key={item.number}
                  className="min-h-[230px] bg-[#F7F1ED] p-9 transition duration-300 hover:bg-[#FBF8F6] md:p-11"
                >
                  <p className="font-serif text-3xl text-[#B98F87]">
                    {item.number}
                  </p>

                  <h3 className="mt-8 text-[11px] tracking-[0.3em]">
                    {item.title}
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-[#76645E]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SMALL MOTIVATIONAL MOMENT */}
          <div className="px-6 pb-16 pt-14 text-center md:pb-20 md:pt-16">
            <p className="text-[8px] tracking-[0.45em] text-[#9D6F67]">
              STAY LOCKED IN
            </p>

            <p className="mt-5 font-serif text-4xl leading-tight text-[#211C19] md:text-5xl">
              All you have to do is
              <span className="block italic text-[#A77B73]">
                show up.
              </span>
            </p>

            <p className="mt-6 text-[8px] tracking-[0.35em] text-[#9D8881]">
              7 COMMITMENTS • YOUR TIMELINE • ONE DAY AT A TIME
            </p>
          </div>
        </div>
      </section>

      {/* READY TO LOCK IN */}
      <section
        id="join"
        className="bg-[#211C19] px-6 py-24 text-center text-[#F7F1ED] md:py-32"
      >
        <p className="text-[9px] tracking-[0.45em] text-[#DDB5AE]">
          YOUR LOCK IN STARTS HERE
        </p>

        <h2 className="mx-auto mt-7 max-w-4xl font-serif text-6xl leading-[0.85] md:text-8xl">
          Ready to
          <span className="block italic text-[#DDB5AE]">
            lock in?
          </span>
        </h2>

        <a
          href="/auth"
          className="mt-10 inline-block rounded-full bg-[#DDB5AE] px-16 py-4 text-[10px] tracking-[0.4em] text-[#211C19] transition duration-300 hover:-translate-y-1 hover:bg-[#E8C9C3]"
        >
          START YOUR LOCK IN
        </a>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col gap-6 border-t border-[#3A322F] bg-[#211C19] px-6 py-10 text-[#F7F1ED] md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          <p className="font-serif text-2xl tracking-[0.08em]">
            LOCK IN
          </p>

          <p className="mt-1 text-[8px] tracking-[0.5em]">
            WITH LAV
          </p>
        </div>

        <p className="text-[8px] tracking-[0.25em] text-[#A99B96]">
          DISCIPLINE • ROUTINE • PROGRESS • YOU
        </p>

        <p className="text-[8px] tracking-[0.2em] text-[#A99B96]">
          © 2027 LOCK IN WITH LAV
        </p>
      </footer>
    </main>
  );
}