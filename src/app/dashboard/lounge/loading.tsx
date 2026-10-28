
export default function LoungeLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col items-center justify-center bg-[#F7F1ED] text-[#211C19]">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D6C3BD] bg-[#FBF8F6] font-serif text-4xl text-[#A77B73]">
          ♡
        </div>

        <p className="mt-6 text-[10px] tracking-[0.32em] text-[#9D6F67]">
          LOCKING IN
        </p>

        <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
          loading your lounge... ♡
        </p>
      </div>
    </div>
  );
}
