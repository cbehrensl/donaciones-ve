import Link from "next/link";

interface OwnerPathBannerProps {
  variant: "productor" | "cocina";
}

export function OwnerPathBanner({ variant }: OwnerPathBannerProps) {
  const isProductor = variant === "productor";

  return (
    <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        ¿Eres responsable?
      </p>
      <p className="mt-1 text-sm text-zinc-700">
        {isProductor
          ? "Regístrate como productor o administra tu registro con tu código."
          : "Registra tu cocina o administra necesidades con tu código."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={isProductor ? "/productores/nuevo" : "/cocinas/nuevo"}
          className={`rounded-lg px-3 py-2 text-sm font-bold text-white ${
            isProductor
              ? "bg-emerald-700 hover:bg-emerald-800"
              : "bg-blue-800 hover:bg-blue-900"
          }`}
        >
          {isProductor ? "+ Registrarme" : "+ Registrar cocina"}
        </Link>
        <Link
          href="/alimentacion/gestion"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50"
        >
          Administrar con código
        </Link>
        <Link
          href="/alimentacion"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
        >
          Hub alimentación
        </Link>
      </div>
    </section>
  );
}
