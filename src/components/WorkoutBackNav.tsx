"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WorkoutBackNav() {
  const pathname = usePathname();

  const isWorkoutPage =
    pathname.startsWith("/dashboard/resources/workouts/") &&
    pathname !== "/dashboard/resources/workouts";

  if (!isWorkoutPage) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        main a[href="/dashboard/resources/workouts"] {
          display: none !important;
        }
      `}</style>

      <div className="border-b border-[#DED0CB] bg-[#F7F1ED] px-6 py-3 md:px-10 lg:px-14">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/guide"
            className="inline-flex items-center gap-2 rounded-full border border-[#CBA9A2] bg-[#EAD8D3] px-4 py-2 text-[8px] tracking-[0.16em] text-[#6F514B] transition hover:-translate-y-0.5 hover:bg-[#DFC8C2]"
          >
            <span className="font-serif text-sm leading-none">
              ←
            </span>

            BACK TO GUIDE
          </Link>

          <Link
            href="/dashboard/resources/workouts"
            className="inline-flex items-center gap-2 rounded-full border border-[#D8C7C1] bg-[#FBF8F6] px-4 py-2 text-[8px] tracking-[0.16em] text-[#806E68] transition hover:-translate-y-0.5 hover:border-[#B9948B] hover:bg-[#EAD8D3]"
          >
            <span className="font-serif text-sm leading-none">
              ←
            </span>

            WORKOUT LIBRARY
          </Link>
        </div>
      </div>
    </>
  );
}