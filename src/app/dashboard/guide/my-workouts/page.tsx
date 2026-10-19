
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentChallengeDay } from "@/lib/challenge";

type SavedExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type SavedWorkout = {
  id: string;
  name: string;
  focus: string;
  exercises: SavedExercise[];
  created_at: string;
};

export default function MyWorkoutsPage() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");
const [addingWorkoutId, setAddingWorkoutId] = useState<string | null>(null);
const [addedWorkoutIds, setAddedWorkoutIds] = useState<string[]>([]);
const [addError, setAddError] = useState("");



const deleteWorkout = async (workoutId: string) => {
  if (isDeleting) return;

  setIsDeleting(true);
  setDeleteError("");

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to delete your workout.");
    }

    const { data, error } = await supabase
      .from("custom_workouts")
      .delete()
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .select("id");

    if (error) throw error;

    if (!data || data.length !== 1) {
      throw new Error("Workout wasn't deleted. Please try again.");
    }

    setWorkouts((current) =>
      current.filter((workout) => workout.id !== workoutId)
    );

    setExpandedId(null);
    setDeleteId(null);
  } catch (error) {
    setDeleteError(
      error instanceof Error
        ? error.message
        : "Couldn't delete workout. Please try again."
    );
  } finally {
    setIsDeleting(false);
  }
};

  useEffect(() => {
    let active = true;

    const loadWorkouts = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in to view your workouts.");
        }

        const { data, error } = await supabase
          .from("custom_workouts")
          .select("id, name, focus, exercises, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (active) {
          setWorkouts((data ?? []) as SavedWorkout[]);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "We couldn't load your workouts. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadWorkouts();

    return () => {
      active = false;
    };
    }, []);

  const addWorkoutToToday = async (workout: SavedWorkout) => {
    if (addingWorkoutId) return;

    setAddingWorkoutId(workout.id);
    setAddError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to add a workout.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("challenge_start_date, challenge_length")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.challenge_start_date) {
        throw new Error("Please set your challenge start date first.");
      }

      const today = new Date();
const challengeLength = profile.challenge_length ?? 75;

const challengeDay = getCurrentChallengeDay(
  profile.challenge_start_date,
  challengeLength,
  today
);

      if (challengeDay < 1 || challengeDay > challengeLength) {
        throw new Error("Your challenge isn't currently active.");
      }

      const { data: progress, error: progressError } = await supabase
        .from("daily_progress")
        .select("selected_workouts")
        .eq("user_id", user.id)
        .eq("challenge_day", challengeDay)
        .maybeSingle();

      if (progressError) throw progressError;

      const existingWorkouts = Array.isArray(progress?.selected_workouts)
        ? progress.selected_workouts
        : [];

      const customWorkoutId = `custom:${workout.id}`;

      const alreadyAdded = existingWorkouts.some(
        (item: { id?: string }) => item?.id === customWorkoutId
      );

      if (alreadyAdded) {
        setAddedWorkoutIds((current) =>
          current.includes(workout.id)
            ? current
            : [...current, workout.id]
        );
        return;
      }

      const customWorkout = {
        id: customWorkoutId,
        title: workout.name,
        subtitle: workout.focus,
        type: workout.focus,
        time: "",
        equipment: "",
        exercises: workout.exercises,
        source: "custom",
      };

      const progressDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

     if (!progress) {
  throw new Error(
    "Complete your first daily check-in on TODAY, then come back to add this workout. ♡"
  );
}

const { data: savedRows, error: saveError } = await supabase
  .from("daily_progress")
  .update({
    selected_workouts: [...existingWorkouts, customWorkout],
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", user.id)
  .eq("challenge_day", challengeDay)
  .select("challenge_day");

if (saveError) throw saveError;

if (!savedRows || savedRows.length !== 1) {
  throw new Error("Workout wasn't saved. Please try again.");
}

      setAddedWorkoutIds((current) => [...current, workout.id]);
    } catch (error) {
      setAddError(
        error instanceof Error
          ? error.message
          : "Couldn't add your workout. Please try again."
      );
    } finally {
      setAddingWorkoutId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-1 text-[#211C19]">
     

        <header className="mt-8">
          <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
            YOUR SAVED ROUTINES
          </p>

          <p className="mt-3 text-[10px] leading-5 text-[#806E68]">
            Your workouts, your way. Come back to them anytime. ♡
          </p>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[10px] tracking-[0.2em] text-[#9D6F67]">
              YOUR WORKOUTS
            </h2>

            {!loading && !errorMessage && (
              <span className="rounded-full bg-[#EAD8D3] px-3 py-1 text-[10px] text-[#8F655E]">
                {workouts.length} saved ♡
              </span>
            )}
          </div>

          {loading && (
            <p className="py-10 text-center text-[12px] text-[#927D76]">
              Loading your workouts... ♡
            </p>
          )}

          {!loading && errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-[#DED0CB] bg-[#FBF8F6] p-5 text-center"
            >
              <p className="text-[12px] text-[#A35F58]">
                {errorMessage}
              </p>
            </div>
          )}

          {!loading && !errorMessage && workouts.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-[#D6C3BD] bg-[#FBF8F6] px-5 py-10 text-center">
              <p className="font-serif text-xl italic text-[#A77B73]">
                Your next routine starts here.
              </p>

              <p className="mx-auto mt-3 max-w-xs text-[12px] leading-5 text-[#806E68]">
                You haven't saved a workout yet. Build something that
                feels like you. ♡
              </p>

              <Link
                href="/dashboard/guide/build-workout"
                className="mt-6 inline-flex rounded-xl bg-[#211C19] px-5 py-3 text-[11px] text-white"
              >
                BUILD YOUR FIRST WORKOUT ♡
              </Link>
            </div>
          )}

          {!loading && !errorMessage && (
            <div className="space-y-3">
              {workouts.map((workout) => {
                const expanded = expandedId === workout.id;
                const exercises = Array.isArray(workout.exercises)
                  ? workout.exercises
                  : [];

                return (
                  <article
                    key={workout.id}
                    className="rounded-[1.25rem] border border-[#DED0CB] bg-[#FBF8F6] p-4"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : workout.id)
                      }
                      aria-expanded={expanded}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] tracking-[0.18em] text-[#9D6F67]">
                          {workout.focus.toUpperCase()}
                        </p>

                        <span className="text-lg text-[#A77B73]">
                          {expanded ? "−" : "+"}
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-xl text-[#211C19]">
                        {workout.name}
                      </h3>

                      <p className="mt-2 text-[11px] text-[#806E68]">
                        {exercises.length}{" "}
                        {exercises.length === 1
                          ? "exercise"
                          : "exercises"}{" "}
                        · Created by you ♡
                      </p>

                      <p className="mt-3 text-[10px] tracking-[0.1em] text-[#8F655E]">
                        {expanded ? "CLOSE WORKOUT ↑" : "VIEW WORKOUT →"}
                      </p>
                    </button>

                    {expanded && (
                      <div className="mt-4 border-t border-[#DED0CB] pt-4">
                        <p className="mb-3 text-[9px] tracking-[0.2em] text-[#9D6F67]">
                          YOUR EXERCISES
                        </p>

                        <div className="space-y-2">
                          {exercises.map((exercise, index) => (
                            <div
                              key={exercise.id || index}
                              className="rounded-xl border border-[#E1D3CE] bg-white p-3"
                            >
                              <p className="text-[12px] text-[#211C19]">
                                {String(index + 1).padStart(2, "0")}.{" "}
                                {exercise.name}
                              </p>

                              <p className="mt-1 text-[10px] text-[#927D76]">
                                {exercise.sets} sets · {exercise.reps} reps
                                {exercise.weight
                                  ? ` · ${exercise.weight}`
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>



<button
  type="button"
  onClick={() => addWorkoutToToday(workout)}
  disabled={
    addingWorkoutId !== null ||
    addedWorkoutIds.includes(workout.id)
  }
  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#211C19] px-4 py-3 text-[10px] tracking-[0.12em] text-white disabled:opacity-60"
>
  {addingWorkoutId === workout.id
    ? "ADDING..."
    : addedWorkoutIds.includes(workout.id)
      ? "ADDED TO TODAY ✓"
      : "ADD TO TODAY ♡"}
</button>

{addError && expandedId === workout.id && (
  <p
    role="alert"
    className="mt-2 text-center text-[11px] text-[#A35F58]"
  >
    {addError}
  </p>
)}

                        <Link
  href={`/dashboard/guide/build-workout?edit=${workout.id}`}
  className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#CBA9A2] bg-[#EAD8D3] px-4 py-3 text-[10px] tracking-[0.12em] text-[#8F655E]"
>
  EDIT WORKOUT →
</Link>

{deleteId === workout.id ? (
  <div className="mt-4 rounded-xl border border-[#DED0CB] bg-white p-4 text-center">
    <p className="font-serif text-lg text-[#211C19]">
      Delete this workout?
    </p>

    <p className="mt-2 text-[11px] leading-5 text-[#806E68]">
      This will permanently remove your saved routine.
    </p>

    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => setDeleteId(null)}
        className="rounded-xl border border-[#DED0CB] px-3 py-3 text-[10px] tracking-[0.1em] text-[#806E68]"
      >
        CANCEL
      </button>

      <button
  type="button"
  onClick={() => deleteWorkout(workout.id)}
  disabled={isDeleting}
  className="rounded-xl bg-[#211C19] px-3 py-3 text-[10px] tracking-[0.1em] text-white disabled:opacity-50"
>
  {isDeleting ? "DELETING..." : "YES, DELETE"}
</button>

{deleteError && (
  <p role="alert" className="mt-3 text-center text-[11px] text-[#A35F58]">
    {deleteError}
  </p>
)}

    </div>
  </div>
) : (
  <button
    type="button"
    onClick={() => setDeleteId(workout.id)}
    className="mt-4 w-full py-2 text-center text-[10px] tracking-[0.12em] text-[#A35F58]"
  >
    DELETE WORKOUT
  </button>
)}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {!loading && !errorMessage && workouts.length > 0 && (
          <Link
            href="/dashboard/guide/build-workout"
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#211C19] px-5 py-4 text-[11px] tracking-[0.1em] text-white"
          >
            + BUILD ANOTHER WORKOUT ♡
          </Link>
        )}
   
    </main>
  );
}
