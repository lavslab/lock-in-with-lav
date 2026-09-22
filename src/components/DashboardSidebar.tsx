"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardSidebarProps = {
  firstName: string;
  initial: string;
  isLoadingUser: boolean;
};

const navigation = [
  {
    label: "TODAY",
    href: "/dashboard",
    icon: "♡",
  },
  {
    label: "JOURNEY",
    href: "/dashboard/journey",
    icon: "○",
  },
  {
    label: "THE GUIDE",
    href: "/dashboard/guide",
    icon: "□",
  },
  {
    label: "RESOURCES",
    href: "/dashboard/resources",
    icon: "⌁",
  },
  {
    label: "PROGRESS",
    href: "/dashboard/progress",
    icon: "◇",
  },
];

export default function DashboardSidebar({
  firstName,
  initial,
  isLoadingUser,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[250px] flex-col border-r border-[#E1D3CE] bg-[#FBF8F6] px-7 py-8 md:flex">
      <div>
        <p className="font-serif text-3xl tracking-[0.08em]">
          LOCK IN
        </p>

        <p className="mt-1 text-[10px] tracking-[0.45em]">
          WITH LAV
        </p>
      </div>

      <nav className="mt-16 space-y-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
                isActive
                  ? "bg-[#EAD8D3] text-[#211C19]"
                  : "text-[#806E68] hover:bg-[#F1E6E2]"
              }`}
            >
              <span className="font-serif text-xl">
                {item.icon}
              </span>

              <span className="text-[11px] tracking-[0.22em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#E1D3CE] pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDB5AE] font-serif">
            {initial}
          </div>

          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase">
              {isLoadingUser ? "..." : firstName}
            </p>

            <p className="mt-1 text-[10px] text-[#9A8780]">
              MY ACCOUNT
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
