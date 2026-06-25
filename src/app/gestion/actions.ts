"use server";

import { redirect } from "next/navigation";
import { getCentroByManagementCode } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function resolverCodigoGestion(formData: FormData): Promise<void> {
  const codigo = formData.get("codigo");

  if (typeof codigo !== "string" || !codigo.trim()) {
    redirect("/gestion?error=codigo-vacio");
  }

  if (!isSupabaseConfigured()) {
    redirect("/gestion?error=supabase-no-configurado");
  }

  const result = await getCentroByManagementCode(codigo);

  if (!result) {
    redirect("/gestion?error=codigo-invalido");
  }

  const encoded = encodeURIComponent(codigo.trim());
  redirect(`/gestion/${result.centro.id}?codigo=${encoded}`);
}
