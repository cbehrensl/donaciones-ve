"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { resolverCodigoGestionRefugio } from "./actions";
import { SnackbarProvider, useSnackbar } from "@/components/SnackbarProvider";

function RefugiosLoginFormInner() {
  const router = useRouter();
  const showSnackbar = useSnackbar();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await resolverCodigoGestionRefugio(formData);
      if (result.ok && result.refugioId && result.codigo) {
        router.push(
          `/refugios/gestion/${result.refugioId}?codigo=${encodeURIComponent(result.codigo)}`,
        );
        return;
      }

      showSnackbar(result.code, { refresh: false });
    });
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      aria-busy={isPending}
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
        className="mb-4 w-full rounded-lg border-2 border-zinc-300 px-3 py-3 font-mono text-lg tracking-wider focus:border-purple-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-purple-700 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-purple-800 disabled:opacity-60"
      >
        {isPending ? "Validando..." : "Entrar al panel"}
      </button>
    </form>
  );
}

export function RefugiosLoginForm() {
  return (
    <SnackbarProvider>
      <RefugiosLoginFormInner />
    </SnackbarProvider>
  );
}
