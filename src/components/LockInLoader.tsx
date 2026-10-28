
type LockInLoaderProps = {
  message?: string;
};

export default function LockInLoader({
  message = "loading your journey... ♡",
}: LockInLoaderProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F1ED] px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E4D4CE] bg-[#FBF8F6]">
        <span className="font-serif text-xl text-[#A77B73]">
          ♡
        </span>
      </div>

      <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-[#A77B73]">
        LOCKING IN
      </p>

      <p className="mt-2 font-serif text-sm italic text-[#B9948B]">
        {message}
      </p>
    </div>
  );
}
