import { hashManagementCode } from "@/lib/gestion-code";
import {
  createSupabaseClient,
  createSupabaseServiceClient,
  requireSupabaseServiceClient,
} from "@/lib/supabase";
import type {
  CentroAcopio,
  CentroAcopioPrivado,
  Estado,
  ModeracionResumen,
  Municipio,
  Necesidad,
  Urgencia,
} from "@/lib/types";

function mapUrgenciaFromDb(value: unknown): Urgencia {
  if (value === "urgente" || value === "URGENTE") return "URGENTE";
  if (value === "saturado" || value === "SATURADO") return "SATURADO";
  return "MEDIA";
}

export function mapUrgenciaToDb(value: Urgencia): "urgente" | "medio" | "saturado" {
  if (value === "URGENTE") return "urgente";
  if (value === "SATURADO") return "saturado";
  return "medio";
}

type CategoriaInsumoRelation =
  | { id?: unknown; nombre?: unknown }
  | { id?: unknown; nombre?: unknown }[]
  | null
  | undefined;

function normalizeCategoriaNombre(raw: CategoriaInsumoRelation): string {
  const categoria = Array.isArray(raw) ? raw[0] : raw;
  return categoria?.nombre ? String(categoria.nombre) : "Otros";
}

function normalizeNecesidad(raw: Record<string, unknown>): Necesidad {
  const descripcion = raw.descripcion ? String(raw.descripcion) : null;
  const cantidad = raw.cantidad_estimada ? String(raw.cantidad_estimada) : null;
  const detalle =
    descripcion && cantidad
      ? `${descripcion} (${cantidad})`
      : descripcion ?? cantidad;

  return {
    id: String(raw.id),
    centro_id: String(raw.centro_id),
    categoria_id: raw.categoria_id ? String(raw.categoria_id) : undefined,
    tipo_insumo: normalizeCategoriaNombre(
      raw.categorias_insumo as CategoriaInsumoRelation,
    ),
    urgencia: mapUrgenciaFromDb(raw.nivel_urgencia ?? raw.urgencia),
    detalle,
    updated_at: String(
      raw.ultima_actualizacion ?? raw.updated_at ?? new Date().toISOString(),
    ),
  };
}

function normalizeEstado(raw: Record<string, unknown>): Estado {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
  };
}

function normalizeMunicipio(raw: Record<string, unknown>): Municipio {
  const estadoRaw = raw.estado;

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    estado_id: String(raw.estado_id),
    estado:
      estadoRaw && !Array.isArray(estadoRaw)
        ? normalizeEstado(estadoRaw as Record<string, unknown>)
        : null,
  };
}

export async function getEstados(): Promise<Estado[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("estados")
    .select("id, nombre")
    .order("nombre");

  if (error) {
    console.error("Error cargando estados:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeEstado(row as Record<string, unknown>));
}

function normalizeCentro(raw: Record<string, unknown>): CentroAcopio {
  const municipiosRaw = raw.municipios;
  const municipio = Array.isArray(municipiosRaw)
    ? municipiosRaw[0]
    : municipiosRaw;
  const estatus = String(raw.estatus ?? "activo");

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    direccion: String(raw.direccion),
    municipio_id: String(raw.municipio_id),
    estatus,
    ubicacion_url: raw.ubicacion_url ? String(raw.ubicacion_url) : null,
    contacto: raw.telefono_contacto
      ? String(raw.telefono_contacto)
      : raw.contacto
        ? String(raw.contacto)
        : null,
    estado_vialidad: raw.detalle_vias
      ? String(raw.detalle_vias)
      : raw.estado_vialidad
        ? String(raw.estado_vialidad)
        : null,
    verificado: Boolean(raw.verificado),
    activo: estatus !== "cerrado" && raw.activo !== false,
    updated_at: String(raw.updated_at),
    municipios: municipio
      ? normalizeMunicipio(municipio as Record<string, unknown>)
      : null,
    necesidades: Array.isArray(raw.necesidades)
      ? raw.necesidades
          .filter((n) => (n as Record<string, unknown>).activo !== false)
          .map((n) => normalizeNecesidad(n as Record<string, unknown>))
      : [],
  };
}

function normalizeCentroPrivado(raw: Record<string, unknown>): CentroAcopioPrivado {
  return {
    ...normalizeCentro(raw),
    responsable_nombre: String(
      raw.nombre_responsable ?? raw.responsable_nombre ?? "",
    ),
    responsable_telefono: String(
      raw.telefono_responsable ?? raw.responsable_telefono ?? "",
    ),
  };
}

export async function getMunicipios(estadoId?: string): Promise<Municipio[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("municipios")
    .select("id, nombre, estado_id")
    .order("nombre");

  if (estadoId) {
    query = query.eq("estado_id", estadoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error cargando municipios:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeMunicipio(row as Record<string, unknown>),
  );
}

export async function getCentrosAcopio(
  filters?: { municipioId?: string; estadoId?: string },
): Promise<CentroAcopio[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("centros_acopio")
    .select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      estatus,
      verificado,
      updated_at,
      municipios ( id, nombre, estado_id ),
      necesidades (
        id,
        centro_id,
        categoria_id,
        nivel_urgencia,
        cantidad_estimada,
        descripcion,
        ultima_actualizacion,
        activo,
        categorias_insumo ( id, nombre )
      )
    `,
    )
    .in("estatus", ["activo", "saturado", "sin_verificar"])
    .or("es_domicilio_privado.eq.false,es_domicilio_privado.is.null")
    .order("nombre");

  if (filters?.municipioId) {
    query = query.eq("municipio_id", filters.municipioId);
  }

  if (filters?.estadoId) {
    query = query.eq("estado_id", filters.estadoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error cargando centros:", error.message);
    return [];
  }

  const centros = (data ?? []).map((row) =>
    normalizeCentro(row as Record<string, unknown>),
  );

  return centros;
}

export async function getCentrosParaModeracion(): Promise<CentroAcopio[]> {
  const supabase = requireSupabaseServiceClient();

  const { data, error } = await supabase
    .from("centros_acopio")
    .select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      estatus,
      verificado,
      updated_at,
      municipios ( id, nombre, estado_id ),
      necesidades (
        id,
        centro_id,
        categoria_id,
        nivel_urgencia,
        cantidad_estimada,
        descripcion,
        ultima_actualizacion,
        activo,
        categorias_insumo ( id, nombre )
      )
    `,
    )
    .order("verificado", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error cargando centros para moderación:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeCentro(row as Record<string, unknown>),
  );
}

export async function getResumenModeracion(): Promise<ModeracionResumen> {
  const supabase = requireSupabaseServiceClient();

  const [centrosResult, necesidadesResult] = await Promise.all([
    supabase.from("centros_acopio").select("estatus, verificado"),
    supabase.from("necesidades").select("nivel_urgencia, activo"),
  ]);

  if (centrosResult.error) {
    console.error("Error cargando resumen de centros:", centrosResult.error.message);
  }

  if (necesidadesResult.error) {
    console.error(
      "Error cargando resumen de necesidades:",
      necesidadesResult.error.message,
    );
  }

  const centros = centrosResult.data ?? [];
  const necesidades = necesidadesResult.data ?? [];
  const ocultos = centros.filter((centro) => centro.estatus === "cerrado").length;
  const visibles = centros.length - ocultos;

  return {
    total: centros.length,
    visibles,
    pendientes: centros.filter(
      (centro) => centro.estatus !== "cerrado" && !centro.verificado,
    ).length,
    verificados: centros.filter(
      (centro) => centro.estatus !== "cerrado" && centro.verificado,
    ).length,
    ocultos,
    urgencias: necesidades.filter(
      (necesidad) =>
        necesidad.activo !== false && necesidad.nivel_urgencia === "urgente",
    ).length,
  };
}

export async function getCentroById(centroId: string): Promise<CentroAcopio | null> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("centros_acopio")
    .select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      estatus,
      verificado,
      updated_at,
      municipios ( id, nombre, estado_id ),
      necesidades (
        id,
        centro_id,
        categoria_id,
        nivel_urgencia,
        cantidad_estimada,
        descripcion,
        ultima_actualizacion,
        activo,
        categorias_insumo ( id, nombre )
      )
    `,
    )
    .eq("id", centroId)
    .in("estatus", ["activo", "saturado", "sin_verificar"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeCentro(data as Record<string, unknown>);
}

export async function getCentroByManagementCode(
  code: string,
): Promise<{ centro: CentroAcopioPrivado; codigoHash: string } | null> {
  const supabase = requireSupabaseServiceClient();
  const codigoHash = hashManagementCode(code);

  const { data, error } = await supabase
    .from("centros_acopio")
    .select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      nombre_responsable,
      telefono_responsable,
      estatus,
      verificado,
      updated_at,
      municipios ( id, nombre, estado_id ),
      necesidades (
        id,
        centro_id,
        categoria_id,
        nivel_urgencia,
        cantidad_estimada,
        descripcion,
        ultima_actualizacion,
        activo,
        categorias_insumo ( id, nombre )
      )
    `,
    )
    .eq("codigo_gestion_hash", codigoHash)
    .in("estatus", ["activo", "saturado", "sin_verificar"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    centro: normalizeCentroPrivado(data as Record<string, unknown>),
    codigoHash,
  };
}

export async function getCentroForManagement(
  centroId: string,
  code: string,
): Promise<CentroAcopioPrivado | null> {
  const supabase = requireSupabaseServiceClient();
  const codigoHash = hashManagementCode(code);

  const { data, error } = await supabase
    .from("centros_acopio")
    .select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      nombre_responsable,
      telefono_responsable,
      codigo_gestion_hash,
      estatus,
      verificado,
      updated_at,
      municipios ( id, nombre, estado_id ),
      necesidades (
        id,
        centro_id,
        categoria_id,
        nivel_urgencia,
        cantidad_estimada,
        descripcion,
        ultima_actualizacion,
        activo,
        categorias_insumo ( id, nombre )
      )
    `,
    )
    .eq("id", centroId)
    .eq("codigo_gestion_hash", codigoHash)
    .in("estatus", ["activo", "saturado", "sin_verificar"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeCentroPrivado(data as Record<string, unknown>);
}

export function formatCentroPlainText(centro: CentroAcopio): string {
  const municipio = centro.municipios?.nombre ?? "Sin municipio";
  const necesidades = centro.necesidades ?? [];

  const lineasNecesidades =
    necesidades.length > 0
      ? necesidades
          .map(
            (item) =>
              `- [${item.urgencia}] ${item.tipo_insumo}${item.detalle ? `: ${item.detalle}` : ""}`,
          )
          .join("\n")
      : "- Sin necesidades reportadas";

  return [
    `CENTRO: ${centro.nombre}`,
    `Municipio: ${municipio}`,
    `Dirección: ${centro.direccion}`,
    centro.contacto ? `Contacto: ${centro.contacto}` : null,
    centro.ubicacion_url ? `Ubicación: ${centro.ubicacion_url}` : null,
    centro.estado_vialidad ? `Vialidad: ${centro.estado_vialidad}` : null,
    `Verificado: ${centro.verificado ? "Sí" : "Pendiente"}`,
    "NECESIDADES:",
    lineasNecesidades,
    `Actualizado: ${new Date(centro.updated_at).toLocaleString("es-VE")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
