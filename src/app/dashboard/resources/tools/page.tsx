"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const tools = [
  {
    number: "01",
    title: "MACRO CALCULATOR",
    subtitle: "fuel your goals. ♡",
    description: "Estimate calories, protein, carbs and fats for your goal.",
    tag: "NUTRITION",
    href: "/dashboard/resources/tools/macro-calculator",
  },
  {
    number: "02",
    title: "EXERCISE SWAP",
    subtitle: "switch it up.",
    description: "Find alternatives that train the same muscles and movement.",
    tag: "TRAIN",
    href: "/dashboard/resources/tools/exercise-swap",
  },
  {
    number: "03",
    title: "MEAL BUILDER",
    subtitle: "build your plate.",
    description: "Put together a balanced meal around your nutrition goals.",
    tag: "EAT",
    href: "/dashboard/resources/tools/meal-builder",
  },
  {
    number: "04",
    title: "TEMPLATES",
    subtitle: "plan it. track it.",
    description: "Simple templates for planning, habits, meals and progress.",
    tag: "PLAN",
    href: "/dashboard/resources/tools/templates",
  },
];

export default function ToolsPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                make the process easier. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[9px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.4em] text-[#DDB5AE]">
                  TOOLS
                </p>

                <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Less guessing.
                  <span className="block italic text-[#DDB5AE]">
                    more doing. ♡
                  </span>
                </h1>
              </div>

              <p className="text-[9px] tracking-[0.18em] text-[#BFAEAA]">
                CALCULATE • SWAP • BUILD • PLAN
              </p>
            </div>
          </section>

          <section className="py-10">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[9px] tracking-[0.35em] text-[#9D6F67]">
                  YOUR TOOLKIT
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  What would make today{" "}
                  <span className="italic text-[#A77B73]">easier?</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                pick a tool. ♡
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {tools.map((tool) => (
                <Link
                  key={tool.number}
                  href={tool.href}
                  className="group rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm md:p-7"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-[#D2B0A9]">
                      {tool.number}
                    </span>

                    <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[8px] tracking-[0.2em] text-[#8F655E]">
                      {tool.tag}
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="text-[9px] tracking-[0.24em]">
                      {tool.title}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                      {tool.subtitle}
                    </h3>

                    <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#6F5F59]">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#E1D3CE] pt-4">
                    <span className="text-[8px] tracking-[0.24em] text-[#9D6F67]">
                      OPEN TOOL
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-base text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] pb-14 pt-10 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              make consistency easier. ♡
            </p>

            <Link
              href="/dashboard/resources"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-8 py-3.5 text-[9px] tracking-[0.25em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
