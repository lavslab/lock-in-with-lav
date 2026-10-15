
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type BlockedMember = {
  blocked_user_id: string;
  display_name: string | null;
  username: string | null;
  blocked_at: string;
};

export default function LoungeBlockedMembers() {
  const router = useRouter();

  const [members, setMembers] = useState<BlockedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmMember, setConfirmMember] =
    useState<BlockedMember | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBlockedMembers() {
      try {
        const supabase = createClient();

        const { data, error: loadError } = await supabase.rpc(
          "lounge_my_blocked_members"
        );

        if (loadError) throw loadError;

        if (active) {
          setMembers((data ?? []) as BlockedMember[]);
        }
      } catch {
        if (active) {
          setError("Couldn't load your blocked members.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBlockedMembers();

    return () => {
      active = false;
    };
  }, []);

  async function unblockMember() {
    if (!confirmMember || busyId) return;

    const member = confirmMember;
    setBusyId(member.blocked_user_id);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in again.");
      }

      const { data: deleted, error: deleteError } = await supabase
        .from("lounge_blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", member.blocked_user_id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!deleted?.length) {
        throw new Error("This block could not be removed.");
      }

      setMembers((current) =>
        current.filter(
          (item) =>
            item.blocked_user_id !== member.blocked_user_id
        )
      );

      setConfirmMember(null);
      setSuccess("Member unblocked successfully ♡");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't unblock this member. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-[#E9DAD3] bg-white p-6 shadow-sm">
      <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
        YOUR COMMUNITY SETTINGS
      </p>

      <h2 className="mt-3 font-serif text-2xl text-[#302521]">
        Your space, your boundaries ♡
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#806D65]">
        Manage the members you've blocked. You can unblock
        someone whenever you're ready.
      </p>

      <div className="mt-6 border-t border-[#F0E6E1] pt-5">
        {loading ? (
          <p className="text-xs text-[#A18A82]">
            Loading blocked members...
          </p>
        ) : members.length === 0 ? (
          <div className="rounded-2xl bg-[#F7F1ED] px-5 py-6 text-center">
            <p className="font-serif text-lg text-[#302521]">
              All clear ♡
            </p>
            <p className="mt-2 text-xs leading-6 text-[#806D65]">
              You haven't blocked any members.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const name =
                member.display_name?.trim() ||
                "Lounge Member";

              return (
                <div
                  key={member.blocked_user_id}
                  className="flex items-center gap-3 rounded-2xl bg-[#F7F1ED] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAD8D3] font-serif text-lg text-[#77574E]">
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#302521]">
                      {name}
                    </p>

                    <p className="truncate text-xs text-[#A18A82]">
                      {member.username
                        ? `@${member.username}`
                        : "Blocked member"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setConfirmMember(member);
                    }}
                    disabled={busyId !== null}
                    className="shrink-0 rounded-full border border-[#DDB5AE] bg-white px-4 py-2.5 text-[10px] tracking-wider text-[#806D65] transition hover:bg-[#F4E8E4] disabled:opacity-50"
                  >
                    UNBLOCK
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-xs text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 text-xs text-[#7C8B70]">
          {success}
        </p>
      )}

      {confirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Unblock Lounge member"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
              THE LOCK IN LOUNGE
            </p>

            <h3 className="mt-2 font-serif text-2xl text-[#302521]">
              Unblock this member? ♡
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#806D65]">
              You and{" "}
              {confirmMember.display_name || "this member"}{" "}
              will be able to see and interact with each other's
              Lounge content again, unless another block is
              still in place.
            </p>

            {error && (
              <p role="alert" className="mt-4 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmMember(null);
                  setError("");
                }}
                disabled={busyId !== null}
                className="rounded-full border border-[#E9DAD3] px-5 py-3 text-xs text-[#806D65] disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={unblockMember}
                disabled={busyId !== null}
                className="rounded-full bg-[#DDB5AE] px-6 py-3 text-xs tracking-wider text-[#302521] disabled:opacity-50"
              >
                {busyId
                  ? "UNBLOCKING..."
                  : "UNBLOCK MEMBER ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
