"use server";

import { revalidatePath } from "next/cache";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-feedback";
import { getProductorForManagement } from "@/lib/data-productores";
import { requireSupabaseServiceClient } from "@/lib/supabase";
import type { CategoriaProductor } from "@/lib/types";

const CATEGORIAS_VALIDAS: CategoriaProductor[] = [
  "proteinas",
  "vegetales",
  "no_perecederos",
  "lacteos",
  "granos",
  "frutas",
  "otros",
];

async function assertProductorAccess(
  productorId: string,
  codigo: string,
): Promise<boolean> {
  const productor = await getProductorForManagement(productorId, codigo);
  return productor !== null;
}

function getCodigo(formData: FormData): string {
  return String(formData.get("codigo") ?? "").trim();
}

function getProductorId(formData: FormData): string {
  return String(formData.get("productorId") ?? "").trim();
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

function getCategorias(formData: FormData): CategoriaProductor[] {
  const values = formData.getAll("categorias");
  return values
    .map((v) => String(v))
    .filter((v): v is CategoriaProductor =>
      CATEGORIAS_VALIDAS.includes(v as CategoriaProductor),
    );
}

export async function actualizarDetallesProductor(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const productorId = getProductorId(formData);
    const codigo = getCodigo(formData);

    if (!productorId || !codigo) return actionError("datos-invalidos");

    const hasAccess = await assertProductorAccess(productorId, codigo);
    if (!hasAccess) return actionError("no-autorizado");

    const contacto = getOptionalString(formData, "contacto");
    const descripcion = getOptionalString(formData, "descripcion");
    const ubicacionUrl = getOptionalUrl(formData.get("ubicacion_url"));
    const categorias = getCategorias(formData);

    if (categorias.length === 0) return actionError("datos-invalidos");

    const supabase = requireSupabaseServiceClient();
    const { error } = await supabase
      .from("productores")
      .update({
        contacto,
        descripcion,
        ubicacion_url: ubicacionUrl,
        categorias,
      })
      .eq("id", productorId);

    if (error) {
      console.error("Error actualizando productor:", error.message);
      return actionError("error-guardar");
    }

    revalidatePath(`/productores/${productorId}`);
    revalidatePath("/productores");
    return actionSuccess("productor-actualizado");
  } catch (err) {
    console.error("Error inesperado actualizando productor:", err);
    return actionError("error-guardar");
  }
}
