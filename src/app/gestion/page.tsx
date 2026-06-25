import Link from "next/link";
import { resolverCodigoGestion } from "@/app/gestion/actions";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GestionLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  "codigo-vacio": "Ingresa tu código de gestión.",
  "codigo-invalido": "Código no válido. Verifica e intenta de nuevo.",
  "supabase-no-configurado":
    "Supabase no está configurado. No es posible acceder a centros reales.",
};

export default async function GestionLoginPage({
  searchParams,
}: GestionLoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? ERROR_MESSAGES[params.error] ?? "Error al acceder."
    : null;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <header className="mb-8 text-center">
        <Link href="/" className="text-sm underline">
          ← Volver al inicio
        </Link>
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

      {errorMessage ? (
        <section className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </section>
      ) : null}

      <form
        action={resolverCodigoGestion}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <label htmlFor="codigo" className="mb-2 block text-sm font-bold">
          Código de gestión
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="DV-XXXX-XXXX-XXXX"
          className="mb-4 w-full rounded-lg border-2 border-zinc-300 px-3 py-3 font-mono text-lg tracking-wider focus:border-zinc-900 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900"
        >
          Entrar al panel
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        ¿Aún no tienes centro?{" "}
        <Link href="/centros/nuevo" className="font-semibold underline">
          Registrar centro de acopio
        </Link>
      </p>
    </div>
  );
}
