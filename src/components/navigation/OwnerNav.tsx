"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function OwnerNav() {
  const pathname = usePathname();

  const isHub = pathname === "/responsables";
  const isRegister = pathname === "/centros/nuevo";
  const isLogin = pathname === "/gestion";
  const isPanel = /^\/gestion\/.+/.test(pathname);

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <nav
        aria-label="Ubicación"
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
          <span className="font-semibold text-zinc-900">
            Gestiona tu centro
          </span>
        ) : (
          <Link
            href="/responsables"
            className="font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            Gestiona tu centro
          </Link>
        )}
        {isRegister && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">
              Registrar centro
            </span>
          </>
        )}
        {isLogin && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">Ingresar código</span>
          </>
        )}
        {isPanel && (
          <>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <Link
              href="/gestion"
              className="font-semibold text-zinc-500 transition hover:text-zinc-900"
            >
              Ingresar código
            </Link>
            <span aria-hidden className="text-zinc-300">
              ›
            </span>
            <span className="font-semibold text-zinc-900">Mi centro</span>
          </>
        )}
      </nav>

    </div>
  );
}
