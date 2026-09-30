import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const accessToken = body?.access_token;
    const refreshToken = body?.refresh_token;

    if (
      typeof accessToken !== "string" ||
      typeof refreshToken !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing session tokens." },
        { status: 400 }
      );
    }

    let response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.json({ success: true });

            cookiesToSet.forEach(
              ({ name, value, options }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

    const { error } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (error) {
      console.error(
        "Could not restore Supabase session:",
        error
      );

      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Auth restore route error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to restore session." },
      { status: 500 }
    );
  }
}