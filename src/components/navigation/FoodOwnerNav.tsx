"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FoodOwnerNav() {
  const pathname = usePathname();

  const isHub = pathname === "/alimentacion";
  const isLogin = pathname === "/alimentacion/gestion";
  const isRegisterProductor = pathname === "/productores/nuevo";
  const isRegisterCocina = pathname === "/cocinas/nuevo";
  const isProductorPanel = /^\/productores\/[^/]+$/.test(pathname);
  const isCocinaPanel = /^\/cocinas\/[^/]+$/.test(pathname);

  return (
    <nav
      aria-label="Ubicación"
      className="mb-6 flex flex-wrap items-center gap-1.5 text-sm"
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
        <span className="font-semibold text-zinc-900">Alimentación</span>
      ) : (
        <Link
          href="/alimentacion"
          className="font-semibold text-zinc-500 transition hover:text-zinc-900"
        >
          Alimentación
        </Link>
      )}
      {isRegisterProductor && (
        <>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <span className="font-semibold text-zinc-900">Registrar productor</span>
        </>
      )}
      {isRegisterCocina && (
        <>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <span className="font-semibold text-zinc-900">Registrar cocina</span>
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
      {isProductorPanel && (
        <>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <Link
            href="/alimentacion/gestion"
            className="font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            Ingresar código
          </Link>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <span className="font-semibold text-zinc-900">Mi productor</span>
        </>
      )}
      {isCocinaPanel && (
        <>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <Link
            href="/alimentacion/gestion"
            className="font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            Ingresar código
          </Link>
          <span aria-hidden className="text-zinc-300">
            ›
          </span>
          <span className="font-semibold text-zinc-900">Mi cocina</span>
        </>
      )}
    </nav>
  );
}
