
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_CHALLENGE_LENGTH,
  getCurrentChallengeDay,
} from "@/lib/challenge";

type DashboardSidebarProps = {
  firstName: string;
  initial: string;
  isLoadingUser: boolean;
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
      <path d="m6.5 6.5 11 11" />
      <path d="m4.5 9.5 5-5" />
      <path d="m14.5 19.5 5-5" />
      <path d="m3 8 5-5" />
      <path d="m16 21 5-5" />
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

export default function DashboardSidebar({
  firstName,
  initial,
  isLoadingUser,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [currentDay, setCurrentDay] = useState<number | null>(null);

  const isAccountActive = pathname === "/dashboard/account";

  useEffect(() => {
    const loadCurrentDay = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load sidebar user:", userError);
        return;
      }

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date, challenge_length")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Could not load sidebar profile:", profileError);
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
        Math.min(
          Math.max(day, 1),
          challengeLength
        )
      );
    };

    loadCurrentDay();
  }, [supabase]);

  function renderNavigationIcon(
    icon: (typeof navigation)[number]["icon"]
  ) {
    if (icon === "today") {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-current font-serif text-[15px] font-semibold leading-none">
          {currentDay ? String(currentDay).padStart(2, "0") : "—"}
        </span>
      );
    }

    if (icon === "journey") {
      return <JourneyIcon className="h-6 w-6" />;
    }

    if (icon === "train") {
      return <TrainIcon className="h-6 w-6" />;
    }

    if (icon === "nourish") {
      return <NourishIcon className="h-6 w-6" />;
    }

    return <LoungeIcon className="h-6 w-6" />;
  }

  return (
    <aside className="hidden w-[250px] flex-col border-r border-[#E1D3CE] bg-[#FBF8F6] px-7 py-8 md:flex">
      {/* LOGO */}
      <div>
        <p className="font-serif text-3xl tracking-[0.08em]">
          LOCK IN
        </p>

        <p className="mt-1 text-[10px] tracking-[0.45em]">
          WITH LAV
        </p>
      </div>

      {/* MEMBER / MY ACCOUNT */}
      <Link
        href="/dashboard/account"
        className={`mt-8 block border-y border-[#E1D3CE] py-5 transition ${
          isAccountActive ? "bg-[#F1E6E2]" : "hover:bg-[#F7F1ED]"
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DDB5AE] font-serif text-lg text-[#211C19]">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] tracking-[0.16em] uppercase">
              {isLoadingUser ? "..." : firstName}
            </p>

            <p className="mt-1 text-[9px] tracking-[0.14em] text-[#9A8780]">
              MY ACCOUNT
            </p>
          </div>

          <span className="font-serif text-lg text-[#A77B73]">
            →
          </span>
        </div>
      </Link>

      {/* NAVIGATION */}
      <nav className="mt-8 space-y-3">
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
              className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition duration-200 ${
                isActive
                  ? "bg-[#EAD8D3] text-[#211C19]"
                  : "text-[#806E68] hover:bg-[#F1E6E2] hover:text-[#211C19]"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5">
                {renderNavigationIcon(item.icon)}
              </span>

              <span className="text-[11px] tracking-[0.22em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
