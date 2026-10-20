
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const TRIGGER_DISTANCE = 75;
const MAX_PULL = 110;

export default function PullToRefresh() {
  const pathname = usePathname();

  const startY = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const refreshing = useRef(false);

  const [distance, setDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    if (refreshing.current) return;

    // The Lounge stores drafts and selected photos in React state.
    // A reload could discard them, even when the editor is closed.
    if (pathname.startsWith("/dashboard/lounge")) {
      const confirmed = window.confirm(
        "Refresh this page? Any unfinished posts or comments may be lost."
      );

      if (!confirmed) return;
    }

    // Other dashboard pages can contain editable forms too.
    const editableFields = Array.from(
      document.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >('input:not([type="hidden"]):not([type="file"]), textarea')
    );

    const hasEnteredText = editableFields.some((field) => {
      if (field.disabled || field.readOnly) return false;

      if (field instanceof HTMLInputElement) {
        if (
          ["checkbox", "radio", "button", "submit", "reset"].includes(
            field.type
          )
        ) {
          return false;
        }
      }

      return field.value.trim().length > 0;
    });

    if (
      !pathname.startsWith("/dashboard/lounge") &&
      hasEnteredText
    ) {
      const confirmed = window.confirm(
        "Refresh this page? Unsaved changes may be lost."
      );

      if (!confirmed) return;
    }

    refreshing.current = true;
    setIsRefreshing(true);

    window.location.reload();
  }, [pathname]);

  useEffect(() => {
    const resetPull = () => {
      startY.current = null;
      distanceRef.current = 0;
      setDistance(0);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (refreshing.current || event.touches.length !== 1) return;

      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable], [role="textbox"], [role="dialog"]'
        )
      ) {
        resetPull();
        return;
      }

      if (window.scrollY > 0) {
        resetPull();
        return;
      }

      startY.current = event.touches[0]?.clientY ?? null;
      distanceRef.current = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startY.current === null || refreshing.current) return;

      if (event.touches.length !== 1 || window.scrollY > 0) {
        resetPull();
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = currentY - startY.current;

      if (delta <= 0) {
        distanceRef.current = 0;
        setDistance(0);
        return;
      }

      const nextDistance = Math.min(delta * 0.45, MAX_PULL);

      distanceRef.current = nextDistance;
      setDistance(nextDistance);
    };

    const handleTouchEnd = () => {
      if (startY.current === null || refreshing.current) return;

      const shouldRefresh =
        distanceRef.current >= TRIGGER_DISTANCE;

      resetPull();

      if (shouldRefresh) refresh();
    };

    const handleTouchCancel = () => {
      resetPull();
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [refresh]);

  if (!isRefreshing && distance === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-[100] flex justify-center"
      aria-live="polite"
    >
      <div
        className="rounded-full border border-[#E8DCD5] bg-[#F7F1ED] px-4 py-2 text-xs text-[#6B5751] shadow-sm"
        style={{
          transform: `translateY(${
            isRefreshing ? 0 : distance
          }px)`,
        }}
      >
        {isRefreshing
          ? "Refreshing ♡"
          : distance >= TRIGGER_DISTANCE
            ? "Release to refresh ♡"
            : "Pull to refresh ↓"}
      </div>
    </div>
  );
}
