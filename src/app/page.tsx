import AppPreview from "@/components/AppPreview";

export default function Home() {
  const included = [
    {
      number: "01",
      title: "DAILY TRACKER",
      description:
        "Check off your daily commitments and watch your 75-day journey build.",
    },
    {
      number: "02",
      title: "THE GUIDE",
      description:
        "Your challenge rules, expectations and everything you need to get started.",
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
        "Workouts, wellness resources and extra support throughout your challenge.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#F7F1ED] text-[#211C19]">
      {/* NAVIGATION */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-12">
        <div className="leading-none">
          <p className="font-serif text-2xl tracking-[0.08em]">LOCK IN</p>
          <p className="mt-1 text-[9px] tracking-[0.5em]">WITH LAV</p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="#about"
            className="hidden text-[10px] tracking-[0.2em] md:block"
          >
            THE CHALLENGE
          </a>

          <a
            href="#included"
            className="hidden text-[10px] tracking-[0.2em] md:block"
          >
            WHAT&apos;S INCLUDED
          </a>

          <a
            href="/auth"
            className="rounded-full border border-[#B98F87] px-5 py-2 text-[10px] tracking-[0.2em] transition hover:bg-[#E8C5BF]"
          >
            LOG IN
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto flex min-h-[82vh] max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
        <p className="mb-7 text-[10px] tracking-[0.45em] text-[#9D6F67] md:text-xs">
          THE 75 DAY CHALLENGE
        </p>

        <div className="mb-5 text-2xl">♡</div>

        <h1 className="font-serif text-[clamp(5rem,14vw,11rem)] leading-[0.72] tracking-[-0.065em]">
          LOCK IN
        </h1>

        <p className="mt-8 text-sm tracking-[0.7em] md:text-lg">WITH LAV</p>

        <p className="mt-12 max-w-xl font-serif text-3xl italic leading-relaxed text-[#5C4B46] md:text-4xl">
          75 days. Show up for yourself.
        </p>

        <p className="mt-5 max-w-lg text-sm leading-7 text-[#76645E]">
          Build the discipline, routines and confidence to become the version
          of you you&apos;ve been waiting for.
        </p>

        <a
          href="#about"
          className="mt-10 rounded-full bg-[#DDB5AE] px-14 py-4 text-[10px] tracking-[0.35em] shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-[#D3A49C]"
        >
          DISCOVER THE CHALLENGE
        </a>

        <p className="mt-6 text-[9px] tracking-[0.3em] text-[#9D8881]">
          75 DAYS • ONE DAY AT A TIME
        </p>
      </section>

      {/* EDITORIAL IMAGE + STATEMENT */}
      <section className="border-y border-[#E2D4CF] bg-[#FBF8F6]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          {/* IMAGE */}
          <div className="relative h-[520px] overflow-hidden md:h-[700px]">
            <img
              src="/Lock-in.png"
              alt="Morning wellness routine with journal, laptop and matcha"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#B98F87]/5" />
          </div>

          {/* STATEMENT */}
          <div className="flex h-[520px] flex-col justify-center px-8 py-16 md:h-[700px] md:px-20">
            <p className="mb-8 text-[9px] tracking-[0.4em] text-[#9D6F67]">
              THE NEXT 75 DAYS
            </p>

            <h2 className="max-w-lg font-serif text-5xl leading-[0.95] md:text-7xl">
              A better you
              <span className="block italic text-[#A77B73]">
                is always worth it.
              </span>
            </h2>

            <p className="mt-9 max-w-md text-sm leading-7 text-[#76645E]">
              This isn&apos;t about becoming perfect overnight. It&apos;s about
              choosing yourself every single day — building routines that make
              you feel stronger, more confident and more in control of your
              life.
            </p>

            <p className="mt-10 font-serif text-3xl italic text-[#A77B73]">
              you&apos;re locking in for you. ♡
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40"
      >
        <div className="grid gap-16 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
          <div>
            <p className="text-[9px] tracking-[0.45em] text-[#9D6F67]">
              LOCK IN WITH LAV
            </p>

            <p className="mt-6 font-serif text-3xl italic text-[#A77B73]">
              one day at a time. ♡
            </p>
          </div>

          <div>
            <h2 className="font-serif text-5xl leading-none md:text-7xl">
              This is your
              <span className="block italic">75 days.</span>
            </h2>

            <p className="mt-8 max-w-2xl text-sm leading-8 text-[#76645E]">
              Lock In With Lav is a 75-day wellness and discipline challenge
              designed to help you create routines you can actually carry
              forward. You&apos;ll show up daily, track your habits, document
              your progress and build consistency one choice at a time.
            </p>
          </div>
        </div>

        {/* THREE PILLARS */}
        <div className="mt-24 grid border-y border-[#DCCBC5] md:grid-cols-3">
          <div className="border-b border-[#DCCBC5] px-5 py-14 md:border-b-0 md:border-r md:px-10">
            <p className="font-serif text-5xl text-[#C59B93]">01</p>
            <h3 className="mt-8 text-xs tracking-[0.35em]">DISCIPLINE</h3>
            <p className="mt-5 text-sm leading-7 text-[#76645E]">
              Keep the promises you make to yourself, even on the days when
              motivation isn&apos;t there.
            </p>
          </div>

          <div className="border-b border-[#DCCBC5] px-5 py-14 md:border-b-0 md:border-r md:px-10">
            <p className="font-serif text-5xl text-[#C59B93]">02</p>
            <h3 className="mt-8 text-xs tracking-[0.35em]">ROUTINE</h3>
            <p className="mt-5 text-sm leading-7 text-[#76645E]">
              Build simple daily habits that support your body, your mind and
              the life you&apos;re creating.
            </p>
          </div>

          <div className="px-5 py-14 md:px-10">
            <p className="font-serif text-5xl text-[#C59B93]">03</p>
            <h3 className="mt-8 text-xs tracking-[0.35em]">PROGRESS</h3>
            <p className="mt-5 text-sm leading-7 text-[#76645E]">
              Watch what happens when small choices compound over 75
              intentional days.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section
        id="included"
        className="bg-[#EAD8D3] px-6 py-28 md:px-12 md:py-36"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[9px] tracking-[0.45em] text-[#8F655E]">
              INSIDE YOUR CHALLENGE
            </p>

            <h2 className="mt-7 font-serif text-5xl leading-none md:text-7xl">
              Everything you need
              <span className="block italic">to stay locked in.</span>
            </h2>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-[2rem] bg-[#CFB5AE] md:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => (
              <div
                key={item.number}
                className="min-h-[260px] bg-[#F7F1ED] p-9 md:p-11"
              >
                <p className="font-serif text-3xl text-[#B98F87]">
                  {item.number}
                </p>

                <h3 className="mt-10 text-[11px] tracking-[0.3em]">
                  {item.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-[#76645E]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppPreview />

      {/* CURRENT CHALLENGE */}
      <section className="px-6 py-28 text-center md:py-40">
        <p className="text-[9px] tracking-[0.45em] text-[#9D6F67]">
          CURRENT CHALLENGE
        </p>

        <h2 className="mt-8 font-serif text-5xl leading-none md:text-8xl">
          January 01
          <span className="mx-4 text-[#B98F87]">—</span>
          March 16
        </h2>

        <p className="mt-8 text-xs tracking-[0.35em] text-[#76645E]">
          2027 • 75 DAYS
        </p>

        <p className="mx-auto mt-10 max-w-2xl font-serif text-3xl italic text-[#6E5953]">
          join the current challenge or begin your own 75 days. ♡
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#211C19] px-6 py-28 text-center text-[#F7F1ED] md:py-40">
        <p className="text-[9px] tracking-[0.45em] text-[#DDB5AE]">
          YOUR 75 DAYS START HERE
        </p>

        <h2 className="mx-auto mt-8 max-w-4xl font-serif text-6xl leading-[0.85] md:text-9xl">
          Ready to
          <span className="block italic text-[#DDB5AE]">lock in?</span>
        </h2>

        <p className="mx-auto mt-10 max-w-md text-sm leading-7 text-[#D5C8C3]">
          75 days. One commitment to yourself. A stronger, happier you on the
          other side.
        </p>

        <a
          href="/auth"
          className="mt-10 inline-block rounded-full bg-[#DDB5AE] px-16 py-4 text-[10px] tracking-[0.4em] text-[#211C19] transition hover:-translate-y-1 hover:bg-[#E8C9C3]"
        >
          JOIN THE CHALLENGE
        </a>

        <p className="mt-10 font-serif text-2xl italic text-[#DDB5AE]">
          you got this. ♡
        </p>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col gap-6 border-t border-[#3A322F] bg-[#211C19] px-6 py-10 text-[#F7F1ED] md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          <p className="font-serif text-2xl tracking-[0.08em]">LOCK IN</p>
          <p className="mt-1 text-[8px] tracking-[0.5em]">WITH LAV</p>
        </div>

        <p className="text-[8px] tracking-[0.25em] text-[#A99B96]">
          75 DAYS • DISCIPLINE • ROUTINE • PROGRESS
        </p>

        <p className="text-[8px] tracking-[0.2em] text-[#A99B96]">
          © 2027 LOCK IN WITH LAV
        </p>
      </footer>
    </main>
  );
}