
import type { WorkoutDetail } from "@/lib/workoutDetails";

export const gluteBuilder: WorkoutDetail = {
  id: "glute-builder",
  eyebrow: "GLUTES • INTERMEDIATE",
  title: "Glute",
  accentTitle: "Builder.",
  description:
    "Build strong glutes and hamstrings through controlled reps, focused tension, and a strong finish.",
  subtitle: "slow reps. strong finish. ♡",
  durationMinutes: 40,
  focus: "Glutes + hamstrings",
  equipmentLabel: "Home or gym",

  warmup: [
    "Bodyweight glute bridges — 12 reps",
    "Hip hinges — 10 reps",
    "Fire hydrants — 8 / side",
    "Banded lateral steps — 8 / side",
  ],

  cooldown: [
    "Figure-four stretch — 30 sec / side",
    "Half-kneeling hip flexor stretch — 30 sec / side",
    "Hamstring stretch — 30 sec / side",
    "Slow breathing — 60 sec",
  ],

  exercises: [
    {
      id: "dumbbell-hip-thrust",
      name: "Dumbbell Hip Thrust",
      sets: 4,
      reps: "10–12",
      restSeconds: 75,
      cue: "Keep your chin tucked, ribs down, and drive through your heels. Finish by squeezing your glutes without arching your lower back.",
      modification:
        "Use bodyweight or perform a glute bridge from the floor.",
      home: "Dumbbell Hip Thrust — 4 sets × 10–12 reps",
      gym: "Smith Machine Hip Thrust — 4 sets × 10–12 reps",
      swaps: [
        {
          name: "Glute Bridge",
          location: "BOTH",
          note: "A floor-based hip extension option that still targets the glutes.",
          cue: "Lie on your back with your knees bent and feet planted. Drive through your heels, lift your hips, squeeze your glutes at the top, then lower with control.",
          modification:
            "Use a smaller range of motion or pause between repetitions.",
        },
        {
          name: "Dumbbell Glute Bridge",
          location: "HOME",
          note: "Keeps the same glute-focused movement with less setup.",
          cue: "Lie on your back with your knees bent and feet planted. Place a dumbbell securely across your hips, drive through your heels, and squeeze your glutes at the top.",
          modification:
            "Remove the dumbbell and perform a bodyweight glute bridge.",
        },
        {
          name: "Cable Pull-Through",
          location: "GYM",
          note: "Standing hip-extension option with continuous cable tension.",
          cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then drive your hips forward and squeeze your glutes to stand tall.",
          modification:
            "Use a lighter cable weight or shorten your range of motion.",
        },
      ],
    },
    {
      id: "dumbbell-romanian-deadlift",
      name: "Dumbbell Romanian Deadlift",
      sets: 3,
      reps: "10–12",
      restSeconds: 60,
      cue: "Push your hips back with soft knees and keep the dumbbells close to your legs. Stop when you feel a strong hamstring stretch.",
      modification:
        "Use lighter dumbbells or shorten your range of motion.",
      home: "Dumbbell Romanian Deadlift — 3 sets × 10–12 reps",
      gym: "Barbell or Smith Machine RDL — 3 sets × 10–12 reps",
      swaps: [
        {
          name: "Dumbbell RDL",
          location: "BOTH",
          note: "Keeps the same hip-hinge pattern.",
          cue: "Hold the dumbbells close to your legs with soft knees. Push your hips back while keeping your spine neutral, then squeeze your glutes to return to standing.",
          modification:
            "Use lighter dumbbells or shorten your range of motion.",
        },
        {
          name: "Cable Pull-Through",
          location: "GYM",
          note: "Hip-dominant option with less loading in the hands.",
          cue: "Stand facing away from the cable with the handle between your legs. Push your hips back, then drive your hips forward and squeeze your glutes to stand tall.",
          modification:
            "Use a lighter cable weight or shorten your range of motion.",
        },
        {
          name: "Good Morning",
          location: "BOTH",
          note: "Another hinge pattern for hamstrings and glutes.",
          cue: "Stand tall with a soft bend in your knees. Push your hips back while keeping your spine neutral, then squeeze your glutes to return to standing.",
          modification:
            "Reduce your range of motion or perform the movement without added resistance.",
        },
        {
          name: "Single-Leg RDL",
          location: "BOTH",
          note: "Adds unilateral work and balance.",
          cue: "Balance on one leg and push your hips back while reaching the opposite leg behind you. Keep your hips square, then drive through your standing foot to return.",
          modification:
            "Keep the toes of your non-working leg lightly on the floor or hold onto a stable surface.",
        },
      ],
    },
    {
      id: "bulgarian-split-squat",
      name: "Bulgarian Split Squat",
      sets: 3,
      reps: "8–10 / side",
      restSeconds: 60,
      cue: "Take a long stance and lean slightly forward while keeping your front foot planted. Drive through the front heel to stand.",
      modification:
        "Keep your back foot on the floor and perform a stationary split squat.",
      home: "Dumbbell Bulgarian Split Squat — 3 sets × 8–10 / side",
      gym: "Smith Machine Bulgarian Split Squat — 3 sets × 8–10 / side",
      swaps: [
        {
          name: "Reverse Lunge",
          location: "BOTH",
          note: "Single-leg option without needing to elevate the back foot.",
          cue: "Stand tall, step one foot back, and lower your hips straight down with control. Drive through your front foot to return to standing.",
          modification:
            "Hold onto a stable surface or perform the movement without added weight.",
        },
        {
          name: "Split Squat",
          location: "BOTH",
          note: "Keeps the unilateral squat pattern without stepping.",
          cue: "Take a staggered stance and lower your back knee toward the floor while keeping your front foot planted. Drive through your front foot to stand.",
          modification:
            "Hold onto a stable surface or reduce your range of motion.",
        },
        {
          name: "Step-Up",
          location: "BOTH",
          note: "Single-leg option using a stable step or bench.",
          cue: "Place one foot on a stable step or bench. Drive through that foot to stand tall, then lower yourself back down with control.",
          modification:
            "Use a lower step or hold onto a stable surface for balance.",
        },
      ],
    },
    {
      id: "banded-lateral-walk",
      name: "Banded Lateral Walk",
      sets: 3,
      reps: "12 / side",
      restSeconds: 45,
      cue: "Keep tension on the band, stay slightly bent through your knees, and take controlled steps without rocking side to side.",
      modification:
        "Use a lighter band or perform fewer steps each direction.",
      home: "Banded Lateral Walk — 3 sets × 12 / side",
      gym: "Hip Abduction Machine — 3 sets × 12–15 reps",
      swaps: [
        {
          name: "Hip Abduction",
          location: "GYM",
          note: "Directly targets the outer glutes and hip abductors.",
          cue: "Sit upright in the hip abduction machine with your back supported. Press your knees outward against the pads, pause briefly, then return with control.",
          modification:
            "Use a lighter resistance or reduce the range of motion.",
        },
        {
          name: "Side-Lying Leg Raise",
          location: "HOME",
          note: "Simple bodyweight option for the same general area.",
          cue: "Lie on your side with your legs extended. Keep your hips stacked and lift the top leg without rolling your body backward, then lower slowly.",
          modification:
            "Reduce the height of the leg raise or bend the bottom knee for support.",
        },
        {
          name: "Standing Band Abduction",
          location: "HOME",
          note: "Keeps band tension while working one side at a time.",
          cue: "Stand tall with the band around your legs. Move one leg out to the side without leaning your torso, then return slowly while keeping tension on the band.",
          modification:
            "Use a lighter band or hold onto a stable surface.",
        },
      ],
    },
    {
      id: "dumbbell-sumo-squat",
      name: "Dumbbell Sumo Squat",
      sets: 3,
      reps: "10–12",
      restSeconds: 60,
      cue: "Use a comfortable wide stance, keep your chest tall, and drive the floor away as you stand and squeeze your glutes.",
      modification:
        "Use one lighter dumbbell or perform the movement with bodyweight.",
      home: "Dumbbell Sumo Squat — 3 sets × 10–12 reps",
      gym: "Leg Press — 3 sets × 10–12 reps",
      swaps: [
        {
          name: "Goblet Squat",
          location: "BOTH",
          note: "A squat variation that still trains the quads and glutes.",
          cue: "Hold one dumbbell close to your chest. Sit your hips down and back while keeping your chest lifted, then drive through your feet to stand.",
          modification:
            "Use a lighter dumbbell or perform the squat with bodyweight.",
        },
        {
          name: "Leg Press",
          location: "GYM",
          note: "Stable option for loading the lower body.",
          cue: "Sit securely in the leg press machine with your feet planted on the platform. Lower the weight with control, then drive through your whole foot to press the platform away.",
          modification:
            "Use a lighter weight or reduce your range of motion.",
        },
        {
          name: "Sumo Bodyweight Squat",
          location: "HOME",
          note: "Same wide-stance pattern without added resistance.",
          cue: "Take a comfortable wide stance with your toes slightly turned out. Lower your hips with control, then drive through your feet to stand tall.",
          modification:
            "Reduce your squat depth or use a stable chair as a target.",
        },
      ],
    },
    {
      id: "banded-glute-kickback",
      name: "Banded Glute Kickback",
      sets: 3,
      reps: "12–15 / side",
      restSeconds: 45,
      cue: "Brace your core and extend your leg behind you without twisting your hips or arching your lower back.",
      modification:
        "Remove the band and perform controlled bodyweight kickbacks.",
      home: "Banded Glute Kickback — 3 sets × 12–15 / side",
      gym: "Cable Glute Kickback — 3 sets × 12–15 / side",
      swaps: [
        {
          name: "Cable Glute Kickback",
          location: "GYM",
          note: "Keeps the same hip-extension pattern with adjustable resistance.",
          cue: "Attach the ankle strap and face the cable machine. Brace your core, extend one leg behind you without rotating your hips, then return slowly.",
          modification:
            "Use a lighter cable weight or reduce the range of motion.",
        },
        {
          name: "Donkey Kick",
          location: "HOME",
          note: "Bodyweight alternative that still emphasizes the glutes.",
          cue: "Start on all fours with your hands under your shoulders. Brace your core and drive one heel upward while keeping your hips square.",
          modification:
            "Use a smaller range of motion or perform fewer repetitions per side.",
        },
        {
          name: "Quadruped Leg Extension",
          location: "HOME",
          note: "Controlled bodyweight option without a band.",
          cue: "Start on all fours and extend one leg straight behind you while keeping your hips square. Pause briefly, then return with control.",
          modification:
            "Keep the moving leg lower or reduce the number of repetitions.",
        },
      ],
    },
    {
      id: "frog-pump",
      name: "Frog Pump",
      sets: 2,
      reps: "20",
      restSeconds: 30,
      cue: "Press the soles of your feet together, keep your ribs down, and squeeze your glutes hard at the top of every rep.",
      modification:
        "Reduce the reps and pause briefly between repetitions as needed.",
      home: "Frog Pump — 2 sets × 20 reps",
      gym: "Hip Thrust Machine Burnout — 2 sets × 15–20 reps",
      swaps: [
        {
          name: "Glute Bridge",
          location: "BOTH",
          note: "Simple floor-based glute exercise with a similar focus.",
          cue: "Lie on your back with your knees bent and feet planted. Drive through your heels, lift your hips, squeeze your glutes at the top, then lower with control.",
          modification:
            "Use a smaller range of motion or pause between repetitions.",
        },
        {
          name: "Hip Thrust",
          location: "BOTH",
          note: "A stronger hip-extension option for the glutes.",
          cue: "Rest your upper back against a stable bench or couch. Drive through your heels to lift your hips, squeeze your glutes at the top, then lower with control.",
          modification:
            "Use bodyweight only or reduce your range of motion.",
        },
        {
          name: "Dumbbell Glute Bridge",
          location: "HOME",
          note: "Adds resistance while keeping the movement simple.",
          cue: "Lie on your back with your knees bent and feet planted. Place a dumbbell securely across your hips, drive through your heels, and squeeze your glutes at the top.",
          modification:
            "Remove the dumbbell and perform a bodyweight glute bridge.",
        },
      ],
    },
  ],
};
