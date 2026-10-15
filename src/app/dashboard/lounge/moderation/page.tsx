
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoungeDismissReportButton from "@/components/LoungeDismissReportButton";
import LoungeRemoveContentButton from "@/components/LoungeRemoveContentButton";

export const dynamic = "force-dynamic";

type LoungeReport = {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

type LoungeProfile = {
  user_id: string;
  display_name: string | null;
  username: string | null;
};

type ReportedContent = {
  id: string;
  user_id: string;
  content: string;
};

type ReportView = {
  report: LoungeReport;
  reporter: LoungeProfile | null;
  reportedMember: LoungeProfile | null;
  content: string | null;
  contentAvailable: boolean;
  targetType: "post" | "comment" | "unknown";
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatReason(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MemberName({
  profile,
  fallback,
}: {
  profile: LoungeProfile | null;
  fallback: string;
}) {
  if (!profile) {
    return (
      <span className="text-[#A18A82]">
        {fallback}
      </span>
    );
  }

  return (
    <span>
      <span className="font-medium text-[#302521]">
        {profile.display_name || "Lounge Member"}
      </span>

      {profile.username && (
        <span className="ml-2 text-[#A77B73]">
          @{profile.username}
        </span>
      )}
    </span>
  );
}

export default async function LoungeModerationPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth");
  }

  // Only approved moderators can access this page.
  const { data: isModerator, error: moderatorError } =
    await supabase.rpc("lounge_is_moderator");

  if (moderatorError || isModerator !== true) {
    redirect("/dashboard/lounge");
  }

  const { data, error: reportsError } = await supabase
    .from("lounge_reports")
    .select(
      "id, reporter_id, post_id, comment_id, reason, details, status, created_at, reviewed_at, reviewed_by"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const reports: LoungeReport[] = reportsError
    ? []
    : data ?? [];

  const postIds = [
    ...new Set(
      reports
        .map((report) => report.post_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const commentIds = [
    ...new Set(
      reports
        .map((report) => report.comment_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  // Fetch the reported content.
  let reportedPosts: ReportedContent[] = [];
  let reportedComments: ReportedContent[] = [];

  if (postIds.length > 0) {
    const { data: posts, error: postError } =
      await supabase
        .from("lounge_posts")
        .select("id, user_id, content")
        .in("id", postIds);

    if (postError) {
      console.error(
        "MODERATION POSTS ERROR:",
        postError
      );
    }

    reportedPosts = posts ?? [];
  }

  if (commentIds.length > 0) {
    const { data: comments, error: commentError } =
      await supabase
        .from("lounge_post_comments")
        .select("id, user_id, content")
        .in("id", commentIds);

    if (commentError) {
      console.error(
        "MODERATION COMMENTS ERROR:",
        commentError
      );
    }

    reportedComments = comments ?? [];
  }

  const postMap = new Map(
    reportedPosts.map((post) => [post.id, post])
  );

  const commentMap = new Map(
    reportedComments.map((comment) => [
      comment.id,
      comment,
    ])
  );

  // Collect the reporter and reported member IDs.
  const memberIds = [
    ...new Set([
      ...reports.map((report) => report.reporter_id),
      ...reportedPosts.map((post) => post.user_id),
      ...reportedComments.map(
        (comment) => comment.user_id
      ),
    ]),
  ];

  let profiles: LoungeProfile[] = [];

  if (memberIds.length > 0) {
    const { data: profileData, error: profileError } =
      await supabase
        .from("lounge_profiles")
        .select("user_id, display_name, username")
        .in("user_id", memberIds);

    if (profileError) {
      console.error(
        "MODERATION PROFILES ERROR:",
        profileError
      );
    }

    profiles = profileData ?? [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.user_id,
      profile,
    ])
  );

  const reportViews: ReportView[] = reports.map(
    (report) => {
      const post = report.post_id
        ? postMap.get(report.post_id)
        : undefined;

      const comment = report.comment_id
        ? commentMap.get(report.comment_id)
        : undefined;

      const target = post ?? comment;

      const targetType: ReportView["targetType"] =
        report.post_id
          ? "post"
          : report.comment_id
            ? "comment"
            : "unknown";

      return {
        report,
        reporter:
          profileMap.get(report.reporter_id) ?? null,
        reportedMember: target
          ? profileMap.get(target.user_id) ?? null
          : null,
        content: target?.content ?? null,
        contentAvailable: Boolean(target),
        targetType,
      };
    }
  );

  const pendingReports = reportViews.filter(
    ({ report }) => report.status === "pending"
  );

  const reviewedReports = reportViews.filter(
    ({ report }) => report.status !== "pending"
  );

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-8 text-[#302521]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/lounge"
          className="text-xs text-[#A77B73] underline underline-offset-4"
        >
          ← Back to the Lounge
        </Link>

        <header className="mb-8 mt-9">
          <p className="text-[10px] tracking-[0.3em] text-[#A77B73]">
            THE LOCK IN LOUNGE · PRIVATE
          </p>

          <h1 className="mt-3 font-serif text-4xl tracking-tight">
            Community moderation ♡
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#806D65]">
            A private space to review community reports,
            protect your members, and keep the Lounge
            supportive.
          </p>
        </header>

        {/* REPORT OVERVIEW */}
        <section className="mb-8 grid grid-cols-3 gap-3">
          {[
            {
              label: "PENDING",
              count: pendingReports.length,
            },
            {
              label: "REVIEWED",
              count: reviewedReports.length,
            },
            {
              label: "TOTAL",
              count: reportViews.length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E9DAD3] bg-white px-3 py-5 text-center shadow-sm"
            >
              <p className="font-serif text-3xl text-[#302521]">
                {item.count}
              </p>

              <p className="mt-2 text-[10px] tracking-wider text-[#A77B73]">
                {item.label}
              </p>
            </div>
          ))}
        </section>

        {reportsError ? (
          <section className="rounded-3xl border border-[#E9DAD3] bg-white p-6">
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              We couldn't load the reports right now.
              Please try again.
            </p>
          </section>
        ) : (
          <>
            {/* PENDING REPORTS */}
            <section className="mb-10">
              <div className="mb-5">
                <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
                  NEEDS YOUR ATTENTION
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Pending reports ♡
                </h2>
              </div>

              {pendingReports.length === 0 ? (
                <div className="rounded-3xl border border-[#E9DAD3] bg-white px-6 py-10 text-center">
                  <p className="font-serif text-xl">
                    All caught up ♡
                  </p>

                  <p className="mt-3 text-sm text-[#806D65]">
                    There are no pending reports to
                    review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map((item) => (
                    <ReportCard
                      key={item.report.id}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* REVIEWED REPORTS */}
            <section>
              <div className="mb-5">
                <p className="text-[10px] tracking-[0.2em] text-[#A77B73]">
                  COMMUNITY HISTORY
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Reviewed reports
                </h2>
              </div>

              {reviewedReports.length === 0 ? (
                <div className="rounded-3xl border border-[#E9DAD3] bg-white px-6 py-8 text-center">
                  <p className="text-sm text-[#806D65]">
                    Reviewed reports will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewedReports.map((item) => (
                    <ReportCard
                      key={item.report.id}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="mt-10 text-center">
          <p className="font-serif text-sm italic text-[#A77B73]">
            A safe space to show up and grow. ♡
          </p>
        </footer>
      </div>
    </main>
  );
}

function ReportCard({ item }: { item: ReportView }) {
  const {
    report,
    reporter,
    reportedMember,
    content,
    contentAvailable,
    targetType,
  } = item;

  return (
    <article className="rounded-3xl border border-[#E9DAD3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#A77B73]">
            {targetType === "post"
              ? "REPORTED POST"
              : targetType === "comment"
                ? "REPORTED COMMENT"
                : "PREVIOUSLY REPORTED CONTENT"}
          </p>

          <h3 className="mt-2 font-serif text-xl text-[#302521]">
            {formatReason(report.reason)}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-2 text-[10px] tracking-wider ${
            report.status === "pending"
              ? "bg-[#F4E6E1] text-[#A77B73]"
              : "bg-[#EDF0E8] text-[#65755D]"
          }`}
        >
          {report.status.toUpperCase()}
        </span>
      </div>

      {/* MEMBERS INVOLVED */}
      <div className="mt-5 grid gap-4 border-t border-[#F0E6E1] pt-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] tracking-wider text-[#A77B73]">
            REPORTED MEMBER
          </p>

          <p className="text-sm">
            <MemberName
              profile={reportedMember}
              fallback="Member unavailable"
            />
          </p>
        </div>

        <div>
          <p className="mb-2 text-[10px] tracking-wider text-[#A77B73]">
            REPORTED BY
          </p>

          <p className="text-sm">
            <MemberName
              profile={reporter}
              fallback="Member unavailable"
            />
          </p>
        </div>
      </div>

      {/* REPORTED CONTENT PREVIEW */}
      <div className="mt-5 rounded-2xl bg-[#F7F1ED] p-4">
        <p className="text-[10px] tracking-wider text-[#A77B73]">
          REPORTED CONTENT
        </p>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#302521]">
          {contentAvailable
            ? content
            : "This content is no longer available."}
        </p>
      </div>

      {report.details && (
        <div className="mt-4 rounded-2xl border border-[#E9DAD3] p-4">
          <p className="text-[10px] tracking-wider text-[#A77B73]">
            ADDITIONAL DETAILS
          </p>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#302521]">
            {report.details}
          </p>
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-[#F0E6E1] pt-4 text-xs text-[#806D65]">
        <p>
          <span className="font-medium">
            Submitted:
          </span>{" "}
          {formatDate(report.created_at)}
        </p>

        <p>
          <span className="font-medium">
            Content type:
          </span>{" "}
          {targetType === "unknown"
            ? "Previously removed"
            : targetType === "post"
              ? "Post"
              : "Comment"}
        </p>

        {report.reviewed_at && (
          <p>
            <span className="font-medium">
              Reviewed:
            </span>{" "}
            {formatDate(report.reviewed_at)}
          </p>
        )}

        <details className="pt-1">
          <summary className="cursor-pointer text-[11px] text-[#A77B73]">
            Technical details
          </summary>

          <p className="mt-2 break-all">
            Report ID: {report.id}
          </p>
        </details>
      </div>

      {report.status === "pending" && (
  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#F0E6E1] pt-5">
    <LoungeDismissReportButton
      reportId={report.id}
    />

    {contentAvailable &&
      targetType !== "unknown" && (
        <LoungeRemoveContentButton
          reportId={report.id}
          contentType={targetType}
        />
      )}
  </div>
)}
    </article>
  );
}
