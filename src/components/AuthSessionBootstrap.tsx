"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionBootstrap() {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(pathname === "/");

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // Only run the automatic restore on the homepage.
      if (pathname !== "/") {
        setChecking(false);
        return;
      }

      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error) {
        console.error(
          "Could not check saved Supabase session:",
          error
        );

        setChecking(false);
        return;
      }

      // No saved session means this is a normal visitor.
      if (!session) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/auth/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });

        if (!response.ok) {
          console.error("Could not restore server session.");
          setChecking(false);
          return;
        }

        if (!cancelled) {
          router.replace("/dashboard");
        }
      } catch (restoreError) {
        console.error(
          "Session restoration failed:",
          restoreError
        );

        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // Don't cover other pages.
  if (pathname !== "/") {
    return null;
  }

  // Keep the homepage hidden while we determine whether
  // there is a saved session to restore.
  if (checking) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#F7F1ED] text-[#211C19]">
        <div className="text-center">
          <p className="font-serif text-4xl tracking-[0.08em]">
            LOCK IN
          </p>

          <p className="mt-1 text-[8px] tracking-[0.5em] text-[#A77B73]">
            WITH LAV
          </p>

          <p className="mt-8 font-serif text-lg italic text-[#806E68]">
            getting you back in... ♡
          </p>
        </div>
      </div>
    );
  }

  return null;
}