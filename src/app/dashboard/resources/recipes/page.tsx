"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const recipes = [
  { id:"protein-pancakes", title:"Protein Pancakes", subtitle:"soft, sweet + actually filling.", meal:"Breakfast", goals:["High Protein","Post-Workout"], calories:360, protein:34, carbs:39, time:"15 MIN" },
  { id:"breakfast-wrap", title:"High-Protein Breakfast Wrap", subtitle:"the breakfast that keeps up.", meal:"Breakfast", goals:["High Protein","Quick"], calories:390, protein:36, carbs:30, time:"10 MIN" },
  { id:"greek-yogurt-crunch-bowl", title:"Greek Yogurt Crunch Bowl", subtitle:"sweet, cold + protein packed.", meal:"Breakfast", goals:["High Protein","Quick"], calories:330, protein:32, carbs:35, time:"5 MIN" },
  { id:"chicken-taco-bowl", title:"Chicken Taco Bowl", subtitle:"big bowl. balanced macros.", meal:"Lunch", goals:["High Protein","Meal Prep","Post-Workout"], calories:480, protein:46, carbs:48, time:"25 MIN" },
  { id:"turkey-burger-bowl", title:"Turkey Burger Bowl", subtitle:"burger night, locked-in edition.", meal:"Lunch", goals:["High Protein","Lower Carb","Meal Prep"], calories:420, protein:43, carbs:25, time:"20 MIN" },
  { id:"creamy-chicken-protein-pasta", title:"Creamy Chicken Protein Pasta", subtitle:"yes, pasta still fits. ♡", meal:"Dinner", goals:["High Protein","Post-Workout"], calories:520, protein:48, carbs:55, time:"30 MIN" },
  { id:"salmon-power-bowl", title:"Salmon Power Bowl", subtitle:"colourful, balanced + satisfying.", meal:"Dinner", goals:["High Protein","Meal Prep"], calories:510, protein:39, carbs:43, time:"25 MIN" },
  { id:"loaded-chicken-potato", title:"Loaded Chicken Potato", subtitle:"comfort food with a protein goal.", meal:"Dinner", goals:["High Protein","Post-Workout"], calories:490, protein:45, carbs:52, time:"30 MIN" },
  { id:"protein-snack-box", title:"Protein Snack Box", subtitle:"snacky, but make it useful.", meal:"Snacks", goals:["High Protein","Lower Carb","Quick"], calories:260, protein:28, carbs:18, time:"5 MIN" },
  { id:"strawberry-protein-smoothie", title:"Strawberry Protein Smoothie", subtitle:"cold, creamy + done in five.", meal:"Shakes", goals:["High Protein","Quick","Post-Workout"], calories:300, protein:35, carbs:32, time:"5 MIN" },

  {
    id: "ground-turkey-sweet-potato-bowl",
    title: "Ground Turkey Sweet Potato Bowl",
    subtitle: "protein-packed comfort. ♡",
    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],
    calories: 450,
    protein: 40,
    carbs: 42,
    time: "25 MIN",
  },
  {
    id: "turkey-stuffed-peppers",
    title: "Turkey Stuffed Bell Peppers",
    subtitle: "simple, filling + balanced.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],
    calories: 410,
    protein: 38,
    carbs: 28,
    time: "35 MIN",
  },
  {
    id: "turkey-quesadillas",
    title: "Ground Turkey Quesadillas",
    subtitle: "healthy-ish never has to be boring.",
    meal: "Lunch",
    goals: ["High Protein", "Quick"],
    calories: 440,
    protein: 38,
    carbs: 36,
    time: "20 MIN",
  },
  {
    id: "lemon-garlic-shrimp",
    title: "Lemon Garlic Shrimp + Zucchini",
    subtitle: "light, fresh + full of flavour.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Quick"],
    calories: 330,
    protein: 34,
    carbs: 16,
    time: "20 MIN",
  },
  {
    id: "salmon-roasted-veggies",
    title: "Salmon + Roasted Veggies",
    subtitle: "good fats. good fuel.",
    meal: "Dinner",
    goals: ["High Protein", "Lower Carb", "Meal Prep"],
    calories: 470,
    protein: 38,
    carbs: 24,
    time: "30 MIN",
  },
  {
    id: "honey-soy-chicken-bowl",
    title: "Honey Soy Chicken Veggie Bowl",
    subtitle: "your bowl, your way. ♡",
    meal: "Dinner",
    goals: ["High Protein", "Meal Prep", "Post-Workout"],
    calories: 490,
    protein: 44,
    carbs: 50,
    time: "30 MIN",
  },
  {
    id: "black-bean-corn-tacos",
    title: "Black Bean + Corn Tacos",
    subtitle: "meatless but still satisfying.",
    meal: "Lunch",
    goals: ["Meal Prep", "Quick"],
    calories: 390,
    protein: 20,
    carbs: 55,
    time: "20 MIN",
  },
  {
    id: "black-bean-taquitos",
    title: "Crispy Black Bean Taquitos",
    subtitle: "crispy. easy. so good.",
    meal: "Dinner",
    goals: ["Meal Prep"],
    calories: 410,
    protein: 21,
    carbs: 52,
    time: "30 MIN",
  },
];

const mealTypes = ["All","Breakfast","Lunch","Dinner","Snacks","Shakes"];
const goalTypes = ["All","High Protein","Lower Carb","Quick","Meal Prep","Post-Workout"];

export default function RecipesPage() {
  const [firstName,setFirstName]=useState("there");
  const [isLoadingUser,setIsLoadingUser]=useState(true);
  const [meal,setMeal]=useState("All");
  const [goal,setGoal]=useState("All");

  useEffect(()=>{ const getUser=async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setIsLoadingUser(false);return;}
    const savedName=user.user_metadata?.name;
    if(savedName) setFirstName(savedName);
    else if(user.email) setFirstName(user.email.split("@")[0]);
    setIsLoadingUser(false);
  }; getUser(); },[]);

  const initial=!isLoadingUser&&firstName!=="there"?firstName.charAt(0).toUpperCase():"♡";
  const filteredRecipes=useMemo(()=>recipes.filter(r=>(meal==="All"||r.meal===meal)&&(goal==="All"||r.goals.includes(goal))),[meal,goal]);

  const FilterButton=({label,active,onClick}:{label:string;active:boolean;onClick:()=>void})=>(
    <button type="button" onClick={onClick} className={`rounded-full border px-4 py-2 text-[8px] tracking-[0.16em] transition ${active?"border-[#211C19] bg-[#211C19] text-[#F7F1ED]":"border-[#D6C3BD] bg-[#FBF8F6] text-[#806E68] hover:border-[#A77B73]"}`}>{label.toUpperCase()}</button>
  );

  return <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]"><div className="flex min-h-screen">
    <DashboardSidebar firstName={firstName} initial={initial} isLoadingUser={isLoadingUser}/>
    <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
      <header className="flex items-center justify-between"><div><p className="text-[8px] tracking-[0.35em] text-[#9D6F67]">LOCK IN WITH LAV</p><p className="mt-2 font-serif text-xl italic text-[#A77B73]">your recipe library. ♡</p></div>
        <Link href="/dashboard/resources" className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]">← RESOURCES</Link>
      </header>

      <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div>
        <p className="text-[8px] tracking-[0.4em] text-[#DDB5AE]">RECIPE LIBRARY</p>
        <h1 className="mt-5 font-serif text-4xl leading-none md:text-5xl lg:text-6xl">Eat well. Stay full.</h1>
        <p className="mt-3 font-serif text-2xl italic text-[#DDB5AE] md:text-3xl">protein first, always delicious. ♡</p>
      </div><p className="max-w-xs text-[8px] leading-5 tracking-[0.15em] text-[#BFAEAA]">SIMPLE, PROTEIN-FORWARD RECIPES BUILT TO SUPPORT YOUR GOALS.</p></div></section>

      <section className="py-10"><div className="rounded-[2rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 md:p-8"><div className="grid gap-8 xl:grid-cols-2">
        <div><p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">WHAT ARE WE EATING?</p><div className="mt-4 flex flex-wrap gap-2">{mealTypes.map(o=><FilterButton key={o} label={o} active={meal===o} onClick={()=>setMeal(o)}/>)}</div></div>
        <div><p className="text-[8px] tracking-[0.32em] text-[#9D6F67]">WHAT DO YOU NEED?</p><div className="mt-4 flex flex-wrap gap-2">{goalTypes.map(o=><FilterButton key={o} label={o} active={goal===o} onClick={()=>setGoal(o)}/>)}</div></div>
      </div></div></section>

      <section className="pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[8px] tracking-[0.4em] text-[#9D6F67]">BROWSE RECIPES</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">Find your <span className="italic text-[#A77B73]">next meal.</span></h2></div>
        <p className="font-serif text-lg italic text-[#A77B73]">{filteredRecipes.length} {filteredRecipes.length===1?"recipe":"recipes"} ♡</p></div>

        {filteredRecipes.length>0?<div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{filteredRecipes.map((r,i)=>
          <Link key={r.id} href={`/dashboard/resources/recipes/${r.id}`} className="group flex min-h-[330px] flex-col justify-between rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CBA9A2] hover:shadow-sm">
            <div><div className="flex items-start justify-between gap-4"><span className="font-serif text-3xl text-[#D2B0A9]">{String(i+1).padStart(2,"0")}</span><span className="rounded-full border border-[#D6C3BD] px-3 py-1.5 text-[7px] tracking-[0.18em] text-[#8F655E]">{r.meal.toUpperCase()}</span></div>
            <h3 className="mt-7 font-serif text-3xl leading-tight">{r.title}</h3><p className="mt-2 font-serif text-xl italic text-[#A77B73]">{r.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">{r.goals.map(t=><span key={t} className="rounded-full bg-[#EAD8D3]/65 px-3 py-1.5 text-[7px] tracking-[0.12em] text-[#806E68]">{t.toUpperCase()}</span>)}</div></div>
            <div className="mt-8"><div className="grid grid-cols-4 gap-2 border-t border-[#E1D3CE] pt-4 text-center">
              <div><p className="font-serif text-lg">{r.calories}</p><p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">CAL</p></div>
              <div className="border-l border-[#E1D3CE]"><p className="font-serif text-lg">{r.protein}g</p><p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">PROTEIN</p></div>
              <div className="border-l border-[#E1D3CE]"><p className="font-serif text-lg">{r.carbs}g</p><p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">CARBS</p></div>
              <div className="border-l border-[#E1D3CE]"><p className="font-serif text-lg">{r.time}</p><p className="mt-1 text-[6px] tracking-[0.14em] text-[#806E68]">PREP</p></div>
            </div><div className="mt-5 flex items-center justify-between"><span className="text-[7px] tracking-[0.25em] text-[#9D6F67]">VIEW RECIPE</span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CBA9A2] font-serif text-lg text-[#A77B73] transition group-hover:bg-[#EAD8D3]">→</span></div></div>
          </Link>)}</div>:
          <div className="mt-8 rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-16 text-center"><p className="font-serif text-3xl italic text-[#A77B73]">nothing here yet. ♡</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#806E68]">Try another combination — we&apos;re still growing the recipe library.</p><button type="button" onClick={()=>{setMeal("All");setGoal("All");}} className="mt-6 rounded-full border border-[#CBA9A2] px-6 py-3 text-[8px] tracking-[0.22em] transition hover:bg-[#EAD8D3]">CLEAR FILTERS</button></div>}
      </section>

      <section className="rounded-[2rem] bg-[#EAD8D3] px-7 py-8 md:px-9"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-[8px] tracking-[0.35em] text-[#8F655E]">FOOD THAT WORKS WITH YOU</p><h2 className="mt-3 font-serif text-3xl">Protein first. <span className="italic text-[#9D6F67]">balance over restriction. ♡</span></h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#806E68]">Use the nutrition info as a guide. Individual energy and nutrition needs vary.</p></div><Link href="/dashboard/resources/meal-plans" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#211C19] px-7 py-3.5 text-[8px] tracking-[0.22em] text-[#F7F1ED] transition hover:-translate-y-0.5">MEAL PLANS →</Link></div></section>

      <section className="py-14 text-center"><Link href="/dashboard/resources" className="text-[8px] tracking-[0.25em] text-[#9D6F67] transition hover:text-[#211C19]">← BACK TO ALL RESOURCES</Link></section>
    </section>
  </div></main>;
}
