"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { crearProductor } from "@/app/productores/nuevo/actions";
import { CopyTextButton } from "@/components/CopyTextButton";
import type { CategoriaProductor, CrearProductorResult, Estado, Municipio } from "@/lib/types";

const CATEGORIAS: { value: CategoriaProductor; label: string; desc: string }[] = [
  { value: "proteinas", label: "Proteínas", desc: "Carne, pollo, pescado, huevos" },
  { value: "vegetales", label: "Vegetales", desc: "Verduras, hortalizas, tubérculos" },
  { value: "frutas", label: "Frutas", desc: "Frutas frescas de temporada" },
  { value: "granos", label: "Granos", desc: "Caraotas, lentejas, arvejas, arroz" },
  { value: "lacteos", label: "Lácteos", desc: "Leche, queso, mantequilla" },
  { value: "no_perecederos", label: "No perecederos", desc: "Enlatados, harinas, aceite, azúcar" },
  { value: "otros", label: "Otros", desc: "Especias, condimentos, u otros insumos" },
];

interface NuevoProductorFormProps {
  estados: Estado[];
  municipios: Municipio[];
  supabaseConfigured: boolean;
}

export function NuevoProductorForm({
  estados,
  municipios,
  supabaseConfigured,
}: NuevoProductorFormProps) {
  const [estadoId, setEstadoId] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<CategoriaProductor[]>([]);
  const [result, setResult] = useState<CrearProductorResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const municipiosFiltrados = useMemo(
    () => municipios.filter((m) => m.estado_id === estadoId),
    [municipios, estadoId],
  );

  function toggleCategoria(cat: CategoriaProductor) {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function handleSubmit(formData: FormData) {
    categoriasSeleccionadas.forEach((cat) => formData.append("categorias", cat));
    startTransition(async () => {
      const res = await crearProductor(formData);
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <header className="mb-6 border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-bold text-green-800">Productor registrado</h1>
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
            Tu productor está <strong>pendiente de verificación</strong> y no aparece
            aún en el directorio público.
          </p>
        </section>

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-bold text-zinc-900">¿Qué hago ahora?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
            <li>Guarda tu código de gestión en un lugar seguro.</li>
            <li>Completa tu perfil en el panel de administración.</li>
            <li>Espera la verificación de un moderador.</li>
            <li>Cuando estés verificado, las cocinas podrán verte en el directorio.</li>
          </ol>
        </section>

        <div className="space-y-3 text-sm text-zinc-700">
          <p>
            Los moderadores revisarán tu información en el panel de staff antes de
            publicarla en búsqueda.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/productores/${result.productorId}?codigo=${encodeURIComponent(result.codigoGestion)}`}
            className="rounded-lg bg-emerald-700 px-4 py-3 text-center text-base font-bold text-white shadow-md transition-colors hover:bg-emerald-800"
          >
            Administrar mi productor
          </Link>
          <Link
            href="/productores#demanda"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-bold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Ver cocinas que necesitan
          </Link>
          <Link
            href="/alimentacion/gestion"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Volver a ingresar con código
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold">Registrar productor de alimentos</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Regístrate como productor para conectarte con las cocinas
          que necesitan insumos alimentarios. Recibirás un código para actualizar
          tu información.
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
          <legend className="px-1 text-base font-bold">Información del productor</legend>

          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold">
              Nombre o razón social
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Hacienda La Florida, Agropecuaria Los Andes"
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
              placeholder="Cuéntanos más sobre lo que produces y puedes aportar..."
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
              placeholder="Teléfono o correo visible para coordinadores"
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
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <legend className="px-1 text-base font-bold">¿Qué puedes aportar?</legend>
          <p className="text-xs text-zinc-500">
            Selecciona todas las categorías de alimentos que puedes donar.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIAS.map((cat) => {
              const selected = categoriasSeleccionadas.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategoria(cat.value)}
                  className={`flex flex-col rounded-xl border-2 p-3 text-left transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 text-xs font-black transition-colors ${
                        selected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-zinc-300"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <span className="text-sm font-bold">{cat.label}</span>
                  </div>
                  <p className="ml-7 mt-0.5 text-xs text-zinc-500">{cat.desc}</p>
                </button>
              );
            })}
          </div>

          {categoriasSeleccionadas.length === 0 ? (
            <p className="text-xs font-semibold text-red-700">
              * Selecciona al menos una categoría
            </p>
          ) : null}
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
          disabled={
            isPending ||
            !supabaseConfigured ||
            categoriasSeleccionadas.length === 0
          }
          className="w-full rounded-lg bg-emerald-700 px-4 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-emerald-800 disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar productor"}
        </button>
      </form>
    </div>
  );
}
