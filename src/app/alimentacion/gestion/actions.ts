"use server";

import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import {
  getCocinaByManagementCode,
  getProductorByManagementCode,
} from "@/lib/data-productores";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";

export type ResolverCodigoAlimentacionResult = ActionResult & {
  tipo?: "productor" | "cocina";
  entityId?: string;
  codigo?: string;
};

export async function resolverCodigoAlimentacion(
  formData: FormData,
): Promise<ResolverCodigoAlimentacionResult> {
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

  try {
    const productorResult = await getProductorByManagementCode(codigo);
    if (productorResult) {
      return {
        ...actionSuccess("acceso-productor"),
        tipo: "productor",
        entityId: productorResult.productor.id,
        codigo: productorResult.codigo,
      };
    }

    const cocinaResult = await getCocinaByManagementCode(codigo);
    if (cocinaResult) {
      return {
        ...actionSuccess("acceso-cocina"),
        tipo: "cocina",
        entityId: cocinaResult.cocina.id,
        codigo: cocinaResult.codigo,
      };
    }

    return actionError("codigo-invalido");
  } catch (error) {
    console.error("Error resolviendo código de alimentación:", error);
    return actionError("error-guardar");
  }
}
