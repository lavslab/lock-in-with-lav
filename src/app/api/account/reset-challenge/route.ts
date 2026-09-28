import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Confirm there is an authenticated user.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to reset your challenge." },
        { status: 401 }
      );
    }

    const userId = user.id;

    /*
     * First, remove this user's actual progress-photo files
     * from the private Storage bucket.
     *
     * Files are stored as:
     * progress-photos/{userId}/filename
     */
    const { data: storedPhotos, error: listError } = await supabase.storage
      .from("progress-photos")
      .list(userId, {
        limit: 1000,
      });

    if (listError) {
      console.error("Could not list progress photos:", listError);

      return NextResponse.json(
        {
          error:
            "We couldn't access your progress photos. Your challenge was not reset.",
        },
        { status: 500 }
      );
    }

    const photoPaths =
      storedPhotos
        ?.filter(
          (file) =>
            file.name &&
            file.name !== ".emptyFolderPlaceholder"
        )
        .map((file) => `${userId}/${file.name}`) ?? [];

    if (photoPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("progress-photos")
        .remove(photoPaths);

      if (storageError) {
        console.error("Could not delete progress photos:", storageError);

        return NextResponse.json(
          {
            error:
              "We couldn't remove your progress photos. Your challenge was not reset.",
          },
          { status: 500 }
        );
      }
    }

    /*
     * Reset all database data belonging to the current challenge.
     *
     * reset_my_challenge() uses auth.uid() inside Supabase,
     * so it can only reset the currently authenticated user's data.
     *
     * user_templates is intentionally preserved.
     */
    const { error: resetError } = await supabase.rpc(
      "reset_my_challenge"
    );

    if (resetError) {
      console.error("Could not reset challenge:", resetError);

      return NextResponse.json(
        {
          error:
            "We couldn't completely reset your challenge. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected reset challenge error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while resetting your challenge.",
      },
      { status: 500 }
    );
  }
}