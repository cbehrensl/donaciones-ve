"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { resolverCodigoGestion } from "@/app/gestion/actions";
import { SnackbarProvider, useSnackbar } from "@/components/SnackbarProvider";

function GestionLoginFormInner() {
  const router = useRouter();
  const showSnackbar = useSnackbar();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await resolverCodigoGestion(formData);
      if (result.ok && result.centroId && result.codigo) {
        router.push(
          `/gestion/${result.centroId}?codigo=${encodeURIComponent(result.codigo)}`,
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
        className="mb-4 w-full rounded-lg border-2 border-zinc-300 px-3 py-3 font-mono text-lg tracking-wider focus:border-zinc-900 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900 disabled:opacity-60"
      >
        {isPending ? "Validando..." : "Entrar al panel"}
      </button>
    </form>
  );
}

export function GestionLoginForm() {
  return (
    <SnackbarProvider>
      <GestionLoginFormInner />
    </SnackbarProvider>
  );
}
