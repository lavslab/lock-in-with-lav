"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
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

          await SplashScreen.hide({
            fadeOutDuration: 250,
          });

          return;
        }

        // No saved session means the user is logged out.
        // Let the normal homepage appear.
        if (!session) {
          await SplashScreen.hide({
            fadeOutDuration: 250,
          });

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
          console.error(
            "Could not restore server session."
          );

          await SplashScreen.hide({
            fadeOutDuration: 250,
          });

          return;
        }

        // Keep the native splash visible while the
        // authenticated page loads.
        window.location.replace("/dashboard");
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        );

        if (!cancelled) {
          await SplashScreen.hide({
            fadeOutDuration: 250,
          });
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}