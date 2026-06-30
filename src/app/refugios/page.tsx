import Link from "next/link";
import { getRefugios } from "@/lib/data";
import { RefugiosClient } from "./RefugiosClient";

export const revalidate = 30;

export default async function RefugiosPage() {
  const refugios = await getRefugios();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 transition hover:text-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Refugios activos
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
            Refugios
          </h1>
          <p className="mt-2 text-base text-zinc-600">
            Lugares habilitados como refugio para personas afectadas.
            {refugios.length > 0 && (
              <span className="ml-1 font-semibold text-zinc-800">
                ({refugios.length} activos)
              </span>
            )}
          </p>
        </header>

        <RefugiosClient refugios={refugios} />
      </div>
    </main>
  );
}
