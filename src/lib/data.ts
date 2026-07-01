import { hashManagementCode } from "@/lib/gestion-code";
import { filtrarAlertasActivas } from "@/lib/alertas";
import { isMissingRefugiosColumnError } from "@/lib/refugios-db-compat";
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
  DonationLink,
  Estado,
  HomeSearchFilters,
  HomeSearchMeta,
  ModeracionSearchFilters,
  ModeracionSearchMeta,
  ModeracionResumen,
  RefugiosModeracionResumen,
  RefugiosModeracionSearchFilters,
  Municipio,
  Necesidad,
  Refugio,
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
          direccion: centro.direccion ? String(centro.direccion) : null,
          contacto: centro.telefono_contacto ? String(centro.telefono_contacto) : null,
          ubicacion_url: centro.ubicacion_url ? String(centro.ubicacion_url) : null,
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
  filters?: { municipioId?: string; estadoId?: string; q?: string },
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

  if (filters?.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) {
      query = query.or(`nombre.ilike.%${term}%,direccion.ilike.%${term}%`);
    }
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
  const limit = 100;
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
            direccion,
            telefono_contacto,
            ubicacion_url,
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
        direccion,
        telefono_contacto,
        ubicacion_url,
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
      { count: "exact" },
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

  const { data, error, count } = await query
    .order("verificado", { ascending: true })
    .order("updated_at", { ascending: false })
    .range(from, from + pageSize);

  if (error) {
    console.error("Error cargando centros para moderación:", error.message);
    return {
      centros: [],
      meta: {
        page,
        pageSize,
        hasNextPage: false,
        hasPrevPage: page > 0,
        totalCount: null,
      },
    };
  }

  const rows = data ?? [];
  const hasNextPage = rows.length > pageSize;

  return {
    centros: rows
      .slice(0, pageSize)
      .map((row) => normalizeCentro(row as Record<string, unknown>)),
    meta: {
      page,
      pageSize,
      hasNextPage,
      hasPrevPage: page > 0,
      totalCount: count ?? null,
    },
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

function mapRowToRefugio(
  row: Record<string, unknown>,
  includeSaturado: boolean,
  includeResponsable: boolean,
): Refugio {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    direccion: row.direccion ? String(row.direccion) : null,
    referencia_lugar: row.referencia_lugar ? String(row.referencia_lugar) : null,
    zona: row.zona ? String(row.zona) : null,
    municipio: row.municipio ? String(row.municipio) : null,
    estado_id: row.estado_id != null ? Number(row.estado_id) : null,
    contacto_nombre: row.contacto_nombre ? String(row.contacto_nombre) : null,
    contacto_telefono: row.contacto_telefono ? String(row.contacto_telefono) : null,
    num_personas: row.num_personas != null ? Number(row.num_personas) : null,
    necesidades: row.necesidades ? String(row.necesidades) : null,
    confirmado: Boolean(row.confirmado),
    tiene_maps_link: Boolean(row.tiene_maps_link),
    google_maps_url: row.google_maps_url ? String(row.google_maps_url) : null,
    activo: Boolean(row.activo),
    saturado: includeSaturado ? Boolean(row.saturado) : false,
    codigo_gestion_hash: null,
    responsable_nombre:
      includeResponsable && row.responsable_nombre
        ? String(row.responsable_nombre)
        : null,
    responsable_telefono:
      includeResponsable && row.responsable_telefono
        ? String(row.responsable_telefono)
        : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

const REFUGIOS_MODERACION_SELECT_FULL =
  "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, saturado, responsable_nombre, responsable_telefono, created_at, updated_at";

const REFUGIOS_MODERACION_SELECT_LEGACY =
  "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, created_at, updated_at";

function applyRefugiosModeracionFilters<
  T extends {
    eq: (column: string, value: unknown) => T;
    or: (filters: string) => T;
  },
>(
  query: T,
  filters: RefugiosModeracionSearchFilters,
  searchTerm: string,
  options?: { includeSaturado?: boolean; includeResponsable?: boolean },
): T {
  let next = query;
  const includeSaturado = options?.includeSaturado ?? true;
  const includeResponsable = options?.includeResponsable ?? true;

  if (filters.actividad === "activos") {
    next = next.eq("activo", true);
  } else if (filters.actividad === "inactivos") {
    next = next.eq("activo", false);
  }

  if (filters.confirmacion === "pendientes") {
    next = next.eq("confirmado", false);
  } else if (filters.confirmacion === "confirmados") {
    next = next.eq("confirmado", true);
  }

  if (includeSaturado) {
    if (filters.saturacion === "saturados") {
      next = next.eq("saturado", true);
    } else if (filters.saturacion === "normal") {
      next = next.eq("saturado", false);
    }
  }

  if (filters.estadoId) {
    next = next.eq("estado_id", Number(filters.estadoId));
  }

  if (searchTerm) {
    const searchFields = [
      "nombre",
      "direccion",
      "municipio",
      "zona",
      "necesidades",
      "contacto_nombre",
      "contacto_telefono",
    ];
    if (includeResponsable) {
      searchFields.push("responsable_nombre", "responsable_telefono");
    }
    next = next.or(
      searchFields.map((field) => `${field}.ilike.%${searchTerm}%`).join(","),
    );
  }

  return next;
}

export async function getRefugiosParaModeracion(
  filters: RefugiosModeracionSearchFilters,
): Promise<{ refugios: Refugio[]; meta: ModeracionSearchMeta }> {
  const supabase = requireSupabaseServiceClient();
  const searchTerm = sanitizeSearchTerm(filters.q);
  const page = Math.max(0, filters.page);
  const pageSize = Math.min(Math.max(20, filters.pageSize), 100);
  const from = page * pageSize;
  const to = from + pageSize;

  let includeSaturado = true;
  let includeResponsable = true;

  let query = supabase
    .from("refugios")
    .select(REFUGIOS_MODERACION_SELECT_FULL, { count: "exact" })
    .order("confirmado", { ascending: true })
    .order("updated_at", { ascending: false })
    .range(from, from + pageSize);

  query = applyRefugiosModeracionFilters(query, filters, searchTerm, {
    includeSaturado,
    includeResponsable,
  });

  let { data, error, count } = await query;
  let rowsData: Record<string, unknown>[] | null = data as Record<string, unknown>[] | null;

  if (error && isMissingRefugiosColumnError(error)) {
    includeSaturado = false;
    includeResponsable = false;

    let legacyQuery = supabase
      .from("refugios")
      .select(REFUGIOS_MODERACION_SELECT_LEGACY, { count: "exact" })
      .order("confirmado", { ascending: true })
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize);

    legacyQuery = applyRefugiosModeracionFilters(
      legacyQuery,
      filters,
      searchTerm,
      { includeSaturado: false, includeResponsable: false },
    );

    const legacyResult = await legacyQuery;
    rowsData = legacyResult.data as Record<string, unknown>[] | null;
    error = legacyResult.error;
    count = legacyResult.count;
  }

  if (error) {
    console.error("Error cargando refugios para moderación:", error.message);
    return {
      refugios: [],
      meta: {
        page,
        pageSize,
        hasNextPage: false,
        hasPrevPage: page > 0,
        totalCount: null,
      },
    };
  }

  const rows = rowsData ?? [];
  const hasNextPage = rows.length > pageSize;
  let refugios = rows
    .slice(0, pageSize)
    .map((row) =>
      mapRowToRefugio(
        row as Record<string, unknown>,
        includeSaturado,
        includeResponsable,
      ),
    );

  if (!includeSaturado && filters.saturacion === "saturados") {
    refugios = [];
  }

  return {
    refugios,
    meta: {
      page,
      pageSize,
      hasNextPage,
      hasPrevPage: page > 0,
      totalCount: count ?? null,
    },
  };
}

export async function getResumenRefugiosModeracion(): Promise<RefugiosModeracionResumen> {
  const supabase = requireSupabaseServiceClient();

  let { data, error } = await supabase
    .from("refugios")
    .select("activo, confirmado, saturado");

  if (error && isMissingRefugiosColumnError(error)) {
    const legacy = await supabase
      .from("refugios")
      .select("activo, confirmado");
    data = legacy.data?.map((row) => ({ ...row, saturado: false })) ?? null;
    error = legacy.error;
  }

  if (error) {
    console.error("Error cargando resumen de refugios:", error.message);
    return {
      total: 0,
      activos: 0,
      inactivos: 0,
      pendientes: 0,
      confirmados: 0,
      saturados: 0,
    };
  }

  const refugios = data ?? [];

  return {
    total: refugios.length,
    activos: refugios.filter((refugio) => refugio.activo).length,
    inactivos: refugios.filter((refugio) => !refugio.activo).length,
    pendientes: refugios.filter((refugio) => !refugio.confirmado).length,
    confirmados: refugios.filter((refugio) => refugio.confirmado).length,
    saturados: refugios.filter((refugio) => Boolean(refugio.saturado)).length,
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

export async function getRefugioByManagementCode(
  code: string,
): Promise<{ refugio: Refugio; codigoHash: string } | null> {
  const supabase = requireSupabaseServiceClient();
  const codigoHash = hashManagementCode(code);

  let { data, error } = await supabase
    .from("refugios")
    .select(
      "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, saturado, codigo_gestion_hash, responsable_nombre, responsable_telefono, created_at, updated_at",
    )
    .eq("codigo_gestion_hash", codigoHash)
    .maybeSingle();
  let includeSaturado = true;

  if (error && isMissingRefugiosColumnError(error)) {
    includeSaturado = false;
    const legacyResult = await supabase
      .from("refugios")
      .select(
        "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, codigo_gestion_hash, created_at, updated_at",
      )
      .eq("codigo_gestion_hash", codigoHash)
      .maybeSingle();
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error || !data) {
    return null;
  }

  const refugio: Refugio = {
    id: String(data.id),
    nombre: String(data.nombre),
    direccion: data.direccion ? String(data.direccion) : null,
    referencia_lugar: data.referencia_lugar ? String(data.referencia_lugar) : null,
    zona: data.zona ? String(data.zona) : null,
    municipio: data.municipio ? String(data.municipio) : null,
    estado_id: data.estado_id != null ? Number(data.estado_id) : null,
    contacto_nombre: data.contacto_nombre ? String(data.contacto_nombre) : null,
    contacto_telefono: data.contacto_telefono ? String(data.contacto_telefono) : null,
    num_personas: data.num_personas != null ? Number(data.num_personas) : null,
    necesidades: data.necesidades ? String(data.necesidades) : null,
    confirmado: Boolean(data.confirmado),
    tiene_maps_link: Boolean(data.tiene_maps_link),
    google_maps_url: data.google_maps_url ? String(data.google_maps_url) : null,
    activo: Boolean(data.activo),
    saturado: includeSaturado ? Boolean(data.saturado) : false,
    codigo_gestion_hash: String(data.codigo_gestion_hash),
    responsable_nombre: data.responsable_nombre ? String(data.responsable_nombre) : null,
    responsable_telefono: data.responsable_telefono ? String(data.responsable_telefono) : null,
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  };

  return { refugio, codigoHash };
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

export async function getRefugioForManagement(
  refugioId: string,
  code: string,
): Promise<Refugio | null> {
  const supabase = requireSupabaseServiceClient();
  const codigoHash = hashManagementCode(code);

  let { data, error } = await supabase
    .from("refugios")
    .select(
      "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, saturado, codigo_gestion_hash, responsable_nombre, responsable_telefono, created_at, updated_at",
    )
    .eq("id", refugioId)
    .eq("codigo_gestion_hash", codigoHash)
    .maybeSingle();
  let includeSaturado = true;

  if (error && isMissingRefugiosColumnError(error)) {
    includeSaturado = false;
    const legacyResult = await supabase
      .from("refugios")
      .select(
        "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, codigo_gestion_hash, created_at, updated_at",
      )
      .eq("id", refugioId)
      .eq("codigo_gestion_hash", codigoHash)
      .maybeSingle();
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    nombre: String(data.nombre),
    direccion: data.direccion ? String(data.direccion) : null,
    referencia_lugar: data.referencia_lugar ? String(data.referencia_lugar) : null,
    zona: data.zona ? String(data.zona) : null,
    municipio: data.municipio ? String(data.municipio) : null,
    estado_id: data.estado_id != null ? Number(data.estado_id) : null,
    contacto_nombre: data.contacto_nombre ? String(data.contacto_nombre) : null,
    contacto_telefono: data.contacto_telefono ? String(data.contacto_telefono) : null,
    num_personas: data.num_personas != null ? Number(data.num_personas) : null,
    necesidades: data.necesidades ? String(data.necesidades) : null,
    confirmado: Boolean(data.confirmado),
    tiene_maps_link: Boolean(data.tiene_maps_link),
    google_maps_url: data.google_maps_url ? String(data.google_maps_url) : null,
    activo: Boolean(data.activo),
    saturado: includeSaturado ? Boolean(data.saturado) : false,
    codigo_gestion_hash: String(data.codigo_gestion_hash),
    responsable_nombre: data.responsable_nombre ? String(data.responsable_nombre) : null,
    responsable_telefono: data.responsable_telefono ? String(data.responsable_telefono) : null,
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  };
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

export async function getRefugios(
  filters?: { zona?: string; q?: string },
): Promise<Refugio[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabaseClient();
  if (!supabase) return [];
  const limit = 100;

  const mapRowToRefugio = (
    row: Record<string, unknown>,
    includeSaturado: boolean,
  ): Refugio => ({
    id: String(row.id),
    nombre: String(row.nombre),
    direccion: row.direccion ? String(row.direccion) : null,
    referencia_lugar: row.referencia_lugar ? String(row.referencia_lugar) : null,
    zona: row.zona ? String(row.zona) : null,
    municipio: row.municipio ? String(row.municipio) : null,
    estado_id: row.estado_id != null ? Number(row.estado_id) : null,
    contacto_nombre: row.contacto_nombre ? String(row.contacto_nombre) : null,
    contacto_telefono: row.contacto_telefono ? String(row.contacto_telefono) : null,
    num_personas: row.num_personas != null ? Number(row.num_personas) : null,
    necesidades: row.necesidades ? String(row.necesidades) : null,
    confirmado: Boolean(row.confirmado),
    tiene_maps_link: Boolean(row.tiene_maps_link),
    google_maps_url: row.google_maps_url ? String(row.google_maps_url) : null,
    activo: Boolean(row.activo),
    saturado: includeSaturado ? Boolean(row.saturado) : false,
    codigo_gestion_hash: null,
    responsable_nombre: row.responsable_nombre ? String(row.responsable_nombre) : null,
    responsable_telefono: row.responsable_telefono
      ? String(row.responsable_telefono)
      : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  });

  let query = supabase
    .from("refugios")
    .select(
      "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, saturado, responsable_nombre, responsable_telefono, created_at, updated_at",
    )
    .eq("activo", true)
    .limit(limit)
    .order("updated_at", { ascending: false });

  if (filters?.zona) {
    query = query.eq("zona", filters.zona);
  }

  if (filters?.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) {
      query = query.or(
        `nombre.ilike.%${term}%,direccion.ilike.%${term}%,municipio.ilike.%${term}%,zona.ilike.%${term}%,necesidades.ilike.%${term}%`,
      );
    }
  }

  let { data, error } = await query;
  let includeSaturado = true;

  if (error && isMissingRefugiosColumnError(error)) {
    includeSaturado = false;
    let legacyQuery = supabase
      .from("refugios")
      .select(
        "id, nombre, direccion, referencia_lugar, zona, municipio, estado_id, contacto_nombre, contacto_telefono, num_personas, necesidades, confirmado, tiene_maps_link, google_maps_url, activo, created_at, updated_at",
      )
      .eq("activo", true)
      .limit(limit)
      .order("updated_at", { ascending: false });

    if (filters?.zona) {
      legacyQuery = legacyQuery.eq("zona", filters.zona);
    }

    if (filters?.q) {
      const term = sanitizeSearchTerm(filters.q);
      if (term) {
        legacyQuery = legacyQuery.or(
          `nombre.ilike.%${term}%,direccion.ilike.%${term}%,municipio.ilike.%${term}%,zona.ilike.%${term}%,necesidades.ilike.%${term}%`,
        );
      }
    }

    const legacyResult = await legacyQuery;
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error) {
    console.error("Error cargando refugios:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapRowToRefugio(row as Record<string, unknown>, includeSaturado),
  );
}

export function formatRefugioPlainText(refugio: Refugio): string {
  return [
    `REFUGIO: ${refugio.nombre}`,
    `Zona: ${refugio.zona || "Sin zona"}`,
    refugio.municipio ? `Municipio: ${refugio.municipio}` : null,
    `Dirección: ${refugio.direccion || refugio.referencia_lugar || "Sin dirección específica"}`,
    refugio.contacto_nombre ? `Contacto: ${refugio.contacto_nombre}` : null,
    refugio.contacto_telefono ? `Teléfono/WhatsApp: ${refugio.contacto_telefono}` : null,
    refugio.google_maps_url ? `Ubicación: ${refugio.google_maps_url}` : null,
    refugio.num_personas != null ? `Personas alojadas: ${refugio.num_personas}` : null,
    `Confirmado: ${refugio.confirmado ? "Sí" : "Pendiente"}`,
    `Activo: ${refugio.activo ? "Sí" : "No"}`,
    `Saturado: ${refugio.saturado ? "Sí" : "No"}`,
    "NECESIDADES:",
    refugio.necesidades ? `- ${refugio.necesidades}` : "- Sin necesidades específicas reportadas.",
    `Actualizado: ${new Date(refugio.updated_at).toLocaleString("es-VE")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function getDonationLinksActivas(): Promise<DonationLink[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("donation_links")
    .select("id, title, description, url, whatsapp_phone, image_url, country, category, is_active, created_at, updated_at")
    .eq("is_active", true)
    .eq("category", "money")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando donation links:", error.message);
    return [];
  }

  return (data ?? []).map((row): DonationLink => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    url: row.url ? String(row.url) : null,
    whatsapp_phone: row.whatsapp_phone ? String(row.whatsapp_phone) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    country: row.country ? String(row.country) : null,
    category: row.category === "psychological" ? "psychological" : "money",
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }));
}
