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
import type { CategoriaProductor, CrearProductorResult } from "@/lib/types";

const CATEGORIAS_VALIDAS: CategoriaProductor[] = [
  "proteinas",
  "vegetales",
  "no_perecederos",
  "lacteos",
  "granos",
  "frutas",
  "otros",
];

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

function getCategorias(formData: FormData): CategoriaProductor[] {
  const values = formData.getAll("categorias");
  return values
    .map((v) => String(v))
    .filter((v): v is CategoriaProductor =>
      CATEGORIAS_VALIDAS.includes(v as CategoriaProductor),
    );
}

export async function crearProductor(
  formData: FormData,
): Promise<CrearProductorResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  try {
    const nombre = getRequiredString(formData, "nombre");
    const municipioId = getRequiredString(formData, "municipio_id");
    const responsableNombre = getRequiredString(formData, "responsable_nombre");
    const responsableTelefono = getRequiredString(formData, "responsable_telefono");
    const descripcion = getOptionalString(formData, "descripcion");
    const contacto = getOptionalString(formData, "contacto");
    const ubicacionUrl = getOptionalUrl(formData, "ubicacion_url");
    const categorias = getCategorias(formData);

    if (categorias.length === 0) {
      return { ok: false, message: "Selecciona al menos una categoría de donación." };
    }

    const codigoGestion = generateManagementCode();
    const codigoHash = hashManagementCode(codigoGestion);
    const productorId = randomUUID();

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
      .from("productores")
      .insert({
        id: productorId,
        nombre,
        descripcion,
        contacto,
        ubicacion_url: ubicacionUrl,
        municipio_id: municipioId,
        estado_id: municipio.estado_id,
        categorias,
        responsable_nombre: responsableNombre,
        responsable_telefono: responsableTelefono,
        codigo_gestion_hash: codigoHash,
        verificado: false,
        activo: true,
      });

    if (error) {
      console.error("Error creando productor:", error?.message);
      return { ok: false, message: error?.message ?? "No se pudo registrar el productor." };
    }

    revalidatePath("/productores");

    return {
      ok: true,
      productorId,
      codigoGestion: formatManagementCodeDisplay(codigoGestion),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    return { ok: false, message };
  }
}
