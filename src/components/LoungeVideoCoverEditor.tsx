
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoUrl: string;
  onSave: (cover: Blob) => void | Promise<void>;
  onCancel: () => void;
};

export default function LoungeVideoCoverEditor({
  videoUrl,
  onSave,
  onCancel,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDuration(0);
    setSelectedTime(0);
    setError("");
  }, [videoUrl]);

  async function saveCover() {
    const video = videoRef.current;
    if (!video || saving) return;

    setSaving(true);
    setError("");

    try {
      if (video.readyState < 2) {
        throw new Error("Video frame isn't ready yet.");
      }

      const canvas = document.createElement("canvas");

      const maxWidth = 720;
      const scale = Math.min(1, maxWidth / video.videoWidth);

      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Couldn't create the video cover.");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Couldn't save the cover image."));
          },
          "image/jpeg",
          0.8
        );
      });

      await onSave(blob);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save the cover."
      );
    } finally {
      setSaving(false);
    }
  }

  function seekTo(time: number) {
    const video = videoRef.current;
    if (!video) return;

    setSelectedTime(time);
    video.currentTime = time;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211C19]/80 p-4">
      <div className="w-full max-w-md rounded-[24px] bg-[#FBF8F6] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-[#A77B73]">
              LOCK IN LOUNGE
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#211C19]">
              Choose your cover. ♡
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="text-2xl text-[#806D65]"
            aria-label="Close cover editor"
          >
            ×
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            muted
            preload="auto"
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (Number.isFinite(length)) {
                setDuration(length);
              }
            }}
            className="max-h-[420px] w-full object-contain"
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-[10px] text-[#806D65]">
            <span>SELECT A FRAME</span>
            <span>{selectedTime.toFixed(1)}s</span>
          </div>

          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={selectedTime}
            onChange={(event) => seekTo(Number(event.target.value))}
            disabled={saving || duration <= 0}
            className="w-full accent-[#A77B73]"
            aria-label="Choose video cover frame"
          />

          <p className="mt-2 text-[11px] leading-5 text-[#806D65]">
            Slide to the moment you want people to see before
            they play your video.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-full border border-[#DED0CB] px-4 py-3 text-[10px] tracking-[0.12em] text-[#806D65]"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={saveCover}
            disabled={saving || duration <= 0}
            className="flex-1 rounded-full bg-[#211C19] px-4 py-3 text-[10px] tracking-[0.12em] text-white disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE COVER ♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
