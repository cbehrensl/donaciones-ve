import Link from "next/link";
import { CocinaCard } from "@/components/CocinaCard";
import { OwnerPathBanner } from "@/components/alimentacion/OwnerPathBanner";
import { getCocinas } from "@/lib/data-productores";
import { getEstados, getMunicipios } from "@/lib/data";

export const revalidate = 30;

interface CocinasPageProps {
  searchParams: Promise<{
    q?: string;
    estado?: string;
    municipio?: string;
  }>;
}

export default async function CocinasPage({ searchParams }: CocinasPageProps) {
  const params = await searchParams;
  const filters = {
    q: params.q?.trim() ?? "",
    estadoId: params.estado?.trim() ?? "",
    municipioId: params.municipio?.trim() ?? "",
  };

  const [cocinas, estados, municipios] = await Promise.all([
    getCocinas(filters),
    getEstados(),
    getMunicipios(filters.estadoId || undefined),
  ]);

  const hasFilters = Boolean(filters.q || filters.estadoId || filters.municipioId);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 border-b border-zinc-200 pb-4">
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <Link href="/" className="font-semibold text-zinc-500 hover:text-zinc-900">
              Inicio
            </Link>
            <span className="text-zinc-300">›</span>
            <Link
              href="/alimentacion"
              className="font-semibold text-zinc-500 hover:text-zinc-900"
            >
              Alimentación
            </Link>
            <span className="text-zinc-300">›</span>
            <span className="font-semibold text-zinc-900">Cocinas</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Cocinas</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Cocinas verificadas que preparan alimentos y reportan qué ingredientes
            necesitan.
          </p>
        </header>

        <OwnerPathBanner variant="cocina" />

        <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Buscar cocina..."
            className="flex-1 rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
          />
          <select
            name="estado"
            defaultValue={filters.estadoId}
            className="rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
          >
            <option value="">Todos los estados</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          {filters.estadoId && municipios.length > 0 ? (
            <select
              name="municipio"
              defaultValue={filters.municipioId}
              className="rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            >
              <option value="">Todos los municipios</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
          >
            Filtrar
          </button>
          {hasFilters ? (
            <Link
              href="/cocinas"
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {cocinas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-zinc-700">
              {hasFilters
                ? "No se encontraron cocinas con esos filtros"
                : "Aún no hay cocinas verificadas"}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {hasFilters
                ? "Intenta con otros términos de búsqueda"
                : "Los registros nuevos aparecen aquí después de la revisión de moderadores."}
            </p>
            <Link
              href="/alimentacion"
              className="mt-4 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white"
            >
              Registrar mi cocina
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              {cocinas.length}{" "}
              {cocinas.length === 1 ? "cocina encontrada" : "cocinas encontradas"}
            </p>
            <div className="space-y-4">
              {cocinas.map((c) => (
                <CocinaCard key={c.id} cocina={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
