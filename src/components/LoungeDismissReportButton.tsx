
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  reportId: string;
};

export default function LoungeDismissReportButton({
  reportId,
}: Props) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState("");

  async function dismissReport() {
    if (dismissing) return;

    setDismissing(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: dismissError } = await supabase.rpc(
        "lounge_dismiss_report",
        {
          p_report_id: reportId,
        }
      );

      if (dismissError) {
        throw dismissError;
      }

      if (data !== true) {
        throw new Error(
          "This report may have already been reviewed. Please refresh."
        );
      }

      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't dismiss this report. Please try again."
      );
    } finally {
      setDismissing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setConfirming(true);
        }}
        className="rounded-full border border-[#DDB5AE] bg-white px-5 py-3 text-xs tracking-wider text-[#806D65] transition hover:bg-[#F7F1ED]"
      >
        DISMISS REPORT
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Dismiss Lounge report"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#302521]">
              Dismiss this report? ♡
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#806D65]">
              This report will be marked as reviewed.
              The original post or comment will remain
              visible in the Lounge.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 text-xs text-red-600"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
                disabled={dismissing}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={dismissReport}
                disabled={dismissing}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
              >
                {dismissing
                  ? "DISMISSING..."
                  : "YES, DISMISS ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
