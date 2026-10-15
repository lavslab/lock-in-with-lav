
"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Props = {
  image: string;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void>;
};

async function createCroppedImage(
  imageSource: string,
  crop: Area
): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(
      new Error("Unable to load image")
    );
    image.src = imageSource;
  });

  const canvas = document.createElement("canvas");
  const size = 512;

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to crop image"));
      },
      "image/jpeg",
      0.9
    );
  });
}

export default function LoungeAvatarCropper({
  image,
  onCancel,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] =
    useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => {
      setCroppedArea(pixels);
    },
    []
  );

  async function save() {
    if (!croppedArea || saving) return;

    setSaving(true);
    setError("");

    try {
      const blob = await createCroppedImage(
        image,
        croppedArea
      );

      await onSave(blob);
    } catch {
      setError("Couldn't save your photo. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211C19]/70 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-[#F7F1ED] p-5 text-[#302521] shadow-xl">
        <div className="mb-5 text-center">
          <p className="text-[9px] tracking-[0.3em] text-[#A77B73]">
            YOUR LOUNGE IDENTITY
          </p>

          <h2 className="mt-2 font-serif text-3xl">
            Adjust your photo ♡
          </h2>

          <p className="mt-2 text-xs text-[#806D65]">
            Drag to reposition. Zoom to get it just right.
          </p>
        </div>

        <div className="relative mx-auto h-[280px] w-full overflow-hidden rounded-2xl bg-[#EAD8D3]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-6">
          <div className="mb-3 flex justify-between text-xs text-[#806D65]">
            <span>ZOOM</span>
            <span>{zoom.toFixed(1)}×</span>
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) =>
              setZoom(Number(event.target.value))
            }
            className="w-full accent-[#B98F87]"
          />
        </div>

        {error && (
          <p className="mt-4 text-center text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-full border border-[#DDB5AE] py-4 text-xs tracking-widest disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving || !croppedArea}
            className="flex-1 rounded-full bg-[#DDB5AE] py-4 text-xs tracking-widest disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE ♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
