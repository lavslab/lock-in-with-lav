
"use client";

import {
  trainingMethods,
  type TrainingMethodId,
} from "@/lib/training-methods";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";
import MovementLogger from "@/components/MovementLogger";

/* ---------------------------------
   TRAINING TYPES
--------------------------------- */

type Workout = {
  id: string;
  title: string;
  href: string;
  meta: string;
};

type TrainingDay = {
  day: string;
  title: string;
  focus: string;
  description: string;
  workouts: Workout[];
};

type CalendarDay = {
  date: string;
  weekday: string;
  fullWeekday: string;
  dayNumber: number;
  challengeDay: number;
  trainingDay: string;
  isToday: boolean;
};

/* ---------------------------------
   WORKOUT ROUTES
--------------------------------- */

const workoutPreviewUrl = (id: string) =>
  `/dashboard/resources/workouts/workout-preview?workout=${id}`;

/* ---------------------------------
   WEEKLY TRAINING SCHEDULE
--------------------------------- */

const trainingWeek: TrainingDay[] = [
  {
    day: "01",
    title: "LOWER BODY",
    focus: "Glutes + Quads",
    description:
      "Choose the lower-body session that fits your day.",
    workouts: [
      {
        id: "lower-body-foundation",
        title: "Lower Body Foundation",
        href: workoutPreviewUrl("lower-body-foundation"),
        meta: "BEGINNER • 35 MIN",
      },
      {
        id: "home-glute-legs",
        title: "Home Glute & Legs",
        href: workoutPreviewUrl("home-glute-legs"),
        meta: "HOME • 35 MIN",
      },
      {
        id: "gym-glute-legs",
        title: "Gym Glute & Legs",
        href: workoutPreviewUrl("gym-glute-legs"),
        meta: "GYM • 45 MIN",
      },
      {
        id: "glute-builder",
        title: "Glute Builder",
        href: workoutPreviewUrl("glute-builder"),
        meta: "HOME / GYM • 40 MIN",
      },
    ],
  },
  {
    day: "02",
    title: "UPPER BODY",
    focus: "Back + Arms + Posture",
    description:
      "Pick the upper-body focus that feels right for you today.",
    workouts: [
      {
        id: "home-back-biceps",
        title: "Home Back & Biceps",
        href: workoutPreviewUrl("home-back-biceps"),
        meta: "HOME • 35 MIN",
      },
      {
        id: "home-chest-triceps",
        title: "Home Chest & Triceps",
        href: workoutPreviewUrl("home-chest-triceps"),
        meta: "HOME • 35 MIN",
      },
      {
        id: "gym-back-biceps",
        title: "Gym Back & Biceps",
        href: workoutPreviewUrl("gym-back-biceps"),
        meta: "GYM • 40 MIN",
      },
      {
        id: "gym-chest-triceps",
        title: "Gym Chest & Triceps",
        href: workoutPreviewUrl("gym-chest-triceps"),
        meta: "GYM • 40 MIN",
      },
      {
        id: "upper-body-build",
        title: "Upper Body Build",
        href: workoutPreviewUrl("upper-body-build"),
        meta: "HOME / GYM • 45 MIN",
      },
    ],
  },
  {
    day: "03",
    title: "CORE + MOBILITY",
    focus: "Control + Stability",
    description:
      "Keep the focus controlled and intentional.",
    workouts: [
      {
        id: "core-control",
        title: "Core Control",
        href: workoutPreviewUrl("core-control"),
        meta: "HOME / GYM • 20 MIN",
      },
    ],
  },
  {
    day: "04",
    title: "GLUTES",
    focus: "Build + Strength",
    description:
      "Choose your glute session based on where you're training.",
    workouts: [
      {
        id: "home-glute-legs",
        title: "Home Glute & Legs",
        href: workoutPreviewUrl("home-glute-legs"),
        meta: "HOME • 35 MIN",
      },
      {
        id: "glute-builder",
        title: "Glute Builder",
        href: workoutPreviewUrl("glute-builder"),
        meta: "HOME / GYM • 40 MIN",
      },
      {
        id: "gym-glute-legs",
        title: "Gym Glute & Legs",
        href: workoutPreviewUrl("gym-glute-legs"),
        meta: "GYM • 45 MIN",
      },
    ],
  },
  {
    day: "05",
    title: "FULL BODY",
    focus: "Upper + Core",
    description:
      "A lighter full-body session to keep you moving.",
    workouts: [
      {
        id: "full-body-reset",
        title: "Full Body Reset",
        href: workoutPreviewUrl("full-body-reset"),
        meta: "HOME / GYM • 25 MIN",
      },
    ],
  },
  {
    day: "06",
    title: "CONDITIONING",
    focus: "Low Impact + Cardio",
    description:
      "Choose your conditioning based on your space and equipment.",
    workouts: [
      {
        id: "cardio-lock-in",
        title: "Cardio Lock In",
        href: workoutPreviewUrl("cardio-lock-in"),
        meta: "HOME / NO EQUIPMENT • 30 MIN",
      },
      {
        id: "gym-machine-cardio",
        title: "Gym Machine Cardio",
        href: workoutPreviewUrl("gym-machine-cardio"),
        meta: "GYM • 40 MIN",
      },
    ],
  },
  {
    day: "07",
    title: "RECOVER",
    focus: "Mobility + Walking",
    description:
      "Give your body time to recover and reset.",
    workouts: [],
  },
];

/* ---------------------------------
   DATE HELPERS
--------------------------------- */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function addCalendarDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);

  return next;
}

function formatCalendarDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleDateString(
    "en-CA",
    options ?? {
      month: "short",
      day: "numeric",
    }
  );
}

function getChallengeDay(
  date: Date,
  challengeStartDate: string
): number {
  const [year, month, day] = challengeStartDate
    .split("-")
    .map(Number);

  const startUTC = Date.UTC(year, month - 1, day);

  const selectedUTC = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.round(
    (selectedUTC - startUTC) / 86400000
  ) + 1;
}

function getTrainingDay(challengeDay: number): string {
  const normalized =
    ((challengeDay - 1) % 7 + 7) % 7;

  return String(normalized + 1).padStart(2, "0");
}

function getCalendarWeek(
  weekStartDate: string,
  challengeStartDate: string | null
): CalendarDay[] {
  const start = parseDateKey(weekStartDate);
  const todayKey = formatDateKey(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = addCalendarDays(start, index);

    const challengeDay = challengeStartDate
      ? getChallengeDay(date, challengeStartDate)
      : index + 1;

    return {
      date: formatDateKey(date),
      weekday: formatCalendarDate(date, {
        weekday: "short",
      }).toUpperCase(),
      fullWeekday: formatCalendarDate(date, {
        weekday: "long",
      }),
      dayNumber: date.getDate(),
      challengeDay,
      trainingDay: getTrainingDay(challengeDay),
      isToday: formatDateKey(date) === todayKey,
    };
  });
}



/* ---------------------------------
   WORKOUT SELECTION MIGRATION
--------------------------------- */

const workoutTitleToId = Object.fromEntries(
  trainingWeek.flatMap((day) =>
    day.workouts.map((workout) => [
      workout.title,
      workout.id,
    ])
  )
) as Record<string, string>;


const validWorkoutIds = new Set([
  ...Object.values(workoutTitleToId),
  ...trainingMethods.flatMap((method) =>
    method.days.flatMap((day) => day.recommendedWorkoutIds)
  ),
]);



function normalizeWorkoutSelections(
  value: unknown
): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};

  if (!value || typeof value !== "object") {
    return normalized;
  }

  const validMethodIds = new Set<string>([
    "beginner",
    "lock-in",
    "custom",
  ]);

  Object.entries(
    value as Record<string, unknown>
  ).forEach(([dayId, rawValue]) => {
    const rawItems = Array.isArray(rawValue)
      ? rawValue
      : [rawValue];

    if (dayId === "__training_method") {
      const methodId = rawItems.find(
        (item): item is string =>
          typeof item === "string" &&
          validMethodIds.has(item)
      );

      if (methodId) {
        normalized.__training_method = [methodId];
      }

      return;
    }

    if (!/^0[1-7]$/.test(dayId)) {
      return;
    }

    const ids = rawItems
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .map((item) => {
        if (validWorkoutIds.has(item)) {
          return item;
        }

        return workoutTitleToId[item] ?? null;
      })
      .filter(
        (item): item is string => Boolean(item)
      );

    normalized[dayId] = Array.from(new Set(ids));
  });

  return normalized;
}


/* ---------------------------------
   TRAINING PAGE
--------------------------------- */

export default function GuidePage() {
  const [firstName, setFirstName] =
    useState("there");

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [
    challengeStartDate,
    setChallengeStartDate,
  ] = useState<string | null>(null);

  const [
    challengeLength,
    setChallengeLength,
  ] = useState(75);

  /* ---------------------------------
     SAVED WORKOUTS
  --------------------------------- */

  const [
    selectedWorkouts,
    setSelectedWorkouts,
  ] = useState<Record<string, string[]>>({});

  const [
    selectionStorageKey,
    setSelectionStorageKey,
  ] = useState<string | null>(null);

  const [
    isEditingWorkouts,
    setIsEditingWorkouts,
  ] = useState(false);

  const [
    isSavingWorkouts,
    setIsSavingWorkouts,
  ] = useState(false);

  const [
    workoutSaveError,
    setWorkoutSaveError,
  ] = useState<string | null>(null);

  
  /* ---------------------------------
     METHOD POPUP
  --------------------------------- */

  const [showMethodPicker, setShowMethodPicker] =
    useState(false);

    
  const [activeMethodId, setActiveMethodId] =
    useState<TrainingMethodId | null>(null);


  const [previewMethod, setPreviewMethod] =
    useState<TrainingMethodId | null>(null);

  const [isApplyingMethod, setIsApplyingMethod] =
    useState(false);

  const [methodError, setMethodError] =
    useState<string | null>(null);

  const selectedMethod = trainingMethods.find(
    (method) => method.id === previewMethod
  );


  /* ---------------------------------
     MOVEMENT LOGGER
  --------------------------------- */

  const [
    showMovementLogger,
    setShowMovementLogger,
  ] = useState(false);

  /* ---------------------------------
     NEW WEEKLY CALENDAR
  --------------------------------- */

  const todayKey = formatDateKey(new Date());

  const [
    weekStartDate,
    setWeekStartDate,
  ] = useState(todayKey);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(todayKey);

  const [
    calendarReady,
    setCalendarReady,
  ] = useState(false);

  /*
   * Each displayed week represents seven
   * consecutive days of the challenge.
   *
   * This preserves the existing recurring
   * training schedule: 01 through 07.
   */

  const calendarWeek = useMemo(() => {
    return getCalendarWeek(
      weekStartDate,
      challengeStartDate
    );
  }, [
    weekStartDate,
    challengeStartDate,
  ]);

  const activeCalendarDay =
    calendarWeek.find(
      (day) => day.date === selectedDate
    ) ?? calendarWeek[0];

  
  const activeMethod = trainingMethods.find(
    (method) => method.id === activeMethodId
  );

  const defaultTrainingDay =
    trainingWeek.find(
      (day) =>
        day.day === activeCalendarDay?.trainingDay
    ) ?? trainingWeek[0];

  const methodTrainingDay =
    activeMethod?.days.find(
      (day) =>
        day.day === activeCalendarDay?.trainingDay
    );

  const activeTrainingDay: TrainingDay =
    methodTrainingDay
      ? {
          day: methodTrainingDay.day,
          title: methodTrainingDay.title,
          focus: methodTrainingDay.focus,
          description: "",
          workouts: methodTrainingDay.recommendedWorkoutIds.map(
            (id) => {
              const existing = trainingWeek
                .flatMap((day) => day.workouts)
                .find((workout) => workout.id === id);

              return (
                existing ?? {
                  id,
                  title: id
                    .split("-")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    )
                    .join(" "),
                  href: workoutPreviewUrl(id),
                  meta: "TRAINING SESSION",
                }
              );
            }
          ),
        }
      : defaultTrainingDay;


  const activeSelectedIds =
    selectedWorkouts[
      activeTrainingDay.day
    ] ?? [];


  const allAvailableWorkouts = trainingWeek.flatMap(
    (day) => day.workouts
  );

  const activeSelectedWorkouts = activeSelectedIds.map(
    (id) => {
      const existing = allAvailableWorkouts.find(
        (workout) => workout.id === id
      );

      return (
        existing ?? {
          id,
          title: id
            .split("-")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
            )
            .join(" "),
          href: workoutPreviewUrl(id),
          meta: "TRAINING SESSION",
        }
      );
    }
  );


  
  const isRecoveryDay =
    activeTrainingDay.title === "RECOVER";


  const activeDayIsInChallenge =
    Boolean(challengeStartDate) &&
    activeCalendarDay.challengeDay >= 1 &&
    activeCalendarDay.challengeDay <=
      challengeLength;

  const weekRangeLabel =
    calendarWeek.length === 7
      ? `${formatCalendarDate(
          parseDateKey(calendarWeek[0].date)
        )} – ${formatCalendarDate(
          parseDateKey(calendarWeek[6].date),
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )}`
      : "";

  /* ---------------------------------
     INITIALIZE CALENDAR
  --------------------------------- */

  function initializeCalendar(
    startDate: string | null
  ) {
    const today = new Date();
    const todayDate = formatDateKey(today);

    if (!startDate) {
      setWeekStartDate(todayDate);
      setSelectedDate(todayDate);
      setCalendarReady(true);
      return;
    }

    const challengeDay = getChallengeDay(
      today,
      startDate
    );

    const currentWeekIndex =
      challengeDay >= 1
        ? Math.floor(
            (challengeDay - 1) / 7
          )
        : 0;

    const challengeStart =
      parseDateKey(startDate);

    const firstDayOfWeek =
      addCalendarDays(
        challengeStart,
        currentWeekIndex * 7
      );

    const firstDayKey =
      formatDateKey(firstDayOfWeek);

    setWeekStartDate(firstDayKey);

    setSelectedDate(
      challengeDay >= 1
        ? todayDate
        : firstDayKey
    );

    setCalendarReady(true);
  }

  /* ---------------------------------
     CALENDAR NAVIGATION
  --------------------------------- */

  function moveCalendarWeek(
    direction: number
  ) {
    const currentStart =
      parseDateKey(weekStartDate);

    const nextStart =
      addCalendarDays(
        currentStart,
        direction * 7
      );

    const nextStartKey =
      formatDateKey(nextStart);

    setWeekStartDate(nextStartKey);

    // Open the first day of the new week.
    setSelectedDate(nextStartKey);

    // Close the editor when switching weeks.
    setIsEditingWorkouts(false);
  }

  function selectCalendarDay(
    date: string
  ) {
    setSelectedDate(date);
    setIsEditingWorkouts(false);
    setWorkoutSaveError(null);
  }

  function returnToToday() {
    initializeCalendar(
      challengeStartDate
    );

    setIsEditingWorkouts(false);
    setWorkoutSaveError(null);
  }

  /* ---------------------------------
     LOAD USER + SAVED WORKOUTS
  --------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user) {
          initializeCalendar(null);
          return;
        }

        setUserId(user.id);

        /* PROFILE */

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "challenge_start_date, challenge_length"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Could not load challenge profile:",
            profileError
          );
        }

        if (cancelled) return;

        const startDate =
          profile?.challenge_start_date ??
          null;

        const length =
          profile?.challenge_length ??
          75;

        setChallengeStartDate(startDate);
        setChallengeLength(length);

        initializeCalendar(startDate);

        /* FIRST NAME */

        const savedName =
          user.user_metadata?.name;

        if (
          savedName &&
          typeof savedName === "string"
        ) {
          setFirstName(
            savedName.split(" ")[0]
          );
        }

        /* WORKOUT STORAGE */

        const storageKey =
          `lockInGuideWorkoutSelections:${user.id}`;

        setSelectionStorageKey(
          storageKey
        );

        /* LOAD SUPABASE SCHEDULE */

        let loadedSelections:
          Record<string, string[]> = {};

        const {
          data: templateData,
          error: templateError,
        } = await supabase
          .from("user_templates")
          .select("workouts")
          .eq("user_id", user.id)
          .maybeSingle();

        if (templateError) {
          console.error(
            "Could not load workout schedule:",
            templateError
          );
        }

        if (templateData?.workouts) {
          loadedSelections =
            normalizeWorkoutSelections(
              templateData.workouts
            );
        }

        /*
         * Fall back to the old local
         * schedule if Supabase has no
         * selections.
         */

        if (
          Object.keys(
            loadedSelections
          ).length === 0
        ) {
          try {
            const saved =
              window.localStorage.getItem(
                storageKey
              );

            if (saved) {
              loadedSelections =
                normalizeWorkoutSelections(
                  JSON.parse(saved)
                );
            }
          } catch (error) {
            console.error(
              "Could not read local workouts:",
              error
            );
          }
        }

        if (cancelled) return;

        setSelectedWorkouts(
          loadedSelections
        );

        
        const savedMethodId =
          loadedSelections.__training_method?.[0];

        if (
          savedMethodId === "beginner" ||
          savedMethodId === "lock-in" ||
          savedMethodId === "custom"
        ) {
          setActiveMethodId(savedMethodId);
        } else {
          setActiveMethodId(null);
        }


        /*
         * Maintain local storage
         * as a device-level fallback.
         */

        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify(
              loadedSelections
            )
          );
        } catch {
          // Supabase remains primary.
        }

        /*
         * Migrate existing workout
         * titles to IDs when necessary.
         */

        if (
          Object.keys(
            loadedSelections
          ).length > 0
        ) {
          const {
            error: migrationError,
          } = await supabase
            .from("user_templates")
            .upsert(
              {
                user_id: user.id,
                workouts:
                  loadedSelections,
                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              }
            );

          if (migrationError) {
            console.error(
              "Could not migrate workouts:",
              migrationError
            );
          }
        }
      } catch (error) {
        console.error(
          "Could not initialize TRAIN:",
          error
        );
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false);
          setCalendarReady(true);
        }
      }
    };

    void loadUserData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------
     SAVE WORKOUT SELECTIONS
  --------------------------------- */

  async function handleWorkoutSelect(
    dayId: string,
    workoutId: string
  ) {
    if (isSavingWorkouts) return;

    const currentSelections =
      selectedWorkouts[dayId] ?? [];

    const isCurrentlySelected =
      currentSelections.includes(
        workoutId
      );

    const nextDaySelections =
      isCurrentlySelected
        ? currentSelections.filter(
            (id) => id !== workoutId
          )
        : [
            ...currentSelections,
            workoutId,
          ];

    const nextSelections = {
      ...selectedWorkouts,
    };

    if (
      nextDaySelections.length === 0
    ) {
      delete nextSelections[dayId];
    } else {
      nextSelections[dayId] =
        nextDaySelections;
    }

    setWorkoutSaveError(null);
    setIsSavingWorkouts(true);

    // Optimistic UI update.
    setSelectedWorkouts(
      nextSelections
    );

    if (!userId) {
      setSelectedWorkouts(
        selectedWorkouts
      );
      setWorkoutSaveError(
        "Please sign in to save your workouts."
      );
      setIsSavingWorkouts(false);
      return;
    }

    try {
      const { error } =
        await supabase
          .from("user_templates")
          .upsert(
            {
              user_id: userId,
              workouts:
                nextSelections,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            }
          );

      if (error) {
        throw error;
      }

      if (selectionStorageKey) {
        try {
          window.localStorage.setItem(
            selectionStorageKey,
            JSON.stringify(
              nextSelections
            )
          );
        } catch {
          // Supabase save succeeded.
        }
      }

      /*
       * Restore a workout on TODAY
       * if the user adds it back to
       * the current training day.
       */

      if (
        !isCurrentlySelected &&
        challengeStartDate
      ) {
        const todayChallengeDay =
          getChallengeDay(
            new Date(),
            challengeStartDate
          );

        const todayTrainingDay =
          getTrainingDay(
            todayChallengeDay
          );

        if (
          todayChallengeDay >= 1 &&
          todayChallengeDay <=
            challengeLength &&
          dayId === todayTrainingDay
        ) {
          const {
            data: progress,
          } = await supabase
            .from("daily_progress")
            .select(
              "dismissed_guide_workouts"
            )
            .eq("user_id", userId)
            .eq(
              "challenge_day",
              todayChallengeDay
            )
            .maybeSingle();

          const dismissed =
            Array.isArray(
              progress?.dismissed_guide_workouts
            )
              ? (progress.dismissed_guide_workouts as string[])
              : [];

          if (
            dismissed.includes(
              workoutId
            )
          ) {
            const updatedDismissed =
              dismissed.filter(
                (id) =>
                  id !== workoutId
              );

            const {
              error: dismissalError,
            } = await supabase
              .from("daily_progress")
              .update({
                dismissed_guide_workouts:
                  updatedDismissed,
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "user_id",
                userId
              )
              .eq(
                "challenge_day",
                todayChallengeDay
              );

            if (dismissalError) {
              console.error(
                "Could not restore workout on TODAY:",
                dismissalError
              );
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "Could not save workout selection:",
        error
      );

      setSelectedWorkouts(
        selectedWorkouts
      );

      setWorkoutSaveError(
        "Your changes couldn't be saved. Please try again."
      );
    } finally {
      setIsSavingWorkouts(false);
    }
  }


  
 
  /* ---------------------------------
     APPLY TRAINING METHOD
  --------------------------------- */

  async function handleSetMethod() {
    if (!selectedMethod || isApplyingMethod) return;

    if (!userId) {
      setMethodError("Please sign in to set your method.");
      return;
    }

    const hasExistingWorkouts = Object.entries(
      selectedWorkouts
    ).some(
      ([key, workouts]) =>
        key !== "__training_method" &&
        workouts.length > 0
    );

    if (hasExistingWorkouts) {
      const confirmed = window.confirm(
        "This will replace your current weekly workout plan. Your completed progress will stay saved. Continue?"
      );

      if (!confirmed) return;
    }

    const nextSelections: Record<string, string[]> = {
      __training_method: [selectedMethod.id],
    };

    if (selectedMethod.id !== "custom") {
      selectedMethod.days.forEach((day) => {
        nextSelections[day.day] = [
          ...day.recommendedWorkoutIds,
        ];
      });
    } else {
      // Keep the seven training-day slots available
      // for a user-created schedule.
      trainingWeek.forEach((day) => {
        nextSelections[day.day] = [];
      });
    }

    setIsApplyingMethod(true);
    setMethodError(null);

    try {
      const { error } = await supabase
        .from("user_templates")
        .upsert(
          {
            user_id: userId,
            workouts: nextSelections,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) throw error;

      // Update both the saved workouts AND the
      // displayed calendar immediately.
      setSelectedWorkouts(nextSelections);
      setActiveMethodId(selectedMethod.id);

      if (selectionStorageKey) {
        try {
          window.localStorage.setItem(
            selectionStorageKey,
            JSON.stringify(nextSelections)
          );
        } catch {
          // Supabase has already saved the changes.
        }
      }

      setShowMethodPicker(false);
      setPreviewMethod(null);
      setIsEditingWorkouts(false);

      initializeCalendar(challengeStartDate);
    } catch (error) {
      console.error(
        "Could not apply training method:",
        error
      );

      setMethodError(
        "We couldn't save your method. Please try again."
      );
    } finally {
      setIsApplyingMethod(false);
    }
  }


  /* ---------------------------------
     WORKOUT EDITING
  --------------------------------- */

  function handleChangeWorkout() {
    setIsEditingWorkouts(true);
    setWorkoutSaveError(null);
  }

  function handleDoneSelecting() {
    setIsEditingWorkouts(false);
  }

  /* ---------------------------------
     USER INITIAL
  --------------------------------- */

  const initial =
    firstName &&
    firstName !== "there"
      ? firstName
          .charAt(0)
          .toUpperCase()
      : "L";


      
  /* ---------------------------------
     LOADING SCREEN
  --------------------------------- */

  if (isLoadingUser || !calendarReady) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
        <div className="flex min-h-screen">
          <DashboardSidebar
            firstName={firstName}
            initial={initial}
            isLoadingUser={isLoadingUser}
          />

          <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="font-serif text-xl italic text-[#A77B73]">
                loading your training space...
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
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">

         
          {/* ---------------------------------
              MINIMAL TRAIN HEADER
          --------------------------------- */}

        
             <header className="border-b border-[#DED0CB] pb-6">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                THE TRAINING EDIT
              </p>
            <h1 className="mt-0 font-serif text-3xl leading-tight text-[#211C19] md:text-4xl">
              The Lock In{" "}
              <span className="italic text-[#A77B73]">
                Method.
              </span>
            </h1>
           
          </header>


        
        

          {/* ---------------------------------
              THE WEEKLY PLANNER
          --------------------------------- */}

          <section className="pt-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[9px] tracking-[0.25em] text-[#9D6F67]">
                YOUR WEEK
              </p>

              
            </div>



            {/* WEEK NAVIGATION */}

            <div className="overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6]">

              <div className="flex items-center justify-between gap-3 border-b border-[#E1D3CE] bg-[#EAD8D3]/35 px-4 py-4 sm:px-6">

                <button
                  type="button"
                  onClick={() => moveCalendarWeek(-1)}
                  aria-label="Previous week"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8BDB5] bg-[#FBF8F6] font-serif text-lg text-[#A77B73] transition hover:bg-[#EAD8D3]"
                >
                  ←
                </button>

                <div className="min-w-0 text-center">
                  <p className="text-[9px] font-medium tracking-[0.17em] text-[#8F655E]">
                    {weekRangeLabel.toUpperCase()}
                  </p>

                  <p className="mt-1 text-[9px] text-[#927D76]">
                    {challengeStartDate
                      ? "YOUR CHALLENGE WEEK"
                      : "YOUR TRAINING WEEK"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => moveCalendarWeek(1)}
                  aria-label="Next week"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8BDB5] bg-[#FBF8F6] font-serif text-lg text-[#A77B73] transition hover:bg-[#EAD8D3]"
                >
                  →
                </button>
              </div>

              {/* SEVEN-DAY CALENDAR */}

              <div className="grid grid-cols-7 gap-1.5 px-3 py-4 sm:gap-2 sm:px-5">

                {calendarWeek.map((day) => {
                  const isActive =
                    selectedDate === day.date;

                  const trainingDay =
                    trainingWeek.find(
                      (item) =>
                        item.day === day.trainingDay
                    ) ?? trainingWeek[0];

                  const workoutCount =
                    selectedWorkouts[
                      day.trainingDay
                    ]?.length ?? 0;

                  const isOutsideChallenge =
                    Boolean(challengeStartDate) &&
                    (day.challengeDay < 1 ||
                      day.challengeDay > challengeLength);

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() =>
                        selectCalendarDay(day.date)
                      }
                      aria-pressed={isActive}
                      aria-label={`${day.fullWeekday}, ${formatCalendarDate(
                        parseDateKey(day.date),
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}`}
                      className={`relative flex min-w-0 flex-col items-center justify-center rounded-[0.85rem] border px-0.5 py-3 text-center transition sm:rounded-xl sm:py-4 ${
                        isActive
                          ? "border-[#A77B73] bg-[#EAD8D3]"
                          : "border-[#E1D3CE] bg-white/70 hover:border-[#B9948B] hover:bg-[#F1E6E2]"
                      } ${
                        isOutsideChallenge
                          ? "opacity-55"
                          : ""
                      }`}
                    >

                      <span className="text-[8px] font-medium tracking-[0.06em] text-[#9D6F67] sm:text-[10px]">
                        {day.weekday}
                      </span>

                      <span className="mt-2 font-serif text-lg leading-none text-[#211C19] sm:text-2xl">
                        {String(day.dayNumber).padStart(2, "0")}
                      </span>

                      <span
                        className={`mt-2 h-1.5 w-1.5 rounded-full ${
                          workoutCount > 0 &&
                          trainingDay.workouts.length > 0 &&
                          !isOutsideChallenge
                            ? "bg-[#A77B73]"
                            : "bg-[#D8C7C1]"
                        }`}
                      />

                      {day.isToday && (
                        <span className="absolute bottom-0.5 text-[6px] tracking-[0.1em] text-[#9D6F67] sm:bottom-1">
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SELECTED DAY */}

              <div className="border-t border-[#E1D3CE]">

                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:py-6">

                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#A77B73]">
                      {activeCalendarDay.weekday} ·{" "}
                      {formatCalendarDate(
                        parseDateKey(activeCalendarDay.date),
                        {
                          month: "short",
                          day: "numeric",
                        }
                      ).toUpperCase()}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl text-[#211C19] sm:text-3xl">
                      {activeDayIsInChallenge || !challengeStartDate
                        ? activeTrainingDay.title
                        : "OUTSIDE YOUR CHALLENGE"}
                    </h3>

                    <p className="mt-1 font-serif text-base italic text-[#A77B73]">
                      {activeDayIsInChallenge || !challengeStartDate
                        ? activeTrainingDay.focus
                        : "Your training journey has its own timeline."}
                    </p>

                    {activeDayIsInChallenge && (
                      <p className="mt-3 text-[9px] tracking-[0.15em] text-[#9D6F67]">
                        CHALLENGE DAY{" "}
                        {String(
                          activeCalendarDay.challengeDay
                        ).padStart(2, "0")}
                      </p>
                    )}
                  </div>

                  {(activeDayIsInChallenge ||
                    !challengeStartDate) &&
                    !isRecoveryDay && (
                      <button
                        type="button"
                        onClick={
                          isEditingWorkouts
                            ? handleDoneSelecting
                            : handleChangeWorkout
                        }
                        className="inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-[#CBA9A2] px-4 py-2.5 text-[9px] tracking-[0.13em] text-[#8F655E] transition hover:bg-[#EAD8D3]"
                      >
                        {isEditingWorkouts
                          ? "DONE SELECTING"
                          : activeSelectedWorkouts.length > 0
                            ? "EDIT WORKOUTS"
                            : "CHOOSE WORKOUT"}

                        <span className="font-serif text-sm">
                          {isEditingWorkouts ? "✓" : "→"}
                        </span>
                      </button>
                    )}
                </div>

                {/* SELECTED WORKOUTS */}

                {(activeDayIsInChallenge ||
                  !challengeStartDate) && (
                  <div className="border-t border-[#E1D3CE] px-5 sm:px-7">

                    {isRecoveryDay ? (
                      <Link
                        href="/dashboard/resources/recovery"
                        className="group flex items-center justify-between gap-4 py-5"
                      >
                        <div>
                          <p className="font-serif text-lg text-[#211C19]">
                            Recovery + Mobility
                          </p>

                          <p className="mt-1 text-[10px] text-[#927D76]">
                            Stretch, walk, or take the rest you need.
                          </p>
                        </div>

                        <span className="text-lg text-[#A77B73] transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    ) : activeSelectedWorkouts.length > 0 ? (
                      <div className="divide-y divide-[#E1D3CE]">
                        {activeSelectedWorkouts.map((workout) => (
                          <Link
                            key={workout.id}
                            href={workout.href}
                            className="group flex items-center justify-between gap-4 py-4"
                          >
                            <div>
                              <p className="font-serif text-lg text-[#211C19]">
                                {workout.title}
                              </p>

                              <p className="mt-1 text-[9px] tracking-[0.13em] text-[#9D6F67]">
                                {workout.meta}
                              </p>
                            </div>

                            <span className="text-lg text-[#A77B73] transition group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="font-serif text-lg italic text-[#A77B73]">
                          A little movement goes a long way.
                        </p>

                        <p className="mt-2 text-[11px] text-[#927D76]">
                          Choose a workout to add to your training day.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* WORKOUT EDITOR */}

                {isEditingWorkouts &&
                  !isRecoveryDay &&
                  (activeDayIsInChallenge ||
                    !challengeStartDate) && (
                    <div className="border-t border-[#E1D3CE] bg-[#F7F1ED] px-5 py-6 sm:px-7">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[9px] tracking-[0.25em] text-[#9D6F67]">
                            BUILD YOUR DAY
                          </p>

                          <h4 className="mt-2 font-serif text-xl text-[#211C19]">
                            Make it{" "}
                            <span className="italic text-[#A77B73]">
                              yours.
                            </span>
                          </h4>

                          <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                            Choose one or more workouts for this day.
                            Your choices repeat on this training day
                            throughout your challenge.
                          </p>
                        </div>

                        <Link
                          href="/dashboard/resources/workouts"
                          className="shrink-0 text-[9px] tracking-[0.15em] text-[#9D6F67] transition hover:text-[#211C19]"
                        >
                          VIEW LIBRARY →
                        </Link>
                      </div>

                      {workoutSaveError && (
                        <p
                          role="alert"
                          className="mt-4 rounded-xl border border-[#CBA9A2] bg-[#EAD8D3]/50 px-4 py-3 text-[11px] text-[#8F655E]"
                        >
                          {workoutSaveError}
                        </p>
                      )}

                      <div className="mt-5 grid gap-2 md:grid-cols-2">
                        
{[
  ...activeSelectedWorkouts,
  ...activeTrainingDay.workouts.filter(
    (workout) =>
      !activeSelectedIds.includes(workout.id)
  ),
].map(

                          (workout) => {
                            const isSelected =
                              activeSelectedIds.includes(
                                workout.id
                              );

                            return (
                              <button
                                key={workout.id}
                                type="button"
                                disabled={isSavingWorkouts}
                                onClick={() =>
                                  handleWorkoutSelect(
                                    activeTrainingDay.day,
                                    workout.id
                                  )
                                }
                                aria-pressed={isSelected}
                                className={`group flex items-center justify-between gap-4 rounded-[1rem] border px-4 py-4 text-left transition disabled:cursor-wait disabled:opacity-60 ${
                                  isSelected
                                    ? "border-[#A77B73] bg-[#EAD8D3]/70"
                                    : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#B9948B]"
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="font-serif text-lg text-[#211C19]">
                                    {workout.title}
                                  </p>

                                  <p className="mt-1 text-[9px] tracking-[0.12em] text-[#9D6F67]">
                                    {workout.meta}
                                  </p>
                                </div>

                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-serif text-sm ${
                                    isSelected
                                      ? "border-[#A77B73] bg-[#FBF8F6] text-[#A77B73]"
                                      : "border-[#D8BDB5] text-[#A77B73]"
                                  }`}
                                >
                                  {isSelected ? "✓" : "+"}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#E1D3CE] pt-4">
                        <p className="text-[10px] italic text-[#927D76]">
                          {activeSelectedIds.length} selected ♡
                        </p>

                        <button
                          type="button"
                          onClick={handleDoneSelecting}
                          disabled={isSavingWorkouts}
                          className="rounded-full bg-[#211C19] px-5 py-2.5 text-[9px] tracking-[0.17em] text-[#F7F1ED] transition hover:bg-[#493D39] disabled:opacity-60"
                        >
                          {isSavingWorkouts ? "SAVING..." : "DONE"}
                        </button>
                      </div>
                    </div>
                  )}

                {/* DAY FOOTER */}

                <div className="flex items-center justify-between gap-4 border-t border-[#E1D3CE] bg-[#EAD8D3]/20 px-5 py-4 sm:px-7">
                  <p className="text-[10px] italic text-[#927D76]">
                    Progress, not perfection. ♡
                  </p>

                  {(activeDayIsInChallenge ||
                    !challengeStartDate) &&
                    !isRecoveryDay && (
                      <span className="text-[9px] tracking-[0.13em] text-[#9D6F67]">
                        {activeSelectedWorkouts.length}{" "}
                        {activeSelectedWorkouts.length === 1
                          ? "WORKOUT"
                          : "WORKOUTS"}{" "}
                        PLANNED
                      </span>
                    )}
                </div>
              </div>
            </div>

            <p className="mt-4 px-1 text-[10px] leading-5 text-[#927D76]">
              Tap a date to see its training focus.
              Use the arrows to explore other weeks.
            </p>
          </section>

        

          {/* ---------------------------------
              TRAINING TOOLS
          --------------------------------- */}

          <section className="mt-10 border-t border-[#DED0CB] py-7">
            <div className="mb-5">
              <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
                YOUR TRAINING SPACE
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#211C19] sm:text-3xl">
                Make it{" "}
                <span className="italic text-[#A77B73]">
                  yours.
                </span>
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                Explore, create, and keep track of your movement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[

                {
  number: "00",
  title: "Find Your Method",
  description: "Choose your weekly training style.",
  href: null,
},
                {
                  number: "01",
                  title: "Workout Library",
                  description: "Find your next session.",
                  href: "/dashboard/resources/workouts",
                },
                {
                  number: "02",
                  title: "Build a Workout",
                  description: "Create your own routine.",
                  href: "/dashboard/guide/build-workout",
                },
                {
                  number: "03",
                  title: "Log Movement",
                  description: "Every kind of movement counts.",
                  href: null,
                },
                {
                  number: "04",
                  title: "Training History",
                  description: "See the work you've put in.",
                  href: "/dashboard/guide/training-history",
                },
                {
                  number: "05",
                  title: "My Custom Workouts",
                  description: "Routines created by you.",
                  href: "/dashboard/guide/my-workouts",
                },
              ].map((tool) => {
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-serif text-base text-[#B48A82]">
                        {tool.number}
                      </span>

                      <span className="font-serif text-lg text-[#A77B73]">
                        {tool.number === "03" && showMovementLogger
                          ? "−"
                          : "→"}
                      </span>
                    </div>

                    <h3 className="mt-5 font-serif text-lg text-[#211C19] sm:text-xl">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-[#927D76]">
                      {tool.description}
                    </p>
                  </>
                );

                
                if (tool.number === "00") {
                  return (
                    <button
                      key={tool.number}
                      type="button"
                      onClick={() => {
                        setMethodError(null);
                        setPreviewMethod(null);
                        setShowMethodPicker(true);
                      }}
                      className="rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 text-left transition hover:border-[#B9948B] hover:bg-[#F1E6E2] sm:p-5"
                    >
                      {content}
                    </button>
                  );
                }


                if (tool.number === "03") {
                  return (
                    <button
                      key={tool.number}
                      type="button"
                      onClick={() =>
                        setShowMovementLogger(
                          (previous) => !previous
                        )
                      }
                      aria-expanded={showMovementLogger}
                      className={`rounded-[1.15rem] border p-4 text-left transition sm:p-5 ${
                        showMovementLogger
                          ? "border-[#A77B73] bg-[#EAD8D3]/60"
                          : "border-[#DED0CB] bg-[#FBF8F6] hover:border-[#B9948B] hover:bg-[#F1E6E2]"
                      }`}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={tool.number}
                    href={tool.href!}
                    className="rounded-[1.15rem] border border-[#DED0CB] bg-[#FBF8F6] p-4 text-left transition hover:border-[#B9948B] hover:bg-[#F1E6E2] sm:p-5"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            {/* MOVEMENT LOGGER */}

            {showMovementLogger && (
              <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[#DED0CB] bg-[#FBF8F6] p-3 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#9D6F67]">
                      YOUR MOVEMENT JOURNAL
                    </p>

                    <h3 className="mt-2 font-serif text-xl text-[#211C19]">
                      Every move{" "}
                      <span className="italic text-[#A77B73]">
                        counts.
                      </span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMovementLogger(false)}
                    aria-label="Close movement logger"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8BDB5] text-[#A77B73] transition hover:bg-[#EAD8D3]"
                  >
                    ×
                  </button>
                </div>

                <MovementLogger />
              </div>
            )}
          </section>

          {/* ---------------------------------
              BEYOND THE WORKOUT
          --------------------------------- */}

          <section className="border-t border-[#DED0CB] py-7">
            <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
              BEYOND THE WORKOUT
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#211C19] sm:text-3xl">
              The little{" "}
              <span className="italic text-[#A77B73]">
                extras.
              </span>
            </h2>

            <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
              Because training is about more than the workout itself.
            </p>

            <div className="mt-5 divide-y divide-[#E1D3CE] overflow-hidden rounded-[1.25rem] border border-[#DED0CB] bg-[#FBF8F6] px-5 sm:px-6">
              <Link
                href="/dashboard/resources/recovery"
                className="group flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <h3 className="font-serif text-lg text-[#211C19]">
                    Mobility &amp; Recovery
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#927D76]">
                    Stretching, recovery &amp; mindful movement.
                  </p>
                </div>

                <span className="shrink-0 text-lg text-[#A77B73] transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/dashboard/resources/beginners"
                className="group flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <h3 className="font-serif text-lg text-[#211C19]">
                    The Fundamentals
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#927D76]">
                    Training terms, techniques &amp; essentials.
                  </p>
                </div>

                <span className="shrink-0 text-lg text-[#A77B73] transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </section>

          {/* ---------------------------------
              TRAIN FOOTER
          --------------------------------- */}

          <footer className="mt-4 border-t border-[#DED0CB] pb-4 pt-6">
            <p className="text-[8px] font-medium tracking-[0.2em] text-[#A18B84]">
              A NOTE ABOUT YOUR BODY
            </p>

            <p className="mt-2 max-w-3xl text-[9px] leading-[1.7] text-[#A18B84]">
              Lock In With Lav provides general fitness and wellness
              education, not individualized medical care or
              rehabilitation. If you're postpartum, returning after
              injury, experiencing pain, pelvic floor symptoms,
              abdominal doming or coning, or think you may have
              diastasis recti, consider speaking with a qualified
              healthcare professional or pelvic floor
              physiotherapist before progressing.
            </p>
         
          </footer>
        </section>
      </div>

      {/* ---------------------------------
          FIND YOUR METHOD MODAL
      --------------------------------- */}

      {showMethodPicker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211C19]/50 px-4 py-6 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isApplyingMethod
            ) {
              setShowMethodPicker(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-method-title"
            className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] shadow-2xl"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-[#E1D3CE] px-6 py-5">
              <div>
                <p className="text-[9px] tracking-[0.24em] text-[#9D6F67]">
                  YOUR TRAINING STYLE
                </p>

                <h2
                  id="training-method-title"
                  className="mt-2 font-serif text-2xl text-[#211C19]"
                >
                  Find your{" "}
                  <span className="italic text-[#A77B73]">
                    method.
                  </span>
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
                  Choose the routine that feels right for you.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMethodPicker(false)}
                disabled={isApplyingMethod}
                aria-label="Close method picker"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8BDB5] text-lg text-[#A77B73] transition hover:bg-[#EAD8D3]"
              >
                ×
              </button>
            </div>

            {/* METHOD OPTIONS */}

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              {trainingMethods.map((method, index) => {
                const isSelected =
                  previewMethod === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setPreviewMethod(method.id);
                      setMethodError(null);
                    }}
                    className={`w-full rounded-[1rem] border p-4 text-left transition ${
                      isSelected
                        ? "border-[#A77B73] bg-[#EAD8D3]/60"
                        : "border-[#DED0CB] bg-white/70 hover:border-[#B9948B]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-serif text-lg text-[#B48A82]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-lg text-[#211C19]">
                          {method.title}
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-[#806E68]">
                          {method.description}
                        </p>
                      </div>

                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                          isSelected
                            ? "border-[#A77B73] bg-[#A77B73] text-white"
                            : "border-[#D8BDB5] text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                  </button>
                              );
              })}

            {/* WEEKLY METHOD PREVIEW */}

{selectedMethod && (
  <div className="border-t border-[#E1D3CE] px-5 pb-5 pt-5 sm:px-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
          A LOOK AT YOUR WEEK
        </p>

        <h3 className="mt-2 font-serif text-xl text-[#211C19]">
          {selectedMethod.title}
        </h3>
      </div>

      <span className="text-[9px] tracking-[0.12em] text-[#A77B73]">
        PREVIEW
      </span>
    </div>

    {selectedMethod.id === "custom" ? (
      <div className="rounded-[1rem] border border-[#E1D3CE] bg-[#F7F1ED] p-5">
        <p className="font-serif text-lg text-[#211C19]">
          Your calendar. Your rules.
        </p>

        <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
          Start with seven open training days. Choose your own
          workouts and create a weekly routine that fits your life.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-[1rem] border border-[#E1D3CE] bg-[#F7F1ED]">
        {selectedMethod.days.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-3 px-4 py-3 ${
              index > 0 ? "border-t border-[#E1D3CE]" : ""
            }`}
          >
            <span className="w-12 shrink-0 text-[9px] tracking-[0.08em] text-[#9D6F67]">
              DAY {day.day}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium tracking-[0.04em] text-[#211C19]">
                {day.title}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#927D76]">
                {day.focus}
              </p>
            </div>

            <span className="text-sm text-[#A77B73]">
              {day.title === "RECOVER" ? "♡" : "→"}
            </span>
          </div>
        ))}
      </div>
    )}

    <p className="mt-3 text-center text-[10px] italic text-[#927D76]">
      Just a preview. Your calendar won't change until you
      confirm. ♡
    </p>
  </div>
)}
 </div>

            {/* ACTION */}

            <div className="border-t border-[#E1D3CE] bg-[#F7F1ED] px-5 py-5 sm:px-6">
              {methodError && (
                <p
                  role="alert"
                  className="mb-3 text-[11px] text-[#9D6F67]"
                >
                  {methodError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSetMethod}
                disabled={!previewMethod || isApplyingMethod}
                className="w-full rounded-full bg-[#211C19] px-5 py-3.5 text-[10px] font-medium tracking-[0.18em] text-[#FBF8F6] transition hover:bg-[#493D39] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isApplyingMethod
                  ? "SETTING YOUR METHOD..."
                  : "SET THIS METHOD →"}
              </button>

              <p className="mt-3 text-center text-[10px] italic text-[#927D76]">
                Your progress stays yours. ♡
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
