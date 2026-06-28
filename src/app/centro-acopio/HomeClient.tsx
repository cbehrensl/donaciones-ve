"use client";

import Link from "next/link";
import { useState } from "react";
import { CentroCard } from "@/components/CentroCard";
import { FiltroGeografico } from "@/components/FiltroGeografico";
import { SpotlightTour } from "@/components/SpotlightTour";
import type {
  CentroAcopio,
  ContactoEmergencia,
  DataLoadError,
  Estado,
  HomeSearchFilters,
  HomeSearchMeta,
  Municipio,
} from "@/lib/types";

interface HomeClientProps {
  estados: Estado[];
  municipios: Municipio[];
  centros: CentroAcopio[];
  contactosEmergencia: ContactoEmergencia[];
  initialFilters: HomeSearchFilters;
  searchMeta: HomeSearchMeta;
  errors: DataLoadError[];
  pais?: string;
}

export function HomeClient({
  estados,
  municipios,
  centros,
  contactosEmergencia,
  initialFilters,
  searchMeta,
  errors,
  pais = "VE",
}: HomeClientProps) {
  const [estadoId, setEstadoId] = useState(initialFilters.estadoId);
  const [municipioId, setMunicipioId] = useState(initialFilters.municipioId);
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const tourSteps = [
    {
      targetId: "tour-actions",
      title: "Acciones principales",
      body: "Registra un centro, administra uno existente con su código o entra al panel de moderación si tienes clave.",
    },
    {
      targetId: "tour-emergency-contacts",
      title: "Información útil",
      body: "Aquí verás teléfonos de emergencia y enlaces para reportar o buscar personas desaparecidas en plataformas solidarias.",
    },
    {
      targetId: "tour-filters",
      title: "Filtra por ubicación",
      body: "Elige un estado y luego un municipio para encontrar rápidamente centros cercanos.",
    },
    {
      targetId: "tour-results",
      title: "Revisa centros y necesidades",
      body: "Cada tarjeta muestra dirección, contacto, necesidades y si el centro ya fue verificado.",
    },
    {
      targetId: "tour-share",
      title: "Comparte con poco consumo",
      body: "Puedes copiar la información en texto plano para enviarla por WhatsApp o SMS.",
    },
  ];

  const handleEstadoChange = (newEstadoId: string) => {
    setEstadoId(newEstadoId);
    setMunicipioId("");
  };

  const municipioNombre = municipioId
    ? municipios.find((item) => item.id === municipioId)?.nombre
    : null;
  const estadoNombre = estadoId
    ? estados.find((item) => item.id === estadoId)?.nombre
    : null;

  let textoResultados = " en total";
  if (municipioNombre) {
    textoResultados = ` en ${municipioNombre}`;
  } else if (estadoNombre) {
    textoResultados = ` en ${estadoNombre}`;
  }

  const telefonosHref = (telefono: string) =>
    `tel:${telefono.replace(/[^\d+]/g, "")}`;
  const whatsappHref = (telefono: string) =>
    `https://wa.me/${telefono.replace(/[^\d]/g, "")}`;
  const categoriaLabel = (categoria: string) =>
    categoria
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-10 text-center sm:text-left">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ background: "#fff3f3", color: "#c0392b", border: "1px solid #f5c6c6" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#e74c3c" }}></span>
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#c0392b" }}></span>
          </span>
          Emergencia Nacional
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "#002858" }}>
          Donaciones Venezuela
        </h1>
        <p className="mt-3 text-lg" style={{ color: "#0084D0" }}>
          Plataforma centralizada para coordinar ayuda humanitaria en tiempo real.
        </p>

      </header>

      {errors.length > 0 ? (
        <section className="mb-6 rounded-xl border p-4 text-sm" style={{ borderColor: "#f5c6c6", background: "#fff3f3", color: "#7b1414" }}>
          <h2 className="mb-2 text-base font-black">
            No pudimos conectar completamente con Supabase
          </h2>
          <p className="mb-3">
            Revisa las variables de entorno configuradas en Vercel y vuelve a
            desplegar si acabas de agregarlas.
          </p>
          <ul className="space-y-1">
            {errors.map((error) => (
              <li key={`${error.scope}-${error.message}`}>
                <strong>{error.scope}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details
        id="tour-emergency-contacts"
        className="mb-8 rounded-xl border shadow-sm"
        style={{ borderColor: "#bdd9f0", background: "#fff" }}
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0084D0" }}>
              Información útil
            </p>
            <h2 className="mt-1 text-lg font-black" style={{ color: "#002858" }}>
              Contactos de emergencia
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed" style={{ color: "#002858" }}>
              Para reportar o buscar personas desaparecidas, visita:{" "}
              <a
                href="https://venezuelatebusca.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black underline"
                style={{ color: "#0084D0" }}
                onClick={(event) => event.stopPropagation()}
              >
                Venezuela Te Busca
              </a>
              ,{" "}
              <a
                href="https://venezuelareporta.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black underline"
                style={{ color: "#0084D0" }}
                onClick={(event) => event.stopPropagation()}
              >
                Venezuela Reporta
              </a>{" "}
              o{" "}
              <a
                href="https://desaparecidosterremotovenezuela.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black underline"
                style={{ color: "#0084D0" }}
                onClick={(event) => event.stopPropagation()}
              >
                Desaparecidos Terremoto Venezuela
              </a>
              .
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#EBF3FB", color: "#002858" }}>
            Ver {contactosEmergencia.length} contactos
          </span>
        </summary>

        {contactosEmergencia.length === 0 ? (
          <p className="mx-4 mb-4 rounded-lg border p-3 text-sm sm:mx-5" style={{ borderColor: "#bdd9f0", background: "#EBF3FB", color: "#002858" }}>
            No hay contactos de emergencia disponibles en Supabase por ahora.
          </p>
        ) : (
          <div className="border-t p-4 sm:p-5" style={{ borderColor: "#EBF3FB" }}>
            <div className="grid gap-3 sm:grid-cols-2">
            {contactosEmergencia.map((contacto) => (
              <article
                key={contacto.id}
                className="rounded-xl border p-3"
                style={{ borderColor: "#bdd9f0", background: "#EBF3FB" }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-black leading-tight" style={{ color: "#002858" }}>
                    {contacto.nombre}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: "#0084D0" }}>
                    {categoriaLabel(contacto.categoria)}
                  </span>
                </div>

                <p className="mb-3 text-xs font-semibold" style={{ color: "#0084D0" }}>
                  {contacto.zona ?? contacto.estado_nombre ?? "Cobertura general"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {contacto.telefonos.map((telefono) => (
                    <a
                      key={`${contacto.id}-${telefono}`}
                      href={telefonosHref(telefono)}
                      className="cta-primary rounded-lg px-3 py-2 text-sm font-bold text-white"
                      style={{ background: "#002858" }}
                    >
                      Llamar {telefono}
                    </a>
                  ))}
                  {contacto.whatsapp ? (
                    <a
                      href={whatsappHref(contacto.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-secondary rounded-lg border px-3 py-2 text-sm font-bold"
                      style={{ borderColor: "#25D366", background: "#f0fdf4", color: "#15803d" }}
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            </div>
          </div>
        )}
      </details>

      {/* Botón toggle solo en mobile */}
      <button
        type="button"
        onClick={() => setFiltrosVisibles((v) => !v)}
        className="sm:hidden mb-3 w-full flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold"
        style={{ borderColor: "#bdd9f0", background: "#fff", color: "#002858" }}
      >
        <span>🔍 Buscar y filtrar</span>
        <span style={{ color: "#0084D0" }}>{filtrosVisibles ? "▲ Ocultar" : "▼ Mostrar"}</span>
      </button>

      <div id="tour-filters" className={`mb-6 px-3 py-3 sm:mx-0 sm:rounded-xl sm:border sm:px-4 sm:py-4 sm:shadow-sm sm:block ${filtrosVisibles ? "block -mx-4 sm:mx-0" : "hidden sm:block"}`} style={{ background: "#fff", borderColor: "#bdd9f0" }}>
        <h2 className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "#0084D0" }}>
          Buscar centros registrados
        </h2>
        {errors.length === 0 && estados.length === 0 ? (
          <p className="mb-2 rounded-lg border p-2 text-xs" style={{ borderColor: "#bdd9f0", background: "#EBF3FB", color: "#002858" }}>
            No se recibieron estados desde Supabase.
          </p>
        ) : null}
        <form action="/centro-acopio" method="get">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              id="busqueda-centros"
              name="q"
              type="search"
              defaultValue={initialFilters.q}
              placeholder="Nombre, dirección o teléfono"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#bdd9f0", color: "#002858", background: "#EBF3FB" }}
            />
            <FiltroGeografico
              estados={estados}
              municipios={municipios}
              estadoId={estadoId}
              municipioId={municipioId}
              estadoName="estado"
              municipioName="municipio"
              onEstadoChange={handleEstadoChange}
              onMunicipioChange={setMunicipioId}
              hideEstado={pais === "CO"}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2" style={{ borderColor: "#EBF3FB" }}>
            <p className="text-xs font-semibold" style={{ color: "#002858" }}>
              <span style={{ color: "#0084D0" }}>
                {searchMeta.totalCount} {searchMeta.totalCount === 1 ? "centro" : "centros"}
                {textoResultados}
              </span>
            </p>
            <div className="flex gap-2">
              <Link
                href="/centro-acopio"
                className="cta-secondary rounded-lg border px-3 py-1.5 text-xs font-bold"
                style={{ borderColor: "#bdd9f0", color: "#002858", background: "#EBF3FB" }}
              >
                Limpiar
              </Link>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                style={{ background: "#0084D0" }}
              >
                Buscar
              </button>
            </div>
          </div>
          {searchMeta.totalCount > searchMeta.pageSize ? (
            <p className="mt-1 text-[10px]" style={{ color: "#0084D0" }}>
              Mostrando {searchMeta.page * searchMeta.pageSize + 1}–{Math.min((searchMeta.page + 1) * searchMeta.pageSize, searchMeta.totalCount)} de {searchMeta.totalCount} centros.
            </p>
          ) : null}
        </form>
      </div>

      <section id="tour-results" aria-live="polite" className="space-y-4">
        {centros.length === 0 ? (
          <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No hay centros registrados en Supabase para esta ubicación.
          </p>
        ) : (
          centros.map((centro) => (
            <CentroCard key={centro.id} centro={centro} />
          ))
        )}
      </section>

      {(searchMeta.hasPrevPage || searchMeta.hasNextPage) && (
        <nav className="mt-6 flex items-center justify-between gap-4">
          {searchMeta.hasPrevPage ? (
            <Link
              href={`/centro-acopio?q=${initialFilters.q}&estado=${initialFilters.estadoId}&municipio=${initialFilters.municipioId}&page=${searchMeta.page - 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-bold"
              style={{ borderColor: "#bdd9f0", background: "#fff", color: "#002858" }}
            >
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold" style={{ color: "#0084D0" }}>
            Página {searchMeta.page + 1} de {Math.ceil(searchMeta.totalCount / searchMeta.pageSize)}
          </span>
          {searchMeta.hasNextPage ? (
            <Link
              href={`/centro-acopio?q=${initialFilters.q}&estado=${initialFilters.estadoId}&municipio=${initialFilters.municipioId}&page=${searchMeta.page + 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-bold"
              style={{ borderColor: "#bdd9f0", background: "#fff", color: "#002858" }}
            >
              Siguiente →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <footer
        id="tour-share"
        className="mt-8 space-y-2 border-t pt-4 text-xs leading-relaxed"
        style={{ borderColor: "#bdd9f0", color: "#0084D0" }}
      >
        <p>
          Comparte centros por SMS/WhatsApp con el botón de copiar en cada
          tarjeta.
        </p>
        <p>
          La información mostrada es suministrada por usuarios de la aplicación.
          Verifica los datos directamente con cada centro antes de movilizar
          donaciones o tomar decisiones críticas.
        </p>
      </footer>
      <SpotlightTour steps={tourSteps} />
    </div>
  );
}
