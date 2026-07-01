import { CopyTextButton } from "@/components/CopyTextButton";
import {
  ALERTA_UI_CONFIG,
  calcularSemaforoDesdeAlertas,
  splitVisibleAlertasByTipo,
} from "@/lib/alertas";
import { formatWhatsappHref } from "@/lib/contact-links";
import { formatCentroPlainText } from "@/lib/data";
import {
  SEMAFORO_DOT,
  SEMAFORO_LABELS,
  SEMAFORO_STYLES,
} from "@/lib/semaforo";
import type { AlertaCentro, CentroAcopio, SemafaroEstado } from "@/lib/types";

interface CentroCardProps {
  centro: CentroAcopio;
  alertasActivas?: AlertaCentro[];
}

export function CentroCard({ centro, alertasActivas = [] }: CentroCardProps) {
  const necesidades = centro.necesidades ?? [];
  const semaforo: SemafaroEstado = calcularSemaforoDesdeAlertas(alertasActivas, {
    hasInsumos: necesidades.length > 0,
  });
  const { urgentes: alertasUrgentes, saturadas: alertasSaturadas } =
    splitVisibleAlertasByTipo(alertasActivas);
  const municipio = centro.municipios?.nombre ?? "Sin municipio";
  const plainText = formatCentroPlainText(centro);
  const disponibilidadFechas =
    centro.fecha_inicio_recepcion && centro.fecha_fin_recepcion
      ? `${centro.fecha_inicio_recepcion} al ${centro.fecha_fin_recepcion}`
      : centro.fecha_inicio_recepcion ?? centro.fecha_fin_recepcion;

  return (
    <article
      className={`rounded-xl border p-4 transition sm:p-5 ${SEMAFORO_STYLES[semaforo]}`}
    >
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black leading-tight text-zinc-900 sm:text-xl">
            {centro.nombre}
            {centro.verificado && (
              <span
                title="Verificado"
                className="ml-2 inline-flex items-center text-sm"
                aria-hidden
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  ✓
                </span>
              </span>
            )}
          </h2>
          {semaforo !== "SIN_DATOS" ? (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-current bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-tight">
              <span
                aria-hidden
                className={`inline-block h-2 w-2 rounded-full ${SEMAFORO_DOT[semaforo]}`}
              />
              {SEMAFORO_LABELS[semaforo]}
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-zinc-500">{municipio}</p>
          {!centro.verificado ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              Pendiente
            </span>
          ) : null}
        </div>
      </header>

      {alertasActivas.length > 0 ? (
        <div className="mb-4 space-y-2 rounded-lg border border-zinc-200 bg-white/80 p-3">
          {alertasUrgentes.slice(0, 2).map((alerta) => {
            const ui = ALERTA_UI_CONFIG[alerta.tipo];
            return (
              <div
                key={alerta.id}
                className={`rounded-md border px-2.5 py-2 text-xs ${ui.itemClasses}`}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-black tracking-wide">
                  <span aria-hidden>{ui.icon}</span>
                  Necesita ayuda ahora
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug">{alerta.mensaje}</p>
              </div>
            );
          })}

          {alertasSaturadas.slice(0, 2).map((alerta) => {
            const ui = ALERTA_UI_CONFIG[alerta.tipo];
            return (
              <div
                key={alerta.id}
                className={`rounded-md border px-2.5 py-2 text-xs ${ui.itemClasses}`}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-black tracking-wide">
                  <span aria-hidden>{ui.icon}</span>
                  No llevar por ahora
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug">{alerta.mensaje}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mb-4 space-y-2 text-sm text-zinc-700">
        <p className="leading-snug">{centro.direccion}</p>
        {centro.estado_vialidad ? (
          <p className="text-xs text-zinc-500">Acceso: {centro.estado_vialidad}</p>
        ) : null}
        {disponibilidadFechas || centro.horario_recepcion ? (
          <p className="text-xs text-zinc-500">
            {disponibilidadFechas ? `Fechas ${disponibilidadFechas}` : ""}
            {disponibilidadFechas && centro.horario_recepcion ? " · " : ""}
            {centro.horario_recepcion ? `Horario ${centro.horario_recepcion}` : ""}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {centro.ubicacion_url ? (
            <a
              href={centro.ubicacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
            >
              Ver mapa
            </a>
          ) : null}
          {centro.contacto ? (
            <a
              href={formatWhatsappHref(centro.contacto)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">
          Necesidades
        </h3>
        {necesidades.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {necesidades.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-md border border-zinc-200 bg-white px-2.5 py-1.5"
              >
                <span className="text-xs font-bold tracking-tight">{item.tipo_insumo}</span>
                {item.detalle && (
                  <span className="mt-0.5 text-[10px] leading-tight text-zinc-500">
                    {item.detalle}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Aún no reporta necesidades específicas.
          </p>
        )}
      </div>

      {necesidades.length > 0 ? (
        <CopyTextButton
          text={plainText}
          label="Copiar reporte para WhatsApp/SMS"
        />
      ) : null}
    </article>
  );
}
