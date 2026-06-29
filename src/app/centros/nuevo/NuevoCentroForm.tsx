"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { crearCentroAcopio } from "@/app/centros/nuevo/actions";
import { CopyTextButton } from "@/components/CopyTextButton";
import type { CrearCentroResult } from "@/lib/types";
import type { Estado, Municipio } from "@/lib/types";

interface NuevoCentroFormProps {
  estados: Estado[];
  municipios: Municipio[];
  supabaseConfigured: boolean;
  supabaseServiceConfigured: boolean;
}

export function NuevoCentroForm({
  estados,
  municipios,
  supabaseConfigured,
  supabaseServiceConfigured,
}: NuevoCentroFormProps) {
  const [estadoId, setEstadoId] = useState("");
  const [result, setResult] = useState<CrearCentroResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const municipiosFiltrados = useMemo(
    () => municipios.filter((m) => m.estado_id === estadoId),
    [municipios, estadoId],
  );

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await crearCentroAcopio(formData);
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <header className="mb-6 border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-bold text-green-800">
            Centro registrado
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Guarda tu código de gestión. No podremos mostrarlo otra vez.
          </p>
        </header>

        <section className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 p-5">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-900">
            Tu código de gestión
          </p>
          <p className="mb-4 font-mono text-2xl font-bold tracking-wider text-zinc-900">
            {result.codigoGestion}
          </p>
          <CopyTextButton
            text={result.codigoGestion}
            label="Copiar código de gestión"
          />
        </section>

        <div className="space-y-3 text-sm text-zinc-700">
          <p>
            Usa este código en{" "}
            <Link href="/gestion" className="font-semibold text-blue-700 transition hover:text-blue-900">
              Administrar mi centro
            </Link>{" "}
            para actualizar necesidades y datos de contacto.
          </p>
          <p>
            Tu centro aparecerá como <strong>pendiente de verificación</strong>{" "}
            hasta revisión de moderadores.
          </p>
          <p>
            Si todavía no agregas insumos específicos, la tarjeta pública dirá
            que <strong>cualquier donación o apoyo será bien recibido</strong>.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/gestion/${result.centroId}?codigo=${encodeURIComponent(result.codigoGestion)}`}
            className="cta-primary rounded-lg bg-blue-800 px-4 py-3 text-center text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900"
          >
            Ir a administrar ahora
          </Link>
          <Link
            href="/responsables"
            className="cta-secondary rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-bold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Ir a responsables
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold">Registrar centro de acopio</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Completa los datos del centro y del responsable. Recibirás un código
          secreto para administrarlo.
        </p>
      </header>

      {!supabaseConfigured ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta configurar Supabase en <code>.env.local</code>. Los estados y
          municipios se cargan desde la base de datos real.
        </section>
      ) : !supabaseServiceConfigured ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Los estados y municipios ya vienen de Supabase, pero falta{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> para registrar centros.
        </section>
      ) : null}

      {result && !result.ok ? (
        <section className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {result.message}
        </section>
      ) : null}

      <form action={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Ubicación</legend>

          <div>
            <label htmlFor="estado" className="mb-1.5 block text-sm font-bold">
              Estado
            </label>
            <select
              id="estado"
              value={estadoId}
              onChange={(e) => setEstadoId(e.target.value)}
              required
              disabled={estados.length === 0}
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            >
              <option value="">Selecciona un estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="municipio_id"
              className="mb-1.5 block text-sm font-bold"
            >
              Municipio
            </label>
            <select
              id="municipio_id"
              name="municipio_id"
              required
              disabled={!estadoId || municipiosFiltrados.length === 0}
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base disabled:bg-zinc-100"
            >
              <option value="">
                {estadoId
                  ? "Selecciona municipio"
                  : "Primero elige un estado"}
              </option>
              {municipiosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold">
              Nombre del centro
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Iglesia San José"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="direccion"
              className="mb-1.5 block text-sm font-bold"
            >
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              required
              placeholder="Calle, referencia, urbanización"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="ubicacion_url"
              className="mb-1.5 block text-sm font-bold"
            >
              Link de ubicación en Maps (opcional)
            </label>
            <input
              id="ubicacion_url"
              name="ubicacion_url"
              type="url"
              inputMode="url"
              placeholder="https://maps.google.com/..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Pega aquí el enlace de Google Maps, Apple Maps o Waze para que
              los donantes puedan abrir la ubicación directamente.
            </p>
          </div>

          <div>
            <label htmlFor="contacto" className="mb-1.5 block text-sm font-bold">
              Contacto público (opcional)
            </label>
            <input
              id="contacto"
              name="contacto"
              placeholder="Teléfono visible para donantes"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="estado_vialidad" className="mb-1.5 block text-sm font-bold">
              Estado de vialidad (opcional)
            </label>
            <input
              id="estado_vialidad"
              name="estado_vialidad"
              placeholder="Transitable, bloqueado, etc."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fecha_inicio_recepcion"
                className="mb-1.5 block text-sm font-bold"
              >
                Fecha inicio de recepción (opcional)
              </label>
              <input
                id="fecha_inicio_recepcion"
                name="fecha_inicio_recepcion"
                type="date"
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label
                htmlFor="fecha_fin_recepcion"
                className="mb-1.5 block text-sm font-bold"
              >
                Fecha fin de recepción (opcional)
              </label>
              <input
                id="fecha_fin_recepcion"
                name="fecha_fin_recepcion"
                type="date"
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="horario_recepcion"
              className="mb-1.5 block text-sm font-bold"
            >
              Horario de recepción (opcional)
            </label>
            <input
              id="horario_recepcion"
              name="horario_recepcion"
              placeholder="Ej. Lun a Sáb de 8:00 a.m. a 5:00 p.m."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Responsable</legend>
          <p className="text-xs text-zinc-500">
            Solo usamos estos datos para contacto interno. No se muestran en la
            vista pública.
          </p>

          <div>
            <label
              htmlFor="responsable_nombre"
              className="mb-1.5 block text-sm font-bold"
            >
              Nombre del responsable
            </label>
            <input
              id="responsable_nombre"
              name="responsable_nombre"
              required
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="responsable_telefono"
              className="mb-1.5 block text-sm font-bold"
            >
              Teléfono del responsable
            </label>
            <input
              id="responsable_telefono"
              name="responsable_telefono"
              type="tel"
              required
              placeholder="0414-1234567"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isPending || !supabaseConfigured || !supabaseServiceConfigured}
          className="w-full rounded-lg bg-blue-800 px-4 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900 disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar centro"}
        </button>
      </form>
    </div>
  );
}
