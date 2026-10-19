
"use client";

import { useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function LoungeSpaces({
  children,
}: Props) {
  const [activeSpace, setActiveSpace] = useState<
    "community" | "circle"
  >("community");

  return (
    <div>
      {/* SPACE NAVIGATION */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveSpace("community")}
          aria-pressed={activeSpace === "community"}
          className={`rounded-xl border px-3 py-3 text-center text-[10px] tracking-[0.06em] transition ${
            activeSpace === "community"
              ? "border-[#C9AAA2] bg-[#EAD8D3] text-[#302521]"
              : "border-[#DED0CB] bg-[#FBF8F6] text-[#806D65]"
          }`}
        >
          COMMUNITY FEED
        </button>

        <button
          type="button"
          onClick={() => setActiveSpace("circle")}
          aria-pressed={activeSpace === "circle"}
          className={`rounded-xl border px-3 py-3 text-center text-[10px] tracking-[0.06em] transition ${
            activeSpace === "circle"
              ? "border-[#C9AAA2] bg-[#EAD8D3] text-[#302521]"
              : "border-[#DED0CB] bg-[#FBF8F6] text-[#806D65]"
          }`}
        >
          THE LOCK IN CIRCLE
        </button>
      </div>

      {/* PUBLIC COMMUNITY */}
      <div
        className={
          activeSpace === "community" ? "block" : "hidden"
        }
      >
        {children}
      </div>

      {/* PRIVATE CIRCLE PREVIEW */}
      {activeSpace === "circle" && (
        <section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1E5E0]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A77B73"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
              />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>

          <p className="mt-6 text-[9px] tracking-[0.25em] text-[#9D6F67]">
            YOUR PRIVATE CHALLENGE SPACE
          </p>

          <h2 className="mt-3 font-serif text-3xl text-[#302521]">
            The Lock In{" "}
            <span className="italic text-[#A77B73]">
              Circle.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xs text-[12px] leading-6 text-[#806D65]">
            A closer space for guidance, accountability,
            group check-ins, and support throughout your
            hosted challenge.
          </p>

          <div className="mx-auto mt-7 max-w-xs border-t border-[#E9DFDA] pt-5">
            <p className="text-[10px] text-[#A77B73]">
              COMING SOON ♡
            </p>

            <p className="mt-2 text-[11px] leading-5 text-[#806D65]">
              Private access will be available to members
              enrolled in a hosted challenge.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
