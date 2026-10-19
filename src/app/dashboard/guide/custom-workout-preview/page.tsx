
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { adaptCustomWorkout } from "@/lib/customWorkoutAdapter";

type CustomExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type CustomWorkout = {
  id: string;
  name: string;
  focus: string;
  exercises: CustomExercise[];
};

export default function CustomWorkoutPreviewPage() {
  const searchParams = useSearchParams();
  const workoutId = searchParams.get("workout");

  const [workout, setWorkout] = useState<CustomWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    let active = true;

    async function loadWorkout() {
      try {
        if (!workoutId) {
          throw new Error("No workout selected.");
        }

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in to view your workout.");
        }

        if (!active) return;

        setFirstName(
          user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "there"
        );

        const { data, error: fetchError } = await supabase
          .from("custom_workouts")
          .select("id, name, focus, exercises")
          .eq("id", workoutId)
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Workout not found.");

        if (!active) return;

        const savedWorkout = data as CustomWorkout;
        setWorkout(savedWorkout);
        setExpandedId(savedWorkout.exercises?.[0]?.id ?? null);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load this workout."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWorkout();

    return () => {
      active = false;
    };
  }, [workoutId]);

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DashboardSidebar
          firstName={firstName}
          initial={firstName === "there" ? "♡" : firstName.charAt(0).toUpperCase()}
          isLoadingUser={loading}
        />

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-7 md:px-8 md:pt-10 lg:px-12">
            <Link
              href="/dashboard"
              className="text-[10px] tracking-[0.15em] text-[#9D6F67]"
            >
              ← BACK TO TODAY
            </Link>

            {loading ? (
              <p className="mt-12 text-center text-xs text-[#806E68]">
                Loading your workout... ♡
              </p>
            ) : error || !workout ? (
              <p role="alert" className="mt-12 text-center text-xs text-[#A35F58]">
                {error || "Workout not found."}
              </p>
            ) : (
              <>
                <section className="mt-6 rounded-[24px] border border-[#DED0CB] bg-[#FBF8F6] p-5 sm:p-7">
                  <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
                    YOUR CUSTOM WORKOUT ♡
                  </p>

                  <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                    {workout.name}
                  </h1>

                  <p className="mt-3 font-serif text-lg italic text-[#A77B73]">
                    made by you, for you. ♡
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7DAD6] pt-5">
                    <div>
                      <p className="text-[9px] tracking-widest text-[#9D6F67]">
                        TRAINING FOCUS
                      </p>
                      <p className="mt-2 font-serif text-base">{workout.focus}</p>
                    </div>

                    <div>
                      <p className="text-[9px] tracking-widest text-[#9D6F67]">
                        EXERCISES
                      </p>
                      <p className="mt-2 font-serif text-base">
                        {workout.exercises.length} movements
                      </p>
                    </div>
                  </div>
                </section>

                


   <CustomWorkoutTracker
  workout={workout}
  expandedId={expandedId}
  setExpandedId={setExpandedId}
/>

                  <Link
                    href="/dashboard"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#211C19] px-6 py-4 text-[10px] tracking-widest text-white sm:w-auto"
                  >
                    BACK TO TODAY →
                  </Link>
                
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
function CustomWorkoutTracker({
  workout,
  expandedId,
  setExpandedId,
}: {
  workout: CustomWorkout;
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const workoutDetail = useMemo(
    () => adaptCustomWorkout(workout),
    [workout]
  );


    const [finishing, setFinishing] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [actualMinutes, setActualMinutes] = useState(
    String(workoutDetail.durationMinutes)
  );
  const [finishError, setFinishError] = useState<string | null>(null);


  const {
    logs,
    changeLogs,
    status,
    loading,
    saving,
    error,
    finishWorkout,
  } = useWorkoutSession(workoutDetail);

    const completedSets = Object.values(logs).reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => set.completed).length,
    0
  );

  const canFinish =
    !loading &&
    !finishing &&
    status !== "completed" &&
    completedSets > 0;

  async function handleFinishWorkout() {
    if (!canFinish) return;

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
      setExpandedId(null);
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

  if (loading) {
    return (
      <p className="mt-6 text-center text-xs text-[#806E68]">
        Loading your workout tracker... ♡
      </p>
    );
  }

 
  return (
    <section className="mt-8">
      <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
        THE WORKOUT
      </p>

      <h2 className="mt-2 font-serif text-3xl">
        Your <span className="italic text-[#A77B73]">movements.</span>
      </h2>

      <p className="mt-2 text-xs text-[#806E68]">
        Track each set as you go. Your progress saves automatically. ♡
      </p>

      <div className="mt-5 space-y-3">
        {workout.exercises.map((exercise, index) => {
          const isExpanded = expandedId === exercise.id;
          const exerciseLog = logs[exercise.id];

          const completedSets =
            exerciseLog?.sets.filter((set) => set.completed).length ?? 0;

          const totalSets = exerciseLog?.sets.length ?? 0;

          return (
            <article
              key={exercise.id}
              className="overflow-hidden rounded-[22px] border border-[#DED0CB] bg-[#FBF8F6]"
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedId(isExpanded ? null : exercise.id)
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-sm text-[#A77B73]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 text-left">
                    <h3 className="font-serif text-xl">
                      {exercise.name}
                    </h3>

                    <p className="mt-1 text-[10px] text-[#9D6F67]">
                      {completedSets}/{totalSets} sets complete
                    </p>
                  </div>
                </div>

                <span className="text-xl text-[#A77B73]">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[#E7DAD6] px-4 py-5 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#EAD8D3] px-3 py-2 text-[10px] text-[#6F514B]">
                      {exercise.sets} SETS × {exercise.reps} REPS
                    </span>

                    {exercise.weight && (
                      <span className="rounded-full border border-[#D6C3BD] px-3 py-2 text-[10px] text-[#806E68]">
                        {exercise.weight} WEIGHT
                      </span>
                    )}
                  </div>

                  {exerciseLog && (
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] tracking-[0.15em] text-[#9D6F67]">
                          LOG YOUR SETS
                        </p>

                        <p className="text-[9px] text-[#9D6F67]">
                          {completedSets}/{totalSets} DONE
                        </p>
                      </div>

                      {exerciseLog.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 rounded-xl border border-[#E7DAD6] bg-white/70 p-2"
                        >
                          <span className="text-center text-[10px] text-[#9D6F67]">
                            {setIndex + 1}
                          </span>

                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`${exercise.name} set ${setIndex + 1} weight`}
                            placeholder={exercise.weight || "Weight"}
                            value={set.weight}
                            disabled={status === "completed"}
                            onChange={(event) => {
                              const weight = event.target.value;

                              changeLogs((current) => ({
                                ...current,
                                [exercise.id]: {
                                  ...current[exercise.id],
                                  sets: current[exercise.id].sets.map(
                                    (existingSet, i) =>
                                      i === setIndex
                                        ? { ...existingSet, weight }
                                        : existingSet
                                  ),
                                },
                              }));
                            }}
                            className="min-w-0 rounded-lg border border-[#E7DAD6] bg-white px-2 py-3 text-center text-xs outline-none focus:border-[#A77B73]"
                          />

                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label={`${exercise.name} set ${setIndex + 1} reps`}
                            placeholder={exercise.reps || "Reps"}
                            value={set.reps}
                            disabled={status === "completed"}
                            onChange={(event) => {
                              const reps = event.target.value;

                              changeLogs((current) => ({
                                ...current,
                                [exercise.id]: {
                                  ...current[exercise.id],
                                  sets: current[exercise.id].sets.map(
                                    (existingSet, i) =>
                                      i === setIndex
                                        ? { ...existingSet, reps }
                                        : existingSet
                                  ),
                                },
                              }));
                            }}
                            className="min-w-0 rounded-lg border border-[#E7DAD6] bg-white px-2 py-3 text-center text-xs outline-none focus:border-[#A77B73]"
                          />

                          <label className="flex h-10 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#D6C3BD]">
                            <input
                              type="checkbox"
                              aria-label={`Complete ${exercise.name} set ${setIndex + 1}`}
                              checked={set.completed}
                              disabled={status === "completed"}
                              onChange={(event) => {
                                const completed = event.target.checked;

                                changeLogs((current) => ({
                                  ...current,
                                  [exercise.id]: {
                                    ...current[exercise.id],
                                    sets: current[exercise.id].sets.map(
                                      (existingSet, i) =>
                                        i === setIndex
                                          ? { ...existingSet, completed }
                                          : existingSet
                                    ),
                                  },
                                }));
                              }}
                              className="h-4 w-4 accent-[#A77B73]"
                            />
                          </label>
                        </div>
                      ))}

                      <p className="pt-2 text-[10px] text-[#806E68]">
                        Log your actual weight and reps, then check off each set.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#E7DAD6] pt-6">
        {status === "completed" ? (
          <div className="rounded-2xl bg-[#EAD8D3] px-5 py-5 text-center">
            <p className="font-serif text-xl text-[#6F514B]">
              Workout complete. ♡
            </p>
            <p className="mt-2 text-xs text-[#806E68]">
              You showed up for yourself today.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canFinish || saving}
            onClick={() => {
              setFinishError(null);
              setShowFinishModal(true);
            }}
            className="w-full rounded-full bg-[#211C19] px-6 py-4 text-[10px] tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            FINISH WORKOUT ♡
          </button>
        )}

        {status !== "completed" && completedSets === 0 && (
          <p className="mt-3 text-center text-[10px] text-[#806E68]">
            Complete at least one set to finish your workout.
          </p>
        )}
      </div>


      {saving && (
        <p className="mt-5 text-center text-xs text-[#806E68]">
          Saving your progress...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 text-center text-xs text-[#A35F58]">
          {error}
        </p>
      )}


      {showFinishModal && status !== "completed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C19]/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-custom-workout-title"
            className="w-full max-w-sm rounded-[26px] border border-[#DED0CB] bg-[#FBF8F6] p-6 shadow-xl sm:p-8"
          >
            <p className="text-[9px] tracking-[0.22em] text-[#9D6F67]">
              ALMOST THERE ♡
            </p>

            <h2
              id="finish-custom-workout-title"
              className="mt-3 font-serif text-3xl text-[#211C19]"
            >
              Workout <span className="italic text-[#A77B73]">complete?</span>
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-[#806E68]">
              How many minutes did you actually train?
              We'll count them toward your daily movement goal.
            </p>

            <label
              htmlFor="custom-workout-minutes"
              className="mt-6 block text-[10px] tracking-widest text-[#9D6F67]"
            >
              TOTAL MINUTES
            </label>

            <input
              id="custom-workout-minutes"
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="1"
              value={actualMinutes}
              disabled={finishing}
              onChange={(event) => setActualMinutes(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 font-serif text-xl text-[#211C19] outline-none focus:border-[#A77B73]"
            />

            {finishError && (
              <p role="alert" className="mt-3 text-xs text-[#A35F58]">
                {finishError}
              </p>
            )}

            <button
              type="button"
              disabled={finishing || saving}
              onClick={() => void handleFinishWorkout()}
              className="mt-6 w-full rounded-full bg-[#211C19] px-6 py-4 text-[10px] tracking-[0.15em] text-white disabled:opacity-40"
            >
              {finishing ? "SAVING YOUR WORKOUT..." : "DONE WORKOUT ♡"}
            </button>

            <button
              type="button"
              disabled={finishing}
              onClick={() => {
                setShowFinishModal(false);
                setFinishError(null);
              }}
              className="mt-4 w-full py-2 text-[10px] tracking-widest text-[#806E68] disabled:opacity-40"
            >
              KEEP TRAINING
            </button>
          </div>
        </div>
      )}


    </section>
  );

}