"use client";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import DashboardSidebar from "@/components/DashboardSidebar";
import LockInLoader from "@/components/LockInLoader";
import { useSearchParams } from "next/navigation";
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
  const [hasLoadedJourney, setHasLoadedJourney] = useState(false);

  const [activeJourneyId, setActiveJourneyId] =
    useState<string | null>(null);
  const [startString, setStartString] =
    useState<string | null>(null);
  const [length, setLength] = useState(0);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [photos, setPhotos] = useState<Record<number, Photo>>({});
  const [photoUrls, setPhotoUrls] =
    useState<Record<number, string>>({});
  const [calendarWeek, setCalendarWeek] = useState(0);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

const searchParams = useSearchParams();
const openToday = searchParams.get("open") === "today";
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
  setHasLoadedJourney(true);
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
  const currentWeekIndex =
  safeCurrentDay > 0
    ? Math.floor((safeCurrentDay - 1) / 7)
    : 0;
const totalWeeks = Math.max(1, Math.ceil(length / 7));
const displayedWeek = Math.min(
  Math.max(currentWeekIndex + calendarWeek, 0),
  totalWeeks - 1
);
const weekStartDay = displayedWeek * 7 + 1;
const weekDays = Array.from({ length: 7 }, (_, index) => {
  const challengeDay = weekStartDay + index;
  return {
    challengeDay,
    date: startDate
      ? dateForDay(startDate, challengeDay)
      : null,
    valid: challengeDay <= length,
  };
});
// Full journey keeps the same photo, completion and date information as the weekly view.
const fullJourneyDays = Array.from({ length: length }, (_, index) => {
  const challengeDay = index + 1;
  return {
    challengeDay,
    date: startDate ? dateForDay(startDate, challengeDay) : null,
    valid: true,
  };
});
const visibleDays = showFullCalendar ? fullJourneyDays : weekDays;
const firstWeekDate = weekDays[0]?.date;
const lastWeekDate =
  weekDays.filter((day) => day.valid).at(-1)?.date ?? null;
const weekDateLabel =
  firstWeekDate && lastWeekDate
    ? `${firstWeekDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${lastWeekDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : "Your journey";
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

useEffect(() => {
  if (
    !openToday ||
    !activeJourneyId ||
    safeCurrentDay < 1
  ) {
    return;
  }

  setSelectedDay(safeCurrentDay);
  void loadDay(safeCurrentDay);
}, [openToday, activeJourneyId, safeCurrentDay]);

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

  if (!hasLoadedJourney && loading) {
  return <LockInLoader message="loading your journey... ♡" />;
}

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar firstName={firstName} initial={loading ? "♡" : firstName.charAt(0).toUpperCase()} isLoadingUser={loading} />
        <section className="min-w-0 flex-1 px-4 pb-20 pt-7 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <header className="border-b border-[#DED0CB] pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <SmallLabel>THE LOCK IN EDIT</SmallLabel>
                  <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#211C19] sm:text-4xl">
                    The days you <span className="italic text-[#A77B73]">locked in.</span>
                  </h1>

                  <p className="mt-2 text-[10px] tracking-[0.12em] text-[#A77B73]">
  DAY {safeCurrentDay} OF {length}
</p>
                </div>
               
              </div>
            </header>

            
            <section className="mt-9" id="daily-log">
              {activeJourneyId && (
                <div className="mb-3 flex items-end justify-between gap-3">
 

  <button
    type="button"
    onClick={() => setShowFullCalendar((previous) => !previous)}
    aria-expanded={showFullCalendar}
    className="shrink-0 text-[9px] tracking-[0.1em] text-[#A77B73]"
  >
    {showFullCalendar ? "WEEK VIEW ↑" : "VIEW FULL CALENDAR→"}
  </button>
</div>
              )}
              <div className="rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-3 sm:p-5">
                {loading ? <p className="py-12 text-center font-serif italic text-[#A77B73]">Gathering your journey... ♡</p> : !activeJourneyId ? (
                  <div className="py-12 text-center"><p className="font-serif text-xl italic text-[#A77B73]">Your journey begins here. ♡</p><p className="mt-2 text-xs text-[#8C7770]">Your calendar will appear when your challenge begins.</p></div>
                ) : <>
                  <div className="mb-4 flex items-center justify-between gap-3 pb-2">
                    <button type="button" disabled={showFullCalendar || displayedWeek === 0} onClick={() => setCalendarWeek((v) => v - 1)} aria-label="Previous week" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADDD7] bg-[#FFFCFA] text-[#A77B73] disabled:opacity-25">←</button>
                    <div className="text-center"><SmallLabel>{showFullCalendar ? "YOUR FULL JOURNEY" : `WEEK ${String(displayedWeek + 1).padStart(2, "0")}`}</SmallLabel><p className="mt-1 font-serif text-base italic text-[#806D65]">{showFullCalendar ? `All ${length} days · tap to open a record` : weekDateLabel}</p></div>
                    <button type="button" disabled={showFullCalendar || displayedWeek >= totalWeeks - 1} onClick={() => setCalendarWeek((v) => v + 1)} aria-label="Next week" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADDD7] bg-[#FFFCFA] text-[#A77B73] disabled:opacity-25">→</button>
                  </div>
                  <div
  className={`grid gap-2 sm:gap-3 ${
    showFullCalendar
      ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"
      : "grid-cols-7"
  }`}
>
                    {visibleDays.map(({ challengeDay, date, valid }) => {
                      const record = progress.find((item) => item.challenge_day === challengeDay);
                      const done = complete(record);
                      const today = challengeDay === safeCurrentDay;
                      const future = challengeDay > safeCurrentDay;
                      const image = photoUrls[challengeDay];
                      return <button key={challengeDay} type="button" disabled={!valid || future} onClick={() => openDay(challengeDay)} aria-label={`Open day ${challengeDay}${done ? ", complete" : ""}`}
                        className={`group relative flex min-h-[62px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[11px] border px-0.5 py-1.5 transition sm:min-h-[78px] ${showFullCalendar ? "min-h-[105px] sm:min-h-[150px]" : ""} ${!valid ? "border-transparent opacity-0" : future ? "border-[#EADDD7] bg-[#F8F2EF] text-[#BDA9A2]" : done ? "border-[#CBAAA1] bg-[#F1E2DD] text-[#805D55] hover:border-[#A77B73]" : "border-[#E7DAD5] bg-[#FFFCFA] text-[#805D55] hover:border-[#A77B73]"} ${today ? "ring-1 ring-[#A77B73] ring-offset-1 ring-offset-[#FBF8F6]" : ""}`}>
                        {image && valid && <><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-0 bg-[#211C19]/45" /></>}
                        <span className={`relative z-10 text-[7px] uppercase tracking-[0.02em] sm:text-[9px] ${image ? "text-white" : "text-[#A77B73]"}`}>{date?.toLocaleDateString("en-US", { weekday: "short" }) ?? "—"}</span>
                        <span className={`relative z-10 mt-0.5 font-serif text-base sm:text-xl ${image ? "text-white" : ""}`}>{date?.getDate() ?? "—"}</span>
                        <span className={`relative z-10 mt-0.5 text-[6px] tracking-normal sm:text-[8px] ${image ? "text-white" : "text-[#9D6F67]"}`}>{today ? "TODAY" : `DAY ${String(challengeDay).padStart(2, "0")}`}</span>
                        {done && <span className="absolute right-0.5 top-0.5 z-20 flex h-3 w-3 items-center justify-center rounded-full bg-[#A77B73] text-[8px] text-white sm:right-1 sm:top-1">✓</span>}
                      </button>;
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#EADDD7] pt-3 text-[9px] text-[#8C7770]">
                    <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#A77B73]" />Complete</span>
                    <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full border border-[#A77B73]" />Today</span>
                    <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#EADDD7]" />Upcoming</span>
                  </div>
                </>}
              </div>
            </section>


{/* A subtle invitation to update today's progress */}
{activeJourneyId && !loading && (
  <button
    type="button"
    onClick={() => openDay(safeCurrentDay)}
    className="group mt-4 flex w-full items-center justify-between gap-3 py-2 text-left"
  >
    <div>
      <p className="font-serif text-[17px] italic text-[#A77B73]">
        A moment for yourself. ♡
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#8C7770]">
        Add a photo, update your measurements, or reflect on your day.
      </p>
    </div>

    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D6BFB8] text-[#A77B73] transition group-hover:bg-[#F1E2DD]">
      →
    </span>
  </button>
)}
            
            <section className="mt-10 border-t border-[#DED0CB] pt-7" id="reflections">
              <div className="mb-4">
                <SmallLabel>BEYOND THE DAILY LOG</SmallLabel>
                <h2 className="mt-2 font-serif text-2xl text-[#211C19] sm:text-3xl">
                  The little things <span className="italic text-[#A77B73]">add up.</span> ♡
                </h2>
              </div>
              <div className="rounded-[1.5rem] border border-[#E3D3CD] bg-[#FFFCFA] p-4 sm:p-6"><JourneyProgressSections /></div>
            </section>
            {dayError && selectedDay === null && <p role="alert" className="mt-5 text-sm text-[#A45E55]">{dayError}</p>}
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
            className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[1.3rem] border border-[#D8C5BF] bg-[#FFFCFA] shadow-xl"
          >
            <button
              type="button"
              onClick={closeDay}
              aria-label="Close daily record"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D8D3] bg-[#FFFCFA] text-xl text-[#805D55]"
            >
              ×
            </button>
                        {/* COMPACT DAY HEADER */}
            <header className="border-b border-[#EADDD7] px-5 pb-4 pt-5 sm:px-7">
              <p className="text-[9px] tracking-[0.2em] text-[#A77B73]">DAILY RECORD · DAY {String(selectedDay).padStart(2, "0")}</p>
              <h2 className="mt-2 pr-10 font-serif text-2xl text-[#30231F] sm:text-3xl">
                {selectedDate ? fullDate(selectedDate) : `Day ${selectedDay}`}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#9D6F67]">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedComplete ? "bg-[#A77B73]" : "bg-[#D8C5BF]"}`} />
                  {selectedComplete ? "Day complete" : selectedCurrent ? "In progress" : "Not completed"}
                </span>
                <span>·</span>
                <span>{selectedCount} / 7 commitments</span>
              </div>
            </header>
            {dayLoading ? (
              <div className="px-6 py-16 text-center font-serif text-xl italic text-[#A77B73]">
                opening your day... ♡
              </div>
            ) : (
              <div className="space-y-4 px-5 py-5 sm:px-7">
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
                  <h3 className="mt-1 font-serif text-lg italic">
                  
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
                     <div className="flex justify-center">
  <img
    src={selectedPhotoUrl}
    alt={`Progress photo for Day ${selectedDay}`}
    className="block h-auto max-h-[420px] w-auto max-w-full rounded-lg object-contain"
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
{/* MEASUREMENTS — compact when not editing */}
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <SmallLabel>02 · MEASUREMENTS</SmallLabel>
                        <h3 className="mt-1 font-serif text-lg italic text-[#30231F]">
                          
                        </h3>
                      </div>
                      {!editingMeasurements && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditingMeasurements(true)}
                          className="shrink-0 rounded-full border border-[#DCC6BF] px-3.5 py-2 text-[10px] tracking-[0.12em] text-[#805D55] transition hover:bg-[#F4E9E4] disabled:opacity-50"
                        >
                          {selectedMeasurement ? "EDIT →" : "+ ADD"}
                        </button>
                      )}
                    </div>
                    {editingMeasurements ? (
                      <div className="mt-4 rounded-[1.15rem] border border-[#EADDD7] bg-[#F8F1ED] p-4">
                        <p className="mb-3 text-xs text-[#8C7770]">
                          Only fill in what you'd like to track. ♡
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {MEASUREMENT_FIELDS.map((field) => (
                            <label key={field} className="min-w-0 text-[10px] uppercase tracking-[0.1em] text-[#806E68]">
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
                                onChange={(event) => setMeasurementForm((previous) => ({ ...previous, [field]: event.target.value }))}
                                className="mt-2 w-full min-w-0 rounded-xl border border-[#DED0CB] bg-[#FFFCFA] px-3 py-3 text-sm normal-case tracking-normal text-[#30231F] outline-none focus:border-[#A77B73] disabled:opacity-50"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" disabled={busy} onClick={saveMeasurements} className={buttonPrimary}>
                            {busy ? "SAVING..." : "SAVE MEASUREMENTS"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setMeasurementForm(Object.fromEntries(MEASUREMENT_FIELDS.map((field) => [field, selectedMeasurement?.[field] == null ? "" : String(selectedMeasurement[field])])) as MeasurementForm);
                              setEditingMeasurements(false);
                              setDayError(null);
                            }}
                            className={buttonOutline}
                          >
                            CANCEL
                          </button>
                          {selectedMeasurement && (
                            <button type="button" disabled={busy} onClick={deleteMeasurements} className="rounded-full px-3 py-3 text-[10px] text-[#A45E55] disabled:opacity-50">
                              DELETE
                            </button>
                          )}
                        </div>
                      </div>
                    ) : selectedMeasurement && MEASUREMENT_FIELDS.some((field) => selectedMeasurement[field] !== null && selectedMeasurement[field] !== "") ? (
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                        {MEASUREMENT_FIELDS.filter((field) => selectedMeasurement[field] !== null && selectedMeasurement[field] !== "").map((field) => (
                          <div key={field} className="min-w-[75px]">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-[#9D6F67]">{field}</p>
                            <p className="mt-1 font-serif text-lg text-[#30231F]">{displayMeasurement(field, selectedMeasurement[field])}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs italic text-[#9D827A]">No measurements recorded ♡</p>
                    )}
                  </section>
                <div className="border-t border-[#EADDD7]" />
                {/* LITTLE WINS FOR THIS DAY ONLY */}
                <section>
                  <SmallLabel>03 · THE GOOD STUFF</SmallLabel>
                  <h3 className="mt-1 font-serif text-lg italic">
             
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
                      No little wins recorded for this day. ♡
                    </p>
                  )}
                </section>
                  {/* OPTIONAL MANUAL COMPLETION FOR PAST DAYS */}
                  {selectedPast && selectedCount < 7 && (
                    <section>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <SmallLabel>MISSED A CHECK-IN?</SmallLabel>
                          <p className="mt-1 text-xs leading-relaxed text-[#8C7770]">
                            Completed your commitments but forgot to check them off?
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setManualCompletion(!selectedRow?.manually_completed)}
                          className="shrink-0 rounded-full border border-[#D6BFB8] px-3 py-2 text-[9px] tracking-[0.08em] text-[#805D55] disabled:opacity-50"
                        >
                          {busy ? "SAVING..." : selectedRow?.manually_completed ? "UNDO" : "MARK COMPLETE"}
                        </button>
                      </div>
                      {manualError && <p role="alert" className="mt-2 text-xs text-[#A45E55]">{manualError}</p>}
                    </section>
                  )}
                <div className="border-t border-[#EADDD7] pt-3 text-center">
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
