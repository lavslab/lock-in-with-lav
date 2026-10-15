
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  reportId: string;
  contentType: "post" | "comment";
};

export default function LoungeRemoveContentButton({
  reportId,
  contentType,
}: Props) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function removeContent() {
    if (removing) return;

    setRemoving(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: removeError } =
        await supabase.rpc(
          "lounge_remove_reported_content",
          {
            p_report_id: reportId,
          }
        );

      if (removeError) {
        throw removeError;
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
          : "Couldn't remove this content. Please try again."
      );
    } finally {
      setRemoving(false);
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
        className="rounded-full bg-[#DDB5AE] px-5 py-3 text-xs tracking-wider text-[#302521] transition hover:bg-[#CFA39B]"
      >
        REMOVE CONTENT
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Remove reported Lounge content"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#302521]">
              Remove this {contentType}? ♡
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#806D65]">
              {contentType === "post"
                ? "This post will be permanently removed from the Lounge, including its comments, likes, and photo records."
                : "This comment will be permanently removed from the Lounge, including any replies."}
            </p>

            <p className="mt-3 text-sm leading-7 text-[#806D65]">
              The report will be marked as resolved,
              and your moderation decision will be
              recorded.
            </p>

            {contentType === "post" && (
              <p className="mt-3 text-xs leading-6 text-[#A77B73]">
                Uploaded image files will be queued for
                separate Storage cleanup.
              </p>
            )}

            <p className="mt-3 text-xs font-medium text-red-600">
              This action cannot be undone.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 text-xs text-red-600"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
                disabled={removing}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={removeContent}
                disabled={removing}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
              >
                {removing
                  ? "REMOVING..."
                  : "YES, REMOVE ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
