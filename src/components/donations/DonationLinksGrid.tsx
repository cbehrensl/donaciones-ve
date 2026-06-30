import { getActiveDonationLinks } from "@/app/admin/donations/actions";
import type { DonationLinkCategory } from "@/lib/types";
import { DonationCard } from "./DonationCard";

interface DonationLinksGridProps {
  category?: DonationLinkCategory;
  emptyMessage?: string;
  ctaLabel?: string;
}

export async function DonationLinksGrid({
  category = "money",
  emptyMessage = "No hay organizaciones verificadas en este momento.",
  ctaLabel,
}: DonationLinksGridProps) {
  const links = await getActiveDonationLinks(category);

  if (links.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid list-none gap-3">
      {links.map((link) => (
        <li key={link.id}>
          <DonationCard link={link} ctaLabel={ctaLabel} />
        </li>
      ))}
    </ul>
  );
}
