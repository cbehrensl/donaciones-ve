import { CentrosExplorer } from "@/components/centros/CentrosExplorer";
import { OwnerActionBlock } from "@/components/OwnerActionBlock";
import { PublicPageHeader } from "@/components/PublicPageHeader";
import { getHomeDataWithFilters } from "@/lib/data";

export const revalidate = 15;

interface CentrosPageProps {
  searchParams: Promise<{
    q?: string;
    estado?: string;
    municipio?: string;
  }>;
}

export default async function CentrosPage({ searchParams }: CentrosPageProps) {
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
    alertas,
    searchMeta,
    errors,
  } = await getHomeDataWithFilters(filters);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PublicPageHeader
          tag="Centros de acopio"
          tagColorClass="text-blue-800"
          title="Dónde llevar ayuda"
          description="Consulta centros activos, insumos que reciben y alertas de urgencia o saturación reportadas por moderación."
        />

        <OwnerActionBlock
          title="¿Manejas un centro de acopio?"
          subtitle="Registra o actualiza tu centro"
          description="Si eres responsable, desde aquí puedes crear un centro nuevo o entrar con tu código de gestión para actualizar datos, insumos y alertas."
          registerHref="/centros/nuevo"
          registerLabel="Registrar centro"
          manageHref="/gestion"
          manageLabel="Administrar con código"
          colorTheme="blue"
        />

        <CentrosExplorer
          estados={estados}
          municipios={municipios}
          centros={centros}
          alertas={alertas}
          initialFilters={filters}
          searchMeta={searchMeta}
          errors={errors}
        />
      </div>
    </main>
  );
}
