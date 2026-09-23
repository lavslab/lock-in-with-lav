import { redirect } from "next/navigation";
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

  // No authenticated user = no dashboard access.
  if (!user) {
    redirect("/auth");
  }

  // Logged-in users should also have a completed challenge setup
  // before entering the dashboard.
  const { data: profile } = await supabase
    .from("profiles")
    .select("challenge_start_date")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.challenge_start_date) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}