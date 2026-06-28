import { getHomeDataWithFilters } from "@/lib/data";
import { HomeClient } from "./HomeClient";
import { DonationLinksGrid } from "@/components/donations/DonationLinksGrid";

export const revalidate = 15;

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    estado?: string;
    municipio?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters = {
    q: params.q?.trim() ?? "",
    estadoId: params.estado?.trim() ?? "",
    municipioId: params.municipio?.trim() ?? "",
  };
  const {
    estados,
    municipios,
    centros,
    contactosEmergencia,
    searchMeta,
    errors,
  } = await getHomeDataWithFilters(filters);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <HomeClient
        estados={estados}
        municipios={municipios}
        centros={centros}
        contactosEmergencia={contactosEmergencia}
        initialFilters={filters}
        searchMeta={searchMeta}
        errors={errors}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
        <DonationLinksGrid />
      </div>
    </main>
  );
}
