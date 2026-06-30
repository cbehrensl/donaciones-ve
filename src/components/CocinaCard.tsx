import { CopyTextButton } from "@/components/CopyTextButton";
import { formatCocinaPlainText } from "@/lib/data-productores";
import { calcularSemafaro } from "@/lib/semaforo";
import { SEMAFORO_DOT, SEMAFORO_LABELS, SEMAFORO_STYLES, URGENCIA_STYLES } from "@/lib/semaforo";
import type { CocinaComuniaria, NecesidadCocina, SemafaroEstado } from "@/lib/types";

interface CocinaCardProps {
  cocina: CocinaComuniaria;
}

function mapNecesidadToSemafaro(n: NecesidadCocina) {
  return { urgencia: n.urgencia };
}

export function CocinaCard({ cocina }: CocinaCardProps) {
  const necesidades = cocina.necesidades_cocina ?? [];
  const municipio = cocina.municipios?.nombre ?? "Sin municipio";

  const semafaroNecesidades = necesidades.map(mapNecesidadToSemafaro);
  const semaforo: SemafaroEstado =
    necesidades.length > 0
      ? calcularSemafaro(semafaroNecesidades as Parameters<typeof calcularSemafaro>[0])
      : "SIN_DATOS";
  const plainText = formatCocinaPlainText(cocina);

  return (
    <article
      className={`group rounded-2xl border-2 p-5 transition-all sm:p-6 ${SEMAFORO_STYLES[semaforo]} hover:shadow-md active:scale-[0.99]`}
    >
      <header className="mb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black leading-tight text-zinc-900 sm:text-2xl">
            {cocina.nombre}
            {cocina.verificado && (
              <span title="Verificado" className="ml-2 inline-flex items-center text-lg" aria-hidden>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  ✓
                </span>
              </span>
            )}
          </h2>
          {semaforo !== "SIN_DATOS" ? (
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-current bg-white/50 px-2 py-1 text-[10px] font-black uppercase tracking-tighter sm:text-xs">
              <span
                aria-hidden
                className={`inline-block h-2 w-2 rounded-full ${SEMAFORO_DOT[semaforo]}`}
              />
              {SEMAFORO_LABELS[semaforo]}
            </div>
          ) : null}
        </div>
        <p className="text-sm font-bold tracking-tight text-zinc-500">{municipio}</p>
        {!cocina.verificado ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            PENDIENTE DE VERIFICACIÓN
          </div>
        ) : null}
      </header>

      {cocina.descripcion ? (
        <p className="mb-4 text-sm leading-relaxed text-zinc-600">{cocina.descripcion}</p>
      ) : null}

      <div className="mb-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
          <span aria-hidden className="text-lg">📍</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dirección</span>
            <span className="font-medium leading-snug text-zinc-700">{cocina.direccion}</span>
            {cocina.ubicacion_url ? (
              <a
                href={cocina.ubicacion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-fit rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800"
              >
                Abrir en Maps
              </a>
            ) : null}
          </div>
        </div>

        {cocina.contacto ? (
          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">📞</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contacto</span>
              <span className="font-bold leading-snug text-zinc-900">{cocina.contacto}</span>
            </div>
          </div>
        ) : null}

        {cocina.horario ? (
          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">🕒</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Horario</span>
              <span className="font-medium leading-snug text-zinc-700">{cocina.horario}</span>
            </div>
          </div>
        ) : null}

        {cocina.capacidad_beneficiarios ? (
          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">👥</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Beneficiarios</span>
              <span className="font-bold text-zinc-900">
                ~{cocina.capacidad_beneficiarios.toLocaleString("es-VE")} personas/día
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <span className="h-px w-4 bg-zinc-300" />
          Ingredientes que necesita
        </h3>
        {necesidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {necesidades.map((n) => (
              <div
                key={n.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white px-3 py-2 ring-1 ring-inset ring-black/5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight">{n.categoria}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${URGENCIA_STYLES[n.urgencia]}`}>
                    {n.urgencia}
                  </span>
                </div>
                {n.detalle ? (
                  <span className="mt-0.5 text-[10px] font-medium leading-tight opacity-80">
                    {n.detalle}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 text-center text-sm font-bold text-blue-900">
            Esta cocina no ha reportado necesidades específicas aún.
          </div>
        )}
      </div>

      <CopyTextButton
        text={plainText}
        label="Copiar necesidades para WhatsApp/SMS"
      />
    </article>
  );
}
