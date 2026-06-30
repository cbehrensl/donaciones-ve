import { CATEGORIA_PRODUCTOR_LABELS, familiaDeNecesidadCocina } from "@/lib/categorias-alimentacion";
import { hashManagementCode } from "@/lib/gestion-code";
import {
  createSupabaseClient,
  createSupabaseServiceClient,
  requireSupabaseServiceClient,
} from "@/lib/supabase";
import type {
  CategoriaProductor,
  CocinaComuniaria,
  CocinaComuniariaPrivada,
  Municipio,
  NecesidadCocina,
  Productor,
  ProductorPrivado,
  Urgencia,
} from "@/lib/types";

function mapUrgenciaFromDb(value: unknown): Urgencia {
  if (value === "URGENTE") return "URGENTE";
  if (value === "SATURADO") return "SATURADO";
  return "MEDIA";
}

function normalizeMunicipio(raw: unknown): Municipio | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  return {
    id: String(m.id ?? ""),
    nombre: String(m.nombre ?? ""),
    estado_id: String(m.estado_id ?? ""),
  };
}

function normalizeProductor(raw: Record<string, unknown>): Productor {
  const municipioRaw = raw.municipios;
  const municipio = Array.isArray(municipioRaw)
    ? normalizeMunicipio(municipioRaw[0])
    : normalizeMunicipio(municipioRaw);

  const categorias = Array.isArray(raw.categorias)
    ? (raw.categorias as CategoriaProductor[])
    : [];

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    descripcion: raw.descripcion ? String(raw.descripcion) : null,
    contacto: raw.contacto ? String(raw.contacto) : null,
    ubicacion_url: raw.ubicacion_url ? String(raw.ubicacion_url) : null,
    estado_id: raw.estado_id ? String(raw.estado_id) : null,
    municipio_id: String(raw.municipio_id ?? ""),
    categorias,
    verificado: Boolean(raw.verificado),
    activo: Boolean(raw.activo),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
    municipios: municipio,
  };
}

function normalizeNecesidadCocina(raw: Record<string, unknown>): NecesidadCocina {
  return {
    id: String(raw.id),
    cocina_id: String(raw.cocina_id),
    categoria: String(raw.categoria ?? ""),
    urgencia: mapUrgenciaFromDb(raw.urgencia),
    detalle: raw.detalle ? String(raw.detalle) : null,
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
}

function normalizeCocina(raw: Record<string, unknown>): CocinaComuniaria {
  const municipioRaw = raw.municipios;
  const municipio = Array.isArray(municipioRaw)
    ? normalizeMunicipio(municipioRaw[0])
    : normalizeMunicipio(municipioRaw);

  const necesidadesRaw = Array.isArray(raw.necesidades_cocina)
    ? (raw.necesidades_cocina as Record<string, unknown>[])
    : [];

  return {
    id: String(raw.id),
    nombre: String(raw.nombre),
    descripcion: raw.descripcion ? String(raw.descripcion) : null,
    contacto: raw.contacto ? String(raw.contacto) : null,
    direccion: String(raw.direccion ?? ""),
    ubicacion_url: raw.ubicacion_url ? String(raw.ubicacion_url) : null,
    estado_id: raw.estado_id ? String(raw.estado_id) : null,
    municipio_id: String(raw.municipio_id ?? ""),
    horario: raw.horario ? String(raw.horario) : null,
    capacidad_beneficiarios: raw.capacidad_beneficiarios
      ? Number(raw.capacidad_beneficiarios)
      : null,
    verificado: Boolean(raw.verificado),
    activo: Boolean(raw.activo),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
    municipios: municipio,
    necesidades_cocina: necesidadesRaw
      .filter((n) => n.activo !== false)
      .map(normalizeNecesidadCocina),
  };
}

// ============================================================
// PRODUCTORES — Queries públicas
// ============================================================

export interface ProductoresFilters {
  estadoId?: string;
  municipioId?: string;
  q?: string;
}

export async function getProductores(
  filters: ProductoresFilters = {},
): Promise<Productor[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("productores")
    .select(
      `id, nombre, descripcion, contacto, ubicacion_url, estado_id, municipio_id,
       categorias, verificado, activo, updated_at,
       municipios(id, nombre, estado_id)`,
    )
    .eq("verificado", true)
    .eq("activo", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (filters.estadoId) {
    query = query.eq("estado_id", filters.estadoId);
  }
  if (filters.municipioId) {
    query = query.eq("municipio_id", filters.municipioId);
  }
  if (filters.q) {
    query = query.ilike("nombre", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error cargando productores:", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map(normalizeProductor);
}

// ============================================================
// PRODUCTORES — Queries de moderación (service role)
// ============================================================

export interface ProductoresModeracionFilters {
  q?: string;
  verificacion?: string;
  page?: number;
  pageSize?: number;
}

export async function getProductoresParaModeracion(
  filters: ProductoresModeracionFilters = {},
): Promise<{ productores: Productor[]; total: number }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { productores: [], total: 0 };

  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 50;

  let query = supabase
    .from("productores")
    .select(
      `id, nombre, descripcion, contacto, ubicacion_url, estado_id, municipio_id,
       categorias, verificado, activo, updated_at,
       municipios(id, nombre, estado_id)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters.q) {
    query = query.ilike("nombre", `%${filters.q}%`);
  }
  if (filters.verificacion === "pendientes") {
    query = query.eq("verificado", false).eq("activo", true);
  } else if (filters.verificacion === "verificados") {
    query = query.eq("verificado", true);
  }

  const { data, error, count } = await query;
  if (error || !data) {
    console.error("Error cargando productores para moderación:", error?.message);
    return { productores: [], total: 0 };
  }

  return {
    productores: (data as Record<string, unknown>[]).map(normalizeProductor),
    total: count ?? 0,
  };
}

export async function getProductorForManagement(
  productorId: string,
  codigo: string,
): Promise<ProductorPrivado | null> {
  const supabase = requireSupabaseServiceClient();
  const hash = hashManagementCode(codigo);

  const { data, error } = await supabase
    .from("productores")
    .select(
      `id, nombre, descripcion, contacto, ubicacion_url, estado_id, municipio_id,
       categorias, verificado, activo, updated_at,
       responsable_nombre, responsable_telefono,
       municipios(id, nombre, estado_id)`,
    )
    .eq("id", productorId)
    .eq("codigo_gestion_hash", hash)
    .maybeSingle();

  if (error || !data) return null;

  const base = normalizeProductor(data as Record<string, unknown>);
  return {
    ...base,
    responsable_nombre: String((data as Record<string, unknown>).responsable_nombre ?? ""),
    responsable_telefono: String((data as Record<string, unknown>).responsable_telefono ?? ""),
  };
}

// ============================================================
// COCINAS — Queries públicas
// ============================================================

export interface CocinasFilters {
  estadoId?: string;
  municipioId?: string;
  q?: string;
}

export async function getCocinas(
  filters: CocinasFilters = {},
): Promise<CocinaComuniaria[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("cocinas_comunitarias")
    .select(
      `id, nombre, descripcion, contacto, direccion, ubicacion_url, estado_id, municipio_id,
       horario, capacidad_beneficiarios, verificado, activo, updated_at,
       municipios(id, nombre, estado_id),
       necesidades_cocina(id, cocina_id, categoria, urgencia, detalle, activo, updated_at)`,
    )
    .eq("verificado", true)
    .eq("activo", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (filters.estadoId) {
    query = query.eq("estado_id", filters.estadoId);
  }
  if (filters.municipioId) {
    query = query.eq("municipio_id", filters.municipioId);
  }
  if (filters.q) {
    query = query.ilike("nombre", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error cargando cocinas:", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map(normalizeCocina);
}

// ============================================================
// COCINAS — Queries de moderación (service role)
// ============================================================

export interface CocinasModeracionFilters {
  q?: string;
  verificacion?: string;
  page?: number;
  pageSize?: number;
}

export async function getCocinasParaModeracion(
  filters: CocinasModeracionFilters = {},
): Promise<{ cocinas: CocinaComuniaria[]; total: number }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { cocinas: [], total: 0 };

  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 50;

  let query = supabase
    .from("cocinas_comunitarias")
    .select(
      `id, nombre, descripcion, contacto, direccion, ubicacion_url, estado_id, municipio_id,
       horario, capacidad_beneficiarios, verificado, activo, updated_at,
       responsable_nombre, responsable_telefono,
       municipios(id, nombre, estado_id),
       necesidades_cocina(id, cocina_id, categoria, urgencia, detalle, activo, updated_at)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters.q) {
    query = query.ilike("nombre", `%${filters.q}%`);
  }
  if (filters.verificacion === "pendientes") {
    query = query.eq("verificado", false).eq("activo", true);
  } else if (filters.verificacion === "verificados") {
    query = query.eq("verificado", true);
  }

  const { data, error, count } = await query;
  if (error || !data) {
    console.error("Error cargando cocinas para moderación:", error?.message);
    return { cocinas: [], total: 0 };
  }

  return {
    cocinas: (data as Record<string, unknown>[]).map((row) => {
      const cocina = normalizeCocina(row);
      return {
        ...cocina,
        responsable_nombre: String(row.responsable_nombre ?? ""),
        responsable_telefono: String(row.responsable_telefono ?? ""),
      } as CocinaComuniariaPrivada;
    }),
    total: count ?? 0,
  };
}

export async function getCocinaForManagement(
  cocinaId: string,
  codigo: string,
): Promise<CocinaComuniariaPrivada | null> {
  const supabase = requireSupabaseServiceClient();
  const hash = hashManagementCode(codigo);

  const { data, error } = await supabase
    .from("cocinas_comunitarias")
    .select(
      `id, nombre, descripcion, contacto, direccion, ubicacion_url, estado_id, municipio_id,
       horario, capacidad_beneficiarios, verificado, activo, updated_at,
       responsable_nombre, responsable_telefono,
       municipios(id, nombre, estado_id),
       necesidades_cocina(id, cocina_id, categoria, urgencia, detalle, activo, updated_at)`,
    )
    .eq("id", cocinaId)
    .eq("codigo_gestion_hash", hash)
    .maybeSingle();

  if (error || !data) return null;

  const base = normalizeCocina(data as Record<string, unknown>);
  const raw = data as Record<string, unknown>;
  return {
    ...base,
    responsable_nombre: String(raw.responsable_nombre ?? ""),
    responsable_telefono: String(raw.responsable_telefono ?? ""),
  };
}

// ============================================================
// Resolución por código de gestión
// ============================================================

export async function getProductorByManagementCode(
  code: string,
): Promise<{ productor: ProductorPrivado; codigo: string } | null> {
  const supabase = requireSupabaseServiceClient();
  const hash = hashManagementCode(code);

  const { data, error } = await supabase
    .from("productores")
    .select(
      `id, nombre, descripcion, contacto, ubicacion_url, estado_id, municipio_id,
       categorias, verificado, activo, updated_at,
       responsable_nombre, responsable_telefono,
       municipios(id, nombre, estado_id)`,
    )
    .eq("codigo_gestion_hash", hash)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) return null;

  const base = normalizeProductor(data as Record<string, unknown>);
  const raw = data as Record<string, unknown>;
  return {
    productor: {
      ...base,
      responsable_nombre: String(raw.responsable_nombre ?? ""),
      responsable_telefono: String(raw.responsable_telefono ?? ""),
    },
    codigo: code.trim(),
  };
}

export async function getCocinaByManagementCode(
  code: string,
): Promise<{ cocina: CocinaComuniariaPrivada; codigo: string } | null> {
  const supabase = requireSupabaseServiceClient();
  const hash = hashManagementCode(code);

  const { data, error } = await supabase
    .from("cocinas_comunitarias")
    .select(
      `id, nombre, descripcion, contacto, direccion, ubicacion_url, estado_id, municipio_id,
       horario, capacidad_beneficiarios, verificado, activo, updated_at,
       responsable_nombre, responsable_telefono,
       municipios(id, nombre, estado_id),
       necesidades_cocina(id, cocina_id, categoria, urgencia, detalle, activo, updated_at)`,
    )
    .eq("codigo_gestion_hash", hash)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) return null;

  const base = normalizeCocina(data as Record<string, unknown>);
  const raw = data as Record<string, unknown>;
  return {
    cocina: {
      ...base,
      responsable_nombre: String(raw.responsable_nombre ?? ""),
      responsable_telefono: String(raw.responsable_telefono ?? ""),
    },
    codigo: code.trim(),
  };
}

/** Cocinas verificadas con al menos una necesidad activa (para vista de demanda). */
export async function getCocinasConDemanda(
  filters: CocinasFilters & { categoriaFamilia?: CategoriaProductor } = {},
): Promise<CocinaComuniaria[]> {
  const { categoriaFamilia, ...cocinaFilters } = filters;
  const cocinas = await getCocinas(cocinaFilters);
  let result = cocinas.filter((c) => (c.necesidades_cocina ?? []).length > 0);

  if (categoriaFamilia) {
    result = result.filter((c) =>
      (c.necesidades_cocina ?? []).some(
        (n) => familiaDeNecesidadCocina(n.categoria) === categoriaFamilia,
      ),
    );
  }

  return result;
}

export function formatProductorPlainText(productor: Productor): string {
  const municipio = productor.municipios?.nombre ?? "Sin municipio";
  const categorias = productor.categorias
    .map((c) => CATEGORIA_PRODUCTOR_LABELS[c] ?? c)
    .join(", ");

  return [
    `PRODUCTOR: ${productor.nombre}`,
    `Municipio: ${municipio}`,
    productor.descripcion ? `Descripción: ${productor.descripcion}` : null,
    productor.contacto ? `Contacto: ${productor.contacto}` : null,
    productor.ubicacion_url ? `Ubicación: ${productor.ubicacion_url}` : null,
    categorias ? `Puede aportar: ${categorias}` : null,
    `Verificado: ${productor.verificado ? "Sí" : "Pendiente"}`,
    `Actualizado: ${new Date(productor.updated_at).toLocaleString("es-VE")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatCocinaPlainText(cocina: CocinaComuniaria): string {
  const municipio = cocina.municipios?.nombre ?? "Sin municipio";
  const necesidades = cocina.necesidades_cocina ?? [];
  const lineasNecesidades =
    necesidades.length > 0
      ? necesidades
          .map(
            (n) =>
              `- ${n.categoria} (${n.urgencia})${n.detalle ? `: ${n.detalle}` : ""}`,
          )
          .join("\n")
      : "- Sin ingredientes reportados aún.";

  return [
    `COCINA: ${cocina.nombre}`,
    `Municipio: ${municipio}`,
    `Dirección: ${cocina.direccion}`,
    cocina.contacto ? `Contacto: ${cocina.contacto}` : null,
    cocina.horario ? `Horario: ${cocina.horario}` : null,
    cocina.capacidad_beneficiarios
      ? `Beneficiarios/día: ~${cocina.capacidad_beneficiarios}`
      : null,
    cocina.ubicacion_url ? `Ubicación: ${cocina.ubicacion_url}` : null,
    `Verificado: ${cocina.verificado ? "Sí" : "Pendiente"}`,
    "NECESITA:",
    lineasNecesidades,
    `Actualizado: ${new Date(cocina.updated_at).toLocaleString("es-VE")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
