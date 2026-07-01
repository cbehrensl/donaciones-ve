"use client";

import Link from "next/link";
import { useState } from "react";
import { HubModal } from "@/components/HubModal";
import { SpotlightTour } from "@/components/SpotlightTour";
import type { ContactoEmergencia, DataLoadError } from "@/lib/types";

interface HomeClientProps {
  contactosEmergencia: ContactoEmergencia[];
  errors: DataLoadError[];
  donationsSlot?: React.ReactNode;
  psychologicalSupportSlot?: React.ReactNode;
}

type HubModalId = "donations" | "psychological" | "emergency";

interface HubNavCardProps {
  id: string;
  href?: string;
  onClick?: () => void;
  icon: string;
  iconBgClass: string;
  hoverAccentClass: string;
  title: string;
  description: string;
  badge?: number;
}

function HubNavCard({
  id,
  href,
  onClick,
  icon,
  iconBgClass,
  hoverAccentClass,
  title,
  description,
  badge,
}: HubNavCardProps) {
  const className =
    "group flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md active:scale-[0.99]";

  const content = (
    <>
      <div
        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${iconBgClass}`}
      >
        {icon}
        {badge !== undefined && badge > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-black text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm leading-snug text-zinc-600">{description}</p>
      </div>
      <div
        className={`shrink-0 text-zinc-300 transition group-hover:translate-x-1 ${hoverAccentClass}`}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </>
  );

  if (href) {
    return (
      <Link id={id} href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button id={id} type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

const HUB_OPTIONS = [
  {
    id: "centros" as const,
    href: "/centros",
    icon: "📦",
    iconBgClass: "bg-blue-50",
    hoverAccentClass: "group-hover:text-blue-500",
    title: "Centros de acopio",
    description: "Busca centros, revisa necesidades y gestiona tu centro.",
  },
  {
    id: "mapa" as const,
    href: "/mapa",
    icon: "🗺️",
    iconBgClass: "bg-teal-50",
    hoverAccentClass: "group-hover:text-teal-500",
    title: "Mapa interactivo",
    description: "Ve puntos de ayuda cercanos en el mapa.",
  },
  {
    id: "refugios" as const,
    href: "/refugios",
    icon: "🏠",
    iconBgClass: "bg-purple-50",
    hoverAccentClass: "group-hover:text-purple-500",
    title: "Refugios",
    description: "Encuentra espacios habilitados y lo que necesitan.",
  },
  {
    id: "donations" as const,
    modal: "donations" as const,
    icon: "💛",
    iconBgClass: "bg-amber-50",
    hoverAccentClass: "group-hover:text-amber-500",
    title: "Donar dinero",
    description: "Aporta a organizaciones verificadas de forma segura.",
  },
  {
    id: "psychological" as const,
    modal: "psychological" as const,
    icon: "🧠",
    iconBgClass: "bg-violet-50",
    hoverAccentClass: "group-hover:text-violet-500",
    title: "Ayuda psicológica",
    description: "Recibe apoyo emocional en plataformas verificadas.",
  },
  {
    id: "emergency" as const,
    modal: "emergency" as const,
    icon: "🆘",
    iconBgClass: "bg-red-50",
    hoverAccentClass: "group-hover:text-red-500",
    title: "Emergencias y desaparecidos",
    description: "Llama a contactos útiles y busca personas desaparecidas.",
  },
] as const;

export function HomeClient({
  contactosEmergencia,
  errors,
  donationsSlot,
  psychologicalSupportSlot,
}: HomeClientProps) {
  const [activeModal, setActiveModal] = useState<HubModalId | null>(null);

  const tourSteps = [
    {
      targetId: "tour-hub-nav",
      title: "Elige según lo que necesitas",
      body: "Cada tarjeta te lleva directo a una acción concreta dentro de la plataforma.",
    },
    {
      targetId: "tour-donations",
      title: "Donar dinero",
      body: "Si quieres aportar en efectivo, aquí ves organizaciones verificadas.",
    },
    {
      targetId: "tour-psychological-support",
      title: "Apoyo emocional",
      body: "Si necesitas contención, aquí encuentras plataformas de ayuda psicológica.",
    },
    {
      targetId: "tour-emergency-contacts",
      title: "Emergencias",
      body: "Si es urgente, aquí tienes teléfonos útiles y enlaces para buscar personas.",
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

  const emergencyContent = (
    <>
      <p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-relaxed text-red-900">
        Si estás en peligro inmediato, llama primero a emergencias. Aquí
        encontrarás más contactos útiles y sitios para buscar personas.
      </p>

      <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
        <p className="font-semibold">¿Buscas a alguien?</p>
        <p className="mt-1 text-blue-800">
          Entra a uno de estos sitios y sigue sus instrucciones:
        </p>
        <div className="mt-2 flex flex-col gap-1.5 font-black">
          <a
            href="https://venezuelatebusca.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 transition hover:text-blue-700"
          >
            <span>→</span> Venezuela Te Busca
          </a>
          <a
            href="https://venezuelareporta.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 transition hover:text-blue-700"
          >
            <span>→</span> Venezuela Reporta
          </a>
          <a
            href="https://desaparecidosterremotovenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 transition hover:text-blue-700"
          >
            <span>→</span> Desaparecidos Terremoto Venezuela
          </a>
        </div>
      </div>

      {contactosEmergencia.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Por ahora no hay teléfonos de emergencia publicados. Revisa de nuevo
          en unos minutos.
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
                    className="flex-1 rounded-lg bg-red-700 px-3 py-2.5 text-center text-sm font-bold !text-white transition hover:bg-red-800"
                  >
                    Llamar {telefono}
                  </a>
                ))}
                {contacto.whatsapp ? (
                  <a
                    href={whatsappHref(contacto.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Apoyo Venezuela
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-lg">
          ¿Qué necesitas hoy? Toca una opción para encontrar ayuda rápido.
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

      <div id="tour-hub-nav" className="mb-2 flex flex-col gap-3">
          {HUB_OPTIONS.map((option) => {
            const cardId =
              option.id === "donations"
                ? "tour-donations"
                : option.id === "psychological"
                  ? "tour-psychological-support"
                  : option.id === "emergency"
                    ? "tour-emergency-contacts"
                    : undefined;

            const commonProps = {
              id: cardId ?? `hub-card-${option.id}`,
              icon: option.icon,
              iconBgClass: option.iconBgClass,
              hoverAccentClass: option.hoverAccentClass,
              title: option.title,
              description: option.description,
              badge:
                option.id === "emergency"
                  ? contactosEmergencia.length
                  : undefined,
            };

            if ("href" in option && option.href) {
              return (
                <div key={option.id}>
                  <HubNavCard {...commonProps} href={option.href} id={commonProps.id} />
                </div>
              );
            }

            return (
              <div key={option.id}>
                <HubNavCard
                  {...commonProps}
                  id={commonProps.id}
                  onClick={() => {
                    if ("modal" in option && option.modal) {
                      setActiveModal(option.modal);
                    }
                  }}
                />
              </div>
            );
          })}
      </div>

      <footer className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs leading-relaxed text-zinc-500 sm:text-left">
        <p>
          La información la envían personas y centros de la comunidad. Confirma
          los datos antes de ir o donar.
        </p>
        <div className="mt-3 flex flex-col items-center gap-2 sm:items-start">
          <Link
            href="/desarrolladores"
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            API pública para desarrolladores
          </Link>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 font-semibold text-zinc-500 transition hover:text-zinc-700 hover:underline"
          >
            <span aria-hidden>⚙️</span>
            Acceso para moderadores
          </Link>
        </div>
      </footer>

      <HubModal
        open={activeModal === "donations"}
        title="Quiero donar dinero"
        description="Elige una organización verificada. Al tocar, saldrás a su sitio o WhatsApp para completar tu aporte."
        onClose={() => setActiveModal(null)}
      >
        {donationsSlot}
      </HubModal>

      <HubModal
        open={activeModal === "psychological"}
        title="Necesito apoyo emocional"
        description="Estas plataformas están verificadas. Tócalas para hablar con alguien o pedir contención."
        onClose={() => setActiveModal(null)}
      >
        {psychologicalSupportSlot}
      </HubModal>

      <HubModal
        open={activeModal === "emergency"}
        title="Es una emergencia"
        description="Contactos útiles y sitios para buscar personas. Toca para llamar o abrir cada opción."
        onClose={() => setActiveModal(null)}
      >
        {emergencyContent}
      </HubModal>

      <SpotlightTour steps={tourSteps} />
    </div>
  );
}
