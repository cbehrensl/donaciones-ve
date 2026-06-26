"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { getCentroForManagement, mapUrgenciaToDb } from "@/lib/data";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { TipoInsumo, Urgencia } from "@/lib/types";

async function assertCentroAccess(
  centroId: string,
  codigo: string,
): Promise<boolean> {
  const centro = await getCentroForManagement(centroId, codigo);
  return centro !== null;
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

function getCodigo(formData: FormData): string {
  return String(formData.get("codigo") ?? "").trim();
}

export async function actualizarDetallesCentro(
  formData: FormData,
): Promise<ActionResult> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = getCodigo(formData);
  const contacto = String(formData.get("contacto") ?? "").trim() || null;
  const estadoVialidad = String(formData.get("vialidad") ?? "").trim() || null;
  const ubicacionUrl = parseOptionalUrl(formData.get("ubicacion_url"));
  const fechaInicioRecepcion = parseOptionalDate(
    formData.get("fecha_inicio_recepcion"),
  );
  const fechaFinRecepcion = parseOptionalDate(formData.get("fecha_fin_recepcion"));
  const horarioRecepcion =
    String(formData.get("horario_recepcion") ?? "").trim() || null;

  if (!centroId || !codigo) {
    return actionError("datos-invalidos");
  }

  if (!(await assertCentroAccess(centroId, codigo))) {
    return actionError("acceso-denegado");
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
      telefono_contacto: contacto,
      detalle_vias: estadoVialidad,
      ubicacion_url: ubicacionUrl,
      fecha_inicio_recepcion: fechaInicioRecepcion,
      fecha_fin_recepcion: fechaFinRecepcion,
      horario_recepcion: horarioRecepcion,
    })
    .eq("id", centroId);

  if (error) {
    console.error("Error actualizando detalles del centro:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
  return actionSuccess("detalles-guardados");
}

export async function actualizarUrgenciaNecesidad(
  formData: FormData,
): Promise<ActionResult> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = getCodigo(formData);
  const necesidadId = String(formData.get("necesidadId") ?? "");
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

  if (
    !centroId ||
    !codigo ||
    !necesidadId ||
    !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)
  ) {
    return actionError("datos-invalidos");
  }

  if (!(await assertCentroAccess(centroId, codigo))) {
    return actionError("acceso-denegado");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ nivel_urgencia: mapUrgenciaToDb(urgencia) })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  if (error) {
    console.error("Error actualizando urgencia:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
  return actionSuccess("insumo-actualizado");
}

export async function eliminarNecesidad(
  formData: FormData,
): Promise<ActionResult> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = getCodigo(formData);
  const necesidadId = String(formData.get("necesidadId") ?? "");

  if (!centroId || !codigo || !necesidadId) {
    return actionError("datos-invalidos");
  }

  if (!(await assertCentroAccess(centroId, codigo))) {
    return actionError("acceso-denegado");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades")
    .update({ activo: false })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  if (error) {
    console.error("Error eliminando necesidad:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
  return actionSuccess("insumo-eliminado");
}

export async function agregarNecesidad(
  formData: FormData,
): Promise<ActionResult> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = getCodigo(formData);
  const tipoInsumo = String(formData.get("tipo_insumo") ?? "") as TipoInsumo;
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;
  const detalle = String(formData.get("detalle") ?? "").trim() || null;

  if (!centroId || !codigo) {
    return actionError("datos-invalidos");
  }

  if (!(await assertCentroAccess(centroId, codigo))) {
    return actionError("acceso-denegado");
  }

  const supabase = requireSupabaseServiceClient();
  const { data: categoria } = await supabase
    .from("categorias_insumo")
    .select("id")
    .eq("nombre", tipoInsumo)
    .eq("activo", true)
    .maybeSingle();

  if (!categoria || !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) {
    return actionError("datos-invalidos");
  }

  const { error } = await supabase.from("necesidades").upsert(
    {
      centro_id: centroId,
      categoria_id: categoria.id,
      nivel_urgencia: mapUrgenciaToDb(urgencia),
      descripcion: detalle,
      activo: true,
    },
    { onConflict: "centro_id,categoria_id" },
  );

  if (error) {
    console.error("Error agregando necesidad:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
  return actionSuccess("insumo-agregado");
}
