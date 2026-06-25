"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CentroCard } from "@/components/CentroCard";
import { FiltroGeografico } from "@/components/FiltroGeografico";
import { SpotlightTour } from "@/components/SpotlightTour";
import type { CentroAcopio, Estado, Municipio } from "@/lib/types";

interface HomeClientProps {
  estados: Estado[];
  municipios: Municipio[];
  centros: CentroAcopio[];
}

export function HomeClient({
  estados,
  municipios,
  centros,
}: HomeClientProps) {
  const [estadoId, setEstadoId] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const tourSteps = [
    {
      targetId: "tour-actions",
      title: "Acciones principales",
      body: "Registra un centro, administra uno existente con su código o entra al panel de moderación si tienes clave.",
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

  const centrosFiltrados = useMemo(() => {
    return centros.filter((centro) => {
      if (estadoId) {
        const municipioDelCentro = municipios.find(
          (m) => m.id === centro.municipio_id,
        );
        if (municipioDelCentro?.estado_id !== estadoId) {
          return false;
        }
      }
      if (municipioId && centro.municipio_id !== municipioId) {
        return false;
      }
      return true;
    });
  }, [centros, estadoId, municipioId, municipios]);

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

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-10 text-center sm:text-left">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-600/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
          </span>
          Emergencia Nacional
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Donaciones Venezuela
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Plataforma centralizada para coordinar ayuda humanitaria en tiempo real.
        </p>

        <div id="tour-actions" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/centros/nuevo"
            className="cta-primary flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-blue-900 active:scale-[0.98]"
          >
            <span>+</span> Registrar centro de acopio
          </Link>
          <Link
            href="/gestion"
            className="cta-secondary flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-5 py-4 text-base font-bold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
          >
            <span>⚙️</span> Administrar mi centro
          </Link>
          <Link
            href="/moderacion"
            className="cta-secondary flex items-center justify-center gap-2 rounded-xl border-2 border-blue-100 bg-blue-50 px-5 py-4 text-base font-bold text-blue-900 shadow-sm transition-colors hover:bg-blue-100 active:scale-[0.98]"
          >
            <span>🔐</span> Panel moderador
          </Link>
        </div>
      </header>

      <div id="tour-filters" className="-mx-4 mb-8 bg-zinc-50 px-4 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:border-zinc-200 sm:bg-white sm:p-6 sm:shadow-xl sm:shadow-zinc-200/50">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500 sm:text-xs">
          Buscar centros registrados
        </h2>
        <FiltroGeografico
          estados={estados}
          municipios={municipios}
          estadoId={estadoId}
          municipioId={municipioId}
          onEstadoChange={handleEstadoChange}
          onMunicipioChange={setMunicipioId}
        />
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
          <p className="text-sm font-semibold text-zinc-900">
            {centrosFiltrados.length}{" "}
            <span className="font-medium text-zinc-500">
              {centrosFiltrados.length === 1 ? "centro encontrado" : "centros encontrados"}
              {textoResultados}
            </span>
          </p>
        </div>
      </div>

      <section id="tour-results" aria-live="polite" className="space-y-4">
        {centrosFiltrados.length === 0 ? (
          <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No hay centros registrados en Supabase para esta ubicación.
          </p>
        ) : (
          centrosFiltrados.map((centro) => (
            <CentroCard key={centro.id} centro={centro} />
          ))
        )}
      </section>

      <footer id="tour-share" className="mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
        Comparte centros por SMS/WhatsApp con el botón de copiar en cada tarjeta.
      </footer>
      <SpotlightTour steps={tourSteps} />
    </div>
  );
}
