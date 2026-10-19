
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

type NourishSection = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  action: string;
};

const nourishSections: NourishSection[] = [
  {
    number: "01",
    title: "Recipe Library",
    subtitle: "Breakfast, lunch, dinner & snacks.",
    description:
      "Find a little inspiration for your next meal. Browse the recipe library and save ideas for your week.",
    href: "/dashboard/resources/recipes",
    action: "EXPLORE RECIPES",
  },
  {
    number: "02",
    title: "Meal Planner",
    subtitle: "Plan your week, your way.",
    description:
      "Build your weekly meal plan using recipes from the library or meals you create yourself.",
    href: "/dashboard/resources/meal-plans",
    action: "PLAN YOUR WEEK",
  },
  {
    number: "03",
    title: "Grocery List",
    subtitle: "Everything you need in one place.",
    description:
      "Keep your grocery planning organized and make shopping for the week a little easier.",
    href: "/dashboard/resources/meal-plans/grocery-list",
    action: "VIEW GROCERY LIST",
  },
  
{
  number: "04",
  title: "Meal Prep Tips",
  subtitle: "A little prep goes a long way.",
  description: "",
  href: "",
  action: "",
},

];

export default function ResourcesPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(
    null
  );

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

      if (savedName && typeof savedName === "string") {
        setFirstName(savedName.split(" ")[0]);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      setIsLoadingUser(false);
    };

    void getUser();
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const toggleSection = (number: string) => {
    setOpenSection((current) =>
      current === number ? null : number
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-5xl">

            {/* HEADER */}
            <header className="border-b border-[#DED0CB] pb-6">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                THE NOURISH EDIT
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight text-[#211C19] sm:text-4xl">
                Nourish{" "}
                <span className="italic text-[#A77B73]">
                  yourself. ♡
                </span>
              </h1>
            </header>

            {/* NOURISH SECTIONS */}
            <section className="pb-10 pt-5">
              <div className="overflow-hidden rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6]">
                {nourishSections.map((item, index) => {
                  const isOpen = openSection === item.number;
                  const panelId = `nourish-panel-${item.number}`;

                  return (
                    <div
                      key={item.number}
                      className={
                        index !== nourishSections.length - 1
                          ? "border-b border-[#E1D3CE]"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSection(item.number)
                        }
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left transition hover:bg-[#F1E6E2] sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="w-6 shrink-0 font-serif text-lg italic text-[#C39A92]">
                            {item.number}
                          </span>

                          <div className="min-w-0">
                            <h2 className="font-serif text-lg text-[#211C19] sm:text-xl">
                              {item.title}
                            </h2>

                            <p className="mt-1 text-[10px] leading-5 text-[#927D76]">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <span
                          aria-hidden="true"
                          className="shrink-0 font-serif text-xl text-[#A77B73]"
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      
{isOpen && (
  <div
    id={panelId}
    className="border-t border-[#EADDD8] bg-[#F7F1ED]/70 px-4 pb-5 pt-4 sm:px-5"
  >
    <div className="pl-10">
      {item.number === "04" ? (
        <div className="space-y-4">
          {[
            {
              title: "Plan a few meals",
              text: "Choose a few meals for the week. Repeating meals is okay.",
            },
            {
              title: "Prep your basics",
              text: "Cook proteins or carbs ahead to save time.",
            },
            {
              title: "Make things easy",
              text: "Wash produce, portion snacks, or prep ingredients.",
            },
            {
              title: "Mix + match",
              text: "Use the same ingredients to create different meals.",
            },
          ].map((tip, index) => (
            <div key={tip.title} className="flex gap-3">
              <span className="font-serif text-sm italic text-[#C39A92]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <p className="font-serif text-sm text-[#211C19]">
                  {tip.title}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-[#806E68]">
                  {tip.text}
                </p>
              </div>
            </div>
          ))}

          <p className="border-t border-[#E1D3CE] pt-3 text-[9px] leading-5 text-[#927D76]">
            Refrigerate perishable foods promptly and freeze
            portions you won't use soon.
          </p>
        </div>
      ) : (
        <>
          <p className="max-w-lg text-[11px] leading-6 text-[#75635D]">
            {item.description}
          </p>

          <Link
            href={item.href}
            className="mt-4 inline-flex items-center gap-2 text-[9px] font-medium tracking-[0.14em] text-[#8F655E] transition hover:text-[#211C19]"
          >
            {item.action}
            <span aria-hidden="true">↗</span>
          </Link>
        </>
      )}
    </div>
  </div>
)}

                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </section>
      </div>
    </main>
  );
}
