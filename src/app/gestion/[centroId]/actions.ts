"use server";

import { revalidatePath } from "next/cache";
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

export async function actualizarDetallesCentro(formData: FormData): Promise<void> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = String(formData.get("codigo") ?? "");
  const contacto = String(formData.get("contacto") ?? "").trim() || null;
  const estadoVialidad = String(formData.get("vialidad") ?? "").trim() || null;
  const ubicacionUrl = parseOptionalUrl(formData.get("ubicacion_url"));

  if (!(await assertCentroAccess(centroId, codigo))) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  await supabase
    .from("centros_acopio")
    .update({
      telefono_contacto: contacto,
      detalle_vias: estadoVialidad,
      ubicacion_url: ubicacionUrl,
    })
    .eq("id", centroId);

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
}

export async function actualizarUrgenciaNecesidad(formData: FormData): Promise<void> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = String(formData.get("codigo") ?? "");
  const necesidadId = String(formData.get("necesidadId") ?? "");
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;

  if (
    !(await assertCentroAccess(centroId, codigo)) ||
    !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)
  ) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  await supabase
    .from("necesidades")
    .update({ nivel_urgencia: mapUrgenciaToDb(urgencia) })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
}

export async function eliminarNecesidad(formData: FormData): Promise<void> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = String(formData.get("codigo") ?? "");
  const necesidadId = String(formData.get("necesidadId") ?? "");

  if (!(await assertCentroAccess(centroId, codigo))) {
    return;
  }

  const supabase = requireSupabaseServiceClient();
  await supabase
    .from("necesidades")
    .update({ activo: false })
    .eq("id", necesidadId)
    .eq("centro_id", centroId);

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
}

export async function agregarNecesidad(formData: FormData): Promise<void> {
  const centroId = String(formData.get("centroId") ?? "");
  const codigo = String(formData.get("codigo") ?? "");
  const tipoInsumo = String(formData.get("tipo_insumo") ?? "") as TipoInsumo;
  const urgencia = String(formData.get("urgencia") ?? "") as Urgencia;
  const detalle = String(formData.get("detalle") ?? "").trim() || null;

  const supabase = requireSupabaseServiceClient();
  const { data: categoria } = await supabase
    .from("categorias_insumo")
    .select("id")
    .eq("nombre", tipoInsumo)
    .eq("activo", true)
    .maybeSingle();

  if (
    !(await assertCentroAccess(centroId, codigo)) ||
    !categoria ||
    !["URGENTE", "MEDIA", "SATURADO"].includes(urgencia)
  ) {
    return;
  }

  await supabase.from("necesidades").upsert(
    {
    centro_id: centroId,
      categoria_id: categoria.id,
      nivel_urgencia: mapUrgenciaToDb(urgencia),
      descripcion: detalle,
      activo: true,
    },
    { onConflict: "centro_id,categoria_id" },
  );

  revalidatePath("/");
  revalidatePath(`/gestion/${centroId}`);
}
