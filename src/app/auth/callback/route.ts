import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(next: string | null) {
  if (!next) {
    return null;
  }

  // Only allow internal app paths.
  if (!next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

  const requestedNext = getSafeNext(
    requestUrl.searchParams.get("next")
  );

  const origin = requestUrl.origin;
  const supabase = await createClient();

  /**
   * ---------------------------------
   * 1. PKCE AUTH CODE FLOW
   * ---------------------------------
   *
   * Used when Supabase sends:
   *
   * /auth/callback?code=...
   */

  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(
        "Auth callback code exchange error:",
        error
      );

      return NextResponse.redirect(
        `${origin}/auth?error=confirmation_failed`
      );
    }

    // Password recovery.
    if (
      requestedNext === "/auth/reset-password"
    ) {
      return NextResponse.redirect(
        `${origin}/auth/reset-password`
      );
    }

    // Explicit safe destination.
    if (requestedNext) {
      return NextResponse.redirect(
        new URL(requestedNext, origin)
      );
    }

    /**
     * Determine whether this is an existing,
     * onboarded user or a new signup.
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Auth callback user lookup error:",
        userError
      );
    }

    if (user) {
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("challenge_start_date")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Auth callback profile lookup error:",
          profileError
        );
      }

      if (profile?.challenge_start_date) {
        return NextResponse.redirect(
          `${origin}/dashboard/account?confirmed=true`
        );
      }
    }

    return NextResponse.redirect(
      `${origin}/onboarding`
    );
  }

  /**
   * ---------------------------------
   * 2. TOKEN HASH / OTP FLOW
   * ---------------------------------
   *
   * Used by our custom Supabase
   * confirmation email links:
   *
   * /auth/callback
   * ?token_hash=...
   * &type=...
   */

  if (tokenHash && type) {
    const { error } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

    if (error) {
      console.error(
        "Auth callback OTP verification error:",
        error
      );

      /**
       * Email changes can invalidate the
       * browser's previous auth session.
       *
       * Give the user a useful next step
       * instead of a generic confirmation error.
       */
      if (type === "email_change") {
        return NextResponse.redirect(
          `${origin}/auth?email_change=continue`
        );
      }

      return NextResponse.redirect(
        `${origin}/auth?error=confirmation_failed`
      );
    }

    // Password recovery.
    if (
      type === "recovery" ||
      requestedNext === "/auth/reset-password"
    ) {
      return NextResponse.redirect(
        `${origin}/auth/reset-password`
      );
    }

    /**
     * Email change.
     *
     * If the user still has a valid session,
     * send them to Account with a success flag.
     *
     * If Supabase invalidated the old session,
     * send them to Auth with a success flag so
     * they can sign in using the new email.
     */

    if (type === "email_change") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.redirect(
          `${origin}/dashboard/account?email_changed=true`
        );
      }

      return NextResponse.redirect(
        `${origin}/auth?email_changed=true`
      );
    }

    // Explicit safe destination for non-email-change flows.
    if (requestedNext) {
      return NextResponse.redirect(
        new URL(requestedNext, origin)
      );
    }

    // Other confirmations continue to onboarding.
    return NextResponse.redirect(
      `${origin}/onboarding`
    );
  }

  /**
   * ---------------------------------
   * 3. NO CONFIRMATION DATA
   * ---------------------------------
   *
   * During Secure Email Change, Supabase
   * can return to the app between the two
   * required confirmations without another
   * code/token hash.
   *
   * Do not present that as a broken link.
   */

  const emailChangeStatus =
    requestUrl.searchParams.get("email_change");

  if (emailChangeStatus) {
    return NextResponse.redirect(
      `${origin}/auth?email_change=${encodeURIComponent(
        emailChangeStatus
      )}`
    );
  }

  console.error(
    "Auth callback received no code or token hash."
  );

  return NextResponse.redirect(
    `${origin}/auth?error=missing_confirmation_code`
  );
}