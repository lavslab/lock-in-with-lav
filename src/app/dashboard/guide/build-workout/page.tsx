
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { workoutDetails } from "@/lib/workoutDetails";
import { supabase } from "@/lib/supabase";

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type LibraryExercise = {
  name: string;
  sets: string;
  reps: string;
  source: string;
};

const libraryExercises: LibraryExercise[] = Array.from(
  new Map<string, LibraryExercise>(
    Object.values(workoutDetails)
      .flatMap((workout) => [
        ...workout.exercises.map((exercise) => ({
          name: exercise.name,
          sets: String(exercise.sets),
          reps: exercise.reps,
          source: workout.title,
        })),
        ...workout.exercises.flatMap((exercise) =>
          (exercise.swaps ?? []).map((swap) => ({
            name: swap.name,
            sets: String(exercise.sets),
            reps: exercise.reps,
            source: "Exercise alternative",
          }))
        ),
      ])
      .map((exercise): [string, LibraryExercise] => [
        exercise.name.trim().toLowerCase(),
        exercise,
      ])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

export default function BuildWorkoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
const editId = searchParams.get("edit");

const [loadingWorkout, setLoadingWorkout] = useState(false);
const [loadError, setLoadError] = useState("");

  const [workoutName, setWorkoutName] = useState("");
  const [focus, setFocus] = useState("Full Body");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState("");
const [saveSuccess, setSaveSuccess] = useState(false);

  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();

    if (!query) return libraryExercises;

    return libraryExercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.source.toLowerCase().includes(query)
    );
  }, [librarySearch]);

  const addCustomExercise = () => {
    setExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: "3",
        reps: "12",
        weight: "",
      },
    ]);
  };

  const addLibraryExercise = (selected: LibraryExercise) => {
    setExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: selected.name,
        sets: selected.sets,
        reps: selected.reps,
        weight: "",
      },
    ]);

    setShowLibrary(false);
    setLibrarySearch("");
  };

  const updateExercise = (
    id: string,
    field: keyof Exercise,
    value: string
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
  };

  const removeExercise = (id: string) => {
    setExercises((current) =>
      current.filter((exercise) => exercise.id !== id)
    );
  };

useEffect(() => {
  let active = true;

  const loadWorkout = async () => {
    if (!editId) return;

    setLoadingWorkout(true);
    setLoadError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to edit your workout.");
      }

      const { data, error } = await supabase
        .from("custom_workouts")
        .select("name, focus, exercises")
        .eq("id", editId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (active) {
        setWorkoutName(data.name);
        setFocus(data.focus);
        setExercises(data.exercises as Exercise[]);
      }
    } catch (error) {
      if (active) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Couldn't load your workout."
        );
      }
    } finally {
      if (active) setLoadingWorkout(false);
    }
  };

  void loadWorkout();

  return () => {
    active = false;
  };
}, [editId]);


const saveWorkout = async () => {
  if (isSaving) return;

  setSaveMessage("");
  setSaveSuccess(false);

  if (!workoutName.trim()) {
    setSaveMessage("Give your workout a name first. ♡");
    return;
  }

  if (
    exercises.length === 0 ||
    exercises.some((exercise) => !exercise.name.trim())
  ) {
    setSaveMessage("Add at least one named exercise. ♡");
    return;
  }

  setIsSaving(true);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to save your workout.");
    }

    const workoutData = {
  name: workoutName.trim(),
  focus,
  exercises: exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name.trim(),
    sets: exercise.sets.trim(),
    reps: exercise.reps.trim(),
    weight: exercise.weight.trim(),
  })),
};

const { error } = editId
  ? await supabase
      .from("custom_workouts")
      .update(workoutData)
      .eq("id", editId)
      .eq("user_id", user.id)
  : await supabase
      .from("custom_workouts")
      .insert({
        ...workoutData,
        user_id: user.id,
      });

if (error) throw error;

console.log("SAVE SUCCESS — ABOUT TO REDIRECT");

setSaveSuccess(true);
setSaveMessage("Your workout has been saved! ♡");

window.location.assign("/dashboard/guide/my-workouts");

  } catch (error) {
    setSaveMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsSaving(false);
  }
};

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-4 pb-27 [#211C19]">
  <div className="flex justify-end">
  <Link
    href="/dashboard/guide/my-workouts"
    className="text-[10px] tracking-[0.15em] text-[#9D6F67] transition hover:text-[#211C19]"
  >
    MY CUSTOM WORKOUTS →
  </Link>
</div>


{loadingWorkout && (
  <p className="mt-5 text-[11px] text-[#927D76]">
    Loading your workout... ♡
  </p>
)}

{loadError && (
  <p role="alert" className="mt-5 text-[11px] text-[#A35F58]">
    {loadError}
  </p>
)} 


        <header className="mt-8">
          <p className="text-[9px] tracking-[0.3em] text-[#9D6F67]">
            YOUR TRAINING SPACE
          </p>

          <h1 className="mt-2 font-serif text-3xl">
            Make it{" "}
            <span className="italic text-[#A77B73]">yours.</span>
          </h1>

          <p className="mt-3 text-[12px] leading-5 text-[#806E68]">
            Build a workout that fits your body, your space, and your day. ♡
          </p>
        </header>

        {/* WORKOUT DETAILS */}
        <section className="mt-7 rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-5">
          <label
            htmlFor="workout-name"
            className="block text-[9px] tracking-[0.2em] text-[#9D6F67]"
          >
            WORKOUT NAME
          </label>

          <input
            id="workout-name"
            value={workoutName}
            onChange={(event) => setWorkoutName(event.target.value)}
            placeholder="e.g. My Glute Day"
            className="mt-2 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-[12px] outline-none focus:border-[#A77B73]"
          />

          <label
            htmlFor="training-focus"
            className="mt-5 block text-[9px] tracking-[0.2em] text-[#9D6F67]"
          >
            TRAINING FOCUS
          </label>

          <select
            id="training-focus"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-[12px] outline-none focus:border-[#A77B73]"
          >
            {[
              "Full Body",
              "Lower Body",
              "Glutes",
              "Upper Body",
              "Core",
              "Cardio",
              "Mobility",
              "Other",
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>

        {/* YOUR EXERCISES */}
        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Your exercises</h2>

            <span className="text-[10px] text-[#9D6F67]">
              {exercises.length} added
            </span>
          </div>

          {exercises.length === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-[#D6C3BD] p-6 text-center">
              <p className="font-serif text-lg italic text-[#A77B73]">
                Every routine starts somewhere.
              </p>

              <p className="mt-2 text-[11px] text-[#806E68]">
                Add your first exercise below. ♡
              </p>
            </div>
          )}

          <div className="mt-3 space-y-3">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="rounded-xl border border-[#DED0CB] bg-[#FBF8F6] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#9D6F67]">
                    EXERCISE {String(index + 1).padStart(2, "0")}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="text-[10px] text-[#9D6F67] underline"
                  >
                    REMOVE
                  </button>
                </div>

                <input
                  aria-label={`Exercise ${index + 1} name`}
                  value={exercise.name}
                  onChange={(event) =>
                    updateExercise(
                      exercise.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Exercise name"
                  className="w-full rounded-lg border border-[#DED0CB] bg-white px-3 py-3 text-[12px] outline-none focus:border-[#A77B73]"
                />

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["sets", "reps", "weight"] as const).map((field) => (
                    <label key={field}>
                      <span className="text-[9px] uppercase text-[#9D6F67]">
                        {field}
                      </span>

                      <input
                        value={exercise[field]}
                        onChange={(event) =>
                          updateExercise(
                            exercise.id,
                            field,
                            event.target.value
                          )
                        }
                        placeholder={
                          field === "weight" ? "Optional" : ""
                        }
                        className="mt-1 w-full rounded-lg border border-[#DED0CB] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#A77B73]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ADD EXERCISE BUTTONS */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowLibrary((current) => !current)}
              aria-expanded={showLibrary}
              className={`rounded-xl border px-3 py-4 text-[10px] transition ${
                showLibrary
                  ? "border-[#A77B73] bg-[#EAD8D3] text-[#8F655E]"
                  : "border-[#DED0CB] bg-[#FBF8F6] text-[#8F655E] hover:border-[#B9948B]"
              }`}
            >
              {showLibrary ? "− CLOSE LIBRARY" : "+ FROM LIBRARY"}
            </button>

            <button
              type="button"
              onClick={addCustomExercise}
              className="rounded-xl border border-[#CBA9A2] bg-[#EAD8D3] px-3 py-4 text-[10px] text-[#8F655E] transition hover:bg-[#E1C9C2]"
            >
              + CUSTOM EXERCISE
            </button>
          </div>

          {/* SEARCHABLE EXERCISE LIBRARY */}
          {showLibrary && (
            <div className="mt-4 rounded-[1.25rem] border border-[#DED0CB] bg-[#FBF8F6] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] tracking-[0.2em] text-[#9D6F67]">
                    EXERCISE LIBRARY
                  </p>

                  <h3 className="mt-1 font-serif text-xl text-[#211C19]">
                    Find your movement.
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowLibrary(false);
                    setLibrarySearch("");
                  }}
                  aria-label="Close exercise library"
                  className="text-lg text-[#A77B73]"
                >
                  ×
                </button>
              </div>

              <input
                type="search"
                value={librarySearch}
                onChange={(event) =>
                  setLibrarySearch(event.target.value)
                }
                placeholder="Search exercises..."
                aria-label="Search exercises"
                className="mt-4 w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-[12px] outline-none placeholder:text-[#A99790] focus:border-[#A77B73]"
              />

              <p className="mt-3 text-[10px] text-[#927D76]">
                {filteredLibrary.length} exercises available
              </p>

              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto">
                {filteredLibrary.map((exercise) => (
                  <div
                    key={exercise.name.toLowerCase()}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E1D3CE] bg-white px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#211C19]">
                        {exercise.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#927D76]">
                        {exercise.sets} sets · {exercise.reps} reps
                      </p>

                      <p className="mt-1 text-[9px] italic text-[#A77B73]">
                        {exercise.source}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addLibraryExercise(exercise)}
                      aria-label={`Add ${exercise.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBA9A2] bg-[#EAD8D3] text-lg text-[#8F655E] transition hover:bg-[#DCC1BA]"
                    >
                      +
                    </button>
                  </div>
                ))}

                {filteredLibrary.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-[#927D76]">
                    No exercises found. Try another search. ♡
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

    {/* SAVE WORKOUT */}
<button
  type="button"
  onClick={saveWorkout}
  disabled={isSaving || saveSuccess}
  className="mt-7 w-full rounded-xl bg-[#211C19] px-5 py-4 text-[11px] tracking-[0.15em] text-white transition hover:bg-[#40332E] disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSaving
    ? "SAVING..."
    : saveSuccess
      ? "WORKOUT SAVED ✓"
      : "SAVE MY WORKOUT ♡"}
</button>

{saveMessage && (
  <p
    role="status"
    className={`mt-3 text-center text-[11px] ${
      saveSuccess ? "text-[#7A856F]" : "text-[#A35F58]"
    }`}
  >
    {saveMessage}
  </p>
)}
     
    </main>
  );
}
