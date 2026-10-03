"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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

const PHOTO_OPERATION_TIMEOUT = 30000;

type MeasurementRow = {
  weight: number | null;
  waist: number | null;
  hips: number | null;
  chest: number | null;
  thigh: number | null;
  arm: number | null;
  challenge_day: number | null;
};

type CheckinRow = {
  week_number: number;
  went_well: string;
  felt_hard: string;
  proud_of: string;
  next_week_focus: string;
};

function withTimeout<T>(
  promise: PromiseLike<T>,
  message: string
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(message));
      }, PHOTO_OPERATION_TIMEOUT);
    }),
  ]);
}

function formatShortDate(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
}

export default function ProgressPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(
    null
  );

  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [photoPaths, setPhotoPaths] = useState<Record<number, string>>({});

  const [editingPhotoDay, setEditingPhotoDay] = useState<number | null>(null);
  const [photoTargetDay, setPhotoTargetDay] = useState<number>(1);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const webPhotoInputRef = useRef<HTMLInputElement>(null);

  const [measurementRow, setMeasurementRow] =
    useState<MeasurementRow | null>(null);

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
    Record<number, CheckinRow>
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
    const loadProgress = async () => {
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Could not load profile:", profileError);
      } else if (profile) {
        setChallengeStartDate(profile.challenge_start_date);
      }

      const { data: storedPhotos, error: photosError } = await supabase
        .from("progress_photos")
        .select("challenge_day, storage_path, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (photosError) {
        console.error("Could not load progress photos:", photosError);
      } else {
        const latestPhotoByDay = new Map<number, string>();

        for (const photo of storedPhotos ?? []) {
          if (!latestPhotoByDay.has(photo.challenge_day)) {
            latestPhotoByDay.set(
              photo.challenge_day,
              photo.storage_path
            );
          }
        }

        const urls: Record<number, string> = {};
        const paths: Record<number, string> = {};

        await Promise.all(
          Array.from(latestPhotoByDay.entries()).map(
            async ([day, path]) => {
              const { data, error } = await supabase.storage
                .from("progress-photos")
                .createSignedUrl(path, 60 * 60);

              if (!error && data?.signedUrl) {
                urls[day] = data.signedUrl;
                paths[day] = path;
              }
            }
          )
        );

        setPhotoUrls(urls);
        setPhotoPaths(paths);
      }

      const { data: savedWins, error: winsError } = await supabase
        .from("little_wins")
        .select("win_key, is_completed")
        .eq("user_id", user.id);

      if (winsError) {
        console.error("Could not load little wins:", winsError);
      } else {
        const loaded: Record<string, boolean> = {};

        for (const row of savedWins ?? []) {
          loaded[row.win_key] = Boolean(row.is_completed);
        }

        setCompletedWins(loaded);
      }

      const { data: savedCheckins, error: checkinsError } = await supabase
        .from("weekly_checkins")
        .select(
          "week_number, went_well, felt_hard, proud_of, next_week_focus"
        )
        .eq("user_id", user.id);

      if (checkinsError) {
        console.error(
          "Could not load weekly check-ins:",
          checkinsError
        );
      } else {
        const loaded: Record<number, CheckinRow> = {};

        for (const row of savedCheckins ?? []) {
          loaded[row.week_number] = row;
        }

        setWeeklyCheckins(loaded);
      }

      const { data: latestMeasurement, error: measurementError } =
        await supabase
          .from("measurements")
          .select(
            "weight, waist, hips, chest, thigh, arm, challenge_day"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (measurementError) {
        console.error(
          "Could not load measurements:",
          measurementError
        );
      } else if (latestMeasurement) {
        setMeasurementRow(latestMeasurement);
      }

      setIsLoadingUser(false);
    };

    loadProgress();
  }, []);

  let currentDay = 1;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (challengeStartDate) {
    startDate = parseChallengeDate(challengeStartDate);
    endDate = getChallengeEndDate(challengeStartDate);
    currentDay = getCurrentChallengeDay(
      challengeStartDate,
      new Date()
    );
  }

  const safeCurrentDay = Math.max(1, currentDay);
  const dayNumber = String(safeCurrentDay).padStart(2, "0");

  const startLabel = startDate ? formatShortDate(startDate) : "—";
  const endLabel = endDate ? formatShortDate(endDate) : "—";

  const currentWeek = Math.max(1, Math.ceil(safeCurrentDay / 7));
  const currentWeekComplete = Boolean(weeklyCheckins[currentWeek]);

  const completedCheckins = Object.keys(weeklyCheckins).length;

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
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" "),
    }));

  /*
   * ============================================================
   * PHOTO UPLOAD
   * ============================================================
   *
   * WEB:
   * Uses a normal file input.
   *
   * NATIVE iOS:
   * Uses Capacitor Camera.
   */

  const uploadPhotoFile = async (
    file: File,
    day: number
  ) => {
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

      if (!file.type.startsWith("image/")) {
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

      const { error: uploadError } = await withTimeout(
        supabase.storage
          .from("progress-photos")
          .upload(newFilePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }),
        "The photo upload timed out. Please try again."
      );

      if (uploadError) {
        throw uploadError;
      }

      const { data: signedData, error: signedError } =
        await withTimeout(
          supabase.storage
            .from("progress-photos")
            .createSignedUrl(newFilePath, 60 * 60),
          "The photo uploaded, but the preview could not be created."
        );

      if (signedError || !signedData?.signedUrl) {
        throw (
          signedError ??
          new Error(
            "The photo uploaded, but the preview could not be created."
          )
        );
      }

      const { error: recordError } = await withTimeout(
        supabase
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
              onConflict:
                "user_id,challenge_day,photo_type",
            }
          ),
        "The photo uploaded, but it could not be saved to your progress."
      );

      if (recordError) {
        throw recordError;
      }

      const oldPath = photoPaths[day];

      setPhotoUrls((previous) => ({
        ...previous,
        [day]: signedData.signedUrl,
      }));

      setPhotoPaths((previous) => ({
        ...previous,
        [day]: newFilePath!,
      }));

      setEditingPhotoDay(null);

      if (oldPath && oldPath !== newFilePath) {
        const { error: removeError } =
          await supabase.storage
            .from("progress-photos")
            .remove([oldPath]);

        if (removeError) {
          console.warn(
            "New photo saved, but old photo could not be removed:",
            removeError
          );
        }
      }
    } catch (error) {
      console.error("Progress photo upload error:", error);

      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not upload your photo. Please try again."
      );

      if (newFilePath) {
        await supabase.storage
          .from("progress-photos")
          .remove([newFilePath])
          .catch(() => {});
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const openPhotoPicker = async (day: number) => {
    if (isUploadingPhoto) return;

    setPhotoTargetDay(day);
    setPhotoError(null);

    /*
     * WEB
     *
     * Do NOT use Capacitor Camera here.
     * Let the browser handle the file picker.
     */
    if (!Capacitor.isNativePlatform()) {
      webPhotoInputRef.current?.click();
      return;
    }

    /*
     * NATIVE iOS
     */
    setIsUploadingPhoto(true);

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        quality: 90,
        width: 1600,
        height: 2000,
        allowEditing: false,
        correctOrientation: true,
      });

      if (!photo.base64String) {
        throw new Error(
          "No photo was selected. Please try again."
        );
      }

      const byteCharacters = atob(photo.base64String);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const isPng = photo.format === "png";
      const mimeType = isPng ? "image/png" : "image/jpeg";
      const extension = isPng ? "png" : "jpg";

      const file = new File(
        [byteArray],
        `progress-day-${day}.${extension}`,
        {
          type: mimeType,
        }
      );

      setIsUploadingPhoto(false);

      await uploadPhotoFile(file, day);
    } catch (error) {
      setIsUploadingPhoto(false);

      const message =
        error instanceof Error
          ? error.message
          : "Could not select the photo.";

      const lower = message.toLowerCase();

      if (
        !lower.includes("cancel") &&
        !lower.includes("cancelled") &&
        !lower.includes("canceled")
      ) {
        console.error("Camera error:", error);
        setPhotoError(message);
      }
    }
  };

  const handleWebPhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    /*
     * Reset the input so selecting the same photo again
     * still triggers onChange.
     */
    event.target.value = "";

    if (!file) return;

    await uploadPhotoFile(file, photoTargetDay);
  };

  const removeProgressPhoto = async (day: number) => {
    const path = photoPaths[day];

    if (!path) return;

    setPhotoError(null);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setPhotoError("You need to be signed in.");
      return;
    }

    const { error: storageError } = await supabase.storage
      .from("progress-photos")
      .remove([path]);

    if (storageError) {
      setPhotoError(storageError.message);
      return;
    }

    const { error: recordError } = await supabase
      .from("progress_photos")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("challenge_day", day)
      .eq("photo_type", "progress");

    if (recordError) {
      setPhotoError(recordError.message);
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

  /*
   * ============================================================
   * MEASUREMENTS
   * ============================================================
   */

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You need to be signed in to save measurements."
        );
      }

      const toNumber = (value: string) =>
        value.trim() === "" ? null : Number(value);

      const payload = {
        user_id: user.id,
        challenge_day: safeCurrentDay,
        weight: toNumber(measurementForm.weight),
        waist: toNumber(measurementForm.waist),
        hips: toNumber(measurementForm.hips),
        chest: toNumber(measurementForm.chest),
        thigh: toNumber(measurementForm.thigh),
        arm: toNumber(measurementForm.arm),
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
            (!Number.isFinite(value) || value < 0)
        )
      ) {
        throw new Error(
          "Please enter valid positive numbers."
        );
      }

      const { data, error } = await supabase
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
      console.error(error);

      setMeasurementError(
        error instanceof Error
          ? error.message
          : "Could not save measurements."
      );
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  /*
   * ============================================================
   * LITTLE WINS
   * ============================================================
   */

  const toggleWin = async (win: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const nextValue = !completedWins[win];

    setCompletedWins((previous) => ({
      ...previous,
      [win]: nextValue,
    }));

    const { error } = await supabase
      .from("little_wins")
      .upsert(
        {
          user_id: user.id,
          win_key: win,
          label: win,
          is_completed: nextValue,
          challenge_day: safeCurrentDay,
          completed_at: nextValue
            ? new Date().toISOString()
            : null,
        },
        {
          onConflict:
            "user_id,win_key,challenge_day",
        }
      );

    if (error) {
      console.error("Could not save little win:", error);

      setCompletedWins((previous) => ({
        ...previous,
        [win]: !nextValue,
      }));
    }
  };

  const saveCustomWin = async () => {
    const label = customWin.trim();

    if (!label) {
      setCustomWinError("Write your win first. ♡");
      return;
    }

    setIsSavingCustomWin(true);
    setCustomWinError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You need to be signed in to add a win."
        );
      }

      const winKey = `custom:${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;

      const { error } = await supabase
        .from("little_wins")
        .upsert(
          {
            user_id: user.id,
            win_key: winKey,
            label,
            is_completed: true,
            challenge_day: safeCurrentDay,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict:
              "user_id,win_key,challenge_day",
          }
        );

      if (error) throw error;

      setCompletedWins((previous) => ({
        ...previous,
        [winKey]: true,
      }));

      setCustomWin("");
      setIsCustomWinModalOpen(false);
    } catch (error) {
      console.error(error);

      setCustomWinError(
        error instanceof Error
          ? error.message
          : "Could not save your win."
      );
    } finally {
      setIsSavingCustomWin(false);
    }
  };

  /*
   * ============================================================
   * WEEKLY CHECK-IN
   * ============================================================
   */

  const openWeeklyCheckin = (week: number) => {
    const saved = weeklyCheckins[week];

    setCheckinError(null);

    setCheckinForm(
      saved
        ? {
            went_well: saved.went_well,
            felt_hard: saved.felt_hard,
            proud_of: saved.proud_of,
            next_week_focus: saved.next_week_focus,
          }
        : {
            went_well: "",
            felt_hard: "",
            proud_of: "",
            next_week_focus: "",
          }
    );

    setCheckinWeek(week);
  };

  const saveWeeklyCheckin = async () => {
    if (checkinWeek === null) return;

    setIsSavingCheckin(true);
    setCheckinError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You need to be signed in to save a check-in."
        );
      }

      const payload = {
        user_id: user.id,
        week_number: checkinWeek,
        ...checkinForm,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("weekly_checkins")
        .upsert(payload, {
          onConflict: "user_id,week_number",
        })
        .select(
          "week_number, went_well, felt_hard, proud_of, next_week_focus"
        )
        .single();

      if (error) throw error;

      setWeeklyCheckins((previous) => ({
        ...previous,
        [checkinWeek]: data,
      }));

      setCheckinWeek(null);
    } catch (error) {
      console.error(error);

      setCheckinError(
        error instanceof Error
          ? error.message
          : "Could not save check-in."
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
            isLoadingUser={isLoadingUser}
          />

          <section className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#DDB5AE] bg-[#FBF8F6] font-serif text-2xl text-[#A77B73]">
                ♡
              </div>

              <p className="mt-5 font-serif text-2xl italic text-[#A77B73]">
                loading your progress... ♡
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const measurementDisplay = [
    [
      "WEIGHT",
      measurementRow?.weight != null
        ? `${measurementRow.weight} lb`
        : "—",
    ],
    [
      "WAIST",
      measurementRow?.waist != null
        ? `${measurementRow.waist} in`
        : "—",
    ],
    [
      "HIPS",
      measurementRow?.hips != null
        ? `${measurementRow.hips} in`
        : "—",
    ],
    [
      "CHEST",
      measurementRow?.chest != null
        ? `${measurementRow.chest} in`
        : "—",
    ],
    [
      "THIGH",
      measurementRow?.thigh != null
        ? `${measurementRow.thigh} in`
        : "—",
    ],
    [
      "ARM",
      measurementRow?.arm != null
        ? `${measurementRow.arm} in`
        : "—",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          {/* Hidden browser picker.
              This is ONLY used on web. */}
          <input
            ref={webPhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleWebPhotoChange}
          />

          {/* INTRO */}

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

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* DAY 01 */}

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
                              removeProgressPhoto(1)
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
                      disabled={isUploadingPhoto}
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

                {photoError && photoTargetDay === 1 && (
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

              {/* CURRENT DAY */}

              <div className="group overflow-hidden rounded-[1.75rem] border border-[#CBA9A2] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#EAD8D3]">
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-[#211C19] px-4 py-2 text-[10px] tracking-[0.2em] text-[#F7F1ED]">
                    CURRENT
                  </span>

                  {photoUrls[safeCurrentDay] ? (
                    <>
                      <img
                        src={photoUrls[safeCurrentDay]}
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
                      disabled={isUploadingPhoto}
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
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[12px] tracking-[0.25em]">
                      DAY {dayNumber}
                    </p>

                    <p className="mt-1 font-serif text-lg italic text-[#A77B73]">
                      right now.
                    </p>
                  </div>

                  <span className="text-[12px] text-[#927D76]">
                    TODAY
                  </span>
                </div>
              </div>

              {/* FINISH */}

              <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#F1EAE7]">
                  <div className="text-center">
                    <span className="font-serif text-4xl text-[#D0B7B1]">
                      ♡
                    </span>

                    <p className="mt-3 text-[12px] tracking-[0.2em] text-[#A7938D]">
                      KEEP GOING
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[12px] tracking-[0.25em]">
                      YOUR FINISH
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
          </section>

          {/* MEASUREMENTS + LITTLE WINS */}

          <section className="grid gap-5 border-t border-[#DED0CB] py-10 lg:grid-cols-2">
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
                  onClick={openMeasurementModal}
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
              <p className="text-[12px] tracking-[0.35em] text-[#8F655E]">
                LITTLE WINS
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                What&apos;s changing?
              </h2>

              <p className="mt-2 font-serif text-base italic text-[#A77B73]">
                the little things count too. ♡
              </p>

              <div className="mt-7 space-y-3">
                {wins.map((win) => {
                  const checked = Boolean(
                    completedWins[win]
                  );

                  return (
                    <button
                      key={win}
                      type="button"
                      onClick={() => toggleWin(win)}
                      className={`flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] px-5 py-4 text-left transition ${
                        checked
                          ? "bg-[#F1E2DE]"
                          : "bg-[#F1E2DE]/50 hover:bg-[#F1E2DE]"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] ${
                          checked
                            ? "bg-[#211C19] text-[#F7F1ED]"
                            : "text-[#9D6F67]"
                        }`}
                      >
                        {checked ? "✓" : "♡"}
                      </span>

                      <span className="font-serif text-lg italic">
                        {win}
                      </span>
                    </button>
                  );
                })}
              </div>

              {customWins.length > 0 && (
                <div className="mt-3 space-y-3">
                  {customWins.map(({ key, label }) => {
                    const checked = Boolean(
                      completedWins[key]
                    );

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleWin(key)}
                        className={`flex w-full items-center gap-4 rounded-2xl border border-[#D1B7B0] px-5 py-4 text-left transition ${
                          checked
                            ? "bg-[#F1E2DE]"
                            : "bg-[#F1E2DE]/50 hover:bg-[#F1E2DE]"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#B48A82] text-[10px] ${
                            checked
                              ? "bg-[#211C19] text-[#F7F1ED]"
                              : "text-[#9D6F67]"
                          }`}
                        >
                          {checked ? "✓" : "♡"}
                        </span>

                        <span className="font-serif text-lg italic">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCustomWin("");
                  setCustomWinError(null);
                  setIsCustomWinModalOpen(true);
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
                {completedCheckins} OF {currentWeek} COMPLETE
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6]">
              <div className="flex flex-col gap-7 p-7 md:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAD8D3] font-serif text-xl text-[#A77B73]">
                    {String(currentWeek).padStart(2, "0")}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[12px] tracking-[0.25em] text-[#806E68]">
                        WEEK {String(currentWeek).padStart(2, "0")}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] tracking-[0.18em] ${
                          currentWeekComplete
                            ? "bg-[#211C19] text-[#F7F1ED]"
                            : "bg-[#EAD8D3] text-[#8F655E]"
                        }`}
                      >
                        {currentWeekComplete
                          ? "COMPLETE"
                          : "READY"}
                      </span>
                    </div>

                    <p className="mt-2 font-serif text-2xl italic text-[#A77B73]">
                      {currentWeekComplete
                        ? "you checked in. ♡"
                        : "how are you feeling?"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openWeeklyCheckin(currentWeek)
                  }
                  className="shrink-0 rounded-full bg-[#211C19] px-7 py-3.5 text-[11px] tracking-[0.22em] text-[#F7F1ED]"
                >
                  {currentWeekComplete
                    ? "VIEW CHECK-IN"
                    : "CHECK IN →"}
                </button>
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
            setIsMeasurementModalOpen(false)
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
                  setIsMeasurementModalOpen(false)
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
              ].map(([field, label, unit]) => (
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
                          [field]: event.target.value,
                        })
                      )
                    }
                    className="mt-2 w-full bg-transparent font-serif text-2xl text-[#A77B73] outline-none"
                    placeholder="—"
                  />
                </label>
              ))}
            </div>

            {measurementError && (
              <p className="mt-4 text-[12px] text-[#9D6F67]">
                {measurementError}
              </p>
            )}

            <button
              type="button"
              onClick={saveMeasurements}
              disabled={isSavingMeasurements}
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
            setIsCustomWinModalOpen(false)
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
                  setIsCustomWinModalOpen(false)
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
                  setCustomWin(event.target.value);
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
              onClick={saveCustomWin}
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
          onClick={() => setCheckinWeek(null)}
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
                  {String(checkinWeek).padStart(
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
                ["went_well", "What went well?"],
                ["felt_hard", "What felt hard?"],
                ["proud_of", "What are you proud of?"],
                [
                  "next_week_focus",
                  "What do you want to focus on next week?",
                ],
              ].map(([field, label]) => (
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
                          [field]: event.target.value,
                        })
                      )
                    }
                    className="mt-2 w-full resize-none bg-transparent font-serif text-lg italic text-[#A77B73] outline-none"
                    placeholder="write it here..."
                  />
                </label>
              ))}
            </div>

            {checkinError && (
              <p className="mt-4 text-[12px] text-[#9D6F67]">
                {checkinError}
              </p>
            )}

            <button
              type="button"
              onClick={saveWeeklyCheckin}
              disabled={isSavingCheckin}
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