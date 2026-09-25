import { redirect } from "next/navigation";

import DashboardMobileNav from "@/components/DashboardMobileNav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all dashboard routes.
  // Logged-out visitors are sent to the auth page.
  if (!user) {
    redirect("/auth");
  }

  // Users who have not completed onboarding
  // are sent to choose their challenge start date.
  const { data: profile } = await supabase
    .from("profiles")
    .select("challenge_start_date")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.challenge_start_date) {
    redirect("/onboarding");
  }

  const savedName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";

  const accountName = savedName || user.email?.split("@")[0] || "";

  const accountInitial = accountName
    ? accountName.charAt(0).toUpperCase()
    : "♡";

  return (
    <>
      <DashboardMobileNav initial={accountInitial} />
      <div className="pb-24 md:pb-0">{children}</div>
    </>
  );
}