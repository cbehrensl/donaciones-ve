import { OwnerNav } from "@/components/navigation/OwnerNav";
import Link from "next/link";

export const revalidate = 300;

export default function ResponsablesHubPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <OwnerNav />

      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Gestiona tu centro de acopio
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Registra un centro nuevo o ingresa tu código para actualizar datos e
          insumos.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/centros/nuevo"
          className="cta-primary rounded-xl bg-blue-800 px-4 py-4 text-left text-white shadow-sm"
        >
          <p className="text-base font-black text-white">+ Registrar centro</p>
          <p className="mt-1 text-sm text-blue-100">
            Crea un nuevo registro y recibe tu código secreto.
          </p>
        </Link>
        <Link
          href="/gestion"
          className="cta-secondary rounded-xl border border-zinc-300 bg-white px-4 py-4 text-left shadow-sm"
        >
          <p className="text-base font-black text-zinc-900">
            ⚙️ Administrar mi centro
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Ingresa con tu código para editar datos e insumos.
          </p>
        </Link>
      </section>
    </main>
  );
}
