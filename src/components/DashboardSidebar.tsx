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

function CalendarIcon({ className = "" }: IconProps) {
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
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3.5V7" />
      <path d="M16 3.5V7" />
      <path d="M3.5 9.5H20.5" />
      <path d="M8 13H8.01" />
      <path d="M12 13H12.01" />
      <path d="M16 13H16.01" />
      <path d="M8 17H8.01" />
      <path d="M12 17H12.01" />
    </svg>
  );
}

function BookIcon({ className = "" }: IconProps) {
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
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H9.5C10.88 4 12 5.12 12 6.5V20C12 18.62 10.88 17.5 9.5 17.5H4V5.5Z" />
      <path d="M20 5.5C20 4.67 19.33 4 18.5 4H14.5C13.12 4 12 5.12 12 6.5V20C12 18.62 13.12 17.5 14.5 17.5H20V5.5Z" />
    </svg>
  );
}

function ResourcesIcon({ className = "" }: IconProps) {
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
      <path d="M6 4.5H18C18.83 4.5 19.5 5.17 19.5 6V19.5L12 15.5L4.5 19.5V6C4.5 5.17 5.17 4.5 6 4.5Z" />
      <path d="M8 8H16" />
      <path d="M8 11H14" />
    </svg>
  );
}

function PhotoIcon({ className = "" }: IconProps) {
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
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.5" />
      <path d="M5.5 17L10 12.5L13 15.5L15.5 13L18.5 16" />
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
    label: "THE GUIDE",
    href: "/dashboard/guide",
    icon: "guide",
  },
  {
    label: "RESOURCES",
    href: "/dashboard/resources",
    icon: "resources",
  },
  {
    label: "PROGRESS",
    href: "/dashboard/progress",
    icon: "progress",
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
      return <CalendarIcon className="h-6 w-6" />;
    }

    if (icon === "guide") {
      return <BookIcon className="h-6 w-6" />;
    }

    if (icon === "resources") {
      return <ResourcesIcon className="h-6 w-6" />;
    }

    return <PhotoIcon className="h-6 w-6" />;
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
          const isActive = pathname === item.href;

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