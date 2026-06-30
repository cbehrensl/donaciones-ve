import { CopyTextButton } from "@/components/CopyTextButton";
import { formatProductorPlainText } from "@/lib/data-productores";
import type { Productor } from "@/lib/types";

const CATEGORIA_LABELS: Record<string, string> = {
  proteinas: "Proteínas",
  vegetales: "Vegetales",
  no_perecederos: "No perecederos",
  lacteos: "Lácteos",
  granos: "Granos",
  frutas: "Frutas",
  otros: "Otros",
};

const CATEGORIA_STYLES: Record<string, string> = {
  proteinas: "bg-red-50 border-red-200 text-red-900",
  vegetales: "bg-green-50 border-green-200 text-green-900",
  no_perecederos: "bg-amber-50 border-amber-200 text-amber-900",
  lacteos: "bg-blue-50 border-blue-200 text-blue-900",
  granos: "bg-yellow-50 border-yellow-200 text-yellow-900",
  frutas: "bg-orange-50 border-orange-200 text-orange-900",
  otros: "bg-zinc-50 border-zinc-200 text-zinc-700",
};

interface ProductorCardProps {
  productor: Productor;
}

export function ProductorCard({ productor }: ProductorCardProps) {
  const municipio = productor.municipios?.nombre ?? "Sin municipio";
  const plainText = formatProductorPlainText(productor);

  return (
    <article className="group rounded-2xl border-2 border-zinc-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99] sm:p-6">
      <header className="mb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black leading-tight text-zinc-900 sm:text-2xl">
            {productor.nombre}
            {productor.verificado && (
              <span title="Verificado" className="ml-2 inline-flex items-center text-lg" aria-hidden>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                  ✓
                </span>
              </span>
            )}
          </h2>
        </div>
        <p className="text-sm font-bold tracking-tight text-zinc-500">{municipio}</p>
        {!productor.verificado ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            PENDIENTE DE VERIFICACIÓN
          </div>
        ) : null}
      </header>

      {productor.descripcion ? (
        <p className="mb-4 text-sm leading-relaxed text-zinc-600">{productor.descripcion}</p>
      ) : null}

      <div className="mb-5">
        <h3 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <span className="h-px w-4 bg-zinc-300" />
          Puede aportar
        </h3>
        {productor.categorias.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {productor.categorias.map((cat) => (
              <span
                key={cat}
                className={`rounded-lg border px-3 py-1 text-xs font-bold ${CATEGORIA_STYLES[cat] ?? CATEGORIA_STYLES.otros}`}
              >
                {CATEGORIA_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Sin categorías especificadas</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {productor.contacto ? (
          <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">📞</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Contacto
              </span>
              <span className="font-bold leading-snug text-zinc-900">{productor.contacto}</span>
            </div>
          </div>
        ) : null}

        {productor.ubicacion_url ? (
          <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">📍</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Ubicación
              </span>
              <a
                href={productor.ubicacion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-fit rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800"
              >
                Abrir en Maps
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <CopyTextButton
        text={plainText}
        label="Copiar oferta para WhatsApp/SMS"
      />
    </article>
  );
}
