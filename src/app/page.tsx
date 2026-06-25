import { getHomeDataWithFilters } from "@/lib/data";
import { HomeClient } from "./HomeClient";

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
    <HomeClient
      estados={estados}
      municipios={municipios}
      centros={centros}
      contactosEmergencia={contactosEmergencia}
      initialFilters={filters}
      searchMeta={searchMeta}
      errors={errors}
    />
  );
}
