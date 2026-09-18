import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth?error=missing_confirmation_code`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Email confirmation error:", error);

    return NextResponse.redirect(
      `${origin}/auth?error=confirmation_failed`
    );
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}