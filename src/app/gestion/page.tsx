import Link from "next/link";
import { GestionLoginForm } from "@/app/gestion/GestionLoginForm";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GestionLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function GestionLoginPage({
  searchParams,
}: GestionLoginPageProps) {
  await searchParams;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <OwnerNav />
      <header className="mb-8 text-center">
        <h1 className="mt-4 text-2xl font-bold">Administrar mi centro</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ingresa el código que recibiste al registrar tu centro de acopio.
        </p>
      </header>

      {!isSupabaseConfigured() ? (
        <section className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Supabase no está configurado. No es posible validar códigos reales.
        </section>
      ) : null}

      <GestionLoginForm />

      <p className="mt-6 text-center text-sm text-zinc-600">
        ¿Aún no tienes centro?{" "}
        <Link href="/centros/nuevo" className="font-semibold text-blue-700 transition hover:text-blue-900">
          Registrar centro de acopio
        </Link>
      </p>
    </div>
  );
}
