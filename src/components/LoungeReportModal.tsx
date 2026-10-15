
"use client";

import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId?: string;
  commentId?: string;
  onClose: () => void;
};

type ReportReason =
  | "harassment"
  | "hate"
  | "inappropriate"
  | "spam"
  | "privacy"
  | "other";

const reasons: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Bullying or harassment" },
  { value: "hate", label: "Hate speech or discrimination" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or promotion" },
  { value: "privacy", label: "Privacy or personal information" },
  { value: "other", label: "Something else" },
];

export default function LoungeReportModal({
  postId,
  commentId,
  onClose,
}: Props) {
  const titleId = useId();

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isComment = Boolean(commentId);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function submitReport() {
    if (!reason || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      if (Boolean(postId) === Boolean(commentId)) {
        throw new Error("Invalid report target.");
      }

      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      const { error: reportError } = await supabase
        .from("lounge_reports")
        .insert({
          reporter_id: user.id,
          post_id: postId ?? null,
          comment_id: commentId ?? null,
          reason,
          details: details.trim() || null,
        });

      if (reportError) {
        if (reportError.code === "23505") {
          throw new Error(
            "You've already reported this content. Thank you ♡"
          );
        }

        console.error("LOUNGE REPORT ERROR:", reportError);

        throw new Error(
          "We couldn't submit your report. Please try again."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#E9DAD3] bg-white p-6 shadow-xl"
      >
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F1ED] text-3xl text-[#A77B73]">
              ♡
            </div>

            <p className="mt-6 text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2
              id={titleId}
              className="mt-3 font-serif text-2xl text-[#302521]"
            >
              Report received ♡
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#806D65]">
              Thank you for helping keep the Lounge a supportive space.
            </p>

            <p className="mt-2 text-xs leading-6 text-[#A18A82]">
              Your report has been submitted privately for review.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-7 rounded-full bg-[#DDB5AE] px-8 py-3 text-xs tracking-[0.12em] text-[#302521]"
            >
              DONE ♡
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
                  COMMUNITY SAFETY
                </p>

                <h2
                  id={titleId}
                  className="mt-2 font-serif text-2xl text-[#302521]"
                >
                  Report this {isComment ? "comment" : "post"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close report form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F1ED] text-xl text-[#806D65] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#806D65]">
              Help us keep The Lock In Lounge a kind, encouraging space.
              Reports are private.
            </p>

            <fieldset className="mt-6">
              <legend className="mb-3 text-[10px] tracking-[0.18em] text-[#A77B73]">
                WHY ARE YOU REPORTING THIS?
              </legend>

              <div className="space-y-2">
                {reasons.map((item) => (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      reason === item.value
                        ? "border-[#B98F87] bg-[#F7F1ED]"
                        : "border-[#E9DAD3] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={titleId}
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      disabled={submitting}
                      className="accent-[#B98F87]"
                    />

                    <span className="text-xs text-[#302521]">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label
              htmlFor={`${titleId}-details`}
              className="mt-6 block text-[10px] tracking-[0.18em] text-[#A77B73]"
            >
              ANYTHING ELSE WE SHOULD KNOW? (OPTIONAL)
            </label>

            <textarea
              id={`${titleId}-details`}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={3}
              disabled={submitting}
              placeholder="Tell us a little more..."
              className="mt-3 w-full resize-none rounded-2xl border border-[#E9DAD3] bg-[#F7F1ED] px-4 py-3 text-sm text-[#302521] outline-none placeholder:text-[#A18A82] focus:ring-1 focus:ring-[#B98F87]"
            />

            <p className="mt-1 text-right text-[10px] text-[#A18A82]">
              {details.length}/1000
            </p>

            {error && (
              <p role="alert" className="mt-3 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={submitReport}
                disabled={!reason || submitting}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-[0.1em] text-[#302521] transition hover:bg-[#D3A49C] disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT REPORT"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
