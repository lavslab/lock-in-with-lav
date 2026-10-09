
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/lib/supabase/client";

type DailyRecord = {
  challenge_day: number;
  progress_date?: string;
  move?: boolean;
  get_outside?: boolean;
  hydrate?: boolean;
  read?: boolean;
  nourish?: boolean;
  document?: boolean;
  no_alcohol?: boolean;
  manually_completed?: boolean;
  water_bottles?: number;
  selected_workouts?: unknown;
  note?: string | null;
};

type PhotoRecord = {
  challenge_day: number;
  storage_path: string;
  caption?: string | null;
};

type MeasurementRecord = {
  challenge_day?: number | null;
  measurement_date?: string | null;
  weight?: number | null;
  waist?: number | null;
  hips?: number | null;
  chest?: number | null;
  thigh?: number | null;
  arm?: number | null;
};

type CheckinRecord = {
  week_number: number;
  went_well?: string | null;
  felt_hard?: string | null;
  proud_of?: string | null;
  next_week_focus?: string | null;
};

type WinRecord = {
  challenge_day?: number | null;
  label?: string | null;
  win_key?: string | null;
  is_completed?: boolean;
};

type Journey = {
  id: string;
  journey_number: number;
  start_date: string | null;
  challenge_length: number;
  archived_at: string;
  daily_progress: DailyRecord[];
  weekly_checkins: CheckinRecord[];
  measurements: MeasurementRecord[];
  little_wins: WinRecord[];
  progress_photos: PhotoRecord[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not recorded";

  const date = new Date(
    value.includes("T") ? value : `${value}T12:00:00`
  );

  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString("en-CA", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
};

const formatDay = (day: number) =>
  `DAY ${String(day).padStart(2, "0")}`;

export default function JourneyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const journeyId = params.id as string;

  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [savingPhoto, setSavingPhoto] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJourney = async () => {
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
        .eq("id", journeyId)
        .eq("user_id", user.id)
        .single();

      if (!mounted) return;

      if (error || !data) {
        setErrorMessage("We couldn't find this journey.");
        setIsLoading(false);
        return;
      }

      const savedJourney = data as Journey;
      setJourney(savedJourney);

      const paths = Array.from(
        new Set(
          (savedJourney.progress_photos ?? [])
            .map((photo) => photo.storage_path)
            .filter(Boolean)
        )
      );

      if (paths.length > 0) {
        const results = await Promise.all(
          paths.map(async (path) => {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from("progress-photos")
                .createSignedUrl(path, 60 * 60);

            if (signedError || !signed?.signedUrl) {
              return null;
            }

            return [path, signed.signedUrl] as const;
          })
        );

        if (!mounted) return;

        setPhotoUrls(
          Object.fromEntries(
            results.filter(
              (item): item is readonly [string, string] => item !== null
            )
          )
        );
      }

      if (mounted) setIsLoading(false);
    };

    loadJourney();

    return () => {
      mounted = false;
    };
  }, [journeyId, router, supabase]);

  const savePhoto = async (photo: PhotoRecord) => {
    const path = photo.storage_path;
    if (!path || savingPhoto) return;

    setSavingPhoto(path);
    setPhotoMessage("");

    try {
      const { data, error } = await supabase.storage
        .from("progress-photos")
        .download(path);

      if (error) throw error;

      const extension = path.split(".").pop()?.toLowerCase();
      const safeExtension =
        extension === "png" || extension === "webp"
          ? extension
          : "jpg";

      const fileName = `lock-in-journey-${String(
        journey?.journey_number ?? 1
      ).padStart(2, "0")}-day-${String(
        photo.challenge_day
      ).padStart(2, "0")}.${safeExtension}`;

      if (Capacitor.isNativePlatform()) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result !== "string") {
              reject(new Error("Could not prepare this photo."));
              return;
            }

            const encoded = reader.result.split(",")[1];

            if (!encoded) {
              reject(new Error("Could not prepare this photo."));
              return;
            }

            resolve(encoded);
          };

          reader.onerror = () =>
            reject(new Error("Could not read this photo."));

          reader.readAsDataURL(data);
        });

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Save Journey Photo",
          url: savedFile.uri,
          dialogTitle: "Save your Lock In With Lav photo",
        });
      } else {
        const url = URL.createObjectURL(data);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (error) {
      console.error("Could not save archived photo:", error);
      setPhotoMessage(
        error instanceof Error
          ? error.message
          : "Could not save this photo. Please try again."
      );
    } finally {
      setSavingPhoto(null);
    }
  };

  const initial =
    firstName && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const photos = [...(journey?.progress_photos ?? [])].sort(
    (a, b) => a.challenge_day - b.challenge_day
  );

  const measurements = [...(journey?.measurements ?? [])].sort(
    (a, b) => (a.challenge_day ?? 0) - (b.challenge_day ?? 0)
  );

  const checkins = [...(journey?.weekly_checkins ?? [])].sort(
    (a, b) => a.week_number - b.week_number
  );

  const wins = (journey?.little_wins ?? []).filter(
    (win) => win.is_completed
  );

  const dailyRecords = [...(journey?.daily_progress ?? [])].sort(
    (a, b) => a.challenge_day - b.challenge_day
  );

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
            <Link
              href="/dashboard/journeys"
              className="text-[10px] tracking-[0.25em] text-[#9D6F67] hover:underline"
            >
              ← ALL MY JOURNEYS
            </Link>

            <p className="mt-8 text-[10px] tracking-[0.35em] text-[#9D6F67]">
              YOUR PERSONAL ARCHIVE
            </p>

            <h1 className="mt-4 font-serif text-5xl md:text-6xl">
              {journey
                ? `Journey ${String(journey.journey_number).padStart(2, "0")}`
                : "My Journey"}
            </h1>

            <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
              look how far you&apos;ve come. ♡
            </p>
          </header>

          <div className="mt-10 max-w-5xl space-y-8">
            {isLoading ? (
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-10 text-center">
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  opening your chapter... ♡
                </p>
              </div>
            ) : errorMessage || !journey ? (
              <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-10 text-center">
                <p className="font-serif text-xl text-[#9D6F67]">
                  {errorMessage || "Journey not found."}
                </p>
              </div>
            ) : (
              <>
                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE CHAPTER
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Your journey, remembered. ♡
                  </h2>

                  <div className="mt-6 grid gap-5 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#806E68]">
                        STARTED
                      </p>
                      <p className="mt-2 font-serif text-xl">
                        {formatDate(journey.start_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#806E68]">
                        ARCHIVED
                      </p>
                      <p className="mt-2 font-serif text-xl">
                        {formatDate(journey.archived_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#806E68]">
                        DAYS LOGGED
                      </p>
                      <p className="mt-2 font-serif text-xl">
                        {dailyRecords.length} / {journey.challenge_length}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE MEMORIES
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Progress Photo Gallery
                  </h2>

                  <p className="mt-2 text-sm text-[#806E68]">
                    Every photo is a reminder of showing up for yourself.
                  </p>

                  {photoMessage && (
                    <p className="mt-4 text-sm text-[#9D6F67]">
                      {photoMessage}
                    </p>
                  )}

                  {photos.length === 0 ? (
                    <p className="mt-7 font-serif text-lg italic text-[#A77B73]">
                      No photos were recorded in this chapter. ♡
                    </p>
                  ) : (
                    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {photos.map((photo, index) => (
                        <div
                          key={`${photo.storage_path}-${index}`}
                          className="overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#F7F1ED]"
                        >
                          {photoUrls[photo.storage_path] ? (
                            <img
                              src={photoUrls[photo.storage_path]}
                              alt={`${formatDay(photo.challenge_day)} progress`}
                              className="aspect-[3/4] w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-[3/4] items-center justify-center px-5 text-center text-sm text-[#806E68]">
                              Photo unavailable
                            </div>
                          )}

                          <div className="p-5">
                            <p className="font-serif text-xl">
                              {formatDay(photo.challenge_day)}
                            </p>

                            {photo.caption && (
                              <p className="mt-2 text-sm text-[#806E68]">
                                {photo.caption}
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => savePhoto(photo)}
                              disabled={
                                savingPhoto !== null ||
                                !photoUrls[photo.storage_path]
                              }
                              className="mt-4 w-full rounded-full border border-[#A77B73] px-5 py-3 text-[10px] tracking-[0.2em] text-[#6F514B] transition hover:bg-[#EAD8D3] disabled:opacity-50"
                            >
                              {savingPhoto === photo.storage_path
                                ? "PREPARING..."
                                : "SAVE PHOTO ↓"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE GROWTH
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    Measurements
                  </h2>

                  {measurements.length === 0 ? (
                    <p className="mt-5 text-sm text-[#806E68]">
                      No measurements recorded.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {measurements.map((record, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-[#E5D8D3] p-5"
                        >
                          <p className="font-serif text-xl">
                            {record.challenge_day
                              ? formatDay(record.challenge_day)
                              : formatDate(record.measurement_date)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#806E68]">
                            {(
                              [
                                ["Weight", record.weight],
                                ["Waist", record.waist],
                                ["Hips", record.hips],
                                ["Chest", record.chest],
                                ["Thigh", record.thigh],
                                ["Arm", record.arm],
                              ] as const
                            ).map(
                              ([label, value]) =>
                                value != null && (
                                  <span key={label}>
                                    {label}: {value}
                                  </span>
                                )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE REFLECTIONS
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    Weekly Check-ins
                  </h2>

                  {checkins.length === 0 ? (
                    <p className="mt-5 text-sm text-[#806E68]">
                      No weekly check-ins recorded.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-5">
                      {checkins.map((checkin) => (
                        <div
                          key={checkin.week_number}
                          className="rounded-2xl border border-[#E5D8D3] p-5"
                        >
                          <h3 className="font-serif text-2xl">
                            Week {checkin.week_number}
                          </h3>

                          {[
                            ["What went well", checkin.went_well],
                            ["What felt hard", checkin.felt_hard],
                            ["What I'm proud of", checkin.proud_of],
                            ["Next week's focus", checkin.next_week_focus],
                          ].map(
                            ([label, value]) =>
                              value && (
                                <div key={label} className="mt-4">
                                  <p className="text-[10px] tracking-[0.15em] text-[#9D6F67]">
                                    {label}
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-[#806E68]">
                                    {value}
                                  </p>
                                </div>
                              )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE LITTLE VICTORIES
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    Little Wins ♡
                  </h2>

                  {wins.length === 0 ? (
                    <p className="mt-5 text-sm text-[#806E68]">
                      No little wins recorded.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {wins.map((win, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-[#E5D8D3] px-5 py-4"
                        >
                          <p className="text-sm text-[#211C19]">
                            ♡ {win.label || win.win_key || "Little win"}
                          </p>
                          {win.challenge_day != null && (
                            <p className="mt-1 text-xs text-[#9D6F67]">
                              {formatDay(win.challenge_day)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-9">
                  <p className="text-[10px] tracking-[0.3em] text-[#9D6F67]">
                    THE DAILY WORK
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    Daily Progress
                  </h2>

                  {dailyRecords.length === 0 ? (
                    <p className="mt-5 text-sm text-[#806E68]">
                      No daily progress recorded.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {dailyRecords.map((record) => {
                        const habits = [
                          ["Move", record.move],
                          ["Get outside", record.get_outside],
                          ["Hydrate", record.hydrate],
                          ["Read", record.read],
                          ["Nourish", record.nourish],
                          ["Document", record.document],
                          ["No alcohol", record.no_alcohol],
                        ];

                        return (
                          <div
                            key={record.challenge_day}
                            className="rounded-2xl border border-[#E5D8D3] p-5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-serif text-xl">
                                {formatDay(record.challenge_day)}
                              </h3>
                              <p className="text-xs text-[#806E68]">
                                {formatDate(record.progress_date)}
                              </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {habits.map(([label, completed]) => (
                                <span
                                  key={String(label)}
                                  className={`rounded-full px-3 py-2 text-xs ${
                                    completed
                                      ? "bg-[#EAD8D3] text-[#6F514B]"
                                      : "bg-[#F1EAE6] text-[#9C8C85]"
                                  }`}
                                >
                                  {completed ? "✓ " : "○ "}
                                  {label}
                                </span>
                              ))}
                            </div>

                            {record.note && (
                              <p className="mt-4 text-sm italic leading-6 text-[#806E68]">
                                {record.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <div className="pb-10 text-center">
                  <p className="font-serif text-2xl italic text-[#A77B73]">
                    every chapter counts. ♡
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
