import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth?error=missing_confirmation_code`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);

    return NextResponse.redirect(
      `${origin}/auth?error=confirmation_failed`
    );
  }

  // Password recovery
  if (next === "/auth/reset-password") {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  // Normal email confirmation
  return NextResponse.redirect(`${origin}/onboarding`);
}