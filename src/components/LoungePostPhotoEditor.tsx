
"use client";

import { useCallback, useState } from "react";
import Cropper, {
  type Area,
} from "react-easy-crop";

type PhotoFormat = "original" | "square" | "portrait";

type Props = {
  image: string;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void>;
};

const formats: {
  value: PhotoFormat;
  label: string;
}[] = [
  { value: "original", label: "Original" },
  { value: "square", label: "Square" },
  { value: "portrait", label: "Portrait" },
];

async function getImageSize(
  source: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error("Could not load this photo."));
    };

    image.src = source;
  });
}

async function createCroppedBlob(
  imageSource: string,
  crop: Area
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Could not prepare the photo."));
        return;
      }

      const maxDimension = 1600;
      const scale = Math.min(
        1,
        maxDimension / Math.max(crop.width, crop.height)
      );

      canvas.width = Math.max(
        1,
        Math.round(crop.width * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(crop.height * scale)
      );

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not save the photo."));
          }
        },
        "image/jpeg",
        0.9
      );
    };

    image.onerror = () => {
      reject(new Error("Could not load this photo."));
    };

    image.src = imageSource;
  });
}

export default function LoungePostPhotoEditor({
  image,
  onCancel,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [format, setFormat] = useState<PhotoFormat>("original");
  const [originalAspect, setOriginalAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const aspect =
    format === "square"
      ? 1
      : format === "portrait"
      ? 4 / 5
      : originalAspect;

  const onMediaLoaded = useCallback(
    async () => {
      try {
        const size = await getImageSize(image);
        setOriginalAspect(size.width / size.height);
      } catch {
        setError("Could not read this photo.");
      }
    },
    [image]
  );

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  async function handleSave() {
    if (!croppedAreaPixels || saving) return;

    setSaving(true);
    setError("");

    try {
      const blob = await createCroppedBlob(
        image,
        croppedAreaPixels
      );

      await onSave(blob);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not adjust your photo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adjust Lounge photo"
        className="flex w-full max-w-md flex-col rounded-3xl bg-[#F7F1ED] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#302521]">
              Adjust your photo ♡
            </h2>

            <p className="mt-2 text-xs text-[#806D65]">
              Drag to reposition. Pinch or slide to zoom.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close photo editor"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#806D65]"
          >
            ×
          </button>
        </div>

        <div className="relative h-[min(48vh,360px)] min-h-[220px] overflow-hidden rounded-2xl bg-[#302521]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
            showGrid={false}
            objectFit="contain"
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {formats.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFormat(item.value);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
              }}
              disabled={saving}
              aria-pressed={format === item.value}
              className={`rounded-full border px-2 py-3 text-xs transition ${
                format === item.value
                  ? "border-[#B98F87] bg-[#DDB5AE] text-[#302521]"
                  : "border-[#E9DAD3] bg-white text-[#806D65]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <label
              htmlFor="lounge-photo-zoom"
              className="text-xs text-[#806D65]"
            >
              Zoom
            </label>

            <span className="text-xs text-[#A77B73]">
              {zoom.toFixed(1)}×
            </span>
          </div>

          <input
            id="lounge-photo-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) =>
              setZoom(Number(event.target.value))
            }
            disabled={saving}
            className="w-full accent-[#B98F87]"
          />
        </div>

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
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65]"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE PHOTO ♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
