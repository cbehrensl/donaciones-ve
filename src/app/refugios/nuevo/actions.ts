"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { generateManagementCode, hashManagementCode } from "@/lib/gestion-code";
import {
  isMissingRefugiosColumnError,
  omitMissingRefugiosColumn,
} from "@/lib/refugios-db-compat";
import { requireSupabaseServiceClient } from "@/lib/supabase";

export async function registrarRefugioPublico(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult & { codigo?: string }> {
  try {
    const supabase = requireSupabaseServiceClient();

    const nombre = formData.get("nombre")?.toString().trim();
    const estado_id = formData.get("estado_id")?.toString().trim();
    const municipio = formData.get("municipio")?.toString().trim();
    const zona = formData.get("zona")?.toString().trim();
    const direccion = formData.get("direccion")?.toString().trim();
    const responsable_nombre = formData.get("responsable_nombre")?.toString().trim();
    const responsable_telefono = formData.get("responsable_telefono")?.toString().trim();

    if (
      !nombre ||
      !estado_id ||
      !municipio ||
      !zona ||
      !direccion ||
      !responsable_nombre ||
      !responsable_telefono
    ) {
      return actionError("faltan-datos");
    }

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

    const codigoGestion = generateManagementCode();
    const codigoGestionHash = hashManagementCode(codigoGestion);

    let payload: Record<string, unknown> = {
      nombre,
      estado_id: Number(estado_id),
      municipio,
      zona,
      direccion,
      referencia_lugar: formData.get("referencia_lugar")?.toString().trim() || null,
      google_maps_url: googleMapsUrl || null,
      tiene_maps_link: Boolean(googleMapsUrl),
      num_personas,
      necesidades: formData.get("necesidades")?.toString().trim() || null,
      responsable_nombre,
      responsable_telefono,
      contacto_nombre: responsable_nombre,
      contacto_telefono: responsable_telefono,
      codigo_gestion_hash: codigoGestionHash,
      confirmado: false, // Requiere verificación por moderador
      activo: true, // Visible públicamente pero con etiqueta de pendiente
    };

    let error: { message?: string } | null = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await supabase.from("refugios").insert(payload);
      error = result.error;
      if (!error) break;
      if (!isMissingRefugiosColumnError(error)) break;
      const nextPayload = omitMissingRefugiosColumn(payload, error);
      if (nextPayload === payload) break;
      payload = nextPayload;
    }

    if (error) {
      console.error("Error insertando refugio:", error);
      return actionError("error-db");
    }

    revalidatePath("/refugios");
    revalidatePath("/mapa");

    return {
      ...actionSuccess("centro-registrado"),
      codigo: codigoGestion,
    };
  } catch (error) {
    console.error("Error en registrarRefugioPublico:", error);
    return actionError("error-interno");
  }
}
