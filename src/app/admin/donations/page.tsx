import { redirect } from "next/navigation";

interface AdminDonationsLegacyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminDonationsLegacyPage({
  searchParams,
}: AdminDonationsLegacyPageProps) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (token) {
    redirect(`/staff/donaciones?${new URLSearchParams({ token }).toString()}`);
  }

  redirect("/staff");
}
