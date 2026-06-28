import { getActiveDonationLinks } from "@/app/admin/donations/actions";
import { DonationCard } from "./DonationCard";

export async function DonationLinksGrid() {
  const links = await getActiveDonationLinks();

  if (links.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-zinc-900">Ayuda con Donaciones</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Colabora de forma segura a través de estas organizaciones verificadas.
        </p>
      </div>
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {links.map((link) => (
          <div key={link.id} className="snap-start shrink-0 w-[280px]">
            <DonationCard link={link} />
          </div>
        ))}
      </div>
    </section>
  );
}
