
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import {
  getWorkoutDetail,
  type WorkoutExercise,
  type ExerciseSwap,
} from "@/lib/workoutDetails";
import {
  useWorkoutSession,
  type LoggedSet,
} from "@/hooks/useWorkoutSession";


function exerciseInfo(
  exercise: WorkoutExercise,
  selectedName: string
) {
  const swap = exercise.swaps?.find(
    (option) => option.name === selectedName
  );

  return {
    name: swap?.name ?? exercise.name,
    cue: swap?.cue ?? exercise.cue,
    modification:
      swap?.modification ?? exercise.modification,
    home: swap
      ? swap.location === "GYM"
        ? "This alternative requires gym equipment."
        : `${swap.name} — home-friendly alternative.`
      : exercise.home,
    gym: swap
      ? swap.location === "HOME"
        ? "This alternative is designed for home training."
        : `${swap.name} — gym alternative.`
      : exercise.gym,
  };
}

export default function WorkoutPreviewPage() {
  const searchParams = useSearchParams();
  const workoutId =
    searchParams.get("workout") ?? "lower-body-foundation";

  const workout = getWorkoutDetail(workoutId);

  if (!workout) {
    return (
      <main className="min-h-screen bg-[#F7F1ED] p-8">
        Workout not found.
      </main>
    );
  }

  return <WorkoutSessionPage key={workout.id} workout={workout} />;
}

function WorkoutSessionPage({
  workout,
}: {
  workout: NonNullable<ReturnType<typeof getWorkoutDetail>>;
}) {
  const {
    logs,
    changeLogs,
    status,
    loading,
    saving,
    error,
    finishWorkout,
  } = useWorkoutSession(workout);

  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [expandedExercise, setExpandedExercise] = useState<
    string | null
  >(workout.exercises[0]?.id ?? null);

  const [showWorkoutDetails, setShowWorkoutDetails] =
    useState(false);
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [openSwapFor, setOpenSwapFor] = useState<
    string | null
  >(null);
  const [showOptionsFor, setShowOptionsFor] = useState<
    string | null
  >(null);

  const [finishing, setFinishing] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

const [actualMinutes, setActualMinutes] = useState(
  String(workout.durationMinutes)
);
  const [finishError, setFinishError] = useState<
    string | null
  >(null);
const sessionFinished = status === "completed";
const canEdit = !loading && !sessionFinished && !finishing;

const isCardioWorkout =
  workout.id === "cardio-lock-in" ||
  workout.id === "gym-machine-cardio";
const isCoreWorkout = workout.id === "core-control";
const usesSimpleCheckboxes = isCardioWorkout || isCoreWorkout;
const isFullBodyReset = workout.id === "full-body-reset";

const isTimedExercise = (exercise: WorkoutExercise) =>
  isFullBodyReset &&
  exercise.id === "low-impact-mountain-climber";

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (user) {
          setFirstName(
            user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              "there"
          );
        }
      } catch (err) {
        console.error("Could not load user:", err);
      } finally {
        if (active) setIsLoadingUser(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const initial =
    !isLoadingUser && firstName !== "there"
      ? firstName.charAt(0).toUpperCase()
      : "♡";

  const totals = useMemo(() => {
    const total = workout.exercises.reduce(
      (sum, exercise) => sum + exercise.sets,
      0
    );

    const completed = Object.values(logs).reduce(
      (sum, log) =>
        sum + log.sets.filter((set) => set.completed).length,
      0
    );

    return {
      total,
      completed,
      progress: total
        ? Math.round((completed / total) * 100)
        : 0,
    };
  }, [logs, workout]);

  function updateSet(
    exercise: WorkoutExercise,
    setIndex: number,
    changes: Partial<LoggedSet>
  ) {
    if (!canEdit) return;

    const currentLog = logs[exercise.id];
    if (!currentLog) return;

    const updatedSets = currentLog.sets.map((set, index) =>
      index === setIndex ? { ...set, ...changes } : set
    );

    changeLogs((current) => ({
      ...current,
      [exercise.id]: {
        ...current[exercise.id],
        sets: updatedSets,
      },
    }));

    const wasComplete = currentLog.sets.every(
      (set) => set.completed
    );
    const nowComplete = updatedSets.every(
      (set) => set.completed
    );

    // Automatically open the next unfinished exercise.
    if (
      changes.completed === true &&
      !wasComplete &&
      nowComplete
    ) {
      const currentIndex = workout.exercises.findIndex(
        (item) => item.id === exercise.id
      );

      const nextExercise = workout.exercises
        .slice(currentIndex + 1)
        .find((item) => {
          const log = logs[item.id];
          return log?.sets.some((set) => !set.completed);
        });

      setExpandedExercise(nextExercise?.id ?? null);
      setOpenSwapFor(null);
      setShowOptionsFor(null);
    }
  }

  function selectExercise(
    exercise: WorkoutExercise,
    swap?: ExerciseSwap
  ) {
    if (!canEdit) return;

    changeLogs((current) => ({
      ...current,
      [exercise.id]: {
        ...current[exercise.id],
        selectedName: swap?.name ?? exercise.name,
      },
    }));

    setOpenSwapFor(null);
  }

  async function handleFinishWorkout() {
  if (!canEdit || totals.completed === 0) return;

  setFinishError(null);

  const minutes = Number(actualMinutes);

  if (
    actualMinutes.trim() === "" ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 1440
  ) {
    setFinishError("Please enter a valid number of minutes.");
    return;
  }

  setFinishing(true);

  try {
    await finishWorkout(minutes);

    setShowFinishModal(false);
    setExpandedExercise(null);
    setOpenSwapFor(null);
    setShowOptionsFor(null);
  } catch (err) {
    setFinishError(
      err instanceof Error
        ? err.message
        : "Could not finish your workout."
    );
  } finally {
    setFinishing(false);
  }
}

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DashboardSidebar
          firstName={firstName}
          initial={initial}
          isLoadingUser={isLoadingUser}
        />

        <section className="min-w-0 flex-1">
          <header className="hidden items-center justify-between border-b border-[#E1D3CE] px-8 py-5 md:flex lg:px-12">
            <div>
              <p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">
                LOCK IN WITH LAV
              </p>
              <p className="mt-1 font-serif text-xl italic text-[#A77B73]">
                workout library. ♡
              </p>
            </div>

            <Link
              href="/dashboard/resources/workouts"
              className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[9px] tracking-widest hover:bg-[#EAD8D3]"
            >
              ← WORKOUTS
            </Link>
          </header>

          <div className="mx-auto max-w-5xl px-4 pb-32 pt-5 sm:px-7 md:px-8 md:pb-16 md:pt-9 lg:px-12">
            <Link
              href="/dashboard/resources/workouts"
              className="mb-4 inline-flex text-[10px] tracking-widest text-[#9D6F67] md:hidden"
            >
              ← WORKOUT LIBRARY
            </Link>

            {/* COMPACT HEADER */}
            <section className="rounded-[24px] border border-[#DED0CB] bg-[#FBF8F6] p-5 sm:p-7">
              <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                {workout.eyebrow}
              </p>

              <h1 className="mt-3 font-serif text-[30px] leading-[1.15] sm:text-4xl">
                {workout.title}{" "}
                <span className="italic text-[#A77B73]">
                  {workout.accentTitle}
                </span>
              </h1>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-[11px] text-[#806E68]">
                  {totals.completed} of {totals.total}{" "}
{isCardioWorkout ? "rounds" : "sets"} completed
                </p>
                <span className="font-serif text-lg text-[#A77B73]">
                  {totals.progress}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Workout progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={totals.progress}
                className="mt-2 h-2 overflow-hidden rounded-full bg-[#EAD8D3]"
              >
                <div
                  className="h-full rounded-full bg-[#A77B73] transition-all duration-300"
                  style={{ width: `${totals.progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px]">
                {loading ? (
                  <span className="text-[#9D6F67]">
                    Restoring your workout...
                  </span>
                ) : sessionFinished ? (
                  <span className="text-[#8F655E]">
                    ✓ Workout saved as completed
                  </span>
                ) : saving ? (
                  <span className="text-[#9D6F67]">
                    Saving your progress...
                  </span>
                ) : error ? (
                  <span className="text-red-700">
                    Save issue — see message below
                  </span>
                ) : (
                  <span className="text-[#9D6F67]">
                    ♡ Progress saves automatically
                  </span>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                aria-expanded={showWorkoutDetails}
                onClick={() =>
                  setShowWorkoutDetails((current) => !current)
                }
                className="mt-5 flex w-full items-center justify-between border-t border-[#E7DAD6] pt-4 text-left"
              >
                <span className="text-[11px] text-[#806E68]">
                  {workout.durationMinutes} min ·{" "}
                  {workout.exercises.length} exercises
                </span>
                <span className="text-[11px] text-[#9D6F67]">
                  Workout details{" "}
                  {showWorkoutDetails ? "⌃" : "⌄"}
                </span>
              </button>

              {showWorkoutDetails && (
                <div className="mt-5 border-t border-[#E7DAD6] pt-5">
                  <p className="text-sm leading-6 text-[#806E68]">
                    {workout.description}
                  </p>
                  <p className="mt-2 font-serif text-lg italic text-[#A77B73]">
                    {workout.subtitle}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {[
                      ["TIME", `${workout.durationMinutes} min`],
                      ["EXERCISES", `${workout.exercises.length}`],
                      ["FOCUS", workout.focus],
                      ["EQUIPMENT", workout.equipmentLabel],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border-t border-[#E7DAD6] pt-3"
                      >
                        <p className="text-[9px] tracking-widest text-[#9D6F67]">
                          {label}
                        </p>
                        <p className="mt-1 font-serif text-base">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* WARMUP */}
            <section className="mt-4 overflow-hidden rounded-[22px] bg-[#EAD8D3]">
              <button
                type="button"
                aria-expanded={showWarmup}
                onClick={() =>
                  setShowWarmup((current) => !current)
                }
                className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left sm:px-7"
              >
                <div>
                  <p className="text-[9px] tracking-widest text-[#8F655E]">
                    01 · WARM UP
                  </p>
                  <h2 className="mt-1 font-serif text-xl">
                    Get ready{" "}
                    <span className="italic text-[#9D6F67]">
                      to move. ♡
                    </span>
                  </h2>
                </div>
                <span className="text-xl text-[#9D6F67]">
                  {showWarmup ? "−" : "+"}
                </span>
              </button>

              {showWarmup && (
                <div className="px-5 pb-5 sm:px-7">
                  <p className="mb-3 text-xs text-[#806E68]">
                    Move through each once before starting.
                  </p>

                  {workout.warmup.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex gap-3 border-t border-[#D5BBB5] py-3"
                    >
                      <span className="font-serif text-xs italic text-[#9D6F67]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xs leading-5 text-[#5F504B]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* EXERCISES */}
            <section className="mt-8">
              <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                02 · THE WORKOUT
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Your{" "}
                <span className="italic text-[#A77B73]">
                  movements.
                </span>
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#806E68]">
                {isCardioWorkout
  ? "Track each round as you go. Tap any movement to view it. ♡"
  : "Track each set as you go. Tap any movement to edit it. ♡"}
              </p>

              <div className="mt-5 space-y-3">
                {workout.exercises.map((exercise, index) => {
                  const log = logs[exercise.id];
                  if (!log) return null;

                  const info = exerciseInfo(
                    exercise,
                    log.selectedName
                  );

                  const completedCount = log.sets.filter(
                    (set) => set.completed
                  ).length;

                  const isComplete =
                    completedCount === exercise.sets;
                  const isExpanded =
                    expandedExercise === exercise.id;
                  const isSwapped =
                    log.selectedName !== exercise.name;
                  const optionsOpen =
                    showOptionsFor === exercise.id;
                  const swapOpen =
                    openSwapFor === exercise.id;

                  return (
                    <article
                      key={exercise.id}
                      className={`overflow-hidden rounded-[22px] border bg-[#FBF8F6] ${
                        isComplete
                          ? "border-[#B9948B]"
                          : "border-[#DED0CB]"
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => {
                          setExpandedExercise(
                            isExpanded ? null : exercise.id
                          );
                          setOpenSwapFor(null);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-sm ${
                              isComplete
                                ? "border-[#A77B73] bg-[#EAD8D3] text-[#6F514B]"
                                : "border-[#CBA9A2] text-[#A77B73]"
                            }`}
                          >
                            {isComplete
                              ? "✓"
                              : String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                          </span>

                          <div className="min-w-0">
                            <h3 className="font-serif text-xl leading-tight">
                              {info.name}
                            </h3>
                            <p className="mt-1 text-[11px] text-[#806E68]">
                              {completedCount}/{exercise.sets}{" "}
{isCardioWorkout ? "rounds" : "sets"} complete
                              {isComplete ? " ♡" : ""}
                            </p>
                            {isSwapped && (
                              <p className="mt-1 text-[9px] tracking-wider text-[#A77B73]">
                                SWAPPED EXERCISE
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-xl text-[#A77B73]">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#E7DAD6] px-4 pb-6 pt-5 sm:px-6">
                          <p className="text-xs leading-6 text-[#806E68]">
                            {info.cue}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#EAD8D3] px-3 py-2 text-[10px] text-[#6F514B]">
                              {exercise.sets}{" "}
{isCardioWorkout
  ? exercise.sets === 1
    ? "ROUND"
    : "ROUNDS"
  : "SETS"}{" "}
× {exercise.reps}
{!isCardioWorkout && " REPS"}
                            </span>
                            <span className="rounded-full border border-[#D6C3BD] px-3 py-2 text-[10px] text-[#806E68]">
                              {exercise.restSeconds} SEC REST
                            </span>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <p className="text-[10px] tracking-widest text-[#9D6F67]">
                             {isCardioWorkout ? "LOG YOUR ROUNDS" : "LOG YOUR SETS"}
                            </p>
                            <p className="text-xs text-[#A77B73]">
                              {completedCount}/{exercise.sets} DONE
                            </p>
                          </div> 

                          
{usesSimpleCheckboxes ? (
  <div className="mt-3 space-y-2">
    {log.sets.map((set, setIndex) => (
      <div
        key={setIndex}
        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
          set.completed
            ? "border-[#CBA9A2] bg-[#EAD8D3]/40"
            : "border-[#E7DAD6] bg-white"
        }`}
      >
        <div>
          <p className="font-serif text-base">
           {isCardioWorkout ? "Round" : "Set"} {setIndex + 1}
          </p>
          <p className="mt-1 text-xs text-[#806E68]">
            {exercise.reps}
          </p>
        </div>

        <button
          type="button"
          disabled={!canEdit}
          aria-label={`${
            set.completed ? "Uncheck" : "Complete"
          } round ${setIndex + 1}`}
          aria-pressed={set.completed}
          onClick={() =>
            updateSet(exercise, setIndex, {
              completed: !set.completed,
            })
          }
          className={`flex h-12 w-12 items-center justify-center rounded-lg border text-lg disabled:opacity-60 ${
            set.completed
              ? "border-[#A77B73] bg-[#A77B73] text-white"
              : "border-[#CBA9A2] text-[#A77B73]"
          }`}
        >
          {set.completed ? "✓" : "○"}
        </button>
      </div>
    ))}
  </div>
) : (
                          <div className="mt-3 space-y-2">
                            {log.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className={`grid ${
  isFullBodyReset &&
  ![
    "Goblet Squat",
    "Leg Press",
    "Chest Press",
    "Hip Thrust",
    "Cable Pull-Through",
  ].includes(log.selectedName)
    ? "grid-cols-[30px_minmax(0,1fr)_46px] sm:grid-cols-[50px_minmax(0,1fr)_76px]"
    : "grid-cols-[30px_minmax(0,1fr)_minmax(0,1fr)_46px] sm:grid-cols-[50px_minmax(0,1fr)_minmax(0,1fr)_76px]"
} items-end gap-2 rounded-xl border p-2.5 sm:p-3 ${
                                  set.completed
                                    ? "border-[#CBA9A2] bg-[#EAD8D3]/40"
                                    : "border-[#E7DAD6] bg-white"
                                }`}
                              >
                                <div className="self-center text-center">
                                  <p className="text-[9px] text-[#8F655E]">
                                  {isCardioWorkout ? "ROUND" : "SET"}
                                  </p>
                                  <p className="font-serif text-lg">
                                    {setIndex + 1}
                                  </p>
                                </div>
                                {(!isFullBodyReset ||
  log.selectedName === "Goblet Squat" ||
  log.selectedName === "Leg Press" ||
  log.selectedName === "Chest Press" ||
  log.selectedName === "Hip Thrust" ||
  log.selectedName === "Cable Pull-Through") && (

                                

                                <label className="min-w-0">
                                  <span className="block text-[10px] text-[#806E68]">
                                    LB
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    inputMode="decimal"
                                    placeholder="0"
                                    disabled={!canEdit}
                                    value={set.weight}
                                    onChange={(event) =>
                                      updateSet(
                                        exercise,
                                        setIndex,
                                        {
                                          weight:
                                            event.target.value,
                                        }
                                      )
                                    }
                                    className="mt-1 h-12 w-full min-w-0 rounded-lg border border-[#DED0CB] bg-white px-2 text-base outline-none focus:border-[#A77B73] disabled:opacity-60"
                                  />
                                </label>

                                )}

                                <label className="min-w-0">
                                  <span className="block text-[10px] text-[#806E68]">
  {isTimedExercise(exercise) ? "SECONDS" : "REPS"}
</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    placeholder={exercise.reps}
                                    disabled={!canEdit}
                                    value={set.reps}
                                    onChange={(event) =>
                                      updateSet(
                                        exercise,
                                        setIndex,
                                        {
                                          reps:
                                            event.target.value,
                                        }
                                      )
                                    }
                                    className="mt-1 h-12 w-full min-w-0 rounded-lg border border-[#DED0CB] bg-white px-2 text-base outline-none focus:border-[#A77B73] disabled:opacity-60"
                                  />
                                </label>

                                <button
                                  type="button"
                                  disabled={!canEdit}
                                  aria-label={`${
                                    set.completed
                                      ? "Uncheck"
                                      : "Complete"
                                  } set ${setIndex + 1}`}
                                  aria-pressed={set.completed}
                                  onClick={() =>
                                    updateSet(
                                      exercise,
                                      setIndex,
                                      {
                                        completed:
                                          !set.completed,
                                      }
                                    )
                                  }
                                  className={`flex h-12 items-center justify-center rounded-lg border text-lg disabled:opacity-60 ${
                                    set.completed
                                      ? "border-[#A77B73] bg-[#A77B73] text-white"
                                      : "border-[#CBA9A2] text-[#A77B73]"
                                  }`}
                                >
                                  {set.completed ? "✓" : "○"}
                                </button>
                              </div>
                                             ))}
                </div>
              )}

              <p className="mt-3 text-[11px] leading-5 text-[#806E68]">
                            {isCardioWorkout
  ? "Complete each round, then check it off. ♡"
  : isCoreWorkout
    ? "Complete each set, then check it off. ♡"
    : isFullBodyReset
      ? "Log your actual reps or seconds, then check off each set. ♡"
      : "Log your actual weight and reps, then check off each set."}
                          </p>

                          {/* HOME / GYM / EASIER */}
                          <div className="mt-6">
                            <button
                              type="button"
                              aria-expanded={optionsOpen}
                              onClick={() =>
                                setShowOptionsFor(
                                  optionsOpen
                                    ? null
                                    : exercise.id
                                )
                              }
                              className="flex w-full items-center justify-between rounded-xl border border-[#DED0CB] px-4 py-4 text-left"
                            >
                              <span className="text-[10px] tracking-wider text-[#8F655E]">
                                HOME / GYM / EASIER OPTIONS
                              </span>
                              <span className="text-[#A77B73]">
                                {optionsOpen ? "−" : "+"}
                              </span>
                            </button>

                            {optionsOpen && (
                              <div className="mt-3 grid gap-4 rounded-xl bg-[#F7F1ED] p-4 sm:grid-cols-3">
                                {[
                                  ["HOME", info.home],
                                  ["GYM", info.gym],
                                  [
                                    "EASIER OPTION",
                                    info.modification,
                                  ],
                                ].map(([label, description]) => (
                                  <div key={label}>
                                    <p className="text-[10px] tracking-wider text-[#9D6F67]">
                                      {label}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-[#5F504B]">
                                      {description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* EXERCISE SWAPS */}
                          {!!exercise.swaps?.length && (
                            <div className="mt-3">
                              <button
                                type="button"
                                aria-expanded={swapOpen}
                                onClick={() =>
                                  setOpenSwapFor(
                                    swapOpen
                                      ? null
                                      : exercise.id
                                  )
                                }
                                className="flex w-full items-center justify-between rounded-xl border border-[#D6C3BD] bg-[#F7F1ED] px-4 py-4 text-left"
                              >
                                <span className="text-[10px] tracking-wider text-[#8F655E]">
                                  ↔ SWAP EXERCISE
                                </span>
                                <span className="text-[#A77B73]">
                                  {swapOpen ? "−" : "+"}
                                </span>
                              </button>

                              {swapOpen && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-[#DED0CB]">
                                  {isSwapped && (
                                    <button
                                      type="button"
                                      disabled={!canEdit}
                                      onClick={() =>
                                        selectExercise(exercise)
                                      }
                                      className="w-full border-b border-[#DED0CB] bg-[#EAD8D3]/40 px-4 py-4 text-left disabled:opacity-60"
                                    >
                                      <p className="font-serif text-base">
                                        ↶ Back to {exercise.name}
                                      </p>
                                      <p className="mt-1 text-xs text-[#806E68]">
                                        Restore original exercise
                                      </p>
                                    </button>
                                  )}

                                  {exercise.swaps
                                    ?.filter(
                                      (swap) =>
                                        swap.name !==
                                        log.selectedName
                                    )
                                    .map((swap) => (
                                      <button
                                        key={swap.name}
                                        type="button"
                                        disabled={!canEdit}
                                        onClick={() =>
                                          selectExercise(
                                            exercise,
                                            swap
                                          )
                                        }
                                        className="flex w-full items-center justify-between gap-3 border-b border-[#DED0CB] px-4 py-4 text-left last:border-b-0 hover:bg-[#F7F1ED] disabled:opacity-60"
                                      >
                                        <div>
                                          <p className="font-serif text-base">
                                            {swap.name}
                                          </p>
                                          <p className="mt-1 text-xs leading-5 text-[#806E68]">
                                            {swap.note}
                                          </p>
                                          <p className="mt-2 text-[10px] tracking-wider text-[#9D6F67]">
                                            {swap.location}
                                          </p>
                                        </div>
                                        <span className="text-[#A77B73]">
                                          →
                                        </span>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}

                          {isComplete && (
                            <p className="mt-5 text-center font-serif text-lg italic text-[#A77B73]">
                              movement complete. ♡
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* COOLDOWN */}
            <section className="mt-7 overflow-hidden rounded-[22px] border border-[#DED0CB] bg-[#FBF8F6]">
              <button
                type="button"
                aria-expanded={showCooldown}
                onClick={() =>
                  setShowCooldown((current) => !current)
                }
                className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-7"
              >
                <div>
                  <p className="text-[9px] tracking-widest text-[#9D6F67]">
                    03 · COOL DOWN
                  </p>
                  <h2 className="mt-1 font-serif text-xl">
                    Finish{" "}
                    <span className="italic text-[#A77B73]">
                      slowly. ♡
                    </span>
                  </h2>
                </div>
                <span className="text-xl text-[#A77B73]">
                  {showCooldown ? "−" : "+"}
                </span>
              </button>

              {showCooldown && (
                <div className="px-5 pb-5 sm:px-7">
                  {workout.cooldown.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex gap-3 border-t border-[#E1D3CE] py-3"
                    >
                      <span className="font-serif text-xs italic text-[#A77B73]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xs leading-5 text-[#5F504B]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FINISH WORKOUT */}
            <section className="py-10 text-center">
              <p className="text-[9px] tracking-widest text-[#9D6F67]">
  {workout.title} {workout.accentTitle}
</p>

              <h2 className="mt-3 font-serif text-2xl italic text-[#A77B73]">
                {sessionFinished
                  ? "you showed up for yourself. ♡"
                  : "finish strong. stay locked in. ♡"}
              </h2>

              <p className="mt-3 text-xs leading-5 text-[#806E68]">
                {sessionFinished
                  ? "Your completed workout has been saved."
                  : "Your progress saves as you go. Finish when you're ready."}
              </p>

              {finishError && (
                <p
                  role="alert"
                  className="mx-auto mt-4 max-w-md rounded-xl bg-red-50 p-3 text-xs text-red-700"
                >
                  {finishError}
                </p>
              )}

              <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
                <button
                  type="button"
                  disabled={
                    loading ||
                    finishing ||
                    saving ||
                    totals.completed === 0 ||
                    sessionFinished
                  }
                  onClick={() => {
  setFinishError(null);
  setShowFinishModal(true);
}}
                  className="rounded-full bg-[#211C19] px-6 py-4 text-[10px] tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sessionFinished
                    ? "SESSION FINISHED ✓"
                    : finishing
                      ? "FINISHING WORKOUT..."
                      : loading
                        ? "LOADING WORKOUT..."
                        : "FINISH WORKOUT →"}
                </button>

                <p className="text-[11px] text-[#806E68]">
                  {sessionFinished
                    ? "Saved to your workout history. ♡"
                    : "You can leave and come back to an unfinished session."}
                </p>

                <Link
                  href="/dashboard/resources/workouts"
                  className="py-3 text-[10px] tracking-widest text-[#9D6F67]"
                >
                  ← BACK TO WORKOUT LIBRARY
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>

      {showFinishModal && !sessionFinished && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211C19]/50 px-4 py-6"
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget &&
        !finishing
      ) {
        setShowFinishModal(false);
      }
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="finish-workout-title"
      className="w-full max-w-md rounded-[28px] border border-[#DED0CB] bg-[#FBF8F6] p-6 shadow-2xl sm:p-8"
    >
      <p className="text-center text-[9px] tracking-[0.25em] text-[#9D6F67]">
        LOCK IN WITH LAV ♡
      </p>

      <h2
        id="finish-workout-title"
        className="mt-4 text-center font-serif text-3xl text-[#211C19]"
      >
        Workout complete.
        <span className="block italic text-[#A77B73]">
          you did that. ♡
        </span>
      </h2>

      <p className="mt-4 text-center text-sm leading-6 text-[#806E68]">
        Every minute counts. How long did you move?
      </p>

      <label className="mt-7 block">
        <span className="text-[10px] tracking-widest text-[#9D6F67]">
          MINUTES COMPLETED
        </span>

        <input
          type="number"
          min="1"
          max="1440"
          step="1"
          inputMode="numeric"
          value={actualMinutes}
          onChange={(event) =>
            setActualMinutes(event.target.value)
          }
          disabled={finishing}
          className="mt-3 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-4 text-center font-serif text-2xl text-[#211C19] outline-none focus:border-[#A77B73]"
        />
      </label>

      <p className="mt-2 text-center text-xs text-[#806E68]">
        Suggested: {workout.durationMinutes} minutes
      </p>

      <div className="mt-6 rounded-2xl bg-[#F7F1ED] p-4">
        <div className="flex items-center justify-between text-xs text-[#806E68]">
          <span>MOVE GOAL</span>
          <span>
            {Math.min(
              45,
              Math.max(0, Number(actualMinutes) || 0)
            )}{" "}
            / 45 MIN
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAD8D3]">
          <div
            className="h-full rounded-full bg-[#A77B73] transition-all"
            style={{
              width: `${
                Math.min(
                  100,
                  (Math.max(
                    0,
                    Number(actualMinutes) || 0
                  ) /
                    45) *
                    100
                )
              }%`,
            }}
          />
        </div>

        <p className="mt-3 text-center font-serif italic text-[#A77B73]">
          {Number(actualMinutes) >= 45
            ? "Goal reached. ♡"
            : "Every little bit counts. ♡"}
        </p>
      </div>

      {finishError && (
        <p
          role="alert"
          className="mt-4 text-center text-xs text-red-700"
        >
          {finishError}
        </p>
      )}

      <button
        type="button"
        disabled={
          finishing ||
          actualMinutes.trim() === "" ||
          !Number.isInteger(Number(actualMinutes)) ||
          Number(actualMinutes) < 1 ||
          Number(actualMinutes) > 1440
        }
        onClick={() => void handleFinishWorkout()}
        className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[10px] tracking-widest text-white disabled:opacity-40"
      >
        {finishing
          ? "SAVING WORKOUT..."
          : "SAVE MY WORKOUT ♡"}
      </button>

      <button
        type="button"
        disabled={finishing}
        onClick={() => setShowFinishModal(false)}
        className="mt-4 w-full py-2 text-[10px] tracking-widest text-[#9D6F67] disabled:opacity-40"
      >
        GO BACK
      </button>
    </section>
  </div>
)}
    </main>
  );
}
