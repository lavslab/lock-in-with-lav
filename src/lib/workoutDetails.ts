import { cardioLockIn } from "./workoutData/cardio-lock-in";
import { coreControl } from "./workoutData/core-control";
import { fullBodyReset } from "@/lib/workoutData/full-body-reset";
import { gluteBuilder } from "@/lib/workoutData/glute-builder";
import { gymBackBiceps } from "@/lib/workoutData/gym-back-biceps";
import { gymChestTriceps } from "@/lib/workoutData/gym-chest-triceps";
import { gymGluteLegs } from "@/lib/workoutData/gym-glute-legs";
import { gymMachineCardio } from "@/lib/workoutData/gym-machine-cardio";
import { homeBackBiceps } from "@/lib/workoutData/home-back-biceps";
import { homeChestTriceps } from "@/lib/workoutData/home-chest-triceps";
import { homeGluteLegs } from "@/lib/workoutData/home-glute-legs";
import { upperBodyBuild } from "@/lib/workoutData/upper-body-build";
export type ExerciseLocation = "HOME" | "GYM" | "BOTH";

export type ExerciseSwap = {
  name: string;
  location: ExerciseLocation;
  note: string;
  cue: string;
  modification: string;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  cue: string;
  modification: string;
  home: string;
  gym: string;
  swaps?: ExerciseSwap[];
};

export type WorkoutDetail = {
  id: string;
  title: string;
  accentTitle?: string;
  eyebrow: string;
  description: string;
  subtitle: string;
  durationMinutes: number;
  focus: string;
  equipmentLabel: string;
  warmup: string[];
  exercises: WorkoutExercise[];
  cooldown: string[];
};

// One reusable collection of exercise alternatives.
// We can share these between different workouts.
const squatSwaps: ExerciseSwap[] = [
  {
    name: "Leg Press",
    location: "GYM",
    note: "Stable option for loading the quads and glutes.",
    cue: "Sit back into the machine with your feet about shoulder-width apart. Lower the platform with control, then drive through your whole foot without locking your knees.",
    modification: "Use a lighter weight or reduce your range of motion.",
  },
  {
    name: "Dumbbell Squat",
    location: "BOTH",
    note: "Easy swap when a barbell is not available.",
    cue: "Hold dumbbells at your sides or shoulders, brace your core, sit your hips down and back, then stand tall.",
    modification: "Use lighter dumbbells or bodyweight.",
  },
  {
    name: "Split Squat",
    location: "BOTH",
    note: "Single-leg option that still trains quads and glutes.",
    cue: "Stand in a staggered stance, lower your back knee toward the floor, then drive through your front foot.",
    modification: "Hold onto a stable surface or reduce your range of motion.",
  },
];

const hingeSwaps: ExerciseSwap[] = [
  {
    name: "Cable Pull-Through",
    location: "GYM",
    note: "Hip-dominant option with less loading in the hands.",
    cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then extend your hips to stand tall.",
    modification: "Use a lighter cable weight or shorten your range of motion.",
  },
  {
    name: "Good Morning",
    location: "BOTH",
    note: "Another hinge pattern for hamstrings and glutes.",
    cue: "Stand tall with softly bent knees. Push your hips back with a neutral spine, then return to standing.",
    modification: "Reduce your range of motion or use no added resistance.",
  },
  {
    name: "Single-Leg RDL",
    location: "BOTH",
    note: "Adds unilateral work and balance.",
    cue: "Balance on one leg, push your hips back while reaching the opposite leg behind you, then return to standing.",
    modification: "Keep your other toes lightly on the floor or hold a stable surface.",
  },
];

const lungeSwaps: ExerciseSwap[] = [
  {
    name: "Split Squat",
    location: "BOTH",
    note: "Removes the stepping component.",
    cue: "Keep a staggered stance, lower with control, then push through your front foot.",
    modification: "Use a stable surface for balance.",
  },
  {
    name: "Step-Up",
    location: "BOTH",
    note: "Single-leg option using a box, step or bench.",
    cue: "Place one foot on a stable step, drive through that foot to stand, then lower with control.",
    modification: "Use a lower step or hold onto a stable surface.",
  },
  {
    name: "Leg Press",
    location: "GYM",
    note: "Stable bilateral alternative for lower-body loading.",
    cue: "Sit back into the machine, lower the platform with control, then press through your whole foot.",
    modification: "Use a lighter weight or reduce your range of motion.",
  },
];

const bridgeSwaps: ExerciseSwap[] = [
  {
    name: "Hip Thrust",
    location: "BOTH",
    note: "A stronger hip-extension option for the glutes.",
    cue: "Rest your upper back against a stable bench or couch. Drive through your feet to lift your hips, then lower with control.",
    modification: "Use bodyweight or reduce the range of motion.",
  },
  {
    name: "Dumbbell Hip Thrust",
    location: "BOTH",
    note: "Same pattern with easier equipment.",
    cue: "Rest your upper back on a stable bench with a dumbbell across your hips. Lift your hips with control.",
    modification: "Use a lighter dumbbell or bodyweight.",
  },
  {
    name: "Cable Pull-Through",
    location: "GYM",
    note: "Trains hip extension from a standing position.",
    cue: "Push your hips back while holding the cable, then extend your hips to stand.",
    modification: "Use a lighter cable weight.",
  },
  {
    name: "Frog Pump",
    location: "HOME",
    note: "Low-equipment glute-focused option.",
    cue: "Lie on your back with the soles of your feet together and knees open. Lift your hips, then lower.",
    modification: "Use a smaller range of motion.",
  },
];

export const workoutDetails: Record<string, WorkoutDetail> = {
  "lower-body-foundation": {
    id: "lower-body-foundation",
    title: "Lower Body",
    accentTitle: "Foundation.",
    eyebrow: "LOWER BODY • BEGINNER",
    description:
      "Build strength through your legs and glutes with controlled, beginner-friendly movement.",
    subtitle: "build the base. ♡",
    durationMinutes: 35,
    focus: "Legs + glutes",
    equipmentLabel: "Home or gym",

    warmup: [
      "Bodyweight squats — 10 reps",
      "Hip hinges — 10 reps",
      "Alternating reverse lunges — 6 / side",
      "Glute bridges — 10 reps",
    ],

    exercises: [
      {
        id: "goblet-squat",
        name: "Goblet Squat",
        sets: 3,
        reps: "10–12",
        restSeconds: 60,
        cue: "Keep the weight close to your chest, brace your core, and sit down between your hips.",
        modification: "Use bodyweight or squat to a chair.",
        home: "Goblet Squat — 3 sets × 10–12 reps",
        gym: "Leg Press — 3 sets × 10–12 reps",
        swaps: squatSwaps,
      },
      {
        id: "dumbbell-romanian-deadlift",
        name: "Dumbbell Romanian Deadlift",
        sets: 3,
        reps: "10–12",
        restSeconds: 60,
        cue: "Push your hips back with soft knees and keep the dumbbells close to your legs.",
        modification: "Use lighter weights and shorten your range of motion.",
        home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
        gym: "Smith Machine Romanian Deadlift — 3 sets × 10–12 reps",
        swaps: hingeSwaps,
      },
      {
        id: "reverse-lunge",
        name: "Reverse Lunge",
        sets: 3,
        reps: "8–10 / side",
        restSeconds: 60,
        cue: "Step back with control and keep your front foot planted as you lower.",
        modification: "Hold onto a stable surface or perform stationary split squats.",
        home: "Dumbbell Reverse Lunge — 3 sets × 8–10 / side",
        gym: "Smith Machine Reverse Lunge — 3 sets × 8–10 / side",
        swaps: lungeSwaps,
      },
      {
        id: "glute-bridge",
        name: "Glute Bridge",
        sets: 3,
        reps: "12–15",
        restSeconds: 45,
        cue: "Drive through your heels and squeeze your glutes at the top without overextending your back.",
        modification: "Use bodyweight and reduce the range if needed.",
        home: "Dumbbell Glute Bridge — 3 sets × 12–15 reps",
        gym: "Hip Thrust Machine — 3 sets × 12–15 reps",
        swaps: bridgeSwaps,
      },
      {
        id: "dumbbell-sumo-squat",
        name: "Dumbbell Sumo Squat",
        sets: 3,
        reps: "10–12",
        restSeconds: 60,
        cue: "Take a comfortable wide stance, track your knees with your toes, and stay tall through your chest.",
        modification: "Perform the movement without weight.",
        home: "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
        gym: "Hack Squat or Leg Press — 3 sets × 10–12 reps",
      },
      {
        id: "standing-calf-raise",
        name: "Standing Calf Raise",
        sets: 3,
        reps: "15",
        restSeconds: 45,
        cue: "Rise slowly onto the balls of your feet, pause at the top, and lower with control.",
        modification: "Hold a wall or chair for balance.",
        home: "Standing Calf Raise — 3 sets × 15 reps",
        gym: "Calf Raise Machine — 3 sets × 15 reps",
      },
    ],

    cooldown: [
      "Quad stretch — 30 sec / side",
      "Hamstring stretch — 30 sec / side",
      "Figure-four stretch — 30 sec / side",
      "Slow breathing — 60 sec",
    ],
  },


  "cardio-lock-in": cardioLockIn,
  "core-control": coreControl,
  "full-body-reset": fullBodyReset,
  "glute-builder": gluteBuilder,
  "gym-back-biceps": gymBackBiceps,
  "gym-chest-triceps": gymChestTriceps,
  "gym-glute-legs": gymGluteLegs,
  "gym-machine-cardio": gymMachineCardio,
  "home-back-biceps": homeBackBiceps,
"home-chest-triceps": homeChestTriceps,
"home-glute-legs": homeGluteLegs,
"upper-body-build": upperBodyBuild,



};

export function getWorkoutDetail(
  id: string
): WorkoutDetail | null {
  return workoutDetails[id] ?? null;
}
