import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAuthState } from "@/data/auth/admin-session";

export default async function ProtectedAtelierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await getAdminAuthState();

  if (auth.status === "service-unavailable") {
    redirect("/atelier/indisponibil");
  }

  if (auth.status === "unprovisioned" || auth.status === "forbidden") {
    redirect(`/atelier/acces-refuzat?motiv=${auth.status}`);
  }

  if (auth.status !== "authenticated") {
    const reason =
      auth.status === "missing-configuration" ? "configurare" : "autentificare";
    redirect(`/atelier/login?motiv=${reason}`);
  }

  return <AdminShell identity={auth.identity}>{children}</AdminShell>;
}
