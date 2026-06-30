import Link from "next/link";
import { StaffNav } from "@/components/navigation/StaffNav";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";

interface StaffHubPageProps {
  searchParams: Promise<{ token?: string }>;
}

function tokenHref(path: string, token: string): string {
  return `${path}?${new URLSearchParams({ token }).toString()}`;
}

export default async function StaffHubPage({ searchParams }: StaffHubPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const hasToken = Boolean(getModeratorAccessToken());
  const isAuthorized = isModeratorTokenValid(token);

  if (!hasToken) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta configurar <code>MODERADOR_ACCESS_TOKEN</code> para habilitar el
          hub staff.
        </section>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-zinc-900">Acceso staff</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Ingresa el token de moderación para acceder al panel interno.
          </p>
          <form method="get" action="/staff" className="mt-4 space-y-3">
            <input
              type="password"
              name="token"
              required
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              placeholder="Token de moderación"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-bold text-white"
            >
              Entrar
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <StaffNav token={token} />

      <header className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-blue-800">
          Hub Staff
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
          Operación interna de apoyo
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Centraliza moderación de centros, alertas operativas y administración
          de enlaces de ayuda.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={tokenHref("/moderacion", token)}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-base font-black text-zinc-900">Centros y alertas</p>
          <p className="mt-1 text-sm text-zinc-600">
            Verificar centros, editar datos y gestionar alertas activas.
          </p>
        </Link>
        <Link
          href={tokenHref("/staff/donaciones", token)}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-base font-black text-zinc-900">Links de ayuda</p>
          <p className="mt-1 text-sm text-zinc-600">
            Activar, editar o pausar enlaces de ayuda económica y psicológica.
          </p>
        </Link>
      </section>
    </main>
  );
}
