"use server";

import { revalidatePath } from "next/cache";
import { mapUrgenciaToDb } from "@/lib/data";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { Urgencia } from "@/lib/types";

function isAuthorized(token: FormDataEntryValue | null): boolean {
  return isModeratorTokenValid(token);
}

export async function actualizarVerificacion(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");
  const verificado = formData.get("verificado") === "true";

  if (!centroId) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("centros_acopio")
    .update({
      verificado,
      aprobado_publicar: verificado,
      estatus: verificado ? "activo" : "sin_verificar",
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error actualizando centro:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
}

export async function actualizarUrgencia(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const necesidadId = String(formData.get("necesidadId") ?? "");
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

  if (!necesidadId || !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ nivel_urgencia: mapUrgenciaToDb(urgencia) })
    .eq("id", necesidadId);

  if (error) {
    console.error("Error actualizando urgencia:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
}

export async function ocultarCentro(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");

  if (!centroId) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("centros_acopio")
    .update({
      estatus: "cerrado",
      aprobado_publicar: false,
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error ocultando centro:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
}

export async function mostrarCentro(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");

  if (!centroId) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { data: centro, error: selectError } = await supabase
    .from("centros_acopio")
    .select("verificado")
    .eq("id", centroId)
    .single();

  if (selectError || !centro) {
    console.error("Error leyendo centro oculto:", selectError?.message);
    return;
  }

  const verificado = Boolean(centro.verificado);
  const { error } = await supabase
    .from("centros_acopio")
    .update({
      estatus: verificado ? "activo" : "sin_verificar",
      aprobado_publicar: verificado,
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error mostrando centro:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
}
