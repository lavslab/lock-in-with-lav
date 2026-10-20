
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
  status: string;
  journey_number: number;
  start_date: string | null;
  challenge_length: number;
  
archived_at: string | null;
completed_at: string | null;

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
  
const [selectedDay, setSelectedDay] = useState<number | null>(null);


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
            

            <p className="mt-0 text-[10px] tracking-[0.35em] text-[#9D6F67]">
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
                
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-5 sm:px-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.25em] text-[#9D6F67]">
        THE CHAPTER
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Your journey, remembered. ♡
      </h2>
    </div>

    <span className="rounded-full bg-[#EAD8D3] px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-[#6F514B]">
      {journey.status}
    </span>
  </div>

  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#E5D8D3] pt-4">
    <div>
      <p className="text-[9px] tracking-[0.12em] text-[#9D6F67]">
        STARTED
      </p>
      <p className="mt-1 font-serif text-sm sm:text-base">
        {formatDate(journey.start_date)}
      </p>
    </div>

    <div>
      <p className="text-[9px] tracking-[0.12em] text-[#9D6F67]">
        {journey.status === "completed" ? "COMPLETED" : "ARCHIVED"}
      </p>
      <p className="mt-1 font-serif text-sm sm:text-base">
        {formatDate(
          journey.status === "completed"
            ? journey.completed_at
            : journey.archived_at
        )}
      </p>
    </div>

    <div>
      <p className="text-[9px] tracking-[0.12em] text-[#9D6F67]">
        DAYS LOGGED
      </p>
      <p className="mt-1 font-serif text-sm sm:text-base">
        {dailyRecords.length} / {journey.challenge_length}
      </p>
    </div>
  </div>
</section>

               
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE MEMORIES
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Progress Photos ♡
      </h2>
    </div>

    <span className="rounded-full bg-[#F1EAE6] px-3 py-1.5 text-[10px] text-[#806E68]">
      {photos.length} {photos.length === 1 ? "photo" : "photos"}
    </span>
  </div>

  {photoMessage && (
    <p className="mt-3 text-xs text-[#9D6F67]">
      {photoMessage}
    </p>
  )}

  {photos.length === 0 ? (
    <p className="mt-4 border-t border-[#E5D8D3] pt-4 text-xs italic text-[#A77B73]">
      No photos saved in this chapter. ♡
    </p>
  ) : (
    <>
      <p className="mt-2 text-xs italic text-[#806E68]">
        Little snapshots of how far you've come.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={`${photo.storage_path}-${index}`}
            className="overflow-hidden rounded-xl border border-[#E5D8D3] bg-[#F7F1ED]"
          >
            {photoUrls[photo.storage_path] ? (
              <img
                src={photoUrls[photo.storage_path]}
                alt={`${formatDay(photo.challenge_day)} progress`}
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center px-3 text-center text-xs text-[#806E68]">
                Photo unavailable
              </div>
            )}

            <div className="p-3">
              <p className="font-serif text-base text-[#211C19]">
                {formatDay(photo.challenge_day)}
              </p>

              {photo.caption && (
                <p className="mt-1 text-xs leading-5 text-[#806E68]">
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
                className="mt-3 w-full rounded-full border border-[#A77B73] px-2 py-2 text-[9px] tracking-[0.1em] text-[#6F514B] transition hover:bg-[#EAD8D3] disabled:opacity-50"
              >
                {savingPhoto === photo.storage_path
                  ? "PREPARING..."
                  : "SAVE PHOTO ↓"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</section>


               
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE GROWTH
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Measurements
      </h2>
    </div>

    <span className="rounded-full bg-[#F1EAE6] px-3 py-1.5 text-[10px] text-[#806E68]">
      {measurements.length}{" "}
      {measurements.length === 1 ? "entry" : "entries"}
    </span>
  </div>

  {measurements.length === 0 ? (
    <p className="mt-4 border-t border-[#E5D8D3] pt-4 text-xs italic text-[#A77B73]">
      No measurements saved in this chapter. ♡
    </p>
  ) : (
    <div className="mt-4 space-y-2">
      {measurements.map((record, index) => (
        <details
          key={index}
          className="group rounded-xl border border-[#E5D8D3] bg-[#F7F1ED]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="font-serif text-base">
              {record.challenge_day
                ? formatDay(record.challenge_day)
                : formatDate(record.measurement_date)}
            </span>

            <span className="text-xs text-[#9D6F67] transition-transform group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="grid grid-cols-2 gap-3 border-t border-[#E5D8D3] px-4 py-4 sm:grid-cols-3">
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
                  <div key={label}>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#9D6F67]">
                      {label}
                    </p>
                    <p className="mt-1 font-serif text-lg text-[#211C19]">
                      {value}
                    </p>
                  </div>
                )
            )}
          </div>
        </details>
      ))}
    </div>
  )}
</section>

              
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE REFLECTIONS
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Weekly Check-ins ♡
      </h2>
    </div>

    <span className="rounded-full bg-[#F1EAE6] px-3 py-1.5 text-[10px] text-[#806E68]">
      {checkins.length} {checkins.length === 1 ? "check-in" : "check-ins"}
    </span>
  </div>

  {checkins.length === 0 ? (
    <p className="mt-4 border-t border-[#E5D8D3] pt-4 text-xs italic text-[#A77B73]">
      No weekly reflections saved in this chapter. ♡
    </p>
  ) : (
    <div className="mt-4 space-y-2">
      {checkins.map((checkin) => (
        <details
          key={checkin.week_number}
          className="group rounded-xl border border-[#E5D8D3] bg-[#F7F1ED]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="font-serif text-base text-[#211C19]">
              Week {String(checkin.week_number).padStart(2, "0")}
            </span>

            <span className="text-xs text-[#9D6F67] transition-transform group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="space-y-4 border-t border-[#E5D8D3] px-4 py-4">
            {(
              [
                ["WHAT WENT WELL", checkin.went_well],
                ["WHAT FELT HARD", checkin.felt_hard],
                ["WHAT I'M PROUD OF", checkin.proud_of],
                ["NEXT WEEK'S FOCUS", checkin.next_week_focus],
              ] as const
            ).map(
              ([label, value]) =>
                value && (
                  <div key={label}>
                    <p className="text-[9px] tracking-[0.16em] text-[#9D6F67]">
                      {label}
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#806E68]">
                      {value}
                    </p>
                  </div>
                )
            )}
          </div>
        </details>
      ))}
    </div>
  )}
</section>


               
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE LITTLE VICTORIES
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Little Wins ♡
      </h2>
    </div>

    <span className="rounded-full bg-[#F1EAE6] px-3 py-1.5 text-[10px] text-[#806E68]">
      {wins.length} {wins.length === 1 ? "win" : "wins"}
    </span>
  </div>

  {wins.length === 0 ? (
    <p className="mt-4 border-t border-[#E5D8D3] pt-4 text-xs italic text-[#A77B73]">
      No little wins saved in this chapter. ♡
    </p>
  ) : (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {wins.map((win, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-xl border border-[#E5D8D3] bg-[#F7F1ED] px-4 py-3"
        >
          <span className="mt-0.5 shrink-0 text-sm text-[#A77B73]">
            ♡
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-[#211C19]">
              {win.label || win.win_key || "Little win"}
            </p>

            {win.challenge_day != null && (
              <p className="mt-1 text-[10px] tracking-[0.12em] text-[#9D6F67]">
                {formatDay(win.challenge_day)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>


               
<section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 sm:p-6">
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE DAILY WORK
      </p>
      <h2 className="mt-1.5 font-serif text-2xl text-[#211C19]">
        Your days, remembered. ♡
      </h2>
    </div>

    <span className="shrink-0 text-[11px] text-[#806E68]">
      {dailyRecords.length} logged
    </span>
  </div>

  <div className="mt-5 grid grid-cols-7 gap-1.5">
    {Array.from(
      { length: journey.challenge_length },
      (_, index) => index + 1
    ).map((day) => {
      const record = dailyRecords.find(
        (item) => item.challenge_day === day
      );

      const completedCount = record
        ? [
            record.move,
            record.get_outside,
            record.hydrate,
            record.read,
            record.nourish,
            record.document,
            record.no_alcohol,
          ].filter(Boolean).length
        : 0;

      const isSelected = selectedDay === day;

      return (
        <button
          key={day}
          type="button"
          onClick={() =>
            setSelectedDay(isSelected ? null : day)
          }
          aria-pressed={isSelected}
          className={`flex aspect-square items-center justify-center rounded-lg border text-[11px] transition ${
            isSelected
              ? "border-[#A77B73] bg-[#A77B73] text-white"
              : completedCount === 7
                ? "border-[#D8B5AC] bg-[#EAD8D3] text-[#6F514B]"
                : record
                  ? "border-[#E5D8D3] bg-[#F7F1ED] text-[#806E68]"
                  : "border-[#EEE5E0] bg-white text-[#B9ACA6]"
          }`}
        >
          {String(day).padStart(2, "0")}
        </button>
      );
    })}
  </div>

  {selectedDay !== null && (() => {
    const record = dailyRecords.find(
      (item) => item.challenge_day === selectedDay
    );

    const habits = record
      ? [
          ["Move", record.move],
          ["Get outside", record.get_outside],
          ["Hydrate", record.hydrate],
          ["Read", record.read],
          ["Nourish", record.nourish],
          ["Document", record.document],
          ["No alcohol", record.no_alcohol],
        ] as const
      : [];

    return (
      <div className="mt-4 rounded-xl border border-[#E5D8D3] bg-[#F7F1ED] p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-xl">
            {formatDay(selectedDay)}
          </h3>

          {record?.progress_date && (
            <span className="text-[10px] text-[#806E68]">
              {formatDate(record.progress_date)}
            </span>
          )}
        </div>

        {record ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {habits.map(([label, completed]) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1.5 text-[11px] ${
                    completed
                      ? "bg-[#EAD8D3] text-[#6F514B]"
                      : "bg-white text-[#9C8C85]"
                  }`}
                >
                  {completed ? "✓" : "○"} {label}
                </span>
              ))}
            </div>

            {record.note && (
              <p className="mt-3 text-xs italic leading-5 text-[#806E68]">
                {record.note}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs italic text-[#9D6F67]">
            No progress was recorded for this day. ♡
          </p>
        )}
      </div>
    );
  })()}

  <p className="mt-4 text-center text-[10px] italic text-[#A77B73]">
    tap a day to revisit your commitments. ♡
  </p>
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
