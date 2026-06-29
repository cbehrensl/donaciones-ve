import { hashManagementCode } from "@/lib/gestion-code";
import { filtrarAlertasActivas } from "@/lib/alertas";
import {
  createSupabaseClient,
  createSupabaseServiceClient,
  requireSupabaseServiceClient,
} from "@/lib/supabase";
import type {
  AlertaCentro,
  CategoriaInsumo,
  CentroAcopio,
  ContactoEmergencia,
  DataLoadError,
  CentroAcopioPrivado,
  Estado,
  HomeSearchFilters,
  HomeSearchMeta,
  ModeracionSearchFilters,
  ModeracionSearchMeta,
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

function normalizeAlertaCentro(raw: Record<string, unknown>): AlertaCentro {
  const centroRaw = raw.centros_acopio;
  const centro =
    Array.isArray(centroRaw) && centroRaw.length > 0
      ? (centroRaw[0] as Record<string, unknown>)
      : centroRaw && !Array.isArray(centroRaw)
        ? (centroRaw as Record<string, unknown>)
        : null;
  const municipioRaw = centro?.municipios;
  const municipio =
    Array.isArray(municipioRaw) && municipioRaw.length > 0
      ? (municipioRaw[0] as Record<string, unknown>)
      : municipioRaw && !Array.isArray(municipioRaw)
        ? (municipioRaw as Record<string, unknown>)
        : null;

  return {
    id: String(raw.id),
    centro_id: String(raw.centro_id),
    tipo: String(raw.tipo) as AlertaCentro["tipo"],
    mensaje: String(raw.mensaje),
    metadata:
      raw.metadata && typeof raw.metadata === "object"
        ? (raw.metadata as Record<string, unknown>)
        : null,
    expires_at:
      raw.expires_at && typeof raw.expires_at === "string"
        ? raw.expires_at
        : null,
    created_at: String(raw.created_at),
    visible_publico: Boolean(raw.visible_publico),
    centros_acopio: centro
      ? {
          id: String(centro.id),
          nombre: String(centro.nombre),
          estado_id: centro.estado_id ? String(centro.estado_id) : null,
          municipio_id: String(centro.municipio_id),
          municipios: municipio
            ? {
                id: String(municipio.id),
                nombre: String(municipio.nombre),
                estado_id: String(municipio.estado_id),
              }
            : null,
        }
      : null,
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

function normalizeContactoEmergencia(
  raw: Record<string, unknown>,
): ContactoEmergencia {
  const estadosRaw = raw.estados;
  const estado = Array.isArray(estadosRaw) ? estadosRaw[0] : estadosRaw;

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    descripcion: raw.descripcion ? String(raw.descripcion) : null,
    categoria: String(raw.categoria),
    telefonos: Array.isArray(raw.telefonos)
      ? raw.telefonos.map((telefono) => String(telefono))
      : [],
    whatsapp: raw.whatsapp ? String(raw.whatsapp) : null,
    zona: raw.zona ? String(raw.zona) : null,
    estado_id: raw.estado_id ? String(raw.estado_id) : null,
    estado_nombre:
      estado && typeof estado === "object" && "nombre" in estado
        ? String((estado as Record<string, unknown>).nombre)
        : null,
    disponible_24h: Boolean(raw.disponible_24h),
    es_gratuito: Boolean(raw.es_gratuito),
  };
}

export function formatTelefonoHref(telefono: string): string {
  return `tel:${telefono.replace(/[^\d+]/g, "")}`;
}

export function formatWhatsappHref(telefono: string): string {
  const normalized = telefono.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}`;
}

function normalizeCategoriaInsumo(raw: Record<string, unknown>): CategoriaInsumo {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
  };
}

function sanitizeSearchTerm(value: string): string {
  return value
    .trim()
    .replace(/[%,'()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
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
    estado_id: raw.estado_id ? String(raw.estado_id) : null,
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
    fecha_inicio_recepcion: raw.fecha_inicio_recepcion
      ? String(raw.fecha_inicio_recepcion)
      : null,
    fecha_fin_recepcion: raw.fecha_fin_recepcion
      ? String(raw.fecha_fin_recepcion)
      : null,
    horario_recepcion: raw.horario_recepcion
      ? String(raw.horario_recepcion)
      : null,
    responsable_nombre: raw.nombre_responsable
      ? String(raw.nombre_responsable)
      : raw.responsable_nombre
        ? String(raw.responsable_nombre)
        : null,
    responsable_telefono: raw.telefono_responsable
      ? String(raw.telefono_responsable)
      : raw.responsable_telefono
        ? String(raw.responsable_telefono)
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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

export async function getHomeData(): Promise<{
  estados: Estado[];
  municipios: Municipio[];
  centros: CentroAcopio[];
  contactosEmergencia: ContactoEmergencia[];
  alertas: AlertaCentro[];
  searchMeta: HomeSearchMeta;
  errors: DataLoadError[];
}> {
  return getHomeDataWithFilters({ q: "", estadoId: "", municipioId: "" });
}

export async function getHomeDataWithFilters(
  filters: HomeSearchFilters,
): Promise<{
  estados: Estado[];
  municipios: Municipio[];
  centros: CentroAcopio[];
  contactosEmergencia: ContactoEmergencia[];
  alertas: AlertaCentro[];
  searchMeta: HomeSearchMeta;
  errors: DataLoadError[];
}> {
  const errors: DataLoadError[] = [];
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();
  const limit = 50;
  const searchTerm = sanitizeSearchTerm(filters.q);

  if (!supabase) {
    return {
      estados: [],
      municipios: [],
      centros: [],
      contactosEmergencia: [],
      alertas: [],
      searchMeta: { limit, reachedLimit: false },
      errors: [
        {
          scope: "Configuración",
          message:
            "No se encontraron las variables de Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.",
        },
      ],
    };
  }

  let centrosQuery = supabase
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
    .order("updated_at", { ascending: false })
    .limit(limit + 1);

  if (filters.estadoId) {
    centrosQuery = centrosQuery.eq("estado_id", filters.estadoId);
  }

  if (filters.municipioId) {
    centrosQuery = centrosQuery.eq("municipio_id", filters.municipioId);
  }

  if (searchTerm) {
    centrosQuery = centrosQuery.or(
      `nombre.ilike.%${searchTerm}%,direccion.ilike.%${searchTerm}%,telefono_contacto.ilike.%${searchTerm}%`,
    );
  }

  const [estadosResult, municipiosResult, centrosResult, contactosResult, alertasResult] =
    await Promise.all([
      supabase.from("estados").select("id, nombre").order("nombre"),
      supabase.from("municipios").select("id, nombre, estado_id").order("nombre"),
      centrosQuery,
      supabase
        .from("contactos_emergencia")
        .select(
          `
          id,
          nombre,
          descripcion,
          categoria,
          telefonos,
          whatsapp,
          zona,
          estado_id,
          disponible_24h,
          es_gratuito,
          estados ( id, nombre )
        `,
        )
        .eq("activo", true)
        .order("categoria")
        .order("nombre"),
      supabase
        .from("alertas_centro")
        .select(
          `
          id,
          centro_id,
          tipo,
          mensaje,
          metadata,
          created_at,
          visible_publico,
          centros_acopio (
            id,
            nombre,
            estado_id,
            municipio_id,
            municipios ( id, nombre, estado_id )
          )
        `,
        )
        .eq("visible_publico", true)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  if (estadosResult.error) {
    errors.push({
      scope: "Estados",
      message: `No se pudieron cargar los estados: ${estadosResult.error.message}`,
    });
  }

  if (municipiosResult.error) {
    errors.push({
      scope: "Municipios",
      message: `No se pudieron cargar los municipios: ${municipiosResult.error.message}`,
    });
  }

  if (centrosResult.error) {
    errors.push({
      scope: "Centros",
      message: `No se pudieron cargar los centros de acopio: ${centrosResult.error.message}`,
    });
  }

  if (contactosResult.error) {
    errors.push({
      scope: "Contactos de emergencia",
      message: `No se pudieron cargar los contactos de emergencia: ${contactosResult.error.message}`,
    });
  }

  if (alertasResult.error) {
    errors.push({
      scope: "Alertas",
      message: `No se pudieron cargar las alertas recientes: ${alertasResult.error.message}`,
    });
  }

  const centrosRows = centrosResult.data ?? [];
  const reachedLimit = centrosRows.length > limit;
  const alertasNormalizadas = (alertasResult.data ?? []).map((row) =>
    normalizeAlertaCentro(row as Record<string, unknown>),
  );
  const alertasActivas = filtrarAlertasActivas(alertasNormalizadas);

  return {
    estados: (estadosResult.data ?? []).map((row) =>
      normalizeEstado(row as Record<string, unknown>),
    ),
    municipios: (municipiosResult.data ?? []).map((row) =>
      normalizeMunicipio(row as Record<string, unknown>),
    ),
    centros: centrosRows.slice(0, limit).map((row) =>
      normalizeCentro(row as Record<string, unknown>),
    ),
    contactosEmergencia: (contactosResult.data ?? []).map((row) =>
      normalizeContactoEmergencia(row as Record<string, unknown>),
    ),
    alertas: alertasActivas,
    searchMeta: { limit, reachedLimit },
    errors,
  };
}

export async function getHubPublicData(): Promise<{
  contactosEmergencia: ContactoEmergencia[];
  errors: DataLoadError[];
}> {
  const errors: DataLoadError[] = [];
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();

  if (!supabase) {
    return {
      contactosEmergencia: [],
      errors: [
        {
          scope: "Configuración",
          message:
            "No se encontraron las variables de Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.",
        },
      ],
    };
  }

  const { data, error } = await supabase
    .from("contactos_emergencia")
    .select(
      `
      id,
      nombre,
      descripcion,
      categoria,
      telefonos,
      whatsapp,
      zona,
      estado_id,
      disponible_24h,
      es_gratuito,
      estados ( id, nombre )
    `,
    )
    .eq("activo", true)
    .order("categoria")
    .order("nombre");

  if (error) {
    errors.push({
      scope: "Contactos de emergencia",
      message: `No se pudieron cargar los contactos de emergencia: ${error.message}`,
    });
  }

  return {
    contactosEmergencia: (data ?? []).map((row) =>
      normalizeContactoEmergencia(row as Record<string, unknown>),
    ),
    errors,
  };
}

export async function getAlertasRecientes(
  limit = 20,
  publicOnly = false,
): Promise<AlertaCentro[]> {
  const supabase = requireSupabaseServiceClient();
  let query = supabase
    .from("alertas_centro")
    .select(
      `
      id,
      centro_id,
      tipo,
      mensaje,
      metadata,
      created_at,
      visible_publico,
      centros_acopio (
        id,
        nombre,
        estado_id,
        municipio_id,
        municipios ( id, nombre, estado_id )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 300));

  if (publicOnly) {
    query = query.eq("visible_publico", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error cargando alertas recientes:", error.message);
    return [];
  }

  const normalizadas = (data ?? []).map((row) =>
    normalizeAlertaCentro(row as Record<string, unknown>),
  );
  return filtrarAlertasActivas(normalizadas).slice(0, Math.max(limit, 1));
}

export async function getCategoriasInsumo(): Promise<CategoriaInsumo[]> {
  const supabase = requireSupabaseServiceClient();
  const { data, error } = await supabase
    .from("categorias_insumo")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error("Error cargando categorías de insumo:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeCategoriaInsumo(row as Record<string, unknown>),
  );
}

export async function getCentrosParaModeracion(
  filters: ModeracionSearchFilters,
): Promise<{ centros: CentroAcopio[]; meta: ModeracionSearchMeta }> {
  const supabase = requireSupabaseServiceClient();
  const searchTerm = sanitizeSearchTerm(filters.q);
  const page = Math.max(0, filters.page);
  const pageSize = Math.min(Math.max(20, filters.pageSize), 100);
  const from = page * pageSize;
  const to = from + pageSize;

  let query = supabase.from("centros_acopio").select(
      `
      id,
      nombre,
      direccion,
      municipio_id,
      estado_id,
      ubicacion_url,
      telefono_contacto,
      detalle_vias,
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
    );

  if (filters.estatus !== "todos") {
    query = query.eq("estatus", filters.estatus);
  }

  if (filters.verificacion === "pendientes") {
    query = query.eq("verificado", false);
  }

  if (filters.verificacion === "verificados") {
    query = query.eq("verificado", true);
  }

  if (filters.estadoId) {
    query = query.eq("estado_id", filters.estadoId);
  }

  if (searchTerm) {
    query = query.or(
      `nombre.ilike.%${searchTerm}%,direccion.ilike.%${searchTerm}%,telefono_contacto.ilike.%${searchTerm}%,detalle_vias.ilike.%${searchTerm}%,nombre_responsable.ilike.%${searchTerm}%,telefono_responsable.ilike.%${searchTerm}%,horario_recepcion.ilike.%${searchTerm}%`,
    );
  }

  const { data, error } = await query
    .order("verificado", { ascending: true })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error cargando centros para moderación:", error.message);
    return {
      centros: [],
      meta: { page, pageSize, hasNextPage: false, hasPrevPage: page > 0 },
    };
  }

  const rows = data ?? [];
  const hasNextPage = rows.length > pageSize;

  return {
    centros: rows
      .slice(0, pageSize)
      .map((row) => normalizeCentro(row as Record<string, unknown>)),
    meta: { page, pageSize, hasNextPage, hasPrevPage: page > 0 },
  };
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
  const disponibilidadFechas =
    centro.fecha_inicio_recepcion && centro.fecha_fin_recepcion
      ? `${centro.fecha_inicio_recepcion} a ${centro.fecha_fin_recepcion}`
      : centro.fecha_inicio_recepcion ?? centro.fecha_fin_recepcion;

  const lineasNecesidades =
    necesidades.length > 0
      ? necesidades
          .map(
            (item) =>
              `- ${item.tipo_insumo}${item.detalle ? `: ${item.detalle}` : ""}`,
          )
          .join("\n")
      : "- Sin insumos específicos reportados. Cualquier donación o apoyo será bien recibido.";

  return [
    `CENTRO: ${centro.nombre}`,
    `Municipio: ${municipio}`,
    `Dirección: ${centro.direccion}`,
    centro.contacto ? `Contacto: ${centro.contacto}` : null,
    centro.ubicacion_url ? `Ubicación: ${centro.ubicacion_url}` : null,
    disponibilidadFechas ? `Rango de fechas: ${disponibilidadFechas}` : null,
    centro.horario_recepcion ? `Horario: ${centro.horario_recepcion}` : null,
    centro.estado_vialidad ? `Vialidad: ${centro.estado_vialidad}` : null,
    `Verificado: ${centro.verificado ? "Sí" : "Pendiente"}`,
    "NECESIDADES:",
    lineasNecesidades,
    `Actualizado: ${new Date(centro.updated_at).toLocaleString("es-VE")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function buscarCentrosPorNecesidadRapida(params: {
  insumo?: string;
  estado?: string;
  municipio?: string;
  urgencia?: Urgencia;
  limit?: number;
}): Promise<CentroAcopio[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();
  if (!supabase) {
    return [];
  }

  const limit = Math.min(Math.max(params.limit ?? 8, 1), 20);
  let estadoId: string | null = null;
  let municipioId: string | null = null;

  if (params.estado?.trim()) {
    const { data } = await supabase
      .from("estados")
      .select("id")
      .ilike("nombre", `%${params.estado.trim()}%`)
      .limit(1);
    estadoId = data?.[0]?.id ? String(data[0].id) : null;
  }

  if (params.municipio?.trim()) {
    const { data } = await supabase
      .from("municipios")
      .select("id")
      .ilike("nombre", `%${params.municipio.trim()}%`)
      .limit(1);
    municipioId = data?.[0]?.id ? String(data[0].id) : null;
  }

  let categoriaIds: string[] | null = null;
  if (params.insumo?.trim()) {
    const { data } = await supabase
      .from("categorias_insumo")
      .select("id")
      .eq("activo", true)
      .ilike("nombre", `%${params.insumo.trim()}%`)
      .limit(10);
    categoriaIds = (data ?? []).map((row) => String(row.id));
    if (categoriaIds.length === 0) {
      return [];
    }
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
      fecha_inicio_recepcion,
      fecha_fin_recepcion,
      horario_recepcion,
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
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (estadoId) {
    query = query.eq("estado_id", estadoId);
  }
  if (municipioId) {
    query = query.eq("municipio_id", municipioId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error en busqueda rápida de centros:", error.message);
    return [];
  }

  const centros = (data ?? []).map((row) =>
    normalizeCentro(row as Record<string, unknown>),
  );

  return centros
    .filter((centro) => {
      const needs = centro.necesidades ?? [];
      if (needs.length === 0) return false;

      if (params.urgencia && !needs.some((n) => n.urgencia === params.urgencia)) {
        return false;
      }

      if (categoriaIds) {
        return needs.some(
          (n) => n.categoria_id && categoriaIds?.includes(String(n.categoria_id)),
        );
      }

      return true;
    })
    .slice(0, limit);
}
