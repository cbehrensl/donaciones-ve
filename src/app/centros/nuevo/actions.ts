"use server";

import { revalidatePath } from "next/cache";
import {
  formatManagementCodeDisplay,
  generateManagementCode,
  hashManagementCode,
} from "@/lib/gestion-code";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
  requireSupabaseServiceClient,
} from "@/lib/supabase";
import type { CrearCentroResult } from "@/lib/types";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Campo obligatorio: ${key}`);
  }
  return value.trim();
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return value.trim();
}

function getOptionalUrl(formData: FormData, key: string): string | null {
  const value = getOptionalString(formData, key);

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("URL inválida");
    }

    return url.toString();
  } catch {
    throw new Error("El link de ubicación debe ser una URL válida de Maps.");
  }
}

function getOptionalDate(formData: FormData, key: string): string | null {
  const value = getOptionalString(formData, key);
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`La fecha en ${key} no es válida.`);
  }

  return value;
}

export async function crearCentroAcopio(
  formData: FormData,
): Promise<CrearCentroResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Supabase no está configurado. Agrega las variables de entorno para registrar centros.",
    };
  }

  if (!isSupabaseServiceConfigured()) {
    return {
      ok: false,
      message:
        "Falta SUPABASE_SERVICE_ROLE_KEY. Es necesaria para registrar centros de forma segura.",
    };
  }

  try {
    const nombre = getRequiredString(formData, "nombre");
    const direccion = getRequiredString(formData, "direccion");
    const municipioId = getRequiredString(formData, "municipio_id");
    const responsableNombre = getRequiredString(formData, "responsable_nombre");
    const responsableTelefono = getRequiredString(formData, "responsable_telefono");
    const contacto = getOptionalString(formData, "contacto");
    const ubicacionUrl = getOptionalUrl(formData, "ubicacion_url");
    const estadoVialidad = getOptionalString(formData, "estado_vialidad");
    const fechaInicioRecepcion = getOptionalDate(
      formData,
      "fecha_inicio_recepcion",
    );
    const fechaFinRecepcion = getOptionalDate(formData, "fecha_fin_recepcion");
    const horarioRecepcion = getOptionalString(formData, "horario_recepcion");

    if (
      fechaInicioRecepcion &&
      fechaFinRecepcion &&
      fechaFinRecepcion < fechaInicioRecepcion
    ) {
      return {
        ok: false,
        message: "La fecha fin no puede ser anterior a la fecha inicio.",
      };
    }

    const codigoGestion = generateManagementCode();
    const codigoHash = hashManagementCode(codigoGestion);

    const supabase = requireSupabaseServiceClient();
    const { data: municipio, error: municipioError } = await supabase
      .from("municipios")
      .select("estado_id")
      .eq("id", municipioId)
      .single();

    if (municipioError || !municipio) {
      return {
        ok: false,
        message: "No se pudo validar el municipio seleccionado.",
      };
    }

    const { data, error } = await supabase
      .from("centros_acopio")
      .insert({
        nombre,
        direccion,
        municipio_id: municipioId,
        estado_id: municipio.estado_id,
        ubicacion_url: ubicacionUrl,
        telefono_contacto: contacto,
        detalle_vias: estadoVialidad,
        fecha_inicio_recepcion: fechaInicioRecepcion,
        fecha_fin_recepcion: fechaFinRecepcion,
        horario_recepcion: horarioRecepcion,
        nombre_responsable: responsableNombre,
        telefono_responsable: responsableTelefono,
        codigo_gestion_hash: codigoHash,
        verificado: false,
        estatus: "sin_verificar",
        aprobado_publicar: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creando centro:", error?.message);
      return {
        ok: false,
        message: error?.message ?? "No se pudo registrar el centro.",
      };
    }

    revalidatePath("/");

    return {
      ok: true,
      centroId: data.id,
      codigoGestion: formatManagementCodeDisplay(codigoGestion),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    return { ok: false, message };
  }
}
