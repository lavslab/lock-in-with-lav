"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentChallengeDay } from "@/lib/challenge";
import { getActiveJourney } from "@/lib/active-journey";
import DashboardSidebar from "@/components/DashboardSidebar";
import { workouts } from "@/lib/workouts";

const commitments = [
  {
    number: "01",
    title: "MOVE",
    description: "45 min movement",
    column: "move",
  },
  {
    number: "02",
    title: "GET OUTSIDE",
    description: "Fresh air + outdoor movement",
    column: "get_outside",
  },
  {
    number: "03",
    title: "HYDRATE",
    description: "Stay hydrated",
    column: "hydrate",
  },
  {
    number: "04",
    title: "READ",
    description: "Read a few pages",
    column: "read",
  },
  {
    number: "05",
    title: "NOURISH",
    description: "Eat with intention",
    column: "nourish",
  },
  {
    number: "06",
    title: "DOCUMENT",
    description: "Progress photo",
    column: "document",
  },
  {
    number: "07",
    title: "NO ALCOHOL",
    description: "Stay alcohol-free",
    column: "no_alcohol",
  },
] as const;

type CommitmentColumn = (typeof commitments)[number]["column"];

type DailyProgress = {
  move: boolean;
  get_outside: boolean;
  hydrate: boolean;
  read: boolean;
  nourish: boolean;
  document: boolean;
  no_alcohol: boolean;
};

type CustomExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type SelectedWorkout = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  time: string;
  equipment: string;
  exercises: string | CustomExercise[];
  source?: "guide" | "manual" | "custom";
};

const emptyProgress: DailyProgress = {
  move: false,
  get_outside: false,
  hydrate: false,
  read: false,
  nourish: false,
  document: false,
  no_alcohol: false,
};

function formatDateForDatabase(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function WaterDrop({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="M12 2.6C12 2.6 5.7 10.05 5.7 15.05C5.7 18.55 8.52 21.35 12 21.35C15.48 21.35 18.3 18.55 18.3 15.05C18.3 10.05 12 2.6 12 2.6Z"
        fill={filled ? "#A77B73" : "#E5CCC6"}
      />
    </svg>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [progress, setProgress] =
    useState<DailyProgress>(emptyProgress);

  const [firstName, setFirstName] = useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [isLoadingProgress, setIsLoadingProgress] =
    useState(true);

    const [hasLoadedDashboard, setHasLoadedDashboard] =
  useState(false);

  const [userId, setUserId] = useState<string | null>(
    null
  );
const [activeJourneyId, setActiveJourneyId] =
  useState<string | null>(null);

  const [waterBottles, setWaterBottles] = useState(0);
  const [moveMinutes, setMoveMinutes] = useState(0);
  const [showMoveWorkouts, setShowMoveWorkouts] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
const [isCompletingJourney, setIsCompletingJourney] = useState(false);
const [completionError, setCompletionError] = useState<string | null>(null);
const [journeyCompleted, setJourneyCompleted] = useState(false);

  

  const [selectedWorkout, setSelectedWorkout] =
    useState<SelectedWorkout | null>(null);

  const [selectedWorkouts, setSelectedWorkouts] =
    useState<SelectedWorkout[]>([]);


    const [deletingActivityId, setDeletingActivityId] =
  useState<string | null>(null);
    const [manualActivities, setManualActivities] = useState<
  {
    id: string;
    activity_name: string;
    duration_minutes: number;
    calories_burned: number | null;
  }[]
>([]);

  const [challengeStartDate, setChallengeStartDate] =
    useState<string | null>(null);

  const [challengeLength, setChallengeLength] =
    useState(75);

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

  const currentDay = challengeStartDate
    ? getCurrentChallengeDay(
        challengeStartDate,
        challengeLength,
        today
      )
    : 1;

 
const isFinalChallengeDay =
  !!activeJourneyId &&
  !!challengeStartDate &&
  (() => {
    const [year, month, day] = challengeStartDate.split("-").map(Number);

    const elapsedDays = Math.floor(
      (
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
        Date.UTC(year, month - 1, day)
      ) / 86400000
    );

    return elapsedDays + 1 >= challengeLength;
  })();


    

  const dayNumber = String(currentDay).padStart(2, "0");

  const currentHour = today.getHours();

  let greeting = "good morning";

  if (currentHour >= 12 && currentHour < 17) {
    greeting = "good afternoon";
  } else if (currentHour >= 17) {
    greeting = "good evening";
  }

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoadingUser(true);
      setIsLoadingProgress(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Could not load user:",
          userError
        );
      }

      if (!user) {
        setIsLoadingUser(false);
setIsLoadingProgress(false);
setHasLoadedDashboard(true);
        return;
      }

      setUserId(user.id);

      // Automatically complete a challenge after its final day.
const { error: autoCompleteError } = await supabase.rpc(
  "auto_complete_my_challenge"
);

if (autoCompleteError) {
  console.error(
    "Could not automatically complete expired journey:",
    autoCompleteError
  );
}

const activeJourney = await getActiveJourney();

if (!autoCompleteError && !activeJourney) {
  const { data: profileCheck } = await supabase
    .from("profiles")
    .select("challenge_start_date")
    .eq("id", user.id)
    .single();

  if (!profileCheck?.challenge_start_date) {
    window.location.replace("/dashboard/journeys");
    return;
  }
}
setActiveJourneyId(
  activeJourney?.user_id === user.id &&
  activeJourney.status === "active"
    ? activeJourney.id
    : null
);
      const savedName = user.user_metadata?.name;

      if (savedName) {
        setFirstName(savedName);
      } else if (user.email) {
        setFirstName(user.email.split("@")[0]);
      }

      const {
  data: profile,
  error: profileError,
} = await supabase
  .from("profiles")
  .select("challenge_start_date, challenge_length")
  .eq("id", user.id)
  .single();

if (profileError) {
  console.error(
    "Could not load profile:",
    profileError
  );

  setIsLoadingUser(false);
  setIsLoadingProgress(false);
  return;
}

if (!profile?.challenge_start_date || !activeJourney) {
  setIsLoadingUser(false);
  setIsLoadingProgress(false);
  return;
}

const profileChallengeLength =
  profile.challenge_length ?? 75;

setChallengeStartDate(
  activeJourney?.start_date ?? profile.challenge_start_date
);

setChallengeLength(
  activeJourney?.challenge_length ?? profileChallengeLength
);


const calculatedDay =
  getCurrentChallengeDay(
    activeJourney?.start_date ?? profile.challenge_start_date,
    activeJourney?.challenge_length ?? profileChallengeLength
  );


  /*
 * GUIDE → TODAY WORKOUT SYNC
 *
 * The Guide is a repeating 7-day schedule:
 * Challenge Day 01 → Guide Day 01
 * Challenge Day 07 → Guide Day 07
 * Challenge Day 08 → Guide Day 01
 * etc.
 */
const guideDayNumber =
  calculatedDay > 0
    ? ((calculatedDay - 1) % 7) + 1
    : 0;

const guideDayId =
  guideDayNumber > 0
    ? String(guideDayNumber).padStart(2, "0")
    : "";

const {
  data: userTemplate,
  error: templateError,
} = await supabase
  .from("user_templates")
  .select("workouts")
  .eq("user_id", user.id)
  .maybeSingle();

if (templateError) {
  console.error(
    "Could not load Guide workout schedule:",
    templateError
  );
}

const guideWorkoutIds =
  userTemplate?.workouts &&
  typeof userTemplate.workouts === "object" &&
  Array.isArray(
    (
      userTemplate.workouts as Record<
        string,
        unknown
      >
    )[guideDayId]
  )
    ? ((
        userTemplate.workouts as Record<
          string,
          unknown
        >
      )[guideDayId] as string[])
    : [];

const scheduledGuideWorkouts: SelectedWorkout[] =
  guideWorkoutIds
    .map((workoutId) => {
      const workout = workouts.find(
        (item) => item.id === workoutId
      );

      if (!workout) {
        return null;
      }

      return {
        id: workout.id,
        title: workout.title,
        subtitle: workout.subtitle,
        type: workout.type,
        time: workout.time,
        equipment: Array.isArray(
          workout.equipment
        )
          ? workout.equipment.join(" + ")
          : workout.equipment,
        exercises: workout.exercises,
        source: "guide" as const,
      };
    })
    .filter(
      (workout): workout is NonNullable<typeof workout> =>
        workout !== null
    );

const {
  data: savedProgress,
  error: progressError,
} = await supabase
  .from("daily_progress")
  .select(
  "move, get_outside, hydrate, read, nourish, document, no_alcohol, water_bottles, selected_workouts, dismissed_guide_workouts"
)
 .eq("user_id", user.id)
.eq("journey_id", activeJourney?.id ?? "")
.eq("challenge_day", calculatedDay)
.maybeSingle();


  
/**
 * MOVE — COMPLETED WORKOUT MINUTES
 *
 * Sum completed workouts for the current challenge day.
 * Exclude workouts completed before this challenge started.
 */
let completedMoveMinutes = 0;
let moveGoalReached = false;

let manualMoveMinutes = 0;

if (
  activeJourney &&
  activeJourney.user_id === user.id &&
  activeJourney.status === "active" &&
  activeJourney.start_date === profile.challenge_start_date &&
  activeJourney.challenge_length === profileChallengeLength
) {
  const { data: manualActivities, error: manualError } =
    await supabase
      .from("movement_activities")
      .select("id, activity_name, duration_minutes, calories_burned")
      .eq("user_id", user.id)
      .eq("journey_id", activeJourney.id)
      .eq("challenge_day", calculatedDay);

 if (manualError) {
  console.error("Could not load manual movement:", manualError);
  setManualActivities([]);
} else {
  const savedActivities = manualActivities ?? [];

  setManualActivities(savedActivities);

  manualMoveMinutes = savedActivities.reduce(
    (total, activity) =>
      total + Math.max(0, activity.duration_minutes ?? 0),
    0
  );
}
}

const { data: completedWorkouts, error: workoutMinutesError } =
  await supabase
    .from("workout_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
.eq("journey_id", activeJourney?.id ?? "")
.eq("status", "completed")
.eq("challenge_day", calculatedDay)
    .gte(
  "completed_at",
  `${activeJourney?.start_date ?? profile.challenge_start_date}T00:00:00`
);
if (workoutMinutesError) {
  console.error(
    "Could not load completed workout minutes:",
    workoutMinutesError
  );
} else {
  completedMoveMinutes = (completedWorkouts ?? []).reduce(
    (total, session) =>
      total + Math.max(0, session.duration_minutes ?? 0),
    0
  );

const totalMoveMinutes = completedMoveMinutes + manualMoveMinutes;

setMoveMinutes(totalMoveMinutes);

moveGoalReached = totalMoveMinutes >= 45;

  if (activeJourney?.id && moveGoalReached && !savedProgress?.move) {
    const { error: moveUpdateError } = await supabase
      .from("daily_progress")
      .upsert(
        {
          user_id: user.id,
journey_id: activeJourney?.id,
challenge_day: calculatedDay,
          progress_date: formatDateForDatabase(new Date()),
          move: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "journey_id,challenge_day",
        }
      );

    if (moveUpdateError) {
      console.error(
        "Could not automatically complete MOVE:",
        moveUpdateError
      );
      moveGoalReached = false;
    }
  }
}

if (progressError) {
  console.error(
    "Could not load daily progress:",
    progressError
  );
} else if (savedProgress) {
  const savedWaterBottles =
    typeof savedProgress.water_bottles === "number"
      ? savedProgress.water_bottles
      : savedProgress.hydrate
        ? 8
        : 0;

  setWaterBottles(
    Math.min(
      Math.max(savedWaterBottles, 0),
      8
    )
  );

 const savedWorkouts: SelectedWorkout[] =
  Array.isArray(
    savedProgress.selected_workouts
  )
    ? savedProgress.selected_workouts
    : [];

const dismissedGuideWorkouts: string[] =
  Array.isArray(
    savedProgress.dismissed_guide_workouts
  )
    ? savedProgress.dismissed_guide_workouts
    : [];

/*
 * Keep manually chosen workouts.
 *
 * Older saved workouts may not have a source yet,
 * so keep those too rather than accidentally
 * deleting a user's existing selection.
 */
const savedNonGuideWorkouts =
  savedWorkouts.filter(
    (workout) => workout.source !== "guide"
  );

/*
 * Only bring in Guide workouts that the user
 * has NOT removed from Today.
 */
const activeGuideWorkouts =
  scheduledGuideWorkouts.filter(
    (workout) =>
      !dismissedGuideWorkouts.includes(
        workout.id
      )
  );

const mergedWorkouts = [
  ...savedNonGuideWorkouts,
  ...activeGuideWorkouts.filter(
    (guideWorkout) =>
      !savedNonGuideWorkouts.some(
        (savedWorkout) =>
          savedWorkout.id === guideWorkout.id
      )
  ),
];

setSelectedWorkouts(mergedWorkouts);

setSelectedWorkout(
  mergedWorkouts.length > 0
    ? mergedWorkouts[0]
    : null
);

/*
 * If the Guide added something new,
 * persist the merged list to today's
 * daily_progress row.
 */
const workoutsChanged =
  JSON.stringify(mergedWorkouts) !==
  JSON.stringify(savedWorkouts);

if (activeJourney?.id && workoutsChanged) {
  const { error: workoutSyncError } =
    await supabase

      .from("daily_progress")
      .update({
        selected_workouts:
          mergedWorkouts,
      })
      .eq("user_id", user.id)
.eq("journey_id", activeJourney?.id ?? "")
.eq("challenge_day", calculatedDay);

  if (workoutSyncError) {
    console.error(
      "Could not sync Guide workout to Today:",
      workoutSyncError
    );
  }
}

  setProgress({
  move: savedProgress.move || moveGoalReached,
    get_outside: savedProgress.get_outside,
    hydrate: savedProgress.hydrate,
    read: savedProgress.read,
    nourish: savedProgress.nourish,
    document: savedProgress.document,
    no_alcohol:
      savedProgress.no_alcohol ?? false,
  });
} else {
  setWaterBottles(0);


  // No daily_progress row exists yet for today.
  // Still show any workouts scheduled from The Guide.
  setSelectedWorkouts(scheduledGuideWorkouts);
setProgress({
  ...emptyProgress,
  move: moveGoalReached,
});

  setSelectedWorkout(
    scheduledGuideWorkouts.length > 0
      ? scheduledGuideWorkouts[0]
      : null

      
  );

  // If The Guide has a workout scheduled for today,
  // create today's progress row with that workout already selected.
  if (activeJourney?.id && scheduledGuideWorkouts.length > 0) {
    const { error: createProgressError } = await supabase
      .from("daily_progress")
      .upsert(
        {
          user_id: user.id,
journey_id: activeJourney.id,
challenge_day: calculatedDay,
          progress_date: new Date().toISOString().split("T")[0],
          selected_workouts: scheduledGuideWorkouts,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "journey_id,challenge_day",
        }
      );

    if (createProgressError) {
      console.error(
        "Could not create today's scheduled workout:",
        createProgressError
      );
    }
  }
}

      /*
       * A progress photo now completes the DOCUMENT
       * commitment automatically.
       *
       * We check the progress_photos table for the
       * current challenge day. This means the dashboard
       * will automatically recognize a saved photo.
       */

      const {
        data: progressPhoto,
        error: progressPhotoError,
      } = await supabase
        .from("progress_photos")
        .select("challenge_day")
        .eq("user_id", user.id)
.eq("journey_id", activeJourney?.id ?? "")
.eq("challenge_day", calculatedDay)
.eq("photo_type", "progress")
.maybeSingle();

      if (progressPhotoError) {
        console.error(
          "Could not load today's progress photo:",
          progressPhotoError
        );
      } else if (progressPhoto) {
        setProgress((previous) => ({
          ...previous,
          document: true,
        }));
      }

      setIsLoadingUser(false);
      setIsLoadingProgress(false);
    };

    loadDashboard();
  }, []);

  const toggleCommitment = async (

    column: CommitmentColumn
  ) => {
   if (
  !userId ||
  !activeJourneyId ||
  !challengeStartDate ||
  isLoadingProgress
) {
  return;
}

    const newValue = !progress[column];

    const updatedProgress = {
      ...progress,
      [column]: newValue,
    };

    setProgress(updatedProgress);

    const progressDate =
      formatDateForDatabase(today);

    const { error } = await supabase
      .from("daily_progress")
      .upsert(
        {
         user_id: userId,
journey_id: activeJourneyId,
challenge_day: currentDay,
          progress_date: progressDate,
          move: updatedProgress.move,
          get_outside:
            updatedProgress.get_outside,
          hydrate: updatedProgress.hydrate,
          read: updatedProgress.read,
          nourish: updatedProgress.nourish,
          document:
            updatedProgress.document,
          no_alcohol:
            updatedProgress.no_alcohol,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "journey_id,challenge_day",
        }
      );

    
    if (error) {
      console.error(
        "Could not save daily progress:",
        error
      );

      setProgress(progress);
      return;
    }

    const allCommitmentsComplete =
      updatedProgress.move &&
      updatedProgress.get_outside &&
      updatedProgress.hydrate &&
      updatedProgress.read &&
      updatedProgress.nourish &&
      updatedProgress.document &&
      updatedProgress.no_alcohol;

    if (
      isFinalChallengeDay &&
      allCommitmentsComplete &&
      !journeyCompleted
    ) {
      setShowCompletionModal(true);
    }
  };


  const updateWaterBottles = async (
  nextCount: number
) => {
  if (
  !userId ||
  !activeJourneyId ||
  !challengeStartDate ||
  isLoadingProgress
) {
  return;
}

  const clampedCount = Math.min(
    Math.max(nextCount, 0),
    8
  );

  const hydrateComplete =
    clampedCount === 8;

  const previousWaterBottles =
    waterBottles;

  const previousProgress =
    progress;

  const updatedProgress = {
    ...progress,
    hydrate: hydrateComplete,
  };

  setWaterBottles(clampedCount);
  setProgress(updatedProgress);

  const progressDate =
    formatDateForDatabase(today);

  const { error } = await supabase
    .from("daily_progress")
    .upsert(
      {
        user_id: userId,
journey_id: activeJourneyId,
challenge_day: currentDay,
        progress_date: progressDate,
        move: updatedProgress.move,
        get_outside:
          updatedProgress.get_outside,
        hydrate:
          updatedProgress.hydrate,
        read: updatedProgress.read,
        nourish:
          updatedProgress.nourish,
        document:
          updatedProgress.document,
        no_alcohol:
          updatedProgress.no_alcohol,
        water_bottles:
          clampedCount,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "journey_id,challenge_day",
      }
    );

  
  if (error) {
    console.error(
      "Could not save water progress:",
      error
    );

    setWaterBottles(previousWaterBottles);
    setProgress(previousProgress);
    return;
  }

  const allCommitmentsComplete =
    updatedProgress.move &&
    updatedProgress.get_outside &&
    updatedProgress.hydrate &&
    updatedProgress.read &&
    updatedProgress.nourish &&
    updatedProgress.document &&
    updatedProgress.no_alcohol;

  if (
    isFinalChallengeDay &&
    allCommitmentsComplete &&
    !journeyCompleted
  ) {
    setShowCompletionModal(true);
  }
};


  /**
   * REMOVE WORKOUT FROM TODAY
   *
   * Removes one individual workout from today's
   * selected_workouts list and saves the new list
   * back to daily_progress.
   */
  const removeWorkoutFromToday = async (
    workoutId: string
  ) => {
    if (
  !userId ||
  !activeJourneyId ||
  !challengeStartDate ||
  isLoadingProgress
) {
  return;
}

    const previousWorkouts = selectedWorkouts;

const workoutBeingRemoved =
  selectedWorkouts.find(
    (workout) => workout.id === workoutId
  );

const updatedWorkouts =
  selectedWorkouts.filter(
    (workout) => workout.id !== workoutId
  );

let dismissedGuideWorkouts: string[] = [];

if (workoutBeingRemoved?.source === "guide") {
  const { data: currentProgress } =
    await supabase
      .from("daily_progress")
      .select("dismissed_guide_workouts")
      .eq("user_id", userId)
.eq("journey_id", activeJourneyId)
.eq("challenge_day", currentDay)
.maybeSingle();


  const existingDismissed =
    Array.isArray(
      currentProgress?.dismissed_guide_workouts
    )
      ? currentProgress.dismissed_guide_workouts
      : [];

  dismissedGuideWorkouts = Array.from(
    new Set([
      ...existingDismissed,
      workoutId,
    ])
  );
}

    // Update the screen immediately.
    setSelectedWorkouts(updatedWorkouts);

    setSelectedWorkout(
      updatedWorkouts.length > 0
        ? updatedWorkouts[0]
        : null
    );

    const progressDate =
      formatDateForDatabase(today);

    const { error } = await supabase
      .from("daily_progress")
      .upsert(
        {
  user_id: userId,
journey_id: activeJourneyId,
challenge_day: currentDay,
  progress_date: progressDate,
  selected_workouts: updatedWorkouts,
  ...(workoutBeingRemoved?.source === "guide"
    ? {
        dismissed_guide_workouts:
          dismissedGuideWorkouts,
      }
    : {}),
  updated_at: new Date().toISOString(),
},
        {
          onConflict: "journey_id,challenge_day",
        }
      );

    if (error) {
      console.error(
        "Could not remove workout from Today:",
        error
      );

      // Put it back if Supabase failed.
      setSelectedWorkouts(previousWorkouts);

      setSelectedWorkout(
        previousWorkouts.length > 0
          ? previousWorkouts[0]
          : null
      );
    }
  };

  const deleteManualActivity = async (activityId: string) => {
  if (!userId || deletingActivityId) return;

  const activityToDelete = manualActivities.find(
    (activity) => activity.id === activityId
  );

  if (!activityToDelete) return;

  const confirmed = window.confirm(
    `Remove "${activityToDelete.activity_name}" from today's movement log?`
  );

  if (!confirmed) return;

  setDeletingActivityId(activityId);

  try {
    const { data: deletedActivity, error } = await supabase
      .from("movement_activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!deletedActivity) {
      throw new Error("Activity could not be deleted.");
    }

    const remainingActivities = manualActivities.filter(
      (activity) => activity.id !== activityId
    );

    const deletedMinutes = Math.max(
      0,
      activityToDelete.duration_minutes ?? 0
    );

    const updatedMinutes = Math.max(
      0,
      moveMinutes - deletedMinutes
    );

    setManualActivities(remainingActivities);
    setMoveMinutes(updatedMinutes);

    // Only automatically uncheck MOVE if it was completed
    // based on logged minutes and the total falls below 45.
    if (activeJourneyId && updatedMinutes < 45 && progress.move) {
      const { error: progressError } = await supabase
        .from("daily_progress")
        .update({
          move: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
.eq("journey_id", activeJourneyId ?? "")
.eq("challenge_day", currentDay);

      if (progressError) {
        console.error(
          "Could not update MOVE commitment:",
          progressError
        );
      } else {
        setProgress((previous) => ({
          ...previous,
          move: false,
        }));
      }
    }
  } catch (error) {
    console.error("Could not delete movement activity:", error);
    window.alert(
      "We couldn't remove this activity. Please try again."
    );
  } finally {
    setDeletingActivityId(null);
  }
};


const handleCompleteJourney = async () => {
  if (isCompletingJourney) return;

  setIsCompletingJourney(true);
  setCompletionError(null);

  try {
    const { data, error } = await supabase.rpc(
      "complete_my_challenge"
    );

    if (error) throw error;
    if (!data) throw new Error("Journey completion was not confirmed.");

    setJourneyCompleted(true);
    setShowCompletionModal(false);

    window.location.assign("/dashboard/journeys");
  } catch (error) {
    console.error("Unable to complete journey:", error);

    setCompletionError(
      "We couldn't complete your journey. Your progress is still saved. Please try again."
    );
  } finally {
    setIsCompletingJourney(false);
  }
};

  const completedCount =
    commitments.filter(
      (item) => progress[item.column]
    ).length;

  const percentage = Math.round(
    (completedCount /
      commitments.length) *
      100
  );

  const dayComplete =
    completedCount ===
    commitments.length;
if (!hasLoadedDashboard && (isLoadingUser || isLoadingProgress)) {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col items-center justify-center bg-[#F7F1ED] text-[#211C19]">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D6C3BD] bg-[#FBF8F6] font-serif text-4xl text-[#A77B73]">
          ♡
        </div>

        <p className="mt-6 text-[10px] tracking-[0.32em] text-[#9D6F67]">
          LOCKING IN
        </p>

        <p className="mt-3 font-serif text-xl italic text-[#A77B73]">
          loading your day... ♡
        </p>
      </div>
    </div>
  );
}


  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-6 md:px-10 lg:px-14">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] tracking-[0.3em] text-[#9D6F67]">
                {formattedDate}
              </p>

              <h1 className="mt-2 font-serif text-3xl leading-none sm:text-4xl">
                {greeting},{" "}
                <span className="italic text-[#A77B73]">
                  {firstName}. ♡
                </span>
              </h1>
            </div>
          </header>

          <section className="mt-5 rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] px-4 py-4 sm:px-7 sm:py-6">
  <button
    type="button"
    onClick={() => setShowDayDetails((previous) => !previous)}
    aria-expanded={showDayDetails}
    aria-controls="today-progress-details"
    className="flex w-full items-center justify-between gap-3 text-left"
  >
    <div className="min-w-0">
      <p className="text-[10px] tracking-[0.2em] text-[#9D6F67]">
        TODAY · DAY {dayNumber} OF {challengeLength}
      </p>

      <h2 className="mt-2 font-serif text-3xl leading-none text-[#211C19] sm:text-4xl">
        Day {dayNumber}
      </h2>
    </div>

    <div className="flex shrink-0 items-center gap-4">
      <div className="text-right">
        <p className="font-serif text-xl text-[#211C19]">
          {completedCount}/{commitments.length}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.12em] text-[#9D6F67]">
          COMPLETE
        </p>
      </div>

      <span
        aria-hidden="true"
        className="font-serif text-xl text-[#A77B73]"
      >
        {showDayDetails ? "⌃" : "⌄"}
      </span>
    </div>
  </button>

  <div
    role="progressbar"
    aria-label="Today's commitments completed"
    aria-valuemin={0}
    aria-valuemax={commitments.length}
    aria-valuenow={completedCount}
    className="mt-4 h-[4px] overflow-hidden rounded-full bg-[#E7DAD6]"
  >
    <div
      className="h-full rounded-full bg-[#A77B73] transition-all duration-500"
      style={{ width: `${percentage}%` }}
    />
  </div>

  <div
    id="today-progress-details"
    hidden={!showDayDetails}
  >
    {showDayDetails && (
      <div className="mt-4 border-t border-[#E7DAD6] pt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-[#9D6F67]">
              TODAY'S PROGRESS
            </p>
            <p className="mt-1 font-serif text-2xl text-[#211C19]">
              {percentage}%
            </p>
          </div>

          <p className="font-serif text-sm italic text-[#A77B73]">
            keep showing up. ♡
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.12em] text-[#9D6F67]">
            {dayComplete
              ? "ALL SEVEN COMPLETE ♡"
              : `${
                  commitments.length - completedCount
                } ${
                  commitments.length - completedCount === 1
                    ? "COMMITMENT"
                    : "COMMITMENTS"
                } LEFT TODAY`}
          </p>

          <Link
            href="/dashboard/journey"
            className="flex shrink-0 items-center gap-2 text-[10px] tracking-[0.12em] text-[#8F655E] transition hover:text-[#211C19]"
          >
            VIEW JOURNEY
            <span className="font-serif text-sm">→</span>
          </Link>
        </div>
      </div>
    )}
  </div>
</section>

          <section className="mt-10 md:mt-12">
            <div className="flex items-end justify-between gap-5 border-b border-[#DED0CB] pb-4">
              <div>
                <p className="text-[8px] tracking-[0.28em] text-[#9D6F67]">
                  DAILY PRACTICE
                </p>

                <h2 className="mt-2 font-serif text-3xl leading-none sm:text-4xl">
                  Today&apos;s{" "}
                  <span className="italic text-[#A77B73]">
                    commitments.
                  </span>
                </h2>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-serif text-lg italic text-[#A77B73]">
                  {completedCount}/
                  {commitments.length}
                </p>

                <p className="mt-0.5 text-[10px] tracking-[0.18em] text-[#9D6F67]">
                  COMPLETE
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
              {commitments.map((item) => {
                const isComplete =
                  progress[item.column];

                if (item.column === "hydrate") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 lg:col-span-2 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            updateWaterBottles(
                              isComplete ? 0 : 8
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Clear hydration progress"
                              : "Complete hydration goal"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isLoadingProgress
                              ? "cursor-wait opacity-70"
                              : "cursor-pointer hover:-translate-y-0.5"
                          } ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[9px] tracking-[0.18em]">
                                HYDRATE
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Stay hydrated
                              </p>
                            </div>

                            <p className="font-serif text-sm italic text-[#A77B73]">
                              {waterBottles}/8 bottles
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {Array.from({
                          length: 8,
                        }).map((_, index) => {
                          const filled =
                            index <
                            waterBottles;

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={
                                isLoadingProgress
                              }
                              onClick={() =>
                                updateWaterBottles(
                                  filled &&
                                  index ===
                                    waterBottles -
                                      1
                                    ? index
                                    : index + 1
                                )
                              }
                              aria-label={`Bottle ${
                                index + 1
                              } ${
                                filled
                                  ? "complete"
                                  : "incomplete"
                              }`}
                              className={`flex h-9 items-center justify-center rounded-lg border transition hover:-translate-y-0.5 ${
                                filled
                                  ? "border-[#C69C94] bg-[#E6C8C2]"
                                  : "border-[#E1D3CE] bg-[#F7F1ED]"
                              }`}
                            >
                              <WaterDrop
                                filled={filled}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-2.5 text-[7px] tracking-[0.17em] text-[#9D6F67]">
                        TAP AS YOU GO • EACH = 16 OZ
                      </p>
                    </div>
                  );
                }

                if (item.column === "move") {
                  return ( 
                    
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "move"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Move incomplete"
                              : "Mark Move complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73] hover:bg-[#F1E6E2]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                MOVE
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Your daily movement
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      
<div className="ml-[46px] mt-4">
  <div className="flex items-end justify-between gap-3">
    <div>
      <p className="font-serif text-xl text-[#211C19]">
        {moveMinutes}
        <span className="text-[#B79B95]"> / 45</span>
        <span className="ml-2 text-[9px] tracking-[0.16em] text-[#9D6F67]">
          MIN
        </span>
      </p>
    </div>

    <span className="text-right font-serif text-xs italic text-[#A77B73]">
      {moveMinutes >= 45
        ? "goal reached ♡"
        : moveMinutes > 0
          ? `${45 - moveMinutes} min to go ♡`
          : "every minute counts ♡"}
    </span>
  </div>

  <div
    role="progressbar"
    aria-label="Logged workout minutes toward daily MOVE goal"
    aria-valuemin={0}
    aria-valuemax={45}
    aria-valuenow={Math.min(moveMinutes, 45)}
    className="mt-3 h-[5px] overflow-hidden rounded-full bg-[#E7DAD6]"
  >
    <div
      className="h-full rounded-full bg-[#A77B73] transition-all duration-500"
      style={{
        width: `${Math.min(100, (moveMinutes / 45) * 100)}%`,
      }}
    />
  </div>

</div>
<button
  type="button"
  onClick={() => setShowMoveWorkouts((previous) => !previous)}
  aria-expanded={showMoveWorkouts}
  className="ml-[46px] mt-4 flex w-[calc(100%-46px)] items-center justify-between gap-3 border-t border-[#E1D3CE] pt-3 text-left"
>
  <span className="flex items-center gap-2">
    <span className="text-[10px] text-[#9D6F67]">♡</span>
    <span className="text-[10px] tracking-[0.08em] text-[#211C19]">
      Today's workouts
    </span>
    <span className="text-[9px] text-[#9D6F67]">
      {selectedWorkouts.length} selected
    </span>
  </span>
  <span className="text-sm text-[#9D6F67]">
    {showMoveWorkouts ? "⌃" : "⌄"}
  </span>
</button>

                      {showMoveWorkouts && (
  <div className="ml-[46px] mt-3 border-t border-[#E1D3CE] pt-3">

    {/* SELECTED WORKOUTS */}
    {selectedWorkouts.map((workout, index) => (
      <div
        key={workout.id}
        className={
          index > 0
            ? "mt-3 border-t border-[#E1D3CE] pt-3"
            : ""
        }
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] tracking-[0.15em] text-[#211C19]">
          <span>{workout.type.toUpperCase()}</span>
          <span>•</span>
          <span>{workout.time}</span>
          <span>•</span>
          <span>
  {Array.isArray(workout.exercises)
    ? `${workout.exercises.length} exercises`
    : workout.exercises}
</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <Link
           href={
  workout.source === "custom"
    ? `/dashboard/guide/custom-workout-preview?workout=${workout.id.replace(/^custom:/, "")}`
    : `/dashboard/resources/workouts/workout-preview?workout=${workout.id}`

}
            className="flex items-center gap-2 text-[7px] tracking-[0.18em] text-[#8F655E] transition hover:text-[#211C19]"
          >
            <span>OPEN {workout.title.toUpperCase()}</span>
            <span className="font-serif text-sm">→</span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
  <Link
    href={`/dashboard/resources/workouts?mode=change&replace=${encodeURIComponent(workout.id)}`}
    className="text-[7px] tracking-[0.16em] text-[#8F655E] transition hover:text-[#211C19]"
  >
    CHANGE
  </Link>

  <button
    type="button"
    onClick={() => removeWorkoutFromToday(workout.id)}
    className="text-[7px] tracking-[0.16em] text-[#B08A82] transition hover:text-[#211C19]"
  >
    REMOVE
  </button>
</div>
        </div>
      </div>
    ))}

    {/* MANUALLY LOGGED MOVEMENT */}
    {manualActivities.length > 0 && (
      <div
        className={
          selectedWorkouts.length > 0
            ? "mt-4 border-t border-[#E1D3CE] pt-3"
            : ""
        }
      >
        <p className="mb-3 text-[9px] tracking-[0.14em] text-[#9D6F67]">
          LOGGED MOVEMENT
        </p>

        {manualActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={
              index > 0
                ? "mt-3 border-t border-[#E1D3CE] pt-3"
                : ""
            }
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] tracking-[0.15em] text-[#211C19]">
  {activity.activity_name.toUpperCase()}
</p>
                <p className="mt-1 text-[9px] text-[#9D6F67]">
                  {activity.duration_minutes} min · Manually logged
                </p>
              </div>

              <button
  type="button"
  onClick={() => deleteManualActivity(activity.id)}
  disabled={deletingActivityId !== null}
  aria-label={`Remove ${activity.activity_name}`}
  className="shrink-0 text-[9px] tracking-[0.16em] text-[#B08A82] transition hover:text-[#211C19] disabled:cursor-not-allowed disabled:opacity-50"
>
  {deletingActivityId === activity.id ? "REMOVING..." : "REMOVE"}
</button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* WORKOUT ACTIONS */}
    {selectedWorkouts.length > 0 ? (
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#E1D3CE] pt-3">
        <span className="font-serif text-xs italic text-[#A77B73]">
          {selectedWorkouts.length}{" "}
          {selectedWorkouts.length === 1 ? "workout" : "workouts"}{" "}
          selected ♡
        </span>

        
      </div>
    ) : (
      <Link
        href="/dashboard/resources/workouts"
        className="mt-4 flex items-center justify-between border-t border-[#E1D3CE] pt-3 text-[7px] tracking-[0.18em] text-[#9D6F67]"
      >
        <span>FIND A WORKOUT</span>
        <span className="font-serif text-sm">→</span>
            </Link>
    )}
  </div>
)}
</div>
);
}

if (item.column === "nourish") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "nourish"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Nourish incomplete"
                              : "Mark Nourish complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73] hover:bg-[#F1E6E2]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                NOURISH
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Eat with intention
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/dashboard/resources/meal-plans"
                        className="ml-[46px] mt-3 flex items-center justify-between border-t border-[#E1D3CE] pt-2.5 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
                      >
                        <span>
                          GO TO MEAL PLAN
                        </span>

                        <span className="font-serif text-sm">
                          →
                        </span>
                      </Link>
                    </div>
                  );
                }

                /*
                 * DOCUMENT / PROGRESS PHOTO
                 *
                 * IMPORTANT:
                 * The check circle is now a real button.
                 *
                 * This means the DOCUMENT commitment can be
                 * manually checked/un-checked from TODAY,
                 * while the Progress page can still
                 * automatically set it to complete when
                 * a photo is uploaded.
                 */

                if (item.column === "document") {
                  return (
                    <div
                      key={item.number}
                      className={`rounded-[1.25rem] border px-4 py-4 transition duration-300 ${
                        isComplete
                          ? "border-[#CBA9A2] bg-[#EAD8D3]"
                          : "border-[#DED0CB] bg-[#FBF8F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={
                            isLoadingProgress
                          }
                          onClick={() =>
                            toggleCommitment(
                              "document"
                            )
                          }
                          aria-label={
                            isComplete
                              ? "Mark Document incomplete"
                              : "Mark Document complete"
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                            isLoadingProgress
                              ? "cursor-wait opacity-70"
                              : "cursor-pointer hover:-translate-y-0.5 hover:bg-[#F1E6E2]"
                          } ${
                            isComplete
                              ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                              : "border-[#CBA9A2] text-[#A77B73]"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : item.number}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] tracking-[0.18em]">
                                DOCUMENT
                              </p>

                              <p className="mt-1 text-[12px] text-[#8C7770]">
                                Progress photo
                              </p>
                            </div>

                            {isComplete && (
                              <span className="shrink-0 font-serif text-xs italic text-[#A77B73]">
                                done ♡
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
  href="/dashboard/journey?open=today"
  className="ml-[46px] mt-3 flex items-center justify-between border-t border-[#E1D3CE] pt-2.5 text-[7px] tracking-[0.18em] text-[#9D6F67] transition hover:text-[#211C19]"
>
  <span>
    {isComplete
      ? "UPDATE PROGRESS PHOTO"
      : "UPLOAD PROGRESS PHOTO"}
  </span>

  <span className="font-serif text-sm">
    →
  </span>
</Link>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.number}
                    type="button"
                    disabled={isLoadingProgress}
                    onClick={() =>
                      toggleCommitment(
                        item.column
                      )
                    }
                    className={`group flex w-full items-center gap-3.5 rounded-[1.25rem] border px-4 py-4 text-left transition duration-300 ${
                      isLoadingProgress
                        ? "cursor-wait opacity-70"
                        : "cursor-pointer"
                    } ${
                      isComplete
                        ? "border-[#CBA9A2] bg-[#EAD8D3]"
                        : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#CBA9A2]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-[11px] transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : "border-[#CBA9A2] text-[#A77B73]"
                      }`}
                    >
                      {isComplete
                        ? "✓"
                        : item.number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[9px] tracking-[0.18em] ${
                          isComplete
                            ? "text-[#6F514B]"
                            : "text-[#211C19]"
                        }`}
                      >
                        {item.title}
                      </span>

                      <span className="mt-1 block text-[12px] leading-4 text-[#8C7770]">
                        {item.description}
                      </span>
                    </span>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] transition ${
                        isComplete
                          ? "border-[#A77B73] bg-[#A77B73] text-[#F7F1ED]"
                          : "border-[#C9ADA7] group-hover:bg-[#F1E6E2]"
                      }`}
                    >
                      {isComplete ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>


        {/* DAILY COMPLETION — SMALL ACHIEVEMENT */}
{dayComplete && (
  <section className="mt-8 flex flex-col items-center text-center">
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#A77B73]">✓</span>
      <p className="text-[9px] uppercase tracking-[0.22em] text-[#9D6F67]">
        DAY {dayNumber} COMPLETE
      </p>
    </div>

    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#806E68]">
  You kept your promise to yourself.
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A77B73"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Locked in"
    role="img"
  >
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
</p>


  </section>
)}


{/* A NOTE FROM LAV — PERSONAL SIGN-OFF */}
<section
  className={`mb-5 text-center ${
    dayComplete
      ? "mt-5 border-t border-[#E4D5CE] pt-5"
      : "mt-8"
  }`}
>
  <p className="text-[9px] uppercase tracking-[0.2em] text-[#B49A91]">
    A NOTE FROM LAV:
  </p>

  <p className="mx-auto mt-2 max-w-xs font-serif text-sm italic leading-relaxed text-[#B9948B] sm:text-base">
    um... look at you showing up ready to lock in
    <br />
    proud of you ♡
  </p>
</section>

        </section>
      </div>


      

     

    
{showCompletionModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#211C19]/60 px-5 backdrop-blur-[3px]">
    <style>{`
      @keyframes lavCelebrationEnter {
        0% { opacity: 0; transform: translateY(18px) scale(.94); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes lavSparkle {
        0%, 100% { opacity: .35; transform: scale(.8) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.25) rotate(25deg); }
      }

      @keyframes lavGlow {
        0%, 100% { transform: scale(1); opacity: .45; }
        50% { transform: scale(1.15); opacity: .8; }
      }

      @media (prefers-reduced-motion: reduce) {
        .lav-celebration,
        .lav-sparkle,
        .lav-glow {
          animation: none !important;
        }
      }
    `}</style>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      className="lav-celebration relative w-full max-w-sm overflow-hidden rounded-[30px] border border-[#E9DAD2] bg-[#FBF8F6] px-7 pb-9 pt-10 text-center shadow-2xl"
      style={{
        animation: "lavCelebrationEnter .65s ease-out both",
      }}
    >
      {/* Decorative sparkles */}
      <span
        aria-hidden="true"
        className="lav-sparkle absolute left-8 top-10 text-xl text-[#C5A477]"
        style={{ animation: "lavSparkle 2.5s ease-in-out infinite" }}
      >
        ✦
      </span>

      <span
        aria-hidden="true"
        className="lav-sparkle absolute right-9 top-16 text-sm text-[#C5A477]"
        style={{
          animation: "lavSparkle 2.2s ease-in-out .4s infinite",
        }}
      >
        ✧
      </span>

      <span
        aria-hidden="true"
        className="lav-sparkle absolute bottom-28 left-7 text-sm text-[#C5A477]"
        style={{
          animation: "lavSparkle 2.8s ease-in-out .8s infinite",
        }}
      >
        ✧
      </span>

      <span
        aria-hidden="true"
        className="lav-sparkle absolute bottom-32 right-7 text-lg text-[#C5A477]"
        style={{
          animation: "lavSparkle 2.6s ease-in-out .2s infinite",
        }}
      >
        ✦
      </span>

      {/* Glowing heart */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <div
          aria-hidden="true"
          className="lav-glow absolute inset-0 rounded-full bg-[#EAD5CC]"
          style={{ animation: "lavGlow 3s ease-in-out infinite" }}
        />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#D8BEB3] bg-[#F6EBE5]">
          <span className="font-serif text-4xl text-[#A77B73]">
            ♡
          </span>
        </div>
      </div>

      <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#A77B73]">
        YOU STAYED LOCKED IN
      </p>

      <h2
        id="completion-title"
        className="font-serif text-[42px] leading-tight text-[#211C19]"
      >
        You did it !
      </h2>

      {/* Personalized challenge length */}
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E5D2C7] bg-[#F6ECE6] px-4 py-2">
        <span className="text-[#B99A6B]">✦</span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9D746B]">
          {challengeLength} Days Completed
        </span>

        <span className="text-[#B99A6B]">✦</span>
      </div>

      <p className="mx-auto mt-6 max-w-[260px] text-sm leading-6 text-[#806E68]">
  You should be so proud of yourself !
  <span className="mt-2 block">
    Take a moment to appreciate how far you've come.
  </span>
</p>

     <p className="mt-5 font-serif text-lg italic text-[#A77B73]">
  I'm so proud of you. ♡
  <span className="mt-1 block text-sm not-italic">
    — Lav
  </span>
</p>

      <div className="mx-auto mt-6 h-px w-14 bg-[#DFC9BE]" />

      <button
        type="button"
        onClick={handleCompleteJourney}
disabled={isCompletingJourney}
        className="mt-7 w-full rounded-full bg-[#A77B73] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#946960]"
      >
        {isCompletingJourney ? "Saving your journey..." : "Complete my journey ♡"}
      </button>
      
{completionError && (
  <p
    role="alert"
    className="mt-3 text-center text-sm leading-relaxed text-[#A04D4D]"
  >
    {completionError}
  </p>
)}


      <p className="mt-4 text-[10px] tracking-wide text-[#A18C83]">
        A moment worth celebrating.
      </p>
    </div>
  </div>
)}


    </main>
  );
}
