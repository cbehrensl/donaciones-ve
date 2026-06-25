"use server";

import { revalidatePath } from "next/cache";
import { mapUrgenciaToDb } from "@/lib/data";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { Urgencia } from "@/lib/types";

function isAuthorized(token: FormDataEntryValue | null): boolean {
  return isModeratorTokenValid(token);
}

function parseOptionalUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function actualizarDetallesCentroModeracion(
  formData: FormData,
): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const contacto = String(formData.get("contacto") ?? "").trim() || null;
  const vialidad = String(formData.get("vialidad") ?? "").trim() || null;
  const ubicacionUrl = parseOptionalUrl(formData.get("ubicacion_url"));
  const responsableNombre =
    String(formData.get("responsable_nombre") ?? "").trim() || null;
  const responsableTelefono =
    String(formData.get("responsable_telefono") ?? "").trim() || null;

  if (!centroId || !nombre || !direccion) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("centros_acopio")
    .update({
      nombre,
      direccion,
      telefono_contacto: contacto,
      detalle_vias: vialidad,
      ubicacion_url: ubicacionUrl,
      nombre_responsable: responsableNombre,
      telefono_responsable: responsableTelefono,
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error actualizando detalles desde moderación:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
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

export async function eliminarNecesidadModeracion(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");
  const necesidadId = String(formData.get("necesidadId") ?? "");

  if (!centroId || !necesidadId) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ activo: false })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  if (error) {
    console.error("Error eliminando necesidad desde moderación:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
}

export async function agregarNecesidadModeracion(formData: FormData): Promise<void> {
  if (!isAuthorized(formData.get("token"))) {
    return;
  }

  const centroId = String(formData.get("centroId") ?? "");
  const categoriaId = String(formData.get("categoriaId") ?? "");
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;
  const detalle = String(formData.get("detalle") ?? "").trim() || null;

  if (
    !centroId ||
    !categoriaId ||
    !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)
  ) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase.from("necesidades").upsert(
    {
      centro_id: centroId,
      categoria_id: Number(categoriaId),
      nivel_urgencia: mapUrgenciaToDb(urgencia),
      descripcion: detalle,
      activo: true,
    },
    { onConflict: "centro_id,categoria_id" },
  );

  if (error) {
    console.error("Error agregando necesidad desde moderación:", error.message);
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
