"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import {
  isMissingRefugiosColumnError,
  omitMissingRefugiosColumn,
} from "@/lib/refugios-db-compat";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import { hashManagementCode } from "@/lib/gestion-code";

export async function actualizarDetallesRefugio(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const refugioId = formData.get("refugioId")?.toString();
    const codigo = formData.get("codigo")?.toString();

    if (!refugioId || !codigo) {
      return actionError("faltan-datos");
    }

    const supabase = requireSupabaseServiceClient();
    const codigoHash = hashManagementCode(codigo);

    const googleMapsUrl = formData.get("google_maps_url")?.toString().trim();
    if (googleMapsUrl) {
      try {
        const url = new URL(googleMapsUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          return actionError("url-invalida");
        }
      } catch {
        return actionError("url-invalida");
      }
    }

    const numPersonasStr = formData.get("num_personas")?.toString().trim();
    const num_personas = numPersonasStr ? Number(numPersonasStr) : null;

    let payload: Record<string, unknown> = {
      contacto_nombre: formData.get("contacto_nombre")?.toString().trim() || null,
      contacto_telefono: formData.get("contacto_telefono")?.toString().trim() || null,
      google_maps_url: googleMapsUrl || null,
      tiene_maps_link: Boolean(googleMapsUrl),
      num_personas,
      necesidades: formData.get("necesidades")?.toString().trim() || null,
      activo: formData.get("activo") === "on",
      saturado: formData.get("saturado") === "on",
    };

    let error: { message?: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await supabase
        .from("refugios")
        .update(payload)
        .eq("id", refugioId)
        .eq("codigo_gestion_hash", codigoHash);
      error = result.error;
      if (!error) break;
      if (!isMissingRefugiosColumnError(error)) break;
      const nextPayload = omitMissingRefugiosColumn(payload, error);
      if (nextPayload === payload) break;
      payload = nextPayload;
    }

    if (error) {
      console.error("Error actualizando refugio:", error);
      return actionError("error-db");
    }

    revalidatePath("/refugios");
    revalidatePath(`/refugios/gestion/${refugioId}`);
    revalidatePath("/mapa");

    return actionSuccess("detalles-guardados");
  } catch (error) {
    console.error("Error en actualizarDetallesRefugio:", error);
    return actionError("error-interno");
  }
}
