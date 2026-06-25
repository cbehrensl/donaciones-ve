import { CopyTextButton } from "@/components/CopyTextButton";
import { formatCentroPlainText } from "@/lib/data";
import {
  SEMAFORO_DOT,
  SEMAFORO_LABELS,
  SEMAFORO_STYLES,
  calcularSemafaro,
  URGENCIA_STYLES,
} from "@/lib/semaforo";
import type { CentroAcopio, SemafaroEstado } from "@/lib/types";

interface CentroCardProps {
  centro: CentroAcopio;
}

export function CentroCard({ centro }: CentroCardProps) {
  const necesidades = centro.necesidades ?? [];
  const semaforo: SemafaroEstado = calcularSemafaro(necesidades);
  const municipio = centro.municipios?.nombre ?? "Sin municipio";
  const plainText = formatCentroPlainText(centro);

  return (
    <article
      className={`group rounded-2xl border-2 p-5 transition-all sm:p-6 ${SEMAFORO_STYLES[semaforo]} hover:shadow-md active:scale-[0.99]`}
    >
      <header className="mb-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black leading-tight text-zinc-900 sm:text-2xl">
            {centro.nombre}
            {centro.verificado && (
              <span title="Verificado" className="ml-2 inline-flex items-center text-lg" aria-hidden>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  ✓
                </span>
              </span>
            )}
          </h2>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-current bg-white/50 px-2 py-1 text-[10px] font-black uppercase tracking-tighter sm:text-xs">
            <span
              aria-hidden
              className={`inline-block h-2 w-2 rounded-full ${SEMAFORO_DOT[semaforo]}`}
            />
            {SEMAFORO_LABELS[semaforo]}
          </div>
        </div>
        <p className="text-sm font-bold tracking-tight text-zinc-500">{municipio}</p>
        {!centro.verificado ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDIENTE DE VERIFICACIÓN
          </div>
        ) : null}
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
          <span aria-hidden className="text-lg">📍</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dirección</span>
            <span className="font-medium leading-snug text-zinc-700">{centro.direccion}</span>
            {centro.ubicacion_url ? (
              <a
                href={centro.ubicacion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary mt-2 inline-flex w-fit rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800"
              >
                Abrir ubicación en Maps
              </a>
            ) : null}
          </div>
        </div>
        
        {centro.contacto && (
          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5">
            <span aria-hidden className="text-lg">📞</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contacto</span>
              <span className="font-bold leading-snug text-zinc-900">{centro.contacto}</span>
            </div>
          </div>
        )}

        {centro.estado_vialidad && (
          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-3 ring-1 ring-zinc-900/5 sm:col-span-2">
            <span aria-hidden className="text-lg">🚙</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Estado de acceso</span>
              <span className="font-medium leading-snug text-zinc-700">{centro.estado_vialidad}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <span className="h-px w-4 bg-zinc-300" />
          Insumos requeridos
        </h3>
        {necesidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {necesidades.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col rounded-xl border px-3 py-2 transition-colors ${URGENCIA_STYLES[item.urgencia]} ring-1 ring-inset ring-black/5`}
              >
                <span className="text-xs font-black tracking-tight">{item.tipo_insumo}</span>
                {item.detalle && (
                  <span className="mt-0.5 text-[10px] font-medium leading-tight opacity-80">
                    {item.detalle}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm font-medium text-zinc-400 italic">
            No hay necesidades reportadas en este momento.
          </div>
        )}
      </div>

      <CopyTextButton
        text={plainText}
        label="Copiar reporte para WhatsApp/SMS"
      />
    </article>
  );
}
