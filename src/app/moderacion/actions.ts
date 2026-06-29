"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { mapUrgenciaToDb } from "@/lib/data";
import {
  aplicarActualizacionNecesidad,
  registrarAlertaCentro,
} from "@/lib/moderacion-updates";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { Urgencia } from "@/lib/types";

function isAuthorized(formData: FormData): boolean {
  return isModeratorTokenValid(formData.get("token"));
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

function parseOptionalDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function actualizarDetallesCentroModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const contacto = String(formData.get("contacto") ?? "").trim() || null;
  const vialidad = String(formData.get("vialidad") ?? "").trim() || null;
  const ubicacionUrl = parseOptionalUrl(formData.get("ubicacion_url"));
  const fechaInicioRecepcion = parseOptionalDate(
    formData.get("fecha_inicio_recepcion"),
  );
  const fechaFinRecepcion = parseOptionalDate(formData.get("fecha_fin_recepcion"));
  const horarioRecepcion =
    String(formData.get("horario_recepcion") ?? "").trim() || null;
  const responsableNombre =
    String(formData.get("responsable_nombre") ?? "").trim() || null;
  const responsableTelefono =
    String(formData.get("responsable_telefono") ?? "").trim() || null;

  if (!centroId || !nombre || !direccion) {
    return actionError("datos-invalidos");
  }

  if (
    fechaInicioRecepcion &&
    fechaFinRecepcion &&
    fechaFinRecepcion < fechaInicioRecepcion
  ) {
    return actionError("fechas-invalidas");
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
      fecha_inicio_recepcion: fechaInicioRecepcion,
      fecha_fin_recepcion: fechaFinRecepcion,
      horario_recepcion: horarioRecepcion,
      nombre_responsable: responsableNombre,
      telefono_responsable: responsableTelefono,
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error actualizando detalles desde moderación:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("centro-actualizado");
}

export async function actualizarVerificacion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");
  const verificado = formData.get("verificado") === "true";

  if (!centroId) {
    return actionError("datos-invalidos");
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
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess(verificado ? "centro-aprobado" : "centro-pendiente");
}

export async function actualizarUrgencia(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const necesidadId = String(formData.get("necesidadId") ?? "");
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

  if (!necesidadId || !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ nivel_urgencia: mapUrgenciaToDb(urgencia) })
    .eq("id", necesidadId);

  if (error) {
    console.error("Error actualizando urgencia:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("insumo-actualizado");
}

export async function eliminarNecesidadModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");
  const necesidadId = String(formData.get("necesidadId") ?? "");

  if (!centroId || !necesidadId) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ activo: false })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  if (error) {
    console.error("Error eliminando necesidad desde moderación:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("insumo-eliminado");
}

export async function agregarNecesidadModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");
  const categoriaId = String(formData.get("categoriaId") ?? "");
  const urgencia = "MEDIA";
  const detalle = String(formData.get("detalle") ?? "").trim() || null;

  if (!centroId || !categoriaId) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { data: categoria, error: categoriaError } = await supabase
    .from("categorias_insumo")
    .select("nombre")
    .eq("id", Number(categoriaId))
    .maybeSingle();

  if (categoriaError || !categoria?.nombre) {
    return actionError("datos-invalidos");
  }

  const result = await aplicarActualizacionNecesidad({
    centroId,
    categoriaInsumo: String(categoria.nombre),
    urgencia,
    detalle,
    origen: "manual",
  });

  if (!result.ok) {
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("insumo-agregado");
}

function parseDuracionHoras(
  value: FormDataEntryValue | null,
): number | null | "invalid" {
  if (typeof value !== "string" || !value.trim()) {
    return "invalid";
  }

  if (value === "indefinida") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 24 * 30) {
    return "invalid";
  }

  return Math.floor(parsed);
}

export async function crearAlertaModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const mensaje = String(formData.get("mensaje") ?? "").trim();
  const duracionHoras = parseDuracionHoras(formData.get("duracion_horas"));

  if (
    !centroId ||
    !mensaje ||
    duracionHoras === "invalid" ||
    !["NECESIDAD_URGENTE", "INSUMO_SATURADO"].includes(tipo)
  ) {
    return actionError("datos-invalidos");
  }

  const expiresAt =
    duracionHoras === null
      ? null
      : new Date(Date.now() + duracionHoras * 60 * 60 * 1000).toISOString();

  await registrarAlertaCentro({
    centroId,
    tipo: tipo as "NECESIDAD_URGENTE" | "INSUMO_SATURADO",
    mensaje,
    metadata: {
      expiresAt,
      createdBy: "moderacion_manual",
      duracionHoras,
    },
  });

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("alerta-creada");
}

export async function eliminarAlertaModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const alertaId = String(formData.get("alertaId") ?? "").trim();
  const centroId = String(formData.get("centroId") ?? "").trim();
  if (!alertaId || !centroId) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("alertas_centro")
    .delete()
    .eq("id", alertaId)
    .eq("centro_id", centroId);

  if (error) {
    console.error("Error eliminando alerta:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("alerta-eliminada");
}

export async function ocultarCentro(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");

  if (!centroId) {
    return actionError("datos-invalidos");
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
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("centro-oculto");
}

export async function mostrarCentro(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const centroId = String(formData.get("centroId") ?? "");

  if (!centroId) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { data: centro, error: selectError } = await supabase
    .from("centros_acopio")
    .select("verificado")
    .eq("id", centroId)
    .single();

  if (selectError || !centro) {
    console.error("Error leyendo centro oculto:", selectError?.message);
    return actionError("error-guardar");
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
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath("/moderacion");
  return actionSuccess("centro-visible");
}
