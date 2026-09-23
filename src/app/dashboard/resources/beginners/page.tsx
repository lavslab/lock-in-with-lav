"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

const basics = [
  { number: "01", title: "SQUAT", cue: "Sit down + back", text: "Keep your feet planted, brace your core and lower through a comfortable range before driving back up." },
  { number: "02", title: "HINGE", cue: "Push your hips back", text: "Keep a long spine and send your hips behind you. Think less 'squat down' and more 'close a car door with your hips.'" },
  { number: "03", title: "LUNGE", cue: "Control the step", text: "Stay tall, keep your front foot grounded and lower only as far as you can control." },
  { number: "04", title: "PUSH", cue: "Press away", text: "Brace first, keep the movement controlled and press without letting your shoulders shrug toward your ears." },
  { number: "05", title: "PULL", cue: "Lead with the elbows", text: "Keep your shoulders relaxed and think about drawing your elbows back rather than just moving the weight." },
  { number: "06", title: "BRACE", cue: "Create tension", text: "Gently tighten around your midsection before a lift while continuing to breathe instead of sucking your stomach in." },
];

const modifications = [
  { title: "NEED LESS IMPACT?", text: "Remove jumping. Step instead of hop, march instead of run, and choose controlled versions of the same movement." },
  { title: "NEED MORE SUPPORT?", text: "Use a wall, bench, chair or rack for balance and shorten the range until the movement feels controlled." },
  { title: "TRAINING AT HOME?", text: "Use dumbbells, bands or bodyweight. When equipment is limited, slow the tempo, add reps or use single-side variations." },
  { title: "TRAINING AT THE GYM?", text: "Use the dumbbell, cable or machine version that matches the same movement pattern and feels best for you." },
];

const terms = [
  { term: "REP", meaning: "One complete repetition of an exercise." },
  { term: "SET", meaning: "A group of repetitions performed together." },
  { term: "REST", meaning: "The recovery time between sets or exercises." },
  { term: "RPE", meaning: "Rate of perceived exertion — a 1–10 scale for how hard a set feels." },
  { term: "TEMPO", meaning: "The speed you use during each part of a repetition." },
  { term: "SUPERSET", meaning: "Two exercises performed back-to-back before taking a longer rest." },
  { term: "PROGRESSIVE OVERLOAD", meaning: "Gradually increasing the challenge over time through load, reps, range, control or another training variable." },
  { term: "AMRAP", meaning: "As many reps or rounds as possible within the instructions given while maintaining good form." },
];

export default function BeginnersPage() {
  const [firstName, setFirstName] = useState("there");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoadingUser(false); return; }
      const savedName = user.user_metadata?.name;
      if (savedName) setFirstName(savedName);
      else if (user.email) setFirstName(user.email.split("@")[0]);
      setIsLoadingUser(false);
    };
    getUser();
  }, []);

  const initial = !isLoadingUser && firstName !== "there" ? firstName.charAt(0).toUpperCase() : "♡";

  return (
    <main className="min-h-screen bg-[#F7F1ED] text-[#211C19]">
      <div className="flex min-h-screen">
        <DashboardSidebar firstName={firstName} initial={initial} isLoadingUser={isLoadingUser} />
        <section className="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">LOCK IN WITH LAV</p>
              <p className="mt-2 font-serif text-xl italic text-[#A77B73]">start exactly where you are. ♡</p>
            </div>
            <Link href="/dashboard/resources" className="rounded-full border border-[#CBA9A2] px-5 py-3 text-[11px] tracking-[0.18em] transition hover:bg-[#EAD8D3]">← RESOURCES</Link>
          </header>

          <section className="mt-10 rounded-[2rem] bg-[#211C19] px-8 py-10 text-[#F7F1ED] md:px-10 md:py-12">
            <p className="text-[11px] tracking-[0.32em] text-[#DDB5AE]">BEGINNER&apos;S CORNER</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-none md:text-5xl lg:text-6xl">
              Learn the basics.
              <span className="block italic text-[#DDB5AE]">then build from there. ♡</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-[#CFC1BC]">A quick reference for movement patterns, modifications and the training terms you&apos;ll see throughout Lock In with Lav.</p>
          </section>

          <section className="py-10">
            <div className="mb-7">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">EXERCISE BASICS</p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">Six patterns to <span className="italic text-[#A77B73]">know. ♡</span></h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {basics.map((item) => (
                <article key={item.number} className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
                  <div className="flex gap-5">
                    <span className="font-serif text-3xl text-[#D2B0A9]">{item.number}</span>
                    <div>
                      <p className="text-[11px] tracking-[0.18em]">{item.title}</p>
                      <p className="mt-2 font-serif text-xl italic text-[#A77B73]">{item.cue}</p>
                      <p className="mt-3 text-[16px] leading-7 text-[#6F5F59]">{item.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="mb-7">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">MODIFICATIONS</p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">Make the movement <span className="italic text-[#A77B73]">work for you.</span></h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {modifications.map((item) => (
                <article key={item.title} className="rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6] p-6">
                  <p className="text-[11px] tracking-[0.17em] text-[#8F655E]">{item.title}</p>
                  <p className="mt-3 text-[16px] leading-7 text-[#6F5F59]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-10">
            <div className="mb-7">
              <p className="text-[11px] tracking-[0.28em] text-[#9D6F67]">GYM TERMS</p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">What does that <span className="italic text-[#A77B73]">even mean?</span></h2>
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-[#DED0CB] bg-[#FBF8F6]">
              {terms.map((item, index) => (
                <div key={item.term} className={`grid gap-2 px-6 py-5 md:grid-cols-[190px_1fr] md:gap-6 ${index !== terms.length - 1 ? "border-b border-[#E1D3CE]" : ""}`}>
                  <p className="text-[11px] tracking-[0.15em] text-[#8F655E]">{item.term}</p>
                  <p className="text-[16px] leading-7 text-[#6F5F59]">{item.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-[#DED0CB] py-7">
            <p className="max-w-4xl text-[15px] leading-6 text-[#8C7770]">Good form is not about making every body look identical. Use a range and variation you can control, and stop if an exercise causes sharp pain, numbness, dizziness or worsening symptoms.</p>
          </section>

          <section className="pb-14 text-center">
            <p className="font-serif text-2xl italic text-[#A77B73] md:text-3xl">learn it. practice it. build on it. ♡</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/resources/workouts" className="rounded-full bg-[#211C19] px-8 py-3.5 text-[11px] tracking-[0.20em] text-[#F7F1ED] transition hover:-translate-y-0.5">FIND A WORKOUT →</Link>
              <Link href="/dashboard/resources" className="rounded-full border border-[#CBA9A2] px-8 py-3.5 text-[11px] tracking-[0.20em] text-[#8F655E] transition hover:bg-[#EAD8D3]">BACK TO RESOURCES</Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
