
import type {
  WorkoutDetail,
  WorkoutExercise,
  ExerciseSwap,
} from "../workoutDetails";

type CardioSwap = Pick<
  ExerciseSwap,
  "name" | "location" | "note"
>;

const exerciseSwaps: Record<string, CardioSwap[]> = {
  "Steady Cardio": [
    {
      name: "Walking Pad",
      location: "HOME",
      note: "Low-impact steady cardio that lets you control your pace.",
    },
    {
      name: "Outdoor Walk",
      location: "BOTH",
      note: "Simple steady-state cardio that can be adjusted to your pace.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Low-impact cardio option with continuous movement.",
    },
  ],

  "Squat to Reach": [
    {
      name: "Bodyweight Squat",
      location: "BOTH",
      note: "Keeps the lower-body movement without the overhead reach.",
    },
    {
      name: "Step-Up",
      location: "BOTH",
      note: "A simple lower-body movement that can be performed at a steady pace.",
    },
    {
      name: "March to Reach",
      location: "HOME",
      note: "Keeps the full-body rhythm with less squat depth.",
    },
  ],

  "Low-Impact Cardio Push": [
    {
      name: "Fast March",
      location: "HOME",
      note: "Simple low-impact cardio that can be performed at different speeds.",
    },
    {
      name: "Step Jacks",
      location: "HOME",
      note: "Low-impact jumping-jack alternative that keeps you moving.",
    },
    {
      name: "Bike Push",
      location: "GYM",
      note: "Allows you to increase effort without impact from running or jumping.",
    },
  ],

  "Alternating Reverse Lunge": [
    {
      name: "Step-Up",
      location: "BOTH",
      note: "Single-leg movement that can be performed at a controlled pace.",
    },
    {
      name: "Bodyweight Squat",
      location: "BOTH",
      note: "Bilateral lower-body option when lunges are uncomfortable.",
    },
    {
      name: "Low Step Touch",
      location: "HOME",
      note: "Lower-impact movement that keeps you continuously moving.",
    },
  ],

  "Cardio Interval": [
    {
      name: "Walking Pad Intervals",
      location: "HOME",
      note: "Alternate between an easy walk and a faster controlled pace.",
    },
    {
      name: "Outdoor Walk Intervals",
      location: "BOTH",
      note: "Use changes in pace to create your work and recovery intervals.",
    },
    {
      name: "Bike Intervals",
      location: "GYM",
      note: "Alternate resistance or speed for your work and recovery periods.",
    },
  ],

  "Standing Knee Drive": [
    {
      name: "March in Place",
      location: "HOME",
      note: "A lower-intensity version of alternating knee drives.",
    },
    {
      name: "Step Touch",
      location: "HOME",
      note: "Easy standing cardio option with controlled side-to-side movement.",
    },
    {
      name: "Elliptical",
      location: "GYM",
      note: "Continuous low-impact cardio option for the same interval.",
    },
  ],

  "Final Cardio Finish": [
    {
      name: "Brisk Walk",
      location: "BOTH",
      note: "Simple way to finish with a controlled increase in pace.",
    },
    {
      name: "Walking Pad",
      location: "HOME",
      note: "Lets you control your final pace while gradually slowing down.",
    },
    {
      name: "Bike",
      location: "GYM",
      note: "Controlled cardio option that makes it easy to gradually reduce intensity.",
    },
  ],
};

// Converts the original swap choices into the shared format.
// We'll transfer the original swap-specific instructions
// separately before switching the live workout route.
function withSwaps(
  exercise: WorkoutExercise
): WorkoutExercise {
  const options = exerciseSwaps[exercise.name] ?? [];

  return {
    ...exercise,
    swaps: options.map((option) => ({
      ...option,
      cue: exercise.cue,
      modification: exercise.modification,
    })),
  };
}

const exercises: WorkoutExercise[] = [
  {
    id: "steady-cardio",
    name: "Steady Cardio",
    sets: 1,
    reps: "5 MIN",
    restSeconds: 30,
    cue: "Move at a pace that raises your heart rate while still letting you stay in control of your breathing.",
    modification: "Slow the pace or shorten the interval to 3 minutes.",
    home: "Brisk march, walking pad, stairs, or outdoor walk — 5 min",
    gym: "Treadmill, bike, elliptical, or stair climber — 5 min",
  },
  {
    id: "squat-to-reach",
    name: "Squat to Reach",
    sets: 3,
    reps: "40 SEC",
    restSeconds: 20,
    cue: "Sit into a comfortable squat, stand tall, and reach overhead without rushing the movement.",
    modification: "Use a shallower squat or squat to a chair.",
    home: "Bodyweight Squat to Reach — 40 sec",
    gym: "Bodyweight Squat to Reach — 40 sec",
  },
  {
    id: "low-impact-cardio-push",
    name: "Low-Impact Cardio Push",
    sets: 3,
    reps: "45 SEC",
    restSeconds: 30,
    cue: "Keep a steady rhythm and stay light on your feet while maintaining good posture.",
    modification: "Reduce the pace and keep one foot on the floor at all times.",
    home: "Fast March or Step Jacks — 45 sec",
    gym: "Incline Treadmill Walk or Bike Push — 45 sec",
  },
  {
    id: "alternating-reverse-lunge",
    name: "Alternating Reverse Lunge",
    sets: 3,
    reps: "8 / SIDE",
    restSeconds: 30,
    cue: "Step back with control, keep your front foot planted, and drive through it to return to standing.",
    modification: "Hold a stable surface or use a smaller range of motion.",
    home: "Bodyweight Reverse Lunge — 3 sets × 8 / side",
    gym: "Bodyweight or Light Dumbbell Reverse Lunge — 3 sets × 8 / side",
  },
  {
    id: "cardio-interval",
    name: "Cardio Interval",
    sets: 4,
    reps: "30 SEC",
    restSeconds: 30,
    cue: "Increase your effort for the work interval, then deliberately bring the pace down during recovery.",
    modification: "Keep both intervals at a moderate pace instead of pushing intensity.",
    home: "Walking Pad, Stairs, Fast March, or Outdoor Pace Pick-Up",
    gym: "Treadmill, Bike, Rower, Elliptical, or Stair Climber",
  },
  {
    id: "standing-knee-drive",
    name: "Standing Knee Drive",
    sets: 3,
    reps: "30 SEC",
    restSeconds: 30,
    cue: "Brace your core and drive one knee up at a time while staying tall through your torso.",
    modification: "Slow the tempo and hold a wall or rail for balance.",
    home: "Alternating Standing Knee Drives — 30 sec",
    gym: "Alternating Standing Knee Drives — 30 sec",
  },
  {
    id: "final-cardio-finish",
    name: "Final Cardio Finish",
    sets: 1,
    reps: "3 MIN",
    restSeconds: 0,
    cue: "Finish at a challenging but controlled pace, then gradually slow down during the final 30 seconds.",
    modification: "Keep the entire interval at a comfortable steady pace.",
    home: "Brisk Walk, Walking Pad, Stairs, or Fast March — 3 min",
    gym: "Treadmill, Bike, Elliptical, Rower, or Stair Climber — 3 min",
  },
];

export const cardioLockIn: WorkoutDetail = {
  id: "cardio-lock-in",
  title: "Cardio",
  accentTitle: "Lock In.",
  eyebrow: "CARDIO • INTERMEDIATE",
  description:
    "Build your conditioning through controlled cardio intervals, steady movement, and intentional recovery.",
  subtitle: "heart up. head clear. ♡",
  durationMinutes: 30,
  focus: "Cardio + conditioning",
  equipmentLabel: "Home or gym",

  warmup: [
    "Easy march or walk — 60 sec",
    "Arm swings — 30 sec",
    "Bodyweight squats — 10 reps",
    "Alternating step-backs — 6 / side",
  ],

  exercises: exercises.map(withSwaps),

  cooldown: [
    "Easy walk — 2 min",
    "Standing quad stretch — 30 sec / side",
    "Calf stretch — 30 sec / side",
    "Slow breathing — 60 sec",
  ],
};
