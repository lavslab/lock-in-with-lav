"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionBootstrap() {
  const pathname = usePathname();

  const [checking, setChecking] = useState(pathname === "/");

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // Only run automatic session restoration on the homepage.
      if (pathname !== "/") {
        setChecking(false);
        return;
      }

      const supabase = createClient();

      try {
        // Supabase keeps the user's session locally.
        // This should be available immediately without requiring
        // another login.
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

        // No saved session = normal logged-out visitor.
        if (!session) {
          setChecking(false);
          return;
        }

        /*
         * Restore the server-side session.
         *
         * The browser/native Supabase session survives app
         * termination, but the server needs its own cookie session
         * before protected server-rendered dashboard routes can load.
         */
        const response = await fetch("/auth/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });

        if (cancelled) return;

        if (!response.ok) {
          console.error(
            "Could not restore server session."
          );

          setChecking(false);
          return;
        }

        /*
         * Use a full navigation after the server cookie has been
         * written. This gives the dashboard a completely fresh
         * authenticated request.
         */
        window.location.replace("/dashboard");
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
  }, [pathname]);

  // This component should not affect any page except the homepage.
  if (pathname !== "/") {
    return null;
  }

  /*
   * Keep the homepage covered while we determine whether the user
   * has a saved session. Logged-out visitors will only see this
   * for the brief session check.
   */
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

          <div className="mt-8 flex justify-center">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#A77B73]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}