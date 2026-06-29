import { requireSupabaseServiceClient } from "@/lib/supabase";
import { mapUrgenciaToDb } from "@/lib/data";
import type { Urgencia } from "@/lib/types";

export interface CentroCandidate {
  id: string;
  nombre: string;
  municipio: string | null;
  estadoId: string | null;
}

export async function buscarCentrosPorHint(params: {
  centroHint?: string;
  estado?: string;
  municipio?: string;
  limit?: number;
}): Promise<CentroCandidate[]> {
  const supabase = requireSupabaseServiceClient();
  const limit = Math.min(Math.max(params.limit ?? 6, 1), 12);

  let query = supabase
    .from("centros_acopio")
    .select("id, nombre, estado_id, municipios(nombre)")
    .neq("estatus", "cerrado")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (params.centroHint?.trim()) {
    query = query.ilike("nombre", `%${params.centroHint.trim()}%`);
  }

  if (params.estado?.trim()) {
    const { data: estadoRows } = await supabase
      .from("estados")
      .select("id")
      .ilike("nombre", `%${params.estado.trim()}%`)
      .limit(1);

    const estadoId = estadoRows?.[0]?.id;
    if (estadoId) {
      query = query.eq("estado_id", estadoId);
    }
  }

  if (params.municipio?.trim()) {
    const { data: munRows } = await supabase
      .from("municipios")
      .select("id")
      .ilike("nombre", `%${params.municipio.trim()}%`)
      .limit(5);

    const munIds = (munRows ?? []).map((row) => row.id);
    if (munIds.length > 0) {
      query = query.in("municipio_id", munIds);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error buscando centros por hint:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const municipioRaw = Array.isArray(row.municipios)
      ? row.municipios[0]
      : row.municipios;

    return {
      id: String(row.id),
      nombre: String(row.nombre),
      municipio:
        municipioRaw && typeof municipioRaw === "object" && "nombre" in municipioRaw
          ? String((municipioRaw as Record<string, unknown>).nombre)
          : null,
      estadoId: row.estado_id ? String(row.estado_id) : null,
    };
  });
}

export async function resolverCategoriaIdPorNombre(
  categoriaInsumo: string,
): Promise<string | null> {
  const supabase = requireSupabaseServiceClient();
  const input = categoriaInsumo.trim();

  if (!input) {
    return null;
  }

  const { data, error } = await supabase
    .from("categorias_insumo")
    .select("id, nombre")
    .eq("activo", true)
    .ilike("nombre", `%${input}%`)
    .order("nombre")
    .limit(1);

  if (error) {
    console.error("Error resolviendo categoria:", error.message);
    return null;
  }

  const first = data?.[0];
  return first?.id ? String(first.id) : null;
}

export async function registrarAlertaCentro(params: {
  centroId: string;
  tipo: "NECESIDAD_URGENTE" | "INSUMO_SATURADO" | "ACTUALIZACION_CENTRO";
  mensaje: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase.from("alertas_centro").insert({
    centro_id: params.centroId,
    tipo: params.tipo,
    mensaje: params.mensaje,
    metadata: params.metadata ?? null,
    visible_publico: params.tipo !== "ACTUALIZACION_CENTRO",
  });

  if (error) {
    if (!error.message.toLowerCase().includes("relation \"alertas_centro\" does not exist")) {
      console.error("Error registrando alerta:", error.message);
    }
  }
}

export async function aplicarActualizacionNecesidad(params: {
  centroId: string;
  categoriaInsumo: string;
  urgencia: Urgencia;
  detalle?: string | null;
  origen: "chat" | "manual";
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = requireSupabaseServiceClient();
  const categoriaId = await resolverCategoriaIdPorNombre(params.categoriaInsumo);

  if (!categoriaId) {
    return { ok: false, error: "No se encontró una categoría válida para ese insumo." };
  }

  const detalle = params.detalle?.trim() ? params.detalle.trim() : null;

  const { error } = await supabase.from("necesidades").upsert(
    {
      centro_id: params.centroId,
      categoria_id: Number(categoriaId),
      nivel_urgencia: mapUrgenciaToDb(params.urgencia),
      descripcion: detalle,
      activo: true,
    },
    { onConflict: "centro_id,categoria_id" },
  );

  if (error) {
    console.error("Error aplicando actualizacion de necesidad:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
