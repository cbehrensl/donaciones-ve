"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { crearCocina } from "@/app/cocinas/nuevo/actions";
import { CopyTextButton } from "@/components/CopyTextButton";
import type { CrearCocinaResult, Estado, Municipio } from "@/lib/types";

interface NuevaCocinaFormProps {
  estados: Estado[];
  municipios: Municipio[];
  supabaseConfigured: boolean;
}

export function NuevaCocinaForm({
  estados,
  municipios,
  supabaseConfigured,
}: NuevaCocinaFormProps) {
  const [estadoId, setEstadoId] = useState("");
  const [result, setResult] = useState<CrearCocinaResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const municipiosFiltrados = useMemo(
    () => municipios.filter((m) => m.estado_id === estadoId),
    [municipios, estadoId],
  );

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await crearCocina(formData);
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <header className="mb-6 border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-bold text-blue-800">Cocina registrada</h1>
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
          <CopyTextButton text={result.codigoGestion} label="Copiar código de gestión" />
        </section>

        <section className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-bold">Registro guardado correctamente</p>
          <p className="mt-1">
            Tu cocina está <strong>pendiente de verificación</strong> y no aparece
            aún en el directorio público de /cocinas.
          </p>
        </section>

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-bold text-zinc-900">¿Qué hago ahora?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
            <li>Guarda tu código de gestión en un lugar seguro.</li>
            <li>Agrega al menos 3 ingredientes que necesitas en tu panel.</li>
            <li>Espera la verificación de un moderador.</li>
            <li>Cuando estés verificada, los productores podrán verte en búsqueda.</li>
          </ol>
        </section>

        <div className="space-y-3 text-sm text-zinc-700">
          <p>
            Usa el panel de administración con tu código — no hace falta buscarte
            en el directorio público mientras estés pendiente.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/cocinas/${result.cocinaId}?codigo=${encodeURIComponent(result.codigoGestion)}`}
            className="rounded-lg bg-blue-800 px-4 py-3 text-center text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900"
          >
            Administrar mi cocina
          </Link>
          <Link
            href="/alimentacion/gestion"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-bold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Volver a ingresar con código
          </Link>
          <Link
            href="/cocinas"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Ver directorio público
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold">Registrar cocina</h1>
          <p className="mt-2 text-sm text-zinc-600">
          Registra tu cocina para conectarte con productores que
          pueden aportarte los insumos que necesitas. Recibirás un código para
          gestionar tus necesidades.
        </p>
      </header>

      {!supabaseConfigured ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta configurar Supabase en <code>.env.local</code>.
        </section>
      ) : null}

      {result && !result.ok ? (
        <section className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {result.message}
        </section>
      ) : null}

      <form action={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Información de la cocina</legend>

          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold">
              Nombre de la cocina
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Cocina Barrio Sucre"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1.5 block text-sm font-bold">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              placeholder="Cuéntanos sobre tu cocina: cuántas personas alimentas, a qué comunidades sirves..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="contacto" className="mb-1.5 block text-sm font-bold">
              Contacto público (opcional)
            </label>
            <input
              id="contacto"
              name="contacto"
              placeholder="Teléfono visible para coordinadores"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="capacidad_beneficiarios" className="mb-1.5 block text-sm font-bold">
              Beneficiarios diarios (opcional)
            </label>
            <input
              id="capacidad_beneficiarios"
              name="capacidad_beneficiarios"
              type="number"
              min="1"
              placeholder="Ej. 150"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Cuántas personas alimentas aproximadamente por día.
            </p>
          </div>
        </fieldset>

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
            <label htmlFor="municipio_id" className="mb-1.5 block text-sm font-bold">
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
                {estadoId ? "Selecciona municipio" : "Primero elige un estado"}
              </option>
              {municipiosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="direccion" className="mb-1.5 block text-sm font-bold">
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              required
              placeholder="Calle, referencia, sector"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="ubicacion_url" className="mb-1.5 block text-sm font-bold">
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
          </div>

          <div>
            <label htmlFor="horario" className="mb-1.5 block text-sm font-bold">
              Horario de operación (opcional)
            </label>
            <input
              id="horario"
              name="horario"
              placeholder="Ej. Lunes a viernes 7:00 a.m. a 2:00 p.m."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Datos del responsable</legend>
          <p className="text-xs text-zinc-500">
            Solo para contacto interno. No se muestran públicamente.
          </p>

          <div>
            <label htmlFor="responsable_nombre" className="mb-1.5 block text-sm font-bold">
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
            <label htmlFor="responsable_telefono" className="mb-1.5 block text-sm font-bold">
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
          disabled={isPending || !supabaseConfigured}
          className="w-full rounded-lg bg-blue-800 px-4 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900 disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar cocina"}
        </button>
      </form>
    </div>
  );
}
