"use server";

import { getCentroByManagementCode } from "@/lib/data";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";

export async function resolverCodigoGestion(
  formData: FormData,
): Promise<ActionResult & { centroId?: string; codigo?: string }> {
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

  const result = await getCentroByManagementCode(codigo).catch((error) => {
    console.error("Error resolviendo código de gestión:", error);
    return null;
  });

  if (!result) {
    return actionError("codigo-invalido");
  }

  return {
    ...actionSuccess("detalles-guardados"),
    centroId: result.centro.id,
    codigo: codigo.trim(),
  };
}
