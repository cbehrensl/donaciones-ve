import Link from "next/link";
import { RefugiosLoginForm } from "./RefugiosLoginForm";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function RefugiosGestionLoginPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <OwnerNav />
      <header className="mb-8 text-center">
        <h1 className="mt-4 text-2xl font-bold">Administrar mi refugio</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ingresa el código que recibiste al registrar tu refugio.
        </p>
      </header>

      {!isSupabaseConfigured() ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Supabase no está configurado. No es posible validar códigos reales.
        </section>
      ) : null}

      <RefugiosLoginForm />

      <p className="mt-6 text-center text-sm text-zinc-600">
        ¿Aún no tienes refugio?{" "}
        <Link href="/refugios/nuevo" className="font-semibold text-purple-700 transition hover:text-purple-900">
          Registrar refugio
        </Link>
      </p>
    </div>
  );
}
