"use server";

import { getRefugioByManagementCode } from "@/lib/data";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";

export async function resolverCodigoGestionRefugio(
  formData: FormData,
): Promise<ActionResult & { refugioId?: string; codigo?: string }> {
  const codigo = formData.get("codigo");

  if (typeof codigo !== "string" || !codigo.trim()) {
    return actionError("codigo-vacio");
  }

  if (!isSupabaseConfigured()) {
    return actionError("supabase-no-configurado");
  }

  if (!isSupabaseServiceConfigured()) {
    return actionError("supabase-service-no-configurado");
  }

  const result = await getRefugioByManagementCode(codigo).catch((error) => {
    console.error("Error resolviendo código de gestión de refugio:", error);
    return null;
  });

  if (!result) {
    return actionError("codigo-invalido");
  }

  return {
    ...actionSuccess("detalles-guardados"),
    refugioId: result.refugio.id,
    codigo: codigo.trim(),
  };
}
