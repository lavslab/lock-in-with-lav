
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase";

type WorkoutHistoryEntry = {
  id: string;
  workout_id: string;
  workout_title: string;
  duration_minutes: number | null;
  challenge_day: number | null;
  completed_at: string | null;
  exercises: {
    exerciseId: string;
    originalName: string;
    selectedName: string;
    sets: {
      completed: boolean;
      weight: string;
      reps: string;
    }[];
  }[];
};

export default function TrainingHistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

async function deleteWorkout(id: string) {
  if (deletingId) return;

  const confirmed = window.confirm(
    "Permanently delete this workout session? This cannot be undone."
  );

  if (!confirmed) return;

  setDeletingId(id);
  setError("");

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to delete a workout.");
    }

    const { data, error: deleteError } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (deleteError) throw deleteError;

    if (!data?.length) {
      throw new Error("Workout could not be deleted.");
    }

    setWorkouts((previous) =>
      previous.filter((workout) => workout.id !== id)
    );

    setExpandedWorkoutId((previous) =>
      previous === id ? null : previous
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not delete workout."
    );
  } finally {
    setDeletingId(null);
  }
}
  const [firstName, setFirstName] = useState("there");
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in to view your training history.");
        }

        if (!active) return;

        setFirstName(
          user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "there"
        );

        const { data, error: historyError } = await supabase
          .from("workout_sessions")
          .select(
            "id, workout_id, workout_title, duration_minutes, challenge_day, completed_at, exercises"
          )
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false });

        if (historyError) throw historyError;

        if (active) {
          setWorkouts((data ?? []) as WorkoutHistoryEntry[]);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your training history."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DashboardSidebar
          firstName={firstName}
          initial={
            firstName === "there"
              ? "♡"
              : firstName.charAt(0).toUpperCase()
          }
          isLoadingUser={loading}
        />

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 pb-32  sm:px-7 md:px-8 md:pt-10 lg:px-12">
           
            <p className="mt-8 text-[9px] tracking-[0.22em] text-[#9D6F67]">
              YOUR TRAINING JOURNAL ♡
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Training{" "}
              <span className="italic text-[#A77B73]">history.</span>
            </h1>

            <p className="mt-3 text-xs leading-relaxed text-[#806E68]">
              Every session, every set, every time you showed up. ♡
            </p>

            {loading ? (
              <p className="mt-10 text-xs text-[#806E68]">
                Loading your workouts...
              </p>
            ) : error ? (
              <p role="alert" className="mt-10 text-xs text-[#A35F58]">
                {error}
              </p>
            ) : workouts.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-[#DED0CB] bg-[#FBF8F6] p-7 text-center">
                <p className="font-serif text-xl">
                  Your story starts here. ♡
                </p>

                <p className="mt-3 text-xs text-[#806E68]">
                  Completed workouts will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {workouts.map((workout) => {
                  const isExpanded = expandedWorkoutId === workout.id;

                  return (
                    <article
                      key={workout.id}
                      className="overflow-hidden rounded-[22px] border border-[#DED0CB] bg-[#FBF8F6]"
                    >
                      {/* CLICKABLE WORKOUT HEADER */}
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`session-${workout.id}`}
                        onClick={() =>
                          setExpandedWorkoutId(
                            isExpanded ? null : workout.id
                          )
                        }
                        className="flex w-full items-center justify-between gap-3 p-5 text-left sm:p-6"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] tracking-widest text-[#9D6F67]">
                            {workout.completed_at
                              ? new Date(
                                  workout.completed_at
                                ).toLocaleDateString("en-CA", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "COMPLETED SESSION"}
                          </p>

                          <h2 className="mt-2 font-serif text-xl text-[#211C19]">
                            {workout.workout_title}
                          </h2>

                          <p className="mt-2 text-xs text-[#806E68]">
                            {workout.duration_minutes ?? 0} minutes
                            {workout.challenge_day != null
                              ? ` · Day ${workout.challenge_day}`
                              : ""}
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DED0CB] text-lg text-[#A77B73]"
                        >
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {/* EXPANDABLE SESSION DETAILS */}
                      {isExpanded && (
                        <div
                          id={`session-${workout.id}`}
                          className="border-t border-[#E7DAD6] px-5 pb-6 pt-5 sm:px-6"
                        >
                          <p className="text-[9px] tracking-[0.18em] text-[#9D6F67]">
                            YOUR SESSION DETAILS ♡
                          </p>

                          {workout.exercises?.length ? (
                            <div className="mt-5 space-y-6">
                              {workout.exercises.map(
                                (exercise, exerciseIndex) => {
                                  const sets = exercise.sets ?? [];

                                  const completedSets = sets.filter(
                                    (set) => set.completed
                                  ).length;

                                  return (
                                    <div
                                      key={`${exercise.exerciseId}-${exerciseIndex}`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <h3 className="min-w-0 font-serif text-lg text-[#211C19]">
                                          {exercise.selectedName ||
                                            exercise.originalName}
                                        </h3>

                                        <span className="shrink-0 pt-1 text-[10px] text-[#9D6F67]">
                                          {completedSets}/{sets.length} sets
                                        </span>
                                      </div>

                                      <div className="mt-3 space-y-2">
                                        {sets.map((set, setIndex) => (
                                          <div
                                            key={setIndex}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-[#E7DAD6] bg-white/70 px-3 py-3"
                                          >
                                            <span className="shrink-0 text-[10px] text-[#806E68]">
                                              Set {setIndex + 1}
                                            </span>

                                            <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] text-[#6F514B]">
                                              {set.weight && (
                                                <span>
                                                  {set.weight} weight
                                                </span>
                                              )}

                                              {set.reps && (
                                                <span>
                                                  {set.reps} reps
                                                </span>
                                              )}

                                              <span
                                                className={
                                                  set.completed
                                                    ? "text-[#9D6F67]"
                                                    : "text-[#A35F58]"
                                                }
                                              >
                                                {set.completed
                                                  ? "✓ Done"
                                                  : "Not completed"}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p className="mt-4 text-xs text-[#806E68]">
                              No exercise details were recorded for this session.
                            </p>
                          )}

                          <p className="mt-6 border-t border-[#E7DAD6] pt-5 text-center font-serif text-lg italic text-[#A77B73]">
                            every set counts. ♡
                          </p>

                          <div className="mt-5 flex justify-center">
  <button
    type="button"
    disabled={deletingId !== null}
    onClick={() => void deleteWorkout(workout.id)}
    className="text-[9px] tracking-[0.18em] text-[#A35F58] underline underline-offset-4 transition hover:text-[#211C19] disabled:cursor-wait disabled:opacity-50"
  >
    {deletingId === workout.id
      ? "DELETING..."
      : "DELETE SESSION"}
  </button>
</div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
