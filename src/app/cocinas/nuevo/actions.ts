"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  formatManagementCodeDisplay,
  generateManagementCode,
  hashManagementCode,
} from "@/lib/gestion-code";
import {
  createSupabaseServiceClient,
  isSupabaseConfigured,
  requireSupabaseClient,
} from "@/lib/supabase";
import type { CrearCocinaResult } from "@/lib/types";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Campo obligatorio: ${key}`);
  }
  return value.trim();
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function getOptionalUrl(formData: FormData, key: string): string | null {
  const value = getOptionalString(formData, key);
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new Error("El link de ubicación debe ser una URL válida.");
  }
}

function getOptionalInt(formData: FormData, key: string): number | null {
  const value = getOptionalString(formData, key);
  if (!value) return null;
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export async function crearCocina(formData: FormData): Promise<CrearCocinaResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  try {
    const nombre = getRequiredString(formData, "nombre");
    const direccion = getRequiredString(formData, "direccion");
    const municipioId = getRequiredString(formData, "municipio_id");
    const responsableNombre = getRequiredString(formData, "responsable_nombre");
    const responsableTelefono = getRequiredString(formData, "responsable_telefono");
    const descripcion = getOptionalString(formData, "descripcion");
    const contacto = getOptionalString(formData, "contacto");
    const ubicacionUrl = getOptionalUrl(formData, "ubicacion_url");
    const horario = getOptionalString(formData, "horario");
    const capacidadBeneficiarios = getOptionalInt(formData, "capacidad_beneficiarios");

    const codigoGestion = generateManagementCode();
    const codigoHash = hashManagementCode(codigoGestion);
    const cocinaId = randomUUID();

    const supabase = createSupabaseServiceClient() ?? requireSupabaseClient();
    const { data: municipio, error: municipioError } = await supabase
      .from("municipios")
      .select("estado_id")
      .eq("id", municipioId)
      .single();

    if (municipioError || !municipio) {
      return { ok: false, message: "No se pudo validar el municipio seleccionado." };
    }

    const { error } = await supabase
      .from("cocinas_comunitarias")
      .insert({
        id: cocinaId,
        nombre,
        descripcion,
        contacto,
        direccion,
        ubicacion_url: ubicacionUrl,
        municipio_id: municipioId,
        estado_id: municipio.estado_id,
        horario,
        capacidad_beneficiarios: capacidadBeneficiarios,
        responsable_nombre: responsableNombre,
        responsable_telefono: responsableTelefono,
        codigo_gestion_hash: codigoHash,
        verificado: false,
        activo: true,
      });

    if (error) {
      console.error("Error creando cocina:", error?.message);
      return { ok: false, message: error?.message ?? "No se pudo registrar la cocina." };
    }

    revalidatePath("/cocinas");

    return {
      ok: true,
      cocinaId,
      codigoGestion: formatManagementCodeDisplay(codigoGestion),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    return { ok: false, message };
  }
}
