"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { getCocinaForManagement } from "@/lib/data-productores";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { Urgencia } from "@/lib/types";

async function assertCocinaAccess(cocinaId: string, codigo: string): Promise<boolean> {
  const cocina = await getCocinaForManagement(cocinaId, codigo);
  return cocina !== null;
}

function getCodigo(formData: FormData): string {
  return String(formData.get("codigo") ?? "").trim();
}

function getCocinaId(formData: FormData): string {
  return String(formData.get("cocinaId") ?? "").trim();
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function getOptionalUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function actualizarDetallesCocina(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const cocinaId = getCocinaId(formData);
    const codigo = getCodigo(formData);

    if (!cocinaId || !codigo) return actionError("datos-invalidos");

    const hasAccess = await assertCocinaAccess(cocinaId, codigo);
    if (!hasAccess) return actionError("no-autorizado");

    const contacto = getOptionalString(formData, "contacto");
    const ubicacionUrl = getOptionalUrl(formData.get("ubicacion_url"));
    const horario = getOptionalString(formData, "horario");
    const capacidadRaw = formData.get("capacidad_beneficiarios");
    const capacidadBeneficiarios =
      typeof capacidadRaw === "string" && capacidadRaw.trim()
        ? parseInt(capacidadRaw.trim(), 10) || null
        : null;

    const supabase = requireSupabaseServiceClient();
    const { error } = await supabase
      .from("cocinas_comunitarias")
      .update({
        contacto,
        ubicacion_url: ubicacionUrl,
        horario,
        capacidad_beneficiarios: capacidadBeneficiarios,
      })
      .eq("id", cocinaId);

    if (error) {
      console.error("Error actualizando cocina:", error.message);
      return actionError("error-guardar");
    }

    revalidatePath(`/cocinas/${cocinaId}`);
    revalidatePath("/cocinas");
    return actionSuccess("cocina-actualizada");
  } catch (err) {
    console.error("Error inesperado actualizando cocina:", err);
    return actionError("error-guardar");
  }
}

export async function agregarNecesidadCocina(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const cocinaId = getCocinaId(formData);
    const codigo = getCodigo(formData);

    if (!cocinaId || !codigo) return actionError("datos-invalidos");

    const hasAccess = await assertCocinaAccess(cocinaId, codigo);
    if (!hasAccess) return actionError("no-autorizado");

    const categoria = String(formData.get("categoria") ?? "").trim();
    const urgencia = String(formData.get("urgencia") ?? "MEDIA") as Urgencia;
    const detalle = getOptionalString(formData, "detalle");

    if (!categoria || !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) {
      return actionError("datos-invalidos");
    }

    const supabase = requireSupabaseServiceClient();
    const { error } = await supabase.from("necesidades_cocina").insert({
      cocina_id: cocinaId,
      categoria,
      urgencia,
      detalle,
    });

    if (error) {
      console.error("Error agregando necesidad:", error.message);
      return actionError("error-guardar");
    }

    revalidatePath(`/cocinas/${cocinaId}`);
    revalidatePath("/cocinas");
    return actionSuccess("necesidad-agregada");
  } catch (err) {
    console.error("Error inesperado agregando necesidad:", err);
    return actionError("error-guardar");
  }
}

export async function actualizarUrgenciaNecesidadCocina(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const cocinaId = getCocinaId(formData);
    const codigo = getCodigo(formData);
    const necesidadId = String(formData.get("necesidadId") ?? "").trim();
    const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

    if (!cocinaId || !codigo || !necesidadId) return actionError("datos-invalidos");
    if (!["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) return actionError("datos-invalidos");

    const hasAccess = await assertCocinaAccess(cocinaId, codigo);
    if (!hasAccess) return actionError("no-autorizado");

    const supabase = requireSupabaseServiceClient();
    const { error } = await supabase
      .from("necesidades_cocina")
      .update({ urgencia })
      .eq("id", necesidadId)
      .eq("cocina_id", cocinaId);

    if (error) {
      console.error("Error actualizando urgencia:", error.message);
      return actionError("error-guardar");
    }

    revalidatePath(`/cocinas/${cocinaId}`);
    revalidatePath("/cocinas");
    return actionSuccess("necesidad-actualizada");
  } catch (err) {
    console.error("Error inesperado actualizando urgencia:", err);
    return actionError("error-guardar");
  }
}

export async function eliminarNecesidadCocina(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const cocinaId = getCocinaId(formData);
    const codigo = getCodigo(formData);
    const necesidadId = String(formData.get("necesidadId") ?? "").trim();

    if (!cocinaId || !codigo || !necesidadId) return actionError("datos-invalidos");

    const hasAccess = await assertCocinaAccess(cocinaId, codigo);
    if (!hasAccess) return actionError("no-autorizado");

    const supabase = requireSupabaseServiceClient();
    const { error } = await supabase
      .from("necesidades_cocina")
      .update({ activo: false })
      .eq("id", necesidadId)
      .eq("cocina_id", cocinaId);

    if (error) {
      console.error("Error eliminando necesidad:", error.message);
      return actionError("error-guardar");
    }

    revalidatePath(`/cocinas/${cocinaId}`);
    revalidatePath("/cocinas");
    return actionSuccess("necesidad-eliminada");
  } catch (err) {
    console.error("Error inesperado eliminando necesidad:", err);
    return actionError("error-guardar");
  }
}
