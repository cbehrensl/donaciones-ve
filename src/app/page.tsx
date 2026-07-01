import { redirect } from "next/navigation";
import { getHubPublicData } from "@/lib/data";
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

function hasCentrosQueryParams(params: {
  q?: string;
  estado?: string;
  municipio?: string;
}): boolean {
  return Boolean(
    params.q?.trim() || params.estado?.trim() || params.municipio?.trim(),
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  if (hasCentrosQueryParams(params)) {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.set("q", params.q.trim());
    if (params.estado?.trim()) query.set("estado", params.estado.trim());
    if (params.municipio?.trim()) query.set("municipio", params.municipio.trim());
    redirect(`/centros?${query.toString()}`);
  }

  const { contactosEmergencia, errors } = await getHubPublicData();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <HomeClient
        contactosEmergencia={contactosEmergencia}
        errors={errors}
        donationsSlot={
          <DonationLinksGrid
            ctaLabel="Aportar ahora"
            emptyMessage="Por ahora no hay organizaciones verificadas para donar. Revisa de nuevo en unos minutos."
          />
        }
        psychologicalSupportSlot={
          <DonationLinksGrid
            category="psychological"
            emptyMessage="Por ahora no hay plataformas de apoyo emocional verificadas. Revisa de nuevo en unos minutos."
            ctaLabel="Pedir apoyo"
          />
        }
      />
    </main>
  );
}
