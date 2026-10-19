
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_CHALLENGE_LENGTH,
  getCurrentChallengeDay,
} from "@/lib/challenge";

type DashboardMobileNavProps = {
  initial: string;
};

type IconProps = {
  className?: string;
};

function JourneyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 19V13" />
      <path d="M12 19V9" />
      <path d="M19 19V5" />
      <path d="M4 19.5h16" />
    </svg>
  );
}



function TrainIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <g transform="rotate(-45 12 12)">
        {/* Handle */}
        <path d="M12 7.5v9" />

        {/* Top weight plate */}
        <rect x="8.5" y="4" width="7" height="3.5" rx="0.8" />

        {/* Bottom weight plate */}
        <rect x="8.5" y="16.5" width="7" height="3.5" rx="0.8" />

        {/* Outer ends */}
        <path d="M10 2.5h4" />
        <path d="M10 21.5h4" />
      </g>
    </svg>
  );
}



function NourishIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 3v7a3 3 0 0 0 6 0V3" />
      <path d="M7 3v18" />
      <path d="M17 21V3c3 2 4 5 4 9h-4" />
    </svg>
  );
}

function LoungeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3-.6L4 20l1.6-4.5A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8 10.5h8M8 13.5h5" />
    </svg>
  );
}

const navigation = [
  {
    label: "TODAY",
    href: "/dashboard",
    icon: "today",
  },
  {
    label: "JOURNEY",
    href: "/dashboard/journey",
    icon: "journey",
  },
  {
    label: "TRAIN",
    href: "/dashboard/guide",
    icon: "train",
  },
  {
    label: "NOURISH",
    href: "/dashboard/resources",
    icon: "nourish",
  },
  {
    label: "LOUNGE",
    href: "/dashboard/lounge",
    icon: "lounge",
  },
] as const;

export default function DashboardMobileNav({
  initial,
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [currentDay, setCurrentDay] = useState<number | null>(null);

  useEffect(() => {
    const loadCurrentDay = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load mobile nav user:", userError);
        return;
      }

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date, challenge_length")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Could not load mobile nav profile:", profileError);
        return;
      }

      if (!profile?.challenge_start_date) return;

      const challengeLength =
        profile.challenge_length ?? DEFAULT_CHALLENGE_LENGTH;

      const day = getCurrentChallengeDay(
        profile.challenge_start_date,
        challengeLength
      );

      setCurrentDay(
        Math.min(Math.max(day, 1), challengeLength)
      );
    };

    loadCurrentDay();
  }, [supabase]);

  const isWorkoutDetailPage =
    pathname.startsWith("/dashboard/resources/workouts/") &&
    pathname !== "/dashboard/resources/workouts";

  const showBackButton =
    pathname !== "/dashboard" && !isWorkoutDetailPage;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  };

  function renderNavigationIcon(
    icon: (typeof navigation)[number]["icon"]
  ) {
    if (icon === "today") {
      return (
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-current font-serif text-[12px] font-semibold leading-none">
          {currentDay ? String(currentDay).padStart(2, "0") : "—"}
        </span>
      );
    }

    if (icon === "journey") {
      return <JourneyIcon className="h-[21px] w-[21px]" />;
    }

    if (icon === "train") {
      return <TrainIcon className="h-[21px] w-[21px]" />;
    }

    if (icon === "nourish") {
      return <NourishIcon className="h-[21px] w-[21px]" />;
    }

    return <LoungeIcon className="h-[21px] w-[21px]" />;
  }

  return (
    <>
      {/* MOBILE TOP NAV */}
      <header className="sticky top-0 z-40 border-b border-[#E1D3CE] bg-[#F7F1ED]/95 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <div className="relative flex h-16 items-center justify-between px-4">
          {/* BACK */}
          <div className="w-[76px]">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center gap-1 text-[9px] tracking-[0.16em] text-[#8F655E]"
              >
                <span className="font-serif text-base">←</span>
                BACK
              </button>
            )}
          </div>

          {/* LOGO */}
          <Link
            href="/dashboard"
            aria-label="Lock In With Lav home"
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
          >
            <span className="whitespace-nowrap font-serif text-xl leading-none tracking-[0.14em] text-[#211C19]">
              LOCK IN
            </span>

            <span className="mt-1.5 whitespace-nowrap text-[8px] tracking-[0.34em] text-[#9D6F67]">
              WITH LAV
            </span>
          </Link>

          {/* ACCOUNT */}
          <div className="flex w-[76px] justify-end">
            <Link
              href="/dashboard/account"
              aria-label="My account"
              className={`flex h-9 w-9 items-center justify-center rounded-full border font-serif text-base transition ${
                pathname === "/dashboard/account"
                  ? "border-[#A77B73] bg-[#DDB5AE] text-[#211C19]"
                  : "border-[#D6C3BD] bg-[#EAD8D3] text-[#211C19]"
              }`}
            >
              {initial}
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DCCDC8] bg-[#FBF8F6]/95 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 transition ${
                  isActive
                    ? "bg-[#EAD8D3] text-[#211C19]"
                    : "text-[#8C7770] hover:bg-[#F1E6E2]"
                }`}
              >
                <span className="flex h-[25px] w-[25px] items-center justify-center">
                  {renderNavigationIcon(item.icon)}
                </span>

                <span className="mt-1.5 max-w-full truncate text-[8px] tracking-[0.06em]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
