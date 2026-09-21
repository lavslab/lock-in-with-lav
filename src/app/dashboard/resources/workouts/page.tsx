"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const workouts = [
  {
    id: "lower-body-foundation",
    title: "Lower Body Foundation",
    subtitle: "build the base.",
    location: "Home",
    level: "Beginner",
    type: "Lower Body",
    time: "35 MIN",
    equipment: "DUMBBELLS",
    exercises: "6 EXERCISES",
  },
  {
    id: "glute-builder",
    title: "Glute Builder",
    subtitle: "slow reps. strong finish.",
    location: "Home",
    level: "Intermediate",
    type: "Glutes",
    time: "40 MIN",
    equipment: "DUMBBELLS + BAND",
    exercises: "7 EXERCISES",
  },
  {
    id: "full-body-reset",
    title: "Full Body Reset",
    subtitle: "move everything.",
    location: "No Equipment",
    level: "Beginner",
    type: "Full Body",
    time: "25 MIN",
    equipment: "BODYWEIGHT",
    exercises: "6 EXERCISES",
  },
  {
    id: "upper-body-build",
    title: "Upper Body Build",
    subtitle: "strong looks good on you.",
    location: "Gym",
    level: "Intermediate",
    type: "Upper Body",
    time: "45 MIN",
    equipment: "GYM",
    exercises: "7 EXERCISES",
  },
  {
    id: "core-control",
    title: "Core Control",
    subtitle: "strength from the centre.",
    location: "Home",
    level: "Beginner",
    type: "Core",
    time: "20 MIN",
    equipment: "MAT",
    exercises: "6 EXERCISES",
  },
  {
    id: "cardio-lock-in",
    title: "Cardio Lock In",
    subtitle: "heart up. head clear.",
    location: "No Equipment",
    level: "Intermediate",
    type: "Cardio",
    time: "30 MIN",
    equipment: "BODYWEIGHT",
    exercises: "8 INTERVALS",
  },
];

const locations = ["All", "Home", "Gym", "No Equipment"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const types = [
  "All",
  "Full Body",
  "Lower Body",
  "Glutes",
  "Upper Body",
  "Core",
  "Cardio",
];

export default function WorkoutsPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [location, setLocation] = useState("All");
  const [level, setLevel] = useState("All");
  const [type, setType] = useState("All");

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

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const locationMatch =
        location === "All" || workout.location === location;
      const levelMatch = level === "All" || workout.level === level;
      const typeMatch = type === "All" || workout.type === type;

      return locationMatch && levelMatch && typeMatch;
    });
  }, [location, level, type]);

  const FilterButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[8px] tracking-[0.18em] transition ${
        active
          ? "border-[#211C19] bg-[#211C19] text-[#F7F1ED]"
          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"
      }`}
    >
      {label.toUpperCase()}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                your workout library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
            >
              ← RESOURCES
            </Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">
                  WORKOUT LIBRARY
                </p>
                <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Find your movement.
                </h1>
                <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">
                  choose what works for you today. ♡
                </p>
              </div>

              <p className="max-w-xs text-[8px] leading-5 tracking-[0.15em] text-[#BFAEAA]">
                FILTER BY WHERE YOU ARE, YOUR LEVEL, AND WHAT YOU WANT TO TRAIN.
              </p>
            </div>
          </section>

          <section className="py-10">
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-3">
                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHERE ARE YOU TRAINING?
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {locations.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={location === option}
                        onClick={() => setLocation(option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    YOUR LEVEL
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {levels.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={level === option}
                        onClick={() => setLevel(option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">
                    WHAT ARE WE TRAINING?
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {types.map((option) => (
                      <FilterButton
                        key={option}
                        label={option}
                        active={type === option}
                        onClick={() => setType(option)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">
                  BROWSE WORKOUTS
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Pick your{" "}
                  <span className="italic text-[#A77B73]">session.</span>
                </h2>
              </div>

              <p className="font-serif text-lg italic text-[#A77B73]">
                {filteredWorkouts.length}{" "}
                {filteredWorkouts.length === 1 ? "workout" : "workouts"} ♡
              </p>
            </div>

            {filteredWorkouts.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredWorkouts.map((workout, index) => (
                  <Link
                    key={workout.id}
                    href={`/dashboard/resources/workouts/${workout.id}`}
                    className="group flex min-h-[290px] flex-col justify-between rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-serif text-3xl text-[#D2B0A9]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">
                          {workout.level.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-7 text-[8px] tracking-[0.25em] text-[#806E68]">
                        {workout.type.toUpperCase()} •{" "}
                        {workout.location.toUpperCase()}
                      </p>

                      <h3 className="mt-3 font-serif text-3xl leading-tight">
                        {workout.title}
                      </h3>

                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                        {workout.subtitle}
                      </p>
                    </div>

                    <div className="mt-8">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#E1D3CE] pt-4 text-[7px] tracking-[0.15em] text-[#806E68]">
                        <span>{workout.time}</span>
                        <span>•</span>
                        <span>{workout.equipment}</span>
                        <span>•</span>
                        <span>{workout.exercises}</span>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">
                          VIEW WORKOUT
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center">
                <p className="font-serif text-3xl italic text-[#A77B73]">
                  nothing here yet. ♡
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">
                  Try another combination — we&apos;re still growing the
                  workout library.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLocation("All");
                    setLevel("All");
                    setType("All");
                  }}
                  className="mt-6 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-[8px] tracking-[0.35em] text-[#8F655E]">
                  YOUR BODY. YOUR PACE.
                </p>
                <h2 className="mt-3 font-serif text-3xl">
                  Modify when you need to.{" "}
                  <span className="italic text-[#9D6F67]">keep moving. ♡</span>
                </h2>
              </div>

              <Link
                href="/dashboard/resources/beginners"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
              >
                EXERCISE HELP →
              </Link>
            </div>
          </section>

          <section className="py-14 text-center">
            <Link
              href="/dashboard/resources"
              className="text-[8px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]"
            >
              ← BACK TO ALL RESOURCES
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
