"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function WorkoutBackNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isWorkoutPage =
    pathname.startsWith("/dashboard/resources/workouts/") &&
    pathname !== "/dashboard/resources/workouts";

  if (!isWorkoutPage) {
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <style jsx global>{`
        main a[href="/dashboard/resources/workouts"] {
          display: none !important;
        }
      `}</style>

      <div className="border-b border-[#DED0CB] bg-[#F7F1ED] px-5 py-3 md:px-10 lg:px-14">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] bg-[#EAD8D3] px-4 py-2 text-[8px] tracking-[0.16em] text-[#6F514B] transition hover:-translate-y-0.5 hover:bg-[#DFC8C2]"
        >
          <span className="font-serif text-sm leading-none">←</span>
          BACK
        </button>
      </div>
    </>
  );
}