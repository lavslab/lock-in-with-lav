"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import DashboardSidebar from "@/components/DashboardSidebar";

import {
  getChallengeEndDate,
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

  /* Duration selected during onboarding. */
  const [challengeLength, setChallengeLength] = useState(75);

  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [photoPaths, setPhotoPaths] = useState<Record<number, string>>({});
  const [editingPhotoDay, setEditingPhotoDay] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoTargetDay, setPhotoTargetDay] = useState(1);

  const [measurementRow, setMeasurementRow] = useState<{
    weight: number | null;
    waist: number | null;
    hips: number | null;
    chest: number | null;
    thigh: number | null;
    arm: number | null;
    challenge_day: number | null;
  } | null>(null);

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  const [measurementForm, setMeasurementForm] = useState({
    weight: "",
    waist: "",
    hips: "",
    chest: "",
    thigh: "",
    arm: "",
  });

  const [completedWins, setCompletedWins] = useState<Record<string, boolean>>(
    {}
  );

  const [isCustomWinModalOpen, setIsCustomWinModalOpen] = useState(false);
  const [customWin, setCustomWin] = useState("");
  const [isSavingCustomWin, setIsSavingCustomWin] = useState(false);
  const [customWinError, setCustomWinError] = useState<string | null>(null);

  const [weeklyCheckins, setWeeklyCheckins] = useState<
    Record<
      number,
      {
        went_well: string;
        felt_hard: string;
        proud_of: string;
        next_week_focus: string;
      }
    >
  >({});

  const [checkinWeek, setCheckinWeek] = useState<number | null>(null);
  const [checkinForm, setCheckinForm] = useState({
    went_well: "",
    felt_hard: "",
    proud_of: "",
    next_week_focus: "",
  });

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

      const { data: storedPhotos, error: photosLoadError } = await supabase
        .from("progress_photos")
        .select("challenge_day, storage_path")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (photosLoadError) {
        console.error(
          "Could not load progress photo records:",
          photosLoadError
        );
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
          Array.from(latestPhotoByDay.entries()).map(
            async ([photoDay, path]) => {
              const { data: signedData, error: signedError } =
                await supabase.storage
                  .from("progress-photos")
                  .createSignedUrl(path, 60 * 60);

              if (!signedError && signedData?.signedUrl) {
                loadedUrls[photoDay] = signedData.signedUrl;
                loadedPaths[photoDay] = path;
              }
            }
          )
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
        .select("challenge_start_date, challenge_length")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Could not load profile:", error);
      } else if (profile) {
        setChallengeStartDate(profile.challenge_start_date);
        setChallengeLength(profile.challenge_length ?? 75);
      }

      const { data: savedWins, error: winsLoadError } = await supabase
        .from("little_wins")
        .select("win_key, label, is_completed")
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
        .select(
          "week_number, went_well, felt_hard, proud_of, next_week_focus"
        )
        .eq("user_id", user.id);

      if (checkinsLoadError) {
        console.error("Could not load weekly check-ins:", checkinsLoadError);
      } else {
        const loadedCheckins: Record<
          number,
          {
            went_well: string;
            felt_hard: string;
            proud_of: string;
            next_week_focus: string;
          }
        > = {};

        for (const row of savedCheckins ?? []) {
          loadedCheckins[row.week_number] = row;
        }

        setWeeklyCheckins(loadedCheckins);
      }

      const { data: latestMeasurement, error: measurementLoadError } =
        await supabase
          .from("measurements")
          .select(
            "weight, waist, hips, chest, thigh, arm, challenge_day"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (measurementLoadError) {
        console.error(
          "Could not load measurements:",
          measurementLoadError
        );
      } else if (latestMeasurement) {
        setMeasurementRow(latestMeasurement);
      }

      setIsLoadingUser(false);
    };

    getUserAndProfile();
  }, []);

  const today = new Date();

  let currentDay = 1;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);

    endDate = getChallengeEndDate(
      challengeStartDate,
      challengeLength
    );

    currentDay = getCurrentChallengeDay(
      challengeStartDate,
      challengeLength,
      today
    );
  }

  const safeCurrentDay = Math.max(
    1,
    Math.min(challengeLength, currentDay)
  );

  const dayNumber = String(safeCurrentDay).padStart(2, "0");

  const startLabel = startDate ? formatShortDate(startDate) : "—";
  const endLabel = endDate ? formatShortDate(endDate) : "—";

  /*
   * A Lock In can end partway through a seven-day week.
   *
   * Examples:
   * 21 days = 3 check-ins
   * 30 days = 5 check-ins
   * 60 days = 9 check-ins
   * 75 days = 11 check-ins
   *
   * The final partial-week reflection unlocks on the final
   * challenge day instead of requiring the member to wait
   * until a day beyond their Lock In.
   */

  const totalCheckins = Math.ceil(challengeLength / 7);

  const currentWeek = Math.min(
    totalCheckins,
    Math.max(1, Math.ceil(safeCurrentDay / 7))
  );

  const currentWeekUnlockDay = Math.min(
    currentWeek * 7,
    challengeLength
  );

  const currentWeekUnlocked =
    safeCurrentDay >= currentWeekUnlockDay;

  const currentWeekComplete = Boolean(
    weeklyCheckins[currentWeek]
  );

  const completedCheckins = Object.keys(weeklyCheckins).filter(
    (week) => Number(week) <= totalCheckins
  ).length;

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const customWins = Object.keys(completedWins)
    .filter((key) => key.startsWith("custom:"))
    .map((key) => ({
      key,
      label: key
        .replace(/^custom:/, "")
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));

  const measurementDisplay = [
    [
      "WEIGHT",
      measurementRow?.weight != null ? `${measurementRow.weight} lb` : "—",
    ],
    [
      "WAIST",
      measurementRow?.waist != null ? `${measurementRow.waist} in` : "—",
    ],
    [
      "HIPS",
      measurementRow?.hips != null ? `${measurementRow.hips} in` : "—",
    ],
    [
      "CHEST",
      measurementRow?.chest != null ? `${measurementRow.chest} in` : "—",
    ],
    [
      "THIGH",
      measurementRow?.thigh != null ? `${measurementRow.thigh} in` : "—",
    ],
    [
      "ARM",
      measurementRow?.arm != null ? `${measurementRow.arm} in` : "—",
    ],
  ];

  const openPhotoPicker = (day: number) => {
    setPhotoTargetDay(day);
    setPhotoError(null);
    photoInputRef.current?.click();
  };

  /*
   * Normalize large phone-camera photos before uploading.
   *
   * Gallery uploads continue to use the exact same handler.
   * Camera photos are resized to a maximum dimension of 2000px
   * and converted to JPEG when the browser can decode them.
   */
  const prepareProgressPhoto = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }

    const maxDimension = 2000;

    try {
      const objectUrl = URL.createObjectURL(file);

      try {
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(
              new Error(
                "Could not read this photo on your device."
              )
            );
          image.src = objectUrl;
        });

        const largestDimension = Math.max(
          image.naturalWidth,
          image.naturalHeight
        );

        const scale = Math.min(
          1,
          maxDimension / largestDimension
        );

        const width = Math.max(
          1,
          Math.round(image.naturalWidth * scale)
        );

        const height = Math.max(
          1,
          Math.round(image.naturalHeight * scale)
        );

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Could not prepare the photo for upload."
          );
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const blob = await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/jpeg",
              0.86
            );
          }
        );

        if (!blob) {
          throw new Error(
            "Could not prepare the photo for upload."
          );
        }

        return new File(
          [blob],
          `progress-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      /*
       * Some devices may provide a format the browser cannot
       * decode directly, such as HEIC. In that situation,
       * upload the original file rather than crashing the page.
       */
      console.warn(
        "Could not normalize progress photo; uploading the original file.",
        error
      );

      return file;
    }
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
        throw new Error(
          "You need to be signed in to upload a progress photo."
        );
      }

      const preparedFile =
        await prepareProgressPhoto(file);

      const extension =
        preparedFile.type === "image/jpeg"
          ? "jpg"
          : preparedFile.name
              .split(".")
              .pop()
              ?.toLowerCase() || "jpg";

      const contentType =
        preparedFile.type ||
        file.type ||
        "image/jpeg";

      const day = String(photoTargetDay).padStart(
        2,
        "0"
      );

      const filePath =
        `${user.id}/day-${day}-${Date.now()}.${extension}`;

      const oldPath =
        photoPaths[photoTargetDay];

      if (oldPath) {
        const { error: removeOldError } =
          await supabase.storage
            .from("progress-photos")
            .remove([oldPath]);

        if (removeOldError) {
          throw removeOldError;
        }
      }

      const { error: uploadError } =
        await supabase.storage
          .from("progress-photos")
          .upload(
            filePath,
            preparedFile,
            {
              cacheControl: "3600",
              contentType,
              upsert: false,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: signedData,
        error: signedError,
      } =
        await supabase.storage
          .from("progress-photos")
          .createSignedUrl(
            filePath,
            60 * 60
          );

      if (
        signedError ||
        !signedData?.signedUrl
      ) {
        throw (
          signedError ??
          new Error(
            "Could not create the photo preview."
          )
        );
      }

      const { error: photoRecordError } =
        await supabase
          .from("progress_photos")
          .upsert(
            {
              user_id: user.id,
              challenge_day: photoTargetDay,
              storage_path: filePath,
              photo_type: "progress",
              caption: null,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id,challenge_day,photo_type",
            }
          );

      if (photoRecordError) {
        await supabase.storage
          .from("progress-photos")
          .remove([filePath]);

        throw photoRecordError;
      }

      setPhotoUrls((previous) => ({
        ...previous,
        [photoTargetDay]:
          signedData.signedUrl,
      }));

      setPhotoPaths((previous) => ({
        ...previous,
        [photoTargetDay]: filePath,
      }));

      setEditingPhotoDay(null);
    } catch (error) {
      console.error(
        "Could not upload progress photo:",
        error
      );

      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not upload photo. Please try again."
      );
    } finally {
      setIsUploadingPhoto(false);

      event.target.value = "";
    }
  };

  const removeProgressPhoto = async (
    day: number
  ) => {
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setPhotoError(
        "Could not verify your account while removing the photo."
      );
      return;
    }

    const { error: recordDeleteError } =
      await supabase
        .from("progress_photos")
        .delete()
        .eq("user_id", user.id)
        .eq("challenge_day", day)
        .eq("photo_type", "progress");

    if (recordDeleteError) {
      console.error(
        "Could not remove progress photo record:",
        recordDeleteError
      );

      setPhotoError(
        recordDeleteError.message
      );

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

  const openMeasurementModal = () => {
    setMeasurementError(null);

    setMeasurementForm({
      weight:
        measurementRow?.weight?.toString() ?? "",
      waist:
        measurementRow?.waist?.toString() ?? "",
      hips:
        measurementRow?.hips?.toString() ?? "",
      chest:
        measurementRow?.chest?.toString() ?? "",
      thigh:
        measurementRow?.thigh?.toString() ?? "",
      arm:
        measurementRow?.arm?.toString() ?? "",
    });

    setIsMeasurementModalOpen(true);
  };

  const saveMeasurements = async () => {
    setIsSavingMeasurements(true);
    setMeasurementError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You need to be signed in to save measurements."
        );
      }

      const toNumber = (value: string) =>
        value.trim() === ""
          ? null
          : Number(value);

      const payload = {
        user_id: user.id,
        challenge_day: safeCurrentDay,
        weight: toNumber(
          measurementForm.weight
        ),
        waist: toNumber(
          measurementForm.waist
        ),
        hips: toNumber(
          measurementForm.hips
        ),
        chest: toNumber(
          measurementForm.chest
        ),
        thigh: toNumber(
          measurementForm.thigh
        ),
        arm: toNumber(
          measurementForm.arm
        ),
      };

      const values = [
        payload.weight,
        payload.waist,
        payload.hips,
        payload.chest,
        payload.thigh,
        payload.arm,
      ];

      if (
        values.some(
          (value) =>
            value !== null &&
            (!Number.isFinite(value) ||
              value < 0)
        )
      ) {
        throw new Error(
          "Please enter valid positive numbers."
        );
      }

      const { data, error } =
        await supabase
          .from("measurements")
          .insert(payload)
          .select(
            "weight, waist, hips, chest, thigh, arm, challenge_day"
          )
          .single();

      if (error) throw error;

      setMeasurementRow(data);
      setIsMeasurementModalOpen(false);
    } catch (error) {
      console.error(
        "Could not save measurements:",
        error
      );

      setMeasurementError(
        error instanceof Error
          ? error.message
          : "Could not save measurements. Please try again."
      );
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const toggleWin = async (
    win: string
  ) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    const isCompleted =
      !completedWins[win];

    setCompletedWins((previous) => ({
      ...previous,
      [win]: isCompleted,
    }));

    const { error } =
      await supabase
        .from("little_wins")
        .upsert(
          {
            user_id: user.id,
            win_key: win,
            label: win,
            is_completed: isCompleted,
            challenge_day: safeCurrentDay,
            completed_at: isCompleted
              ? new Date().toISOString()
              : null,
          },
          {
            onConflict:
              "user_id,win_key,challenge_day",
          }
        );

    if (error) {
      console.error(
        "Could not save little win:",
        error
      );

      setCompletedWins(
        (previous) => ({
          ...previous,
          [win]: !isCompleted,
        })
      );
    }
  };

  const saveCustomWin = async () => {
    const label = customWin.trim();

    if (!label) {
      setCustomWinError(
        "Write your win first. ♡"
      );

      return;
    }

    setIsSavingCustomWin(true);
    setCustomWinError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You need to be signed in to add a win."
        );
      }

      const winKey =
        `custom:${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`;

      const { error } =
        await supabase
          .from("little_wins")
          .upsert(
            {
              user_id: user.id,
              win_key: winKey,
              label,
              is_completed: true,
              challenge_day:
                safeCurrentDay,
              completed_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id,win_key,challenge_day",
            }
          );

      if (error) throw error;

      setCompletedWins(
        (previous) => ({
          ...previous,
          [winKey]: true,
        })
      );

      setCustomWin("");
      setIsCustomWinModalOpen(false);
    } catch (error) {
      console.error(
        "Could not save custom win:",
        error
      );

      setCustomWinError(
        error instanceof Error
          ? error.message
          : "Could not save your win. Please try again."
      );
    } finally {
      setIsSavingCustomWin(false);
    }
  };

  const openWeeklyCheckin = (
    week: number
  ) => {
    const saved =
      weeklyCheckins[week];

    setCheckinError(null);

    setCheckinForm(
      saved ?? {
        went_well: "",
        felt_hard: "",
        proud_of: "",
        next_week_focus: "",
      }
    );

    setCheckinWeek(week);
  };

  const saveWeeklyCheckin =
    async () => {
      if (checkinWeek === null) return;

      setIsSavingCheckin(true);
      setCheckinError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "You need to be signed in to save a check-in."
          );
        }

        const payload = {
          user_id: user.id,
          week_number: checkinWeek,
          ...checkinForm,
          updated_at:
            new Date().toISOString(),
        };

        const { data, error } =
          await supabase
            .from("weekly_checkins")
            .upsert(payload, {
              onConflict:
                "user_id,week_number",
            })
            .select(
              "week_number, went_well, felt_hard, proud_of, next_week_focus"
            )
            .single();

        if (error) throw error;

        setWeeklyCheckins(
          (previous) => ({
            ...previous,
            [checkinWeek]: data,
          })
        );

        setCheckinWeek(null);
      } catch (error) {
        console.error(
          "Could not save weekly check-in:",
          error
        );

        setCheckinError(
          error instanceof Error
            ? error.message
            : "Could not save check-in. Please try again."
        );
      } finally {
        setIsSavingCheckin(false);
      }
    };

  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={
              isLoadingUser
            }
          />

          <section className="flex flex-1 items-center justify-center px-6 py-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#DDB5AE] bg-[#FBF8F6] font-serif text-2xl text-[#A77B73]">
                ♡
              </div>

              <p className="mt-6 text-[10px] tracking-[0.35em] text-[#9D6F67]">
                LOCKING IN
              </p>

              <p className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                loading your progress... ♡
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={
            isLoadingUser
          }
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* INTRO + PROGRESS PHOTOS */}

          <section className="pb-10">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
                  look how far you&apos;ve come. ♡
                </p>

                <p className="mt-10 text-[12px] tracking-[0.4em] text-[#9D6F67]">
                  PROGRESS PHOTOS
                </p>

                <h1 className="mt-3 font-serif text-4xl md:text-5xl">
                  See the{" "}
                  <span className="italic text-[#A77B73]">
                    difference.
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-2 pb-1 text-[12px] tracking-[0.18em] text-[#9D6F67]">
                <span>♡</span>
                <span>PRIVATE TO YOU</span>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* DAY 01 */}

              <div className="group overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#EEE3DF]">
                  {photoUrls[1] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={photoUrls[1]}
                        alt="Day 1 progress"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setEditingPhotoDay(
                            editingPhotoDay === 1
                              ? null
                              : 1
                          )
                        }
                        className="absolute right-4 top-4 z-10 rounded-full bg-[#211C19]/90 px-4 py-2 text-[10px] tracking-[0.2em] text-[#F7F1ED]"
                      >
                        EDIT PHOTO
                      </button>

                      {editingPhotoDay === 1 && (
                        <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#D7C4BE] bg-[#F7F1ED] shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              openPhotoPicker(1)
                            }
                            className="block w-full px-4 py-3 text-left text-[12px] tracking-[0.15em] hover:bg-[#EADCD7]"
                          >
                            REPLACE PHOTO
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeProgressPhoto(
                                1
                              )
                            }
                            className="block w-full border-t border-[#D7C4BE] px-4 py-3 text-left text-[12px] tracking-[0.15em] text-[#9D6F67] hover:bg-[#EADCD7]"
                          >
                            REMOVE PHOTO
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoPicker(1)
                      }
                      disabled={
                        isUploadingPhoto
                      }
                      className="flex flex-col items-center disabled:opacity-50"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-2xl text-[#A77B73] transition group-hover:bg-[#EAD8D3]">
                        +
                      </span>

                      <span className="mt-3 text-[12px] tracking-[0.2em] text-[#8F655E]">
                        {isUploadingPhoto &&
                        photoTargetDay === 1
                          ? "UPLOADING..."
                          : "ADD PHOTO"}
                      </span>
                    </button>
                  )}
                </div>

                {photoError &&
                  photoTargetDay === 1 && (
                    <p className="px-5 pt-3 text-[12px] text-[#9D6F67]">
                      {photoError}
                    </p>
                  )}

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[12px] tracking-[0.25em]">
                      DAY 01
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the beginning.
                    </p>
                  </div>

                  <span className="text-[12px] text-[#927D76]">
                    {startLabel}
                  </span>
                </div>
              </div>

              {/* CURRENT / NEXT PHOTO */}

              <div
                className={`group overflow-hidden rounded-[1.75rem] border bg-[#FBF8F6] ${
                  safeCurrentDay > 1
                    ? "border-[#CBA9A2]"
                    : "border-[#DED0CB]"
                }`}
              >
                <div
                  className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden ${
                    safeCurrentDay > 1
                      ? "bg-[#EAD8D3]"
                      : "bg-[#F1EAE7]"
                  }`}
                >
                  {safeCurrentDay > 1 ? (
                    <>
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-[#211C19] px-4 py-2 text-[10px] tracking-[0.2em] text-[#F7F1ED]">
                        CURRENT
                      </span>

                      {photoUrls[
                        safeCurrentDay
                      ] ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img
                            src={
                              photoUrls[
                                safeCurrentDay
                              ]
                            }
                            alt={`Day ${safeCurrentDay} progress`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setEditingPhotoDay(
                                editingPhotoDay ===
                                  safeCurrentDay
                                  ? null
                                  : safeCurrentDay
                              )
                            }
                            className="absolute right-4 top-4 z-10 rounded-full bg-[#211C19]/90 px-4 py-2 text-[10px] tracking-[0.2em] text-[#F7F1ED]"
                          >
                            EDIT PHOTO
                          </button>

                          {editingPhotoDay ===
                            safeCurrentDay && (
                            <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#D7C4BE] bg-[#F7F1ED] shadow-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  openPhotoPicker(
                                    safeCurrentDay
                                  )
                                }
                                className="block w-full px-4 py-3 text-left text-[12px] tracking-[0.15em] hover:bg-[#EADCD7]"
                              >
                                REPLACE PHOTO
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeProgressPhoto(
                                    safeCurrentDay
                                  )
                                }
                                className="block w-full border-t border-[#D7C4BE] px-4 py-3 text-left text-[12px] tracking-[0.15em] text-[#9D6F67] hover:bg-[#EADCD7]"
                              >
                                REMOVE PHOTO
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openPhotoPicker(
                              safeCurrentDay
                            )
                          }
                          disabled={
                            isUploadingPhoto
                          }
                          className="flex flex-col items-center disabled:opacity-50"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B48A82] font-serif text-2xl text-[#9D6F67] transition group-hover:bg-[#DFC7C1]">
                            +
                          </span>

                          <span className="mt-3 text-[12px] tracking-[0.2em] text-[#8F655E]">
                            {isUploadingPhoto &&
                            photoTargetDay ===
                              safeCurrentDay
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

                      <p className="mt-3 text-[12px] tracking-[0.2em] text-[#A7938D]">
                        KEEP SHOWING UP
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[12px] tracking-[0.25em]">
                      {safeCurrentDay ===
                      1
                        ? "YOUR NEXT PHOTO"
                        : `DAY ${dayNumber}`}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      {safeCurrentDay ===
                      1
                        ? "currently."
                        : "right now."}
                    </p>
                  </div>

                  <span className="text-[12px] text-[#927D76]">
                    {safeCurrentDay ===
                    1
                      ? "LOCKED"
                      : "TODAY"}
                  </span>
                </div>
              </div>

              {/* FINAL DAY */}

              <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#F1EAE7]">
                  {safeCurrentDay >=
                  challengeLength ? (
                    <>
                      {photoUrls[
                        challengeLength
                      ] ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img
                            src={
                              photoUrls[
                                challengeLength
                              ]
                            }
                            alt={`Day ${challengeLength} progress`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setEditingPhotoDay(
                                editingPhotoDay ===
                                  challengeLength
                                  ? null
                                  : challengeLength
                              )
                            }
                            className="absolute right-4 top-4 z-10 rounded-full bg-[#211C19]/90 px-4 py-2 text-[10px] tracking-[0.2em] text-[#F7F1ED]"
                          >
                            EDIT PHOTO
                          </button>

                          {editingPhotoDay ===
                            challengeLength && (
                            <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#D7C4BE] bg-[#F7F1ED] shadow-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  openPhotoPicker(
                                    challengeLength
                                  )
                                }
                                className="block w-full px-4 py-3 text-left text-[12px] tracking-[0.15em] hover:bg-[#EADCD7]"
                              >
                                REPLACE PHOTO
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeProgressPhoto(
                                    challengeLength
                                  )
                                }
                                className="block w-full border-t border-[#D7C4BE] px-4 py-3 text-left text-[12px] tracking-[0.15em] text-[#9D6F67] hover:bg-[#EADCD7]"
                              >
                                REMOVE PHOTO
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openPhotoPicker(
                              challengeLength
                            )
                          }
                          disabled={
                            isUploadingPhoto
                          }
                          className="flex flex-col items-center disabled:opacity-50"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-2xl text-[#A77B73] transition hover:bg-[#EAD8D3]">
                            +
                          </span>

                          <span className="mt-3 text-[12px] tracking-[0.2em] text-[#8F655E]">
                            {isUploadingPhoto &&
                            photoTargetDay ===
                              challengeLength
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

                      <p className="mt-3 text-[12px] tracking-[0.2em] text-[#A7938D]">
                        SEE YOU ON DAY{" "}
                        {challengeLength}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[12px] tracking-[0.25em]">
                      DAY{" "}
                      {String(
                        challengeLength
                      ).padStart(2, "0")}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      the finish.
                    </p>
                  </div>

                  <span className="text-[12px] text-[#927D76]">
                    {endLabel}
                  </span>
                </div>
              </div>
            </div>

            {photoError &&
              photoTargetDay !== 1 && (
                <p className="mt-4 text-[12px] text-[#9D6F67]">
                  {photoError}
                </p>
              )}
          </section>

          {/* MEASUREMENTS + LITTLE WINS */}

          <section className="grid gap-5 border-t border-[#DED0CB] py-10 lg:grid-cols-2">
            {/* MEASUREMENTS */}

            <div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                    MEASUREMENTS
                  </p>

                  <h2 className="mt-3 font-serif text-3xl">
                    Your numbers.
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    openMeasurementModal
                  }
                  className="rounded-full border border-[#CBA9A2] px-4 py-2 text-[10px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                >
                  + UPDATE
                </button>
              </div>

              <div className="mt-7">
                {measurementDisplay.map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-t border-[#E1D3CE] py-4"
                    >
                      <span className="text-[12px] tracking-[0.2em] text-[#806E68]">
                        {label}
                      </span>

                      <span className="font-serif text-xl text-[#A77B73]">
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>

              <p className="mt-2 text-[12px] italic text-[#9A8780]">
                Optional — track what matters to you. ♡
              </p>
            </div>

            {/* LITTLE WINS */}

            <div className="rounded-[2rem] bg-[#EAD8D3] p-7 md:p-8">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#8F655E]">
                  LITTLE WINS
                </p>

                <h2 className="mt-3 font-serif text-3xl">
                  What&apos;s changing?
                </h2>

                <p className="mt-2 font-serif text-base italic text-[#A77B73]">
                  the little things count too. ♡
                </p>
              </div>

              <div className="mt-7 space-y-3">
                {wins.map((win) => (
                  <button
                    key={win}
                    type="button"
                    onClick={() =>
                      toggleWin(win)
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] px-5 py-4 text-left transition hover:bg-[#F1E2DE] ${
                      completedWins[win]
                        ? "bg-[#F1E2DE]"
                        : "bg-[#F1E2DE]/50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] text-[#9D6F67] ${
                        completedWins[win]
                          ? "bg-[#211C19] text-[#F7F1ED]"
                          : ""
                      }`}
                    >
                      {completedWins[win]
                        ? "✓"
                        : "♡"}
                    </span>

                    <span className="font-serif text-lg italic">
                      {win}
                    </span>
                  </button>
                ))}
              </div>

              {customWins.length > 0 && (
                <div className="mt-3 space-y-3">
                  {customWins.map(
                    ({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          toggleWin(key)
                        }
                        className={`flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] px-5 py-4 text-left transition hover:bg-[#F1E2DE] ${
                          completedWins[key]
                            ? "bg-[#F1E2DE]"
                            : "bg-[#F1E2DE]/50"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] text-[#9D6F67] ${
                            completedWins[key]
                              ? "bg-[#211C19] text-[#F7F1ED]"
                              : ""
                          }`}
                        >
                          {completedWins[key]
                            ? "✓"
                            : "♡"}
                        </span>

                        <span className="font-serif text-lg italic">
                          {label}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCustomWin("");
                  setCustomWinError(null);
                  setIsCustomWinModalOpen(
                    true
                  );
                }}
                className="mt-6 rounded-full border border-[#B9948C] px-5 py-3 text-[11px] tracking-[0.2em] text-[#8F655E] transition hover:bg-[#F1E2DE]"
              >
                + ADD A LITTLE WIN
              </button>
            </div>
          </section>

          {/* WEEKLY CHECK-IN */}

          <section className="border-t border-[#DED0CB] py-10">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[12px] tracking-[0.4em] text-[#9D6F67]">
                  WEEKLY CHECK-IN
                </p>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                  Check in with{" "}
                  <span className="italic text-[#A77B73]">
                    yourself. ♡
                  </span>
                </h2>
              </div>

              <p className="text-[11px] tracking-[0.18em] text-[#927D76]">
                {completedCheckins} OF{" "}
                {totalCheckins} COMPLETE
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6]">
              <div className="flex flex-col gap-7 p-7 md:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAD8D3] font-serif text-xl text-[#A77B73]">
                    {String(
                      currentWeek
                    ).padStart(2, "0")}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[12px] tracking-[0.25em] text-[#806E68]">
                        WEEK{" "}
                        {String(
                          currentWeek
                        ).padStart(2, "0")}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] tracking-[0.18em] ${
                          currentWeekComplete
                            ? "bg-[#211C19] text-[#F7F1ED]"
                            : currentWeekUnlocked
                              ? "bg-[#EAD8D3] text-[#8F655E]"
                              : "bg-[#EEE6E2] text-[#9A8780]"
                        }`}
                      >
                        {currentWeekComplete
                          ? "COMPLETE"
                          : currentWeekUnlocked
                            ? "READY"
                            : "LOCKED"}
                      </span>
                    </div>

                    <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                      {currentWeekComplete
                        ? "you checked in. ♡"
                        : currentWeekUnlocked
                          ? "how are you feeling?"
                          : `opens on day ${String(
                              currentWeekUnlockDay
                            ).padStart(
                              2,
                              "0"
                            )}.`}
                    </p>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#806E68]">
                      {currentWeekComplete
                        ? "Come back anytime to read or update this week's reflection."
                        : currentWeekUnlocked
                          ? "Take a minute to notice what went well, what felt hard, and what you want to carry into the next week."
                          : "Keep showing up. Your weekly reflection will be waiting for you at the end of the week."}
                    </p>
                  </div>
                </div>

                {currentWeekUnlocked ? (
                  <button
                    type="button"
                    onClick={() =>
                      openWeeklyCheckin(
                        currentWeek
                      )
                    }
                    className="shrink-0 rounded-full bg-[#211C19] px-7 py-3.5 text-[11px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5"
                  >
                    {currentWeekComplete
                      ? "VIEW CHECK-IN"
                      : "CHECK IN →"}
                  </button>
                ) : (
                  <div className="shrink-0 rounded-full border border-[#D8C7C1] px-6 py-3 text-[10px] tracking-[0.2em] text-[#A7938D]">
                    DAY{" "}
                    {String(
                      currentWeekUnlockDay
                    ).padStart(2, "0")}
                  </div>
                )}
              </div>

              <div className="border-t border-[#E1D3CE] bg-[#F3EBE7] px-7 py-4 md:px-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] tracking-[0.2em] text-[#927D76]">
                    {currentWeekComplete
                      ? "REFLECTION SAVED"
                      : currentWeekUnlocked
                        ? "YOUR REFLECTION IS READY"
                        : `${Math.max(
                            0,
                            currentWeekUnlockDay -
                              safeCurrentDay
                          )} ${
                            currentWeekUnlockDay -
                              safeCurrentDay ===
                            1
                              ? "DAY"
                              : "DAYS"
                          } UNTIL CHECK-IN`}
                  </span>

                  <span className="font-serif italic text-[#A77B73]">
                    one week at a time. ♡
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-12 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">
              keep going. ♡
            </p>
          </section>
        </section>
      </div>

      {/* MEASUREMENTS MODAL */}

      {isMeasurementModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/70 p-5 backdrop-blur-sm"
          onClick={() =>
            setIsMeasurementModalOpen(
              false
            )
          }
        >
          <div
            className="w-full max-w-xl rounded-[2rem] bg-[#F7F1ED] p-7 shadow-2xl md:p-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                  MEASUREMENTS
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Update your numbers. ♡
                </h2>

                <p className="mt-2 text-[12px] tracking-[0.15em] text-[#927D76]">
                  DAY {dayNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsMeasurementModalOpen(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211C19] text-[#F7F1ED]"
              >
                ×
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                ["weight", "WEIGHT", "lb"],
                ["waist", "WAIST", "in"],
                ["hips", "HIPS", "in"],
                ["chest", "CHEST", "in"],
                ["thigh", "THIGH", "in"],
                ["arm", "ARM", "in"],
              ].map(
                ([field, label, unit]) => (
                  <label
                    key={field}
                    className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4"
                  >
                    <span className="text-[10px] tracking-[0.2em] text-[#806E68]">
                      {label} ({unit})
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      inputMode="decimal"
                      value={
                        measurementForm[
                          field as keyof typeof measurementForm
                        ]
                      }
                      onChange={(event) =>
                        setMeasurementForm(
                          (previous) => ({
                            ...previous,
                            [field]:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 w-full bg-transparent font-serif text-2xl text-[#A77B73] outline-none"
                      placeholder="—"
                    />
                  </label>
                )
              )}
            </div>

            {measurementError && (
              <p className="mt-4 text-[12px] text-[#9D6F67]">
                {measurementError}
              </p>
            )}

            <button
              type="button"
              onClick={
                saveMeasurements
              }
              disabled={
                isSavingMeasurements
              }
              className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[12px] tracking-[0.25em] text-[#F7F1ED] disabled:opacity-50"
            >
              {isSavingMeasurements
                ? "SAVING..."
                : "SAVE MEASUREMENTS"}
            </button>
          </div>
        </div>
      )}

      {/* LITTLE WIN MODAL */}

      {isCustomWinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/70 p-5 backdrop-blur-sm"
          onClick={() =>
            setIsCustomWinModalOpen(
              false
            )
          }
        >
          <div
            className="w-full max-w-lg rounded-[2rem] bg-[#F7F1ED] p-7 shadow-2xl md:p-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                  LITTLE WINS
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Add your own. ♡
                </h2>

                <p className="mt-2 font-serif text-base italic text-[#A77B73]">
                  What are you noticing about yourself?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCustomWinModalOpen(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211C19] text-[#F7F1ED]"
              >
                ×
              </button>
            </div>

            <label className="mt-7 block rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4">
              <span className="text-[12px] tracking-[0.18em] text-[#806E68]">
                MY WIN
              </span>

              <input
                type="text"
                value={customWin}
                onChange={(event) => {
                  setCustomWin(
                    event.target.value
                  );
                  setCustomWinError(null);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !isSavingCustomWin
                  ) {
                    saveCustomWin();
                  }
                }}
                autoFocus
                maxLength={80}
                className="mt-3 w-full bg-transparent font-serif text-xl italic text-[#A77B73] outline-none"
                placeholder="I..."
              />
            </label>

            {customWinError && (
              <p className="mt-4 text-[12px] text-[#9D6F67]">
                {customWinError}
              </p>
            )}

            <button
              type="button"
              onClick={
                saveCustomWin
              }
              disabled={
                isSavingCustomWin ||
                !customWin.trim()
              }
              className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[12px] tracking-[0.25em] text-[#F7F1ED] disabled:opacity-50"
            >
              {isSavingCustomWin
                ? "SAVING..."
                : "SAVE MY WIN"}
            </button>
          </div>
        </div>
      )}

      {/* WEEKLY CHECK-IN MODAL */}

      {checkinWeek !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/70 p-5 backdrop-blur-sm"
          onClick={() =>
            setCheckinWeek(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-[#F7F1ED] p-7 shadow-2xl md:p-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] tracking-[0.35em] text-[#9D6F67]">
                  WEEK{" "}
                  {String(
                    checkinWeek
                  ).padStart(
                    2,
                    "0"
                  )}{" "}
                  CHECK-IN
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Check in with yourself. ♡
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCheckinWeek(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#211C19] text-[#F7F1ED]"
              >
                ×
              </button>
            </div>

            <div className="mt-7 space-y-3">
              {[
                [
                  "went_well",
                  "What went well?",
                ],
                [
                  "felt_hard",
                  "What felt hard?",
                ],
                [
                  "proud_of",
                  "What are you proud of?",
                ],
                [
                  "next_week_focus",
                  "What do you want to focus on next week?",
                ],
              ].map(
                ([field, label]) => (
                  <label
                    key={field}
                    className="block rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4"
                  >
                    <span className="text-[12px] tracking-[0.16em] text-[#806E68]">
                      {label}
                    </span>

                    <textarea
                      rows={2}
                      value={
                        checkinForm[
                          field as keyof typeof checkinForm
                        ]
                      }
                      onChange={(event) =>
                        setCheckinForm(
                          (previous) => ({
                            ...previous,
                            [field]:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 w-full resize-none bg-transparent font-serif text-lg italic text-[#A77B73] outline-none"
                      placeholder="write it here..."
                    />
                  </label>
                )
              )}
            </div>

            {checkinError && (
              <p className="mt-4 text-[12px] text-[#9D6F67]">
                {checkinError}
              </p>
            )}

            <button
              type="button"
              onClick={
                saveWeeklyCheckin
              }
              disabled={
                isSavingCheckin
              }
              className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[12px] tracking-[0.25em] text-[#F7F1ED] disabled:opacity-50"
            >
              {isSavingCheckin
                ? "SAVING..."
                : "SAVE CHECK-IN"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}