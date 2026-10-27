"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import { supabase } from "@/lib/supabase";
import { getActiveJourney } from "@/lib/active-journey";
import { workouts, type Workout } from "@/lib/workouts";
import DashboardSidebar from "@/components/DashboardSidebar";

type IconProps = {
  className?: string;
};



/* ---------------------------------
   WORKOUT TYPE ICONS
--------------------------------- */

function LowerBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      <path d="M8.5 8h7c2.5 1.5 4 3.7 4 6.3A7.5 7.5 0 0 1 12 21a7.5 7.5 0 0 1-7.5-6.7c0-2.6 1.5-4.8 4-6.3Z" />
      <path d="M9 8h6" />
    </svg>
  );
}

function GlutesIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5.5c-1.5 1.5-2.25 3.5-2.25 5.75 0 3.25 1.5 5.8 4.25 7.25" />
      <path d="M16 5.5c1.5 1.5 2.25 3.5 2.25 5.75 0 3.25-1.5 5.8-4.25 7.25" />
      <path d="M12 6v12" />
      <path d="M6 12c1.7.7 3.7.7 6 0" />
      <path d="M18 12c-1.7-.7-3.7-.7-6 0" />
    </svg>
  );
}

function FullBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5v6" />
      <path d="M7 9.5 12 8l5 1.5" />
      <path d="m12 12.5-3.5 6" />
      <path d="m12 12.5 3.5 6" />
    </svg>
  );
}

function UpperBodyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 8.5v7" />
      <path d="M4.5 10v4" />
      <path d="M2.5 11v2" />
      <path d="M16.5 8.5v7" />
      <path d="M19.5 10v4" />
      <path d="M21.5 11v2" />
      <path d="M7.5 12h9" />
    </svg>
  );
}

function CoreIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 5.5c1 1 2.1 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
      <path d="M8.5 5.5 7.5 18" />
      <path d="M15.5 5.5 16.5 18" />
      <path d="M7.5 18c2.8 1 6.2 1 9 0" />
      <path d="M12 7v11" />
      <path d="M9 10.5h6" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

function CardioIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 12h4l1.5-3.5 3 7 2.2-5 1.5 1.5h4.8" />
      <path d="M19 5.75A4.25 4.25 0 0 0 12 8.9a4.25 4.25 0 0 0-7-3.15" />
    </svg>
  );
}
function getWorkoutIcon(
  workout: Workout,
): ComponentType<IconProps> {
  const types = workout.types ?? [workout.type];

  if (types.includes("Glutes")) {
    return GlutesIcon;
  }

  if (types.includes("Lower Body")) {
    return LowerBodyIcon;
  }

  if (types.includes("Upper Body")) {
    return UpperBodyIcon;
  }

  if (types.includes("Core")) {
    return CoreIcon;
  }

  if (types.includes("Cardio")) {
    return CardioIcon;
  }

  return FullBodyIcon;
}
/* ---------------------------------
   EQUIPMENT ICONS
--------------------------------- */

function DumbbellIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 9v6" />
      <path d="M3.5 10.5v3" />
      <path d="M17.5 9v6" />
      <path d="M20.5 10.5v3" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

function HouseholdIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3.5 11 8.5-7 8.5 7" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function MatIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 6h11a3 3 0 0 1 3 3v8H8a3 3 0 0 1-3-3V6Z" />
      <path d="M8 17v2h11" />
      <path d="M8 10h8" />
    </svg>
  );
}

function BodyweightIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5v5" />
      <path d="M7 9.5 12 8l5 1.5" />
      <path d="m12 11.5-3 7" />
      <path d="m12 11.5 3 7" />
      <path d="M7.5 21h3" />
      <path d="M13.5 21h3" />
    </svg>
  );
}

function KettlebellIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2" />
      <path d="M6.5 9.5h11" />
      <path d="M7 9.5c-1 1.2-1.5 2.7-1.5 4.5 0 3.5 2.7 6 6.5 6s6.5-2.5 6.5-6c0-1.8-.5-3.3-1.5-4.5" />
      <path d="M9 7h6" />
    </svg>
  );
}

function BandIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 7c4 2 10 2 14 0" />
      <path d="M5 17c4-2 10-2 14 0" />
      <path d="M5 7c-2 2.5-2 7.5 0 10" />
      <path d="M19 7c2 2.5 2 7.5 0 10" />
    </svg>
  );
}

function MachineIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 19V7h9" />
      <path d="M15 7v5h4" />
      <path d="M9 19h10" />
      <path d="M4 19h2" />
      <path d="M9 7V4h4" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function getEquipmentIcon(
  equipment: string,
): ComponentType<IconProps> {
  const normalized = equipment.toUpperCase();

  if (normalized.includes("HOUSEHOLD")) {
    return HouseholdIcon;
  }

  if (normalized.includes("MAT")) {
    return MatIcon;
  }

  if (normalized.includes("BODYWEIGHT")) {
    return BodyweightIcon;
  }

  if (
    normalized.includes("GYM") ||
    normalized.includes("MACHINE")
  ) {
    return MachineIcon;
  }

  if (normalized.includes("BAND")) {
    return BandIcon;
  }

  if (normalized.includes("KETTLEBELL")) {
    return KettlebellIcon;
  }

  return DumbbellIcon;
}

/* ---------------------------------
   WORKOUT DETAIL ICONS
--------------------------------- */

function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v5l3 2" />
    </svg>
  );
}

function ExerciseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5.5 7 1.5 1.5L9.5 6" />
      <path d="M12 7h6.5" />
      <path d="m5.5 12 1.5 1.5 2.5-2.5" />
      <path d="M12 12h6.5" />
      <path d="m5.5 17 1.5 1.5 2.5-2.5" />
      <path d="M12 17h6.5" />
    </svg>
  );
}

/* ---------------------------------
   WORKOUT DATA
--------------------------------- */




const locations = [
  "All",
  "Home",
  "Gym",
  "No Equipment",
];

const types = [
  "All",
  "Full Body",
  "Lower Body",
  "Glutes",
  "Upper Body",
  "Core",
  "Cardio",
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ---------------------------------
   PAGE
--------------------------------- */

export default function WorkoutsPage() {

    const searchParams = useSearchParams();

  const isChangeMode =
    searchParams.get("mode") === "change";
    const replaceWorkoutId =
  searchParams.get("replace");

  const [firstName, setFirstName] =
    useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);
    const [activeJourneyId, setActiveJourneyId] =
  useState<string | null>(null);

  const [
    currentChallengeDay,
    setCurrentChallengeDay,
  ] = useState<number | null>(null);

  const [
    selectedWorkoutIds,
    setSelectedWorkoutIds,
  ] = useState<string[]>([]);

  const [location, setLocation] =
    useState("All");

  const [type, setType] =
    useState("All");

    const [expandedWorkoutId, setExpandedWorkoutId] =
  useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Could not load user:",
          userError,
        );
      }

      if (!user) {
        setIsLoadingUser(false);
        return;
      }

      setUserId(user.id);
      const activeJourney = await getActiveJourney();

setActiveJourneyId(
  activeJourney?.user_id === user.id &&
  activeJourney.status === "active"
    ? activeJourney.id
    : null
);

      const savedName =
        user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(
          user.email.split("@")[0],
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "challenge_start_date, challenge_length",
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Could not load profile:",
          profileError,
        );

        setIsLoadingUser(false);
        return;
      }

      if (!activeJourney?.start_date) {
  setIsLoadingUser(false);
  return;
}
     const challengeLength =
  activeJourney?.challenge_length ?? 75;

const startDate = new Date(
  `${activeJourney?.start_date}T00:00:00`,
);
      const today = new Date();

      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const differenceInDays =
        Math.floor(
          (today.getTime() -
            startDate.getTime()) /
            86400000,
        ) + 1;

      const calculatedDay = Math.min(
        Math.max(differenceInDays, 1),
        challengeLength,
      );

      setCurrentChallengeDay(
        calculatedDay,
      );

      const {
  data: savedProgress,
  error: progressError,
} = activeJourney?.id
  ? await supabase
      .from("daily_progress")
      .select("selected_workouts")
      .eq("user_id", user.id)
      .eq("journey_id", activeJourney.id)
      .eq("challenge_day", calculatedDay)
      .maybeSingle()
  : { data: null, error: null };

      if (progressError) {
        console.error(
          "Could not load today's workouts:",
          progressError,
        );
      } else {
        const savedWorkouts =
          Array.isArray(
            savedProgress?.selected_workouts,
          )
            ? savedProgress.selected_workouts
            : [];

        const savedIds = savedWorkouts
          .map(
            (item: { id?: unknown }) =>
              item?.id,
          )
          .filter(
            (id: unknown): id is string =>
              typeof id === "string",
          );

        setSelectedWorkoutIds(savedIds);
      }

      setIsLoadingUser(false);
    };

    getUser();
  }, []);

  const initial =
    !isLoadingUser &&
    firstName !== "there"
      ? firstName
          .charAt(0)
          .toUpperCase()
      : "♡";

  
const filteredWorkouts = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();

  return workouts.filter((workout) => {
    const locationMatch =
      location === "All" ||
      workout.locations.includes(location);

    const workoutTypes = Array.isArray(workout.types)
      ? workout.types
      : [workout.type];

    const typeMatch =
      type === "All" ||
      workoutTypes.includes(type);

    const searchMatch =
      !query ||
      workout.title.toLowerCase().includes(query) ||
      (workout.subtitle ?? "").toLowerCase().includes(query);

    return locationMatch && typeMatch && searchMatch;
  });
}, [location, type, searchQuery]);


  const saveSelectedWorkouts = async (
  workoutIds: string[],
  replacedWorkoutId?: string,
) => {
    if (
  !userId ||
  !activeJourneyId ||
  currentChallengeDay === null
) {
  return false;
}
  const { data: currentProgress } =
    await supabase
      .from("daily_progress")
      .select("selected_workouts, dismissed_guide_workouts")
      .eq("user_id", userId)
.eq("journey_id", activeJourneyId)
.eq("challenge_day", currentChallengeDay)
      .maybeSingle();

  const existingWorkouts =
    Array.isArray(
      currentProgress?.selected_workouts,
    )
      ? currentProgress.selected_workouts
      : [];

      const existingDismissedGuideWorkouts: string[] =
  Array.isArray(currentProgress?.dismissed_guide_workouts)
    ? currentProgress.dismissed_guide_workouts
    : [];

const dismissedGuideWorkouts = [
  ...existingDismissedGuideWorkouts,
];

if (
  replacedWorkoutId &&
  !dismissedGuideWorkouts.includes(replacedWorkoutId)
) {
  dismissedGuideWorkouts.push(replacedWorkoutId);
}
    const selectedWorkouts =
      workoutIds
        .map((id) =>
          workouts.find(
            (item) =>
              item.id === id,
          ),
        )
        .filter(
          (
            item,
          ): item is Workout =>
            Boolean(item),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          type: item.type,
          time: item.time,
          equipment: Array.isArray(
            item.equipment,
          )
            ? item.equipment.join(", ")
            : item.equipment,
            exercises: item.exercises,
source:
  existingWorkouts.find(
    (existing: { id?: string }) =>
      existing.id === item.id,
  )?.source === "guide"
    ? "guide"
    : "manual",
            
}));

const preservedCustomWorkouts = existingWorkouts.filter(
  (existing: { id?: string; source?: string }) =>
    (existing.source === "custom" ||
      existing.id?.startsWith("custom:")) &&
    existing.id !== replacedWorkoutId
);

const mergedWorkouts = [
  ...preservedCustomWorkouts,
  ...selectedWorkouts,
];

    const progressDate =
      formatLocalDate(new Date());

    const workoutChanges = {
  selected_workouts: mergedWorkouts,
  dismissed_guide_workouts: dismissedGuideWorkouts,
  updated_at: new Date().toISOString(),
};

const { error } = currentProgress
  ? await supabase
      .from("daily_progress")
      .update(workoutChanges)
      .eq("user_id", userId)
      .eq("journey_id", activeJourneyId)
      .eq("challenge_day", currentChallengeDay)
  : await supabase
      .from("daily_progress")
      .insert({
        user_id: userId,
        journey_id: activeJourneyId,
        challenge_day: currentChallengeDay,
        progress_date: progressDate,
        ...workoutChanges,
      });

    if (error) {
      console.error(
        "Could not save today's workouts:",
        error,
      );

      return false;
    }

    return true;
  };

  const chooseWorkoutForToday = async (
    workout: Workout,
  ) => {
    if (
      !userId ||
      currentChallengeDay === null
    ) {
      return;
    }

    if (
      selectedWorkoutIds.includes(
        workout.id,
      )
    ) {
      return;
    }

    const previousIds =
      selectedWorkoutIds;

    const nextIds =
  isChangeMode && replaceWorkoutId
    ? [
        ...previousIds.filter(
          (id) => id !== replaceWorkoutId
        ),
        workout.id,
      ]
    : [...previousIds, workout.id];

    setSelectedWorkoutIds(nextIds);

    const saved =
  await saveSelectedWorkouts(
    nextIds,
    isChangeMode ? replaceWorkoutId ?? undefined : undefined,
  );

    if (!saved) {
      setSelectedWorkoutIds(
        previousIds,
      );
    }
  };

  const removeWorkoutForToday = async (
    workoutId?: string,
  ) => {
    if (
      !userId ||
      currentChallengeDay === null
    ) {
      return;
    }

    const previousIds =
      selectedWorkoutIds;

    const nextIds = workoutId
      ? previousIds.filter(
          (id) => id !== workoutId,
        )
      : [];

    setSelectedWorkoutIds(nextIds);

    const saved = await saveSelectedWorkouts(
  nextIds,
  workoutId,
);

    if (!saved) {
      setSelectedWorkoutIds(
        previousIds,
      );
    }
  };
  const FilterButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[8px] tracking-[0.18em] transition ${
        active
          ? "border-[#A77B73] bg-[#EAD8D3] text-[#211C19]"
          : "border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#B9948B] hover:bg-[#F1E6E2]"
      }`}
    >
      {label.toUpperCase()}
    </button>
  );

  return (
    <main className="bg-[#F7F1ED] text-[#211C19]">
  <div className="mx-auto flex max-w-[1600px]">
        {/* DESKTOP SIDEBAR */}
        <DashboardSidebar
  initial={initial}
  firstName={firstName}
  isLoadingUser={isLoadingUser}
/>

        {/* MAIN */}
        <section className="min-w-0 flex-1">
          {/* DESKTOP TOP BAR */}
          <header className="hidden border-b border-[#E1D3CE] px-8 py-5 md:flex md:items-center md:justify-between lg:px-12">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                RESOURCES
              </p>

              <p className="mt-1 font-serif text-xl">
                Workout Library
              </p>
            </div>

            <Link
              href="/dashboard/account"
              aria-label="My account"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6C3BD] bg-[#EAD8D3] font-serif text-base"
            >
              {initial}
            </Link>
          </header>

          <section className="px-5 pb-20 pt-8 sm:px-7 md:px-8 md:pb-6 md:pt-10 lg:px-12">
           
{/* INTRO — COMPACT */}

<section className="border-b border-[#DED0CB] pb-5">
  <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
    THE WORKOUT LIBRARY
  </p>

  <h1 className="mt-2 font-serif text-3xl leading-tight text-[#211C19] sm:text-4xl">
    Pick your{" "}
    <span className="italic text-[#A77B73]">
      movement.
    </span>
  </h1>

  <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#806E68]">
    Find a workout that fits your body, your space, and your day. ♡
  </p>
</section>


            {/* FILTERS */}

            
{/* SEARCH WORKOUTS */}
<div className="relative mt-5">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A77B73]"
    aria-hidden="true"
  >
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>

  <input
    type="search"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search workouts..."
    aria-label="Search workouts"
    className="w-full rounded-[1rem] border border-[#DED0CB] bg-[#FBF8F6] py-3 pl-11 pr-4 text-[12px] text-[#211C19] outline-none transition placeholder:text-[#A99790] focus:border-[#A77B73]"
  />
</div>

          
{/* COMPACT DROPDOWN FILTERS */}
<section className="grid grid-cols-2 gap-3 py-5">
  {/* LOCATION */}
  <div>
    <label
      htmlFor="workout-location"
      className="mb-2 block text-[9px] tracking-[0.2em] text-[#9D6F67]"
    >
      LOCATION
    </label>

    <div className="relative">
      <select
        id="workout-location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        className="w-full appearance-none rounded-xl border border-[#DED0CB] bg-[#FBF8F6] py-3 pl-3 pr-9 text-[11px] text-[#211C19] outline-none focus:border-[#A77B73]"
      >
        {locations.map((item) => (
          <option key={item} value={item}>
            {item === "All" ? "All locations" : item}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#A77B73]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  </div>

  {/* FOCUS */}
  <div>
    <label
      htmlFor="workout-focus"
      className="mb-2 block text-[9px] tracking-[0.2em] text-[#9D6F67]"
    >
      FOCUS
    </label>

    <div className="relative">
      <select
        id="workout-focus"
        value={type}
        onChange={(event) => setType(event.target.value)}
        className="w-full appearance-none rounded-xl border border-[#DED0CB] bg-[#FBF8F6] py-3 pl-3 pr-9 text-[11px] text-[#211C19] outline-none focus:border-[#A77B73]"
      >
        {types.map((item) => (
          <option key={item} value={item}>
            {item === "All" ? "All muscle groups" : item}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#A77B73]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  </div>
</section>


{(searchQuery.trim() !== "" ||
  location !== "All" ||
  type !== "All") && (
  <div className="-mt-2 mb-5 flex justify-end">
    <button
      type="button"
      onClick={() => {
        setSearchQuery("");
        setLocation("All");
        setType("All");
      }}
      className="text-[10px] tracking-[0.12em] text-[#9D6F67] underline underline-offset-4 transition hover:text-[#211C19]"
    >
      CLEAR FILTERS ×
    </button>
  </div>
)}

        

           
{/* WORKOUTS */}
<section className="pb-4">

  {/* COMPACT SECTION HEADING */}
  <div className="mb-3 flex items-center justify-between gap-3">
    <p className="text-[9px] tracking-[0.25em] text-[#9D6F67]">
      EXPLORE WORKOUTS
    </p>

    <p className="text-[10px] text-[#A77B73]">
      {filteredWorkouts.length} workouts ♡
    </p>
  </div>

  {filteredWorkouts.length > 0 ? (
    <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
      {filteredWorkouts.map((workout, index) => {
        const Icon = getWorkoutIcon(workout);

        const isSelected = selectedWorkoutIds.includes(
          workout.id
        );

        const equipmentItems = Array.isArray(workout.equipment)
          ? workout.equipment
          : [workout.equipment];

        return (
          <article
            key={workout.id}
            className={`group flex flex-col rounded-[1rem] border bg-[#FBF8F6] p-3 transition duration-300 ${
              isSelected
                ? "border-[#A77B73]"
                : "border-[#DED0CB] hover:border-[#CBA9A2]"
            }`}
          >



{/* COMPACT WORKOUT HEADER */}
<button
  type="button"
  onClick={() =>
    setExpandedWorkoutId((current) =>
      current === workout.id ? null : workout.id
    )
  }
  aria-expanded={expandedWorkoutId === workout.id}
  className="flex w-full items-center gap-3 text-left"
>
  {/* WORKOUT ICON */}
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAD8D3] text-[#9D6F67]">
    <Icon className="h-5 w-5" />
  </div>

  {/* WORKOUT INFORMATION */}
  <div className="min-w-0 flex-1">
    <p className="text-[8px] tracking-[0.15em] text-[#9D6F67]">
      {workout.type.toUpperCase()}
    </p>

    <h2 className="mt-1 font-serif text-base leading-tight text-[#211C19]">
      {workout.title}
    </h2>

    <p className="mt-1 text-[10px] leading-4 text-[#927D76]">
      {workout.level} · {workout.time}
    </p>
  </div>


 {/* EXPAND / COLLAPSE */}
<span className="shrink-0 text-lg text-[#A77B73]">
  {expandedWorkoutId === workout.id ? "⌃" : "⌄"}
</span>
</button>



{expandedWorkoutId === workout.id && (
  <div className="mt-3 border-t border-[#E1D3CE] pt-3">

    {/* WORKOUT DETAILS */}
    <div className="grid grid-cols-3 gap-2">
      {/* TIME */}
      <div className="flex min-w-0 items-center gap-1.5">
        <ClockIcon className="h-3.5 w-3.5 shrink-0 text-[#B48A82]" />
        <span className="text-[9px] leading-4 text-[#806E68]">
          {workout.time}
        </span>
      </div>

      {/* EQUIPMENT */}
      <div className="flex min-w-0 flex-col gap-1">
        {equipmentItems.map((item) => {
          const EquipmentIcon = getEquipmentIcon(item);

          return (
            <div
              key={item}
              className="flex items-center gap-1"
            >
              <EquipmentIcon className="h-3.5 w-3.5 shrink-0 text-[#B48A82]" />
              <span className="text-[9px] leading-4 text-[#806E68]">
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {/* EXERCISES */}
      <div className="flex min-w-0 items-center justify-end gap-1.5">
        <ExerciseIcon className="h-3.5 w-3.5 shrink-0 text-[#B48A82]" />
        <span className="text-[9px] leading-4 text-[#806E68]">
          {workout.exercises}
        </span>
      </div>
    </div>

    {/* WORKOUT ACTIONS */}
    <div className="mt-4 grid gap-2">
      <button
        type="button"
        disabled={!userId || currentChallengeDay === null}
        onClick={() => {
          if (isSelected) {
            removeWorkoutForToday(workout.id);
          } else {
            chooseWorkoutForToday(workout);
          }
        }}
        className={`flex w-full items-center justify-center rounded-full border px-4 py-2.5 text-[9px] tracking-[0.18em] transition ${
          isSelected
            ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
            : "border-[#CBA9A2] text-[#9D6F67] hover:bg-[#EAD8D3]"
        } ${
          !userId || currentChallengeDay === null
            ? "cursor-wait opacity-60"
            : ""
        }`}
      >
        {isSelected ? "ADDED TO TODAY ✓" : "ADD TO TODAY"}
      </button>

      <Link
        href={
          [
            "lower-body-foundation",
            "cardio-lock-in",
            "core-control",
            "full-body-reset",
            "glute-builder",
            "gym-back-biceps",
            "gym-chest-triceps",
            "gym-glute-legs",
            "gym-machine-cardio",
            "home-back-biceps",
            "home-chest-triceps",
            "home-glute-legs",
            "upper-body-build",
          ].includes(workout.id)
            ? `/dashboard/resources/workouts/workout-preview?workout=${workout.id}`
            : `/dashboard/resources/workouts/${workout.id}`
        }
        className="flex items-center justify-between border-t border-[#E1D3CE] pt-3 text-[9px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
      >
        <span>VIEW WORKOUT</span>

        <span className="text-lg text-[#A77B73]">
          →
        </span>
      </Link>
    </div>
  </div>
)}


                        </article>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center">
                  <p className="font-serif text-3xl italic text-[#A77B73]">
                    nothing here yet. ♡
                  </p>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">
                    Try another combination —
                    we&apos;re still growing the
                    workout library.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setLocation("All");
                      setType("All");
                    }}
                    className="mt-6 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              )}
            </section>

           
          </section>
        </section>
      </div>
    </main>
  );
}