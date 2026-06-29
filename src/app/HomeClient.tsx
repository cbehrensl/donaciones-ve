"use client";

import Link from "next/link";
import { SpotlightTour } from "@/components/SpotlightTour";
import type { ContactoEmergencia, DataLoadError } from "@/lib/types";

interface HomeClientProps {
  contactosEmergencia: ContactoEmergencia[];
  errors: DataLoadError[];
  donationsSlot?: React.ReactNode;
}

export function HomeClient({
  contactosEmergencia,
  errors,
  donationsSlot,
}: HomeClientProps) {
  const tourSteps = [
    {
      targetId: "tour-hub-nav",
      title: "Elige qué necesitas",
      body: "Toca una opción: centros de acopio, donar dinero, teléfonos útiles o administrar un centro.",
    },
    {
      targetId: "tour-emergency-contacts",
      title: "Teléfonos útiles",
      body: "Aquí encuentras números de emergencia y enlaces para buscar personas desaparecidas.",
    },
    {
      targetId: "tour-donations",
      title: "Donar dinero",
      body: "Aquí verás organizaciones verificadas. Toca para ver dónde aportar.",
    },
  ];

  const telefonosHref = (telefono: string) =>
    `tel:${telefono.replace(/[^\d+]/g, "")}`;
  const whatsappHref = (telefono: string) =>
    `https://wa.me/${telefono.replace(/[^\d]/g, "")}`;
  const categoriaLabel = (categoria: string) =>
    categoria
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="mb-8 text-center sm:text-left">
        <Link
          href="/staff"
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-inset ring-zinc-200 transition hover:bg-zinc-200 hover:text-zinc-700"
        >
          <span aria-hidden>⚙️</span>
          Moderadores
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Apoyo Venezuela
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Encuentra centros, teléfonos útiles y formas seguras de ayudar.
        </p>
      </header>

      {errors.length > 0 ? (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <h2 className="mb-2 text-base font-black">
            No pudimos cargar toda la información
          </h2>
          <p className="mb-3 text-red-900">
            Intenta de nuevo en unos minutos. Si el problema continúa, avisa al
            equipo de la plataforma.
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

      <div id="tour-hub-nav" className="mb-8 flex flex-col gap-3">
        {/* 1. Buscar centros */}
        <Link
          href="/centros"
          className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
            📦
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-zinc-900">
              Buscar centros de acopio
            </h2>
            <p className="mt-1 text-sm leading-snug text-zinc-600">
              Lista, mapa, alertas y búsqueda rápida en un solo lugar.
            </p>
          </div>
          <div className="shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 2. Donar dinero */}
        <details
          id="tour-donations"
          className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all open:ring-2 open:ring-amber-500/20"
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
              💛
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-zinc-900">Donar dinero</h2>
              <p className="mt-1 text-sm leading-snug text-zinc-600">
                Organizaciones verificadas donde aportar de forma segura.
              </p>
            </div>
            <div className="shrink-0 text-zinc-300 transition group-open:rotate-180 group-hover:text-amber-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 sm:p-5 rounded-b-2xl">
            {donationsSlot}
          </div>
        </details>

        {/* 3. Teléfonos y desaparecidos */}
        <details
          id="tour-emergency-contacts"
          className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all open:ring-2 open:ring-red-500/20"
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl relative">
              🆘
              {contactosEmergencia.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {contactosEmergencia.length}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-zinc-900">
                Teléfonos y desaparecidos
              </h2>
              <p className="mt-1 text-sm leading-snug text-zinc-600">
                Números de emergencia y sitios para buscar personas.
              </p>
            </div>
            <div className="shrink-0 text-zinc-300 transition group-open:rotate-180 group-hover:text-red-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 sm:p-5 rounded-b-2xl">
            <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-semibold">Para buscar personas desaparecidas:</p>
              <div className="mt-2 flex flex-col gap-1.5 font-black">
                <a
                  href="https://venezuelatebusca.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition hover:text-blue-700"
                >
                  <span>→</span> Venezuela Te Busca
                </a>
                <a
                  href="https://venezuelareporta.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition hover:text-blue-700"
                >
                  <span>→</span> Venezuela Reporta
                </a>
                <a
                  href="https://desaparecidosterremotovenezuela.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition hover:text-blue-700"
                >
                  <span>→</span> Desaparecidos Terremoto Venezuela
                </a>
              </div>
            </div>

            {contactosEmergencia.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No hay teléfonos de emergencia disponibles por ahora.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {contactosEmergencia.map((contacto) => (
                  <article
                    key={contacto.id}
                    className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-black leading-tight text-zinc-900">
                        {contacto.nombre}
                      </h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-600">
                        {categoriaLabel(contacto.categoria)}
                      </span>
                    </div>

                    <p className="mb-3 text-xs font-semibold text-zinc-500">
                      {contacto.zona ?? contacto.estado_nombre ?? "Todo el país"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {contacto.telefonos.map((telefono) => (
                        <a
                          key={`${contacto.id}-${telefono}`}
                          href={telefonosHref(telefono)}
                          className="flex-1 rounded-lg bg-red-700 px-3 py-2 text-center text-sm font-bold !text-white transition hover:bg-red-800"
                        >
                          Llamar {telefono}
                        </a>
                      ))}
                      {contacto.whatsapp ? (
                        <a
                          href={whatsappHref(contacto.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </details>

        {/* 4. Tengo un centro */}
        <Link
          href="/responsables"
          className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
            🏢
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-zinc-900">
              Tengo o manejo un centro
            </h2>
            <p className="mt-1 text-sm leading-snug text-zinc-600">
              Registrar un centro nuevo o actualizar el tuyo.
            </p>
          </div>
          <div className="shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7-7" />
            </svg>
          </div>
        </Link>
      </div>

      <footer className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs leading-relaxed text-zinc-500 sm:text-left">
        <p>
          La información la envían personas y centros de la comunidad. Confirma
          los datos antes de ir o donar.
        </p>
      </footer>
      <SpotlightTour steps={tourSteps} />
    </div>
  );
}
