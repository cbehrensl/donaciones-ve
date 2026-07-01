"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface StaffNavProps {
  token: string;
}

function withToken(path: string, token: string): string {
  return `${path}?${new URLSearchParams({ token }).toString()}`;
}

export function StaffNav({ token }: StaffNavProps) {
  const pathname = usePathname();

  const isHub = pathname === "/staff";
  const isModeracion = pathname === "/moderacion";
  const isDonaciones = pathname === "/staff/donaciones";
  const isNuevoRefugio = pathname === "/staff/refugios/nuevo";

  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label="Ubicación staff"
        className="flex flex-wrap items-center gap-1.5 text-sm"
      >
        <Link
          href="/"
          className="font-semibold text-zinc-500 transition hover:text-zinc-900"
        >
          Inicio
        </Link>
        <span aria-hidden className="text-zinc-300">
          ›
        </span>
        {isHub ? (
          <span className="font-semibold text-zinc-900">Panel staff</span>
        ) : (
          <Link
            href={withToken("/staff", token)}
            className="font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            Panel staff
          </Link>
        )}
        {isModeracion && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">Moderación</span>
          </>
        )}
        {isDonaciones && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">Links de ayuda</span>
          </>
        )}
        {isNuevoRefugio && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">Crear refugio</span>
          </>
        )}
      </nav>

      {!isModeracion ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={withToken("/moderacion", token)}
            className="min-h-11 inline-flex items-center text-sm font-semibold text-zinc-600"
          >
            Moderación
          </Link>
          {!isDonaciones ? (
            <Link
              href={withToken("/staff/donaciones", token)}
              className="min-h-11 inline-flex items-center text-sm font-semibold text-zinc-600"
            >
              Links de ayuda
            </Link>
          ) : null}
          {!isNuevoRefugio ? (
            <Link
              href={withToken("/staff/refugios/nuevo", token)}
              className="min-h-11 inline-flex items-center text-sm font-semibold text-zinc-600"
            >
              Crear refugio
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
