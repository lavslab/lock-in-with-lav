
export type TrainingMethodId =
  | "beginner"
  | "lock-in"
  | "custom";

export type TrainingDay = {
  day: string;
  title: string;
  focus: string;
  recommendedWorkoutIds: string[];
};

export type TrainingMethod = {
  id: TrainingMethodId;
  title: string;
  label: string;
  description: string;
  days: TrainingDay[];
};

export const trainingMethods: TrainingMethod[] = [
  {
    id: "beginner",
    title: "The Beginner Method",
    label: "FOUNDATION",
    description:
      "Build strength, confidence, and consistency with a guided weekly plan.",
    days: [
      {
        day: "01",
        title: "FULL BODY",
        focus: "Strength + Foundations",
        recommendedWorkoutIds: ["full-body-reset"],
      },
      {
        day: "02",
        title: "CARDIO",
        focus: "Low-Impact Movement",
        recommendedWorkoutIds: ["cardio-lock-in"],
      },
      {
        day: "03",
        title: "RECOVER",
        focus: "Rest + Gentle Walking",
        recommendedWorkoutIds: [],
      },
      {
        day: "04",
        title: "FULL BODY",
        focus: "Strength + Control",
        recommendedWorkoutIds: ["full-body-reset"],
      },
      {
        day: "05",
        title: "CARDIO + CORE",
        focus: "Conditioning + Stability",
        recommendedWorkoutIds: [
          "cardio-lock-in",
          "core-control",
        ],
      },
      {
        day: "06",
        title: "FULL BODY",
        focus: "Strength + Confidence",
        recommendedWorkoutIds: ["full-body-reset"],
      },
      {
        day: "07",
        title: "RECOVER",
        focus: "Mobility + Recovery",
        recommendedWorkoutIds: [],
      },
    ],
  },
  {
    id: "lock-in",
    title: "The Lock In Method",
    label: "SIGNATURE",
    description:
      "A structured split for strength, conditioning, and body recomposition.",
    days: [
      {
        day: "01",
        title: "LOWER BODY",
        focus: "Heavy Glute Strength",
        recommendedWorkoutIds: ["glute-builder"],
      },
      {
        day: "02",
        title: "UPPER BODY",
        focus: "Back + Biceps + Posture",
        recommendedWorkoutIds: ["home-back-biceps"],
      },
      {
        day: "03",
        title: "CONDITIONING",
        focus: "Cardio + Endurance",
        recommendedWorkoutIds: ["cardio-lock-in"],
      },
      {
        day: "04",
        title: "LOWER BODY",
        focus: "Glutes + Quads + Hamstrings",
        recommendedWorkoutIds: ["lower-body-foundation"],
      },
      {
        day: "05",
        title: "UPPER BODY + CORE",
        focus: "Chest + Shoulders + Core",
        recommendedWorkoutIds: [
          "upper-body-build",
          "core-control",
        ],
      },
      {
        day: "06",
        title: "CORE + MOBILITY",
        focus: "Stability + Recovery",
        recommendedWorkoutIds: ["core-control"],
      },
      {
        day: "07",
        title: "RECOVER",
        focus: "Rest + Gentle Movement",
        recommendedWorkoutIds: [],
      },
    ],
  },
  {
    id: "custom",
    title: "Your Own Method",
    label: "PERSONALIZED",
    description:
      "Choose your training days, workouts, and exercises to fit your life.",
    days: [],
  },
];

export const getTrainingMethod = (
  methodId: TrainingMethodId
) => trainingMethods.find((method) => method.id === methodId);

export const getRecommendedWorkouts = (
  methodId: TrainingMethodId
): Record<string, string[]> => {
  const method = getTrainingMethod(methodId);

  if (!method) return {};

  return Object.fromEntries(
    method.days.map((day) => [
      day.day,
      [...day.recommendedWorkoutIds],
    ])
  );
};
