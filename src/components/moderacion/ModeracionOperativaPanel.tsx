import Link from "next/link";
import { formatWhatsappHref } from "@/lib/contact-links";
import type { AlertasAgrupadasCentro } from "@/lib/alertas";
import type { ModeracionResumen } from "@/lib/types";

function formatAlertTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hace instantes";
  return date.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
}

function getUniqueAlertMessages(alertas: { mensaje: string }[]): string[] {
  const seen = new Set<string>();
  const messages: string[] = [];
  for (const alerta of alertas) {
    const key = alerta.mensaje.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    messages.push(alerta.mensaje);
  }
  return messages;
}

interface AlertGroupListProps {
  grupos: AlertasAgrupadasCentro[];
  badgeClass: string;
  emptyMessage: string;
}

function AlertGroupList({
  grupos,
  badgeClass,
  emptyMessage,
}: AlertGroupListProps) {
  if (grupos.length === 0) {
    return <p className="text-xs text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100 text-sm">
      {grupos.slice(0, 4).map((grupo) => {
        const centro = grupo.centro;
        const mensajes = getUniqueAlertMessages(grupo.alertas);
        return (
          <li key={grupo.centroId} className="py-2 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2">
              <Link
                href={`#centro-${grupo.centroId}`}
                className="font-bold text-zinc-900 hover:text-blue-800"
              >
                {centro?.nombre ?? "Centro"}
              </Link>
              <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                {grupo.alertas.length}
              </span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {mensajes.map((mensaje) => (
                <li key={mensaje} className="text-zinc-700">
                  - {mensaje}
                </li>
              ))}
            </ul>
            {centro?.contacto || centro?.ubicacion_url ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {centro.contacto ? (
                  <a
                    href={formatWhatsappHref(centro.contacto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-emerald-300 bg-white px-2 py-1.5 text-[11px] font-bold text-emerald-800"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {centro.ubicacion_url ? (
                  <a
                    href={centro.ubicacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-blue-300 bg-white px-2 py-1.5 text-[11px] font-bold text-blue-800"
                  >
                    Ver mapa
                  </a>
                ) : null}
              </div>
            ) : null}
            <p className="mt-1 text-xs text-zinc-500">
              Reportado a las {formatAlertTime(grupo.latestCreatedAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

interface ModeracionOperativaPanelProps {
  resumen: ModeracionResumen;
  alertasUrgentes: number;
  alertasSaturacion: number;
  tasaVerificacion: number;
  centrosConNecesidades: number;
  centrosSinNecesidades: number;
  municipiosPendientes: [string, number][];
  centrosConMasAlertas: [string, number][];
  urgentesAgrupadas: AlertasAgrupadasCentro[];
  saturadasAgrupadas: AlertasAgrupadasCentro[];
  hasAlertas: boolean;
}

export function ModeracionOperativaPanel({
  resumen,
  alertasUrgentes,
  alertasSaturacion,
  tasaVerificacion,
  centrosConNecesidades,
  centrosSinNecesidades,
  municipiosPendientes,
  centrosConMasAlertas,
  urgentesAgrupadas,
  saturadasAgrupadas,
  hasAlertas,
}: ModeracionOperativaPanelProps) {
  return (
    <details className="rounded-xl border border-zinc-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-zinc-800">
        Resumen operativo
        <span className="mt-0.5 block text-xs font-normal text-zinc-500">
          {resumen.pendientes} pendientes · {alertasUrgentes} urgentes ·{" "}
          {tasaVerificacion}% verificados
        </span>
      </summary>
      <div className="space-y-4 border-t border-zinc-100 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-zinc-400">Total</p>
            <p className="text-xl font-black text-zinc-900">{resumen.total}</p>
          </div>
          <div className="rounded-lg border border-amber-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-amber-700">Pendientes</p>
            <p className="text-xl font-black text-amber-900">{resumen.pendientes}</p>
          </div>
          <div className="rounded-lg border border-red-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-red-700">Urgentes</p>
            <p className="text-xl font-black text-red-900">{alertasUrgentes}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Verificados</p>
            <p className="text-xl font-black text-emerald-900">{resumen.verificados}</p>
          </div>
        </div>

        {hasAlertas ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className={`rounded-lg border-l-4 ${urgentesAgrupadas.length ? "border-red-400" : "border-zinc-200"} bg-white p-3`}>
              <h3 className="text-xs font-black uppercase text-red-900">
                Solicitudes urgentes
              </h3>
              <AlertGroupList
                grupos={urgentesAgrupadas}
                badgeClass="border-red-300 text-red-700"
                emptyMessage="No hay solicitudes urgentes recientes."
              />
            </div>
            <div className={`rounded-lg border-l-4 ${saturadasAgrupadas.length ? "border-emerald-400" : "border-zinc-200"} bg-white p-3`}>
              <h3 className="text-xs font-black uppercase text-emerald-900">
                Centros saturados
              </h3>
              <AlertGroupList
                grupos={saturadasAgrupadas}
                badgeClass="border-emerald-300 text-emerald-700"
                emptyMessage="No hay centros saturados recientes."
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3 text-sm text-zinc-700">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">Salud del directorio</p>
            <p className="mt-1">
              {tasaVerificacion}% verificados. Con necesidades:{" "}
              <strong>{centrosConNecesidades}</strong>. Sin:{" "}
              <strong>{centrosSinNecesidades}</strong>.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">Foco territorial</p>
            {municipiosPendientes.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {municipiosPendientes.map(([municipio, total]) => (
                  <li key={municipio} className="flex justify-between gap-2">
                    <span>{municipio}</span>
                    <strong className="text-amber-800">{total}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-zinc-500">Sin pendientes.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">Más alertas activas</p>
            {centrosConMasAlertas.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {centrosConMasAlertas.map(([nombre, total]) => (
                  <li key={nombre} className="flex justify-between gap-2">
                    <span>{nombre}</span>
                    <strong className="text-red-700">{total}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-zinc-500">Sin alertas activas.</p>
            )}
            <p className="mt-2 text-xs text-zinc-500">
              Saturación reportada: {alertasSaturacion}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
