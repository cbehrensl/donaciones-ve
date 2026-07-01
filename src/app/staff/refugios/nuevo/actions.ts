"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import {
  isMissingRefugiosColumnError,
  omitMissingRefugiosColumn,
} from "@/lib/refugios-db-compat";
import { requireSupabaseServiceClient } from "@/lib/supabase";

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
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("URL inválida");
    }
    return url.toString();
  } catch {
    throw new Error("El link de ubicación debe ser una URL válida.");
  }
}

function getOptionalNumber(formData: FormData, key: string): number | null {
  const value = getOptionalString(formData, key);
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`El campo ${key} debe ser numérico.`);
  }
  return parsed;
}

function getOptionalEstadoId(formData: FormData): number | null {
  const value = getOptionalString(formData, "estado_id");
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function crearRefugioStaff(formData: FormData) {
  const token = getRequiredString(formData, "token");
  if (!isModeratorTokenValid(token)) {
    redirect("/staff");
  }

  try {
    const nombre = getRequiredString(formData, "nombre");
    const googleMapsUrl = getOptionalUrl(formData, "google_maps_url");
    const supabase = requireSupabaseServiceClient();

    let payload: Record<string, unknown> = {
      nombre,
      direccion: getOptionalString(formData, "direccion"),
      referencia_lugar: getOptionalString(formData, "referencia_lugar"),
      zona: getOptionalString(formData, "zona"),
      municipio: getOptionalString(formData, "municipio"),
      estado_id: getOptionalEstadoId(formData),
      contacto_nombre: getOptionalString(formData, "contacto_nombre"),
      contacto_telefono: getOptionalString(formData, "contacto_telefono"),
      responsable_nombre: getOptionalString(formData, "contacto_nombre"),
      responsable_telefono: getOptionalString(formData, "contacto_telefono"),
      num_personas: getOptionalNumber(formData, "num_personas"),
      necesidades: getOptionalString(formData, "necesidades"),
      confirmado: formData.get("confirmado") === "on",
      tiene_maps_link: Boolean(googleMapsUrl),
      google_maps_url: googleMapsUrl,
      activo: formData.get("activo") === "on",
      saturado: formData.get("saturado") === "on",
    };

    let error: { message?: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await supabase.from("refugios").insert(payload);
      error = result.error;
      if (!error) break;
      if (!isMissingRefugiosColumnError(error)) break;
      const nextPayload = omitMissingRefugiosColumn(payload, error);
      if (nextPayload === payload) break;
      payload = nextPayload;
    }

    if (error) {
      throw new Error(error.message ?? "No se pudo crear el refugio.");
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el refugio.";
    redirect(
      `/staff/refugios/nuevo?${new URLSearchParams({
        token,
        error: message,
      }).toString()}`,
    );
  }

  revalidatePath("/refugios");
  revalidatePath("/mapa");
  redirect(
    `/staff?${new URLSearchParams({
      token,
      created: "refugio",
    }).toString()}`,
  );
}
