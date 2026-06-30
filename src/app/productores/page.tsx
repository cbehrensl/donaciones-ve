import Link from "next/link";
import { CocinaCard } from "@/components/CocinaCard";
import { OwnerPathBanner } from "@/components/alimentacion/OwnerPathBanner";
import { ProductorCard } from "@/components/ProductorCard";
import { CATEGORIA_PRODUCTOR_LABELS } from "@/lib/categorias-alimentacion";
import { getCocinasConDemanda, getProductores } from "@/lib/data-productores";
import { getEstados, getMunicipios } from "@/lib/data";
import type { CategoriaProductor } from "@/lib/types";

export const revalidate = 30;

const CATEGORIAS_FILTRO = Object.keys(CATEGORIA_PRODUCTOR_LABELS) as CategoriaProductor[];

interface ProductoresPageProps {
  searchParams: Promise<{
    q?: string;
    estado?: string;
    municipio?: string;
    categoria?: string;
  }>;
}

export default async function ProductoresPage({ searchParams }: ProductoresPageProps) {
  const params = await searchParams;
  const categoriaRaw = params.categoria?.trim() ?? "";
  const categoriaFamilia = CATEGORIAS_FILTRO.includes(categoriaRaw as CategoriaProductor)
    ? (categoriaRaw as CategoriaProductor)
    : undefined;

  const filters = {
    q: params.q?.trim() ?? "",
    estadoId: params.estado?.trim() ?? "",
    municipioId: params.municipio?.trim() ?? "",
  };

  const [productores, cocinasConDemanda, estados, municipios] = await Promise.all([
    getProductores(filters),
    getCocinasConDemanda({ ...filters, categoriaFamilia }),
    getEstados(),
    getMunicipios(filters.estadoId || undefined),
  ]);

  const hasFilters = Boolean(
    filters.q || filters.estadoId || filters.municipioId || categoriaFamilia,
  );

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
            <span className="font-semibold text-zinc-900">Productores</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            Productores de alimentos
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Directorio de productores verificados y cocinas que necesitan insumos.
          </p>
        </header>

        <OwnerPathBanner variant="productor" />

        <section id="demanda" className="mb-10">
          <h2 className="mb-2 text-lg font-black text-zinc-900">
            Cocinas que necesitan insumos
          </h2>
          <p className="mb-4 text-sm text-zinc-600">
            Demanda verificada: cocinas que reportaron ingredientes que necesitan recibir.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href="/productores#demanda"
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                !categoriaFamilia
                  ? "bg-blue-800 text-white"
                  : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Todas
            </Link>
            {CATEGORIAS_FILTRO.map((cat) => {
              const params = new URLSearchParams();
              if (filters.q) params.set("q", filters.q);
              if (filters.estadoId) params.set("estado", filters.estadoId);
              if (filters.municipioId) params.set("municipio", filters.municipioId);
              params.set("categoria", cat);
              return (
                <Link
                  key={cat}
                  href={`/productores?${params.toString()}#demanda`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    categoriaFamilia === cat
                      ? "bg-blue-800 text-white"
                      : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {CATEGORIA_PRODUCTOR_LABELS[cat]}
                </Link>
              );
            })}
          </div>
          {cocinasConDemanda.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
              No hay cocinas verificadas con necesidades reportadas
              {hasFilters ? " con esos filtros" : " aún"}.
            </div>
          ) : (
            <div className="space-y-4">
              {cocinasConDemanda.slice(0, 6).map((c) => (
                <CocinaCard key={c.id} cocina={c} />
              ))}
              {cocinasConDemanda.length > 6 ? (
                <p className="text-center text-sm text-zinc-500">
                  Mostrando 6 de {cocinasConDemanda.length}. Usa filtros para acotar.
                </p>
              ) : null}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-black text-zinc-900">
            Productores verificados
          </h2>

          <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Buscar productor..."
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
                href="/productores"
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Limpiar
              </Link>
            ) : null}
          </form>

          {productores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-lg font-bold text-zinc-700">
                {hasFilters
                  ? "No se encontraron productores con esos filtros"
                  : "Aún no hay productores verificados"}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {hasFilters
                  ? "Intenta con otros términos de búsqueda"
                  : "Los registros nuevos aparecen aquí después de la revisión de moderadores."}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-zinc-500">
                {productores.length}{" "}
                {productores.length === 1 ? "productor encontrado" : "productores encontrados"}
              </p>
              <div className="space-y-4">
                {productores.map((p) => (
                  <ProductorCard key={p.id} productor={p} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
