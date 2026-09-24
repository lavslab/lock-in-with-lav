"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardMobileNavProps = {
  initial: string;
};

const navigation = [
  { label: "TODAY", href: "/dashboard", icon: "♡" },
  { label: "JOURNEY", href: "/dashboard/journey", icon: "○" },
  { label: "GUIDE", href: "/dashboard/guide", icon: "□" },
  { label: "RESOURCES", href: "/dashboard/resources", icon: "⌁" },
  { label: "PROGRESS", href: "/dashboard/progress", icon: "◇" },
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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E1D3CE] bg-[#F7F1ED]/95 px-4 backdrop-blur md:hidden">
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
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DCCDC8] bg-[#FBF8F6]/95 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 transition ${
                  isActive
                    ? "bg-[#EAD8D3] text-[#211C19]"
                    : "text-[#8C7770] hover:bg-[#F1E6E2]"
                }`}
              >
                <span className="font-serif text-xl leading-none">{item.icon}</span>
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
