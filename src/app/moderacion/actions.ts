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
import {
  isMissingRefugiosColumnError,
  omitMissingRefugiosColumn,
} from "@/lib/refugios-db-compat";
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

  // Bump the center's updated_at so it surfaces to the top of sorted views
  // (public list and moderacion panel both order by updated_at DESC)
  const supabase = requireSupabaseServiceClient();
  await supabase
    .from("centros_acopio")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", centroId);

  revalidatePath("/");
  revalidatePath("/centros");
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

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function updateRefugioWithCompat(
  refugioId: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = requireSupabaseServiceClient();
  let current = { ...payload };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { error } = await supabase
      .from("refugios")
      .update(current)
      .eq("id", refugioId);

    if (!error) {
      return { ok: true };
    }

    if (!isMissingRefugiosColumnError(error)) {
      return { ok: false, error: error.message };
    }

    const next = omitMissingRefugiosColumn(current, error);
    if (next === current) {
      return { ok: false, error: error.message };
    }
    current = next;
  }

  return { ok: false, error: "No se pudo actualizar el refugio." };
}

function revalidateRefugioPaths(refugioId: string) {
  revalidatePath("/");
  revalidatePath("/refugios");
  revalidatePath("/moderacion");
  revalidatePath("/mapa");
  revalidatePath(`/refugios/gestion/${refugioId}`);
}

export async function actualizarConfirmacionRefugioModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const refugioId = String(formData.get("refugioId") ?? "");
  const confirmado = formData.get("confirmado") === "true";

  if (!refugioId) {
    return actionError("datos-invalidos");
  }

  const result = await updateRefugioWithCompat(refugioId, { confirmado });
  if (!result.ok) {
    console.error("Error actualizando confirmación de refugio:", result.error);
    return actionError("error-guardar");
  }

  revalidateRefugioPaths(refugioId);
  return actionSuccess(confirmado ? "refugio-confirmado" : "refugio-pendiente");
}

export async function ocultarRefugioModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const refugioId = String(formData.get("refugioId") ?? "");
  if (!refugioId) {
    return actionError("datos-invalidos");
  }

  const result = await updateRefugioWithCompat(refugioId, { activo: false });
  if (!result.ok) {
    console.error("Error ocultando refugio:", result.error);
    return actionError("error-guardar");
  }

  revalidateRefugioPaths(refugioId);
  return actionSuccess("refugio-oculto");
}

export async function activarRefugioModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const refugioId = String(formData.get("refugioId") ?? "");
  if (!refugioId) {
    return actionError("datos-invalidos");
  }

  const result = await updateRefugioWithCompat(refugioId, { activo: true });
  if (!result.ok) {
    console.error("Error activando refugio:", result.error);
    return actionError("error-guardar");
  }

  revalidateRefugioPaths(refugioId);
  return actionSuccess("refugio-activo");
}

export async function actualizarSaturacionRefugioModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const refugioId = String(formData.get("refugioId") ?? "");
  const saturado = formData.get("saturado") === "true";

  if (!refugioId) {
    return actionError("datos-invalidos");
  }

  const result = await updateRefugioWithCompat(refugioId, { saturado });
  if (!result.ok) {
    console.error("Error actualizando saturación de refugio:", result.error);
    return actionError("error-guardar");
  }

  revalidateRefugioPaths(refugioId);
  return actionSuccess(saturado ? "refugio-saturado" : "refugio-capacidad");
}

export async function actualizarDetallesRefugioModeracion(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) {
    return actionError("no-autorizado");
  }

  const refugioId = String(formData.get("refugioId") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const googleMapsUrl = parseOptionalUrl(formData.get("google_maps_url"));

  if (!refugioId || !nombre) {
    return actionError("datos-invalidos");
  }

  const payload: Record<string, unknown> = {
    nombre,
    direccion: String(formData.get("direccion") ?? "").trim() || null,
    referencia_lugar:
      String(formData.get("referencia_lugar") ?? "").trim() || null,
    zona: String(formData.get("zona") ?? "").trim() || null,
    municipio: String(formData.get("municipio") ?? "").trim() || null,
    contacto_nombre:
      String(formData.get("contacto_nombre") ?? "").trim() || null,
    contacto_telefono:
      String(formData.get("contacto_telefono") ?? "").trim() || null,
    necesidades: String(formData.get("necesidades") ?? "").trim() || null,
    num_personas: parseOptionalNumber(formData.get("num_personas")),
    google_maps_url: googleMapsUrl,
    tiene_maps_link: Boolean(googleMapsUrl),
    responsable_nombre:
      String(formData.get("responsable_nombre") ?? "").trim() || null,
    responsable_telefono:
      String(formData.get("responsable_telefono") ?? "").trim() || null,
  };

  const estadoIdRaw = String(formData.get("estado_id") ?? "").trim();
  if (estadoIdRaw) {
    const estadoId = Number(estadoIdRaw);
    if (Number.isFinite(estadoId)) {
      payload.estado_id = estadoId;
    }
  }

  const result = await updateRefugioWithCompat(refugioId, payload);
  if (!result.ok) {
    console.error("Error actualizando refugio desde moderación:", result.error);
    return actionError("error-guardar");
  }

  revalidateRefugioPaths(refugioId);
  return actionSuccess("refugio-actualizado");
}
