import Link from "next/link";
import { StaffNav } from "@/components/navigation/StaffNav";
import { getEstados } from "@/lib/data";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";
import { crearRefugioStaff } from "./actions";

interface NuevoRefugioStaffPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export const revalidate = 0;

export default async function NuevoRefugioStaffPage({
  searchParams,
}: NuevoRefugioStaffPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const hasToken = Boolean(getModeratorAccessToken());
  const isAuthorized = isModeratorTokenValid(token);

  if (!hasToken || !isAuthorized) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-zinc-900">Acceso staff</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Entra desde el hub staff para registrar refugios.
          </p>
          <Link
            href="/staff"
            className="mt-4 inline-flex rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-bold text-white"
          >
            Ir al hub staff
          </Link>
        </section>
      </main>
    );
  }

  const estados = await getEstados();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <StaffNav token={token} />

      <header className="mb-6 border-b border-zinc-200 pb-4">
        <p className="text-sm font-black uppercase tracking-wide text-purple-700">
          Registro staff
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
          Crear refugio
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Agrega un refugio activo para que aparezca en el directorio público y
          en el mapa.
        </p>
      </header>

      {params.error ? (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </section>
      ) : null}

      <form
        action={crearRefugioStaff}
        className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <input type="hidden" name="token" value={token} />

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold">
              Nombre del refugio
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Ej. Refugio Escuela Municipal"
            />
          </div>

          <div>
            <label htmlFor="zona" className="mb-1.5 block text-sm font-bold">
              Zona
            </label>
            <input
              id="zona"
              name="zona"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Ej. Sur, Centro, Parroquia..."
            />
          </div>

          <div>
            <label htmlFor="municipio" className="mb-1.5 block text-sm font-bold">
              Municipio
            </label>
            <input
              id="municipio"
              name="municipio"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="estado_id" className="mb-1.5 block text-sm font-bold">
              Estado
            </label>
            <select
              id="estado_id"
              name="estado_id"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              defaultValue=""
            >
              <option value="">Sin estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="num_personas" className="mb-1.5 block text-sm font-bold">
              Personas alojadas
            </label>
            <input
              id="num_personas"
              name="num_personas"
              type="number"
              min="0"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Opcional"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="direccion" className="mb-1.5 block text-sm font-bold">
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Dirección completa"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="referencia_lugar"
              className="mb-1.5 block text-sm font-bold"
            >
              Referencia del lugar
            </label>
            <input
              id="referencia_lugar"
              name="referencia_lugar"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Frente a..., al lado de..."
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="google_maps_url"
              className="mb-1.5 block text-sm font-bold"
            >
              Link de Google Maps
            </label>
            <input
              id="google_maps_url"
              name="google_maps_url"
              type="url"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contacto_nombre"
              className="mb-1.5 block text-sm font-bold"
            >
              Contacto público / Responsable
            </label>
            <input
              id="contacto_nombre"
              name="contacto_nombre"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Nombre de referencia"
            />
          </div>

          <div>
            <label
              htmlFor="contacto_telefono"
              className="mb-1.5 block text-sm font-bold"
            >
              WhatsApp de contacto
            </label>
            <input
              id="contacto_telefono"
              name="contacto_telefono"
              type="tel"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="0414-1234567"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="necesidades" className="mb-1.5 block text-sm font-bold">
              Necesidades
            </label>
            <textarea
              id="necesidades"
              name="necesidades"
              rows={3}
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Agua, colchonetas, medicamentos..."
            />
          </div>
        </section>

        <section className="flex flex-wrap gap-4 rounded-xl bg-zinc-50 p-3 text-sm">
          <label className="inline-flex items-center gap-2 font-semibold text-zinc-700">
            <input type="checkbox" name="confirmado" defaultChecked className="h-4 w-4" />
            Confirmado
          </label>
          <label className="inline-flex items-center gap-2 font-semibold text-zinc-700">
            <input type="checkbox" name="activo" defaultChecked className="h-4 w-4" />
            Activo públicamente
          </label>
          <label className="inline-flex items-center gap-2 font-semibold text-red-700">
            <input type="checkbox" name="saturado" className="h-4 w-4" />
            Saturado
          </label>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            className="rounded-lg bg-purple-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
          >
            Crear refugio
          </button>
          <Link
            href={`/staff?${new URLSearchParams({ token }).toString()}`}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
