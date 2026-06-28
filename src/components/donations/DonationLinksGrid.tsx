import { getActiveDonationLinks } from "@/app/admin/donations/actions";
import { DonationCard } from "./DonationCard";

export async function DonationLinksGrid() {
  const links = await getActiveDonationLinks();

  if (links.length === 0) {
    return null;
  }

  return (
    <section className="py-8 my-8 border-t border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ayuda con Donaciones</h2>
        <p className="text-gray-600 mt-2">
          Colabora de forma segura a través de estas organizaciones verificadas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {links.map((link) => (
          <DonationCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
}
