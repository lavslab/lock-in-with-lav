
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentChallengeDay } from "@/lib/challenge";
import type { WorkoutDetail } from "@/lib/workoutDetails";
import { getActiveJourney } from "@/lib/active-journey";

export type LoggedSet = {
  completed: boolean;
  weight: string;
  reps: string;
};

export type LoggedExercise = {
  selectedName: string;
  sets: LoggedSet[];
};

export type WorkoutSessionLogs = Record<string, LoggedExercise>;

type SessionStatus = "in_progress" | "completed";

type SavedExercise = {
  exerciseId: string;
  originalName: string;
  selectedName: string;
  sets: LoggedSet[];
};

type SessionRow = {
  id: string;
  status: SessionStatus;
  exercises: SavedExercise[];
};

export function createWorkoutLogs(
  workout: WorkoutDetail
): WorkoutSessionLogs {
  return Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      {
        selectedName: exercise.name,
        sets: Array.from({ length: exercise.sets }, () => ({
          completed: false,
          weight: "",
          reps: "",
        })),
      },
    ])
  );
}

function serializeLogs(
  workout: WorkoutDetail,
  logs: WorkoutSessionLogs
): SavedExercise[] {
  return workout.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    originalName: exercise.name,
    selectedName:
      logs[exercise.id]?.selectedName ?? exercise.name,
    sets:
      logs[exercise.id]?.sets ??
      createWorkoutLogs(workout)[exercise.id].sets,
  }));
}

function restoreLogs(
  workout: WorkoutDetail,
  saved: SavedExercise[]
): WorkoutSessionLogs {
  const restored = createWorkoutLogs(workout);

  if (!Array.isArray(saved)) return restored;

  for (const item of saved) {
    const original = restored[item.exerciseId];

    if (!original) continue;

    restored[item.exerciseId] = {
      selectedName:
        typeof item.selectedName === "string"
          ? item.selectedName
          : original.selectedName,
      sets: original.sets.map((defaultSet, index) => {
        const savedSet = item.sets?.[index];

        if (!savedSet) return defaultSet;

        return {
          completed: savedSet.completed === true,
          weight: String(savedSet.weight ?? ""),
          reps: String(savedSet.reps ?? ""),
        };
      }),
    };
  }

  return restored;
}

export function useWorkoutSession(workout: WorkoutDetail) {
  const [logs, setLogs] = useState<WorkoutSessionLogs>(() =>
    createWorkoutLogs(workout)
  );

  const [sessionId, setSessionId] = useState<string | null>(
    null
  );

  const [status, setStatus] = useState<SessionStatus>(
    "in_progress"
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const statusRef = useRef<SessionStatus>("in_progress");
  const logsRef = useRef<WorkoutSessionLogs>(logs);
  const readyRef = useRef(false);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const changeLogs = useCallback(
    (
      updater:
        | WorkoutSessionLogs
        | ((
            current: WorkoutSessionLogs
          ) => WorkoutSessionLogs)
    ) => {
      if (!readyRef.current) return;
      if (statusRef.current === "completed") return;

      setLogs((current) => {
        const next =
          typeof updater === "function"
            ? updater(current)
            : updater;

        logsRef.current = next;
        revisionRef.current += 1;

        return next;
      });
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setLoading(true);
      readyRef.current = false;

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          throw new Error("Please sign in to log workouts.");
        }

        if (cancelled) return;

        userIdRef.current = user.id;
const activeJourney = await getActiveJourney();

if (!activeJourney?.id || activeJourney.user_id !== user.id) {
  throw new Error("No active journey found for this workout.");
}

if (cancelled) return;


        const { data, error: queryError } = await supabase
          .from("workout_sessions")
          .select("id, status, exercises")
          .eq("user_id", user.id)
.eq("journey_id", activeJourney.id)
.eq("workout_id", workout.id)
.eq("status", "in_progress")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (queryError) throw queryError;
        if (cancelled) return;

        const session = data as SessionRow | null;

        if (session) {
          sessionIdRef.current = session.id;
          setSessionId(session.id);

          const restored = restoreLogs(
            workout,
            session.exercises
          );

          logsRef.current = restored;
          setLogs(restored);
        } else {
          const freshLogs = createWorkoutLogs(workout);

          sessionIdRef.current = null;
          setSessionId(null);

          logsRef.current = freshLogs;
          setLogs(freshLogs);
        }

        statusRef.current = "in_progress";
        setStatus("in_progress");

        revisionRef.current = 0;
        savedRevisionRef.current = 0;

        readyRef.current = true;
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load workout."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
      readyRef.current = false;
    };
  }, [workout]);

  const saveSnapshot = useCallback(
    async (
      snapshot: WorkoutSessionLogs,
      revision: number,
      nextStatus: SessionStatus,
      durationMinutes?: number
    ) => {
      const userId = userIdRef.current;

      if (!userId) {
        throw new Error("Please sign in to save your workout.");
      }

      const now = new Date().toISOString();

      // Only calculate the challenge day when finishing.
      // This keeps regular autosaves unchanged.
      let challengeDay: number | null = null;

      if (nextStatus === "completed") {
        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("challenge_start_date, challenge_length")
            .eq("id", userId)
            .single();

        if (profileError) throw profileError;

        if (!profile?.challenge_start_date) {
          throw new Error(
            "Please set your challenge start date before finishing your workout."
          );
        }

        challengeDay = getCurrentChallengeDay(
          profile.challenge_start_date,
          profile.challenge_length ?? 75
        );
      }
const activeJourney = await getActiveJourney();

if (!activeJourney?.id || activeJourney.user_id !== userId) {
  throw new Error("No active journey found for this workout.");
}


      const payload = {
  user_id: userId,
  journey_id: activeJourney.id,
  workout_id: workout.id,
        workout_title:
          `${workout.title} ${workout.accentTitle ?? ""}`.trim(),
        status: nextStatus,
        exercises: serializeLogs(workout, snapshot),
        updated_at: now,
        completed_at:
          nextStatus === "completed" ? now : null,

        ...(nextStatus === "completed"
          ? {
              duration_minutes: durationMinutes,
              challenge_day: challengeDay,
            }
          : {}),
      };

      if (sessionIdRef.current) {
        const { error: updateError } = await supabase
          .from("workout_sessions")
          .update(payload)
.eq("id", sessionIdRef.current)
.eq("user_id", userId)
.eq("journey_id", activeJourney.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from("workout_sessions")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) throw insertError;

        sessionIdRef.current = data.id;
        setSessionId(data.id);
      }

      savedRevisionRef.current = Math.max(
        savedRevisionRef.current,
        revision
      );
    },
    [workout]
  );

  const saveProgress = useCallback(
    (
      nextStatus: SessionStatus = "in_progress",
      durationMinutes?: number
    ) => {
      const snapshot = structuredClone(logsRef.current);
      const revision = revisionRef.current;

      const operation = queueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (
            statusRef.current === "completed" &&
            nextStatus === "in_progress"
          ) {
            return;
          }

          setSaving(true);
          setError(null);

          try {
            await saveSnapshot(
              snapshot,
              revision,
              nextStatus,
              durationMinutes
            );

            if (nextStatus === "completed") {
              statusRef.current = "completed";
              setStatus("completed");
            }
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : "Could not save workout.";

            setError(message);
            throw err;
          } finally {
            setSaving(false);
          }
        });

      queueRef.current = operation;
      return operation;
    },
    [saveSnapshot]
  );

  // Autosave workout progress after a short pause.
  useEffect(() => {
    if (
      loading ||
      !readyRef.current ||
      statusRef.current === "completed"
    ) {
      return;
    }

    if (
      revisionRef.current <= savedRevisionRef.current
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveProgress().catch(() => undefined);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [logs, loading, saveProgress]);

  const finishWorkout = useCallback(
    async (durationMinutes: number) => {
      if (!readyRef.current) {
        throw new Error("Workout is still loading.");
      }

      if (
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 1 ||
        durationMinutes > 1440
      ) {
        throw new Error(
          "Please enter a valid workout duration between 1 and 1440 minutes."
        );
      }

      if (statusRef.current === "completed") {
        throw new Error(
          "This workout has already been completed."
        );
      }

      await saveProgress("completed", durationMinutes);
    },
    [saveProgress]
  );

  return {
    logs,
    changeLogs,
    sessionId,
    status,
    loading,
    saving,
    error,
    saveProgress,
    finishWorkout,
  };
}
