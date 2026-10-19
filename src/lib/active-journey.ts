
import { createClient } from "@/lib/supabase/client";
import type { ChallengeJourney } from "@/lib/challenge";

/**
 * Returns the signed-in member's active journey.
 *
 * Read-only: does not create, update, archive,
 * or delete any journey or progress records.
 *
 * Returns null if no active journey exists.
 * Throws if Supabase returns an error.
 */
export async function getActiveJourney(): Promise<ChallengeJourney | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("challenge_journeys")
    .select(
      "id, user_id, journey_number, start_date, challenge_length, status, completed_at, archived_at, timezone"
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ChallengeJourney | null;
}
