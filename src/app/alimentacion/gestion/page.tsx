import Link from "next/link";
import { AlimentacionLoginForm } from "@/app/alimentacion/gestion/AlimentacionLoginForm";
import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function AlimentacionGestionPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <FoodOwnerNav />
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Administrar con código</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ingresa el código que recibiste al registrar tu productor o cocina.
        </p>
      </header>

      {!isSupabaseConfigured() ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Supabase no está configurado. No es posible validar códigos reales.
        </section>
      ) : null}

      <AlimentacionLoginForm />

      <p className="mt-6 text-center text-sm text-zinc-600">
        ¿Aún no te registraste?{" "}
        <Link
          href="/alimentacion"
          className="font-semibold text-emerald-700 transition hover:text-emerald-900"
        >
          Ir al hub de alimentación
        </Link>
      </p>
    </div>
  );
}
