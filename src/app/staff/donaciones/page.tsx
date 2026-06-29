import { redirect } from "next/navigation";
import { StaffNav } from "@/components/navigation/StaffNav";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";
import {
  getAllDonationLinks,
  getDonationAdminData,
} from "@/app/admin/donations/actions";
import { AdminDonationsClient } from "@/app/admin/donations/AdminDonationsClient";

interface StaffDonacionesPageProps {
  searchParams: Promise<{ token?: string }>;
}

export const revalidate = 0;

export default async function StaffDonacionesPage({
  searchParams,
}: StaffDonacionesPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const hasToken = Boolean(getModeratorAccessToken());
  const isAuthorized = isModeratorTokenValid(token);

  if (!hasToken || !isAuthorized) {
    redirect("/staff");
  }

  const links = await getAllDonationLinks(token);
  const adminData = await getDonationAdminData(token);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StaffNav token={token} />

      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Donaciones verificadas
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Administra los enlaces públicos de ayuda económica.
        </p>
      </header>

      <AdminDonationsClient
        initialLinks={links}
        token={token}
        initialAdminData={adminData}
      />
    </main>
  );
}
