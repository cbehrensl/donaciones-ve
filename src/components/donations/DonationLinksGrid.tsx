import { getActiveDonationLinks } from "@/app/admin/donations/actions";
import { DonationCard } from "./DonationCard";

export async function DonationLinksGrid() {
  const links = await getActiveDonationLinks();

  if (links.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        No hay organizaciones verificadas en este momento.
      </p>
    );
  }

  return (
    <ul className="grid list-none gap-3">
      {links.map((link) => (
        <li key={link.id}>
          <DonationCard link={link} />
        </li>
      ))}
    </ul>
  );
}
