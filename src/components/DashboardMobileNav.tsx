"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardMobileNavProps = {
  initial: string;
};

type IconProps = {
  className?: string;
};

function TodayIcon({ className = "" }: IconProps) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.25 2" />
    </svg>
  );
}

function GuideIcon({ className = "" }: IconProps) {
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
      <path d="M5.5 4.5h9a2 2 0 0 1 2 2v13h-9a2 2 0 0 1-2-2v-13Z" />
      <path d="M16.5 6.5h2a1.5 1.5 0 0 1 1.5 1.5v11.5h-3.5" />
      <path d="M8.5 8.5h5" />
      <path d="M8.5 12h5" />
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
      <path d="M5 7.5h14" />
      <path d="M5 12h14" />
      <path d="M5 16.5h14" />
      <circle cx="7" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ProgressIcon({ className = "" }: IconProps) {
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

const navigation = [
  {
    label: "TODAY",
    href: "/dashboard",
    icon: TodayIcon,
  },
  {
    label: "JOURNEY",
    href: "/dashboard/journey",
    icon: JourneyIcon,
  },
  {
    label: "GUIDE",
    href: "/dashboard/guide",
    icon: GuideIcon,
  },
  {
    label: "RESOURCES",
    href: "/dashboard/resources",
    icon: ResourcesIcon,
  },
  {
    label: "PROGRESS",
    href: "/dashboard/progress",
    icon: ProgressIcon,
  },
];

function getParentHref(pathname: string) {
  if (pathname === "/dashboard") return null;

  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 2) {
    return "/dashboard";
  }

  return `/${parts.slice(0, -1).join("/")}`;
}

export default function DashboardMobileNav({
  initial,
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const parentHref = getParentHref(pathname);

  return (
    <>
      {/* MOBILE TOP NAV */}
      <header className="sticky top-0 z-40 border-b border-[#E1D3CE] bg-[#F7F1ED]/95 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <div className="relative flex h-16 items-center justify-between px-4">
          {/* BACK */}
          <div className="w-[76px]">
            {parentHref && (
              <Link
                href={parentHref}
                className="inline-flex items-center gap-1 text-[9px] tracking-[0.16em] text-[#8F655E]"
              >
                <span className="font-serif text-base">←</span>
                BACK
              </Link>
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

            const Icon = item.icon;

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
                <Icon className="h-[21px] w-[21px]" />

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