"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionBootstrap() {
  const pathname = usePathname();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (pathname !== "/") {
      return;
    }

    let cancelled = false;

    async function restoreSession() {
      setChecking(true);

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

          setChecking(false);

          await SplashScreen.hide({
            fadeOutDuration: 250,
          });

          return;
        }

        // Logged out:
        // reveal the normal homepage.
        if (!session) {
          setChecking(false);

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

          setChecking(false);

          await SplashScreen.hide({
            fadeOutDuration: 250,
          });

          return;
        }

        // Keep the native splash visible while
        // the authenticated page loads.
        window.location.replace("/dashboard");
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        );

        if (!cancelled) {
          setChecking(false);

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

  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  if (pathname !== "/" || !checking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex min-h-screen flex-col items-center justify-center bg-[#F7F1ED] text-[#211C19]">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#D7AFA7]">
          <span className="font-serif text-5xl text-[#A77B73]">
            ♡
          </span>
        </div>

        <p className="mt-12 text-[11px] tracking-[0.45em] text-[#A77B73]">
          LOCKING IN
        </p>

        <p className="mt-8 font-serif text-3xl italic text-[#A77B73]">
          loading your day... ♡
        </p>
      </div>
    </div>
  );
}