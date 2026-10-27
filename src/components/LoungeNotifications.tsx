
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  actor_id: string;
  post_id: string;
  comment_id: string | null;
  type: "post_like" | "comment_like" | "comment" | "reply";
  is_read: boolean;
  created_at: string;
};

type Props = {
  currentUserId: string;
};

export default function LoungeNotifications({
  currentUserId,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actorNames, setActorNames] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("lounge_notifications")
      .select(
        "id, actor_id, post_id, comment_id, type, is_read, created_at"
      )
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (loadError) {
      console.error("LOUNGE NOTIFICATIONS:", loadError);
      setError("Couldn't load notifications.");
      setLoading(false);
      return;
    }

    const items = (data ?? []) as Notification[];
    setNotifications(items);
    setError("");

    const actorIds = [...new Set(items.map((item) => item.actor_id))];

    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("lounge_profiles")
        .select("user_id, display_name")
        .in("user_id", actorIds);

      const names: Record<string, string> = {};

      for (const profile of profiles ?? []) {
        names[profile.user_id] =
          profile.display_name || "A Lounge member";
      }

      setActorNames(names);
    }

    setLoading(false);
  }, [supabase, currentUserId]);

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  function getMessage(notification: Notification) {
    const name =
      actorNames[notification.actor_id] || "A Lounge member";

    switch (notification.type) {
      case "post_like":
        return `${name} liked your post ♡`;

      case "comment_like":
        return `${name} liked your comment ♡`;

      case "comment":
        return `${name} commented on your post.`;

      case "reply":
        return `${name} replied to your comment.`;
    }
  }

  async function markAsRead(id: string) {
    const { error: updateError } = await supabase
      .from("lounge_notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (updateError) {
      console.error("MARK NOTIFICATION READ:", updateError);
      return;
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  }

  async function markAllAsRead() {
    const { error: updateError } = await supabase
      .from("lounge_notifications")
      .update({ is_read: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);

    if (updateError) {
      console.error("MARK ALL NOTIFICATIONS READ:", updateError);
      setError("Couldn't mark notifications as read.");
      return;
    }

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, is_read: true }))
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);
          void loadNotifications();
        }}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#DED0CB] bg-[#FBF8F6] text-[#806D65] transition hover:text-[#211C19]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A77B73] px-1 text-[9px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-1/2 top-40 z-50 w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-[#DED0CB] bg-[#FFFCFA] shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 sm:translate-x-0">

          {/* NOTIFICATIONS HEADER */}
          <div className="flex items-center justify-between border-b border-[#E8DCD6] px-4 py-3">
            <h2 className="font-serif text-lg text-[#211C19]">
              Notifications.
            </h2>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="text-[10px] text-[#9D6F67]"
                >
                  Mark all as read
                </button>
              )}

              {/* CLOSE NOTIFICATIONS */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#806D65] transition hover:bg-[#F7F1ED] hover:text-[#211C19]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-xs text-[#806D65]">
                Loading...
              </p>
            ) : error ? (
              <p className="px-4 py-8 text-center text-xs text-[#806D65]">
                {error}
              </p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="font-serif text-xl text-[#A77B73]">♡</p>
                <p className="mt-2 text-xs text-[#806D65]">
                  Nothing new just yet.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/dashboard/lounge?post=${encodeURIComponent(
                    notification.post_id
                  )}${
                    notification.comment_id
                      ? `&comment=${encodeURIComponent(
                          notification.comment_id
                        )}`
                      : ""
                  }`}
                  onClick={() => {
                    void markAsRead(notification.id);
                    setOpen(false);
                  }}
                  className={`block border-b border-[#F0E6E1] px-4 py-3 transition hover:bg-[#F7F1ED] ${
                    !notification.is_read ? "bg-[#F9F0ED]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.is_read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A77B73]" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-5 text-[#302521]">
                        {getMessage(notification)}
                      </p>

                      <p className="mt-1 text-[9px] text-[#A18A82]">
                        {new Date(
                          notification.created_at
                        ).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
