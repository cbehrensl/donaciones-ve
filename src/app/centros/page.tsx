import Link from "next/link";
import { CentrosExplorer } from "@/components/centros/CentrosExplorer";
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
        <header className="mb-8 border-b border-zinc-200 pb-4">
          <Link
            href="/"
            className="cta-secondary text-sm font-semibold text-zinc-600"
          >
            ← Volver al hub de apoyo
          </Link>
          <p className="mt-3 text-sm font-black uppercase tracking-wide text-blue-800">
            Centros de acopio
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
            Dónde llevar ayuda
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Consulta centros activos, insumos que reciben y alertas de urgencia o
            saturación reportadas por moderación.
          </p>
          <Link
            href="/mapa"
            className="cta-secondary mt-4 inline-flex rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-800"
          >
            Ver en mapa
          </Link>
        </header>

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
