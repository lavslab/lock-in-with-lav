
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
    (journey) => journey.status === "archived"
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

            <h1 className="mt-4 font-serif text-5xl md:text-6xl">
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
                  const archivedDate = formatArchivedDate(
                    journey.archived_at
                  );

                  const days = journey.daily_progress?.length ?? 0;
                  const photos = journey.progress_photos?.length ?? 0;
                  const checkins = journey.weekly_checkins?.length ?? 0;

                  return (
                    <article
                      key={journey.id}
                      className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9"
                    >
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                            {isActive
                              ? "CURRENT CHAPTER"
                              : "SAVED CHAPTER"}
                          </p>

                          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                            Journey{" "}
                            {String(journey.journey_number).padStart(
                              2,
                              "0"
                            )}
                          </h2>

                          <p className="mt-3 text-sm text-[#806E68]">
                            Started {formatDate(journey.start_date)}
                          </p>

                          <p className="mt-1 text-xs text-[#A77B73]">
                            {journey.challenge_length}-day challenge
                          </p>

                          {isActive ? (
                            <p className="mt-2 text-xs italic text-[#A77B73]">
                              your story is still unfolding. ♡
                            </p>
                          ) : archivedDate ? (
                            <p className="mt-2 text-xs text-[#A77B73]">
                              Archived {archivedDate}
                            </p>
                          ) : null}
                        </div>

                        <span
                          className={`self-start rounded-full border px-4 py-2 text-[10px] tracking-[0.15em] ${
                            isActive
                              ? "border-[#B9C7B1] bg-[#EDF1E9] text-[#62765A]"
                              : "border-[#DDB5AE] text-[#8F655E]"
                          }`}
                        >
                          {isActive ? "ACTIVE ♡" : "ARCHIVED ♡"}
                        </span>
                      </div>

                      {isActive ? (
                        <div className="mt-8 border-t border-[#DED0CB] pt-6">
                          <p className="text-center font-serif text-lg italic text-[#A77B73]">
                            the chapter you're writing right now. ♡
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#DED0CB] pt-6 text-center">
                            <div>
                              <p className="font-serif text-3xl">{days}</p>
                              <p className="mt-1 text-[10px] tracking-[0.15em] text-[#806E68]">
                                DAYS LOGGED
                              </p>
                            </div>

                            <div>
                              <p className="font-serif text-3xl">{photos}</p>
                              <p className="mt-1 text-[10px] tracking-[0.15em] text-[#806E68]">
                                PHOTOS
                              </p>
                            </div>

                            <div>
                              <p className="font-serif text-3xl">
                                {checkins}
                              </p>
                              <p className="mt-1 text-[10px] tracking-[0.15em] text-[#806E68]">
                                CHECK-INS
                              </p>
                            </div>
                          </div>

                          <p className="mt-7 text-center font-serif text-lg italic text-[#A77B73]">
                            a chapter worth remembering. ♡
                          </p>
                        </>
                      )}

                      <Link
                        href={
                          isActive
                            ? "/dashboard/journey"
                            : `/dashboard/journeys/${journey.id}`
                        }
                        className="mt-6 block rounded-full bg-[#211C19] px-7 py-4 text-center text-[10px] tracking-[0.25em] text-[#F7F1ED] transition hover:opacity-90"
                      >
                        {isActive
                          ? "CONTINUE MY JOURNEY →"
                          : "OPEN THIS JOURNEY →"}
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
