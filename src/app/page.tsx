
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)] md:px-12">
        <header className="flex items-start justify-between">
          <Link href="/" className="leading-none">
            <p className="font-serif text-2xl tracking-[0.08em]">
              LOCK IN
            </p>
            <p className="mt-2 text-[9px] tracking-[0.48em]">
              WITH LAV
            </p>
          </Link>

          <Link
            href="/auth"
            className="rounded-full border border-[#B98F87] px-4 py-3 text-[9px] tracking-[0.16em] transition hover:bg-[#EAD8D3]"
          >
            BETA TESTER LOGIN
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <p className="mb-8 text-[10px] tracking-[0.4em] text-[#9D6F67]">
            THE JANUARY 2027 EDITION
          </p>

          <div className="mb-7 text-3xl text-[#A77B73]">♡</div>

          <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,10vw,8rem)] leading-[0.95] tracking-[-0.05em]">
            Your next chapter
            <span className="block italic text-[#A77B73]">
              starts here.
            </span>
          </h1>

          <p className="mt-9 max-w-lg font-serif text-xl italic leading-relaxed text-[#76645E] md:text-2xl">
            75 days of showing up for yourself.
          </p>

          <p className="mt-5 text-[10px] tracking-[0.25em] text-[#9D7770]">
            JANUARY 01 — MARCH 16, 2027
          </p>

          <a
            href="https://join.lockinwithlav.com"
            className="mt-12 inline-flex min-h-14 items-center justify-center rounded-full bg-[#DDB5AE] px-10 text-[10px] tracking-[0.25em] shadow-sm transition hover:-translate-y-1 hover:bg-[#D3A49C]"
          >
            JOIN THE JANUARY LIST ♡
          </a>

          <p className="mt-7 max-w-sm text-xs leading-6 text-[#927D76]">
            Be first to hear what&apos;s coming.
            A little something new is on the way. ♡
          </p>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#E2D3CD] pt-6 text-center md:flex-row">
          <p className="text-[8px] tracking-[0.25em] text-[#9D8881]">
            DISCIPLINE • ROUTINE • PROGRESS 
          </p>

          <p className="text-[8px] tracking-[0.2em] text-[#9D8881]">
            © 2027 LOCK IN WITH LAV
          </p>
        </footer>
      </div>
    </main>
  );
}
