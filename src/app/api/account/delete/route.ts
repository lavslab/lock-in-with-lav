import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    /*
     * FIRST: authenticate the person making the request
     * using their normal signed-in Supabase session.
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;

    /*
     * SECOND: create a completely server-only admin client.
     *
     * SUPABASE_SECRET_KEY must NEVER be exposed to the browser.
     */
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Missing Supabase server credentials.");

      return NextResponse.json(
        { error: "Account deletion is not configured correctly." },
        { status: 500 }
      );
    }

    const admin = createAdminClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    /*
     * THIRD: remove the user's private progress-photo files.
     *
     * Supabase Auth users cannot be deleted while they still own
     * Storage objects, so Storage must be cleaned up first.
     */
    const { data: storedPhotos, error: listError } =
      await admin.storage
        .from("progress-photos")
        .list(userId, {
          limit: 1000,
        });

    if (listError) {
      console.error(
        "Could not list progress photos during account deletion:",
        listError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't remove your stored photos. Your account was not deleted.",
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
      const { error: storageError } = await admin.storage
        .from("progress-photos")
        .remove(photoPaths);

      if (storageError) {
        console.error(
          "Could not delete progress photos during account deletion:",
          storageError
        );

        return NextResponse.json(
          {
            error:
              "We couldn't remove your stored photos. Your account was not deleted.",
          },
          { status: 500 }
        );
      }
    }

    /*
     * FOURTH: delete application data belonging to this user.
     *
     * The admin client is used here intentionally so account
     * deletion does not depend on individual RLS DELETE policies.
     */
    const userTables = [
      "daily_progress",
      "weekly_checkins",
      "measurements",
      "little_wins",
      "progress_photos",
      "user_templates",
    ];

    for (const table of userTables) {
      const { error } = await admin
        .from(table)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(
          `Could not delete ${table} during account deletion:`,
          error
        );

        return NextResponse.json(
          {
            error:
              "We couldn't completely delete your account data. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    /*
     * profiles uses the Auth user's UUID as its id.
     */
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error(
        "Could not delete profile during account deletion:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't completely delete your account data. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * LAST: permanently delete the Supabase Auth user.
     *
     * We do this last so we don't destroy the login identity
     * before the user's application data has been cleaned up.
     */
    const { error: deleteUserError } =
      await admin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error(
        "Could not delete Supabase Auth user:",
        deleteUserError
      );

      return NextResponse.json(
        {
          error:
            "Your account data was cleared, but we couldn't finish deleting your login. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected delete account error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while deleting your account. Please try again.",
      },
      { status: 500 }
    );
  }
}