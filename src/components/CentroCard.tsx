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
      className="group rounded-xl border-2 p-5 transition-all sm:p-6 hover:shadow-md active:scale-[0.99]"
      style={{
        borderColor: SEMAFORO_BORDER[semaforo],
        background: "#fff",
      }}
    >
      <header className="mb-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black leading-tight sm:text-2xl" style={{ color: "#002858" }}>
            {centro.nombre}
            {centro.verificado && (
              <span title="Verificado" className="ml-2 inline-flex items-center text-lg" aria-hidden>
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white" style={{ background: "#0084D0" }}>
                  ✓
                </span>
              </span>
            )}
          </h2>
          <div
            className="flex shrink-0 items-center gap-2 rounded-lg border bg-white/80 px-2 py-1 text-[10px] font-black uppercase tracking-tighter sm:text-xs"
            style={{ borderColor: SEMAFORO_BORDER[semaforo], color: SEMAFORO_TEXT[semaforo] }}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: SEMAFORO_DOT_COLOR[semaforo] }}
            />
            {SEMAFORO_LABELS[semaforo]}
          </div>
        </div>
        <p className="text-sm font-bold tracking-tight" style={{ color: "#0084D0" }}>{municipio}</p>
        {!centro.verificado ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#D97706" }} />
            PENDIENTE DE VERIFICACIÓN
          </div>
        ) : null}
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "#EBF3FB" }}>
          <span aria-hidden className="text-lg">📍</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0084D0" }}>Dirección</span>
            <span className="font-medium leading-snug" style={{ color: "#002858" }}>{centro.direccion}</span>
            {centro.ubicacion_url ? (
              <a
                href={centro.ubicacion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary mt-2 inline-flex w-fit rounded-md border px-2 py-1 text-xs font-bold"
                style={{ borderColor: "#bdd9f0", background: "#fff", color: "#0084D0" }}
              >
                Abrir ubicación en Maps
              </a>
            ) : null}
          </div>
        </div>

        {centro.contacto && (
          <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "#EBF3FB" }}>
            <span aria-hidden className="text-lg">📞</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0084D0" }}>Contacto</span>
              <span className="font-bold leading-snug" style={{ color: "#002858" }}>{centro.contacto}</span>
            </div>
          </div>
        )}

        {centro.estado_vialidad && (
          <div className="flex items-start gap-3 rounded-xl p-3 sm:col-span-2" style={{ background: "#EBF3FB" }}>
            <span aria-hidden className="text-lg">🚙</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0084D0" }}>Estado de acceso</span>
              <span className="font-medium leading-snug" style={{ color: "#002858" }}>{centro.estado_vialidad}</span>
            </div>
          </div>
        )}

        {(disponibilidadFechas || centro.horario_recepcion) && (
          <div className="flex items-start gap-3 rounded-xl p-3 sm:col-span-2" style={{ background: "#EBF3FB" }}>
            <span aria-hidden className="text-lg">🕒</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0084D0" }}>
                Horario de recepción
              </span>
              {disponibilidadFechas ? (
                <span className="font-medium leading-snug" style={{ color: "#002858" }}>
                  Fechas: {disponibilidadFechas}
                </span>
              ) : null}
              {centro.horario_recepcion ? (
                <span className="font-medium leading-snug" style={{ color: "#002858" }}>
                  Horario: {centro.horario_recepcion}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#0084D0" }}>
          <span className="h-px w-4" style={{ background: "#bdd9f0" }} />
          Insumos requeridos
        </h3>
        {necesidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {necesidades.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-xl border px-3 py-2"
                style={{
                  background: URGENCIA_BG[item.urgencia],
                  borderColor: URGENCIA_BORDER[item.urgencia],
                  color: URGENCIA_COLOR[item.urgencia],
                }}
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
          <div className="rounded-xl border border-dashed p-4 text-center text-sm font-bold" style={{ borderColor: "#bdd9f0", background: "#EBF3FB", color: "#0084D0" }}>
            Aún no se reportaron insumos específicos. Cualquier donación o
            apoyo será bien recibido por este centro.
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
