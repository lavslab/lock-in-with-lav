export type RecipeMeal =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snacks"
  | "Shakes";

export type RecipeSwap = {
  label: string;
  text: string;
};

export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  description: string;

  meal: RecipeMeal;
  goals: string[];

  calories: number;
  protein: number;
  carbs: number;
  fat: number;

  time: string;
  servings: number;

  ingredients: string[];
  instructions: string[];
  swaps: RecipeSwap[];
};

export const recipes: Recipe[] = [
  // ============================================================
  // BREAKFAST
  // ============================================================

  // HIGH-PROTEIN BREAKFAST WRAP

  {
    id: "breakfast-wrap",
    title: "High-Protein Breakfast Wrap",
    subtitle: "the breakfast that keeps up.",
    description:
      "A quick, high-protein breakfast wrap with eggs, turkey, melty cheese + veggies for busy mornings.",

    meal: "Breakfast",
    goals: ["High Protein", "Quick"],

    calories: 390,
    protein: 36,
    carbs: 30,
    fat: 14,

    time: "10 MIN",
    servings: 1,

    ingredients: [
      "1 large high-fibre or whole wheat tortilla",
      "1 large egg",
      "1/2 cup liquid egg whites",
      "2 slices lean turkey breast",
      "1/4 cup reduced-fat shredded cheese",
      "1/4 cup diced bell pepper",
      "2 tbsp diced onion",
      "Handful of baby spinach",
      "Salt, pepper + garlic powder, to taste",
      "Hot sauce or salsa, optional",
      "Non-stick cooking spray",
    ],

    instructions: [
      "Lightly spray a non-stick skillet and cook the bell pepper and onion over medium heat for 2–3 minutes.",
      "Add the spinach and cook just until wilted.",
      "Whisk the egg and egg whites with salt, pepper and garlic powder, then pour them into the skillet.",
      "Gently scramble until almost set, then stir in the turkey and remove from the heat.",
      "Warm the tortilla briefly so it folds easily. Add the egg mixture and sprinkle with cheese.",
      "Fold into a wrap and return it to the skillet seam-side down for 1–2 minutes per side, until lightly golden. Serve with salsa or hot sauce if you like.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a lower-carb tortilla or turn the filling into a breakfast bowl over extra spinach and veggies.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full tortilla and add fruit or a small serving of potatoes on the side when you want more carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap turkey for chicken sausage, add mushrooms or jalapeños, or change the cheese and salsa to keep it interesting.",
      },
    ],
  },

  // COTTAGE CHEESE + EGG TOAST

  {
    id: "cottage-cheese-egg-toast",
    title: "Cottage Cheese + Egg Toast",
    subtitle: "simple, sweet + protein-packed.",
    description:
      "Creamy cottage cheese, jammy boiled eggs and a touch of honey over crisp whole-grain toast, served with fresh veggies for an easy balanced breakfast.",

    meal: "Breakfast",
    goals: ["High Protein", "Quick"],

    calories: 390,
    protein: 30,
    carbs: 39,
    fat: 14,

    time: "12 MIN",
    servings: 1,

    ingredients: [
      "1 slice whole-grain bread",
      "2 large eggs",
      "1/2 cup low-fat cottage cheese",
      "1 tsp honey",
      "1/2 cup sliced cucumber + cherry tomatoes",
      "Salt + black pepper, to taste",
      "Chilli flakes or everything seasoning, optional",
    ],

    instructions: [
      "Bring a small pot of water to a boil. Carefully add the eggs and cook for 7–9 minutes, depending on how set you like the yolks.",
      "Transfer the eggs to cold water, then peel and slice them.",
      "Toast the bread until golden and crisp.",
      "Spread the cottage cheese generously over the toast. Top with the sliced eggs or serve the eggs on the side.",
      "Drizzle with honey, then season with salt, black pepper and chilli flakes or everything seasoning if using.",
      "Serve with cucumber and cherry tomatoes on the side.",
    ],

    swaps: [
      {
        label: "MORE PROTEIN",
        text: "Add 1/4 cup extra cottage cheese or serve with egg whites on the side for an additional protein boost.",
      },
      {
        label: "SAVOURY INSTEAD",
        text: "Skip the honey and add sliced avocado, hot sauce or everything seasoning.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add a second slice of whole-grain toast or a serving of fruit when you want more carbohydrates around training.",
      },
    ],
  },
  // GREEK YOGURT CRUNCH BOWL

  {
    id: "greek-yogurt-crunch-bowl",
    title: "Greek Yogurt Crunch Bowl",
    subtitle: "sweet, cold + protein packed.",
    description:
      "A quick protein-first breakfast with creamy Greek yogurt, fresh berries + granola for the perfect little crunch.",

    meal: "Breakfast",
    goals: ["High Protein", "Quick"],

    calories: 330,
    protein: 32,
    carbs: 35,
    fat: 7,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "1 cup plain 0–2% Greek yogurt",
      "1/2 scoop vanilla protein powder",
      "1/2 cup fresh berries",
      "1/4 cup high-protein or lower-sugar granola",
      "1 tsp chia seeds",
      "1 tsp honey or maple syrup, optional",
      "Cinnamon, to taste",
    ],

    instructions: [
      "Add the Greek yogurt and protein powder to a bowl and stir until completely smooth.",
      "Add a small splash of water or milk if you want a thinner, creamier texture.",
      "Top with fresh berries and granola.",
      "Sprinkle with chia seeds and cinnamon.",
      "Drizzle with a little honey or maple syrup if you want extra sweetness, then serve immediately.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a smaller portion of granola, skip the honey, and lean on berries, chia seeds and cinnamon for flavour and crunch.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add banana, extra berries or a little more granola when you want additional carbohydrate around a harder training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Try strawberries and cocoa, blueberries and lemon zest, or add a spoonful of peanut or almond butter for a different flavour.",
      },
    ],
  },
  // HIGH= PROTEIN VEGGIE OMELETTE

  {
    id: "high-protein-veggie-omelette",
    title: "Veggie Omelette",
    subtitle: "a classic.",
    description:
      "A fluffy, protein-packed omelette loaded with colourful veggies and melty cheese for an easy breakfast that actually keeps you full.",

    meal: "Breakfast",
    goals: ["High Protein", "Low Carb"],

    calories: 330,
    protein: 35,
    carbs: 10,
    fat: 17,

    time: "12 MIN",
    servings: 1,

    ingredients: [
      "2 large eggs",
      "1/2 cup liquid egg whites",
      "1/4 cup reduced-fat shredded cheese",
      "1/4 cup diced bell pepper",
      "1/4 cup sliced mushrooms",
      "2 tbsp diced onion",
      "Handful of baby spinach",
      "Salt + black pepper, to taste",
      "Garlic powder or chilli flakes, optional",
      "Non-stick cooking spray",
    ],

    instructions: [
      "Lightly spray a non-stick skillet and warm it over medium heat.",
      "Add the bell pepper, mushrooms and onion. Cook for 2–3 minutes until slightly softened.",
      "Add the spinach and cook just until wilted, then transfer the vegetables to a plate.",
      "Whisk the eggs and egg whites with salt, black pepper and garlic powder if using.",
      "Pour the egg mixture into the skillet and cook over medium-low heat until the edges begin to set.",
      "Add the cooked vegetables and shredded cheese over one half of the omelette.",
      "Fold the other half over the filling and cook for another 1–2 minutes, until the eggs are set and the cheese is melted.",
      "Slide onto a plate and finish with chilli flakes or hot sauce if you like.",
    ],

    swaps: [
      {
        label: "MORE FUEL",
        text: "Serve with whole-grain toast, roasted potatoes or fruit when you want more carbohydrates with your meal.",
      },
      {
        label: "CHANGE THE PROTEIN",
        text: "Add lean turkey, chicken sausage or leftover chicken for an even heartier breakfast.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Switch up the vegetables, cheese and seasonings based on what you already have in the fridge.",
      },
    ],
  },

  
    // PROTEIN PANCAKES

  {
    id: "protein-pancakes",
    title: "Protein Pancakes",
    subtitle: "soft, sweet + actually filling.",
    description:
      "A simple protein-first breakfast for mornings that need a little more than coffee.",

    meal: "Breakfast",
    goals: ["High Protein", "Post-Workout"],

    calories: 360,
    protein: 34,
    carbs: 39,
    fat: 8,

    time: "15 MIN",
    servings: 1,

    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup low-fat cottage cheese",
      "1 large egg",
      "1/2 cup liquid egg whites",
      "1/2 scoop vanilla protein powder",
      "1/2 tsp baking powder",
      "1/2 tsp cinnamon",
      "1/2 tsp vanilla extract",
      "Pinch of salt",
      "Non-stick cooking spray",
      "1/2 cup fresh berries, for serving",
    ],

    instructions: [
      "Add the oats to a blender and blend until they resemble a fine flour.",
      "Add cottage cheese, egg, egg whites, protein powder, baking powder, cinnamon, vanilla and salt. Blend until smooth.",
      "Let the batter rest for 2–3 minutes while a non-stick skillet heats over medium-low heat.",
      "Lightly spray the skillet. Pour small pancakes and cook until the edges begin to set and bubbles appear on top.",
      "Flip and cook for another 1–2 minutes, or until cooked through and lightly golden.",
      "Serve with fresh berries. Add a small amount of sugar-free or reduced-sugar syrup if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip or reduce the berries and choose a lower-sugar topping. Keep the protein-rich pancake base the same.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add sliced banana or a little extra fruit for more carbohydrate around a harder training day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add blueberries, pumpkin spice, cocoa powder or a few dark chocolate chips to change the flavour.",
      },
    ],
  },

    // STRAWBERRY CHEESECAKE OVERNIGHT OATS

  {
    id: "strawberry-cheesecake-overnight-oats",
    title: "Strawberry Cheesecake Overnight Oats",
    subtitle: "breakfast that tastes like dessert.",
    description:
      "Creamy strawberry overnight oats with Greek yogurt, vanilla protein and a little cheesecake-inspired flavour for an easy make-ahead breakfast.",

    meal: "Breakfast",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],

    calories: 390,
    protein: 31,
    carbs: 48,
    fat: 9,

    time: "5 MIN + CHILL",
    servings: 1,

    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup plain 0–2% Greek yogurt",
      "1/2 scoop vanilla protein powder",
      "1/2 cup unsweetened milk of choice",
      "1/2 cup strawberries, chopped",
      "1 tbsp light cream cheese, softened",
      "1 tsp chia seeds",
      "1 tsp honey or maple syrup",
      "1/2 tsp vanilla extract",
      "Pinch of salt",
    ],

    instructions: [
      "Add the Greek yogurt, cream cheese, protein powder, milk, honey or maple syrup and vanilla to a jar or container.",
      "Stir until smooth and creamy.",
      "Add the oats, chia seeds and a small pinch of salt, then stir until everything is well combined.",
      "Fold in most of the chopped strawberries, saving a few for the top.",
      "Cover and refrigerate overnight, or for at least 4 hours.",
      "Stir before eating and add a splash of milk if you prefer thinner oats.",
      "Top with the remaining strawberries and enjoy cold.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a smaller portion of oats, skip the honey or maple syrup and add extra Greek yogurt and strawberries for volume.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the oats and fruit as written, or add sliced banana when you want more carbohydrate around a harder training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap strawberries for blueberries or raspberries, add cinnamon, or sprinkle a little crushed graham cracker on top for even more cheesecake flavour.",
      },
    ],
  },

  // ============================================================
  // LUNCH
  // ============================================================

  // HIGH-PROTEIN CHICKEN CAESAR WRAP

  {
    id: "chicken-caesar-wrap",
    title: "High-Protein Chicken Caesar Wrap",
    subtitle: "your favourite salad, wrapped up.",
    description:
      "Juicy chicken, crisp romaine, parmesan and creamy Caesar dressing wrapped in a high-fibre tortilla for an easy protein-packed lunch.",

    meal: "Lunch",
    goals: ["High Protein", "Quick"],

    calories: 430,
    protein: 42,
    carbs: 34,
    fat: 15,

    time: "10 MIN",
    servings: 1,

    ingredients: [
      "1 large high-fibre or whole wheat tortilla",
      "4 oz cooked chicken breast, sliced or chopped",
      "1 1/2 cups chopped romaine lettuce",
      "2 tbsp light Caesar dressing",
      "2 tbsp grated parmesan cheese",
      "1 tsp fresh lemon juice",
      "Black pepper, to taste",
    ],

    instructions: [
      "Add the chopped romaine to a bowl with the Caesar dressing, parmesan, lemon juice and black pepper.",
      "Toss until the lettuce is lightly and evenly coated.",
      "Warm the tortilla briefly so it is easier to fold.",
      "Layer the Caesar salad and cooked chicken down the centre of the tortilla.",
      "Fold in the sides, then roll tightly into a wrap.",
      "Slice in half and serve immediately, or wrap tightly and refrigerate for an easy grab-and-go lunch.",
    ],

    swaps: [
      {
        label: "MORE CRUNCH",
        text: "Add a small sprinkle of crushed whole-grain croutons inside the wrap for classic Caesar crunch.",
      },
      {
        label: "LOWER CARB",
        text: "Skip the tortilla and turn it into a chicken Caesar salad bowl with extra romaine and vegetables.",
      },
      {
        label: "MEAL PREP IT",
        text: "Prep the chicken and chopped romaine ahead of time, then assemble the wrap just before eating so it stays fresh and crisp.",
      },
    ],
  },

    // TUNA POWER BOWL

  {
    id: "tuna-power-bowl",
    title: "Tuna Power Bowl",
    subtitle: "fresh, crunchy + no cooking required.",
    description:
      "A fresh high-protein tuna bowl with crisp veggies, rice and a creamy lemon dressing for an easy lunch you can throw together in minutes.",

    meal: "Lunch",
    goals: ["High Protein", "Quick"],

    calories: 410,
    protein: 36,
    carbs: 42,
    fat: 11,

    time: "10 MIN",
    servings: 1,

    ingredients: [
      "1 can tuna in water, drained",
      "1/2 cup cooked rice",
      "1/2 cup diced cucumber",
      "1/2 cup cherry tomatoes, halved",
      "1/4 cup shredded carrots",
      "2 tbsp plain Greek yogurt",
      "1 tsp Dijon mustard",
      "1 tsp fresh lemon juice",
      "Salt + black pepper, to taste",
      "Chilli flakes or everything seasoning, optional",
    ],

    instructions: [
      "Add the drained tuna to a small bowl.",
      "Mix in the Greek yogurt, Dijon mustard, lemon juice, salt and black pepper until creamy and combined.",
      "Add the cooked rice to your serving bowl.",
      "Arrange the cucumber, cherry tomatoes and shredded carrots around the rice.",
      "Spoon the tuna mixture over the top.",
      "Finish with chilli flakes or everything seasoning if using, then serve.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Replace the rice with extra greens, cucumber or chopped romaine for a lighter tuna bowl.",
      },
      {
        label: "MORE FUEL",
        text: "Increase the rice to 1 cup or add a piece of fruit on the side when you need more carbohydrates around training.",
      },
      {
        label: "MAKE IT CREAMIER",
        text: "Add a little avocado or an extra spoonful of Greek yogurt to the tuna mixture.",
      },
      {
        label: "MEAL PREP IT",
        text: "Prep the rice, vegetables and tuna mixture separately, then assemble when you're ready to eat.",
      },
    ],
  },

    // HONEY GARLIC CHICKEN RICE BOWL

  {
    id: "honey-garlic-chicken-rice-bowl",
    title: "Honey Garlic Chicken Rice Bowl",
    subtitle: "sweet, savoury + meal-prep ready.",
    description:
      "Tender honey garlic chicken served over fluffy rice with colourful veggies for a balanced, high-protein lunch that reheats beautifully.",

    meal: "Lunch",
    goals: ["High Protein", "Meal Prep"],

    calories: 470,
    protein: 42,
    carbs: 55,
    fat: 10,

    time: "25 MIN",
    servings: 1,

    ingredients: [
      "4 oz boneless, skinless chicken breast, cut into bite-size pieces",
      "3/4 cup cooked rice",
      "1/2 cup broccoli florets",
      "1/4 cup sliced bell pepper",
      "1 tsp olive oil",
      "1 tbsp low-sodium soy sauce",
      "2 tsp honey",
      "1 clove garlic, minced",
      "1/2 tsp fresh grated ginger, optional",
      "Black pepper, to taste",
      "Green onion or sesame seeds, optional",
    ],

    instructions: [
      "In a small bowl, stir together the soy sauce, honey, garlic and ginger if using.",
      "Heat the olive oil in a non-stick skillet over medium-high heat.",
      "Add the chicken and season with black pepper. Cook for 5–7 minutes, stirring occasionally, until browned and cooked through.",
      "Add the broccoli and bell pepper with a small splash of water. Cook for another 3–4 minutes until the vegetables are tender-crisp.",
      "Pour the honey garlic sauce into the skillet and toss everything together for 1–2 minutes, until the chicken and vegetables are coated.",
      "Add the cooked rice to a bowl and spoon the honey garlic chicken and vegetables over the top.",
      "Finish with green onion or sesame seeds if using.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use cauliflower rice or serve the chicken over extra broccoli and vegetables instead of rice.",
      },
      {
        label: "MORE FUEL",
        text: "Increase the rice to 1 cup when you want a higher-carbohydrate meal around training.",
      },
      {
        label: "CHANGE THE PROTEIN",
        text: "Swap the chicken breast for lean ground chicken, turkey or shrimp.",
      },
      {
        label: "MEAL PREP IT",
        text: "Make several servings at once and portion the chicken, rice and vegetables into containers for easy lunches throughout the week.",
      },
    ],
  },

    // CHICKEN TACO BOWL

  {
    id: "chicken-taco-bowl",
    title: "Chicken Taco Bowl",
    subtitle: "big bowl. balanced macros.",
    description:
      "A balanced, high-protein taco bowl with seasoned chicken, rice, black beans + all the fresh toppings.",

    meal: "Lunch",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],

    calories: 450,
    protein: 40,
    carbs: 48,
    fat: 11,

    time: "25 MIN",
    servings: 1,

    ingredients: [
      "4 oz boneless, skinless chicken breast",
      "1/2 cup cooked rice",
      "1/3 cup black beans, drained + rinsed",
      "1/3 cup corn",
      "1/2 cup shredded lettuce",
      "1/4 cup diced tomato or fresh pico de gallo",
      "2 tbsp plain Greek yogurt",
      "2 tbsp reduced-fat shredded cheese",
      "1 tbsp salsa",
      "1 tsp taco seasoning",
      "Lime wedge + chopped cilantro, optional",
      "Non-stick cooking spray",
    ],

    instructions: [
      "Season the chicken on both sides with taco seasoning.",
      "Lightly spray a skillet and cook the chicken over medium heat until browned and cooked through. Let it rest briefly, then slice or dice.",
      "Warm the rice, black beans and corn.",
      "Add lettuce to a bowl, then layer in the rice, beans, corn and chicken.",
      "Top with tomato or pico, Greek yogurt, cheese and salsa.",
      "Finish with lime and cilantro if using. Serve warm, or portion into meal-prep containers for later.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use less rice or swap it for cauliflower rice, then add extra lettuce, peppers or other non-starchy veggies to keep the bowl filling.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full rice portion or add a little extra rice or corn on a harder lower-body training day when you want more carbohydrate.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap chicken for lean ground turkey, shrimp or tofu, change the salsa, or add jalapeños, avocado or extra pico.",
      },
    ],
    
  },
    // TURKEY BURGER BOWL

  {
    id: "turkey-burger-bowl",
    title: "Turkey Burger Bowl",
    subtitle: "burger night, locked-in edition.",
    description:
      "All the burger flavour with lean turkey, crispy potatoes, fresh veggies + a quick creamy burger sauce.",

    meal: "Lunch",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],

    calories: 420,
    protein: 43,
    carbs: 25,
    fat: 17,

    time: "20 MIN",
    servings: 1,

    ingredients: [
      "5 oz extra-lean ground turkey",
      "100 g baby potatoes, diced",
      "1 1/2 cups shredded lettuce",
      "1/3 cup diced tomato",
      "1/4 cup diced cucumber",
      "2 tbsp diced red onion",
      "2 tbsp reduced-fat shredded cheese",
      "2 tbsp chopped dill pickles",
      "1 tbsp plain Greek yogurt",
      "1 tsp ketchup",
      "1 tsp mustard",
      "Garlic powder, onion powder, paprika, salt + pepper, to taste",
      "Non-stick cooking spray",
    ],

    instructions: [
      "Season the diced potatoes with paprika, garlic powder, salt and pepper. Air-fry or roast until golden and tender.",
      "Lightly spray a skillet and cook the ground turkey over medium heat, breaking it apart as it browns.",
      "Season the turkey with garlic powder, onion powder, salt and pepper and cook until fully cooked through.",
      "Add the lettuce to a bowl and top with tomato, cucumber, red onion, pickles and the crispy potatoes.",
      "Add the warm ground turkey and sprinkle with cheese.",
      "Mix the Greek yogurt, ketchup and mustard into a quick burger sauce and drizzle over the bowl.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the potatoes or use a smaller portion and add extra lettuce, cucumber, tomato and pickles for more volume.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Increase the potato portion or add a whole-grain bun on the side when you want more carbohydrate around a harder training day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add jalapeños, sautéed mushrooms or avocado, swap the cheese, or use extra-lean beef or chicken instead of turkey.",
      },
    ],
  },

   // ============================================================
  // DINNER
  // ============================================================

    // GROUND TURKEY SWEET POTATO BOWL

  {
    id: "ground-turkey-sweet-potato-bowl",
    title: "Ground Turkey Sweet Potato Bowl",
    subtitle: "protein-packed comfort.",
    description:
      "A balanced, protein-packed bowl with seasoned turkey, roasted sweet potato, veggies + creamy cottage cheese.",

    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],

    calories: 450,
    protein: 40,
    carbs: 42,
    fat: 13,

    time: "25 MIN",
    servings: 1,

    ingredients: [
      "5 oz extra-lean ground turkey",
      "150 g sweet potato, peeled + diced",
      "1/2 cup low-fat cottage cheese",
      "1 cup broccoli florets",
      "1/2 cup diced bell pepper",
      "1/2 cup cucumber, chopped",
      "1 tsp olive oil",
      "1/2 tsp paprika",
      "1/2 tsp garlic powder",
      "1/2 tsp onion powder",
      "Salt + black pepper, to taste",
      "Hot sauce, chili flakes or fresh herbs, optional",
    ],

    instructions: [
      "Toss the diced sweet potato with half the olive oil, paprika, garlic powder, salt and pepper.",
      "Air-fry or roast the sweet potato at about 400°F (200°C) until tender and lightly crisp, tossing halfway through.",
      "Heat the remaining olive oil in a skillet over medium heat. Add the ground turkey and season with onion powder, garlic powder, paprika, salt and pepper.",
      "Cook the turkey, breaking it apart as it browns, until fully cooked through.",
      "Steam, roast or sauté the broccoli and bell pepper until tender-crisp.",
      "Build the bowl with sweet potato, turkey, cooked vegetables, cucumber and cottage cheese. Finish with hot sauce, chili flakes or fresh herbs if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a smaller sweet potato portion and add extra broccoli, peppers, cucumber or greens while keeping the turkey and cottage cheese portions the same.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full sweet potato serving or increase it slightly when this bowl lands around a harder lower-body or glute training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap the veggies based on what you have, add taco or Cajun seasoning to the turkey, or use Greek yogurt if cottage cheese is not your thing.",
      },
    ],
  },

   // GROUND TURKEY QUESADILLAS

  {
    id: "turkey-quesadillas",
    title: "Ground Turkey Quesadillas",
    subtitle: "healthy-ish never has to be boring.",
    description:
      "A quick, high-protein quesadilla with seasoned ground turkey, melty cheese and fresh salsa.",

    meal: "Lunch",
    goals: ["High Protein", "Quick"],

    calories: 400,
    protein: 32,
    carbs: 36,
    fat: 15,

    time: "20 MIN",
    servings: 1,

    ingredients: [
      "4 oz extra-lean ground turkey",
      "1 large whole wheat or high-fibre tortilla",
      "1/3 cup reduced-fat shredded cheese",
      "1/4 cup diced bell pepper",
      "2 tbsp diced onion",
      "1/4 cup fresh salsa or pico de gallo",
      "2 tbsp plain Greek yogurt, for serving",
      "1/2 tsp chili powder",
      "1/2 tsp garlic powder",
      "1/2 tsp cumin",
      "Salt + black pepper, to taste",
      "Non-stick cooking spray",
    ],

    instructions: [
      "Lightly spray a skillet and cook the bell pepper and onion over medium heat for 2–3 minutes.",
      "Add the ground turkey, chili powder, garlic powder, cumin, salt and pepper. Cook, breaking the turkey apart, until fully cooked through.",
      "Transfer the turkey mixture to a plate and wipe the skillet if needed.",
      "Place the tortilla in the skillet over medium-low heat. Add cheese over one half, then spoon the turkey mixture on top.",
      "Fold the tortilla over and cook for 2–3 minutes per side, pressing gently, until golden and the cheese is melted.",
      "Slice into wedges and serve with fresh salsa or pico and Greek yogurt.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a lower-carb tortilla or turn the turkey, cheese, salsa and veggies into a quesadilla bowl over shredded lettuce.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full tortilla and add fruit, corn or a small serving of rice on the side when you want more carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add spinach, jalapeños or corn, change the cheese, or swap the turkey for chicken or lean beef while keeping the same basic method.",
      },
    ],
  }, 

    // CREAMY CHICKEN PROTEIN PASTA

  {
    id: "creamy-chicken-protein-pasta",
    title: "Creamy Chicken Protein Pasta",
    subtitle: "yes, pasta still fits.",
    description:
      "A creamy, high-protein pasta with chicken, spinach + mushrooms for a comforting dinner that still supports your goals.",

    meal: "Dinner",
    goals: ["High Protein", "Post-Workout"],

    calories: 475,
    protein: 39,
    carbs: 55,
    fat: 12,

    time: "30 MIN",
    servings: 1,

    ingredients: [
      "4 oz boneless, skinless chicken breast, diced",
      "2 oz dry high-protein pasta",
      "1/3 cup low-fat cottage cheese",
      "2 tbsp grated Parmesan",
      "1/4 cup unsweetened milk of choice",
      "1 cup baby spinach",
      "1/2 cup sliced mushrooms",
      "1 garlic clove, minced",
      "1 tsp olive oil",
      "1/2 tsp Italian seasoning",
      "Salt, black pepper + chili flakes, to taste",
      "Splash of reserved pasta water, as needed",
    ],

    instructions: [
      "Cook the pasta according to package directions. Reserve a little pasta water before draining.",
      "Season the chicken with Italian seasoning, salt and pepper.",
      "Heat the olive oil in a skillet over medium heat and cook the chicken until browned and fully cooked through. Remove briefly from the pan.",
      "Add the mushrooms and garlic to the skillet and cook until softened, then stir in the spinach until wilted.",
      "Blend the cottage cheese, milk and Parmesan until smooth and creamy.",
      "Lower the heat. Add the pasta, chicken and sauce to the skillet and toss gently. Add a splash of reserved pasta water until the sauce reaches your preferred consistency. Finish with black pepper or chili flakes.",
    ],

    swaps: [
      {
        label: "LIGHTER OPTION",
        text: "Use a little less pasta and add extra spinach, mushrooms, broccoli or zucchini to increase volume while keeping the chicken portion the same.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full pasta serving on a harder training day. This is one of the higher-carb recipes in the library and works well around lower-body or glute sessions.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap chicken for shrimp, add broccoli or roasted peppers, or season the sauce with Cajun spice, lemon or extra chili flakes.",
      },
    ],
  },

    // SALMON POWER BOWL

  {
    id: "salmon-power-bowl",
    title: "Salmon Power Bowl",
    subtitle: "colourful, balanced + satisfying.",
    description:
      "A balanced salmon bowl with rice, colourful veggies and protein-packed edamame for an easy, satisfying meal.",

    meal: "Dinner",
    goals: ["High Protein", "Meal Prep"],

    calories: 450,
    protein: 33,
    carbs: 43,
    fat: 16,

    time: "25 MIN",
    servings: 1,

    ingredients: [
      "4 oz salmon fillet",
      "1/2 cup cooked rice",
      "1 cup zucchini or asparagus, chopped",
      "1/2 cup cucumber, chopped",
      "1/3 cup shredded carrots",
      "1/4 cup shelled edamame",
      "1 tsp olive oil",
      "1 tsp low-sodium soy sauce",
      "1 tsp honey",
      "1 tsp fresh lemon or lime juice",
      "Garlic powder, black pepper + paprika, to taste",
      "Green onion or sesame seeds, optional",
    ],

    instructions: [
      "Preheat the oven or air fryer to about 400°F (200°C).",
      "Season the salmon with garlic powder, paprika and black pepper. Mix the soy sauce, honey and lemon or lime juice, then brush it over the salmon.",
      "Toss the zucchini or asparagus with olive oil and a little seasoning.",
      "Cook the salmon and vegetables until the salmon flakes easily and the vegetables are tender. Cooking time will vary by thickness and appliance.",
      "Add the cooked rice to a bowl and arrange the vegetables, cucumber, carrots and edamame around it.",
      "Add the salmon on top and finish with green onion, sesame seeds or an extra squeeze of citrus if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Reduce the rice or swap it for cauliflower rice and add extra zucchini, asparagus, cucumber or greens.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full rice serving or increase it slightly when this bowl lands around a harder lower-body or glute training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap rice for quinoa or potatoes, change the vegetables, or add sriracha, fresh herbs or a light yogurt-based sauce.",
      },
    ],
  },

    // LOADED CHICKEN POTATO

  {
    id: "loaded-chicken-potato",
    title: "Loaded Chicken Potato",
    subtitle: "comfort food with a protein goal.",
    description:
      "A loaded, protein-packed potato with seasoned chicken, veggies and all the toppings for an easy, satisfying dinner.",

    meal: "Dinner",
    goals: ["High Protein", "Post-Workout"],

    calories: 445,
    protein: 36,
    carbs: 52,
    fat: 10,

    time: "30 MIN",
    servings: 1,

    ingredients: [
      "1 medium russet potato",
      "4 oz boneless, skinless chicken breast, diced",
      "1/2 cup broccoli florets",
      "1/4 cup diced bell pepper",
      "2 tbsp reduced-fat shredded cheese",
      "2 tbsp plain Greek yogurt",
      "1 tbsp sliced green onion",
      "1 tsp olive oil",
      "1/2 tsp garlic powder",
      "1/2 tsp paprika",
      "Salt + black pepper, to taste",
      "Hot sauce or salsa, optional",
    ],

    instructions: [
      "Pierce the potato a few times with a fork. Microwave until tender, or bake or air-fry until soft inside and crisp outside.",
      "Season the chicken with garlic powder, paprika, salt and pepper.",
      "Heat the olive oil in a skillet over medium heat and cook the chicken until browned and fully cooked through.",
      "Steam or sauté the broccoli and bell pepper until tender-crisp.",
      "Split the cooked potato down the centre and fluff the inside with a fork.",
      "Load it with chicken, vegetables and cheese. Finish with Greek yogurt, green onion and hot sauce or salsa if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a smaller potato and pile on extra broccoli, peppers or greens while keeping the full chicken portion for protein.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full potato or choose a slightly larger one when this meal falls around a demanding lower-body or glute session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Try buffalo chicken, taco-seasoned chicken, different veggies or a sprinkle of turkey bacon for a completely different loaded-potato vibe.",
      },
    ],
  },
  // TURKEY STUFFED BELL PEPPERS

  {
    id: "turkey-stuffed-peppers",
    title: "Turkey Stuffed Bell Peppers",
    subtitle: "simple, filling + balanced.",
    description:
      "A balanced, protein-packed dinner with lean turkey, veggies and just enough rice to keep it satisfying.",

    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],

    calories: 370,
    protein: 32,
    carbs: 28,
    fat: 14,

    time: "35 MIN",
    servings: 1,

    ingredients: [
      "1 large bell pepper, halved + seeds removed",
      "4 oz extra-lean ground turkey",
      "1/3 cup cooked rice",
      "1/3 cup diced zucchini",
      "2 tbsp diced onion",
      "2 tbsp tomato sauce or crushed tomatoes",
      "1/4 cup reduced-fat shredded cheese",
      "1 tsp olive oil",
      "1/2 tsp garlic powder",
      "1/2 tsp Italian seasoning",
      "Salt + black pepper, to taste",
      "Fresh parsley or chili flakes, optional",
    ],

    instructions: [
      "Preheat the oven to 400°F (200°C). Place the bell pepper halves cut-side up in a small baking dish.",
      "Heat the olive oil in a skillet over medium heat. Add the onion and zucchini and cook for 2–3 minutes.",
      "Add the ground turkey, garlic powder, Italian seasoning, salt and pepper. Cook, breaking the turkey apart, until fully cooked through.",
      "Stir in the cooked rice and tomato sauce, then remove the skillet from the heat.",
      "Divide the turkey mixture between the pepper halves and top with shredded cheese.",
      "Bake for about 15–20 minutes, or until the peppers are tender and the cheese is melted. Finish with parsley or chili flakes if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Leave out the rice and add extra zucchini, mushrooms or cauliflower rice to the turkey filling.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the rice in the filling and add a little extra rice or roasted potato on the side when you want more carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Use taco seasoning instead of Italian seasoning, swap the cheese, or add spinach, mushrooms, corn or fresh herbs to the filling.",
      },
    ],
  },
  // LEMON GARLIC SHRIMP + ZUCCHINI

  {
    id: "lemon-garlic-shrimp",
    title: "Lemon Garlic Shrimp + Zucchini",
    subtitle: "light, fresh + full of flavour.",
    description:
      "A light, high-protein dinner with garlicky shrimp, fresh zucchini + bright lemon flavour, ready in about 20 minutes.",

    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Quick"],

    calories: 330,
    protein: 34,
    carbs: 16,
    fat: 14,

    time: "20 MIN",
    servings: 1,

    ingredients: [
      "6 oz raw shrimp, peeled + deveined",
      "1 1/2 cups zucchini, sliced into half-moons",
      "1/2 cup cherry tomatoes, halved",
      "2 garlic cloves, minced",
      "2 tsp olive oil",
      "1 tbsp fresh lemon juice",
      "1/2 tsp lemon zest",
      "1/2 tsp paprika",
      "Salt + black pepper, to taste",
      "1 tbsp chopped fresh parsley",
      "Chili flakes, optional",
    ],

    instructions: [
      "Pat the shrimp dry and season with paprika, salt and black pepper.",
      "Heat half the olive oil in a skillet over medium-high heat. Add the shrimp and cook for about 1–2 minutes per side, just until pink and opaque. Transfer to a plate.",
      "Add the remaining olive oil and zucchini to the skillet. Cook for 3–4 minutes until tender-crisp.",
      "Add the garlic and cherry tomatoes and cook for another minute, stirring so the garlic does not burn.",
      "Return the shrimp to the skillet and add the lemon juice and zest. Toss everything together until warmed through.",
      "Finish with parsley, black pepper and chili flakes if desired, then serve immediately.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "This recipe is already one of the lower-carb meals in the library. Keep it as written or add extra zucchini, asparagus or leafy greens for more volume.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add rice, quinoa or roasted potatoes when you want more carbohydrate around a harder training day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap zucchini for asparagus or broccoli, add fresh herbs, or use Cajun seasoning for a spicier version.",
      },
    ],
  },

    // SALMON + ROASTED VEGGIES

  {
    id: "salmon-roasted-veggies",
    title: "Salmon + Roasted Veggies",
    subtitle: "good fats. good fuel.",
    description:
      "A simple, protein-packed dinner with roasted salmon, colourful veggies and plenty of flavour.",

    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],

    calories: 410,
    protein: 32,
    carbs: 24,
    fat: 20,

    time: "30 MIN",
    servings: 1,

    ingredients: [
      "4 oz salmon fillet",
      "1 cup asparagus, trimmed",
      "1 cup zucchini, chopped",
      "1/2 cup cherry tomatoes",
      "2 tsp olive oil, divided",
      "1 tbsp fresh lemon juice",
      "1 garlic clove, minced",
      "1/2 tsp paprika",
      "1/2 tsp dried herbs or Italian seasoning",
      "Salt + black pepper, to taste",
      "Fresh parsley or dill, optional",
    ],

    instructions: [
      "Preheat the oven to 400°F (200°C) and line a sheet pan or baking dish.",
      "Add the asparagus, zucchini and cherry tomatoes to the pan. Toss with half the olive oil, dried herbs, salt and pepper.",
      "Place the salmon beside the vegetables. Brush with the remaining olive oil and season with paprika, garlic, salt and pepper.",
      "Roast until the vegetables are tender and the salmon flakes easily with a fork. Cooking time will vary based on the thickness of the salmon.",
      "Squeeze fresh lemon juice over the salmon and vegetables.",
      "Finish with parsley or dill if desired and serve warm.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Keep the meal exactly as written or add more non-starchy vegetables. It is already one of the lower-carb dinner options in the library.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add rice, quinoa, roasted potatoes or sweet potato when you want more carbohydrate around a harder lower-body or glute training day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap asparagus for broccoli or green beans, use Cajun or lemon-pepper seasoning, or add a light yogurt-herb sauce.",
      },
    ],
  },

    // HONEY SOY CHICKEN VEGGIE BOWL

  {
    id: "honey-soy-chicken-bowl",
    title: "Honey Soy Chicken Veggie Bowl",
    subtitle: "your bowl, your way.",
    description:
      "A sweet + savoury chicken bowl with rice, crisp veggies and a creamy sriracha drizzle for an easy, balanced dinner.",

    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],

    calories: 445,
    protein: 35,
    carbs: 50,
    fat: 11,

    time: "30 MIN",
    servings: 1,

    ingredients: [
      "4 oz boneless, skinless chicken breast, diced",
      "1/2 cup cooked rice",
      "1 cup broccoli florets",
      "1/2 cup sliced bell pepper",
      "1/3 cup shredded carrots",
      "1 tsp olive oil",
      "1 tbsp low-sodium soy sauce",
      "1 tsp honey",
      "1 tsp rice vinegar or fresh lime juice",
      "1 garlic clove, minced",
      "1/2 tsp grated fresh ginger, optional",
      "1 tbsp plain Greek yogurt",
      "1 tsp sriracha, or to taste",
      "Green onion or sesame seeds, optional",
    ],

    instructions: [
      "Mix the soy sauce, honey, rice vinegar or lime juice, garlic and ginger in a small bowl.",
      "Heat the olive oil in a skillet over medium-high heat. Add the chicken and cook until lightly browned.",
      "Add the broccoli and bell pepper and continue cooking until the chicken is fully cooked and the vegetables are tender-crisp.",
      "Pour in the honey-soy mixture and toss until the chicken and vegetables are evenly coated and the sauce lightly thickens.",
      "Add the cooked rice to a bowl, then top with the chicken mixture and shredded carrots.",
      "Mix the Greek yogurt with sriracha and drizzle over the bowl. Finish with green onion or sesame seeds if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use less rice or swap it for cauliflower rice, then add extra broccoli, peppers or other non-starchy vegetables.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the full rice serving or increase it slightly when this bowl lands around a harder lower-body or glute training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap chicken for shrimp or tofu, change the vegetables, or adjust the honey and sriracha to make the bowl sweeter or spicier.",
      },
    ],
  },

    // BLACK BEAN + CORN TACOS

  {
    id: "black-bean-corn-tacos",
    title: "Black Bean + Corn Tacos",
    subtitle: "meatless but still satisfying.",
    description:
      "A quick, colourful meatless meal with black beans, corn and fresh toppings.",

    meal: "Lunch",
    goals: ["Quick"],

    calories: 390,
    protein: 20,
    carbs: 55,
    fat: 10,

    time: "20 MIN",
    servings: 1,

    ingredients: [
      "2 small whole wheat tortillas",
      "3/4 cup black beans, drained + rinsed",
      "1/3 cup corn",
      "1/4 cup diced tomato or fresh pico de gallo",
      "1/4 cup shredded lettuce",
      "2 tbsp diced red onion",
      "2 tbsp reduced-fat shredded cheese",
      "2 tbsp plain Greek yogurt",
      "1 tsp sriracha, or to taste",
      "1/2 tsp chili powder",
      "1/2 tsp cumin",
      "Fresh lime juice, to taste",
      "Cilantro, optional",
    ],

    instructions: [
      "Add the black beans and corn to a skillet over medium heat.",
      "Season with chili powder and cumin, then cook for 3–4 minutes until warmed through. Lightly mash some of the beans for extra texture if desired.",
      "Warm the tortillas in a dry skillet or microwave until soft and flexible.",
      "Divide the black bean and corn mixture between the tortillas.",
      "Top with lettuce, tomato or pico, red onion and shredded cheese.",
      "Mix the Greek yogurt with sriracha and drizzle over the tacos. Finish with lime juice and cilantro if desired.",
    ],

    swaps: [
      {
        label: "MORE PROTEIN",
        text: "Add extra Greek yogurt, a little more cheese, or pair the tacos with cottage cheese on the side. You can also add chicken or shrimp if you do not need them to stay vegetarian.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the tortillas, beans and corn as written. This recipe already provides a solid carbohydrate base for an active day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add jalapeños, avocado, cabbage or extra pico, swap in a different tortilla, or turn the same filling into a taco bowl.",
      },
    ],
  },
  // CRISPY BLACK BEAN TAQUITOS

  {
    id: "black-bean-taquitos",
    title: "Crispy Black Bean Taquitos",
    subtitle: "crispy. easy. so good.",
    description:
      "Crispy, cheesy black bean taquitos with a simple seasoned filling + fresh toppings for an easy meatless dinner.",

    meal: "Dinner",
    goals: ["Meal Prep"],

    calories: 410,
    protein: 21,
    carbs: 52,
    fat: 13,

    time: "30 MIN",
    servings: 1,

    ingredients: [
      "4 small whole wheat tortillas",
      "3/4 cup black beans, drained + rinsed",
      "1/3 cup diced bell pepper",
      "2 tbsp diced onion",
      "1/3 cup reduced-fat shredded cheese",
      "2 tbsp salsa",
      "2 tbsp plain Greek yogurt, for serving",
      "1/2 tsp chili powder",
      "1/2 tsp cumin",
      "1/2 tsp garlic powder",
      "Fresh lime juice, to taste",
      "Non-stick cooking spray",
      "Cilantro or green onion, optional",
    ],

    instructions: [
      "Preheat the oven or air fryer to about 400°F (200°C).",
      "Add the black beans to a bowl and lightly mash them, leaving some beans whole for texture.",
      "Stir in the bell pepper, onion, salsa, chili powder, cumin and garlic powder.",
      "Warm the tortillas briefly so they are flexible. Divide the filling and cheese between them, then roll each tortilla tightly.",
      "Place seam-side down on a lined baking sheet or in the air-fryer basket. Lightly spray the tops and cook until crisp and golden, turning if needed.",
      "Finish with lime juice and serve with Greek yogurt, salsa and cilantro or green onion if desired.",
    ],

    swaps: [
      {
        label: "MORE PROTEIN",
        text: "Serve with extra Greek yogurt or cottage cheese, add more reduced-fat cheese, or mix cooked lean ground turkey or shredded chicken into the filling if you do not need them to stay vegetarian.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the tortillas and beans as written. Pair with corn, fruit or a small rice side when you want additional carbohydrate around a harder training day.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add corn, jalapeños or spinach to the filling, change the cheese, or use taco seasoning and your favourite salsa to switch up the flavour.",
      },
    ],
  },

  // ============================================================
  // SNACK
  // ============================================================




    // PROTEIN SNACK BOX

  {
    id: "protein-snack-box",
    title: "Protein Snack Box",
    subtitle: "snacky, but make it useful.",
    description:
      "A quick protein-packed snack box for when you want something easy, fresh and actually filling.",

    meal: "Snacks",
    goals: ["High Protein", "Lower Carb", "Quick"],

    calories: 260,
    protein: 28,
    carbs: 18,
    fat: 9,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "1 cup low-fat cottage cheese",
      "1/2 cup cucumber slices",
      "1/2 cup bell pepper strips",
      "1/2 cup cherry tomatoes",
      "1 hard-boiled egg",
      "1 tbsp everything bagel seasoning or fresh herbs",
      "Black pepper, to taste",
      "Lemon wedge or hot sauce, optional",
    ],

    instructions: [
      "Spoon the cottage cheese into one section of a meal-prep container or snack plate.",
      "Season it with everything bagel seasoning, fresh herbs or black pepper.",
      "Wash and slice the cucumber and bell pepper, then add them with the cherry tomatoes.",
      "Peel and halve the hard-boiled egg and add it to the box.",
      "Finish with a squeeze of lemon or hot sauce if desired.",
      "Serve immediately or refrigerate in a sealed container until snack time.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Keep the cottage cheese, egg and non-starchy veggies exactly as written — this box is already one of the lower-carb choices in the library.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add fruit, whole-grain crackers or a rice cake when you want a little more carbohydrate before or after training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap in carrots, snap peas or celery, add turkey slices, or make the cottage cheese savoury with dill, chili flakes or ranch-style seasoning.",
      },
    ],
  },

    // APPLE CINNAMON COTTAGE CHEESE BOWL

  {
    id: "apple-cinnamon-cottage-cheese-bowl",
    title: "Apple Cinnamon Cottage Cheese Bowl",
    subtitle: "sweet, crunchy + ridiculously easy.",
    description:
      "Creamy cottage cheese topped with warm cinnamon apples, a little crunch and a drizzle of honey for an easy high-protein snack.",

    meal: "Snacks",
    goals: ["High Protein", "Quick"],

    calories: 270,
    protein: 25,
    carbs: 31,
    fat: 6,

    time: "7 MIN",
    servings: 1,

    ingredients: [
      "1 cup low-fat cottage cheese",
      "1/2 medium apple, diced",
      "1 tsp honey or maple syrup",
      "1 tbsp chopped walnuts",
      "1/2 tsp cinnamon",
      "Small pinch of salt",
      "Splash of vanilla extract, optional",
    ],

    instructions: [
      "Add the diced apple, cinnamon and a small splash of water to a microwave-safe bowl.",
      "Microwave for 60–90 seconds, or until the apple is slightly softened but still has some bite.",
      "Stir the honey or maple syrup into the warm apples.",
      "Spoon the cottage cheese into a bowl.",
      "Top with the cinnamon apples and chopped walnuts.",
      "Finish with extra cinnamon and a tiny splash of vanilla if desired.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Use a smaller amount of apple, skip the honey and add extra cinnamon or a sugar-free sweetener if desired.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the apple and honey as written, or add a little granola when you want more carbohydrate before or after training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap apple for pear or berries, use pecans instead of walnuts, or add a little granola for extra crunch.",
      },
    ],
  },
  // CHOCOLATE PB PROTEIN YOGURT

  {
    id: "chocolate-pb-protein-yogurt",
    title: "Chocolate PB Protein Yogurt",
    subtitle: "chocolate cravings, handled.",
    description:
      "A thick, creamy chocolate protein yogurt with peanut butter for an easy snack that feels way more like dessert.",

    meal: "Snacks",
    goals: ["High Protein", "Quick"],

    calories: 250,
    protein: 29,
    carbs: 20,
    fat: 7,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "3/4 cup plain 0–2% Greek yogurt",
      "1/2 scoop chocolate protein powder",
      "1 tbsp powdered peanut butter",
      "1 tsp natural peanut butter",
      "1 tsp cocoa powder",
      "1–2 tbsp unsweetened milk of choice, as needed",
      "1/2 tsp honey or maple syrup, optional",
      "Pinch of sea salt",
    ],

    instructions: [
      "Add the Greek yogurt, protein powder, powdered peanut butter and cocoa powder to a bowl.",
      "Stir until thick and well combined.",
      "Add the milk a little at a time until the yogurt reaches a smooth, pudding-like consistency.",
      "Taste and add honey or maple syrup if you want it sweeter.",
      "Drizzle the peanut butter over the top.",
      "Finish with a tiny pinch of sea salt and enjoy right away.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the honey or maple syrup and choose a protein powder and peanut butter without added sugar.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Top with sliced banana, berries or a little granola when you want extra carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add strawberries, banana slices, cacao nibs or a few mini chocolate chips, or swap peanut butter for almond butter.",
      },
    ],
  },

  // TURKEY CUCUMBER ROLL-UPS

  {
    id: "turkey-cucumber-roll-ups",
    title: "Turkey Cucumber Roll-Ups",
    subtitle: "crunchy, creamy + protein-packed.",
    description:
      "Fresh cucumber, turkey and creamy cheese rolled together for a quick savoury snack with plenty of protein.",

    meal: "Snacks",
    goals: ["High Protein", "Lower Carb", "Quick"],

    calories: 210,
    protein: 25,
    carbs: 8,
    fat: 9,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "4 slices deli turkey breast",
      "1/2 medium cucumber, cut into thin strips",
      "2 tbsp light cream cheese",
      "1 tsp Dijon or yellow mustard, optional",
      "Everything bagel seasoning, to taste",
      "Black pepper, to taste",
    ],

    instructions: [
      "Lay the turkey slices flat on a clean plate or cutting board.",
      "Spread a thin layer of cream cheese over each slice.",
      "Add a small amount of mustard if using.",
      "Place a few cucumber strips along one end of each turkey slice.",
      "Sprinkle with everything bagel seasoning and black pepper.",
      "Roll each turkey slice tightly around the cucumber and enjoy.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Keep the recipe exactly as written — the turkey, cucumber and cream cheese already make this one of the lower-carb snacks in the library.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Pair the roll-ups with whole-grain crackers, fruit or a rice cake when you want extra carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add spinach, bell pepper or pickle strips, swap the cream cheese for hummus, or add a little hot sauce for extra flavour.",
      },
    ],
  },

    // GREEK YOGURT BERRY BARK

  {
    id: "greek-yogurt-berry-bark",
    title: "Greek Yogurt Berry Bark",
    subtitle: "cold, crunchy + a little sweet.",
    description:
      "Creamy Greek yogurt, juicy berries and a little chocolate frozen into bite-sized pieces for an easy high-protein sweet snack.",

    meal: "Snacks",
    goals: ["High Protein", "Meal Prep"],

    calories: 220,
    protein: 20,
    carbs: 25,
    fat: 6,

    time: "2 HR 10 MIN",
    servings: 1,

    ingredients: [
      "3/4 cup plain 0–2% Greek yogurt",
      "1/2 scoop vanilla protein powder",
      "1/2 cup mixed berries, sliced if needed",
      "1 tsp honey or maple syrup",
      "1 tbsp mini dark chocolate chips",
      "1 tsp chia seeds, optional",
    ],

    instructions: [
      "Line a small plate, tray or container with parchment paper.",
      "Mix the Greek yogurt and protein powder until smooth and creamy.",
      "Stir in the honey or maple syrup.",
      "Spread the yogurt mixture onto the parchment paper in an even layer.",
      "Scatter the berries, chocolate chips and chia seeds over the top.",
      "Freeze for about 2 hours, or until completely firm.",
      "Break into pieces and enjoy straight from the freezer.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the honey and chocolate chips or use a lower-sugar alternative. Stick with berries for the fruit topping.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Add sliced banana, granola or a little extra honey when you want more carbohydrate around training.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Try strawberries, blueberries or raspberries, drizzle with peanut butter, or add chopped nuts, coconut or cacao nibs.",
      },
    ],
  },

    // FROZEN BANANA PROTEIN BITES

  {
    id: "frozen-banana-protein-bites",
    title: "Frozen Banana Protein Bites",
    subtitle: "little bites. big dessert energy.",
    description:
      "Frozen banana bites with a creamy protein filling and chocolate drizzle for an easy make-ahead snack that tastes like a treat.",

    meal: "Snacks",
    goals: ["High Protein", "Meal Prep"],

    calories: 240,
    protein: 18,
    carbs: 30,
    fat: 7,

    time: "1 HR 15 MIN",
    servings: 1,

    ingredients: [
      "1 small banana",
      "1/3 cup plain 0–2% Greek yogurt",
      "1/3 scoop vanilla protein powder",
      "1 tbsp natural peanut butter or sunflower seed butter",
      "2 tsp mini dark chocolate chips",
      "Pinch of sea salt, optional",
    ],

    instructions: [
      "Slice the banana into even rounds.",
      "Mix the Greek yogurt and protein powder until thick and smooth.",
      "Stir the peanut butter or sunflower seed butter into the yogurt mixture.",
      "Spoon a small amount of the filling onto half of the banana slices, then top with the remaining slices to make little sandwiches.",
      "Place the bites on a parchment-lined plate or tray.",
      "Melt the chocolate chips and drizzle a little chocolate over each bite.",
      "Add a tiny pinch of sea salt if desired.",
      "Freeze for at least 1 hour, or until firm.",
      "Let the bites sit at room temperature for a few minutes before eating if they are frozen solid.",
    ],

    swaps: [
      {
        label: "NUT-FREE",
        text: "Use sunflower seed butter instead of peanut or almond butter. Always check the labels on your protein powder and chocolate if preparing this for someone with a food allergy.",
      },
      {
        label: "LOWER CARB",
        text: "Use less banana, skip the chocolate drizzle and choose a protein powder and seed or nut butter without added sugar.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the banana and chocolate as written for an easy source of carbohydrate alongside the protein.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Use peanut butter, sunflower seed butter or almond butter if appropriate, add cinnamon, or sprinkle the bites with coconut or crushed freeze-dried strawberries before freezing.",
      },
    ],
  },




 // SMOOTHIES / SHAKES 
     // ============================================================


  // STRAWBERRY PROTEIN SMOOTHIE

  {
    id: "strawberry-protein-smoothie",
    title: "Strawberry Protein Smoothie",
    subtitle: "cold, creamy + done in five.",
    description:
      "A quick, creamy protein smoothie for busy mornings, easy snacks or post-workout fuel.",

    meal: "Shakes",
    goals: ["High Protein", "Quick", "Post-Workout"],

    calories: 300,
    protein: 35,
    carbs: 32,
    fat: 5,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "1 cup frozen strawberries",
      "1 scoop vanilla protein powder",
      "1/2 cup plain 0–2% Greek yogurt",
      "3/4 cup unsweetened milk of choice",
      "1/2 small banana",
      "1 tsp chia seeds",
      "1/2 tsp vanilla extract, optional",
      "Ice, as needed",
    ],

    instructions: [
      "Add the milk to the blender first, followed by the Greek yogurt and protein powder.",
      "Add the frozen strawberries, banana, chia seeds and vanilla if using.",
      "Blend until smooth and creamy.",
      "Add a little more milk if the smoothie is too thick, or a few ice cubes if you want it thicker and colder.",
      "Taste and adjust the consistency, then pour into a glass and enjoy right away.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the banana and use a little extra strawberry or ice. Choose an unsweetened milk and protein powder with minimal added sugar.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the banana or use a full banana, and add oats when you want more carbohydrate around a harder training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Try mixed berries, add spinach, blend in cocoa powder, or add a spoonful of peanut or almond butter for a different flavour.",
      },
    ],
  },

  // GREEN PROTEIN SMOOTHIE

  {
    id: "green-protein-smoothie",
    title: "Green Protein Smoothie",
    subtitle: "greens, but make them taste good.",
    description:
      "A creamy tropical green smoothie packed with protein, fruit and spinach for an easy breakfast, snack or post-workout option.",

    meal: "Shakes",
    goals: ["High Protein", "Quick", "Post-Workout"],

    calories: 310,
    protein: 34,
    carbs: 38,
    fat: 4,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "1 packed cup baby spinach",
      "1/2 cup frozen pineapple",
      "1/2 small banana",
      "1 scoop vanilla protein powder",
      "1/2 cup plain 0–2% Greek yogurt",
      "3/4 cup unsweetened milk of choice",
      "1 tsp chia seeds",
      "Squeeze of fresh lime juice, optional",
      "Ice, as needed",
    ],

    instructions: [
      "Add the milk and spinach to a blender and blend until the spinach is completely broken down.",
      "Add the Greek yogurt, protein powder, frozen pineapple, banana and chia seeds.",
      "Blend until smooth and creamy.",
      "Add a squeeze of lime juice if you want a brighter, fresher flavour.",
      "Add a little more milk to thin it out or a few ice cubes to make it thicker and colder.",
      "Pour into a glass and enjoy right away.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the banana and use a little less pineapple. Add extra ice or spinach for volume and choose an unsweetened milk and protein powder with minimal added sugar.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the banana and pineapple as written, or add 1/4 cup oats when you want extra carbohydrate around a harder training session.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Swap spinach for kale, pineapple for mango, add fresh ginger, or blend in cucumber for an extra-fresh green smoothie.",
      },
    ],
  },
  // CARROT CAKE PROTEIN SMOOTHIE

  {
    id: "carrot-cake-protein-smoothie",
    title: "Carrot Cake Protein Smoothie",
    subtitle: "carrot cake energy, smoothie macros.",
    description:
      "A creamy cinnamon-spiced protein smoothie made with carrot, banana and Greek yogurt for a sweet, filling shake that tastes like dessert.",

    meal: "Shakes",
    goals: ["High Protein", "Quick", "Post-Workout"],

    calories: 300,
    protein: 33,
    carbs: 36,
    fat: 5,

    time: "5 MIN",
    servings: 1,

    ingredients: [
      "1/2 cup finely shredded carrot", 
      "1/2 small frozen banana", 
      "1 scoop vanilla protein powder",
      "1/2 cup plain 0–2% Greek yogurt",
      "3/4 cup unsweetened milk of choice",
      "1 tsp chia seeds",
      "1/2 tsp cinnamon",
      "1/4 tsp vanilla extract",
      "Small pinch of ground ginger",
      "Small pinch of nutmeg - optional",
      "Ice, as needed",
    ],

    instructions: [
      "Add the milk and finely shredded carrot to a blender and blend until the carrot is broken down.",
      "Add the banana, Greek yogurt, protein powder, chia seeds, cinnamon, vanilla, ginger and nutmeg.",
      "Blend until completely smooth and creamy.",
      "Add a little more milk if the smoothie is too thick, or add ice for a thicker, colder shake.",
      "Taste and add a little extra cinnamon or vanilla if desired.",
      "Pour into a glass and enjoy right away.",
    ],

    swaps: [
      {
        label: "LOWER CARB",
        text: "Skip the banana and add extra ice. You can also use a little more Greek yogurt for creaminess without adding as much carbohydrate.",
      },
      {
        label: "FUEL YOUR WORKOUT",
        text: "Keep the banana as written or add 1/4 cup oats for extra carbohydrate and a thicker carrot-cake texture.",
      },
      {
        label: "MAKE IT YOURS",
        text: "Add a small piece of fresh ginger, a little extra cinnamon, or top with crushed walnuts or pecans for even more carrot-cake flavour.",
      },
    ],
  },



];