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

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
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
            <span className="font-semibold text-zinc-900">
              Centros y alertas
            </span>
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
      </nav>

      <div className="flex shrink-0 items-center gap-3">
        {!isModeracion && (
          <Link
            href={withToken("/moderacion", token)}
            className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-800"
          >
            Centros
          </Link>
        )}
        {!isDonaciones && (
          <Link
            href={withToken("/staff/donaciones", token)}
            className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-800"
          >
            Links de ayuda
          </Link>
        )}
      </div>
    </div>
  );
}
