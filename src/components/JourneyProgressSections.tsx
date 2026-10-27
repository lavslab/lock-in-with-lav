
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveJourney } from "@/lib/active-journey";
import {
  getCurrentChallengeDay,
  parseChallengeDate,
} from "@/lib/challenge";

const supabase = createClient();

const DEFAULT_WINS = [
  "I feel stronger",
  "My energy is better",
  "I'm more consistent",
  "My clothes fit differently",
];

type Win = {
  id: number;
  win_key: string | null;
  label: string | null;
  challenge_day: number | null;
  is_completed: boolean;
};

type CheckinField =
  | "went_well"
  | "felt_hard"
  | "proud_of"
  | "next_week_focus";

type Checkin = {
  id: string;
  week_number: number;
} & Record<CheckinField, string | null>;

const EMPTY_CHECKIN: Record<CheckinField, string> = {
  went_well: "",
  felt_hard: "",
  proud_of: "",
  next_week_focus: "",
};

const QUESTIONS: { key: CheckinField; title: string }[] = [
  { key: "went_well", title: "What went well?" },
  { key: "felt_hard", title: "What felt hard?" },
  { key: "proud_of", title: "What are you proud of?" },
  {
    key: "next_week_focus",
    title: "What will you focus on next week?",
  },
];

const inputClass =
  "w-full rounded-xl border border-[#DED0CB] bg-[#FBF8F6] px-3 py-3 text-xs text-[#211C19] outline-none placeholder:text-[#AD9A94] focus:border-[#B48A82]";

const smallButtonClass =
  "rounded-full border border-[#DCCBC5] px-4 py-2 text-[9px] tracking-[0.12em] text-[#9D6F67] transition hover:bg-[#EAD8D3] disabled:opacity-40";

function SectionHeader({
  number,
  title,
  count,
}: {
  number: string;
  title: string;
  count?: number;
}) {
  return (
    <summary className="flex cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
      <span className="w-5 font-serif text-[11px] italic text-[#A77B73]">
        {number}
      </span>

      <span className="flex-1 font-serif text-[16px] text-[#211C19]">
        {title}
      </span>

      {count !== undefined && (
        <span className="text-[10px] tabular-nums text-[#A77B73]">
          {count}
        </span>
      )}

      <span className="ml-2 text-sm text-[#A77B73] group-open:hidden">
        +
      </span>

      <span className="ml-2 hidden text-sm text-[#A77B73] group-open:inline">
        −
      </span>
    </summary>
  );
}

function WinCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition ${
        checked
          ? "border-[#B98F87] bg-[#B98F87] text-white"
          : "border-[#DCCBC5] bg-transparent text-transparent"
      }`}
      aria-hidden="true"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

export default function JourneyProgressSections() {
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [challengeLength, setChallengeLength] = useState(75);

  const [wins, setWins] = useState<Win[]>([]);
const [checkins, setCheckins] = useState<Checkin[]>([]);

const [pendingWins, setPendingWins] = useState<
  Record<string, boolean>
>({});

const savingWinsRef = useRef<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customWin, setCustomWin] = useState("");
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [showPreviousWeeks, setShowPreviousWeeks] = useState(false);

  const [checkinForm, setCheckinForm] =
    useState<Record<CheckinField, string>>({
      ...EMPTY_CHECKIN,
    });

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in.");

      const journey = await getActiveJourney();

      if (
        !journey ||
        journey.user_id !== user.id ||
        journey.status !== "active" ||
        !journey.start_date
      ) {
        setJourneyId(null);
        setCurrentDay(null);
        setWins([]);
        setCheckins([]);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("challenge_start_date,challenge_length")
          .eq("id", user.id)
          .single();

      if (profileError) throw profileError;

      if (
        profile?.challenge_start_date !== journey.start_date ||
        (profile?.challenge_length ?? 75) !==
          journey.challenge_length
      ) {
        throw new Error(
          "Your journey details are updating. Refresh before editing."
        );
      }

      const [w, c] = await Promise.all([
        supabase
          .from("little_wins")
          .select(
            "id,win_key,label,challenge_day,is_completed"
          )
          .eq("user_id", user.id)
          .eq("journey_id", journey.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("weekly_checkins")
          .select(
            "id,week_number,went_well,felt_hard,proud_of,next_week_focus"
          )
          .eq("user_id", user.id)
          .eq("journey_id", journey.id)
          .order("week_number", { ascending: false }),
      ]);

      if (w.error) throw w.error;
      if (c.error) throw c.error;

      const start = parseChallengeDate(journey.start_date);
      const today = new Date();

      const elapsed =
        Math.floor(
          (Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ) -
            Date.UTC(
              start.getFullYear(),
              start.getMonth(),
              start.getDate()
            )) /
            86400000
        ) + 1;

      setJourneyId(journey.id);
      setChallengeLength(journey.challenge_length);

      setCurrentDay(
        elapsed >= 1 && elapsed <= journey.challenge_length
          ? getCurrentChallengeDay(
              journey.start_date,
              journey.challenge_length
            )
          : null
      );

      setWins((w.data ?? []) as Win[]);
      setCheckins((c.data ?? []) as Checkin[]);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load your progress."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getWritable = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("Please sign in.");

    const journey = await getActiveJourney();

    if (
      !journey ||
      journey.user_id !== user.id ||
      journey.status !== "active" ||
      journey.id !== journeyId ||
      !journey.start_date
    ) {
      throw new Error(
        "Your active journey changed. Refresh before saving."
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("challenge_start_date,challenge_length")
        .eq("id", user.id)
        .single();

    if (profileError) throw profileError;

    if (
      profile?.challenge_start_date !== journey.start_date ||
      (profile?.challenge_length ?? 75) !==
        journey.challenge_length
    ) {
      throw new Error(
        "Your journey information is updating."
      );
    }

    const start = parseChallengeDate(journey.start_date);
    const today = new Date();

    const elapsed =
      Math.floor(
        (Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ) -
          Date.UTC(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          )) /
          86400000
      ) + 1;

    if (
      elapsed < 1 ||
      elapsed > journey.challenge_length ||
      currentDay !== elapsed
    ) {
      throw new Error(
        "You can only add progress during your active challenge."
      );
    }

    return {
      userId: user.id,
      id: journey.id,
      day: elapsed,
    };
  };

  const perform = async (action: () => Promise<void>) => {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      await action();
      await load(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your changes."
      );
    } finally {
      setBusy(false);
    }
  };
const toggleWin = async (key: string, label: string) => {
  if (busy || currentDay === null || savingWinsRef.current.has(key)) return;

  savingWinsRef.current.add(key);

  const existingWin = wins.find(
    (win) => win.win_key === key && win.challenge_day === currentDay
  );

  const checked = pendingWins[key] ?? existingWin?.is_completed ?? false;

  setPendingWins((previous) => ({
    ...previous,
    [key]: !checked,
  }));

  setError(null);

  try {
    const j = await getWritable();

    const { data: existing, error: findError } = await supabase
      .from("little_wins")
      .select("id,is_completed")
      .eq("user_id", j.userId)
      .eq("journey_id", j.id)
      .eq("challenge_day", j.day)
      .eq("win_key", key)
      .maybeSingle();

    if (findError) throw findError;

    const next = !checked;

    if (existing) {
      const { data, error: updateError } = await supabase
        .from("little_wins")
        .update({
          is_completed: next,
          completed_at: next ? new Date().toISOString() : null,
        })
        .eq("id", existing.id)
        .eq("user_id", j.userId)
        .eq("journey_id", j.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;
      if (!data) throw new Error("This win could not be updated.");
    } else {
      const { error: insertError } = await supabase
        .from("little_wins")
        .insert({
          user_id: j.userId,
          journey_id: j.id,
          challenge_day: j.day,
          win_key: key,
          label,
          is_completed: next,
          completed_at: next ? new Date().toISOString() : null,
        });

      if (insertError) throw insertError;
    }

    setWins((previous) => {
      const remaining = previous.filter(
        (win) => !(win.win_key === key && win.challenge_day === j.day)
      );

      return [
        ...remaining,
        {
          ...(existingWin ?? {}),
          id: existing?.id ?? existingWin?.id ?? 0,
          user_id: j.userId,
          journey_id: j.id,
          challenge_day: j.day,
          win_key: key,
          label,
          is_completed: next,
          completed_at: next ? new Date().toISOString() : null,
        } as Win,
      ];
    });
  } catch (e) {
    setError(
      e instanceof Error ? e.message : "Could not save your changes."
    );
  } finally {
    setPendingWins((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
    savingWinsRef.current.delete(key);
  }
};
  const addCustomWin = () =>
    void perform(async () => {
      const label = customWin.trim();

      if (!label) {
        throw new Error(
          "Write your little win first. ♡"
        );
      }

      const key = `custom:${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;

      if (key === "custom:") {
        throw new Error("Use letters or numbers.");
      }

      const j = await getWritable();

      const { data: existing, error: findError } =
        await supabase
          .from("little_wins")
          .select("id")
          .eq("user_id", j.userId)
          .eq("journey_id", j.id)
          .eq("challenge_day", j.day)
          .eq("win_key", key)
          .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        throw new Error(
          "You've already added that win today. ♡"
        );
      }

      const { error: insertError } =
        await supabase
          .from("little_wins")
          .insert({
            user_id: j.userId,
            journey_id: j.id,
            challenge_day: j.day,
            win_key: key,
            label,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });

      if (insertError) throw insertError;

      setCustomWin("");
    });

  const removeCustomWin = (win: Win) =>
    void perform(async () => {
      const j = await getWritable();

      if (
        !win.win_key?.startsWith("custom:") ||
        win.challenge_day !== j.day
      ) {
        throw new Error(
          "Only today's custom wins can be removed."
        );
      }

      const { data, error: deleteError } =
        await supabase
          .from("little_wins")
          .delete()
          .eq("id", win.id)
          .eq("user_id", j.userId)
          .eq("journey_id", j.id)
          .eq("challenge_day", j.day)
          .select("id")
          .maybeSingle();

      if (deleteError) throw deleteError;

      if (!data) {
        throw new Error(
          "Could not remove this win."
        );
      }
    });

  const openCheckin = (week: number) => {
    const existing = checkins.find(
      (checkin) => checkin.week_number === week
    );

    setEditingWeek(week);

    setCheckinForm({
      went_well: existing?.went_well ?? "",
      felt_hard: existing?.felt_hard ?? "",
      proud_of: existing?.proud_of ?? "",
      next_week_focus:
        existing?.next_week_focus ?? "",
    });
  };

  const saveCheckin = () =>
    void perform(async () => {
      if (editingWeek === null) return;

      const j = await getWritable();
      const week = editingWeek;

      if (
        week < 1 ||
        week > Math.ceil(challengeLength / 7) ||
        week > Math.ceil(j.day / 7)
      ) {
        throw new Error(
          "This week isn't available for editing."
        );
      }

      const existing = checkins.find(
        (checkin) => checkin.week_number === week
      );

      if (existing) {
        const { data, error: updateError } =
          await supabase
            .from("weekly_checkins")
            .update({
              ...checkinForm,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
            .eq("user_id", j.userId)
            .eq("journey_id", j.id)
            .select("id")
            .maybeSingle();

        if (updateError) throw updateError;

        if (!data) {
          throw new Error(
            "This check-in could not be updated."
          );
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("weekly_checkins")
            .insert({
              user_id: j.userId,
              journey_id: j.id,
              week_number: week,
              ...checkinForm,
              updated_at: new Date().toISOString(),
            });

        if (insertError) throw insertError;
      }

      setEditingWeek(null);
    });

  const todayWins = wins.filter(
    (win) => win.challenge_day === currentDay
  );

  const completedTodayWins = todayWins.filter(
    (win) => win.is_completed
  );

  const currentWeek = currentDay
    ? Math.ceil(currentDay / 7)
    : null;

  const currentCheckin = checkins.find(
    (checkin) =>
      checkin.week_number === currentWeek
  );

  const previousCheckins = checkins.filter(
    (checkin) =>
      checkin.week_number !== currentWeek
  );

  return (
    <section className="mt-2 text-[#211C19]">
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-4 font-serif text-sm italic text-[#9D6F67]">
          Gathering your progress... ♡
        </p>
      ) : !journeyId ? (
        <p className="py-4 text-xs text-[#8C7770]">
          Your progress will appear when you have an active journey.
        </p>
      ) : (
        <div className="divide-y divide-[#E9DEDA]">

          {/* LITTLE WINS */}

          <details className="group">
            <SectionHeader
              number="01"
              title="Little Wins"
              count={completedTodayWins.length}
            />

            <div className="pb-6 pt-1">
              {currentDay !== null ? (
                <>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-serif text-[15px] italic text-[#A77B73]">
                      A little progress, every day.
                    </p>

                    <span className="shrink-0 text-[9px] tracking-[0.1em] text-[#A98D85]">
                      DAY {currentDay}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {DEFAULT_WINS.map((label) => {
                      const existing = todayWins.find(
                        (win) => win.win_key === label
                      );

                      const checked =
  pendingWins[label] ??
  existing?.is_completed ??
  false;

                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={busy || savingWinsRef.current.has(label)}
                          onClick={() =>
                            toggleWin(label, label)
                          }
                          aria-pressed={checked}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition disabled:opacity-50 ${
  checked
    ? "bg-[#F6ECE8] hover:bg-[#F1E2DD]"
    : "hover:bg-[#FBF8F6]"
}`}
                        >
                          <WinCheck checked={checked} />

                          <span
                            className={`flex-1 text-[12px] ${
                              checked
                                ? "text-[#9D6F67]"
                                : "text-[#4B3D38]"
                            }`}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}

                    {todayWins
                      .filter((win) =>
                        win.win_key?.startsWith("custom:")
                      )
                      .map((win) => (
                        <div
                          key={win.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              toggleWin(
                                win.win_key!,
                                win.label ?? "A little win"
                              )
                            }
                            aria-pressed={win.is_completed}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-50"
                          >
                            <WinCheck
                              checked={win.is_completed}
                            />

                            <span className="min-w-0 flex-1 break-words text-[12px] text-[#4B3D38]">
                              {win.label ?? "A little win"}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              removeCustomWin(win)
                            }
                            aria-label={`Remove ${win.label ?? "little win"}`}
                            className="shrink-0 px-1 text-[15px] text-[#B69C94] transition hover:text-[#211C19] disabled:opacity-50"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <input
                      value={customWin}
                      maxLength={80}
                      disabled={busy}
                      onChange={(event) =>
                        setCustomWin(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          customWin.trim() &&
                          !busy
                        ) {
                          event.preventDefault();
                          addCustomWin();
                        }
                      }}
                      placeholder="Add your own little win..."
                      aria-label="Your little win"
                      className="min-w-0 flex-1 border-b border-[#DCCBC5] bg-transparent px-1 py-3 text-[12px] text-[#211C19] outline-none placeholder:text-[#B29D96] focus:border-[#A77B73]"
                    />

                    <button
                      type="button"
                      disabled={busy || !customWin.trim()}
                      onClick={addCustomWin}
                      className="shrink-0 rounded-full border border-[#DCCBC5] px-3 py-2 text-[9px] tracking-[0.1em] text-[#9D6F67] transition hover:bg-[#EAD8D3] disabled:opacity-40"
                    >
                      ADD +
                    </button>
                  </div>

                  
                </>
              ) : (
                <p className="pb-2 text-xs italic text-[#8C7770]">
                  You can record little wins during your active
                  challenge days. ♡
                </p>
              )}
            </div>
          </details>

          {/* WEEKLY CHECK-INS */}

          <details className="group">
            <SectionHeader
              number="02"
              title="Weekly Check-ins"
              count={checkins.length}
            />

            <div className="space-y-3 pb-4 pt-1">
              <p className="font-serif text-[15px] italic text-[#A77B73]">
                A moment to reflect. ♡
              </p>

              {currentWeek !== null ? (
                <div className="rounded-xl bg-[#FBF8F6] px-3 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] tracking-[0.16em] text-[#A77B73]">
                        CURRENT WEEK
                      </p>

                      <p className="mt-1 font-serif text-[19px] text-[#211C19]">
                        Week {currentWeek}
                      </p>

                      <p className="mt-1 text-[11px] text-[#8C7770]">
                        {currentCheckin
                          ? "Reflection saved. ♡"
                          : "How has your week been?"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        openCheckin(currentWeek)
                      }
                      className={smallButtonClass}
                    >
                      {currentCheckin ? "EDIT →" : "CHECK IN →"}
                    </button>
                  </div>

                  {currentCheckin && (
                    <div className="mt-4 space-y-3 border-t border-[#E9DEDA] pt-4">
                      {QUESTIONS.map((question) =>
                        currentCheckin[question.key] ? (
                          <div key={question.key}>
                            <p className="text-[10px] text-[#9D6F67]">
                              {question.title}
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-[#4B3D38]">
                              {currentCheckin[question.key]}
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs italic text-[#8C7770]">
                  Weekly check-ins are available during
                  your active challenge. ♡
                </p>
              )}

              {/* PREVIOUS CHECK-INS */}

              {previousCheckins.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowPreviousWeeks(
                        (value) => !value
                      )
                    }
                    aria-expanded={showPreviousWeeks}
                    className="flex w-full items-center justify-between py-2 text-left"
                  >
                    <span className="text-[10px] tracking-[0.1em] text-[#9D6F67]">
                      PREVIOUS CHECK-INS ({previousCheckins.length})
                    </span>

                    <span className="text-[#A77B73]">
                      {showPreviousWeeks ? "−" : "+"}
                    </span>
                  </button>

                  {showPreviousWeeks && (
                    <div className="mt-3 divide-y divide-[#E9DEDA] border-t border-[#E9DEDA]">
                      {previousCheckins.map((checkin) => (
                        <div
                          key={checkin.id}
                          className="py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-serif text-[17px]">
                              Week {checkin.week_number}
                            </p>

                            <button
                              type="button"
                              disabled={
                                busy ||
                                currentDay === null ||
                                checkin.week_number >
                                  Math.ceil(currentDay / 7)
                              }
                              onClick={() =>
                                openCheckin(
                                  checkin.week_number
                                )
                              }
                              className="text-[10px] text-[#9D6F67] disabled:opacity-40"
                            >
                              EDIT →
                            </button>
                          </div>

                          <div className="mt-3 space-y-3">
                            {QUESTIONS.map((question) =>
                              checkin[question.key] ? (
                                <div key={question.key}>
                                  <p className="text-[10px] text-[#9D6F67]">
                                    {question.title}
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-[#4B3D38]">
                                    {checkin[question.key]}
                                  </p>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CHECK-IN EDITOR */}

              {editingWeek !== null && (
                <div className="rounded-2xl border border-[#DED0CB] bg-[#FBF8F6] p-4">
                  <p className="text-[9px] tracking-[0.16em] text-[#9D6F67]">
                    YOUR WEEKLY REFLECTION
                  </p>

                  <h3 className="mb-5 mt-2 font-serif text-[20px] italic text-[#211C19]">
                    Week {editingWeek} ♡
                  </h3>

                  <div className="space-y-5">
                    {QUESTIONS.map((question) => (
                      <label
                        key={question.key}
                        className="block"
                      >
                        <span className="text-[12px] text-[#806E68]">
                          {question.title}
                        </span>

                        <textarea
                          rows={3}
                          disabled={busy}
                          value={checkinForm[question.key]}
                          onChange={(event) =>
                            setCheckinForm((values) => ({
                              ...values,
                              [question.key]: event.target.value,
                            }))
                          }
                          className={`${inputClass} mt-2 resize-y`}
                          placeholder="Your thoughts..."
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={saveCheckin}
                      className="rounded-full bg-[#211C19] px-5 py-3 text-[10px] tracking-[0.1em] text-white disabled:opacity-40"
                    >
                      SAVE REFLECTION
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setEditingWeek(null)
                      }
                      className="px-2 py-2 text-[10px] text-[#9D6F67]"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
