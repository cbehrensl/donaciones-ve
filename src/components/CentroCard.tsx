import { CopyTextButton } from "@/components/CopyTextButton";
import { formatCentroPlainText } from "@/lib/data";
import { SEMAFORO_LABELS, calcularSemafaro } from "@/lib/semaforo";
import type { CentroAcopio, SemafaroEstado, Urgencia } from "@/lib/types";

const SEMAFORO_BORDER: Record<SemafaroEstado, string> = {
  URGENTE: "#e74c3c",
  MEDIA:   "#F59E0B",
  SATURADO:"#0084D0",
  SIN_DATOS:"#bdd9f0",
};
const SEMAFORO_TEXT: Record<SemafaroEstado, string> = {
  URGENTE: "#c0392b",
  MEDIA:   "#92400E",
  SATURADO:"#0084D0",
  SIN_DATOS:"#002858",
};
const SEMAFORO_DOT_COLOR: Record<SemafaroEstado, string> = {
  URGENTE: "#e74c3c",
  MEDIA:   "#F59E0B",
  SATURADO:"#0084D0",
  SIN_DATOS:"#bdd9f0",
};
const URGENCIA_BG: Record<Urgencia, string> = {
  URGENTE: "#FEE2E2",
  MEDIA:   "#FEF3C7",
  SATURADO:"#EBF3FB",
};
const URGENCIA_BORDER: Record<Urgencia, string> = {
  URGENTE: "#FECACA",
  MEDIA:   "#FDE68A",
  SATURADO:"#bdd9f0",
};
const URGENCIA_COLOR: Record<Urgencia, string> = {
  URGENTE: "#c0392b",
  MEDIA:   "#92400E",
  SATURADO:"#002858",
};

interface CentroCardProps {
  centro: CentroAcopio;
}

export function CentroCard({ centro }: CentroCardProps) {
  const necesidades = centro.necesidades ?? [];
  const semaforo: SemafaroEstado = calcularSemafaro(necesidades);
  const municipio = centro.municipios?.nombre ?? "Sin municipio";
  const plainText = formatCentroPlainText(centro);
  const disponibilidadFechas =
    centro.fecha_inicio_recepcion && centro.fecha_fin_recepcion
      ? `${centro.fecha_inicio_recepcion} al ${centro.fecha_fin_recepcion}`
      : centro.fecha_inicio_recepcion ?? centro.fecha_fin_recepcion;

  return (
    <article
      className="group rounded-xl border-2 p-3 transition-all hover:shadow-md active:scale-[0.99]"
      style={{ borderColor: SEMAFORO_BORDER[semaforo], background: "#fff" }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-black leading-tight truncate" style={{ color: "#002858" }}>
            {centro.nombre}
          </h2>
          {centro.verificado && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white" style={{ background: "#0084D0" }}>✓</span>
          )}
        </div>
        <div
          className="flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase"
          style={{ borderColor: SEMAFORO_BORDER[semaforo], color: SEMAFORO_TEXT[semaforo] }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: SEMAFORO_DOT_COLOR[semaforo] }} />
          {SEMAFORO_LABELS[semaforo]}
        </div>
      </div>

      <p className="mb-1 text-xs font-bold" style={{ color: "#0084D0" }}>{municipio}</p>

      {!centro.verificado && (
        <div className="mb-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>
          <span className="h-1 w-1 rounded-full animate-pulse" style={{ background: "#D97706" }} />
          PENDIENTE DE VERIFICACIÓN
        </div>
      )}

      {/* Info grid */}
      <div className="mb-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg p-2" style={{ background: "#EBF3FB" }}>
          <span aria-hidden>📍</span>
          <div>
            <span className="block font-medium leading-snug" style={{ color: "#002858" }}>{centro.direccion}</span>
            {centro.ubicacion_url && (
              <a href={centro.ubicacion_url} target="_blank" rel="noopener noreferrer"
                className="cta-secondary mt-1 inline-flex rounded border px-2 py-0.5 text-[10px] font-bold"
                style={{ borderColor: "#bdd9f0", background: "#fff", color: "#0084D0" }}>
                Ver en Maps
              </a>
            )}
          </div>
        </div>

        {centro.contacto && (
          <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "#EBF3FB" }}>
            <span aria-hidden>📞</span>
            <span className="font-bold" style={{ color: "#002858" }}>{centro.contacto}</span>
          </div>
        )}

        {centro.estado_vialidad && (
          <div className="flex items-start gap-2 rounded-lg p-2 sm:col-span-2" style={{ background: "#EBF3FB" }}>
            <span aria-hidden>🚙</span>
            <span style={{ color: "#002858" }}>{centro.estado_vialidad}</span>
          </div>
        )}

        {(disponibilidadFechas || centro.horario_recepcion) && (
          <div className="flex items-start gap-2 rounded-lg p-2 sm:col-span-2" style={{ background: "#EBF3FB" }}>
            <span aria-hidden>🕒</span>
            <div style={{ color: "#002858" }}>
              {disponibilidadFechas && <span className="block">Fechas: {disponibilidadFechas}</span>}
              {centro.horario_recepcion && <span className="block">Horario: {centro.horario_recepcion}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Insumos */}
      <div className="mb-2">
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "#0084D0" }}>Insumos requeridos</p>
        {necesidades.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {necesidades.map((item) => (
              <div key={item.id} className="rounded-lg border px-2 py-1"
                style={{ background: URGENCIA_BG[item.urgencia], borderColor: URGENCIA_BORDER[item.urgencia], color: URGENCIA_COLOR[item.urgencia] }}>
                <span className="text-[11px] font-black">{item.tipo_insumo}</span>
                {item.detalle && <span className="ml-1 text-[10px] opacity-75">{item.detalle}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-2 text-center text-[11px] font-bold"
            style={{ borderColor: "#bdd9f0", background: "#EBF3FB", color: "#0084D0" }}>
            Sin insumos específicos — cualquier donación es bienvenida.
          </p>
        )}
      </div>

      <CopyTextButton text={plainText} label="Copiar para WhatsApp/SMS" />
    </article>
  );
}
