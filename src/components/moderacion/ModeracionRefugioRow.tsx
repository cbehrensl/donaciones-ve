import { SnackbarForm } from "@/components/SnackbarForm";
import { formatWhatsappHref } from "@/lib/contact-links";
import type { Refugio } from "@/lib/types";
import {
  activarRefugioModeracion,
  actualizarConfirmacionRefugioModeracion,
  actualizarDetallesRefugioModeracion,
  actualizarSaturacionRefugioModeracion,
  ocultarRefugioModeracion,
} from "@/app/moderacion/actions";

interface ModeracionRefugioRowProps {
  refugio: Refugio;
  token: string;
  estadoNombre: string | null;
}

export function ModeracionRefugioRow({
  refugio,
  token,
  estadoNombre,
}: ModeracionRefugioRowProps) {
  const whatsappHref = refugio.contacto_telefono
    ? formatWhatsappHref(refugio.contacto_telefono)
    : null;

  return (
    <article id={`refugio-${refugio.id}`} className="scroll-mt-24">
      <div className="px-4 pt-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="text-sm font-bold text-zinc-900">{refugio.nombre}</h2>
            {!refugio.confirmado ? (
              <span className="rounded-full border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Pendiente
              </span>
            ) : null}
            {refugio.saturado ? (
              <span className="rounded-full border border-red-300 px-2 py-0.5 text-[10px] font-bold text-red-700">
                Saturado
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {refugio.zona || "Sin zona"}
            {refugio.municipio ? ` · ${refugio.municipio}` : ""}
            {estadoNombre ? ` · ${estadoNombre}` : ""}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {refugio.direccion || refugio.referencia_lugar || "Sin dirección específica"}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              refugio.activo
                ? "border-emerald-300 text-emerald-800"
                : "border-zinc-300 text-zinc-600"
            }`}
          >
            {refugio.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <details className="border-b border-zinc-100">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-zinc-600">
          Gestionar · {refugio.necesidades ? "con necesidades" : "sin necesidades"}
          {refugio.num_personas != null ? ` · ${refugio.num_personas} personas` : ""}
        </summary>
        <div className="space-y-3 px-4 pb-4">
          {refugio.necesidades ? (
            <p className="text-sm text-zinc-700">
              <span className="font-bold">Necesidades:</span> {refugio.necesidades}
            </p>
          ) : null}
          {refugio.num_personas != null ? (
            <p className="text-sm text-zinc-600">
              {refugio.num_personas} personas alojadas
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-emerald-300 px-4 text-sm font-bold text-emerald-800"
              >
                WhatsApp
              </a>
            ) : null}
            {refugio.google_maps_url ? (
              <a
                href={refugio.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-blue-300 px-4 text-sm font-bold text-blue-800"
              >
                Ver mapa
              </a>
            ) : null}
          </div>

          <SnackbarForm action={actualizarSaturacionRefugioModeracion} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="refugioId" value={refugio.id} />
            <input
              type="hidden"
              name="saturado"
              value={refugio.saturado ? "false" : "true"}
            />
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-lg border border-red-300 px-4 text-sm font-bold text-red-700"
            >
              {refugio.saturado ? "Quitar saturación" : "Marcar como saturado"}
            </button>
          </SnackbarForm>

          <SnackbarForm
            action={actualizarDetallesRefugioModeracion}
            className="space-y-2 rounded-lg border border-zinc-200 p-3"
          >
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="refugioId" value={refugio.id} />
            <label className="block text-xs font-bold text-zinc-600">
              Nombre
              <input
                name="nombre"
                defaultValue={refugio.nombre}
                required
                className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-600">
              Zona
              <input
                name="zona"
                defaultValue={refugio.zona ?? ""}
                className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-600">
              Municipio
              <input
                name="municipio"
                defaultValue={refugio.municipio ?? ""}
                className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-600">
              Dirección
              <input
                name="direccion"
                defaultValue={refugio.direccion ?? ""}
                className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-zinc-600">
              Referencia
              <input
                name="referencia_lugar"
                defaultValue={refugio.referencia_lugar ?? ""}
                className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-bold text-zinc-600">
                Contacto
                <input
                  name="contacto_nombre"
                  defaultValue={refugio.contacto_nombre ?? ""}
                  className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                />
              </label>
              <label className="text-xs font-bold text-zinc-600">
                Teléfono
                <input
                  name="contacto_telefono"
                  defaultValue={refugio.contacto_telefono ?? ""}
                  className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-zinc-600">
              Necesidades
              <textarea
                name="necesidades"
                defaultValue={refugio.necesidades ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-bold text-zinc-600">
                Personas alojadas
                <input
                  name="num_personas"
                  type="number"
                  min={0}
                  defaultValue={refugio.num_personas ?? ""}
                  className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                />
              </label>
              <label className="text-xs font-bold text-zinc-600">
                Link Maps
                <input
                  name="google_maps_url"
                  type="url"
                  defaultValue={refugio.google_maps_url ?? ""}
                  className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                />
              </label>
            </div>
            <input type="hidden" name="estado_id" value={refugio.estado_id ?? ""} />
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg bg-zinc-800 px-4 text-sm font-bold text-white"
            >
              Guardar cambios
            </button>
          </SnackbarForm>
        </div>
      </details>

      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row">
        {refugio.activo ? (
          <>
            <SnackbarForm action={actualizarConfirmacionRefugioModeracion} className="w-full sm:flex-1">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="refugioId" value={refugio.id} />
              <input
                type="hidden"
                name="confirmado"
                value={refugio.confirmado ? "false" : "true"}
              />
              <button
                type="submit"
                className={`min-h-11 w-full rounded-lg px-4 text-sm font-bold ${
                  refugio.confirmado
                    ? "border border-zinc-300 text-zinc-700"
                    : "bg-purple-800 text-white"
                }`}
              >
                {refugio.confirmado ? "Quitar confirmación" : "Confirmar refugio"}
              </button>
            </SnackbarForm>
            <SnackbarForm action={ocultarRefugioModeracion} className="w-full sm:flex-1">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="refugioId" value={refugio.id} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg border border-red-300 px-4 text-sm font-bold text-red-700"
              >
                Ocultar
              </button>
            </SnackbarForm>
          </>
        ) : (
          <SnackbarForm action={activarRefugioModeracion} className="w-full">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="refugioId" value={refugio.id} />
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg border border-emerald-300 px-4 text-sm font-bold text-emerald-800"
            >
              Activar refugio
            </button>
          </SnackbarForm>
        )}
      </div>
    </article>
  );
}
