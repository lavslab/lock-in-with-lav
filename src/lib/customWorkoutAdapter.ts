
import type { WorkoutDetail } from "@/lib/workoutDetails";

export type SavedCustomExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

export type SavedCustomWorkout = {
  id: string;
  name: string;
  focus: string;
  exercises: SavedCustomExercise[];
};

export function adaptCustomWorkout(
  workout: SavedCustomWorkout
): WorkoutDetail {
  return {
    id: `custom:${workout.id}`,
    title: workout.name,
    eyebrow: "YOUR CUSTOM WORKOUT ♡",
    description: "A routine created by you, for you.",
    subtitle: "made by you, for you. ♡",
    durationMinutes: 45,
    focus: workout.focus,
    equipmentLabel: "Your choice",
    warmup: [],
    cooldown: [],
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: Math.max(1, Number.parseInt(exercise.sets, 10) || 1),
      reps: exercise.reps,
      restSeconds: 60,
      cue: "",
      modification: "",
      home: "",
      gym: "",
    })),
  };
}
