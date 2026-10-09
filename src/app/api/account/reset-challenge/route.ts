
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to restart your challenge." },
        { status: 401 }
      );
    }

    // Archive the current journey and clear active progress
    // together in one database transaction.
    const { data: archivedJourneyId, error: resetError } =
      await supabase.rpc("archive_and_reset_my_challenge");

    if (resetError || !archivedJourneyId) {
      console.error("Could not archive and restart challenge:", resetError);

      return NextResponse.json(
        {
          error:
            "We couldn't safely archive your journey. Your challenge was not restarted.",
        },
        { status: 500 }
      );
    }

    // Important: Do NOT delete files from progress-photos.
    // Archived journeys still reference those private files.
    return NextResponse.json({
      success: true,
      archivedJourneyId,
    });
  } catch (error) {
    console.error("Unexpected challenge restart error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while restarting your challenge.",
      },
      { status: 500 }
    );
  }
}
