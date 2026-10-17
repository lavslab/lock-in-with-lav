
"use client";

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveJourney } from "@/lib/active-journey";
import JourneyProgressSections from "@/components/JourneyProgressSections";
import {
  type DailyProgressRow,
  getChallengePercentage,
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

type Progress = DailyProgressRow & {
  manually_completed?: boolean;
};

const MEASUREMENT_FIELDS = [
  "weight",
  "waist",
  "hips",
  "chest",
  "thigh",
  "arm",
] as const;

type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

type Measurement = {
  id: string;
  challenge_day: number;
} & Record<MeasurementField, number | string | null>;

type MeasurementForm = Record<MeasurementField, string>;

type Photo = {
  id: string;
  challenge_day: number;
  storage_path: string;
  created_at?: string;
};

type LittleWin = {
  id: number;
  challenge_day: number | null;
  label: string | null;
  is_completed: boolean;
};

const EMPTY_MEASUREMENTS: MeasurementForm = {
  weight: "",
  waist: "",
  hips: "",
  chest: "",
  thigh: "",
  arm: "",
};

const buttonPrimary =
  "rounded-full bg-[#A77B73] px-5 py-3 text-[10px] font-medium tracking-[0.12em] text-white transition hover:bg-[#8F655E] disabled:cursor-wait disabled:opacity-50";

const buttonOutline =
  "rounded-full border border-[#D6BFB8] bg-[#FFFCFA] px-5 py-3 text-[10px] font-medium tracking-[0.12em] text-[#805D55] transition hover:bg-[#F4E9E4] disabled:opacity-50";

function fullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function databaseDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateForDay(start: Date, day: number) {
  const date = new Date(start);
  date.setDate(start.getDate() + day - 1);
  return date;
}

function commitmentCount(row?: DailyProgressRow) {
  if (!row) return 0;

  return [
    row.move,
    row.get_outside,
    row.hydrate,
    row.read,
    row.nourish,
    row.document,
    row.no_alcohol,
  ].filter(Boolean).length;
}

function complete(row?: Progress) {
  return Boolean(
    row &&
      (commitmentCount(row) === 7 ||
        row.manually_completed === true)
  );
}

function measurementUnit(field: MeasurementField) {
  return field === "weight" ? "lbs" : "in";
}

function displayMeasurement(
  field: MeasurementField,
  value: number | string | null
) {
  if (value === null || value === "") return "—";
  return `${value} ${measurementUnit(field)}`;
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#9D6F67]">
      {children}
    </p>
  );
}

export default function JourneyPage() {
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [activeJourneyId, setActiveJourneyId] =
    useState<string | null>(null);
  const [startString, setStartString] =
    useState<string | null>(null);
  const [length, setLength] = useState(0);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [photos, setPhotos] = useState<Record<number, Photo>>({});
  const [photoUrls, setPhotoUrls] =
    useState<Record<number, string>>({});
  const [overviewOpen, setOverviewOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayError, setDayError] = useState<string | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);
  const [measurementForm, setMeasurementForm] =
    useState<MeasurementForm>({ ...EMPTY_MEASUREMENTS });
  const [editingMeasurements, setEditingMeasurements] =
    useState(false);
  const [dayWins, setDayWins] = useState<LittleWin[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const loadJourney = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setActiveJourneyId(null);
        setProgress([]);
        setPhotos({});
        setPhotoUrls({});
        setStartString(null);
        setLength(0);
        return;
      }

      const name = user.user_metadata?.name;
      setFirstName(
        typeof name === "string" && name.trim()
          ? name
          : user.email?.split("@")[0] ?? "there"
      );

      const journey = await getActiveJourney();

      if (
        !journey ||
        journey.user_id !== user.id ||
        journey.status !== "active" ||
        !journey.start_date
      ) {
        setActiveJourneyId(null);
        setStartString(null);
        setLength(0);
        setProgress([]);
        setPhotos({});
        setPhotoUrls({});
        return;
      }

      setActiveJourneyId(journey.id);
      setStartString(journey.start_date);
      setLength(journey.challenge_length);

      const [p, ph] = await Promise.all([
        supabase
          .from("daily_progress")
          .select(
            "id,challenge_day,move,get_outside,hydrate,read,nourish,document,no_alcohol,manually_completed"
          )
          .eq("user_id", user.id)
          .eq("journey_id", journey.id)
          .order("challenge_day"),

        supabase
          .from("progress_photos")
          .select("id,challenge_day,storage_path,created_at")
          .eq("user_id", user.id)
          .eq("journey_id", journey.id)
          .eq("photo_type", "progress")
          .order("created_at", { ascending: false }),
      ]);

      if (p.error) throw p.error;
      if (ph.error) throw ph.error;

      setProgress((p.data ?? []) as Progress[]);

      const nextPhotos: Record<number, Photo> = {};
      const nextUrls: Record<number, string> = {};

      for (const row of (ph.data ?? []) as Photo[]) {
        if (nextPhotos[row.challenge_day]) continue;

        nextPhotos[row.challenge_day] = row;

        const { data } = await supabase.storage
          .from("progress-photos")
          .createSignedUrl(row.storage_path, 3600);

        if (data?.signedUrl) {
          nextUrls[row.challenge_day] = data.signedUrl;
        }
      }

      setPhotos(nextPhotos);
      setPhotoUrls(nextUrls);
    } catch (error) {
      console.error("Could not load Journey:", error);
      setDayError(
        error instanceof Error
          ? error.message
          : "Could not load your journey."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney, revision]);

  const startDate = startString
    ? parseChallengeDate(startString)
    : null;

  const currentDay =
    startString && length > 0
      ? getCurrentChallengeDay(startString, length)
      : 0;

  const safeCurrentDay =
    length > 0
      ? Math.min(Math.max(currentDay, 1), length)
      : 0;

  const todayRow = progress.find(
    (row) => row.challenge_day === safeCurrentDay
  );

  const todayCount = commitmentCount(todayRow);
  const todayComplete = complete(todayRow);

  const todayStatus = todayComplete
    ? "day complete ♡"
    : todayCount > 0
      ? "day in progress"
      : "day not started";

  const completedDays = progress.filter(
    (row) => row.challenge_day <= length && complete(row)
  ).length;

  const percentage =
    length > 0
      ? getChallengePercentage(completedDays, length)
      : 0;

  const selectedRow = progress.find(
    (row) => row.challenge_day === selectedDay
  );

  const selectedCount = commitmentCount(selectedRow);
  const selectedComplete = complete(selectedRow);
  const selectedPast =
    selectedDay !== null && selectedDay < safeCurrentDay;
  const selectedCurrent = selectedDay === safeCurrentDay;
  const selectedDate =
    selectedDay !== null && startDate
      ? dateForDay(startDate, selectedDay)
      : null;

  const selectedPhoto =
    selectedDay !== null ? photos[selectedDay] : undefined;

  const selectedPhotoUrl =
    selectedDay !== null ? photoUrls[selectedDay] : undefined;

  const dayNumbers = Array.from(
    { length },
    (_, index) => index + 1
  );

  async function verifyWrite(day: number) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("Please sign in.");

    const journey = await getActiveJourney();

    
if (
  !journey ||
  journey.user_id !== user.id ||
  journey.id !== activeJourneyId ||
  journey.status !== "active" ||
  !journey.start_date ||
  journey.start_date !== startString ||
  journey.challenge_length !== length
) {
  throw new Error(
    "Your active journey has changed. Refresh before editing."
  );
}


    const start = parseChallengeDate(journey.start_date);
    const now = new Date();

    const elapsed =
      Math.floor(
        (Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ) -
          Date.UTC(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          )) /
          86400000
      ) + 1;

    if (
      !Number.isInteger(day) ||
      day < 1 ||
      day > journey.challenge_length ||
      day > elapsed
    ) {
      throw new Error("This journey day cannot be edited yet.");
    }

    return { userId: user.id, journeyId: journey.id };
  }

  async function loadDay(day: number) {
    if (!activeJourneyId) return;

    setDayLoading(true);
    setDayError(null);
    setPhotoError(null);
    setManualError(null);
    setEditingMeasurements(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in.");

      const [m, w] = await Promise.all([
        supabase
          .from("measurements")
          .select(
            "id,challenge_day,weight,waist,hips,chest,thigh,arm"
          )
          .eq("user_id", user.id)
          .eq("journey_id", activeJourneyId)
          .eq("challenge_day", day)
          .order("created_at", { ascending: false })
          .limit(1),

        supabase
          .from("little_wins")
          .select("id,challenge_day,label,is_completed")
          .eq("user_id", user.id)
          .eq("journey_id", activeJourneyId)
          .eq("challenge_day", day)
          .eq("is_completed", true),
      ]);

      if (m.error) throw m.error;
      if (w.error) throw w.error;

      const measurement =
        (m.data?.[0] as Measurement | undefined) ?? null;

      setSelectedMeasurement(measurement);
      setDayWins((w.data ?? []) as LittleWin[]);

      setMeasurementForm(
        Object.fromEntries(
          MEASUREMENT_FIELDS.map((field) => [
            field,
            measurement?.[field] === null ||
            measurement?.[field] === undefined
              ? ""
              : String(measurement[field]),
          ])
        ) as MeasurementForm
      );
    } catch (error) {
      setDayError(
        error instanceof Error
          ? error.message
          : "Could not open this day."
      );
    } finally {
      setDayLoading(false);
    }
  }

  function openDay(day: number) {
    if (
      !activeJourneyId ||
      day < 1 ||
      day > safeCurrentDay
    ) {
      return;
    }

    setSelectedDay(day);
    void loadDay(day);
  }

  function closeDay() {
    if (busy || uploading) return;
    setSelectedDay(null);
    setEditingMeasurements(false);
    setDayError(null);
    setPhotoError(null);
  }

  async function saveMeasurements() {
    if (selectedDay === null || busy) return;

    const day = selectedDay;
    setBusy(true);
    setDayError(null);

    try {
      const identity = await verifyWrite(day);

      const values = Object.fromEntries(
        MEASUREMENT_FIELDS.map((field) => [
          field,
          measurementForm[field].trim() === ""
            ? null
            : Number(measurementForm[field]),
        ])
      ) as Record<MeasurementField, number | null>;

      if (
        Object.values(values).every((value) => value === null)
      ) {
        throw new Error("Enter at least one measurement.");
      }

      if (
        Object.values(values).some(
          (value) =>
            value !== null &&
            (!Number.isFinite(value) || value < 0)
        )
      ) {
        throw new Error("Please enter valid measurements.");
      }

      if (selectedMeasurement?.id) {
        const { data, error } = await supabase
          .from("measurements")
          .update(values)
          .eq("id", selectedMeasurement.id)
          .eq("user_id", identity.userId)
          .eq("journey_id", identity.journeyId)
          .eq("challenge_day", day)
          .select("id")
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error("Measurements could not be updated.");
        }
      } else {
        const { error } = await supabase
          .from("measurements")
          .insert({
            user_id: identity.userId,
            journey_id: identity.journeyId,
            challenge_day: day,
            ...values,
          });

        if (error) throw error;
      }

      setEditingMeasurements(false);
      await loadDay(day);
    } catch (error) {
      setDayError(
        error instanceof Error
          ? error.message
          : "Could not save measurements."
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteMeasurements() {
    if (
      selectedDay === null ||
      !selectedMeasurement?.id ||
      busy
    ) {
      return;
    }

    if (
      !window.confirm(
        "Remove the measurements recorded for this day?"
      )
    ) {
      return;
    }

    const day = selectedDay;
    setBusy(true);
    setDayError(null);

    try {
      const identity = await verifyWrite(day);

      const { data, error } = await supabase
        .from("measurements")
        .delete()
        .eq("id", selectedMeasurement.id)
        .eq("user_id", identity.userId)
        .eq("journey_id", identity.journeyId)
        .eq("challenge_day", day)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Could not remove measurements.");

      setSelectedMeasurement(null);
      setMeasurementForm({ ...EMPTY_MEASUREMENTS });
      setEditingMeasurements(false);
    } catch (error) {
      setDayError(
        error instanceof Error
          ? error.message
          : "Could not remove measurements."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || selectedDay === null || uploading) return;

    const day = selectedDay;
    setUploading(true);
    setPhotoError(null);

    try {
      const identity = await verifyWrite(day);

      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image.");
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const path = `${identity.userId}/day-${String(day).padStart(2, "0")}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { error: recordError } = await supabase
        .from("progress_photos")
        .upsert(
          {
            user_id: identity.userId,
            journey_id: identity.journeyId,
            challenge_day: day,
            storage_path: path,
            photo_type: "progress",
            caption: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict:
              "journey_id,challenge_day,photo_type",
          }
        );

      if (recordError) throw recordError;

      const { data: signed, error: signedError } =
        await supabase.storage
          .from("progress-photos")
          .createSignedUrl(path, 3600);

      if (signedError) {
        console.error("Photo preview:", signedError);
      }

      setPhotos((previous) => ({
        ...previous,
        [day]: {
          id: previous[day]?.id ?? "",
          challenge_day: day,
          storage_path: path,
        },
      }));

      if (signed?.signedUrl) {
        setPhotoUrls((previous) => ({
          ...previous,
          [day]: signed.signedUrl,
        }));
      }

      // Preserve existing commitments and manual completion.
      // Only mark Document if it wasn't already checked.
      const existing = progress.find(
        (row) => row.challenge_day === day
      );

      if (!existing?.document) {
        const { error: progressError } = await supabase
          .from("daily_progress")
          .upsert(
            {
              user_id: identity.userId,
              journey_id: identity.journeyId,
              challenge_day: day,
              progress_date: databaseDate(
                dateForDay(parseChallengeDate(startString!), day)
              ),
              move: existing?.move ?? false,
              get_outside: existing?.get_outside ?? false,
              hydrate: existing?.hydrate ?? false,
              read: existing?.read ?? false,
              nourish: existing?.nourish ?? false,
              document: true,
              no_alcohol: existing?.no_alcohol ?? false,
              manually_completed:
                existing?.manually_completed ?? false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "journey_id,challenge_day" }
          );

        if (progressError) {
          setPhotoError(
            "Photo saved, but the Document commitment could not be updated."
          );
        } else {
          setProgress((previous) => {
            if (
              previous.some((row) => row.challenge_day === day)
            ) {
              return previous.map((row) =>
                row.challenge_day === day
                  ? { ...row, document: true }
                  : row
              );
            }

            return [
              ...previous,
              {
                challenge_day: day,
                move: false,
                get_outside: false,
                hydrate: false,
                read: false,
                nourish: false,
                document: true,
                no_alcohol: false,
                manually_completed: false,
              } as Progress,
            ];
          });
        }
      }
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not upload photo."
      );
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (
      selectedDay === null ||
      !selectedPhoto ||
      uploading
    ) {
      return;
    }

    if (
      !window.confirm(
        "Remove this photo from your daily record?"
      )
    ) {
      return;
    }

    const day = selectedDay;
    setUploading(true);
    setPhotoError(null);

    try {
      const identity = await verifyWrite(day);

      // Only remove the database reference.
      // The private Storage file is retained for recovery.
      const { data, error } = await supabase
        .from("progress_photos")
        .delete()
        .eq("user_id", identity.userId)
        .eq("journey_id", identity.journeyId)
        .eq("challenge_day", day)
        .eq("photo_type", "progress")
        .eq("storage_path", selectedPhoto.storage_path)
        .select("id");

      if (error) throw error;

      if (!data?.length) {
        throw new Error("Photo could not be removed.");
      }

      setPhotos((previous) => {
        const next = { ...previous };
        delete next[day];
        return next;
      });

      setPhotoUrls((previous) => {
        const next = { ...previous };
        delete next[day];
        return next;
      });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not remove photo."
      );
    } finally {
      setUploading(false);
    }
  }

  async function savePhotoToDevice() {
    if (!selectedPhoto?.storage_path) return;

    setPhotoError(null);

    try {
      const { data, error } = await supabase.storage
        .from("progress-photos")
        .download(selectedPhoto.storage_path);

      if (error || !data) {
        throw error ?? new Error("Could not download photo.");
      }

      const extension =
        selectedPhoto.storage_path.split(".").pop() ?? "jpg";

      const name = `lock-in-with-lav-day-${String(selectedDay).padStart(2, "0")}.${extension}`;

      if (Capacitor.isNativePlatform()) {
        const base64 = await new Promise<string>(
          (resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
              if (typeof reader.result !== "string") {
                reject(new Error("Could not prepare photo."));
                return;
              }

              resolve(reader.result.split(",")[1]);
            };

            reader.onerror = () =>
              reject(new Error("Could not read photo."));

            reader.readAsDataURL(data);
          }
        );

        const saved = await Filesystem.writeFile({
          path: name,
          data: base64,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Save Progress Photo",
          url: saved.uri,
          dialogTitle: "Save your Lock In With Lav photo",
        });
      } else {
        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(
          () => URL.revokeObjectURL(url),
          1000
        );
      }
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not save photo."
      );
    }
  }

  async function setManualCompletion(value: boolean) {
    if (
      selectedDay === null ||
      !selectedPast ||
      selectedCount === 7 ||
      busy
    ) {
      return;
    }

    const day = selectedDay;
    setBusy(true);
    setManualError(null);

    try {
      const identity = await verifyWrite(day);

      const existing = progress.find(
        (row) => row.challenge_day === day
      );

      const payload = {
        user_id: identity.userId,
        journey_id: identity.journeyId,
        challenge_day: day,
        progress_date: databaseDate(
          dateForDay(parseChallengeDate(startString!), day)
        ),
        move: existing?.move ?? false,
        get_outside: existing?.get_outside ?? false,
        hydrate: existing?.hydrate ?? false,
        read: existing?.read ?? false,
        nourish: existing?.nourish ?? false,
        document: existing?.document ?? false,
        no_alcohol: existing?.no_alcohol ?? false,
        manually_completed: value,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("daily_progress")
        .upsert(payload, {
          onConflict: "journey_id,challenge_day",
        });

      if (error) throw error;

      setProgress((previous) => {
        if (
          previous.some((row) => row.challenge_day === day)
        ) {
          return previous.map((row) =>
            row.challenge_day === day
              ? { ...row, manually_completed: value }
              : row
          );
        }

        return [...previous, payload as Progress];
      });
    } catch (error) {
      setManualError(
        error instanceof Error
          ? error.message
          : "Could not update this day."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={
            loading
              ? "♡"
              : firstName.charAt(0).toUpperCase()
          }
          isLoadingUser={loading}
        />

        <section className="min-w-0 flex-1 px-4 py-7 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">

            {/* LOCK-IN STATUS */}

            <section className="overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">
              <button
                type="button"
                onClick={() =>
                  setOverviewOpen((value) => !value)
                }
                aria-expanded={overviewOpen}
                className="w-full px-5 py-6 text-left sm:px-7"
              >
                <div className="flex items-center justify-between">
                  <SmallLabel>YOUR LOCK-IN STATUS</SmallLabel>
                  <span className="text-xl text-[#A77B73]">
                    {overviewOpen ? "⌃" : "⌄"}
                  </span>
                </div>

                <h1 className="mt-5 min-h-[2.5rem] font-serif text-3xl italic leading-tight sm:text-4xl">
                  {loading ? "\u00A0" : todayStatus}
                </h1>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-serif italic text-[#A77B73]">
                    {loading
                      ? "\u00A0"
                      : todayComplete
                        ? "you showed up for yourself. ♡"
                        : todayCount > 0
                          ? "keep showing up. ♡"
                          : "a fresh start awaits. ♡"}
                  </p>

                  <span className="shrink-0 text-[9px] tracking-[0.15em] text-[#9D6F67]">
                    {loading || !activeJourneyId
                      ? ""
                      : `DAY ${String(safeCurrentDay).padStart(2, "0")}`}
                  </span>
                </div>
              </button>

              {overviewOpen && (
                <div className="border-t border-[#E5D8D3] px-5 py-6 sm:px-7">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <SmallLabel>TODAY</SmallLabel>
                      <p className="mt-3 font-serif text-sm italic sm:text-lg">
                        {startDate
                          ? fullDate(
                              dateForDay(
                                startDate,
                                safeCurrentDay
                              )
                            )
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <SmallLabel>PROGRESS</SmallLabel>
                      <p className="mt-3 font-serif text-2xl">
                        {percentage}%
                      </p>
                    </div>

                    <div>
                      <SmallLabel>COMPLETE</SmallLabel>
                      <p className="mt-3 font-serif text-2xl">
                        {completedDays}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 h-1 overflow-hidden rounded-full bg-[#E7DCD7]">
                    <div
                      className="h-full rounded-full bg-[#A77B73]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-4 text-center font-serif text-sm italic text-[#A77B73]">
                    {todayCount} of 7 commitments checked today ♡
                  </p>
                </div>
              )}
            </section>

            {/* DAILY CALENDAR */}

            <section className="mt-7 rounded-[1.5rem] border border-[#DCC6BF] bg-[#EAD8D3] px-4 py-6 sm:px-7 sm:py-8">
              <SmallLabel>YOUR DAILY LOG</SmallLabel>

              <h2 className="mt-2 font-serif text-3xl italic leading-tight text-[#805D55]">
                the days you locked in.
              </h2>

              

              
<div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#D4B9B1] pb-5 text-[10px] text-[#805D55]">
  {/* Completed */}
  <div className="flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#A77B73] bg-[#B68D85] text-sm text-white">
      ✓
    </span>
    <span>Completed</span>
  </div>

  {/* Today */}
  <div className="flex items-center gap-2">
    <span className="relative flex h-7 w-8 items-center justify-center rounded-lg border border-[#CBA9A2] bg-[#FBF8F6] ring-1 ring-[#805D55] ring-offset-1 ring-offset-[#EAD8D3]">
      <span className="text-[6px] font-medium tracking-wide">
        TODAY
      </span>
    </span>
    <span>Today</span>
  </div>

  {/* Upcoming */}
  <div className="flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7C2BC] bg-[#F7F1ED]/40 text-[#AA9690]">
      18
    </span>
    <span>Upcoming</span>
  </div>
</div>


              {loading ? (
                <p className="py-12 text-center font-serif italic text-[#8F655E]">
                  gathering your journey... ♡
                </p>
              ) : !activeJourneyId ? (
                <p className="py-12 text-center font-serif italic text-[#8F655E]">
                  Your journey will appear here when it begins. ♡
                </p>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3 lg:grid-cols-10 xl:grid-cols-12">
                    {dayNumbers.map((day) => {
                      const row = progress.find(
                        (item) => item.challenge_day === day
                      );

                      const isComplete = complete(row);
                      const isToday = day === safeCurrentDay;
                      const upcoming = day > safeCurrentDay;
                      const image = photoUrls[day];

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={upcoming}
                          onClick={() => openDay(day)}
                          aria-label={`Open Day ${day}${isComplete ? ", complete" : ""}`}
                          className={`relative flex aspect-square min-h-[62px] items-center justify-center overflow-hidden rounded-xl border transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#B68D85] text-white"
                              : upcoming
                                ? "cursor-default border-[#D7C2BC] bg-[#F7F1ED]/40 text-[#AA9690]"
                                : "border-[#CBA9A2] bg-[#FBF8F6] text-[#805D55] hover:-translate-y-0.5 hover:shadow-md"
                          } ${
                            isToday
                              ? "ring-2 ring-[#805D55] ring-offset-2 ring-offset-[#EAD8D3]"
                              : ""
                          }`}
                        >
                          {image && (
                            <>
                              <img
                                src={image}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/25" />
                            </>
                          )}

                          <span
                            className={`relative z-10 font-serif text-lg ${
                              image ? "text-white" : ""
                            }`}
                          >
                            {String(day).padStart(2, "0")}
                          </span>

                          {isComplete && (
                            <span className="absolute right-1 top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#805D55] text-xs text-white">
                              ✓
                            </span>
                          )}

                          {isToday && (
                            <span className="absolute bottom-1 z-20 rounded-full bg-[#FBF8F6] px-2 py-0.5 text-[7px] font-medium tracking-wide text-[#805D55]">
                              TODAY
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-6 text-center font-serif text-sm italic text-[#8F655E]">
                    tap a day to open your daily record. ♡
                  </p>
                </>
              )}
            </section>

            {/* ONLY LITTLE WINS + WEEKLY CHECK-INS */}

            <JourneyProgressSections />
          </div>
        </section>
      </div>

      {/* DAILY RECORD */}

      {selectedDay !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/50 px-3 py-4 backdrop-blur-[3px] sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDay();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Day ${selectedDay} daily record`}
            className="relative max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-[#D8C5BF] bg-[#FFFCFA] shadow-2xl"
          >
            <button
              type="button"
              onClick={closeDay}
              aria-label="Close daily record"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D8D3] bg-[#FFFCFA] text-xl text-[#805D55]"
            >
              ×
            </button>

            {/* DAY HEADER */}

            <header className="border-b border-[#EADDD7] px-5 pb-6 pt-7 sm:px-8">
              <SmallLabel>MY JOURNEY · DAILY RECORD</SmallLabel>

              <h2 className="mt-3 font-serif text-4xl italic text-[#30231F] sm:text-5xl">
                Day {String(selectedDay).padStart(2, "0")}
                <span className="ml-2 text-[#B68D85]">♡</span>
              </h2>

              <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                {selectedDate ? fullDate(selectedDate) : ""}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-[9px] tracking-[0.12em] ${
                    selectedComplete
                      ? "bg-[#A77B73] text-white"
                      : "bg-[#F2E8E3] text-[#805D55]"
                  }`}
                >
                  {selectedComplete
                    ? "DAY COMPLETE ♡"
                    : selectedCurrent
                      ? "DAY IN PROGRESS"
                      : "DAY INCOMPLETE"}
                </span>

                <span className="text-[10px] text-[#9D6F67]">
                  {selectedCount} / 7 commitments
                </span>
              </div>
            </header>

            {dayLoading ? (
              <div className="px-6 py-16 text-center font-serif text-xl italic text-[#A77B73]">
                opening your day... ♡
              </div>
            ) : (
              <div className="space-y-6 px-5 py-6 sm:px-8">

                {dayError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[#F5E7E2] p-4 text-sm text-[#A45E55]"
                  >
                    {dayError}
                  </p>
                )}

                {/* PROGRESS PHOTO */}

                <section>
                  <SmallLabel>01 · PROGRESS PHOTO</SmallLabel>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    this day, captured.
                  </h3>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {selectedPhotoUrl ? (
                    <div className="mt-4">
                      <div className="mx-auto max-w-sm overflow-hidden rounded-[1.4rem] border border-[#E5D8D3] bg-[#F4E9E4]">
                        <img
                          src={selectedPhotoUrl}
                          alt={`Progress photo for Day ${selectedDay}`}
                          className="max-h-[420px] w-full object-contain"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInput.current?.click()}
                          className={buttonOutline}
                        >
                          {uploading
                            ? "UPLOADING..."
                            : "CHANGE PHOTO"}
                        </button>

                        <button
                          type="button"
                          disabled={uploading}
                          onClick={savePhotoToDevice}
                          className={buttonOutline}
                        >
                          SAVE ↓
                        </button>

                        <button
                          type="button"
                          disabled={uploading}
                          onClick={removePhoto}
                          className="rounded-full px-4 py-3 text-[10px] text-[#A45E55] disabled:opacity-50"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.3rem] border border-dashed border-[#D6BFB8] bg-[#F8F1ED] px-5 py-8 text-center">
                      <p className="font-serif text-xl italic text-[#A77B73]">
                        no photo yet. ♡
                      </p>

                      <p className="mt-2 text-xs text-[#8C7770]">
                        A little moment worth remembering.
                      </p>

                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInput.current?.click()}
                        className={`${buttonPrimary} mt-5`}
                      >
                        {uploading
                          ? "UPLOADING..."
                          : "+ ADD PHOTO"}
                      </button>
                    </div>
                  )}

                  {photoError && (
                    <p
                      role="alert"
                      className="mt-3 text-center text-xs text-[#A45E55]"
                    >
                      {photoError}
                    </p>
                  )}
                </section>

                <div className="border-t border-[#EADDD7]" />

                

{/* MEASUREMENTS */}
<section>
  <div className="flex items-start justify-between gap-3">
    <div>
      <SmallLabel>02 · MEASUREMENTS</SmallLabel>
      <h3 className="mt-1.5 font-serif text-2xl italic text-[#30231F]">
        a little snapshot of you.
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#8C7770]">
        Your progress, recorded at your own pace. ♡
      </p>
    </div>

    {!editingMeasurements && (
      <button
        type="button"
        disabled={busy}
        onClick={() => setEditingMeasurements(true)}
        className="shrink-0 rounded-full border border-[#DCC6BF] px-3.5 py-2 text-[10px] font-medium tracking-[0.12em] text-[#805D55] transition hover:bg-[#F4E9E4] disabled:opacity-50"
      >
        {selectedMeasurement ? "EDIT" : "+ ADD"}
      </button>
    )}
  </div>

  {editingMeasurements ? (
    <div className="mt-4 rounded-[1.25rem] border border-[#EADDD7] bg-[#F8F1ED] p-4 sm:p-5">
      <div className="mb-4">
        <p className="font-serif text-lg italic text-[#805D55]">
          your measurements ♡
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#8C7770]">
          Leave any fields blank that you don't want to record.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MEASUREMENT_FIELDS.map((field) => (
          <label
            key={field}
            className="min-w-0 text-[10px] font-medium uppercase tracking-[0.1em] text-[#806E68]"
          >
            {field} ({measurementUnit(field)})

            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              disabled={busy}
              value={measurementForm[field]}
              placeholder="—"
              aria-label={`${field} in ${measurementUnit(field)}`}
              onChange={(event) =>
                setMeasurementForm((previous) => ({
                  ...previous,
                  [field]: event.target.value,
                }))
              }
              className="mt-2 w-full min-w-0 rounded-xl border border-[#DED0CB] bg-[#FFFCFA] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#30231F] outline-none transition placeholder:text-[#C4AEA7] focus:border-[#A77B73] focus:ring-2 focus:ring-[#A77B73]/15 disabled:opacity-50"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={busy}
          onClick={saveMeasurements}
          className={`${buttonPrimary} w-full justify-center sm:w-auto`}
        >
          {busy ? "SAVING..." : "SAVE MEASUREMENTS"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setMeasurementForm(
              Object.fromEntries(
                MEASUREMENT_FIELDS.map((field) => [
                  field,
                  selectedMeasurement?.[field] == null
                    ? ""
                    : String(selectedMeasurement[field]),
                ])
              ) as MeasurementForm
            );
            setEditingMeasurements(false);
            setDayError(null);
          }}
          className={`${buttonOutline} w-full justify-center sm:w-auto`}
        >
          CANCEL
        </button>

        {selectedMeasurement && (
          <button
            type="button"
            disabled={busy}
            onClick={deleteMeasurements}
            className="w-full rounded-full border border-[#E8D0CA] px-5 py-3 text-[10px] font-medium tracking-[0.12em] text-[#A45E55] transition hover:bg-[#F5E7E2] disabled:opacity-50 sm:ml-auto sm:w-auto"
          >
            DELETE RECORD
          </button>
        )}
      </div>
    </div>
  ) : selectedMeasurement &&
    MEASUREMENT_FIELDS.some(
      (field) =>
        selectedMeasurement[field] !== null &&
        selectedMeasurement[field] !== ""
    ) ? (
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {MEASUREMENT_FIELDS.filter(
        (field) =>
          selectedMeasurement[field] !== null &&
          selectedMeasurement[field] !== ""
      ).map((field) => (
        <button
          key={field}
          type="button"
          disabled={busy}
          onClick={() => setEditingMeasurements(true)}
          aria-label={`Edit ${field} measurement`}
          className="group min-w-0 rounded-xl border border-[#EADDD7] bg-[#F8F1ED] p-3.5 text-left transition hover:border-[#CBA9A2] hover:bg-[#F3E7E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A77B73] disabled:opacity-50 sm:p-4"
        >
          <div className="flex items-center justify-between gap-1">
            <SmallLabel>{field.toUpperCase()}</SmallLabel>
            <span className="text-xs text-[#B68D85] opacity-0 transition group-hover:opacity-100">
              ↗
            </span>
          </div>

          <p className="mt-2 break-words font-serif text-xl text-[#30231F]">
            {displayMeasurement(
              field,
              selectedMeasurement[field]
            )}
          </p>
        </button>
      ))}
    </div>
  ) : (
    <button
      type="button"
      disabled={busy}
      onClick={() => setEditingMeasurements(true)}
      className="mt-4 w-full rounded-[1.25rem] border border-dashed border-[#D6BFB8] bg-[#F8F1ED] px-4 py-6 text-center transition hover:border-[#CBA9A2] hover:bg-[#F3E7E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A77B73] disabled:opacity-50"
    >
      <span className="block font-serif text-xl italic text-[#A77B73]">
        nothing recorded yet. ♡
      </span>

      <span className="mt-2 block text-xs text-[#8C7770]">
        Add your measurements whenever you're ready.
      </span>

      <span className="mt-4 inline-flex items-center justify-center rounded-full border border-[#D6BFB8] bg-[#FFFCFA] px-4 py-2.5 text-[10px] font-medium tracking-[0.12em] text-[#805D55]">
        + ADD MEASUREMENTS
      </span>
    </button>
  )}
</section>



                <div className="border-t border-[#EADDD7]" />

                {/* LITTLE WINS FOR THIS DAY ONLY */}

                <section>
                  <SmallLabel>03 · LITTLE WINS</SmallLabel>

                  <h3 className="mt-2 font-serif text-2xl italic">
                    the little things count.
                  </h3>

                  {dayWins.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {dayWins.map((win) => (
                        <div
                          key={win.id}
                          className="flex items-center gap-3 rounded-xl bg-[#F8F1ED] px-4 py-3"
                        >
                          <span className="text-[#A77B73]">♡</span>
                          <span className="text-sm text-[#6F514B]">
                            {win.label ?? "A little win"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm italic text-[#8C7770]">
                      No little wins recorded for this day yet. ♡
                    </p>
                  )}

                  <p className="mt-3 text-xs text-[#9D6F67]">
                    Little Wins are added in the Little Wins section
                    below your calendar.
                  </p>
                </section>

                <div className="border-t border-[#EADDD7]" />

                {/* DAILY REFLECTION / STATUS */}

                <section>
                  <SmallLabel>04 · A LITTLE REFLECTION</SmallLabel>

                  <p className="mt-3 font-serif text-xl italic leading-relaxed text-[#A77B73]">
                    {selectedRow?.manually_completed
                      ? "you marked this day complete. ♡"
                      : selectedComplete
                        ? "you did everything you said you would. ♡"
                        : selectedCurrent
                          ? "the day isn't over yet. ♡"
                          : "part of the story, too. ♡"}
                  </p>

                  {selectedPast && selectedCount < 7 && (
                    <div className="mt-5 rounded-xl border border-[#EADDD7] bg-[#F8F1ED] p-4">
                      <SmallLabel>MISSED A CHECK-IN?</SmallLabel>

                      <p className="mt-2 text-xs leading-relaxed text-[#806E68]">
                        Finished your commitments but forgot to
                        check them off? You can mark this day
                        complete without changing the original
                        checklist.
                      </p>

                      {manualError && (
                        <p className="mt-3 text-xs text-[#A45E55]">
                          {manualError}
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setManualCompletion(
                            !selectedRow?.manually_completed
                          )
                        }
                        className={`${buttonPrimary} mt-4`}
                      >
                        {busy
                          ? "SAVING..."
                          : selectedRow?.manually_completed
                            ? "UNDO MANUAL COMPLETION"
                            : "MARK DAY COMPLETE"}
                      </button>
                    </div>
                  )}
                </section>

                <div className="border-t border-[#EADDD7] pt-2 text-center">
                  <p className="font-serif text-lg italic text-[#A77B73]">
                    one day at a time. ♡
                  </p>

                  <button
                    type="button"
                    onClick={closeDay}
                    className={`${buttonOutline} mt-4`}
                  >
                    CLOSE DAILY RECORD
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
