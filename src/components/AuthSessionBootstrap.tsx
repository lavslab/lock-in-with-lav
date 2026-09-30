"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSessionBootstrap() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // Only run the automatic redirect on the homepage.
      // This keeps normal navigation and authentication pages untouched.
      if (pathname !== "/") {
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
        return;
      }

      // No saved session = normal logged-out visitor.
      if (!session) {
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
          console.error(
            "Could not restore server session."
          );
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
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}