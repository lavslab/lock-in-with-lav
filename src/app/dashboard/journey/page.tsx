"use client";

import Link from "next/link";

import DashboardSidebar from "@/components/DashboardSidebar";

import { useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  type DailyProgressRow,
  getChallengePercentage,
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

type JourneyProgressRow = DailyProgressRow & {
  manually_completed?: boolean;
};

type MeasurementRow = {
  id?: string;
  challenge_day: number;
  weight: number | string | null;
  waist: number | string | null;
  hips: number | string | null;
  chest: number | string | null;
  thigh: number | string | null;
  arm: number | string | null;
  created_at?: string;
};

type ProgressPhotoRow = {
  id?: string;
  challenge_day: number;
  storage_path: string;
  photo_type?: string;
  created_at?: string;
};

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForDatabase(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getChallengeDate(startDate: Date, challengeDay: number) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + challengeDay - 1);

  return date;
}

function getCompletedCommitmentCount(row?: DailyProgressRow) {
  if (!row) return 0;

  const commitments = [
    row.move,
    row.get_outside,
    row.hydrate,
    row.read,
    row.nourish,
    row.document,
    row.no_alcohol,
  ];

  return commitments.filter(Boolean).length;
}

function isDayComplete(row?: JourneyProgressRow) {
  if (!row) return false;

  return (
    getCompletedCommitmentCount(row) === 7 ||
    row.manually_completed === true
  );
}


function formatMeasurement(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";

  return value;
}

function PhotoHeart({
  src,
  complete,
}: {
  src: string;
  complete: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 92"
      className="h-[34px] w-[38px] sm:h-[39px] sm:w-[43px]"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="journey-photo-heart">
          <path
            d="
              M50 88
              C46 84 7 61 7 29
              C7 12 18 3 31 3
              C40 3 47 8 50 17
              C53 8 60 3 69 3
              C82 3 93 12 93 29
              C93 61 54 84 50 88
              Z
            "
          />
        </clipPath>
      </defs>

      <image
        href={src}
        x="0"
        y="0"
        width="100"
        height="92"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#journey-photo-heart)"
      />

      <path
        d="
          M50 88
          C46 84 7 61 7 29
          C7 12 18 3 31 3
          C40 3 47 8 50 17
          C53 8 60 3 69 3
          C82 3 93 12 93 29
          C93 61 54 84 50 88
          Z
        "
        fill="none"
        stroke={complete ? "#F7F1ED" : "#A77B73"}
        strokeWidth="3"
      />
    </svg>
  );
}

export default function JourneyPage() {
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );

  const [challengeLength, setChallengeLength] = useState(0);

  const [dailyProgress, setDailyProgress] =
  useState<JourneyProgressRow[]>([]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [dayDetailsLoading, setDayDetailsLoading] = useState(false);
  const [manualCompletionLoading, setManualCompletionLoading] =
  useState(false);

const [manualCompletionError, setManualCompletionError] =
  useState<string | null>(null);

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(
    null
  );

  const [selectedPhotoPath, setSelectedPhotoPath] = useState<string | null>(
    null
  );

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});

  const [selectedMeasurement, setSelectedMeasurement] =
    useState<MeasurementRow | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadJourney = async () => {
      setIsLoadingUser(true);
      setIsLoadingProgress(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load user:", userError);
      }

      if (!user) {
        setIsLoadingUser(false);
        setIsLoadingProgress(false);
        return;
      }

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const [
        { data: profile, error: profileError },
        { data: progressRows, error: progressError },
        { data: photoRows, error: photoRowsError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("challenge_start_date, challenge_length")
          .eq("id", user.id)
          .single(),

        supabase
          .from("daily_progress")
          .select(
  "challenge_day, move, get_outside, hydrate, read, nourish, document, no_alcohol, manually_completed"
)
          .eq("user_id", user.id)
          .order("challenge_day", { ascending: true }),

        supabase
          .from("progress_photos")
          .select(
            "id, challenge_day, storage_path, photo_type, created_at"
          )
          .eq("user_id", user.id)
          .eq("photo_type", "progress")
          .order("challenge_day", { ascending: true }),
      ]);

      if (profileError) {
        console.error("Could not load profile:", profileError);
      } else if (profile) {
        setChallengeStartDate(profile.challenge_start_date);
        setChallengeLength(profile.challenge_length ?? 0);
      }

      if (progressError) {
        console.error("Could not load daily progress:", progressError);
      } else {
        setDailyProgress(progressRows ?? []);
      }

      if (photoRowsError) {
        console.error(
          "Could not load progress photos:",
          photoRowsError
        );

        setPhotoUrls({});
      } else {
        const nextPhotoUrls: Record<number, string> = {};

        for (const row of (photoRows ?? []) as ProgressPhotoRow[]) {
          if (!row.storage_path || !row.challenge_day) continue;

          const { data: signedPhoto, error: signedPhotoError } =
            await supabase.storage
              .from("progress-photos")
              .createSignedUrl(row.storage_path, 60 * 60);

          if (signedPhotoError) {
            console.error(
              `Could not create photo URL for day ${row.challenge_day}:`,
              signedPhotoError
            );
            continue;
          }

          if (signedPhoto?.signedUrl) {
            nextPhotoUrls[row.challenge_day] = signedPhoto.signedUrl;
          }
        }

        setPhotoUrls(nextPhotoUrls);
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadJourney();
  }, [supabase]);

  let currentDay = 1;
  let startDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);

    if (challengeLength > 0) {
      currentDay = getCurrentChallengeDay(
        challengeStartDate,
        challengeLength
      );
    }
  }

  const safeCurrentDay =
    challengeLength > 0
      ? Math.min(Math.max(currentDay, 1), challengeLength)
      : 0;

  const dayNumber = String(safeCurrentDay).padStart(2, "0");

  const completedDayNumbers = dailyProgress
  .filter(
    (row) =>
      row.challenge_day <= challengeLength &&
      isDayComplete(row)
  )
  .map((row) => row.challenge_day);

  const completedDays = completedDayNumbers.length;

  const challengeProgress =
    challengeLength > 0
      ? getChallengePercentage(completedDays, challengeLength)
      : 0;

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const activeSelectedDay =
    challengeLength > 0
      ? Math.min(selectedDay ?? safeCurrentDay, challengeLength)
      : 0;

  const selectedDate =
    startDate && activeSelectedDay > 0
      ? getChallengeDate(startDate, activeSelectedDay)
      : null;

  const selectedProgress = dailyProgress.find(
    (row) => row.challenge_day === activeSelectedDay
  );

  const selectedCommitmentCount =
  getCompletedCommitmentCount(selectedProgress);

const selectedWasManuallyCompleted =
  selectedProgress?.manually_completed === true;

const selectedIsComplete =
  isDayComplete(selectedProgress);

const selectedIsCurrent =
  activeSelectedDay === safeCurrentDay;

const selectedIsPast =
  activeSelectedDay < safeCurrentDay;

const selectedIsUpcoming =
  activeSelectedDay > safeCurrentDay;

  const challengeDays = Array.from(
    { length: challengeLength },
    (_, index) => index + 1
  );

  async function openDayDetails(day: number) {
    if (day > safeCurrentDay || day > challengeLength) return;

    setSelectedDay(day);
    setDayDetailsOpen(true);
    setDayDetailsLoading(true);

    setSelectedPhotoUrl(null);
    setSelectedPhotoPath(null);
    setPhotoError(null);
    setSelectedMeasurement(null);
    setManualCompletionError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) {
        console.error(
          "Could not load user for day details:",
          userError
        );
      }

      setDayDetailsLoading(false);
      return;
    }

    const { data: photoRows, error: photoError } = await supabase
      .from("progress_photos")
      .select(
        "id, challenge_day, storage_path, created_at, photo_type"
      )
      .eq("user_id", user.id)
      .eq("challenge_day", day)
      .eq("photo_type", "progress")
      .order("created_at", { ascending: false })
      .limit(1);

    if (photoError) {
      console.error(
        "Could not load progress photo:",
        photoError
      );
    } else {
      const photo = (photoRows?.[0] ?? null) as ProgressPhotoRow | null;

      if (photo?.storage_path) {
        setSelectedPhotoPath(photo.storage_path);

        const { data: signedPhoto, error: signedPhotoError } =
          await supabase.storage
            .from("progress-photos")
            .createSignedUrl(photo.storage_path, 60 * 60);

        if (signedPhotoError) {
          console.error(
            "Could not create progress photo URL:",
            signedPhotoError
          );
        } else if (signedPhoto?.signedUrl) {
          setSelectedPhotoUrl(signedPhoto.signedUrl);

          setPhotoUrls((previous) => ({
            ...previous,
            [day]: signedPhoto.signedUrl,
          }));
        }
      }
    }

    const { data: measurementRows, error: measurementError } =
      await supabase
        .from("measurements")
        .select(
          "id, challenge_day, weight, waist, hips, chest, thigh, arm, created_at"
        )
        .eq("user_id", user.id)
        .eq("challenge_day", day)
        .order("created_at", { ascending: false })
        .limit(1);

    if (measurementError) {
      console.error(
        "Could not load measurements:",
        measurementError
      );
    } else {
      setSelectedMeasurement(
        (measurementRows?.[0] as MeasurementRow | undefined) ?? null
      );
    }

    setDayDetailsLoading(false);
  }

  function triggerPhotoUpload() {
    setPhotoError(null);
    photoInputRef.current?.click();
  }

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const day = activeSelectedDay;

    if (!day || day < 1 || day > challengeLength) {
      setPhotoError(
        "Please select a valid challenge day first."
      );

      event.target.value = "";
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError(null);

    let newFilePath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You need to be signed in to upload a progress photo."
        );
      }

      if (file.type && !file.type.startsWith("image/")) {
        throw new Error("Please choose an image file.");
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const paddedDay = String(day).padStart(2, "0");

      newFilePath =
        `${user.id}/day-${paddedDay}-${Date.now()}.${extension}`;

      const oldPath = selectedPhotoPath;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(newFilePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("progress-photos")
          .createSignedUrl(newFilePath, 60 * 60);

      if (signedError || !signedData?.signedUrl) {
        throw (
          signedError ??
          new Error("Could not create the photo preview.")
        );
      }

      const { error: photoRecordError } = await supabase
        .from("progress_photos")
        .upsert(
          {
            user_id: user.id,
            challenge_day: day,
            storage_path: newFilePath,
            photo_type: "progress",
            caption: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,challenge_day,photo_type",
          }
        );

      if (photoRecordError) {
        throw photoRecordError;
      }

      setSelectedPhotoUrl(signedData.signedUrl);
      setSelectedPhotoPath(newFilePath);

      setPhotoUrls((previous) => ({
        ...previous,
        [day]: signedData.signedUrl,
      }));

      const existingProgress = dailyProgress.find(
        (row) => row.challenge_day === day
      );

      const updatedProgress = {
        user_id: user.id,
        challenge_day: day,
        progress_date: selectedDate
          ? formatDateForDatabase(selectedDate)
          : new Date().toISOString().slice(0, 10),
        move: existingProgress?.move ?? false,
        get_outside: existingProgress?.get_outside ?? false,
        hydrate: existingProgress?.hydrate ?? false,
        read: existingProgress?.read ?? false,
        nourish: existingProgress?.nourish ?? false,
        document: true,
        no_alcohol: existingProgress?.no_alcohol ?? false,
        updated_at: new Date().toISOString(),
      };

      const { error: progressSaveError } = await supabase
        .from("daily_progress")
        .upsert(updatedProgress, {
          onConflict: "user_id,challenge_day",
        });

      setDailyProgress((previous) => {
        const alreadyExists = previous.some(
          (row) => row.challenge_day === day
        );

        if (alreadyExists) {
          return previous.map((row) =>
            row.challenge_day === day
              ? { ...row, document: true }
              : row
          );
        }

        return [
          ...previous,
          updatedProgress as DailyProgressRow,
        ].sort(
          (a, b) => a.challenge_day - b.challenge_day
        );
      });

      if (progressSaveError) {
        console.error(
          "Photo saved, but the document commitment could not be updated:",
          progressSaveError
        );

        setPhotoError(
          "Photo saved ♡ The photo is there, but the document check could not be updated."
        );
      }

      if (oldPath && oldPath !== newFilePath) {
        const { error: removeOldError } =
          await supabase.storage
            .from("progress-photos")
            .remove([oldPath]);

        if (removeOldError) {
          console.warn(
            "New progress photo saved, but the previous photo could not be removed:",
            removeOldError
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Could not upload photo. Please try again.";

      const lowerMessage = errorMessage.toLowerCase();

      if (
        !lowerMessage.includes("cancel") &&
        !lowerMessage.includes("canceled") &&
        !lowerMessage.includes("cancelled")
      ) {
        console.error(
          "Could not upload journey progress photo:",
          error
        );

        setPhotoError(errorMessage);
      }

      if (newFilePath) {
        await supabase.storage
          .from("progress-photos")
          .remove([newFilePath])
          .catch((cleanupError) => {
            console.warn(
              "Could not clean up failed journey photo upload:",
              cleanupError
            );
          });
      }
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  }
async function setManualDayCompletion(complete: boolean) {
  const day = activeSelectedDay;

  if (
    !day ||
    !selectedIsPast ||
    selectedCommitmentCount === 7
  ) {
    return;
  }

  setManualCompletionLoading(true);
  setManualCompletionError(null);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw (
        userError ??
        new Error(
          "You need to be signed in to update this day."
        )
      );
    }

    const existingProgress = dailyProgress.find(
      (row) => row.challenge_day === day
    );

    const progressDate = selectedDate
      ? formatDateForDatabase(selectedDate)
      : new Date().toISOString().slice(0, 10);

    const updatedProgress = {
      user_id: user.id,
      challenge_day: day,
      progress_date: progressDate,

      move: existingProgress?.move ?? false,
      get_outside:
        existingProgress?.get_outside ?? false,
      hydrate: existingProgress?.hydrate ?? false,
      read: existingProgress?.read ?? false,
      nourish: existingProgress?.nourish ?? false,
      document: existingProgress?.document ?? false,
      no_alcohol:
        existingProgress?.no_alcohol ?? false,

      manually_completed: complete,

      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from("daily_progress")
      .upsert(updatedProgress, {
        onConflict: "user_id,challenge_day",
      });

    if (saveError) {
      throw saveError;
    }

    setDailyProgress((previous) => {
      const alreadyExists = previous.some(
        (row) => row.challenge_day === day
      );

      if (alreadyExists) {
        return previous.map((row) =>
          row.challenge_day === day
            ? {
                ...row,
                manually_completed: complete,
              }
            : row
        );
      }

      return [
        ...previous,
        updatedProgress as JourneyProgressRow,
      ].sort(
        (a, b) =>
          a.challenge_day - b.challenge_day
      );
    });
  } catch (error) {
    console.error(
      "Could not update manual day completion:",
      error
    );

    setManualCompletionError(
      error instanceof Error
        ? error.message
        : "Could not update this day. Please try again."
    );
  } finally {
    setManualCompletionLoading(false);
  }
}
  function closeDayDetails() {
    setDayDetailsOpen(false);
  }

  function getSelectedStatus() {
    if (selectedIsComplete) return "complete ♡";
    if (selectedIsCurrent) return "in progress";
    if (selectedIsPast) return "incomplete";

    return "upcoming";
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="flex-1 px-6 py-8 md:px-10 lg:px-14">
          <div className="flex justify-end md:hidden">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[10px] tracking-[0.20em] transition hover:bg-[#EAD8D3]"
            >
              TODAY
            </Link>
          </div>

          <section className="mt-4 overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6]">
            <div className="px-7 pb-8 pt-7 md:px-10 md:pb-9 md:pt-9">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.34em] text-[#9D6F67]">
                    {selectedIsCurrent
                      ? "YOU ARE HERE"
                      : "YOUR JOURNEY"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h1 className="font-serif text-5xl leading-none md:text-6xl">
                      Day{" "}
                      {String(activeSelectedDay).padStart(2, "0")}
                    </h1>

                    {selectedDate && (
                      <p className="font-serif text-lg italic text-[#A77B73] md:text-xl">
                        {formatFullDate(selectedDate)}
                      </p>
                    )}
                  </div>
                </div>

                <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                  {selectedIsComplete
                    ? "you showed up. ♡"
                    : selectedIsCurrent
                      ? "keep showing up. ♡"
                      : selectedIsPast
                        ? "another day in your story. ♡"
                        : "one day at a time. ♡"}
                </p>
              </div>
            </div>

            <div className="grid border-t border-[#E7DCD7] sm:grid-cols-3">
              <div className="px-7 py-5 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  STATUS
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {getSelectedStatus()}
                </p>
              </div>

              <div className="border-t border-[#E7DCD7] px-7 py-5 sm:border-l sm:border-t-0 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  PROGRESS
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {isLoadingProgress
                    ? "—"
                    : `${challengeProgress}%`}
                </p>
              </div>

              <div className="border-t border-[#E7DCD7] px-7 py-5 sm:border-l sm:border-t-0 md:px-10">
                <p className="text-[8px] tracking-[0.25em] text-[#9D6F67]">
                  DAYS COMPLETE
                </p>

                <p className="mt-2 font-serif text-xl italic">
                  {isLoadingProgress ? "—" : completedDays}
                </p>
              </div>
            </div>

            <div className="border-t border-[#E7DCD7] px-7 pb-7 pt-6 md:px-10 md:pb-8">
              <div className="relative h-[4px] overflow-hidden rounded-full bg-[#E7DCD7]">
                <div
                  className="h-full rounded-full bg-[#A77B73] transition-all duration-500"
                  style={{
                    width: `${challengeProgress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[8px] tracking-[0.20em] text-[#9A8780]">
                <span>DAY 01</span>
                <span>DAY {challengeLength}</span>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#D5BBB5] bg-[#EAD8D3] px-5 pb-8 pt-10 sm:px-8 md:px-10 md:pb-10 md:pt-12">
              <div className="absolute -top-3 left-0 right-0 flex justify-center gap-12">
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
                <span className="h-7 w-[2px] rounded-full bg-[#A77B73]" />
              </div>

              <div className="flex flex-col gap-6 border-b border-[#CFB5AE] pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.38em] text-[#8F655E]">
                    YOUR
                  </p>

                  <h2 className="mt-2 font-serif text-4xl italic text-[#A77B73] md:text-5xl">
                    {challengeLength} days.
                  </h2>
                </div>

                <div className="sm:text-right">
                  <p className="text-[9px] tracking-[0.30em] text-[#8F655E]">
                    LOCK IN WITH LAV
                  </p>

                  <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                    you are here — day {dayNumber}. ♡
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#A77B73] text-[9px] text-[#F7F1ED]">
                    ✓
                  </span>

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    COMPLETE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md border-2 border-[#8F655E] bg-[#F7F1ED]" />

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    TODAY
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md border border-[#D7C2BC] bg-[#F7F1ED]/30" />

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="overflow-hidden rounded-full">
                    <span className="block h-5 w-5 bg-[#A77B73]" />
                  </span>

                  <span className="text-[8px] tracking-[0.18em] text-[#806E68]">
                    PHOTO SAVED
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-4 sm:grid-cols-10 sm:gap-3 lg:grid-cols-[repeat(15,minmax(0,1fr))]">
                {challengeDays.map((day) => {
                  const progressForDay = dailyProgress.find(
                    (row) => row.challenge_day === day
                  );

                  const completedForDay =
  getCompletedCommitmentCount(progressForDay);

const isComplete =
  isDayComplete(progressForDay);
                  const isCurrent = day === safeCurrentDay;
                  const isUpcoming = day > safeCurrentDay;
                  const isSelected = day === activeSelectedDay;

                  const dayPhotoUrl = photoUrls[day];
                  const hasPhoto = Boolean(dayPhotoUrl);

                  const dayDate = startDate
                    ? getChallengeDate(startDate, day)
                    : null;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => openDayDetails(day)}
                      disabled={isUpcoming}
                      aria-label={
                        dayDate
                          ? `Day ${day}, ${formatFullDate(dayDate)}${
                              hasPhoto
                                ? ", progress photo saved"
                                : ""
                            }`
                          : `Day ${day}`
                      }
                      className={`group relative flex aspect-square min-h-[64px] flex-col items-center justify-center rounded-xl border transition duration-200 sm:min-h-[76px] ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : isCurrent
                            ? "border-2 border-[#8F655E] bg-[#F7F1ED] text-[#211C19]"
                            : isUpcoming
                              ? "cursor-default border-[#D7C2BC] bg-[#F7F1ED]/30 text-[#AA9690]"
                              : "border-[#CBA9A2] bg-[#F7F1ED]/65 text-[#806E68] hover:-translate-y-0.5 hover:bg-[#F7F1ED]"
                      } ${
                        isSelected && !isCurrent
                          ? "ring-2 ring-[#8F655E] ring-offset-2 ring-offset-[#EAD8D3]"
                          : ""
                      }`}
                    >
                      <span
                        className={`font-serif text-sm sm:text-base ${
                          hasPhoto ? "absolute left-2 top-2" : ""
                        }`}
                      >
                        {String(day).padStart(2, "0")}
                      </span>

                      {hasPhoto && dayPhotoUrl && (
                        <span
                          className={`mt-3 block ${
                            isComplete
                              ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                              : ""
                          }`}
                          title="Progress photo saved — click to view"
                        >
                          <PhotoHeart
                            src={dayPhotoUrl}
                            complete={isComplete}
                          />
                        </span>
                      )}

                      {isComplete && (
                        <span className="absolute right-1.5 top-1 text-[8px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-2 border-t border-[#CFB5AE] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[8px] tracking-[0.28em] text-[#8F655E]">
                  {completedDays} DAYS COMPLETE
                </p>

                <p className="font-serif text-lg italic text-[#A77B73]">
                  {challengeLength > 0 &&
                  completedDays === challengeLength
                    ? `${challengeLength} days. you did it. ♡`
                    : "keep going. one day at a time. ♡"}
                </p>
              </div>
            </div>
          </section>

          <div className="py-16 text-center">
            <p className="font-serif text-3xl italic text-[#A77B73]">
              imagine what choosing yourself, one day at a time, can do. ♡
            </p>
          </div>
        </section>
      </div>

      {dayDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/45 px-4 py-6 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDayDetails();
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[#D8C5BF] bg-[#FBF8F6] shadow-2xl">
            <button
              type="button"
              onClick={closeDayDetails}
              aria-label="Close day details"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C5BF] bg-[#FBF8F6] text-lg text-[#806E68] transition hover:bg-[#EAD8D3]"
            >
              ×
            </button>

            <div className="border-b border-[#E5D8D3] px-7 pb-7 pt-8 md:px-10 md:pb-8 md:pt-10">
              <p className="text-[9px] tracking-[0.34em] text-[#9D6F67]">
                YOUR JOURNEY
              </p>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2 pr-12">
                <h2 className="font-serif text-4xl leading-none md:text-5xl">
                  Day{" "}
                  {String(activeSelectedDay).padStart(2, "0")}
                </h2>

                {selectedDate && (
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    {formatFullDate(selectedDate)}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-[8px] tracking-[0.20em] ${
                    selectedIsComplete
                      ? "bg-[#A77B73] text-[#FBF8F6]"
                      : "border border-[#D5BBB5] bg-[#F7F1ED] text-[#8F655E]"
                  }`}
                >
                  {selectedIsComplete
                    ? "DAY COMPLETE"
                    : "DAY IN PROGRESS"}
                </span>

                <span className="text-[9px] tracking-[0.18em] text-[#8F655E]">
                  {selectedCommitmentCount} / 7 COMMITMENTS
                </span>
              </div>
            </div>

            {dayDetailsLoading ? (
              <div className="flex min-h-[360px] items-center justify-center px-7 py-14">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D8C5BF] border-t-[#A77B73]" />

                  <p className="mt-5 font-serif text-xl italic text-[#A77B73]">
                    opening your day... ♡
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="border-b border-[#E5D8D3] p-7 md:border-b-0 md:border-r md:p-10">
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    PROGRESS PHOTO
                  </p>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    this day, captured.
                  </h3>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="mt-6">
                    {selectedPhotoUrl ? (
                      <div>
                        <div className="overflow-hidden rounded-[1.6rem] border border-[#D8C5BF] bg-[#F1E7E3]">
                          <img
                            src={selectedPhotoUrl}
                            alt={`Progress photo for day ${activeSelectedDay}`}
                            className="aspect-[4/5] w-full object-cover"
                          />
                        </div>

                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={triggerPhotoUpload}
                            disabled={isUploadingPhoto}
                            className="rounded-full border border-[#CBA9A2] bg-[#FBF8F6] px-5 py-2.5 text-[8px] tracking-[0.20em] text-[#806E68] transition hover:bg-[#EAD8D3] disabled:cursor-wait disabled:opacity-60"
                          >
                            {isUploadingPhoto
                              ? "UPLOADING..."
                              : "CHANGE PHOTO"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[1.6rem] border border-dashed border-[#CBA9A2] bg-[#F7F1ED] px-8 text-center">
                        <div>
                          <p className="font-serif text-3xl italic text-[#A77B73]">
                            no photo yet. ♡
                          </p>

                          <p className="mx-auto mt-3 max-w-xs text-[9px] leading-5 tracking-[0.16em] text-[#8F7C76]">
                            NO PROGRESS PHOTO WAS SAVED FOR THIS DAY.
                          </p>

                          <button
                            type="button"
                            onClick={triggerPhotoUpload}
                            disabled={isUploadingPhoto}
                            className="mt-6 rounded-full bg-[#A77B73] px-6 py-3 text-[8px] tracking-[0.20em] text-[#FBF8F6] transition hover:bg-[#8F655E] disabled:cursor-wait disabled:opacity-60"
                          >
                            {isUploadingPhoto
                              ? "UPLOADING..."
                              : "UPLOAD PHOTO"}
                          </button>
                        </div>
                      </div>
                    )}

                    {photoError && (
                      <p className="mt-4 text-center text-[8px] leading-5 tracking-[0.10em] text-[#9D6F67]">
                        {photoError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-7 md:p-10">
                  <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                    MEASUREMENTS
                  </p>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    a little snapshot of you.
                  </h3>

                  {selectedMeasurement ? (
                    <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-[#E0D2CD]">
                      <div className="border-b border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          WEIGHT
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.weight
                          )}
                        </p>
                      </div>

                      <div className="border-b border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          WAIST
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.waist
                          )}
                        </p>
                      </div>

                      <div className="border-b border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          HIPS
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.hips
                          )}
                        </p>
                      </div>

                      <div className="border-b border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          CHEST
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.chest
                          )}
                        </p>
                      </div>

                      <div className="border-r border-[#E0D2CD] p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          THIGH
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.thigh
                          )}
                        </p>
                      </div>

                      <div className="p-5">
                        <p className="text-[8px] tracking-[0.20em] text-[#9D6F67]">
                          ARM
                        </p>

                        <p className="mt-2 font-serif text-2xl">
                          {formatMeasurement(
                            selectedMeasurement.arm
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-7 rounded-[1.5rem] border border-dashed border-[#CBA9A2] bg-[#F7F1ED] px-6 py-9 text-center">
                      <p className="font-serif text-2xl italic text-[#A77B73]">
                        nothing recorded. ♡
                      </p>

                      <p className="mt-3 text-[8px] leading-5 tracking-[0.16em] text-[#8F7C76]">
                        NO MEASUREMENTS WERE SAVED FOR THIS DAY.
                      </p>
                    </div>
                  )}

                  <div className="mt-7 rounded-[1.5rem] bg-[#EAD8D3] p-6">
                    <p className="text-[8px] tracking-[0.25em] text-[#8F655E]">
                      SHOWING UP
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-serif text-4xl">
                          {selectedCommitmentCount}

                          <span className="text-xl text-[#A77B73]">
                            {" "}
                            / 7
                          </span>
                        </p>

                        <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
  {selectedWasManuallyCompleted
    ? "you marked this day complete. ♡"
    : selectedIsComplete
      ? "you did everything you said you would. ♡"
      : selectedIsCurrent
        ? "the day isn't over yet. ♡"
        : "part of the story, too. ♡"}
</p>
                      </div>

                      {selectedIsPast &&
  selectedCommitmentCount < 7 && (
    <div className="mt-5 rounded-[1.5rem] border border-[#D8C5BF] bg-[#F7F1ED] p-5">
      <p className="text-[8px] tracking-[0.25em] text-[#8F655E]">
        MANUAL COMPLETION
      </p>

      <p className="mt-2 font-serif text-lg italic text-[#806E68]">
        {selectedWasManuallyCompleted
          ? "Marked complete manually. Your original check-ins are still saved. ♡"
          : "Did you finish this day but forget to check everything off?"}
      </p>

      {manualCompletionError && (
        <p className="mt-3 text-[8px] leading-5 tracking-[0.10em] text-[#9D6F67]">
          {manualCompletionError}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          setManualDayCompletion(
            !selectedWasManuallyCompleted
          )
        }
        disabled={manualCompletionLoading}
        className={`mt-5 w-full rounded-full px-6 py-3 text-[8px] tracking-[0.20em] transition disabled:cursor-wait disabled:opacity-60 ${
          selectedWasManuallyCompleted
            ? "border border-[#CBA9A2] bg-[#FBF8F6] text-[#806E68] hover:bg-[#EAD8D3]"
            : "bg-[#A77B73] text-[#FBF8F6] hover:bg-[#8F655E]"
        }`}
      >
        {manualCompletionLoading
          ? "SAVING..."
          : selectedWasManuallyCompleted
            ? "UNDO MANUAL COMPLETION"
            : "MARK DAY COMPLETE ♡"}
      </button>
    </div>
  )}

                      {selectedIsComplete && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A77B73] text-[#FBF8F6]">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}