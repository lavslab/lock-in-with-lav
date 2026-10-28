export default function LoungeLoading() {
  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-7 text-[#211C19]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-5 border-b border-[#DED0CB] pb-4">
          <h1 className="font-serif text-[24px] sm:text-[29px]">
            The Lock In{" "}
            <span className="italic text-[#A77B73]">
              Lounge.
            </span>
          </h1>
          <p className="mt-2 text-[11px] text-[#806D65]">
            A space to connect, share &amp; grow together. ♡
          </p>
        </header>

        <div className="space-y-4 animate-pulse">
          <div className="h-32 rounded-[22px] bg-[#EAD8D3]/60" />
          <div className="h-48 rounded-[22px] bg-[#EAD8D3]/40" />
          <div className="h-48 rounded-[22px] bg-[#EAD8D3]/40" />
        </div>
      </div>
    </main>
  );
}