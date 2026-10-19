
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveJourney } from "@/lib/active-journey";
import { getJourneyDay } from "@/lib/challenge";

const activities = [
  "Walking",
  "Running",
  "Pilates",
   "StairMaster",
"HIIT",
  "Yoga",
  "Strength Training",
  "Cycling",
  "Dance",
  "Swimming",
  "Other",
  
];

export default function MovementLogger() {
  const [activity, setActivity] = useState("Walking");
  const [customActivity, setCustomActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [calorieSource, setCalorieSource] = useState("watch");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);

  const minutes = Number(duration);

  const validDuration =
    duration.trim() !== "" &&
    Number.isInteger(minutes) &&
    minutes >= 1 &&
    minutes <= 1440;

  const validCalories =
    calories.trim() === "" ||
    (Number.isInteger(Number(calories)) &&
      Number(calories) >= 0);

  const activityName =
    activity === "Other" ? customActivity.trim() : activity;

  const ready =
    validDuration &&
    validCalories &&
    activityName.length > 0 &&
    activityName.length <= 80;

  const fieldClass =
    "w-full rounded-xl border border-[#DED0CB] bg-white px-4 py-3 text-sm text-[#211C19] outline-none transition focus:border-[#A77B73]";

  const saveMovement = async () => {
    if (!ready || isSaving) return;

    setIsSaving(true);
    setMessage("");
    setSaveError(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in before saving movement.");
      }

      const journey = await getActiveJourney();

      if (
        !journey ||
        journey.user_id !== user.id ||
        journey.status !== "active" ||
        !journey.start_date
      ) {
        throw new Error(
          "No active challenge was found. Your movement was not saved."
        );
      }

      const challengeDay = getJourneyDay(journey.start_date);
      const today = new Date();

const activityDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

      if (
        !Number.isInteger(challengeDay) ||
        challengeDay < 1 ||
        challengeDay > journey.challenge_length
      ) {
        throw new Error(
          "Your challenge is outside its active dates. Your movement was not saved."
        );
      }
const { error } = await supabase
  .from("movement_activities")
  .insert({
    user_id: user.id,
    journey_id: journey.id,
    challenge_day: challengeDay,
    activity_date: activityDate,
    activity_name: activityName,
    duration_minutes: minutes,
    calories_burned:
      calories.trim() === "" ? null : Number(calories),
    calorie_source:
      calories.trim() === "" ? null : calorieSource,
    notes: notes.trim() || null,
  });
      if (error) throw error;

      setMessage(`${minutes} minutes of ${activityName} saved! ♡`);
      setDuration("");
      setCalories("");
      setNotes("");
      setCustomActivity("");
      setActivity("Walking");
      setCalorieSource("watch");
    } catch (error) {
      console.error("Could not save movement:", error);
      setSaveError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-[1.5rem] border border-[#DED0CB] bg-[#FBF8F6] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9px] tracking-[0.25em] text-[#9D6F67]">
            LOG YOUR MOVEMENT
          </p>

          <h2 className="mt-3 font-serif text-3xl text-[#211C19]">
            Movement,{" "}
            <span className="italic text-[#A77B73]">
              your way. ♡
            </span>
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8C7770]">
            Every minute matters. Log the movement that
            feels right for you.
          </p>
        </div>

        <span className="rounded-full border border-[#DEC9C3] px-3 py-1.5 text-[9px] tracking-[0.12em] text-[#9D6F67]">
          MOVEMENT JOURNAL
        </span>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="movement-activity"
            className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
          >
            TYPE OF MOVEMENT
          </label>

          <select
            id="movement-activity"
            value={activity}
            onChange={(event) => setActivity(event.target.value)}
            className={fieldClass}
          >
            {activities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {activity === "Other" && (
          <div className="sm:col-span-2">
            <label
              htmlFor="movement-custom"
              className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
            >
              ACTIVITY NAME
            </label>

            <input
              id="movement-custom"
              type="text"
              maxLength={80}
              value={customActivity}
              onChange={(event) =>
                setCustomActivity(event.target.value)
              }
              placeholder="What did you do?"
              className={fieldClass}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="movement-duration"
            className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
          >
            DURATION · MINUTES
          </label>

          <input
            id="movement-duration"
            type="number"
            min="1"
            max="1440"
            step="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="e.g. 45"
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="movement-calories"
            className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
          >
            CALORIES BURNED · OPTIONAL
          </label>

          <input
            id="movement-calories"
            type="number"
            min="0"
            step="1"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            placeholder="e.g. 250"
            className={fieldClass}
          />
        </div>

        {calories !== "" && (
          <div className="sm:col-span-2">
            <label
              htmlFor="movement-calorie-source"
              className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
            >
              CALORIE SOURCE
            </label>

            <select
              id="movement-calorie-source"
              value={calorieSource}
              onChange={(event) =>
                setCalorieSource(event.target.value)
              }
              className={fieldClass}
            >
              <option value="watch">
                Fitness watch or tracker
              </option>
              <option value="estimate">
                My own estimate
              </option>
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor="movement-notes"
            className="mb-2 block text-[10px] tracking-[0.14em] text-[#806E68]"
          >
            NOTES · OPTIONAL
          </label>

          <textarea
            id="movement-notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="How did it feel? Anything you want to remember?"
            className={`${fieldClass} resize-y`}
          />
        </div>
      </div>

      {ready && (
        <div className="mt-6 rounded-xl border border-[#E6D7D1] bg-[#F7F1ED] p-4">
          <p className="text-[9px] tracking-[0.18em] text-[#9D6F67]">
            YOUR MOVEMENT PREVIEW
          </p>

          <p className="mt-2 font-serif text-xl text-[#211C19]">
            {activityName} ♡
          </p>

          <p className="mt-1 text-sm text-[#806E68]">
            {minutes} min
            {calories !== "" &&
              ` · ${calories} kcal (${calorieSource === "watch" ? "tracker" : "estimated"})`}
          </p>

          {notes.trim() && (
            <p className="mt-2 text-xs leading-5 text-[#8C7770]">
              {notes}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!ready || isSaving}
        onClick={saveMovement}
        className={`mt-6 w-full rounded-full bg-[#A77B73] px-6 py-3.5 text-xs tracking-[0.16em] text-white transition ${
          !ready || isSaving
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-[#926961]"
        }`}
      >
        {isSaving ? "SAVING YOUR MOVEMENT..." : "SAVE MY MOVEMENT ♡"}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-3 text-center text-[11px] leading-5 ${
            saveError ? "text-red-700" : "text-[#8F655E]"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
