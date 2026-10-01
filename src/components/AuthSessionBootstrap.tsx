"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (pathname !== "/") {
      return;
    }

    let cancelled = false;

    async function restoreSession() {
      const supabase = createClient();

      try {
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
          return;
        }

        // No saved session means the user is logged out.
        if (!session) {
          return;
        }

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
          console.error("Could not restore server session.");
          return;
        }

        // Silently send an already-authenticated user
        // back into the dashboard.
        window.location.replace("/dashboard");
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        );
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // IMPORTANT:
  // This component intentionally renders nothing.
  // There should be no React loading screen here.
  return null;
}