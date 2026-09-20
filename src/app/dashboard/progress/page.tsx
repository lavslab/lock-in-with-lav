"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  type DailyProgressRow,
  calculateStreak,
  getChallengeEndDate,
  getChallengePercentage,
  getCompletedDayNumbers,
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

const supabase = createClient();

const wins = [
  "I feel stronger",
  "My energy is better",
  "I'm more consistent",
  "My clothes fit differently",
];

function formatShortDate(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
}

export default function ProgressPage() {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );
  const [dailyProgress, setDailyProgress] = useState<DailyProgressRow[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [photoPaths, setPhotoPaths] = useState<Record<number, string>>({});
  const [editingPhotoDay, setEditingPhotoDay] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoTargetDay, setPhotoTargetDay] = useState(1);
  const [selectedDiaryDay, setSelectedDiaryDay] = useState<number | null>(null);
  const [measurementRow, setMeasurementRow] = useState<{
    weight: number | null; waist: number | null; hips: number | null; chest: number | null; thigh: number | null; arm: number | null; challenge_day: number | null;
  } | null>(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);
  const [measurementForm, setMeasurementForm] = useState({ weight: "", waist: "", hips: "", chest: "", thigh: "", arm: "" });
  const [completedWins, setCompletedWins] = useState<Record<string, boolean>>({});
  const [weeklyCheckins, setWeeklyCheckins] = useState<Record<number, { went_well: string; felt_hard: string; proud_of: string; next_week_focus: string }>>({});
  const [checkinWeek, setCheckinWeek] = useState<number | null>(null);
  const [checkinForm, setCheckinForm] = useState({ went_well: "", felt_hard: "", proud_of: "", next_week_focus: "" });
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      // Load saved progress-photo records from the database, then create signed URLs
      // for the matching private Storage objects.
      const { data: storedPhotos, error: photosLoadError } = await supabase
        .from("progress_photos")
        .select("challenge_day, storage_path")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (photosLoadError) {
        console.error("Could not load progress photo records:", photosLoadError);
      } else {
        const latestPhotoByDay = new Map<number, string>();

        for (const photo of storedPhotos ?? []) {
          if (!latestPhotoByDay.has(photo.challenge_day)) {
            latestPhotoByDay.set(photo.challenge_day, photo.storage_path);
          }
        }

        const loadedUrls: Record<number, string> = {};
        const loadedPaths: Record<number, string> = {};

        await Promise.all(
          Array.from(latestPhotoByDay.entries()).map(async ([photoDay, path]) => {
            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("progress-photos")
                .createSignedUrl(path, 60 * 60);

            if (!signedError && signedData?.signedUrl) {
              loadedUrls[photoDay] = signedData.signedUrl;
              loadedPaths[photoDay] = path;
            }
          })
        );

        setPhotoUrls(loadedUrls);
        setPhotoPaths(loadedPaths);
      }

      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Could not load profile:", error);
      } else if (profile) {
        setChallengeStartDate(profile.challenge_start_date);
      }

      const { data: progressRows, error: progressError } = await supabase
        .from("daily_progress")
        .select(
          "challenge_day, move, get_outside, hydrate, read, nourish, document"
        )
        .eq("user_id", user.id)
        .order("challenge_day", { ascending: true });

      if (progressError) {
        console.error("Could not load daily progress:", progressError);
      } else {
        setDailyProgress((progressRows ?? []) as DailyProgressRow[]);
      }

      const { data: savedWins, error: winsLoadError } = await supabase
        .from("little_wins")
        .select("win_key, is_completed")
        .eq("user_id", user.id);

      if (winsLoadError) {
        console.error("Could not load little wins:", winsLoadError);
      } else {
        const loadedWins: Record<string, boolean> = {};
        for (const row of savedWins ?? []) {
          loadedWins[row.win_key] = row.is_completed;
        }
        setCompletedWins(loadedWins);
      }

      const { data: savedCheckins, error: checkinsLoadError } = await supabase
        .from("weekly_checkins")
        .select("week_number, went_well, felt_hard, proud_of, next_week_focus")
        .eq("user_id", user.id);

      if (checkinsLoadError) {
        console.error("Could not load weekly check-ins:", checkinsLoadError);
      } else {
        const loadedCheckins: Record<number, { went_well: string; felt_hard: string; proud_of: string; next_week_focus: string }> = {};
        for (const row of savedCheckins ?? []) loadedCheckins[row.week_number] = row;
        setWeeklyCheckins(loadedCheckins);
      }

      const { data: latestMeasurement, error: measurementLoadError } = await supabase
        .from("measurements")
        .select("weight, waist, hips, chest, thigh, arm, challenge_day")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (measurementLoadError) {
        console.error("Could not load measurements:", measurementLoadError);
      } else if (latestMeasurement) {
        setMeasurementRow(latestMeasurement);
      }

      setIsLoadingUser(false);
    };

    getUserAndProfile();
  }, []);

  const openPhotoPicker = (day: number) => {
    setPhotoTargetDay(day);
    setPhotoError(null);
    photoInputRef.current?.click();
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You need to be signed in to upload a progress photo.");
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const day = String(photoTargetDay).padStart(2, "0");
      const filePath = `${user.id}/day-${day}-${Date.now()}.${extension}`;

      // If this day already has a photo, remove it before uploading the replacement.
      const oldPath = photoPaths[photoTargetDay];
      if (oldPath) {
        const { error: removeOldError } = await supabase.storage
          .from("progress-photos")
          .remove([oldPath]);

        if (removeOldError) throw removeOldError;
      }

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(filePath, 60 * 60);

      if (signedError) throw signedError;

      const { error: photoRecordError } = await supabase
        .from("progress_photos")
        .upsert(
          {
            user_id: user.id,
            challenge_day: photoTargetDay,
            storage_path: filePath,
            photo_type: "progress",
            caption: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,challenge_day,photo_type" }
        );

      if (photoRecordError) {
        // Avoid leaving an orphaned Storage object if the database save fails.
        await supabase.storage.from("progress-photos").remove([filePath]);
        throw photoRecordError;
      }

      setPhotoUrls((previous) => ({
        ...previous,
        [photoTargetDay]: signedData.signedUrl,
      }));
      setPhotoPaths((previous) => ({
        ...previous,
        [photoTargetDay]: filePath,
      }));
      setEditingPhotoDay(null);
    } catch (error) {
      console.error("Could not upload progress photo:", error);
      setPhotoError(
        error instanceof Error ? error.message : "Could not upload photo. Please try again."
      );
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const openMeasurementModal = () => {
    setMeasurementError(null);
    setMeasurementForm({
      weight: measurementRow?.weight?.toString() ?? "",
      waist: measurementRow?.waist?.toString() ?? "",
      hips: measurementRow?.hips?.toString() ?? "",
      chest: measurementRow?.chest?.toString() ?? "",
      thigh: measurementRow?.thigh?.toString() ?? "",
      arm: measurementRow?.arm?.toString() ?? "",
    });
    setIsMeasurementModalOpen(true);
  };

  const saveMeasurements = async () => {
    setIsSavingMeasurements(true);
    setMeasurementError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You need to be signed in to save measurements.");

      const toNumber = (value: string) => value.trim() === "" ? null : Number(value);
      const payload = {
        user_id: user.id,
        challenge_day: currentDay,
        weight: toNumber(measurementForm.weight),
        waist: toNumber(measurementForm.waist),
        hips: toNumber(measurementForm.hips),
        chest: toNumber(measurementForm.chest),
        thigh: toNumber(measurementForm.thigh),
        arm: toNumber(measurementForm.arm),
      };

      const values = [payload.weight, payload.waist, payload.hips, payload.chest, payload.thigh, payload.arm];
      if (values.some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
        throw new Error("Please enter valid positive numbers.");
      }

      const { data, error } = await supabase
        .from("measurements")
        .insert(payload)
        .select("weight, waist, hips, chest, thigh, arm, challenge_day")
        .single();
      if (error) throw error;

      setMeasurementRow(data);
      setIsMeasurementModalOpen(false);
    } catch (error) {
      console.error("Could not save measurements:", error);
      setMeasurementError(error instanceof Error ? error.message : "Could not save measurements. Please try again.");
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const toggleWin = async (win: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const isCompleted = !completedWins[win];
    setCompletedWins((previous) => ({ ...previous, [win]: isCompleted }));

    const { error } = await supabase.from("little_wins").upsert(
      {
        user_id: user.id,
        win_key: win,
        label: win,
        is_completed: isCompleted,
        challenge_day: currentDay,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,win_key,challenge_day" }
    );

    if (error) {
      console.error("Could not save little win:", error);
      setCompletedWins((previous) => ({ ...previous, [win]: !isCompleted }));
    }
  };

  const openWeeklyCheckin = (week: number) => {
    const saved = weeklyCheckins[week];
    setCheckinError(null);
    setCheckinForm(saved ?? { went_well: "", felt_hard: "", proud_of: "", next_week_focus: "" });
    setCheckinWeek(week);
  };

  const saveWeeklyCheckin = async () => {
    if (checkinWeek === null) return;
    setIsSavingCheckin(true);
    setCheckinError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You need to be signed in to save a check-in.");
      const payload = { user_id: user.id, week_number: checkinWeek, ...checkinForm, updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from("weekly_checkins").upsert(payload, { onConflict: "user_id,week_number" }).select("week_number, went_well, felt_hard, proud_of, next_week_focus").single();
      if (error) throw error;
      setWeeklyCheckins((previous) => ({ ...previous, [checkinWeek]: data }));
      setCheckinWeek(null);
    } catch (error) {
      console.error("Could not save weekly check-in:", error);
      setCheckinError(error instanceof Error ? error.message : "Could not save check-in. Please try again.");
    } finally { setIsSavingCheckin(false); }
  };

  const removeProgressPhoto = async (day: number) => {
    const path = photoPaths[day];
    if (!path) return;

    setPhotoError(null);

    const { error } = await supabase.storage
      .from("progress-photos")
      .remove([path]);

    if (error) {
      setPhotoError(error.message);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setPhotoError("Could not verify your account while removing the photo.");
      return;
    }

    const { error: recordDeleteError } = await supabase
      .from("progress_photos")
      .delete()
      .eq("user_id", user.id)
      .eq("challenge_day", day)
      .eq("photo_type", "progress");

    if (recordDeleteError) {
      console.error("Could not remove progress photo record:", recordDeleteError);
      setPhotoError(recordDeleteError.message);
      return;
    }

    setPhotoUrls((previous) => {
      const next = { ...previous };
      delete next[day];
      return next;
    });

    setPhotoPaths((previous) => {
      const next = { ...previous };
      delete next[day];
      return next;
    });

    setEditingPhotoDay(null);
  };

  const today = new Date();

  let currentDay = 1;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);
    endDate = getChallengeEndDate(challengeStartDate);
    currentDay = getCurrentChallengeDay(challengeStartDate, today);
  }

  const dayNumber = String(currentDay).padStart(2, "0");
  const completedDayNumbers = getCompletedDayNumbers(dailyProgress);
  const completedDays = completedDayNumbers.length;
  const currentStreak = calculateStreak(completedDayNumbers, currentDay);
  const challengePercentage = getChallengePercentage(completedDays);

  const startLabel = startDate ? formatShortDate(startDate) : "—";
  const endLabel = endDate ? formatShortDate(endDate) : "—";

  const diaryDays = Object.keys(photoUrls)
    .map(Number)
    .filter((day) => Number.isFinite(day))
    .sort((a, b) => a - b);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const progressMessage =
    currentDay === 1
      ? "we're just getting started. ♡"
      : currentDay < 26
        ? "keep showing up. ♡"
        : currentDay < 51
          ? "look how far you've come. ♡"
          : currentDay < 75
            ? "you're in it now. keep going. ♡"
            : "75 days. you did that. ♡";

  const measurementDisplay = [
    ["WEIGHT", measurementRow?.weight != null ? `${measurementRow.weight} lb` : "—"],
    ["WAIST", measurementRow?.waist != null ? `${measurementRow.waist} in` : "—"],
    ["HIPS", measurementRow?.hips != null ? `${measurementRow.hips} in` : "—"],
    ["CHEST", measurementRow?.chest != null ? `${measurementRow.chest} in` : "—"],
    ["THIGH", measurementRow?.thigh != null ? `${measurementRow.thigh} in` : "—"],
    ["ARM", measurementRow?.arm != null ? `${measurementRow.arm} in` : "—"],
  ];

  const stats = [
    {
      value: dayNumber,
      label: "CURRENT DAY",
    },
    {
      value: String(completedDays),
      label: "DAYS COMPLETE",
    },
    {
      value: String(currentStreak),
      label: "CURRENT STREAK",
    },
    {
      value: String(Object.keys(weeklyCheckins).length),
      label: "CHECK-INS",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        {/* MAIN */}
        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* TOP */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>

              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">
                look how far you&apos;ve come. ♡
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[7px] tracking-[0.25em] transition hover:bg-[#EAD8D3] md:hidden"
            >
              TODAY
            </Link>
          </header>

          {/* HERO */}
          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-9 text-[#F7F1ED] md:px-10 md:py-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
                  YOUR PROGRESS
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
                  Day {dayNumber}
                  <span className="italic text-[#DDB5AE]">
                    {" "}/ 75
                  </span>
                </h1>

                <p className="mt-3 font-serif text-xl italic text-[#DDB5AE]">
                  {progressMessage}
                </p>
              </div>

              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] tracking-[0.2em] text-[#BFAEAA]">
                    CHALLENGE PROGRESS
                  </span>

                  <span className="font-serif text-lg text-[#DDB5AE]">
                    {challengePercentage}%
                  </span>
                </div>

                <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[#493D39]">
                  <div
                    className="h-full rounded-full bg-[#DDB5AE] transition-all duration-500"
                    style={{
                      width: `${challengePercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[6px] tracking-[0.18em] text-[#8F7C76]">
                  <span>{startLabel}</span>
                  <span>{endLabel}</span>
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="grid grid-cols-2 gap-3 py-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 py-6"
              >
                <p className="font-serif text-3xl text-[#A77B73]">
                  {stat.value}
                </p>

                <p className="mt-2 text-[6px] tracking-[0.22em] text-[#806E68]">
                  {stat.label}
                </p>
              </div>
            ))}
          </section>

          {/* PROGRESS PHOTOS */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
                  PROGRESS PHOTOS
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  See the
                  <span className="italic text-[#A77B73]">
                    {" "}difference.
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[7px] tracking-[0.18em] text-[#9D6F67]">
                <span>♡</span>
                <span>PRIVATE TO YOU</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* DAY 1 */}
              <div className="group overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#EEE3DF]">
                  {photoUrls[1] ? (
                    <>
                      <img
                        src={photoUrls[1]}
                        alt="Day 1 progress"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingPhotoDay(editingPhotoDay === 1 ? null : 1)}
                        className="absolute right-4 top-4 z-10 rounded-full bg-[#211C19]/90 px-4 py-2 text-[6px] tracking-[0.2em] text-[#F7F1ED]"
                      >
                        EDIT PHOTO
                      </button>
                      {editingPhotoDay === 1 && (
                        <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#D7C4BE] bg-[#F7F1ED] shadow-lg">
                          <button type="button" onClick={() => openPhotoPicker(1)}
                            className="block w-full px-4 py-3 text-left text-[7px] tracking-[0.15em] hover:bg-[#EADCD7]">
                            REPLACE PHOTO
                          </button>
                          <button type="button" onClick={() => removeProgressPhoto(1)}
                            className="block w-full border-t border-[#D7C4BE] px-4 py-3 text-left text-[7px] tracking-[0.15em] text-[#9D6F67] hover:bg-[#EADCD7]">
                            REMOVE PHOTO
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPhotoPicker(1)}
                      disabled={isUploadingPhoto}
                      className="flex flex-col items-center disabled:opacity-50"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-2xl text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                        +
                      </span>

                      <span className="mt-3 text-[7px] tracking-[0.2em] text-[#8F655E]">
                        {isUploadingPhoto && photoTargetDay === 1
                          ? "UPLOADING..."
                          : "ADD PHOTO"}
                      </span>
                    </button>
                  )}

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {photoError && photoTargetDay === 1 && (
                  <p className="px-5 pt-3 text-[9px] text-[#9D6F67]">
                    {photoError}
                  </p>
                )}

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      DAY 01
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the beginning.
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    {startLabel}
                  </span>
                </div>
              </div>

              {/* CURRENT / NEXT PHOTO */}
              <div
                className={`group overflow-hidden rounded-[1.75rem] border bg-[#FBF8F6] ${
                  currentDay > 1
                    ? "border-[#CBA9A2]"
                    : "border-[#DED0CB]"
                }`}
              >
                <div
                  className={`relative flex aspect-[4/5] items-center justify-center ${
                    currentDay > 1
                      ? "bg-[#EAD8D3]"
                      : "bg-[#F1EAE7]"
                  }`}
                >
                  {currentDay > 1 ? (
                    <>
                      <span className="absolute left-4 top-4 rounded-full bg-[#211C19] px-4 py-2 text-[6px] tracking-[0.2em] text-[#F7F1ED]">
                        CURRENT
                      </span>

                      {photoUrls[currentDay] ? (
                        <>
                          <img
                            src={photoUrls[currentDay]}
                            alt={`Day ${currentDay} progress`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingPhotoDay(editingPhotoDay === currentDay ? null : currentDay)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-[#211C19]/90 px-4 py-2 text-[6px] tracking-[0.2em] text-[#F7F1ED]"
                          >
                            EDIT PHOTO
                          </button>
                          {editingPhotoDay === currentDay && (
                            <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#D7C4BE] bg-[#F7F1ED] shadow-lg">
                              <button type="button" onClick={() => openPhotoPicker(currentDay)}
                                className="block w-full px-4 py-3 text-left text-[7px] tracking-[0.15em] hover:bg-[#EADCD7]">
                                REPLACE PHOTO
                              </button>
                              <button type="button" onClick={() => removeProgressPhoto(currentDay)}
                                className="block w-full border-t border-[#D7C4BE] px-4 py-3 text-left text-[7px] tracking-[0.15em] text-[#9D6F67] hover:bg-[#EADCD7]">
                                REMOVE PHOTO
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPhotoPicker(currentDay)}
                          disabled={isUploadingPhoto}
                          className="flex flex-col items-center disabled:opacity-50"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B48A82] font-serif text-2xl text-[#9D6F67] transition group-hover:bg-[#DFC7C1]">
                            +
                          </span>

                          <span className="mt-3 text-[7px] tracking-[0.2em] text-[#8F655E]">
                            {isUploadingPhoto && photoTargetDay === currentDay
                              ? "UPLOADING..."
                              : "ADD PHOTO"}
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="font-serif text-4xl text-[#D0B7B1]">
                        ♡
                      </span>

                      <p className="mt-3 text-[7px] tracking-[0.2em] text-[#A7938D]">
                        KEEP SHOWING UP
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      {currentDay === 1
                        ? "YOUR NEXT PHOTO"
                        : `DAY ${dayNumber}`}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      {currentDay === 1 ? "keep going." : "right now."}
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    {currentDay === 1 ? "LOCKED" : "TODAY"}
                  </span>
                </div>
              </div>

              {/* DAY 75 */}
              <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="flex aspect-[4/5] items-center justify-center bg-[#F1EAE7]">
                  <div className="text-center">
                    <span className="font-serif text-4xl text-[#D0B7B1]">
                      ♡
                    </span>

                    <p className="mt-3 text-[7px] tracking-[0.2em] text-[#A7938D]">
                      SEE YOU ON DAY 75
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[7px] tracking-[0.25em]">
                      DAY 75
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the finish.
                    </p>
                  </div>

                  <span className="text-[7px] text-[#927D76]">
                    {endLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PROGRESS DIARY */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">
                  YOUR PROGRESS DIARY
                </p>
                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Every day you
                  <span className="italic text-[#A77B73]"> showed up. ♡</span>
                </h2>
              </div>

              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">
                {diaryDays.length} {diaryDays.length === 1 ? "PHOTO" : "PHOTOS"} SAVED
              </p>
            </div>

            {diaryDays.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {diaryDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDiaryDay(day)}
                    className="group overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] text-left transition hover:-translate-y-0.5 hover:border-[#CBA9A2]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#EEE3DF]">
                      <img
                        src={photoUrls[day]}
                        alt={`Day ${day} progress`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      {day === currentDay && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#211C19] px-3 py-1.5 text-[5px] tracking-[0.18em] text-[#F7F1ED]">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-4 py-4">
                      <div>
                        <p className="text-[6px] tracking-[0.22em] text-[#806E68]">
                          DAY {String(day).padStart(2, "0")}
                        </p>
                        <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                          {day === 1
                            ? "the beginning."
                            : day === 75
                              ? "the finish."
                              : "kept showing up."}
                        </p>
                      </div>
                      <span className="text-[#A77B73]">♡</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D8C7C1] bg-[#FBF8F6] px-6 py-12 text-center">
                <p className="font-serif text-2xl italic text-[#A77B73]">
                  your story starts with the first photo. ♡
                </p>
              </div>
            )}
          </section>

          {/* DIARY PHOTO VIEWER */}
          {selectedDiaryDay !== null && photoUrls[selectedDiaryDay] && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/75 p-5 backdrop-blur-sm"
              onClick={() => setSelectedDiaryDay(null)}
            >
              <div
                className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#F7F1ED] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative max-h-[70vh] overflow-hidden bg-[#EEE3DF]">
                  <img
                    src={photoUrls[selectedDiaryDay]}
                    alt={`Day ${selectedDiaryDay} progress`}
                    className="max-h-[70vh] w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedDiaryDay(null)}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#211C19]/90 text-sm text-[#F7F1ED]"
                    aria-label="Close photo"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-[7px] tracking-[0.25em] text-[#806E68]">
                      PROGRESS PHOTO
                    </p>
                    <p className="mt-1 font-serif text-2xl italic text-[#A77B73]">
                      Day {String(selectedDiaryDay).padStart(2, "0")} ♡
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDiaryDay(null);
                        openPhotoPicker(selectedDiaryDay);
                      }}
                      className="rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[6px] tracking-[0.18em] text-[#8F655E]"
                    >
                      REPLACE
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await removeProgressPhoto(selectedDiaryDay);
                        setSelectedDiaryDay(null);
                      }}
                      className="rounded-full bg-[#211C19] px-4 py-2.5 text-[6px] tracking-[0.18em] text-[#F7F1ED]"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isMeasurementModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/70 p-5 backdrop-blur-sm" onClick={() => setIsMeasurementModalOpen(false)}>
              <div className="w-full max-w-xl rounded-[2rem] bg-[#F7F1ED] p-7 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[7px] tracking-[0.35em] text-[#9D6F67]">MEASUREMENTS</p>
                    <h2 className="mt-2 font-serif text-3xl">Update your numbers. ♡</h2>
                    <p className="mt-2 text-[8px] tracking-[0.15em] text-[#927D76]">DAY {String(currentDay).padStart(2, "0")}</p>
                  </div>
                  <button type="button" onClick={() => setIsMeasurementModalOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211C19] text-[#F7F1ED]">×</button>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    ["weight", "WEIGHT", "lb"], ["waist", "WAIST", "in"], ["hips", "HIPS", "in"],
                    ["chest", "CHEST", "in"], ["thigh", "THIGH", "in"], ["arm", "ARM", "in"],
                  ].map(([field, label, unit]) => (
                    <label key={field} className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4">
                      <span className="text-[6px] tracking-[0.2em] text-[#806E68]">{label} ({unit})</span>
                      <input
                        type="number" min="0" step="0.1" inputMode="decimal"
                        value={measurementForm[field as keyof typeof measurementForm]}
                        onChange={(event) => setMeasurementForm((previous) => ({ ...previous, [field]: event.target.value }))}
                        className="mt-2 w-full bg-transparent font-serif text-2xl text-[#A77B73] outline-none"
                        placeholder="—"
                      />
                    </label>
                  ))}
                </div>

                {measurementError && <p className="mt-4 text-[9px] text-[#9D6F67]">{measurementError}</p>}
                <button type="button" onClick={saveMeasurements} disabled={isSavingMeasurements} className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[7px] tracking-[0.25em] text-[#F7F1ED] disabled:opacity-50">
                  {isSavingMeasurements ? "SAVING..." : "SAVE MEASUREMENTS"}
                </button>
              </div>
            </div>
          )}

          {/* MEASUREMENTS + WINS */}
          <section className="grid gap-5 border-t border-[#DED0CB] py-12 lg:grid-cols-2">
            {/* MEASUREMENTS */}
            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[7px] tracking-[0.35em] text-[#9D6F67]">
                    MEASUREMENTS
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Your numbers.
                  </h2>
                </div>

                <button type="button" onClick={openMeasurementModal} className="rounded-full border border-[#CBA9A2] px-4 py-2 text-[6px] tracking-[0.2em] text-[#8F655E]">
                  + UPDATE
                </button>
              </div>

              <div className="mt-7">
                {measurementDisplay.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-t border-[#E1D3CE] py-4"
                  >
                    <span className="text-[7px] tracking-[0.2em] text-[#806E68]">
                      {label}
                    </span>

                    <span className="font-serif text-xl text-[#A77B73]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[9px] italic text-[#9A8780]">
                Optional — track what matters to you. ♡
              </p>
            </div>

            {/* WINS */}
            <div className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
              <p className="text-[7px] tracking-[0.35em] text-[#8F655E]">
                LITTLE WINS
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                What&apos;s changing?
              </h2>

              <div className="mt-7 space-y-3">
                {wins.map((win) => (
                  <button
                    key={win}
                    type="button"
                    onClick={() => toggleWin(win)}
                    className={`flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] px-5 py-4 text-left transition hover:bg-[#F1E2DE] ${
                      completedWins[win] ? "bg-[#F1E2DE]" : "bg-[#F1E2DE]/50"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] text-[#9D6F67] ${
                      completedWins[win] ? "bg-[#211C19] text-[#F7F1ED]" : ""
                    }`}>
                      {completedWins[win] ? "✓" : "♡"}
                    </span>

                    <span className="font-serif text-lg italic">
                      {win}
                    </span>
                  </button>
                ))}
              </div>

              <button className="mt-5 text-[7px] tracking-[0.2em] text-[#8F655E]">
                + ADD YOUR OWN
              </button>
            </div>
          </section>

          {/* WEEKLY CHECK-INS */}
          <section className="border-t border-[#DED0CB] py-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="text-[7px] tracking-[0.4em] text-[#9D6F67]">WEEKLY CHECK-INS</p><h2 className="mt-3 font-serif text-4xl">Check in with <span className="italic text-[#A77B73]">yourself. ♡</span></h2></div>
              <p className="text-[7px] tracking-[0.18em] text-[#927D76]">{Object.keys(weeklyCheckins).length} OF 11 COMPLETE</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 11 }, (_, index) => index + 1).map((week) => {
                const unlockDay = (week - 1) * 7 + 1;
                const unlocked = currentDay >= unlockDay;
                const complete = Boolean(weeklyCheckins[week]);
                return unlocked ? (
                  <button key={week} type="button" onClick={() => openWeeklyCheckin(week)} className="group rounded-[1.5rem] border border-[#CBA9A2] bg-[#FBF8F6] p-5 text-left transition hover:bg-[#F3EAE6]">
                    <div className="flex items-center justify-between"><span className="font-serif text-2xl text-[#A77B73]">{String(week).padStart(2,"0")}</span><span className="rounded-full bg-[#EAD8D3] px-3 py-1.5 text-[6px] tracking-[0.18em] text-[#8F655E]">{complete ? "COMPLETE" : "READY"}</span></div>
                    <p className="mt-5 text-[7px] tracking-[0.22em]">WEEK {String(week).padStart(2,"0")}</p><p className="mt-1 font-serif text-xl italic text-[#A77B73]">{complete ? "checked in. ♡" : "how are we feeling?"}</p>
                    <div className="mt-5 border-t border-[#E1D3CE] pt-4"><span className="text-[6px] tracking-[0.2em] text-[#9D6F67]">DAY {String(unlockDay).padStart(2,"0")} →</span></div>
                  </button>
                ) : (
                  <div key={week} className="rounded-[1.5rem] border border-[#DED0CB] bg-[#F5EFEC] p-5 opacity-60"><div className="flex items-center justify-between"><span className="font-serif text-2xl text-[#BDA6A0]">{String(week).padStart(2,"0")}</span><span className="text-[10px] text-[#AA9690]">♡</span></div><p className="mt-5 text-[7px] tracking-[0.22em] text-[#806E68]">WEEK {String(week).padStart(2,"0")}</p><p className="mt-1 font-serif text-lg italic text-[#A7938D]">keep going.</p></div>
                );
              })}
            </div>
          </section>

          {checkinWeek !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/70 p-5 backdrop-blur-sm" onClick={() => setCheckinWeek(null)}>
              <div className="w-full max-w-xl rounded-[2rem] bg-[#F7F1ED] p-7 shadow-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between"><div><p className="text-[7px] tracking-[0.35em] text-[#9D6F67]">WEEK {String(checkinWeek).padStart(2,"0")} CHECK-IN</p><h2 className="mt-2 font-serif text-3xl">Check in with yourself. ♡</h2></div><button type="button" onClick={() => setCheckinWeek(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211C19] text-[#F7F1ED]">×</button></div>
                <div className="mt-7 space-y-3">{[["went_well","What went well?"],["felt_hard","What felt hard?"],["proud_of","What are you proud of?"],["next_week_focus","What do you want to focus on next week?"]].map(([field,label]) => <label key={field} className="block rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4"><span className="text-[7px] tracking-[0.16em] text-[#806E68]">{label}</span><textarea rows={2} value={checkinForm[field as keyof typeof checkinForm]} onChange={(event) => setCheckinForm((previous) => ({...previous,[field]:event.target.value}))} className="mt-2 w-full resize-none bg-transparent font-serif text-lg italic text-[#A77B73] outline-none" placeholder="write it here..." /></label>)}</div>
                {checkinError && <p className="mt-4 text-[9px] text-[#9D6F67]">{checkinError}</p>}
                <button type="button" onClick={saveWeeklyCheckin} disabled={isSavingCheckin} className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[7px] tracking-[0.25em] text-[#F7F1ED] disabled:opacity-50">{isSavingCheckin ? "SAVING..." : "SAVE CHECK-IN"}</button>
              </div>
            </div>
          )}

          {/* PROGRESS REMINDER */}
          <section className="rounded-[2rem] bg-[#211C19] px-8 py-10 text-center text-[#F7F1ED] md:px-12">
            <p className="text-[7px] tracking-[0.4em] text-[#DDB5AE]">
              REMEMBER
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-none md:text-5xl">
              Progress is more than
              <span className="block italic text-[#DDB5AE]">
                a photo.
              </span>
            </h2>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {[
                "STRONGER",
                "MORE CONSISTENT",
                "MORE ENERGY",
                "BETTER HABITS",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#51433F] px-4 py-2 text-[6px] tracking-[0.18em] text-[#C8B9B4]"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* END */}
          <section className="py-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              keep going. ♡
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-block rounded-full bg-[#211C19] px-9 py-3.5 text-[7px] tracking-[0.28em] text-[#F7F1ED] transition hover:-translate-y-0.5"
            >
              BACK TO TODAY
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}