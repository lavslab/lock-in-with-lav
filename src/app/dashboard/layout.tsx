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

  if (!user) {
    redirect("/auth");
  }

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

  const accountName =
    savedName || user.email?.split("@")[0] || "";

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
