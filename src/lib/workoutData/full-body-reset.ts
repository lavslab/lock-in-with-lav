
import type { WorkoutDetail } from "@/lib/workoutDetails";

export const fullBodyReset: WorkoutDetail = {
  id: "full-body-reset",
  eyebrow: "FULL BODY • BEGINNER",
  title: "Full Body",
  accentTitle: "Reset.",
  description:
    "A simple equipment-free session to move your whole body, build control, and get back into your rhythm.",
  subtitle: "move everything. ♡",
  durationMinutes: 25,
  focus: "Full body",
  equipmentLabel: "None",

  warmup: [
    "March in place — 60 sec",
    "Arm circles — 10 each direction",
    "Bodyweight good mornings — 10 reps",
    "Alternating step-back lunges — 6 / side",
  ],

  cooldown: [
    "Standing quad stretch — 30 sec / side",
    "Chest + shoulder stretch — 30 sec / side",
    "Figure-four stretch — 30 sec / side",
    "Slow breathing — 60 sec",
  ],

  exercises: [
    {
      id: "bodyweight-squat",
      name: "Bodyweight Squat",
      sets: 3,
      reps: "12",
      restSeconds: 45,
      cue: "Brace your core, sit down between your hips, and keep your knees tracking in the same direction as your toes.",
      modification:
        "Squat to a chair or reduce your range of motion.",
      home: "Bodyweight Squat — 3 sets × 12 reps",
      gym: "Bodyweight Squat — 3 sets × 12 reps",
      swaps: [
        {
          name: "Goblet Squat",
          location: "HOME",
          note: "Adds light resistance while keeping the same squat pattern.",
          cue: "Hold the dumbbell close to your chest. Sit your hips down and back while keeping your chest lifted, then drive through your feet to stand.",
          modification:
            "Use a lighter dumbbell or perform the squat with bodyweight.",
        },
        {
          name: "Chair Squat",
          location: "HOME",
          note: "Provides a stable target and keeps the movement beginner-friendly.",
          cue: "Stand in front of a sturdy chair with your feet about shoulder-width apart. Push your hips back and lower until you lightly touch the chair, then drive through your feet to stand.",
          modification:
            "Use a higher seat or reduce how far you lower.",
        },
        {
          name: "Leg Press",
          location: "GYM",
          note: "Stable machine-based option for training the lower body.",
          cue: "Sit securely in the machine with your feet planted on the platform. Lower the weight with control, then press through your whole foot to return to the starting position.",
          modification:
            "Use a lighter weight or reduce your range of motion.",
        },
      ],
    },
    {
      id: "incline-push-up",
      name: "Incline Push-Up",
      sets: 3,
      reps: "8–10",
      restSeconds: 45,
      cue: "Keep your body in one straight line and lower your chest toward the surface with your elbows angled slightly back.",
      modification:
        "Use a higher surface, such as a counter or sturdy table.",
      home: "Incline Push-Up — 3 sets × 8–10 reps",
      gym: "Incline Push-Up — 3 sets × 8–10 reps",
      swaps: [
        {
          name: "Wall Push-Up",
          location: "HOME",
          note: "A higher surface makes the pushing movement easier.",
          cue: "Place your hands on a wall slightly wider than your shoulders. Keep your body in a straight line, bend your elbows to bring your chest toward the wall, then press away.",
          modification:
            "Stand closer to the wall to make the movement easier.",
        },
        {
          name: "Knee Push-Up",
          location: "HOME",
          note: "Keeps the push-up pattern with less bodyweight to control.",
          cue: "Start with your knees on the floor and your hands slightly wider than your shoulders. Keep your body aligned from your knees to your head, lower your chest, then press back up.",
          modification:
            "Perform the movement from a higher surface such as a bench or counter.",
        },
        {
          name: "Chest Press",
          location: "GYM",
          note: "Machine-based pressing option for the same general movement pattern.",
          cue: "Sit with your back supported and the handles around chest height. Press the handles forward until your arms are extended without locking your elbows, then return slowly.",
          modification:
            "Use a lighter resistance or shorten the pressing range.",
        },
      ],
    },
    {
      id: "alternating-reverse-lunge",
      name: "Alternating Reverse Lunge",
      sets: 3,
      reps: "8 / SIDE",
      restSeconds: 45,
      cue: "Step back softly, lower with control, and drive through your front foot to return to standing.",
      modification:
        "Hold a wall or chair for balance, or use a smaller range of motion.",
      home: "Alternating Reverse Lunge — 3 sets × 8 / side",
      gym: "Alternating Reverse Lunge — 3 sets × 8 / side",
      swaps: [
        {
          name: "Split Squat",
          location: "BOTH",
          note: "Keeps the single-leg pattern without requiring a step.",
          cue: "Stand in a staggered stance and lower your back knee toward the floor while keeping your front foot planted. Drive through your front foot to return to standing.",
          modification:
            "Hold onto a stable surface or reduce your range of motion.",
        },
        {
          name: "Step-Up",
          location: "BOTH",
          note: "Single-leg option using a stable step or bench.",
          cue: "Place one foot on a stable step or bench. Drive through that foot to stand tall, then lower yourself back down slowly and with control.",
          modification:
            "Use a lower step or hold onto a stable surface.",
        },
        {
          name: "Goblet Squat",
          location: "BOTH",
          note: "Bilateral option when single-leg work is not comfortable.",
          cue: "Hold the dumbbell close to your chest. Sit your hips down and back while keeping your chest lifted, then drive through your feet to stand.",
          modification:
            "Use a lighter dumbbell or perform the squat with bodyweight.",
        },
      ],
    },
    {
      id: "glute-bridge",
      name: "Glute Bridge",
      sets: 3,
      reps: "15",
      restSeconds: 45,
      cue: "Press through your heels, keep your ribs down, and squeeze your glutes at the top without arching your lower back.",
      modification:
        "Reduce your range of motion or pause briefly between reps.",
      home: "Glute Bridge — 3 sets × 15 reps",
      gym: "Glute Bridge — 3 sets × 15 reps",
      swaps: [
        {
          name: "Hip Thrust",
          location: "BOTH",
          note: "A larger-range hip extension movement for the glutes.",
          cue: "Rest your upper back against a stable bench or couch. Drive through your heels to lift your hips, squeeze your glutes at the top, then lower with control.",
          modification:
            "Use bodyweight only or reduce your range of motion.",
        },
        {
          name: "Frog Pump",
          location: "HOME",
          note: "Simple floor-based option with a strong glute focus.",
          cue: "Lie on your back with the soles of your feet together and your knees open. Drive your hips upward, squeeze your glutes at the top, then lower slowly.",
          modification:
            "Use a smaller range of motion or perform fewer repetitions.",
        },
        {
          name: "Cable Pull-Through",
          location: "GYM",
          note: "Standing hip-extension option with cable resistance.",
          cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then drive your hips forward and squeeze your glutes to stand tall.",
          modification:
            "Use a lighter cable weight or shorten your range of motion.",
        },
      ],
    },
    {
      id: "bird-dog",
      name: "Bird Dog",
      sets: 3,
      reps: "8 / SIDE",
      restSeconds: 30,
      cue: "Brace your core and reach the opposite arm and leg away from you while keeping your hips square to the floor.",
      modification:
        "Move only your arm or only your leg until you feel stable.",
      home: "Bird Dog — 3 sets × 8 / side",
      gym: "Bird Dog — 3 sets × 8 / side",
      swaps: [
        {
          name: "Dead Bug",
          location: "HOME",
          note: "Core-focused option that trains controlled opposite-side movement.",
          cue: "Lie on your back with your arms up and knees bent. Brace your core and slowly extend the opposite arm and leg while keeping your lower back gently pressed into the floor.",
          modification:
            "Move one limb at a time instead of the opposite arm and leg together.",
        },
        {
          name: "Quadruped Leg Extension",
          location: "HOME",
          note: "Simplifies the movement by focusing on the lower body.",
          cue: "Start on all fours and extend one leg straight behind you while keeping your hips square. Pause briefly, then return with control.",
          modification:
            "Keep the moving leg lower or reduce the range of motion.",
        },
        {
          name: "Pallof Press",
          location: "GYM",
          note: "Anti-rotation core exercise using cable resistance.",
          cue: "Stand sideways to the cable with the handle at chest height. Hold it with both hands, brace your core, and press your hands straight forward without letting your torso rotate.",
          modification:
            "Use lighter resistance or press out only partway.",
        },
      ],
    },
    {
      id: "low-impact-mountain-climber",
      name: "Low-Impact Mountain Climber",
      sets: 3,
      reps: "30 SEC",
      restSeconds: 45,
      cue: "Keep your hands under your shoulders and step one knee forward at a time while keeping your core engaged.",
      modification:
        "Perform the movement with your hands elevated on a sturdy surface.",
      home: "Low-Impact Mountain Climber — 3 sets × 30 sec",
      gym: "Low-Impact Mountain Climber — 3 sets × 30 sec",
      swaps: [
        {
          name: "Marching Plank",
          location: "HOME",
          note: "Keeps the plank position while slowing down the movement.",
          cue: "Start in a strong plank with your hands under your shoulders. Keep your hips steady while slowly lifting one hand or foot at a time.",
          modification:
            "Perform the plank from your knees or elevate your hands on a sturdy surface.",
        },
        {
          name: "Standing Knee Drive",
          location: "HOME",
          note: "Low-impact standing option that still gets the body moving.",
          cue: "Stand tall and drive one knee toward your chest while keeping your torso controlled. Lower it with control and alternate sides.",
          modification:
            "Slow the movement down or hold onto a stable surface.",
        },
        {
          name: "Bike",
          location: "GYM",
          note: "Low-impact cardio option that can be performed at a controlled pace.",
          cue: "Set the bike comfortably and pedal at a controlled pace. Keep your posture tall and maintain a steady rhythm throughout the interval.",
          modification:
            "Lower the resistance and keep the pace comfortable.",
        },
      ],
    },
  ],
};
