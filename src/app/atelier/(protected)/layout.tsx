import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminShell, AdminShellLoading } from "@/components/admin/admin-shell";
import { getAdminAuthState } from "@/data/auth/admin-session";

export default function ProtectedAtelierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<AdminShellLoading />}>
      <AuthorizedAdminShell>{children}</AuthorizedAdminShell>
    </Suspense>
  );
}

async function AuthorizedAdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getAdminAuthState();

  if (auth.status !== "authenticated") {
    const reason =
      auth.status === "missing-configuration" ? "configurare" : "autentificare";
    redirect(`/atelier/login?motiv=${reason}`);
  }

  return <AdminShell identity={auth.identity}>{children}</AdminShell>;
}
