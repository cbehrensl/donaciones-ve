"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarRefugioPublico } from "./actions";
import type { Estado } from "@/lib/types";

interface NuevoRefugioFormProps {
  estados: Estado[];
  supabaseConfigured: boolean;
  supabaseServiceConfigured: boolean;
}

export function NuevoRefugioForm({
  estados,
  supabaseConfigured,
  supabaseServiceConfigured,
}: NuevoRefugioFormProps) {
  const [result, formAction, isPending] = useActionState(
    registrarRefugioPublico,
    null,
  );

  if (result?.ok && result.codigo) {
    return (
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-12">
        <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            🎉
          </div>
          <h1 className="text-2xl font-black text-emerald-900 sm:text-3xl">
            ¡Refugio registrado!
          </h1>
          <p className="mt-4 text-base leading-relaxed text-emerald-800">
            Guarda este código secreto. Lo necesitarás para actualizar las
            necesidades, datos de contacto o marcar el refugio como inactivo.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border-2 border-emerald-300 bg-white p-6 shadow-inner">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Tu código de gestión
            </p>
            <p className="mt-2 font-mono text-3xl font-black tracking-widest text-zinc-900">
              {result.codigo}
            </p>
          </div>

          <p className="mt-6 text-sm font-bold text-emerald-700">
            ⚠️ No compartas este código públicamente.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/refugios"
              className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 sm:w-auto"
            >
              Ver refugios activos
            </Link>
            <Link
              href="/refugios/gestion"
              className="w-full rounded-xl border-2 border-emerald-200 bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 sm:w-auto"
            >
              Probar mi código
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold">Registrar refugio</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Completa los datos del refugio y del responsable. Recibirás un código
          secreto para administrarlo.
        </p>
      </header>

      {!supabaseConfigured ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta configurar Supabase en <code>.env.local</code>. Los estados se
          cargan desde la base de datos real.
        </section>
      ) : !supabaseServiceConfigured ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Los estados ya vienen de Supabase, pero falta{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> para registrar refugios.
        </section>
      ) : null}

      {result && !result.ok ? (
        <section className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {result.message}
        </section>
      ) : null}

      <form action={formAction} className="space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Ubicación</legend>

          <div>
            <label htmlFor="estado_id" className="mb-1.5 block text-sm font-bold">
              Estado
            </label>
            <select
              id="estado_id"
              name="estado_id"
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
            <label htmlFor="municipio" className="mb-1.5 block text-sm font-bold">
              Municipio
            </label>
            <input
              id="municipio"
              name="municipio"
              required
              placeholder="Ej. Chacao"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="zona" className="mb-1.5 block text-sm font-bold">
              Zona / Parroquia
            </label>
            <input
              id="zona"
              name="zona"
              required
              placeholder="Ej. Altamira"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold">
              Nombre del refugio
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Escuela Municipal"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="direccion"
              className="mb-1.5 block text-sm font-bold"
            >
              Dirección exacta
            </label>
            <input
              id="direccion"
              name="direccion"
              required
              placeholder="Calle, avenida, número..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="referencia_lugar"
              className="mb-1.5 block text-sm font-bold"
            >
              Punto de referencia (opcional)
            </label>
            <input
              id="referencia_lugar"
              name="referencia_lugar"
              placeholder="Frente a la plaza, al lado de..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="google_maps_url"
              className="mb-1.5 block text-sm font-bold"
            >
              Link de ubicación en Maps (opcional)
            </label>
            <input
              id="google_maps_url"
              name="google_maps_url"
              type="url"
              placeholder="https://maps.google.com/..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Ayuda mucho a que las personas lleguen fácilmente.
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">Detalles y Necesidades</legend>

          <div>
            <label htmlFor="num_personas" className="mb-1.5 block text-sm font-bold">
              Personas alojadas actualmente (opcional)
            </label>
            <input
              id="num_personas"
              name="num_personas"
              type="number"
              min="0"
              placeholder="Ej. 50"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="necesidades" className="mb-1.5 block text-sm font-bold">
              Necesidades actuales
            </label>
            <textarea
              id="necesidades"
              name="necesidades"
              rows={3}
              placeholder="Agua potable, colchonetas, comida no perecedera..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Podrás actualizar esto más adelante usando tu código de gestión.
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">
            Datos del responsable
          </legend>
          <p className="mb-4 text-xs text-zinc-500">
            Estos datos serán públicos para que las personas puedan contactarte.
          </p>

          <div>
            <label
              htmlFor="responsable_nombre"
              className="mb-1.5 block text-sm font-bold"
            >
              Nombre completo
            </label>
            <input
              id="responsable_nombre"
              name="responsable_nombre"
              required
              placeholder="Tu nombre y apellido"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="responsable_telefono"
              className="mb-1.5 block text-sm font-bold"
            >
              Teléfono / WhatsApp
            </label>
            <input
              id="responsable_telefono"
              name="responsable_telefono"
              required
              type="tel"
              placeholder="0414-1234567"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={isPending || !supabaseServiceConfigured}
            className="w-full rounded-xl bg-purple-700 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-purple-800 disabled:opacity-50 sm:w-auto"
          >
            {isPending ? "Registrando..." : "Registrar refugio"}
          </button>
          <Link
            href="/refugios"
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-6 py-3.5 text-center text-base font-bold text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
