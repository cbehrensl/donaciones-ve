import { getActiveDonationLinks } from "@/app/admin/donations/actions";
import { DonationCard } from "./DonationCard";

export async function DonationLinksGrid() {
  const links = await getActiveDonationLinks();

  if (links.length === 0) {
    return null;
  }

  return (
    <details className="group mb-8 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block h-3 w-3 shrink-0 rounded-full bg-blue-500"
          />
          <span className="font-black text-zinc-900">Ayuda con Donaciones</span>
          <span className="text-sm font-medium text-zinc-500">
            {links.length} {links.length === 1 ? "organización" : "organizaciones"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 sm:inline">
            Verificadas
          </span>
          <svg
            className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      
      <div className="border-t border-zinc-100 p-4 sm:p-5">
        <p className="text-sm text-zinc-600 mb-4">
          Colabora de forma segura a través de estas organizaciones verificadas.
        </p>
        <div className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {links.map((link) => (
            <div key={link.id} className="snap-start shrink-0 w-[280px]">
              <DonationCard link={link} />
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
