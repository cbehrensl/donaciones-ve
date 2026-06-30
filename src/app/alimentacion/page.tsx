import Link from "next/link";
import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";

export const revalidate = 300;

export default function AlimentacionHubPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <FoodOwnerNav />

      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Productores y cocinas
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Regístrate como productor o cocina, o ingresa tu código para actualizar
          tu información y necesidades.
        </p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/productores/nuevo"
          className="rounded-xl bg-emerald-700 px-4 py-4 text-left text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          <p className="text-base font-black">+ Registrar productor</p>
          <p className="mt-1 text-sm text-emerald-100">
            Indica qué alimentos puedes donar y recibe tu código de gestión.
          </p>
        </Link>
        <Link
          href="/cocinas/nuevo"
          className="rounded-xl bg-blue-800 px-4 py-4 text-left text-white shadow-sm transition-colors hover:bg-blue-900"
        >
          <p className="text-base font-black">+ Registrar cocina</p>
          <p className="mt-1 text-sm text-blue-100">
            Reporta qué ingredientes necesitas y recibe tu código de gestión.
          </p>
        </Link>
      </section>

      <section className="mb-6">
        <Link
          href="/alimentacion/gestion"
          className="block rounded-xl border border-zinc-300 bg-white px-4 py-4 text-left shadow-sm transition-colors hover:bg-zinc-50"
        >
          <p className="text-base font-black text-zinc-900">
            Administrar con código
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Ya te registraste. Ingresa tu código para actualizar tu productor o
            cocina.
          </p>
        </Link>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-bold text-zinc-800">Explorar directorios públicos</p>
        <p className="mt-1 text-sm text-zinc-600">
          Solo se muestran registros verificados por moderadores.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/productores"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 transition-colors hover:bg-zinc-100"
          >
            Ver productores
          </Link>
          <Link
            href="/cocinas"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 transition-colors hover:bg-zinc-100"
          >
            Ver cocinas
          </Link>
        </div>
      </section>
    </main>
  );
}
