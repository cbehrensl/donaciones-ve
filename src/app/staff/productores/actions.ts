"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { Urgencia } from "@/lib/types";

function isAuthorized(formData: FormData): boolean {
  return isModeratorTokenValid(formData.get("token"));
}

// ============================================================
// PRODUCTORES — Moderación
// ============================================================

export async function verificarProductor(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const productorId = String(formData.get("productorId") ?? "").trim();
  const verificado = formData.get("verificado") === "true";
  if (!productorId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("productores")
    .update({ verificado, activo: true })
    .eq("id", productorId);

  if (error) {
    console.error("Error verificando productor:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/productores");
  return actionSuccess(verificado ? "productor-verificado" : "productor-pendiente");
}

export async function ocultarProductor(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const productorId = String(formData.get("productorId") ?? "").trim();
  if (!productorId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("productores")
    .update({ activo: false })
    .eq("id", productorId);

  if (error) {
    console.error("Error ocultando productor:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/productores");
  return actionSuccess("productor-oculto");
}

export async function mostrarProductor(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const productorId = String(formData.get("productorId") ?? "").trim();
  if (!productorId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("productores")
    .update({ activo: true })
    .eq("id", productorId);

  if (error) {
    console.error("Error mostrando productor:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/productores");
  return actionSuccess("productor-visible");
}

// ============================================================
// COCINAS — Moderación
// ============================================================

export async function verificarCocina(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const cocinaId = String(formData.get("cocinaId") ?? "").trim();
  const verificado = formData.get("verificado") === "true";
  if (!cocinaId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("cocinas_comunitarias")
    .update({ verificado, activo: true })
    .eq("id", cocinaId);

  if (error) {
    console.error("Error verificando cocina:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/cocinas");
  return actionSuccess(verificado ? "cocina-verificada" : "cocina-pendiente");
}

export async function ocultarCocina(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const cocinaId = String(formData.get("cocinaId") ?? "").trim();
  if (!cocinaId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("cocinas_comunitarias")
    .update({ activo: false })
    .eq("id", cocinaId);

  if (error) {
    console.error("Error ocultando cocina:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/cocinas");
  return actionSuccess("cocina-oculta");
}

export async function mostrarCocina(formData: FormData): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const cocinaId = String(formData.get("cocinaId") ?? "").trim();
  if (!cocinaId) return actionError("datos-invalidos");

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("cocinas_comunitarias")
    .update({ activo: true })
    .eq("id", cocinaId);

  if (error) {
    console.error("Error mostrando cocina:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/cocinas");
  return actionSuccess("cocina-visible");
}

// ============================================================
// NECESIDADES COCINA — Moderación
// ============================================================

export async function actualizarUrgenciaNecesidadMod(
  formData: FormData,
): Promise<ActionResult> {
  if (!isAuthorized(formData)) return actionError("no-autorizado");
  const necesidadId = String(formData.get("necesidadId") ?? "").trim();
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

  if (!necesidadId || !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)) {
    return actionError("datos-invalidos");
  }

  const supabase = requireSupabaseServiceClient();
  const { error } = await supabase
    .from("necesidades_cocina")
    .update({ urgencia })
    .eq("id", necesidadId);

  if (error) {
    console.error("Error actualizando urgencia:", error.message);
    return actionError("error-guardar");
  }

  revalidatePath("/staff/productores");
  revalidatePath("/cocinas");
  return actionSuccess("necesidad-actualizada");
}
