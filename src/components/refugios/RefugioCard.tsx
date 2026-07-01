import { CopyTextButton } from "@/components/CopyTextButton";
import { formatWhatsappHref } from "@/lib/contact-links";
import { formatRefugioPlainText } from "@/lib/data";
import type { Refugio } from "@/lib/types";

interface RefugioCardProps {
  refugio: Refugio;
}

export function RefugioCard({ refugio }: RefugioCardProps) {
  const whatsappHref = refugio.contacto_telefono
    ? formatWhatsappHref(refugio.contacto_telefono)
    : null;

  return (
    <article className="rounded-xl border border-purple-100 bg-white p-4 transition sm:p-5">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black leading-tight text-zinc-900 sm:text-xl">
            {refugio.nombre}
            {refugio.confirmado && (
              <span
                title="Confirmado"
                className="ml-2 inline-flex items-center text-sm"
                aria-hidden
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  ✓
                </span>
              </span>
            )}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {refugio.saturado ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-red-800">
                Saturado
              </span>
            ) : refugio.activo ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-800">
                Activo
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-zinc-600">
                Inactivo
              </span>
            )}
          </div>
        </div>
        <p className="text-sm font-semibold text-zinc-500">
          {refugio.zona || "Sin zona"} {refugio.municipio ? `· ${refugio.municipio}` : ""}
        </p>
        {!refugio.confirmado ? (
          <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            Pendiente
          </span>
        ) : null}
      </header>

      {refugio.saturado && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-red-800">
            <span aria-hidden>🛑</span>
            Refugio Saturado
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-red-900">
            Este refugio ha alcanzado su capacidad máxima. Por favor, busca otras opciones por ahora.
          </p>
        </div>
      )}

      {refugio.num_personas != null && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-900">
          <span aria-hidden className="text-lg">👥</span>
          {refugio.num_personas} personas alojadas
        </div>
      )}

      <div className="mb-4 space-y-2 text-sm text-zinc-700">
        <p className="leading-snug">
          {refugio.direccion || refugio.referencia_lugar || "Sin dirección específica"}
        </p>
        {refugio.contacto_nombre ? (
          <p className="text-xs text-zinc-500">Contacto: {refugio.contacto_nombre}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {refugio.google_maps_url ? (
            <a
              href={refugio.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
            >
              Ver mapa
            </a>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">
          Necesidades
        </h3>
        {refugio.necesidades ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
            {refugio.necesidades}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No se han reportado necesidades específicas.</p>
        )}
      </div>

      {refugio.necesidades ? (
        <CopyTextButton
          text={formatRefugioPlainText(refugio)}
          label="Copiar reporte para WhatsApp/SMS"
        />
      ) : null}
    </article>
  );
}
