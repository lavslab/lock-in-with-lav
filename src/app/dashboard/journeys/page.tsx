
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/lib/supabase/client";

type Journey = {
  id: string;
  journey_number: number;
  start_date: string | null;
  challenge_length: number;
  status: string;
  archived_at: string | null;
  completed_at: string | null;
  daily_progress: unknown[] | null;
  weekly_checkins: unknown[] | null;
  measurements: unknown[] | null;
  little_wins: unknown[] | null;
  progress_photos: unknown[] | null;
};

export default function MyJourneysPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJourneys = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError || !user) {
        router.replace("/auth");
        return;
      }

      const savedName =
        typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name.trim()
          : "";

      setFirstName(savedName || user.email?.split("@")[0] || "there");

      const { data, error } = await supabase
        .from("challenge_journeys")
        .select("*")
        .eq("user_id", user.id)
        .order("journey_number", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Could not load journeys:", error);
        setErrorMessage("We couldn't load your journeys. Please try again.");
      } else {
        setJourneys((data ?? []) as Journey[]);
      }

      setIsLoading(false);
    };

    loadJourneys();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const initial =
    firstName && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const formatDate = (value: string | null) => {
    if (!value) return "Date not recorded";

    const datePart = value.slice(0, 10);
    const date = new Date(`${datePart}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Date not recorded";
    }

    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatArchivedDate = (value: string | null) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeJourneys = journeys.filter(
    (journey) => journey.status === "active"
  );

  
const archivedJourneys = journeys.filter(
  (journey) =>
    journey.status === "archived" ||
    journey.status === "completed"
);


  const orderedJourneys = [
    ...activeJourneys,
    ...archivedJourneys,
  ];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoading}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="border-b border-[#DED0CB] pb-8">
            
            <p className="mt-0 text-[10px] tracking-[0.35em] text-[#9D6F67]">
              YOUR PERSONAL ARCHIVE
            </p>

            <h1 className="mt-4 font-serif text-4xl md:text-5xl">
              My Journeys
            </h1>

            <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
              every single chapter. ♡
            </p>
          </header>

          <div className="mt-10 max-w-4xl">
            {isLoading ? (
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-10 text-center">
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  gathering your chapters... ♡
                </p>
              </div>
            ) : errorMessage ? (
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-10 text-center">
                <p className="font-serif text-xl text-[#9D6F67]">
                  {errorMessage}
                </p>
              </div>
            ) : journeys.length === 0 ? (
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] px-7 py-14 text-center md:px-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#DDB5AE] bg-[#F7F1ED] font-serif text-3xl text-[#A77B73]">
                  ♡
                </div>

                <p className="mt-7 text-[10px] tracking-[0.3em] text-[#9D6F67]">
                  YOUR STORY IS STILL UNFOLDING
                </p>

                <h2 className="mt-4 font-serif text-4xl">
                  Every journey begins somewhere.
                </h2>

                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#806E68]">
                  When you begin a new challenge, your previous
                  journey will have a home here — with its
                  memories, milestones and moments of growth.
                </p>

                <Link
                  href="/dashboard/journey"
                  className="mt-8 inline-block rounded-full bg-[#211C19] px-7 py-4 text-[10px] tracking-[0.2em] text-[#F7F1ED]"
                >
                  VIEW MY JOURNEY →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="mb-7 text-[10px] tracking-[0.25em] text-[#9D6F67]">
                  {archivedJourneys.length} SAVED{" "}
                  {archivedJourneys.length === 1
                    ? "JOURNEY"
                    : "JOURNEYS"}
                  {activeJourneys.length > 0
                    ? ` · ${activeJourneys.length} ACTIVE`
                    : ""}
                </p>

              
{orderedJourneys.map((journey) => {
  const isActive = journey.status === "active";
  const isCompleted = journey.status === "completed";

  const savedDate = formatArchivedDate(
    isCompleted ? journey.completed_at : journey.archived_at
  );

  const days = journey.daily_progress?.length ?? 0;
  const photos = journey.progress_photos?.length ?? 0;
  const checkins = journey.weekly_checkins?.length ?? 0;

  const destination = isActive
    ? "/dashboard/journey"
    : `/dashboard/journeys/${journey.id}`;

  return (
    <article
      key={journey.id}
      className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] px-4 py-4 sm:px-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
            {isActive ? "CURRENT CHAPTER" : "SAVED CHAPTER"}
          </p>

          <h2 className="mt-2 font-serif text-[25px] leading-tight text-[#211C19]">
            Journey {String(journey.journey_number).padStart(2, "0")}
          </h2>

          <p className="mt-1.5 text-[11px] leading-5 text-[#806E68]">
            {journey.challenge_length} days · Started{" "}
            {formatDate(journey.start_date)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] tracking-[0.08em] ${
            isActive
              ? "border-[#B9C7B1] bg-[#EDF1E9] text-[#62765A]"
              : "border-[#DDB5AE] bg-[#F7F1ED] text-[#8F655E]"
          }`}
        >
          {isActive
            ? "ACTIVE ♡"
            : isCompleted
              ? "COMPLETED ♡"
              : "ARCHIVED ♡"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8DAD4] pt-3">
        <p className="text-[11px] text-[#806E68]">
          {isActive
            ? "your story is still unfolding. ♡"
            : `${days} days logged · ${photos} photos · ${checkins} check-ins`}
        </p>

        <Link
          href={destination}
          className="inline-flex min-h-9 items-center text-[11px] font-medium text-[#9D6F67] transition hover:text-[#211C19]"
        >
          {isActive ? "Continue journey" : "View chapter"} &nbsp;→
        </Link>
      </div>

      {!isActive && savedDate && (
        <p className="mt-1 text-[10px] text-[#A77B73]">
          {isCompleted ? "Completed" : "Archived"} {savedDate}
        </p>
      )}
    </article>
  );
})}

              </div>
            )}
          </div>

          
<div className="mt-8 text-center">
  <Link
    href="/onboarding"
    className="inline-flex w-full items-center justify-center rounded-full bg-[#A77B73] px-6 py-4 text-[11px] font-medium tracking-[0.15em] text-white transition hover:bg-[#946960] sm:w-auto"
  >
    START A NEW CHALLENGE ♡
  </Link>

  <p className="mt-3 font-serif text-sm italic text-[#A77B73]">
    another chapter awaits. ♡
  </p>
</div>

        </section>
      </div>
    </main>
  );
}
